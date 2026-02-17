import { Card, CardContent } from "@/components/ui/card";
import { Container } from "@/components/layout/container";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Building2, MapPin, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export const dynamic = 'force-dynamic';

async function getFornecedores() {
  return await prisma.fornecedor.findMany({
    where: {
      verificado: true,
      usuario: {
        ativo: true,
      },
    },
    include: {
      usuario: {
        select: {
          nome: true,
        },
      },
      _count: {
        select: {
          produtos: {
            where: {
              ativo: true,
            },
          },
        },
      },
    },
    orderBy: {
      nomeFantasia: "asc",
    },
  });
}

export default async function FornecedoresPage() {
  const fornecedores = await getFornecedores();

  if (fornecedores.length === 0) {
    return (
      <Container className="py-[var(--space-6)] md:py-[var(--space-10)]">
        <div className="mb-[var(--space-6)] md:mb-[var(--space-8)]">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[hsl(var(--color-neutral-900))]">Fornecedores</h1>
          <p className="text-[length:var(--text-sm)] md:text-[length:var(--text-base)] text-[hsl(var(--color-neutral-500))]">
            Conheça os fornecedores parceiros
          </p>
        </div>
        <EmptyState
          icon={Building2}
          title="Nenhum fornecedor disponível"
          description="Em breve teremos fornecedores cadastrados"
        />
      </Container>
    );
  }

  return (
    <Container className="py-[var(--space-6)] md:py-[var(--space-10)]">
      <div className="mb-[var(--space-6)] md:mb-[var(--space-8)]">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[hsl(var(--color-neutral-900))]">Fornecedores</h1>
        <p className="text-[length:var(--text-sm)] md:text-[length:var(--text-base)] text-[hsl(var(--color-neutral-500))]">
          {fornecedores.length} {fornecedores.length === 1 ? "fornecedor disponível" : "fornecedores disponíveis"}
        </p>
      </div>

      <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {fornecedores.map((fornecedor) => (
          <Link key={fornecedor.id} href={`/fornecedor/${fornecedor.slug}`}>
            <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
              {/* Banner */}
              <div className="relative h-28 sm:h-32 bg-gradient-to-r from-[hsl(var(--color-brand-500))] to-[hsl(var(--color-brand-600))]">
                {fornecedor.banner ? (
                  <Image
                    src={fornecedor.banner}
                    alt={fornecedor.nomeFantasia || fornecedor.razaoSocial}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                  />
                ) : null}
                
                {/* Logo */}
                <div className="absolute -bottom-8 sm:-bottom-10 left-4">
                  <div className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-lg border-4 border-white bg-white shadow-lg overflow-hidden">
                    {fornecedor.logo ? (
                      <Image
                        src={fornecedor.logo}
                        alt={fornecedor.nomeFantasia || fornecedor.razaoSocial}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gray-100">
                        <Building2 className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <CardContent className="pt-10 sm:pt-14 space-y-3 sm:space-y-4">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-lg line-clamp-1">
                      {fornecedor.nomeFantasia || fornecedor.razaoSocial}
                    </h3>
                    {fornecedor.verificado && (
                      <Badge variant="success" className="flex-shrink-0 bg-green-100 text-green-800">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Verificado
                      </Badge>
                    )}
                  </div>
                  {fornecedor.nomeFantasia && (
                    <p className="text-sm text-muted-foreground">
                      {fornecedor.razaoSocial}
                    </p>
                  )}
                </div>

                {fornecedor.descricao && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {fornecedor.descricao}
                  </p>
                )}

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

                <div className="pt-2 border-t">
                  <p className="text-sm font-medium">
                    {fornecedor._count.produtos}{" "}
                    {fornecedor._count.produtos === 1 ? "produto" : "produtos"} disponíveis
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </Container>
  );
}
