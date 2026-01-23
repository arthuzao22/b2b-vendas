import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, Column } from "@/components/ui/data-table";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { requireAdmin } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { Building2, CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";

interface Fornecedor {
  id: string;
  razaoSocial: string;
  nomeFantasia?: string | null;
  cnpj: string;
  verificado: boolean;
  criadoEm: Date;
  _count?: {
    produtos: number;
    pedidos: number;
  };
}

async function getFornecedores() {
  return await prisma.fornecedor.findMany({
    include: {
      _count: {
        select: {
          produtos: true,
          pedidos: true,
        },
      },
    },
    orderBy: {
      criadoEm: "desc",
    },
  });
}

async function getFornecedorStats() {
  const [total, verificados, pendentes] = await Promise.all([
    prisma.fornecedor.count(),
    prisma.fornecedor.count({ where: { verificado: true } }),
    prisma.fornecedor.count({ where: { verificado: false } }),
  ]);

  return { total, verificados, pendentes, ativos: verificados };
}

export default async function FornecedoresPage() {
  await requireAdmin();
  const [fornecedores, stats] = await Promise.all([
    getFornecedores(),
    getFornecedorStats(),
  ]);

  const columns: Column<Fornecedor>[] = [
    {
      key: "razaoSocial",
      label: "Empresa",
      sortable: true,
      render: (fornecedor) => (
        <div>
          <p className="font-medium">{fornecedor.razaoSocial}</p>
          {fornecedor.nomeFantasia && (
            <p className="text-xs text-muted-foreground">{fornecedor.nomeFantasia}</p>
          )}
        </div>
      ),
    },
    {
      key: "cnpj",
      label: "CNPJ",
      render: (fornecedor) => (
        <span className="text-sm font-mono">{fornecedor.cnpj}</span>
      ),
    },
    {
      key: "_count",
      label: "Produtos/Pedidos",
      render: (fornecedor) => (
        <div className="text-sm">
          <p>{fornecedor._count?.produtos || 0} produtos</p>
          <p className="text-muted-foreground">{fornecedor._count?.pedidos || 0} pedidos</p>
        </div>
      ),
    },
    {
      key: "verificado",
      label: "Status",
      render: (fornecedor) => (
        <div className="flex items-center gap-1">
          {fornecedor.verificado ? (
            <>
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-600">Verificado</span>
            </>
          ) : (
            <>
              <Clock className="h-4 w-4 text-yellow-600" />
              <span className="text-sm text-yellow-600">Pendente</span>
            </>
          )}
        </div>
      ),
    },
    {
      key: "criadoEm",
      label: "Cadastro",
      sortable: true,
      render: (fornecedor) => (
        <span className="text-sm">{formatDate(fornecedor.criadoEm)}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: "/dashboard/admin" },
            { label: "Fornecedores" },
          ]}
        />
        <div className="mt-4">
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Fornecedores</h1>
          <p className="text-muted-foreground">
            Gerencie e aprove fornecedores da plataforma
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verificados</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.verificados}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pendentes}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ativos</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.ativos}</div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Approvals Alert */}
      {stats.pendentes > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="flex items-center gap-3 p-4">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="font-medium text-yellow-900">
                {stats.pendentes} fornecedor{stats.pendentes > 1 ? "es" : ""} aguardando
                verificação
              </p>
              <p className="text-sm text-yellow-700">
                Revise e aprove os cadastros pendentes
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Suppliers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Todos os Fornecedores</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={fornecedores}
            columns={columns}
            keyExtractor={(fornecedor) => fornecedor.id}
            searchable
            searchPlaceholder="Buscar fornecedores..."
            emptyMessage="Nenhum fornecedor encontrado"
          />
        </CardContent>
      </Card>
    </div>
  );
}
