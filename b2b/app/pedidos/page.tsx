import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireCliente } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ShoppingBag, Package } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { OrderSearch } from "@/components/orders/order-search";

async function getPedidos(clienteId: string) {
  return await prisma.pedido.findMany({
    where: { clienteId },
    include: {
      fornecedor: {
        select: {
          nomeFantasia: true,
          razaoSocial: true,
        },
      },
      itens: {
        select: {
          id: true,
        },
      },
    },
    orderBy: { criadoEm: "desc" },
  });
}

export default async function PedidosPage() {
  const { clienteId } = await requireCliente();
  const pedidos = await getPedidos(clienteId);

  if (pedidos.length === 0) {
    return (
      <div className="space-y-[var(--space-6)] md:space-y-[var(--space-8)]">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[hsl(var(--color-neutral-900))]">Meus Pedidos</h1>
          <p className="text-[length:var(--text-sm)] md:text-[length:var(--text-base)] text-[hsl(var(--color-neutral-500))]">
            Acompanhe todos os seus pedidos
          </p>
        </div>
        <OrderSearch className="max-w-md" />
        <EmptyState
          icon={ShoppingBag}
          title="Você ainda não fez nenhum pedido"
          description="Comece a comprar agora e acompanhe seus pedidos aqui"
          action={
            <Link href="/dashboard/cliente/catalogo">
              <Button>
                <Package className="mr-2 h-4 w-4" />
                Ver Catálogo
              </Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-[var(--space-6)] md:space-y-[var(--space-8)]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[hsl(var(--color-neutral-900))]">Meus Pedidos</h1>
          <p className="text-[length:var(--text-sm)] md:text-[length:var(--text-base)] text-[hsl(var(--color-neutral-500))]">
            {pedidos.length} {pedidos.length === 1 ? "pedido encontrado" : "pedidos encontrados"}
          </p>
        </div>
        <OrderSearch className="max-w-sm" />
      </div>

      <div className="space-y-3 sm:space-y-4">
        {pedidos.map((pedido) => (
          <Card key={pedido.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="p-4 sm:p-6 pb-3">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
                <div className="space-y-1">
                  <CardTitle className="text-base sm:text-lg">{pedido.numeroPedido}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {pedido.fornecedor.nomeFantasia || pedido.fornecedor.razaoSocial}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Pedido em {formatDate(pedido.criadoEm)}
                  </p>
                </div>
                <StatusBadge status={pedido.status} />
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-[length:var(--text-sm)] text-[hsl(var(--color-neutral-500))]">
                    {pedido.itens.length} {pedido.itens.length === 1 ? "item" : "itens"}
                  </p>
                  <p className="text-xl sm:text-2xl font-bold">{formatCurrency(Number(pedido.total))}</p>
                </div>
                <Link href={`/pedidos/${pedido.id}`} className="self-start sm:self-auto">
                  <Button variant="outline" className="w-full sm:w-auto">Ver Detalhes</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
