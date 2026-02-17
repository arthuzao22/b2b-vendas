import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { DashboardCharts } from "@/components/charts/dashboard-charts";
import { Users, ShoppingBag, Package, TrendingUp, Building2, AlertCircle } from "lucide-react";
import Link from "next/link";

interface AdminKPIs {
  totalUsuarios: number;
  totalFornecedores: number;
  fornecedoresPendentes: number;
  totalClientes: number;
  totalPedidos: number;
  faturamentoTotal: number;
  produtosAtivos: number;
  pedidosPendentes: number;
}

async function getAdminKPIs(): Promise<AdminKPIs> {
  const [
    totalUsuarios,
    fornecedores,
    clientes,
    pedidos,
    produtosAtivos,
  ] = await Promise.all([
    prisma.usuario.count(),
    prisma.fornecedor.findMany({
      select: {
        verificado: true,
      },
    }),
    prisma.cliente.count(),
    prisma.pedido.findMany({
      select: {
        total: true,
        status: true,
      },
    }),
    prisma.produto.count({
      where: { ativo: true },
    }),
  ]);

  const totalFornecedores = fornecedores.length;
  const fornecedoresPendentes = fornecedores.filter(f => !f.verificado).length;
  const totalPedidos = pedidos.length;
  const pedidosPendentes = pedidos.filter(p => p.status === "pendente").length;
  const faturamentoTotal = pedidos.reduce((sum, p) => sum + Number(p.total), 0);

  return {
    totalUsuarios,
    totalFornecedores,
    fornecedoresPendentes,
    totalClientes: clientes,
    totalPedidos,
    faturamentoTotal,
    produtosAtivos,
    pedidosPendentes,
  };
}

async function getAdminChartData() {
  const pedidos = await prisma.pedido.findMany({
    select: {
      criadoEm: true,
      status: true,
    },
  });

  // Orders by month (last 6 months)
  const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const ordersByMonth = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return {
      name: monthNames[date.getMonth()],
      value: pedidos.filter(p => {
        const orderMonth = new Date(p.criadoEm).getMonth();
        const orderYear = new Date(p.criadoEm).getFullYear();
        return orderMonth === date.getMonth() && orderYear === date.getFullYear();
      }).length,
    };
  }).reverse();

  // Orders by status
  const statusLabels: Record<string, string> = {
    pendente: "Pendente",
    confirmado: "Confirmado",
    em_preparacao: "Em Preparação",
    enviado: "Enviado",
    entregue: "Entregue",
    cancelado: "Cancelado",
  };

  const statusCount = pedidos.reduce((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const ordersByStatus = Object.entries(statusCount).map(([status, value]) => ({
    name: statusLabels[status as keyof typeof statusLabels] || status,
    value,
  }));

  return { ordersByMonth, ordersByStatus };
}

export default async function AdminDashboard() {
  await requireAdmin();
  const [kpis, chartData] = await Promise.all([
    getAdminKPIs(),
    getAdminChartData(),
  ]);

  return (
    <div className="space-y-[var(--space-6)] md:space-y-[var(--space-8)]">
      <PageHeader
        title="Dashboard do Administrador"
        subtitle="Visão geral do marketplace"
      />

      {/* KPI Cards */}
      <div className="grid gap-[var(--space-4)] sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-[var(--space-2)]">
            <CardTitle className="text-[length:var(--text-sm)] font-medium text-[hsl(var(--color-neutral-500))]">Total de Usuários</CardTitle>
            <div className="flex items-center justify-center size-9 rounded-[var(--radius-md)] bg-[hsl(var(--color-neutral-50))]">
              <Users className="size-4 text-[hsl(var(--color-brand-500))]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-[length:var(--text-2xl)] font-bold text-[hsl(var(--color-neutral-900))]">{kpis.totalUsuarios}</div>
            <p className="text-[length:var(--text-xs)] text-[hsl(var(--color-neutral-500))] mt-[var(--space-0-5)]">
              Cadastrados na plataforma
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-[var(--space-2)]">
            <CardTitle className="text-[length:var(--text-sm)] font-medium text-[hsl(var(--color-neutral-500))]">Fornecedores</CardTitle>
            <div className="flex items-center justify-center size-9 rounded-[var(--radius-md)] bg-[hsl(var(--color-neutral-50))]">
              <Building2 className="size-4 text-[hsl(var(--color-info-500))]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-[length:var(--text-2xl)] font-bold text-[hsl(var(--color-neutral-900))]">{kpis.totalFornecedores}</div>
            <p className="text-[length:var(--text-xs)] text-[hsl(var(--color-neutral-500))] mt-[var(--space-0-5)]">
              {kpis.fornecedoresPendentes} aguardando aprovação
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-[var(--space-2)]">
            <CardTitle className="text-[length:var(--text-sm)] font-medium text-[hsl(var(--color-neutral-500))]">Clientes</CardTitle>
            <div className="flex items-center justify-center size-9 rounded-[var(--radius-md)] bg-[hsl(var(--color-neutral-50))]">
              <Users className="size-4 text-[hsl(var(--color-success-500))]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-[length:var(--text-2xl)] font-bold text-[hsl(var(--color-neutral-900))]">{kpis.totalClientes}</div>
            <p className="text-[length:var(--text-xs)] text-[hsl(var(--color-neutral-500))] mt-[var(--space-0-5)]">
              Clientes ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-[var(--space-2)]">
            <CardTitle className="text-[length:var(--text-sm)] font-medium text-[hsl(var(--color-neutral-500))]">Produtos Ativos</CardTitle>
            <div className="flex items-center justify-center size-9 rounded-[var(--radius-md)] bg-[hsl(var(--color-neutral-50))]">
              <Package className="size-4 text-[hsl(var(--color-neutral-600))]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-[length:var(--text-2xl)] font-bold text-[hsl(var(--color-neutral-900))]">{kpis.produtosAtivos}</div>
            <p className="text-[length:var(--text-xs)] text-[hsl(var(--color-neutral-500))] mt-[var(--space-0-5)]">
              No marketplace
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-[var(--space-2)]">
            <CardTitle className="text-[length:var(--text-sm)] font-medium text-[hsl(var(--color-neutral-500))]">Total de Pedidos</CardTitle>
            <div className="flex items-center justify-center size-9 rounded-[var(--radius-md)] bg-[hsl(var(--color-neutral-50))]">
              <ShoppingBag className="size-4 text-[hsl(var(--color-brand-500))]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-[length:var(--text-2xl)] font-bold text-[hsl(var(--color-neutral-900))]">{kpis.totalPedidos}</div>
            <p className="text-[length:var(--text-xs)] text-[hsl(var(--color-neutral-500))] mt-[var(--space-0-5)]">
              {kpis.pedidosPendentes} pendentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-[var(--space-2)]">
            <CardTitle className="text-[length:var(--text-sm)] font-medium text-[hsl(var(--color-neutral-500))]">Faturamento Total</CardTitle>
            <div className="flex items-center justify-center size-9 rounded-[var(--radius-md)] bg-[hsl(var(--color-neutral-50))]">
              <TrendingUp className="size-4 text-[hsl(var(--color-success-500))]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-[length:var(--text-2xl)] font-bold text-[hsl(var(--color-neutral-900))]">{formatCurrency(kpis.faturamentoTotal)}</div>
            <p className="text-[length:var(--text-xs)] text-[hsl(var(--color-neutral-500))] mt-[var(--space-0-5)]">
              Receita do marketplace
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-[var(--space-2)]">
            <CardTitle className="text-[length:var(--text-sm)] font-medium text-[hsl(var(--color-neutral-500))]">Aprovações Pendentes</CardTitle>
            <div className="flex items-center justify-center size-9 rounded-[var(--radius-md)] bg-[hsl(var(--color-warning-50))]">
              <AlertCircle className="size-4 text-[hsl(var(--color-warning-500))]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-[length:var(--text-2xl)] font-bold text-[hsl(var(--color-neutral-900))]">{kpis.fornecedoresPendentes}</div>
            <p className="text-[length:var(--text-xs)] text-[hsl(var(--color-neutral-500))] mt-[var(--space-0-5)]">
              Fornecedores aguardando
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-[var(--space-2)]">
            <CardTitle className="text-[length:var(--text-sm)] font-medium text-[hsl(var(--color-neutral-500))]">Pedidos Pendentes</CardTitle>
            <div className="flex items-center justify-center size-9 rounded-[var(--radius-md)] bg-[hsl(var(--color-warning-50))]">
              <AlertCircle className="size-4 text-[hsl(var(--color-warning-500))]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-[length:var(--text-2xl)] font-bold text-[hsl(var(--color-neutral-900))]">{kpis.pedidosPendentes}</div>
            <p className="text-[length:var(--text-xs)] text-[hsl(var(--color-neutral-500))] mt-[var(--space-0-5)]">
              Necessitam atenção
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-[var(--space-4)] sm:grid-cols-2 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Gerenciar Usuários</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[length:var(--text-sm)] text-[hsl(var(--color-neutral-500))] mb-[var(--space-4)]">
              Visualize e gerencie todos os usuários da plataforma
            </p>
            <Button className="w-full" asChild>
              <Link href="/dashboard/admin/usuarios">Ver Usuários</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gerenciar Fornecedores</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[length:var(--text-sm)] text-[hsl(var(--color-neutral-500))] mb-[var(--space-4)]">
              Aprove ou gerencie fornecedores cadastrados
            </p>
            <Button className="w-full" asChild>
              <Link href="/dashboard/admin/fornecedores">Ver Fornecedores</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Relatórios</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[length:var(--text-sm)] text-[hsl(var(--color-neutral-500))] mb-[var(--space-4)]">
              Acesse relatórios consolidados do marketplace
            </p>
            <Button className="w-full" asChild>
              <Link href="/dashboard/admin/relatorios">Ver Relatórios</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-[var(--space-4)] md:grid-cols-2">
        <DashboardCharts 
          ordersByMonth={chartData.ordersByMonth}
          ordersByStatus={chartData.ordersByStatus}
        />
      </div>
    </div>
  );
}
