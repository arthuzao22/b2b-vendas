import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/ui/status-badge"
import { PageHeader } from "@/components/layout/page-header"
import { requireFornecedor } from "@/lib/api-helpers"
import { prisma } from "@/lib/prisma"
import { formatCurrency, formatDate } from "@/lib/utils"
import { DashboardCharts } from "@/components/charts/dashboard-charts"
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Users,
  Package,
  AlertTriangle
} from "lucide-react"

interface KPI {
  totalFaturamento: number
  totalPedidos: number
  ticketMedio: number
  clientesAtivos: number
  produtosAtivos: number
  pedidosPendentes: number
}

async function getKPIs(fornecedorId: string): Promise<KPI> {
  const [pedidos, clientes, produtos] = await Promise.all([
    prisma.pedido.findMany({
      where: { fornecedorId },
      select: {
        total: true,
        status: true,
      },
    }),
    prisma.clienteFornecedor.count({
      where: {
        fornecedorId,
        cliente: {
          usuario: {
            ativo: true,
          },
        },
      },
    }),
    prisma.produto.count({
      where: {
        fornecedorId,
        ativo: true,
      },
    }),
  ])

  const totalFaturamento = pedidos.reduce((sum, p) => sum + Number(p.total), 0)
  const totalPedidos = pedidos.length
  const ticketMedio = totalPedidos > 0 ? totalFaturamento / totalPedidos : 0
  const pedidosPendentes = pedidos.filter(p => p.status === "pendente").length

  return {
    totalFaturamento,
    totalPedidos,
    ticketMedio,
    clientesAtivos: clientes,
    produtosAtivos: produtos,
    pedidosPendentes,
  }
}

async function getRecentOrders(fornecedorId: string) {
  return await prisma.pedido.findMany({
    where: { fornecedorId },
    include: {
      cliente: {
        select: {
          razaoSocial: true,
        },
      },
    },
    orderBy: { criadoEm: "desc" },
    take: 5,
  })
}

async function getLowStockProducts(fornecedorId: string) {
  return await prisma.produto.findMany({
    where: {
      fornecedorId,
      ativo: true,
      quantidadeEstoque: {
        lte: prisma.produto.fields.estoqueMinimo,
      },
    },
    select: {
      id: true,
      nome: true,
      sku: true,
      quantidadeEstoque: true,
      estoqueMinimo: true,
    },
    take: 10,
  })
}

async function getChartData(fornecedorId: string) {
  const pedidos = await prisma.pedido.findMany({
    where: { fornecedorId },
    select: {
      criadoEm: true,
      status: true,
    },
  });

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

  const statusCount = pedidos.reduce((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusLabelsMap: Record<string, string> = {
    pendente: "Pendente",
    confirmado: "Confirmado",
    em_preparacao: "Em Preparação",
    enviado: "Enviado",
    entregue: "Entregue",
    cancelado: "Cancelado",
  };

  const ordersByStatus = Object.entries(statusCount).map(([status, value]) => ({
    name: statusLabelsMap[status] || status,
    value,
  }));

  return { ordersByMonth, ordersByStatus };
}

const statusLabels: Record<string, string> = {
  pendente: "Pendente",
  confirmado: "Confirmado",
  em_preparacao: "Em Preparação",
  enviado: "Enviado",
  entregue: "Entregue",
  cancelado: "Cancelado",
}

// KPI Card component
function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-[var(--space-2)]">
        <CardTitle className="text-[length:var(--text-sm)] font-medium text-[hsl(var(--color-neutral-500))]">
          {title}
        </CardTitle>
        <div className="flex items-center justify-center size-9 rounded-[var(--radius-md)] bg-[hsl(var(--color-neutral-50))]">
          <Icon className={`size-4 ${iconColor || "text-[hsl(var(--color-neutral-500))]"}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-[length:var(--text-2xl)] font-bold text-[hsl(var(--color-neutral-900))]">{value}</div>
        <p className="text-[length:var(--text-xs)] text-[hsl(var(--color-neutral-500))] mt-[var(--space-0-5)]">
          {subtitle}
        </p>
      </CardContent>
    </Card>
  );
}

export default async function FornecedorDashboard() {
  const { fornecedorId } = await requireFornecedor()

  const [kpis, recentOrders, lowStockProducts, chartData] = await Promise.all([
    getKPIs(fornecedorId),
    getRecentOrders(fornecedorId),
    getLowStockProducts(fornecedorId),
    getChartData(fornecedorId),
  ])

  return (
    <div className="space-y-[var(--space-8)]">
      <PageHeader
        title="Dashboard"
        subtitle="Visão geral do seu negócio"
      />

      {/* KPI Cards */}
      <div className="grid gap-[var(--space-4)] md:grid-cols-2 lg:grid-cols-3">
        <KPICard
          title="Total Faturamento"
          value={formatCurrency(kpis.totalFaturamento)}
          subtitle={`${kpis.totalPedidos} pedidos realizados`}
          icon={DollarSign}
          iconColor="text-[hsl(var(--color-success-500))]"
        />
        <KPICard
          title="Total de Pedidos"
          value={kpis.totalPedidos}
          subtitle={`${kpis.pedidosPendentes} pendentes`}
          icon={ShoppingBag}
          iconColor="text-[hsl(var(--color-brand-500))]"
        />
        <KPICard
          title="Ticket Médio"
          value={formatCurrency(kpis.ticketMedio)}
          subtitle="Por pedido"
          icon={TrendingUp}
          iconColor="text-[hsl(var(--color-info-500))]"
        />
        <KPICard
          title="Clientes Ativos"
          value={kpis.clientesAtivos}
          subtitle="Clientes cadastrados"
          icon={Users}
          iconColor="text-[hsl(var(--color-brand-500))]"
        />
        <KPICard
          title="Produtos Ativos"
          value={kpis.produtosAtivos}
          subtitle="No catálogo"
          icon={Package}
          iconColor="text-[hsl(var(--color-neutral-600))]"
        />
        <KPICard
          title="Pedidos Pendentes"
          value={kpis.pedidosPendentes}
          subtitle="Aguardando confirmação"
          icon={AlertTriangle}
          iconColor="text-[hsl(var(--color-warning-500))]"
        />
      </div>

      {/* Recent Orders & Low Stock */}
      <div className="grid gap-[var(--space-6)] md:grid-cols-2">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Pedidos Recentes</CardTitle>
            <CardDescription>Últimos 5 pedidos realizados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-[var(--space-4)]">
              {recentOrders.length === 0 ? (
                <p className="text-[length:var(--text-sm)] text-[hsl(var(--color-neutral-400))] text-center py-[var(--space-6)]">
                  Nenhum pedido encontrado
                </p>
              ) : (
                recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between border-b border-[hsl(var(--color-neutral-100))] pb-[var(--space-3)] last:border-0 last:pb-0"
                  >
                    <div className="space-y-[var(--space-0-5)]">
                      <p className="text-[length:var(--text-sm)] font-medium text-[hsl(var(--color-neutral-800))]">
                        {order.numeroPedido}
                      </p>
                      <p className="text-[length:var(--text-xs)] text-[hsl(var(--color-neutral-500))]">
                        {order.cliente.razaoSocial}
                      </p>
                      <p className="text-[length:var(--text-xs)] text-[hsl(var(--color-neutral-400))]">
                        {formatDate(order.criadoEm)}
                      </p>
                    </div>
                    <div className="text-right space-y-[var(--space-1)]">
                      <p className="text-[length:var(--text-sm)] font-bold text-[hsl(var(--color-neutral-900))]">
                        {formatCurrency(Number(order.total))}
                      </p>
                      <StatusBadge status={order.status} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Alertas de Estoque</CardTitle>
            <CardDescription>Produtos com estoque baixo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-[var(--space-4)]">
              {lowStockProducts.length === 0 ? (
                <p className="text-[length:var(--text-sm)] text-[hsl(var(--color-neutral-400))] text-center py-[var(--space-6)]">
                  Nenhum produto com estoque baixo
                </p>
              ) : (
                lowStockProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between border-b border-[hsl(var(--color-neutral-100))] pb-[var(--space-3)] last:border-0 last:pb-0"
                  >
                    <div className="space-y-[var(--space-0-5)]">
                      <p className="text-[length:var(--text-sm)] font-medium text-[hsl(var(--color-neutral-800))]">
                        {product.nome}
                      </p>
                      <p className="text-[length:var(--text-xs)] text-[hsl(var(--color-neutral-500))]">
                        SKU: {product.sku}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[length:var(--text-sm)] font-bold text-[hsl(var(--color-warning-600))]">
                        {product.quantidadeEstoque} un.
                      </p>
                      <p className="text-[length:var(--text-xs)] text-[hsl(var(--color-neutral-500))]">
                        Mín: {product.estoqueMinimo}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-[var(--space-6)] md:grid-cols-2">
        <DashboardCharts
          ordersByMonth={chartData.ordersByMonth}
          ordersByStatus={chartData.ordersByStatus}
        />
      </div>
    </div>
  )
}
