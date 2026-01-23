import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireCliente } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/status-badge";
import { PriceDisplay } from "@/components/ui/price-display";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Truck } from "lucide-react";
import Link from "next/link";

async function getPedido(id: string, clienteId: string) {
  const pedido = await prisma.pedido.findFirst({
    where: {
      id,
      clienteId,
    },
    include: {
      fornecedor: {
        select: {
          nomeFantasia: true,
          razaoSocial: true,
        },
      },
      cliente: {
        select: {
          razaoSocial: true,
          nomeFantasia: true,
          endereco: true,
          cidade: true,
          estado: true,
          cep: true,
        },
      },
      itens: {
        include: {
          produto: {
            select: {
              nome: true,
              sku: true,
              imagens: true,
            },
          },
        },
      },
      historicoStatus: {
        orderBy: {
          criadoEm: "desc",
        },
      },
    },
  });

  if (!pedido) {
    notFound();
  }

  return pedido;
}

export default async function PedidoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { clienteId } = await requireCliente();
  const pedido = await getPedido(id, clienteId);

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/pedidos">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </Link>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{pedido.numeroPedido}</h1>
          <p className="text-muted-foreground">
            Pedido realizado em {formatDate(pedido.criadoEm)}
          </p>
        </div>
        <StatusBadge status={pedido.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Itens do Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {pedido.itens.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center border-b pb-4 last:border-0"
                >
                  <div className="flex-1">
                    <h4 className="font-medium">{item.produto.nome}</h4>
                    <p className="text-sm text-muted-foreground">
                      SKU: {item.produto.sku}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Quantidade: {item.quantidade} x {formatCurrency(Number(item.precoUnitario))}
                    </p>
                  </div>
                  <PriceDisplay
                    value={Number(item.precoUnitario) * item.quantidade}
                    size="md"
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Order History */}
          <Card>
            <CardHeader>
              <CardTitle>Histórico do Pedido</CardTitle>
            </CardHeader>
            <CardContent>
              {pedido.historicoStatus.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhum histórico disponível
                </p>
              ) : (
                <div className="space-y-4">
                  {pedido.historicoStatus.map((hist) => (
                    <div key={hist.id} className="flex gap-4">
                      <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-primary" />
                      <div className="flex-1">
                        <p className="font-medium">
                          <StatusBadge status={hist.status} />
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatDateTime(hist.criadoEm)}
                        </p>
                        {hist.observacao && (
                          <p className="text-sm mt-1">{hist.observacao}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tracking Information */}
          {pedido.codigoRastreio && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Rastreamento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Código de rastreio:</span>
                  <span className="text-sm font-medium">
                    {pedido.codigoRastreio}
                  </span>
                </div>
                {pedido.previsaoEntrega && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Previsão de entrega:</span>
                    <span className="text-sm font-medium">
                      {formatDate(pedido.previsaoEntrega)}
                    </span>
                  </div>
                )}
                {pedido.dataEntrega && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Data de entrega:</span>
                    <span className="text-sm font-medium">
                      {formatDate(pedido.dataEntrega)}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Resumo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <PriceDisplay value={Number(pedido.subtotal)} size="sm" />
                </div>
                {Number(pedido.desconto) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Desconto</span>
                    <PriceDisplay value={Number(pedido.desconto)} size="sm" />
                  </div>
                )}
                {Number(pedido.frete) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Frete</span>
                    <PriceDisplay value={Number(pedido.frete)} size="sm" />
                  </div>
                )}
                <div className="border-t pt-2">
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <PriceDisplay value={Number(pedido.total)} size="lg" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Supplier Information */}
          <Card>
            <CardHeader>
              <CardTitle>Fornecedor</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="font-medium">
                {pedido.fornecedor.nomeFantasia || pedido.fornecedor.razaoSocial}
              </p>
            </CardContent>
          </Card>

          {/* Delivery Address */}
          <Card>
            <CardHeader>
              <CardTitle>Endereço de Entrega</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <p className="font-medium">
                {pedido.cliente.nomeFantasia || pedido.cliente.razaoSocial}
              </p>
              {(pedido.enderecoEntrega || pedido.cliente.endereco) && (
                <p className="text-sm text-muted-foreground">
                  {pedido.enderecoEntrega || pedido.cliente.endereco}
                </p>
              )}
              {(pedido.cidadeEntrega || pedido.cliente.cidade) && 
               (pedido.estadoEntrega || pedido.cliente.estado) && (
                <p className="text-sm text-muted-foreground">
                  {pedido.cidadeEntrega || pedido.cliente.cidade} - {pedido.estadoEntrega || pedido.cliente.estado}
                </p>
              )}
              {(pedido.cepEntrega || pedido.cliente.cep) && (
                <p className="text-sm text-muted-foreground">
                  CEP: {pedido.cepEntrega || pedido.cliente.cep}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
