import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, getUserSession } from "@/lib/api-helpers";
import { logger } from "@/lib/logger";
import { Decimal } from "@prisma/client/runtime/library";

// GET /api/catalogo - Listar produtos com preços calculados para o cliente
export async function GET(request: NextRequest) {
    try {
        const user = await getUserSession();
        const { searchParams } = new URL(request.url);

        const parsedPage = parseInt(searchParams.get("page") || "1");
        const parsedLimit = parseInt(searchParams.get("limit") || "20");
        const page = isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;
        const limit = isNaN(parsedLimit) || parsedLimit < 1 ? 20 : Math.min(parsedLimit, 100);
        const skip = (page - 1) * limit;
        const search = searchParams.get("search") || undefined;
        const fornecedorId = searchParams.get("fornecedorId") || undefined;
        const categoriaId = searchParams.get("categoriaId") || undefined;

        // Construir filtros
        const where: any = {
            ativo: true,
        };

        if (fornecedorId) {
            where.fornecedorId = fornecedorId;
        }

        if (categoriaId) {
            where.categoriaId = categoriaId;
        }

        if (search) {
            where.OR = [
                { nome: { contains: search, mode: "insensitive" } },
                { descricao: { contains: search, mode: "insensitive" } },
                { sku: { contains: search, mode: "insensitive" } },
            ];
        }

        // Buscar produtos
        const [produtos, total] = await Promise.all([
            prisma.produto.findMany({
                where,
                skip,
                take: limit,
                orderBy: { criadoEm: "desc" },
                include: {
                    fornecedor: {
                        select: {
                            id: true,
                            slug: true,
                            nomeFantasia: true,
                            razaoSocial: true,
                        },
                    },
                    categoria: {
                        select: {
                            id: true,
                            nome: true,
                            slug: true,
                        },
                    },
                },
            }),
            prisma.produto.count({ where }),
        ]);

        // Se usuário é cliente, calcular preços personalizados
        let clienteId: string | null = null;
        let precosCustomizados: Map<string, Decimal> = new Map();
        let listasPreco: Map<string, { tipoDesconto: string; valorDesconto: Decimal; itens: Map<string, Decimal | null> }> = new Map();

        if (user?.tipo === "cliente" && user.clienteId) {
            clienteId = user.clienteId;

            // Buscar preços customizados do cliente
            const precos = await prisma.precoCustomizado.findMany({
                where: {
                    clienteId,
                    produtoId: { in: produtos.map(p => p.id) },
                },
                select: {
                    produtoId: true,
                    preco: true,
                },
            });

            precos.forEach(p => {
                precosCustomizados.set(p.produtoId, p.preco);
            });

            // Buscar listas de preço do cliente para cada fornecedor
            const fornecedorIds = [...new Set(produtos.map(p => p.fornecedorId))];
            const clienteFornecedores = await prisma.clienteFornecedor.findMany({
                where: {
                    clienteId,
                    fornecedorId: { in: fornecedorIds },
                    listaPrecoId: { not: null },
                },
                include: {
                    listaPreco: {
                        include: {
                            itens: {
                                where: {
                                    produtoId: { in: produtos.map(p => p.id) },
                                },
                                select: {
                                    produtoId: true,
                                    precoEspecial: true,
                                },
                            },
                        },
                    },
                },
            });

            clienteFornecedores.forEach(cf => {
                if (cf.listaPreco && cf.listaPreco.ativo) {
                    const itensMap = new Map<string, Decimal | null>();
                    cf.listaPreco.itens.forEach(item => {
                        itensMap.set(item.produtoId, item.precoEspecial);
                    });

                    listasPreco.set(cf.fornecedorId, {
                        tipoDesconto: cf.listaPreco.tipoDesconto,
                        valorDesconto: cf.listaPreco.valorDesconto,
                        itens: itensMap,
                    });
                }
            });
        }

        // Calcular preços finais
        const produtosComPrecos = produtos.map(produto => {
            const precoBase = produto.precoBase;
            let precoFinal = precoBase;
            let tipoPreco: "base" | "customizado" | "lista" = "base";

            if (clienteId) {
                // Prioridade 1: Preço customizado
                const precoCustomizado = precosCustomizados.get(produto.id);
                if (precoCustomizado) {
                    precoFinal = precoCustomizado;
                    tipoPreco = "customizado";
                } else {
                    // Prioridade 2: Lista de preço do fornecedor
                    const lista = listasPreco.get(produto.fornecedorId);
                    if (lista) {
                        // Verificar se produto tem preço especial na lista
                        const precoEspecial = lista.itens.get(produto.id);
                        if (precoEspecial !== undefined) {
                            if (precoEspecial !== null) {
                                precoFinal = precoEspecial;
                                tipoPreco = "lista";
                            } else {
                                // Aplicar desconto geral da lista
                                if (lista.tipoDesconto === "percentual") {
                                    const desconto = Number(lista.valorDesconto) / 100;
                                    precoFinal = new Decimal(Number(precoBase) * (1 - desconto));
                                } else {
                                    precoFinal = new Decimal(Math.max(0, Number(precoBase) - Number(lista.valorDesconto)));
                                }
                                tipoPreco = "lista";
                            }
                        }
                    }
                }
            }

            return {
                id: produto.id,
                nome: produto.nome,
                slug: produto.slug,
                sku: produto.sku,
                descricao: produto.descricao,
                imagens: produto.imagens,
                quantidadeEstoque: produto.quantidadeEstoque,
                precoBase: precoBase.toString(),
                precoFinal: precoFinal.toString(),
                tipoPreco,
                fornecedor: produto.fornecedor,
                categoria: produto.categoria,
            };
        });

        return successResponse({
            produtos: produtosComPrecos,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        if (error instanceof Error) {
            return errorResponse(error.message, 400);
        }

        logger.error("Erro ao listar catálogo", error);
        return errorResponse("Erro ao listar catálogo", 500);
    }
}
