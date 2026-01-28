"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, TrendingUp, TrendingDown, Settings, Package } from "lucide-react";
import Link from "next/link";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface Movimentacao {
  id: string;
  tipo: "entrada" | "saida" | "ajuste";
  quantidade: number;
  estoqueAnterior: number;
  estoqueAtual: number;
  motivo: string;
  referencia: string | null;
  criadoEm: string;
  criadoPor: string | null;
}

interface Produto {
  id: string;
  nome: string;
  sku: string;
  quantidadeEstoque: number;
}

interface PageData {
  produto: Produto;
  movimentacoes: Movimentacao[];
}

const tipoLabels: Record<string, string> = {
  entrada: "Entrada",
  saida: "Saída",
  ajuste: "Ajuste",
};

const tipoColors: Record<string, string> = {
  entrada: "bg-green-100 text-green-800",
  saida: "bg-red-100 text-red-800",
  ajuste: "bg-blue-100 text-blue-800",
};

const tipoIcons: Record<string, typeof TrendingUp> = {
  entrada: TrendingUp,
  saida: TrendingDown,
  ajuste: Settings,
};

export default function MovimentacoesPage() {
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PageData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filterTipo, setFilterTipo] = useState<string>("all");

  useEffect(() => {
    loadMovimentacoes();
  }, [params.id]);

  const loadMovimentacoes = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/estoque/movimentacoes/${params.id}`);
      
      if (response.ok) {
        const result = await response.json();
        setData(result.data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Erro ao carregar movimentações");
      }
    } catch (err) {
      console.error("Erro ao carregar movimentações:", err);
      setError("Erro ao carregar movimentações");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateShort = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando movimentações...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-red-600">{error || "Dados não encontrados"}</p>
              <Link href="/dashboard/fornecedor/produtos">
                <Button className="mt-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar para Produtos
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { produto, movimentacoes } = data;

  // Filter movimentacoes
  const filteredMovimentacoes =
    filterTipo === "all"
      ? movimentacoes
      : movimentacoes.filter((m) => m.tipo === filterTipo);

  // Prepare chart data (last 30 entries)
  const chartData = movimentacoes
    .slice(0, 30)
    .reverse()
    .map((m) => ({
      data: formatDateShort(m.criadoEm),
      estoque: m.estoqueAtual,
    }));

  // Calculate statistics
  const totalEntradas = movimentacoes.filter((m) => m.tipo === "entrada").length;
  const totalSaidas = movimentacoes.filter((m) => m.tipo === "saida").length;
  const totalAjustes = movimentacoes.filter((m) => m.tipo === "ajuste").length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard/fornecedor/produtos">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Movimentações de Estoque</h1>
          </div>
          <p className="text-gray-600 mt-2">
            {produto.nome} - SKU: {produto.sku}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Estoque Atual</p>
          <p className="text-2xl font-bold">{produto.quantidadeEstoque} unidades</p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entradas</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEntradas}</div>
            <p className="text-xs text-muted-foreground">
              Movimentações de entrada
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saídas</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSaidas}</div>
            <p className="text-xs text-muted-foreground">
              Movimentações de saída
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ajustes</CardTitle>
            <Settings className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAjustes}</div>
            <p className="text-xs text-muted-foreground">
              Ajustes manuais
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Evolução do Estoque</CardTitle>
          <CardDescription>
            Últimas 30 movimentações
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="data" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="estoque"
                stroke="#8884d8"
                name="Estoque"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button
              variant={filterTipo === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterTipo("all")}
            >
              Todas ({movimentacoes.length})
            </Button>
            <Button
              variant={filterTipo === "entrada" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterTipo("entrada")}
            >
              Entradas ({totalEntradas})
            </Button>
            <Button
              variant={filterTipo === "saida" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterTipo("saida")}
            >
              Saídas ({totalSaidas})
            </Button>
            <Button
              variant={filterTipo === "ajuste" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterTipo("ajuste")}
            >
              Ajustes ({totalAjustes})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Movimentações</CardTitle>
          <CardDescription>
            {filteredMovimentacoes.length}{" "}
            {filteredMovimentacoes.length === 1 ? "movimentação" : "movimentações"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Data/Hora</th>
                  <th className="text-left py-3 px-4">Tipo</th>
                  <th className="text-right py-3 px-4">Quantidade</th>
                  <th className="text-right py-3 px-4">Estoque Anterior</th>
                  <th className="text-right py-3 px-4">Estoque Atual</th>
                  <th className="text-left py-3 px-4">Motivo</th>
                  <th className="text-left py-3 px-4">Referência</th>
                </tr>
              </thead>
              <tbody>
                {filteredMovimentacoes.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-500">
                      Nenhuma movimentação encontrada
                    </td>
                  </tr>
                ) : (
                  filteredMovimentacoes.map((mov) => {
                    const Icon = tipoIcons[mov.tipo];
                    return (
                      <tr key={mov.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm">
                          {formatDate(mov.criadoEm)}
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={tipoColors[mov.tipo]}>
                            <Icon className="h-3 w-3 mr-1" />
                            {tipoLabels[mov.tipo]}
                          </Badge>
                        </td>
                        <td
                          className={`text-right py-3 px-4 font-medium ${
                            mov.tipo === "entrada"
                              ? "text-green-600"
                              : mov.tipo === "saida"
                              ? "text-red-600"
                              : "text-blue-600"
                          }`}
                        >
                          {mov.tipo === "entrada" ? "+" : mov.tipo === "saida" ? "-" : ""}
                          {mov.quantidade}
                        </td>
                        <td className="text-right py-3 px-4 text-sm text-gray-600">
                          {mov.estoqueAnterior}
                        </td>
                        <td className="text-right py-3 px-4 font-semibold">
                          {mov.estoqueAtual}
                        </td>
                        <td className="py-3 px-4 text-sm">{mov.motivo}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {mov.referencia || "-"}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
