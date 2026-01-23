import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireCliente } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/status-badge";
import { ShoppingBag, Package, TrendingUp, Clock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface KPI {
  totalPedidos: number;
  pedidosPendentes: number;
  totalGasto: number;
  ticketMedio: number;
}

async function getClienteKPIs(clienteId: string): Promise<KPI> {
  const pedidos = await prisma.pedido.findMany({
    where: { clienteId },
    select: {
      total: true,
      status: true,
    },
  });

  const totalPedidos = pedidos.length;
  const pedidosPendentes = pedidos.filter(p => p.status === "pendente").length;
  const totalGasto = pedidos.reduce((sum, p) => sum + Number(p.total), 0);
  const ticketMedio = totalPedidos > 0 ? totalGasto / totalPedidos : 0;

  return {
    totalPedidos,
    pedidosPendentes,
    totalGasto,
    ticketMedio,
  };
}

async function getRecentOrders(clienteId: string) {
  return await prisma.pedido.findMany({
    where: { clienteId },
    include: {
      fornecedor: {
        select: {
          nomeFantasia: true,
          razaoSocial: true,
        },
      },
    },
    orderBy: { criadoEm: "desc" },
    take: 5,
  });
}

export default async function ClienteDashboard() {
  const { clienteId } = await requireCliente();
  
  const [kpis, recentOrders] = await Promise.all([
    getClienteKPIs(clienteId),
    getRecentOrders(clienteId),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral dos seus pedidos e compras
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.totalPedidos}</div>
            <p className="text-xs text-muted-foreground">
              Pedidos realizados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.pedidosPendentes}</div>
            <p className="text-xs text-muted-foreground">
              Aguardando confirmação
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gasto</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(kpis.totalGasto)}</div>
            <p className="text-xs text-muted-foreground">
              Em todos os pedidos
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
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <Link href="/dashboard/cliente/catalogo">
            <Button className="w-full" variant="default">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Ver Catálogo
            </Button>
          </Link>
          <Link href="/carrinho">
            <Button className="w-full" variant="outline">
              <Package className="mr-2 h-4 w-4" />
              Ver Carrinho
            </Button>
          </Link>
          <Link href="/pedidos">
            <Button className="w-full" variant="outline">
              <Clock className="mr-2 h-4 w-4" />
              Meus Pedidos
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Pedidos Recentes</CardTitle>
            <Link href="/pedidos">
              <Button variant="link" size="sm">
                Ver todos
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhum pedido encontrado. Comece a comprar agora!
            </p>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <Link 
                  key={order.id} 
                  href={`/pedidos/${order.id}`}
                  className="block"
                >
                  <div className="flex items-center justify-between border-b pb-4 last:border-0 hover:bg-gray-50 p-2 rounded transition-colors">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{order.numeroPedido}</p>
                      <p className="text-xs text-muted-foreground">
                        {order.fornecedor.nomeFantasia || order.fornecedor.razaoSocial}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(order.criadoEm)}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-sm font-bold">{formatCurrency(Number(order.total))}</p>
                      <StatusBadge status={order.status} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
