import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAdmin } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { Users, ShoppingBag, Package, TrendingUp, Building2, AlertCircle } from "lucide-react";

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

export default async function AdminDashboard() {
  await requireAdmin();
  const kpis = await getAdminKPIs();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard do Administrador</h1>
        <p className="text-muted-foreground">
          Visão geral do marketplace
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.totalUsuarios}</div>
            <p className="text-xs text-muted-foreground">
              Cadastrados na plataforma
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fornecedores</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.totalFornecedores}</div>
            <p className="text-xs text-muted-foreground">
              {kpis.fornecedoresPendentes} aguardando aprovação
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.totalClientes}</div>
            <p className="text-xs text-muted-foreground">
              Clientes ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produtos Ativos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.produtosAtivos}</div>
            <p className="text-xs text-muted-foreground">
              No marketplace
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.totalPedidos}</div>
            <p className="text-xs text-muted-foreground">
              {kpis.pedidosPendentes} pendentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faturamento Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(kpis.faturamentoTotal)}</div>
            <p className="text-xs text-muted-foreground">
              Receita do marketplace
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprovações Pendentes</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.fornecedoresPendentes}</div>
            <p className="text-xs text-muted-foreground">
              Fornecedores aguardando
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos Pendentes</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.pedidosPendentes}</div>
            <p className="text-xs text-muted-foreground">
              Necessitam atenção
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Gerenciar Usuários</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Visualize e gerencie todos os usuários da plataforma
            </p>
            <a href="/dashboard/admin/usuarios">
              <button className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
                Ver Usuários
              </button>
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gerenciar Fornecedores</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Aprove ou gerencie fornecedores cadastrados
            </p>
            <a href="/dashboard/admin/fornecedores">
              <button className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
                Ver Fornecedores
              </button>
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Relatórios</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Acesse relatórios consolidados do marketplace
            </p>
            <a href="/dashboard/admin/relatorios">
              <button className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
                Ver Relatórios
              </button>
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
