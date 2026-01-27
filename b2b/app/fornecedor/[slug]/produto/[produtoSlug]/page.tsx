import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { PriceDisplay } from "@/components/ui/price-display";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Building2, Package, ArrowLeft, ShoppingCart, Tag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function getProduto(fornecedorSlug: string, produtoSlug: string) {
    const fornecedor = await prisma.fornecedor.findUnique({
        where: { slug: fornecedorSlug },
        select: { id: true },
    });

    if (!fornecedor) return null;

    const produto = await prisma.produto.findFirst({
        where: {
            fornecedorId: fornecedor.id,
            slug: produtoSlug,
            ativo: true,
        },
        include: {
            fornecedor: {
                select: {
                    id: true,
                    slug: true,
                    nomeFantasia: true,
                    razaoSocial: true,
                    verificado: true,
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
    });

    return produto;
}

async function calcularPrecoCliente(produtoId: string, fornecedorId: string, precoBase: number, clienteId: string | null) {
    if (!clienteId) {
        return { precoFinal: precoBase, tipoPreco: "base" as const };
    }

    // Verificar preço customizado
    const precoCustomizado = await prisma.precoCustomizado.findUnique({
        where: {
            clienteId_produtoId: {
                clienteId,
                produtoId,
            },
        },
    });

    if (precoCustomizado) {
        return { precoFinal: Number(precoCustomizado.preco), tipoPreco: "customizado" as const };
    }

    // Verificar lista de preço
    const clienteFornecedor = await prisma.clienteFornecedor.findFirst({
        where: {
            clienteId,
            fornecedorId,
            listaPrecoId: { not: null },
        },
        include: {
            listaPreco: {
                include: {
                    itens: {
                        where: { produtoId },
                    },
                },
            },
        },
    });

    if (clienteFornecedor?.listaPreco?.ativo) {
        const itemLista = clienteFornecedor.listaPreco.itens[0];

        if (itemLista?.precoEspecial) {
            return { precoFinal: Number(itemLista.precoEspecial), tipoPreco: "lista" as const };
        }

        const lista = clienteFornecedor.listaPreco;
        if (lista.tipoDesconto === "percentual") {
            const desconto = Number(lista.valorDesconto) / 100;
            return { precoFinal: precoBase * (1 - desconto), tipoPreco: "lista" as const };
        } else {
            return { precoFinal: Math.max(0, precoBase - Number(lista.valorDesconto)), tipoPreco: "lista" as const };
        }
    }

    return { precoFinal: precoBase, tipoPreco: "base" as const };
}

export default async function ProdutoPage({
    params,
}: {
    params: Promise<{ slug: string; produtoSlug: string }>;
}) {
    const { slug, produtoSlug } = await params;
    const produto = await getProduto(slug, produtoSlug);

    if (!produto) {
        notFound();
    }

    const session = await getServerSession(authOptions);
    const clienteId = session?.user?.tipo === "cliente" ? session.user.clienteId ?? null : null;

    const { precoFinal, tipoPreco } = await calcularPrecoCliente(
        produto.id,
        produto.fornecedorId,
        Number(produto.precoBase),
        clienteId
    );

    const precoBase = Number(produto.precoBase);
    const temDesconto = precoFinal < precoBase;

    return (
        <div className="container mx-auto py-8">
            <Breadcrumbs
                items={[
                    { label: "Catálogo", href: "/catalogo" },
                    { label: produto.fornecedor.nomeFantasia || produto.fornecedor.razaoSocial, href: `/fornecedor/${slug}` },
                    { label: produto.nome },
                ]}
            />

            <div className="mt-6">
                <Link href={`/fornecedor/${slug}`}>
                    <Button variant="ghost" size="sm" className="mb-4">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Voltar para {produto.fornecedor.nomeFantasia || produto.fornecedor.razaoSocial}
                    </Button>
                </Link>

                <div className="grid gap-8 lg:grid-cols-2">
                    {/* Galeria de Imagens */}
                    <div className="space-y-4">
                        <div className="relative aspect-square w-full bg-gray-100 rounded-lg overflow-hidden">
                            {produto.imagens[0] ? (
                                <Image
                                    src={produto.imagens[0]}
                                    alt={produto.nome}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="flex h-full items-center justify-center">
                                    <Package className="h-24 w-24 text-gray-400" />
                                </div>
                            )}
                        </div>

                        {produto.imagens.length > 1 && (
                            <div className="grid grid-cols-4 gap-2">
                                {produto.imagens.slice(1, 5).map((imagem, index) => (
                                    <div key={index} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                        <Image
                                            src={imagem}
                                            alt={`${produto.nome} - imagem ${index + 2}`}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Informações do Produto */}
                    <div className="space-y-6">
                        <div>
                            {tipoPreco !== "base" && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mb-2">
                                    <Tag className="h-3 w-3" />
                                    {tipoPreco === "customizado" ? "Preço Especial" : "Preço de Lista"}
                                </span>
                            )}
                            <h1 className="text-3xl font-bold tracking-tight">{produto.nome}</h1>
                            <p className="text-muted-foreground mt-1">SKU: {produto.sku}</p>
                        </div>

                        <div className="flex items-baseline gap-3">
                            {temDesconto && (
                                <span className="text-xl text-muted-foreground line-through">
                                    R$ {precoBase.toFixed(2)}
                                </span>
                            )}
                            <PriceDisplay
                                value={precoFinal}
                                size="lg"
                                className={temDesconto ? "text-green-600" : ""}
                            />
                            {temDesconto && (
                                <span className="text-sm text-green-600 font-medium">
                                    ({Math.round((1 - precoFinal / precoBase) * 100)}% OFF)
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-4">
                            <span className={`text-sm font-medium ${produto.quantidadeEstoque > 0 ? "text-green-600" : "text-red-600"}`}>
                                {produto.quantidadeEstoque > 0
                                    ? `${produto.quantidadeEstoque} unidades em estoque`
                                    : "Produto sem estoque"}
                            </span>
                        </div>

                        {clienteId ? (
                            <Button size="lg" className="w-full" disabled={produto.quantidadeEstoque === 0}>
                                <ShoppingCart className="mr-2 h-5 w-5" />
                                Adicionar ao Carrinho
                            </Button>
                        ) : (
                            <Link href="/auth/login?callbackUrl=/catalogo">
                                <Button size="lg" variant="outline" className="w-full">
                                    Faça login para comprar
                                </Button>
                            </Link>
                        )}

                        {/* Descrição */}
                        {produto.descricao && (
                            <Card>
                                <CardContent className="p-4">
                                    <h3 className="font-semibold mb-2">Descrição</h3>
                                    <p className="text-muted-foreground whitespace-pre-line">{produto.descricao}</p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Categoria */}
                        {produto.categoria && (
                            <div className="text-sm">
                                <span className="text-muted-foreground">Categoria: </span>
                                <span className="font-medium">{produto.categoria.nome}</span>
                            </div>
                        )}

                        {/* Fornecedor */}
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center">
                                        <Building2 className="h-6 w-6 text-gray-400" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold">
                                            {produto.fornecedor.nomeFantasia || produto.fornecedor.razaoSocial}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {produto.fornecedor.verificado ? "Fornecedor verificado" : "Fornecedor"}
                                        </p>
                                    </div>
                                    <Link href={`/fornecedor/${slug}`}>
                                        <Button variant="outline" size="sm">Ver loja</Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
