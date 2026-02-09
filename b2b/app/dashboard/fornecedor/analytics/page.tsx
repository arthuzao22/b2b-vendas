"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Users,
  Package,
  Calendar,
} from "lucide-react";

interface KPIs {
  totalPedidos: number;
  faturamento: string;
  ticketMedio: string;
  clientesAtivos: number;
  produtosAtivos: number;
  pedidosPendentes: number;
}

interface VendasData {
  data: string;
  total: number;
  pedidos: number;
}

interface CategoriaData {
  categoria: string;
  total: number;
  pedidos: number;
}

interface TopProduto {
  produtoId: string;
  nome: string;
  quantidadeVendida: number;
  totalVendido: number;
}

interface TopCliente {
  clienteId: string;
  nome: string;
  totalComprado: number;
  quantidadePedidos: number;
}

interface PedidosPorStatus {
  status: string;
  quantidade: number;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

type Period = "7d" | "30d" | "90d" | "custom";

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>("30d");
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<KPIs | null>(null);
  const [vendasData, setVendasData] = useState<VendasData[]>([]);
  const [categoriasData, setCategoriasData] = useState<CategoriaData[]>([]);
  const [topProdutos, setTopProdutos] = useState<TopProduto[]>([]);
  const [topClientes, setTopClientes] = useState<TopCliente[]>([]);
  const [pedidosStatus, setPedidosStatus] = useState<PedidosPorStatus[]>([]);

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const dateParams = getDateParams(period);
      const queryString = new URLSearchParams(dateParams).toString();

      // Load all analytics data in parallel
      const [kpisRes, vendasRes, categoriasRes, produtosRes, clientesRes, statusRes] =
        await Promise.all([
          fetch(`/api/analytics/kpis?${queryString}`),
          fetch(`/api/analytics/vendas?${queryString}`),
          fetch(`/api/analytics/vendas-por-categoria?${queryString}`),
          fetch(`/api/analytics/top-produtos?${queryString}`),
          fetch(`/api/analytics/top-clientes?${queryString}`),
          fetch(`/api/analytics/pedidos-por-status?${queryString}`),
        ]);

      if (kpisRes.ok) {
        const data = await kpisRes.json();
        setKpis(data.data);
      }

      if (vendasRes.ok) {
        const data = await vendasRes.json();
        setVendasData(data.data || []);
      }

      if (categoriasRes.ok) {
        const data = await categoriasRes.json();
        setCategoriasData(data.data || []);
      }

      if (produtosRes.ok) {
        const data = await produtosRes.json();
        setTopProdutos(data.data || []);
      }

      if (clientesRes.ok) {
        const data = await clientesRes.json();
        setTopClientes(data.data || []);
      }

      if (statusRes.ok) {
        const data = await statusRes.json();
        setPedidosStatus(data.data || []);
      }
    } catch (error) {
      console.error("Erro ao carregar analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDateParams = (period: Period) => {
    const now = new Date();
    const params: Record<string, string> = {};

    switch (period) {
      case "7d":
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        params.startDate = sevenDaysAgo.toISOString();
        params.endDate = now.toISOString();
        break;
      case "30d":
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        params.startDate = thirtyDaysAgo.toISOString();
        params.endDate = now.toISOString();
        break;
      case "90d":
        const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        params.startDate = ninetyDaysAgo.toISOString();
        params.endDate = now.toISOString();
        break;
    }

    return params;
  };

  const formatCurrency = (value: number | string) => {
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(numValue);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-gray-600 mt-1">
            Análise detalhada de vendas e performance
          </p>
        </div>

        {/* Period Filter */}
        <div className="flex gap-2">
          <Button
            variant={period === "7d" ? "default" : "outline"}
            size="sm"
            onClick={() => setPeriod("7d")}
          >
            7 dias
          </Button>
          <Button
            variant={period === "30d" ? "default" : "outline"}
            size="sm"
            onClick={() => setPeriod("30d")}
          >
            30 dias
          </Button>
          <Button
            variant={period === "90d" ? "default" : "outline"}
            size="sm"
            onClick={() => setPeriod("90d")}
          >
            90 dias
          </Button>
        </div>
      </div>

      {/* KPIs */}
      {kpis && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Faturamento</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(kpis.faturamento)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pedidos</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpis.totalPedidos}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(kpis.ticketMedio)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpis.clientesAtivos}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Produtos Ativos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpis.produtosAtivos}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pedidos Pendentes</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpis.pedidosPendentes}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts Row 1 */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Vendas ao longo do tempo */}
        <Card>
          <CardHeader>
            <CardTitle>Vendas por Período</CardTitle>
            <CardDescription>Evolução do faturamento ao longo do tempo</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={vendasData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="data" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Legend />
                <Line type="monotone" dataKey="total" stroke="#8884d8" name="Faturamento" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Vendas por categoria */}
        <Card>
          <CardHeader>
            <CardTitle>Vendas por Categoria</CardTitle>
            <CardDescription>Distribuição de vendas entre categorias</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoriasData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => entry.categoria}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="total"
                >
                  {categoriasData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Top Produtos */}
        <Card>
          <CardHeader>
            <CardTitle>Top Produtos</CardTitle>
            <CardDescription>Produtos mais vendidos no período</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProdutos}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nome" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Legend />
                <Bar dataKey="totalVendido" fill="#82ca9d" name="Total Vendido" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pedidos por Status */}
        <Card>
          <CardHeader>
            <CardTitle>Pedidos por Status</CardTitle>
            <CardDescription>Distribuição de pedidos por status</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={pedidosStatus}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="quantidade" fill="#8884d8" name="Quantidade" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Clientes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Top Clientes</CardTitle>
          <CardDescription>Clientes com maior volume de compras</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Cliente</th>
                  <th className="text-right py-3 px-4">Total Comprado</th>
                  <th className="text-right py-3 px-4">Quantidade de Pedidos</th>
                </tr>
              </thead>
              <tbody>
                {topClientes.map((cliente) => (
                  <tr key={cliente.clienteId} className="border-b">
                    <td className="py-3 px-4">{cliente.nome}</td>
                    <td className="text-right py-3 px-4">
                      {formatCurrency(cliente.totalComprado)}
                    </td>
                    <td className="text-right py-3 px-4">
                      {cliente.quantidadePedidos}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
