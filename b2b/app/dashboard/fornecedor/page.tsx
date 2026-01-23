import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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

const statusColors: Record<string, "default" | "success" | "warning" | "destructive"> = {
  pendente: "warning",
  confirmado: "default",
  em_preparacao: "default",
  enviado: "default",
  entregue: "success",
  cancelado: "destructive",
}

const statusLabels: Record<string, string> = {
  pendente: "Pendente",
  confirmado: "Confirmado",
  em_preparacao: "Em Preparação",
  enviado: "Enviado",
  entregue: "Entregue",
  cancelado: "Cancelado",
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
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral do seu negócio
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Faturamento</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(kpis.totalFaturamento)}</div>
            <p className="text-xs text-muted-foreground">
              {kpis.totalPedidos} pedidos realizados
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
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(kpis.ticketMedio)}</div>
            <p className="text-xs text-muted-foreground">
              Por pedido
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.clientesAtivos}</div>
            <p className="text-xs text-muted-foreground">
              Clientes cadastrados
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
              No catálogo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos Pendentes</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.pedidosPendentes}</div>
            <p className="text-xs text-muted-foreground">
              Aguardando confirmação
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders & Low Stock */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Pedidos Recentes</CardTitle>
            <CardDescription>Últimos 5 pedidos realizados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum pedido encontrado
                </p>
              ) : (
                recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{order.numeroPedido}</p>
                      <p className="text-xs text-muted-foreground">
                        {order.cliente.razaoSocial}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(order.criadoEm)}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-sm font-bold">{formatCurrency(Number(order.total))}</p>
                      <Badge variant={statusColors[order.status] || "default"}>
                        {statusLabels[order.status] || order.status}
                      </Badge>
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
            <div className="space-y-4">
              {lowStockProducts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum produto com estoque baixo
                </p>
              ) : (
                lowStockProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{product.nome}</p>
                      <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-yellow-600">
                        {product.quantidadeEstoque} un.
                      </p>
                      <p className="text-xs text-muted-foreground">
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
      <div className="grid gap-4 md:grid-cols-2">
        <DashboardCharts 
          ordersByMonth={chartData.ordersByMonth}
          ordersByStatus={chartData.ordersByStatus}
        />
      </div>
    </div>
  )
}
