import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
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

export default async function ClienteDashboard() {
  const { clienteId } = await requireCliente();

  const [kpis, recentOrders] = await Promise.all([
    getClienteKPIs(clienteId),
    getRecentOrders(clienteId),
  ]);

  return (
    <div className="space-y-[var(--space-8)]">
      <PageHeader
        title="Dashboard"
        subtitle="Visão geral dos seus pedidos e compras"
      />

      {/* KPI Cards */}
      <div className="grid gap-[var(--space-4)] md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total de Pedidos"
          value={kpis.totalPedidos}
          subtitle="Pedidos realizados"
          icon={ShoppingBag}
          iconColor="text-[hsl(var(--color-brand-500))]"
        />
        <KPICard
          title="Pedidos Pendentes"
          value={kpis.pedidosPendentes}
          subtitle="Aguardando confirmação"
          icon={Clock}
          iconColor="text-[hsl(var(--color-warning-500))]"
        />
        <KPICard
          title="Total Gasto"
          value={formatCurrency(kpis.totalGasto)}
          subtitle="Em todos os pedidos"
          icon={Package}
          iconColor="text-[hsl(var(--color-success-500))]"
        />
        <KPICard
          title="Ticket Médio"
          value={formatCurrency(kpis.ticketMedio)}
          subtitle="Por pedido"
          icon={TrendingUp}
          iconColor="text-[hsl(var(--color-info-500))]"
        />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-[var(--space-4)] md:grid-cols-3">
          <Button className="w-full" asChild>
            <Link href="/dashboard/cliente/catalogo">
              <ShoppingBag className="mr-2" />
              Ver Catálogo
            </Link>
          </Button>
          <Button className="w-full" variant="secondary" asChild>
            <Link href="/carrinho">
              <Package className="mr-2" />
              Ver Carrinho
            </Link>
          </Button>
          <Button className="w-full" variant="secondary" asChild>
            <Link href="/pedidos">
              <Clock className="mr-2" />
              Meus Pedidos
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Pedidos Recentes</CardTitle>
            <Button variant="link" size="sm" asChild>
              <Link href="/pedidos">Ver todos</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <p className="text-center text-[hsl(var(--color-neutral-400))] py-[var(--space-8)] text-[length:var(--text-sm)]">
              Nenhum pedido encontrado. Comece a comprar agora!
            </p>
          ) : (
            <div className="space-y-[var(--space-1)]">
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/pedidos/${order.id}`}
                  className="block no-underline"
                >
                  <div className="flex items-center justify-between border-b border-[hsl(var(--color-neutral-100))] p-[var(--space-3)] rounded-[var(--radius-md)] transition-colors duration-[var(--transition-fast)] hover:bg-[hsl(var(--color-neutral-25))] last:border-0">
                    <div className="space-y-[var(--space-0-5)]">
                      <p className="text-[length:var(--text-sm)] font-medium text-[hsl(var(--color-neutral-800))]">
                        {order.numeroPedido}
                      </p>
                      <p className="text-[length:var(--text-xs)] text-[hsl(var(--color-neutral-500))]">
                        {order.fornecedor.nomeFantasia || order.fornecedor.razaoSocial}
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
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
