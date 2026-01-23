import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { requireFornecedor } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { Building2, Mail, Phone, MapPin, FileText, CheckCircle } from "lucide-react";

async function getFornecedor(fornecedorId: string) {
  return await prisma.fornecedor.findUnique({
    where: { id: fornecedorId },
  });
}

export default async function ConfiguracoesPage() {
  const { fornecedorId } = await requireFornecedor();
  const fornecedor = await getFornecedor(fornecedorId);

  if (!fornecedor) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Configurações</h1>
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Fornecedor não encontrado</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: "/dashboard/fornecedor" },
            { label: "Configurações" },
          ]}
        />
        <div className="mt-4">
          <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
          <p className="text-muted-foreground">
            Gerencie as informações da sua empresa
          </p>
        </div>
      </div>

      {/* Company Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            <CardTitle>Informações da Empresa</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Razão Social
              </label>
              <p className="text-base font-medium">{fornecedor.razaoSocial}</p>
            </div>

            {fornecedor.nomeFantasia && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Nome Fantasia
                </label>
                <p className="text-base font-medium">{fornecedor.nomeFantasia}</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                CNPJ
              </label>
              <p className="text-base font-medium">{fornecedor.cnpj}</p>
            </div>
          </div>

          {fornecedor.descricao && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Descrição
              </label>
              <p className="text-base">{fornecedor.descricao}</p>
            </div>
          )}

          <div className="flex items-center gap-2">
            {fornecedor.verificado ? (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Fornecedor Verificado</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-yellow-600">
                <FileText className="h-5 w-5" />
                <span className="font-medium">Aguardando Verificação</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            <CardTitle>Endereço</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            {fornecedor.endereco && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Endereço
                </label>
                <p className="text-base font-medium">{fornecedor.endereco}</p>
              </div>
            )}

            {fornecedor.cidade && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Cidade
                </label>
                <p className="text-base font-medium">{fornecedor.cidade}</p>
              </div>
            )}

            {fornecedor.estado && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Estado
                </label>
                <p className="text-base font-medium">{fornecedor.estado}</p>
              </div>
            )}

            {fornecedor.cep && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  CEP
                </label>
                <p className="text-base font-medium">{fornecedor.cep}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="default" className="flex-1">
              <Building2 className="mr-2 h-4 w-4" />
              Editar Informações
            </Button>
            <Button variant="outline" className="flex-1">
              <FileText className="mr-2 h-4 w-4" />
              Documentação
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-4 text-center">
            Para alterar suas informações cadastrais, entre em contato com o suporte
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
