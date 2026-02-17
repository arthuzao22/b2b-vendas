import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Container } from "@/components/layout/container";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PriceDisplay } from "@/components/ui/price-display";
import { Building2, MapPin, CheckCircle2, Package, Mail, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

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
    <Container className="py-[var(--space-6)] md:py-[var(--space-10)]">
      {/* Supplier Header */}
      <Card className="mb-[var(--space-6)] md:mb-[var(--space-8)] overflow-hidden">
        {/* Banner */}
        <div className="relative h-32 sm:h-40 md:h-48 bg-gradient-to-r from-[hsl(var(--color-brand-500))] to-[hsl(var(--color-brand-600))]">
          {fornecedor.banner && (
            <Image
              src={fornecedor.banner}
              alt={fornecedor.nomeFantasia || fornecedor.razaoSocial}
              fill
              sizes="100vw"
              className="object-cover"
            />
          )}
        </div>

        <CardContent className="pt-0">
          <div className="flex flex-col md:flex-row gap-4 md:gap-6 -mt-12 md:-mt-12">
            {/* Logo */}
            <div className="relative h-24 w-24 sm:h-32 sm:w-32 rounded-lg border-4 border-white bg-white shadow-lg overflow-hidden flex-shrink-0">
              {fornecedor.logo ? (
                <Image
                  src={fornecedor.logo}
                  alt={fornecedor.nomeFantasia || fornecedor.razaoSocial}
                  fill
                  sizes="128px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gray-100">
                  <Building2 className="h-12 w-12 text-gray-400" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 pt-2 md:pt-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4 mb-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
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

              <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 md:grid-cols-3">
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
        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-[hsl(var(--color-neutral-900))]">Produtos</h2>
        <p className="text-[length:var(--text-sm)] text-[hsl(var(--color-neutral-500))]">
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
        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {fornecedor.produtos.map((produto) => (
            <Link key={produto.id} href={`/fornecedor/${fornecedor.slug}/produto/${produto.slug}`}>
              <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                <div className="relative h-40 sm:h-48 w-full bg-[hsl(var(--color-neutral-50))]">
                  {produto.imagens[0] ? (
                    <Image
                      src={produto.imagens[0]}
                      alt={produto.nome}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
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
            </Link>
          ))}
        </div>
      )}
    </Container>
  );
}
