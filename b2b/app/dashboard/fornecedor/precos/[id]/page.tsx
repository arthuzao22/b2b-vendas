"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable, Column } from "@/components/ui/data-table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form-field";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { PriceDisplay } from "@/components/ui/price-display";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { Plus, Trash2, Package, Users, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface ListaPreco {
    id: string;
    nome: string;
    descricao?: string | null;
    tipoDesconto: "percentual" | "fixo";
    valorDesconto: string;
    ativo: boolean;
}

interface ItemLista {
    id: string;
    produtoId: string;
    precoEspecial: string | null;
    produto: {
        id: string;
        nome: string;
        sku: string;
        precoBase: string;
        imagens: string[];
    };
}

interface Produto {
    id: string;
    nome: string;
    sku: string;
    precoBase: string;
}

interface ClienteAtribuido {
    id: string;
    cliente: {
        id: string;
        razaoSocial: string;
        nomeFantasia: string | null;
    };
}

export default function ListaPrecoDetalhePage() {
    const params = useParams();
    const listaId = params.id as string;

    const [lista, setLista] = useState<ListaPreco | null>(null);
    const [itens, setItens] = useState<ItemLista[]>([]);
    const [clientes, setClientes] = useState<ClienteAtribuido[]>([]);
    const [produtosDisponiveis, setProdutosDisponiveis] = useState<Produto[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [selectedProdutoId, setSelectedProdutoId] = useState("");
    const [precoEspecial, setPrecoEspecial] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (listaId) {
            fetchListaDetails();
            fetchProdutosDisponiveis();
        }
    }, [listaId]);

    const fetchListaDetails = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/listas-preco/${listaId}`);
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setLista(data.data.lista || data.data);
                    setItens(data.data.itens || []);
                    setClientes(data.data.clientes || []);
                }
            }
        } catch (error) {
            console.error("Error fetching lista:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchProdutosDisponiveis = async () => {
        try {
            const response = await fetch("/api/produtos?limit=100");
            if (response.ok) {
                const data = await response.json();
                const produtos = data.data?.produtos || data.data || [];
                setProdutosDisponiveis(Array.isArray(produtos) ? produtos : []);
            }
        } catch (error) {
            console.error("Error fetching produtos:", error);
        }
    };

    const handleAddProduto = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProdutoId) return;

        setSaving(true);
        try {
            const response = await fetch(`/api/listas-preco/${listaId}/produtos`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    produtoId: selectedProdutoId,
                    precoEspecial: precoEspecial ? parseFloat(precoEspecial) : undefined,
                }),
            });

            if (response.ok) {
                await fetchListaDetails();
                setIsAddDialogOpen(false);
                setSelectedProdutoId("");
                setPrecoEspecial("");
            } else {
                const error = await response.json();
                alert(error.error || "Erro ao adicionar produto");
            }
        } catch (error) {
            console.error("Error adding produto:", error);
        } finally {
            setSaving(false);
        }
    };

    const handleRemoveProduto = async (produtoId: string) => {
        if (!confirm("Tem certeza que deseja remover este produto da lista?")) return;

        try {
            const response = await fetch(`/api/listas-preco/${listaId}/produtos/${produtoId}`, {
                method: "DELETE",
            });

            if (response.ok) {
                await fetchListaDetails();
            }
        } catch (error) {
            console.error("Error removing produto:", error);
        }
    };

    const calcularPrecoComDesconto = (precoBase: number) => {
        if (!lista) return precoBase;
        const valorDesconto = parseFloat(lista.valorDesconto);
        if (lista.tipoDesconto === "percentual") {
            return precoBase * (1 - valorDesconto / 100);
        }
        return Math.max(0, precoBase - valorDesconto);
    };

    const produtosNaLista = itens.map(i => i.produtoId);
    const produtosParaAdicionar = produtosDisponiveis.filter(
        p => !produtosNaLista.includes(p.id)
    );

    const itensColumns: Column<ItemLista>[] = [
        {
            key: "produto",
            label: "Produto",
            render: (item) => (
                <div>
                    <p className="font-medium">{item.produto.nome}</p>
                    <p className="text-xs text-muted-foreground">SKU: {item.produto.sku}</p>
                </div>
            ),
        },
        {
            key: "precoBase",
            label: "Preço Base",
            render: (item) => (
                <PriceDisplay value={parseFloat(item.produto.precoBase)} size="sm" />
            ),
        },
        {
            key: "precoFinal",
            label: "Preço na Lista",
            render: (item) => {
                const precoBase = parseFloat(item.produto.precoBase);
                const precoFinal = item.precoEspecial
                    ? parseFloat(item.precoEspecial)
                    : calcularPrecoComDesconto(precoBase);
                return (
                    <div>
                        <PriceDisplay value={precoFinal} size="sm" className="text-green-600 font-bold" />
                        {item.precoEspecial && (
                            <p className="text-xs text-muted-foreground">Preço especial</p>
                        )}
                    </div>
                );
            },
        },
        {
            key: "desconto",
            label: "Desconto",
            render: (item) => {
                const precoBase = parseFloat(item.produto.precoBase);
                const precoFinal = item.precoEspecial
                    ? parseFloat(item.precoEspecial)
                    : calcularPrecoComDesconto(precoBase);
                const desconto = ((precoBase - precoFinal) / precoBase) * 100;
                return (
                    <span className="text-sm font-medium text-green-600">
                        {desconto.toFixed(1)}%
                    </span>
                );
            },
        },
        {
            key: "actions",
            label: "",
            width: "80px",
            render: (item) => (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveProduto(item.produtoId)}
                    className="text-red-600 hover:text-red-700"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            ),
        },
    ];

    if (loading) {
        return (
            <div className="space-y-6">
                <LoadingSkeleton className="h-8 w-64" />
                <LoadingSkeleton className="h-48" />
            </div>
        );
    }

    if (!lista) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">Lista de preço não encontrada</p>
                <Link href="/dashboard/fornecedor/precos">
                    <Button variant="link">Voltar para listas</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <Breadcrumbs
                    items={[
                        { label: "Dashboard", href: "/dashboard/fornecedor" },
                        { label: "Listas de Preço", href: "/dashboard/fornecedor/precos" },
                        { label: lista.nome },
                    ]}
                />
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mt-4">
                    <div>
                        <div className="flex flex-wrap items-center gap-3">
                            <Link href="/dashboard/fornecedor/precos">
                                <Button variant="ghost" size="sm">
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                            </Link>
                            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{lista.nome}</h1>
                            <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${lista.ativo
                                        ? "bg-green-100 text-green-800"
                                        : "bg-gray-100 text-gray-800"
                                    }`}
                            >
                                {lista.ativo ? "Ativa" : "Inativa"}
                            </span>
                        </div>
                        {lista.descricao && (
                            <p className="text-muted-foreground mt-1">{lista.descricao}</p>
                        )}
                        <p className="text-sm text-muted-foreground mt-1">
                            Desconto: {lista.tipoDesconto === "percentual"
                                ? `${lista.valorDesconto}%`
                                : `R$ ${parseFloat(lista.valorDesconto).toFixed(2)}`
                            } ({lista.tipoDesconto})
                        </p>
                    </div>
                    <Button onClick={() => setIsAddDialogOpen(true)} className="w-full sm:w-auto">
                        <Plus className="mr-2 h-4 w-4" />
                        Adicionar Produto
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Produtos na Lista</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{itens.length}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Clientes Atribuídos</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{clientes.length}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Products in List */}
            <Card>
                <CardHeader>
                    <CardTitle>Produtos</CardTitle>
                </CardHeader>
                <CardContent>
                    <DataTable
                        data={itens}
                        columns={itensColumns}
                        keyExtractor={(item) => item.id}
                        searchable
                        searchPlaceholder="Buscar produtos..."
                        emptyMessage="Nenhum produto adicionado a esta lista"
                    />
                </CardContent>
            </Card>

            {/* Clients */}
            {clientes.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Clientes com esta Lista</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {clientes.map((c) => (
                                <div key={c.id} className="flex items-center gap-2 p-2 rounded-md bg-gray-50">
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                    <span>{c.cliente.nomeFantasia || c.cliente.razaoSocial}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Add Product Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Adicionar Produto à Lista</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddProduto} className="space-y-4 px-6 pb-6">
                        <div className="space-y-2">
                            <label htmlFor="produto" className="text-sm font-medium">
                                Produto *
                            </label>
                            <select
                                id="produto"
                                value={selectedProdutoId}
                                onChange={(e) => setSelectedProdutoId(e.target.value)}
                                className="w-full px-3 py-2 border rounded-md"
                                required
                            >
                                <option value="">Selecione um produto</option>
                                {produtosParaAdicionar.map((produto) => (
                                    <option key={produto.id} value={produto.id}>
                                        {produto.nome} (SKU: {produto.sku}) - R$ {parseFloat(produto.precoBase).toFixed(2)}
                                    </option>
                                ))}
                            </select>
                            {produtosParaAdicionar.length === 0 && (
                                <p className="text-xs text-muted-foreground">
                                    Todos os produtos já foram adicionados à lista
                                </p>
                            )}
                        </div>

                        <FormField
                            label="Preço Especial (opcional)"
                            id="precoEspecial"
                            type="number"
                            min="0"
                            step="0.01"
                            value={precoEspecial}
                            onChange={(e) => setPrecoEspecial(e.target.value)}
                            placeholder="Deixe vazio para usar o desconto da lista"
                        />
                        <p className="text-xs text-muted-foreground">
                            Se definido, este preço será usado em vez de aplicar o desconto da lista
                        </p>

                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={saving || !selectedProdutoId}>
                                {saving ? "Adicionando..." : "Adicionar"}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
