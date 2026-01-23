import { Card, CardContent } from "@/components/ui/card";
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
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Fornecedores</h1>
          <p className="text-muted-foreground">
            Conheça os fornecedores parceiros
          </p>
        </div>
        <EmptyState
          icon={Building2}
          title="Nenhum fornecedor disponível"
          description="Em breve teremos fornecedores cadastrados"
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Fornecedores</h1>
        <p className="text-muted-foreground">
          {fornecedores.length} {fornecedores.length === 1 ? "fornecedor disponível" : "fornecedores disponíveis"}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {fornecedores.map((fornecedor) => (
          <Link key={fornecedor.id} href={`/fornecedor/${fornecedor.slug}`}>
            <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
              {/* Banner */}
              <div className="relative h-32 bg-gradient-to-r from-blue-500 to-blue-600">
                {fornecedor.banner ? (
                  <Image
                    src={fornecedor.banner}
                    alt={fornecedor.nomeFantasia || fornecedor.razaoSocial}
                    fill
                    className="object-cover"
                  />
                ) : null}
                
                {/* Logo */}
                <div className="absolute -bottom-10 left-4">
                  <div className="relative h-20 w-20 rounded-lg border-4 border-white bg-white shadow-lg overflow-hidden">
                    {fornecedor.logo ? (
                      <Image
                        src={fornecedor.logo}
                        alt={fornecedor.nomeFantasia || fornecedor.razaoSocial}
                        fill
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

              <CardContent className="pt-14 space-y-4">
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
    </div>
  );
}
