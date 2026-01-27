"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable, Column } from "@/components/ui/data-table";
import { Dialog } from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form-field";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { formatDate } from "@/lib/utils";
import {
  ArrowUp,
  ArrowDown,
  Package,
  Plus,
  RefreshCw,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Boxes
} from "lucide-react";

interface MovimentacaoEstoque {
  id: string;
  tipo: string;
  quantidade: number;
  estoqueAnterior: number;
  estoqueAtual: number;
  motivo: string;
  referencia?: string | null;
  criadoEm: Date;
  produto: {
    id: string;
    nome: string;
    sku: string;
  };
}

interface Produto {
  id: string;
  nome: string;
  sku: string;
  quantidadeEstoque: number;
  estoqueMinimo: number;
  estoqueMaximo: number;
}

interface EstoqueClientProps {
  movimentacoes: MovimentacaoEstoque[];
  produtos: Produto[];
}

export function EstoqueClient({ movimentacoes: initialMovimentacoes, produtos }: EstoqueClientProps) {
  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoEstoque[]>(initialMovimentacoes);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"movimentacoes" | "produtos">("movimentacoes");
  const [formData, setFormData] = useState({
    produtoId: "",
    tipo: "entrada" as "entrada" | "saida" | "ajuste",
    quantidade: "",
    motivo: "",
    referencia: "",
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/estoque/movimentacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          quantidade: parseInt(formData.quantidade),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Refresh the page data
          window.location.reload();
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Erro ao criar movimentação");
      }
    } catch (err) {
      setError("Erro ao criar movimentação");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setFormData({
      produtoId: "",
      tipo: "entrada",
      quantidade: "",
      motivo: "",
      referencia: "",
    });
    setError(null);
  };

  const produtosComEstoqueBaixo = produtos.filter(
    (p) => p.quantidadeEstoque <= p.estoqueMinimo
  );

  const totalEstoque = produtos.reduce((acc, p) => acc + p.quantidadeEstoque, 0);
  const totalEntradas = movimentacoes.filter((m) => m.tipo === "entrada").length;
  const totalSaidas = movimentacoes.filter((m) => m.tipo === "saida").length;

  const movimentacoesColumns: Column<MovimentacaoEstoque>[] = [
    {
      key: "criadoEm",
      label: "Data",
      sortable: true,
      render: (mov) => (
        <span className="text-sm">{formatDate(mov.criadoEm)}</span>
      ),
    },
    {
      key: "produto",
      label: "Produto",
      render: (mov) => (
        <div>
          <p className="font-medium text-sm">{mov.produto.nome}</p>
          <p className="text-xs text-muted-foreground">SKU: {mov.produto.sku}</p>
        </div>
      ),
    },
    {
      key: "tipo",
      label: "Tipo",
      render: (mov) => (
        <div className="flex items-center gap-2">
          {mov.tipo === "entrada" ? (
            <ArrowUp className="h-4 w-4 text-green-600" />
          ) : mov.tipo === "saida" ? (
            <ArrowDown className="h-4 w-4 text-red-600" />
          ) : (
            <RefreshCw className="h-4 w-4 text-blue-600" />
          )}
          <span className="text-sm capitalize">{mov.tipo}</span>
        </div>
      ),
    },
    {
      key: "quantidade",
      label: "Quantidade",
      render: (mov) => (
        <span className={`font-bold ${mov.tipo === "entrada" ? "text-green-600" :
            mov.tipo === "saida" ? "text-red-600" : "text-blue-600"
          }`}>
          {mov.tipo === "entrada" ? "+" : mov.tipo === "saida" ? "-" : ""}
          {mov.quantidade}
        </span>
      ),
    },
    {
      key: "estoqueAnterior",
      label: "Estoque Anterior",
      render: (mov) => (
        <span className="text-sm">{mov.estoqueAnterior}</span>
      ),
    },
    {
      key: "estoqueAtual",
      label: "Estoque Atual",
      render: (mov) => (
        <span className="text-sm font-medium">{mov.estoqueAtual}</span>
      ),
    },
    {
      key: "motivo",
      label: "Motivo",
      render: (mov) => (
        <div>
          <p className="text-sm">{mov.motivo}</p>
          {mov.referencia && (
            <p className="text-xs text-muted-foreground">{mov.referencia}</p>
          )}
        </div>
      ),
    },
  ];

  const produtosColumns: Column<Produto>[] = [
    {
      key: "nome",
      label: "Produto",
      sortable: true,
      render: (produto) => (
        <div>
          <p className="font-medium">{produto.nome}</p>
          <p className="text-xs text-muted-foreground">SKU: {produto.sku}</p>
        </div>
      ),
    },
    {
      key: "quantidadeEstoque",
      label: "Estoque Atual",
      sortable: true,
      render: (produto) => (
        <span className={`font-bold ${produto.quantidadeEstoque <= produto.estoqueMinimo
            ? "text-red-600"
            : produto.quantidadeEstoque >= produto.estoqueMaximo
              ? "text-yellow-600"
              : "text-green-600"
          }`}>
          {produto.quantidadeEstoque}
        </span>
      ),
    },
    {
      key: "estoqueMinimo",
      label: "Mínimo",
      render: (produto) => (
        <span className="text-sm text-muted-foreground">{produto.estoqueMinimo}</span>
      ),
    },
    {
      key: "estoqueMaximo",
      label: "Máximo",
      render: (produto) => (
        <span className="text-sm text-muted-foreground">{produto.estoqueMaximo}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (produto) => {
        if (produto.quantidadeEstoque <= produto.estoqueMinimo) {
          return (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
              <AlertTriangle className="h-3 w-3" />
              Baixo
            </span>
          );
        }
        if (produto.quantidadeEstoque >= produto.estoqueMaximo) {
          return (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              Máximo
            </span>
          );
        }
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Normal
          </span>
        );
      },
    },
    {
      key: "actions",
      label: "Ações",
      render: (produto) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setFormData({
              ...formData,
              produtoId: produto.id,
            });
            setIsDialogOpen(true);
          }}
        >
          <Plus className="h-3 w-3 mr-1" />
          Movimentar
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: "/dashboard/fornecedor" },
            { label: "Estoque" },
          ]}
        />
        <div className="flex items-center justify-between mt-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestão de Estoque</h1>
            <p className="text-muted-foreground">
              Gerencie o estoque dos seus produtos
            </p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Movimentação
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total em Estoque</CardTitle>
            <Boxes className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEstoque.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {produtos.length} produtos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entradas</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalEntradas}</div>
            <p className="text-xs text-muted-foreground">
              movimentações
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saídas</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{totalSaidas}</div>
            <p className="text-xs text-muted-foreground">
              movimentações
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {produtosComEstoqueBaixo.length}
            </div>
            <p className="text-xs text-muted-foreground">
              produtos precisam de reposição
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab("movimentacoes")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === "movimentacoes"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
        >
          Movimentações
        </button>
        <button
          onClick={() => setActiveTab("produtos")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === "produtos"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
        >
          Produtos em Estoque
        </button>
      </div>

      {/* Content */}
      {activeTab === "movimentacoes" ? (
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Movimentações</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              data={movimentacoes}
              columns={movimentacoesColumns}
              keyExtractor={(mov) => mov.id}
              searchable
              searchPlaceholder="Buscar por produto..."
              emptyMessage="Nenhuma movimentação de estoque registrada"
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Produtos em Estoque</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              data={produtos}
              columns={produtosColumns}
              keyExtractor={(produto) => produto.id}
              searchable
              searchPlaceholder="Buscar produto..."
              emptyMessage="Nenhum produto cadastrado"
            />
          </CardContent>
        </Card>
      )}

      {/* Dialog para Nova Movimentação */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <div className="p-6 max-w-md">
          <h2 className="text-xl font-bold mb-4">Nova Movimentação de Estoque</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="produtoId" className="text-sm font-medium">
                Produto *
              </label>
              <select
                id="produtoId"
                value={formData.produtoId}
                onChange={(e) => setFormData({ ...formData, produtoId: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                required
              >
                <option value="">Selecione um produto</option>
                {produtos.map((produto) => (
                  <option key={produto.id} value={produto.id}>
                    {produto.nome} (SKU: {produto.sku}) - Estoque: {produto.quantidadeEstoque}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="tipo" className="text-sm font-medium">
                Tipo de Movimentação *
              </label>
              <select
                id="tipo"
                value={formData.tipo}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value as any })}
                className="w-full px-3 py-2 border rounded-md"
                required
              >
                <option value="entrada">Entrada</option>
                <option value="saida">Saída</option>
                <option value="ajuste">Ajuste</option>
              </select>
              <p className="text-xs text-muted-foreground">
                {formData.tipo === "entrada" && "Adiciona ao estoque atual"}
                {formData.tipo === "saida" && "Remove do estoque atual"}
                {formData.tipo === "ajuste" && "Define o valor exato do estoque"}
              </p>
            </div>

            <FormField
              label={formData.tipo === "ajuste" ? "Novo Estoque *" : "Quantidade *"}
              id="quantidade"
              type="number"
              min="1"
              value={formData.quantidade}
              onChange={(e) => setFormData({ ...formData, quantidade: e.target.value })}
              required
            />

            <FormField
              label="Motivo *"
              id="motivo"
              value={formData.motivo}
              onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
              required
              placeholder="Ex: Compra de fornecedor, Venda, Quebra, Inventário..."
            />

            <FormField
              label="Referência (opcional)"
              id="referencia"
              value={formData.referencia}
              onChange={(e) => setFormData({ ...formData, referencia: e.target.value })}
              placeholder="Ex: NF 12345, Pedido #001..."
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Salvando..." : "Registrar Movimentação"}
              </Button>
            </div>
          </form>
        </div>
      </Dialog>
    </div>
  );
}
