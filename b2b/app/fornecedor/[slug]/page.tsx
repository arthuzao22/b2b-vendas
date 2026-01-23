import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PriceDisplay } from "@/components/ui/price-display";
import { Building2, MapPin, CheckCircle2, Package, Mail, Phone } from "lucide-react";
import Image from "next/image";

export const dynamic = 'force-dynamic';

async function getFornecedor(slug: string) {
  const fornecedor = await prisma.fornecedor.findUnique({
    where: { slug },
    include: {
      usuario: {
        select: {
          nome: true,
          email: true,
          telefone: true,
        },
      },
      produtos: {
        where: {
          ativo: true,
        },
        orderBy: {
          nome: "asc",
        },
      },
    },
  });

  if (!fornecedor || !fornecedor.verificado) {
    notFound();
  }

  return fornecedor;
}

export default async function FornecedorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const fornecedor = await getFornecedor(slug);

  return (
    <div className="container mx-auto py-8">
      {/* Supplier Header */}
      <Card className="mb-8 overflow-hidden">
        {/* Banner */}
        <div className="relative h-48 bg-gradient-to-r from-blue-500 to-blue-600">
          {fornecedor.banner && (
            <Image
              src={fornecedor.banner}
              alt={fornecedor.nomeFantasia || fornecedor.razaoSocial}
              fill
              className="object-cover"
            />
          )}
        </div>

        <CardContent className="pt-0">
          <div className="flex flex-col md:flex-row gap-6 -mt-16 md:-mt-12">
            {/* Logo */}
            <div className="relative h-32 w-32 rounded-lg border-4 border-white bg-white shadow-lg overflow-hidden flex-shrink-0">
              {fornecedor.logo ? (
                <Image
                  src={fornecedor.logo}
                  alt={fornecedor.nomeFantasia || fornecedor.razaoSocial}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gray-100">
                  <Building2 className="h-12 w-12 text-gray-400" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 pt-4">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold tracking-tight">
                      {fornecedor.nomeFantasia || fornecedor.razaoSocial}
                    </h1>
                    {fornecedor.verificado && (
                      <Badge variant="success" className="bg-green-100 text-green-800">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Verificado
                      </Badge>
                    )}
                  </div>
                  {fornecedor.nomeFantasia && (
                    <p className="text-muted-foreground mb-2">
                      {fornecedor.razaoSocial}
                    </p>
                  )}
                  {fornecedor.descricao && (
                    <p className="text-muted-foreground max-w-3xl">
                      {fornecedor.descricao}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {(fornecedor.cidade || fornecedor.estado) && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {fornecedor.cidade}
                      {fornecedor.cidade && fornecedor.estado && ", "}
                      {fornecedor.estado}
                    </span>
                  </div>
                )}
                {fornecedor.usuario.email && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{fornecedor.usuario.email}</span>
                  </div>
                )}
                {fornecedor.usuario.telefone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{fornecedor.usuario.telefone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Section */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold tracking-tight">Produtos</h2>
        <p className="text-muted-foreground">
          {fornecedor.produtos.length}{" "}
          {fornecedor.produtos.length === 1 ? "produto disponível" : "produtos disponíveis"}
        </p>
      </div>

      {fornecedor.produtos.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Nenhum produto disponível"
          description="Este fornecedor ainda não possui produtos cadastrados"
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {fornecedor.produtos.map((produto) => (
            <Card key={produto.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-48 w-full bg-gray-100">
                {produto.imagens[0] ? (
                  <Image
                    src={produto.imagens[0]}
                    alt={produto.nome}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Package className="h-12 w-12 text-gray-400" />
                  </div>
                )}
              </div>

              <CardContent className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold line-clamp-2 mb-1">
                    {produto.nome}
                  </h3>
                  <p className="text-xs text-muted-foreground">SKU: {produto.sku}</p>
                </div>

                {produto.descricao && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {produto.descricao}
                  </p>
                )}

                <div className="flex items-center justify-between pt-2 border-t">
                  <PriceDisplay value={Number(produto.precoBase)} size="md" />
                  <p className="text-xs text-muted-foreground">
                    {produto.quantidadeEstoque > 0
                      ? `${produto.quantidadeEstoque} disponíveis`
                      : "Sem estoque"}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
