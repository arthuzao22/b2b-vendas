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
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meus Pedidos</h1>
          <p className="text-muted-foreground">
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
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meus Pedidos</h1>
          <p className="text-muted-foreground">
            {pedidos.length} {pedidos.length === 1 ? "pedido encontrado" : "pedidos encontrados"}
          </p>
        </div>
        <OrderSearch className="max-w-sm" />
      </div>

      <div className="space-y-4">
        {pedidos.map((pedido) => (
          <Card key={pedido.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{pedido.numeroPedido}</CardTitle>
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
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    {pedido.itens.length} {pedido.itens.length === 1 ? "item" : "itens"}
                  </p>
                  <p className="text-2xl font-bold">{formatCurrency(Number(pedido.total))}</p>
                </div>
                <Link href={`/pedidos/${pedido.id}`}>
                  <Button variant="outline">Ver Detalhes</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
