"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, Column } from "@/components/ui/data-table";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { formatDate } from "@/lib/utils";
import { ArrowUp, ArrowDown, Package } from "lucide-react";

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

interface EstoqueClientProps {
  movimentacoes: MovimentacaoEstoque[];
}

export function EstoqueClient({ movimentacoes }: EstoqueClientProps) {
  const columns: Column<MovimentacaoEstoque>[] = [
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
          ) : (
            <ArrowDown className="h-4 w-4 text-red-600" />
          )}
          <span className="text-sm capitalize">{mov.tipo}</span>
        </div>
      ),
    },
    {
      key: "quantidade",
      label: "Quantidade",
      render: (mov) => (
        <span className={`font-bold ${mov.tipo === "entrada" ? "text-green-600" : "text-red-600"}`}>
          {mov.tipo === "entrada" ? "+" : "-"}
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

  return (
    <div className="space-y-6">
      <div>
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: "/dashboard/fornecedor" },
            { label: "Estoque" },
          ]}
        />
        <div className="mt-4">
          <h1 className="text-3xl font-bold tracking-tight">Movimentações de Estoque</h1>
          <p className="text-muted-foreground">
            Histórico completo de entradas e saídas de estoque
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Movimentações</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{movimentacoes.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entradas</CardTitle>
            <ArrowUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {movimentacoes.filter((m) => m.tipo === "entrada").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saídas</CardTitle>
            <ArrowDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {movimentacoes.filter((m) => m.tipo === "saida").length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Movimentações</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={movimentacoes}
            columns={columns}
            keyExtractor={(mov) => mov.id}
            searchable
            searchPlaceholder="Buscar por produto..."
            emptyMessage="Nenhuma movimentação de estoque registrada"
          />
        </CardContent>
      </Card>
    </div>
  );
}
