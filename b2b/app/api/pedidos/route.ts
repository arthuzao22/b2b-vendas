import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, handleZodError, requireCliente, requireAuth } from "@/lib/api-helpers";
import { logger } from "@/lib/logger";
import { generateOrderNumber } from "@/lib/utils";
import { Decimal } from "@prisma/client/runtime/library";
import { TipoUsuario, StatusPedido } from "@prisma/client";

const createPedidoSchema = z.object({
  fornecedorId: z.string().min(1, "Fornecedor é obrigatório"),
  items: z.array(z.object({
    produtoId: z.string().min(1, "Produto é obrigatório"),
    quantidade: z.number().int().min(1, "Quantidade deve ser maior que 0"),
  })).min(1, "Pedido deve ter ao menos 1 item"),
  enderecoEntrega: z.string().optional(),
  cidadeEntrega: z.string().optional(),
  estadoEntrega: z.string().optional(),
  cepEntrega: z.string().optional(),
  observacoes: z.string().optional(),
});

// POST /api/pedidos - Criar pedido (cliente only)
export async function POST(request: NextRequest) {
  try {
    const { clienteId, user } = await requireCliente();

    const body = await request.json();
    const validatedData = createPedidoSchema.parse(body);

    const { fornecedorId, items, enderecoEntrega, cidadeEntrega, estadoEntrega, cepEntrega, observacoes } = validatedData;

    // Verificar se fornecedor existe
    const fornecedor = await prisma.fornecedor.findUnique({
      where: { id: fornecedorId },
    });

    if (!fornecedor) {
      return errorResponse("Fornecedor não encontrado", 404);
    }

    // Buscar produtos
    const produtoIds = items.map(item => item.produtoId);
    const produtos = await prisma.produto.findMany({
      where: {
        id: { in: produtoIds },
        fornecedorId,
        ativo: true,
      },
    });

    if (produtos.length !== items.length) {
      return errorResponse("Um ou mais produtos não foram encontrados", 404);
    }

    // Verificar disponibilidade de estoque
    const itemsWithoutStock = items.filter(item => {
      const produto = produtos.find(p => p.id === item.produtoId);
      return produto && produto.quantidadeEstoque < item.quantidade;
    });

    if (itemsWithoutStock.length > 0) {
      const produtosIndisponiveis = itemsWithoutStock.map(item => {
        const produto = produtos.find(p => p.id === item.produtoId);
        return {
          produtoId: item.produtoId,
          nome: produto?.nome,
          disponiveis: produto?.quantidadeEstoque,
          solicitados: item.quantidade,
        };
      });

      return errorResponse("Estoque insuficiente para alguns produtos", 400, {
        produtosIndisponiveis,
      });
    }

    // Buscar lista de preço do cliente
    const clienteFornecedor = await prisma.clienteFornecedor.findUnique({
      where: {
        clienteId_fornecedorId: {
          clienteId,
          fornecedorId,
        },
      },
      include: {
        listaPreco: true,
      },
    });

    // Buscar preços customizados
    const precosCustomizados = await prisma.precoCustomizado.findMany({
      where: {
        clienteId,
        produtoId: { in: produtoIds },
      },
    });

    // Buscar itens da lista de preço
    const itensListaPreco = clienteFornecedor?.listaPrecoId
      ? await prisma.itemListaPreco.findMany({
          where: {
            listaPrecoId: clienteFornecedor.listaPrecoId,
            produtoId: { in: produtoIds },
          },
        })
      : [];

    // Calcular preço para cada item
    const itemsComPreco = items.map(item => {
      const produto = produtos.find(p => p.id === item.produtoId)!;
      
      let precoUnitario = produto.precoBase;

      // Verificar preço customizado
      const precoCustomizado = precosCustomizados.find(pc => pc.produtoId === item.produtoId);
      if (precoCustomizado) {
        precoUnitario = precoCustomizado.preco;
      } else {
        // Verificar item da lista de preço (preço especial)
        const itemLista = itensListaPreco.find(ilp => ilp.produtoId === item.produtoId);
        if (itemLista?.precoEspecial) {
          precoUnitario = itemLista.precoEspecial;
        } else if (clienteFornecedor?.listaPreco && clienteFornecedor.listaPreco.ativo) {
          // Aplicar desconto da lista de preço
          const lista = clienteFornecedor.listaPreco;
          if (lista.tipoDesconto === "percentual") {
            const desconto = produto.precoBase.mul(lista.valorDesconto).div(100);
            precoUnitario = produto.precoBase.sub(desconto);
          } else {
            precoUnitario = produto.precoBase.sub(lista.valorDesconto);
          }
          
          if (precoUnitario.lessThan(0)) {
            precoUnitario = new Decimal(0);
          }
        }
      }

      const precoTotal = precoUnitario.mul(item.quantidade);

      return {
        produtoId: item.produtoId,
        quantidade: item.quantidade,
        precoUnitario,
        precoTotal,
      };
    });

    // Calcular totais
    const subtotal = itemsComPreco.reduce(
      (acc, item) => acc.add(item.precoTotal),
      new Decimal(0)
    );
    const desconto = new Decimal(0);
    const frete = new Decimal(0);
    const total = subtotal.sub(desconto).add(frete);

    // Criar pedido em transação
    const pedido = await prisma.$transaction(async (tx) => {
      // Gerar número do pedido
      const numeroPedido = generateOrderNumber();

      // Criar pedido
      const novoPedido = await tx.pedido.create({
        data: {
          numeroPedido,
          clienteId,
          fornecedorId,
          status: StatusPedido.pendente,
          subtotal,
          desconto,
          frete,
          total,
          enderecoEntrega,
          cidadeEntrega,
          estadoEntrega,
          cepEntrega,
          observacoes,
          itens: {
            create: itemsComPreco.map(item => ({
              produtoId: item.produtoId,
              quantidade: item.quantidade,
              precoUnitario: item.precoUnitario,
              precoTotal: item.precoTotal,
            })),
          },
        },
        include: {
          itens: {
            include: {
              produto: true,
            },
          },
          cliente: {
            include: {
              usuario: {
                select: {
                  nome: true,
                  email: true,
                },
              },
            },
          },
          fornecedor: {
            select: {
              id: true,
              nomeFantasia: true,
              razaoSocial: true,
            },
          },
        },
      });

      // Decrementar estoque e criar movimentações
      for (const item of itemsComPreco) {
        const produto = produtos.find(p => p.id === item.produtoId)!;
        const estoqueAnterior = produto.quantidadeEstoque;
        const estoqueAtual = estoqueAnterior - item.quantidade;

        await tx.produto.update({
          where: { id: item.produtoId },
          data: {
            quantidadeEstoque: estoqueAtual,
          },
        });

        await tx.movimentacaoEstoque.create({
          data: {
            produtoId: item.produtoId,
            tipo: "saida",
            quantidade: item.quantidade,
            estoqueAnterior,
            estoqueAtual,
            motivo: "Venda - Pedido criado",
            referencia: numeroPedido,
            criadoPor: user.id,
          },
        });
      }

      // Criar histórico de status
      await tx.historicoStatusPedido.create({
        data: {
          pedidoId: novoPedido.id,
          status: StatusPedido.pendente,
          observacao: "Pedido criado",
          criadoPor: user.id,
        },
      });

      return novoPedido;
    });

    logger.info("Pedido criado", {
      pedidoId: pedido.id,
      numeroPedido: pedido.numeroPedido,
      clienteId,
      fornecedorId,
      total: pedido.total.toString(),
    });

    // Converter Decimals para string
    const pedidoResponse = {
      ...pedido,
      subtotal: pedido.subtotal.toString(),
      desconto: pedido.desconto.toString(),
      frete: pedido.frete.toString(),
      total: pedido.total.toString(),
      itens: pedido.itens.map(item => ({
        ...item,
        precoUnitario: item.precoUnitario.toString(),
        precoTotal: item.precoTotal.toString(),
        produto: {
          ...item.produto,
          precoBase: item.produto.precoBase.toString(),
          peso: item.produto.peso?.toString(),
        },
      })),
    };

    return successResponse(pedidoResponse, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return handleZodError(error);
    }

    if (error instanceof Error) {
      return errorResponse(error.message, 400);
    }

    logger.error("Erro ao criar pedido", error);
    return errorResponse("Erro ao criar pedido", 500);
  }
}

// GET /api/pedidos - Listar pedidos (role-based)
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const skip = (page - 1) * limit;

    const status = searchParams.get("status") as StatusPedido | null;
    const fornecedorId = searchParams.get("fornecedorId") || undefined;
    const clienteId = searchParams.get("clienteId") || undefined;

    // Construir filtros baseados no tipo de usuário
    const where: any = {};

    if (user.tipo === TipoUsuario.cliente) {
      // Cliente: apenas seus pedidos
      if (!user.clienteId) {
        return errorResponse("Cliente não encontrado", 404);
      }
      where.clienteId = user.clienteId;
    } else if (user.tipo === TipoUsuario.fornecedor) {
      // Fornecedor: apenas pedidos de seus produtos
      if (!user.fornecedorId) {
        return errorResponse("Fornecedor não encontrado", 404);
      }
      where.fornecedorId = user.fornecedorId;
    } else if (user.tipo === TipoUsuario.admin) {
      // Admin: todos os pedidos, com filtros opcionais
      if (fornecedorId) {
        where.fornecedorId = fornecedorId;
      }
      if (clienteId) {
        where.clienteId = clienteId;
      }
    }

    if (status) {
      where.status = status;
    }

    const [pedidos, total] = await Promise.all([
      prisma.pedido.findMany({
        where,
        skip,
        take: limit,
        orderBy: { criadoEm: "desc" },
        include: {
          cliente: {
            include: {
              usuario: {
                select: {
                  nome: true,
                  email: true,
                },
              },
            },
          },
          fornecedor: {
            select: {
              id: true,
              nomeFantasia: true,
              razaoSocial: true,
            },
          },
          itens: {
            include: {
              produto: {
                select: {
                  id: true,
                  nome: true,
                  sku: true,
                  imagens: true,
                },
              },
            },
          },
        },
      }),
      prisma.pedido.count({ where }),
    ]);

    // Converter Decimals para string
    const pedidosResponse = pedidos.map(pedido => ({
      ...pedido,
      subtotal: pedido.subtotal.toString(),
      desconto: pedido.desconto.toString(),
      frete: pedido.frete.toString(),
      total: pedido.total.toString(),
      itens: pedido.itens.map(item => ({
        ...item,
        precoUnitario: item.precoUnitario.toString(),
        precoTotal: item.precoTotal.toString(),
      })),
    }));

    return successResponse({
      pedidos: pedidosResponse,
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

    logger.error("Erro ao listar pedidos", error);
    return errorResponse("Erro ao listar pedidos", 500);
  }
}
