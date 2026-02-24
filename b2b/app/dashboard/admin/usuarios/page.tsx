import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, Column } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { requireAdmin } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { Users, UserCheck, UserX, Shield } from "lucide-react";
import { TipoUsuario } from "@prisma/client";

interface Usuario {
  id: string;
  nome: string;
  email: string;
  tipo: TipoUsuario;
  ativo: boolean;
  criadoEm: Date;
  fornecedor?: {
    id: string;
    razaoSocial: string;
  } | null;
  cliente?: {
    id: string;
    razaoSocial: string;
  } | null;
}

async function getUsuarios() {
  return await prisma.usuario.findMany({
    include: {
      fornecedor: {
        select: {
          id: true,
          razaoSocial: true,
        },
      },
      cliente: {
        select: {
          id: true,
          razaoSocial: true,
        },
      },
    },
    orderBy: {
      criadoEm: "desc",
    },
  });
}

async function getUsuarioStats() {
  const [total, ativos, inativos, admins, fornecedores, clientes] = await Promise.all([
    prisma.usuario.count(),
    prisma.usuario.count({ where: { ativo: true } }),
    prisma.usuario.count({ where: { ativo: false } }),
    prisma.usuario.count({ where: { tipo: "admin" } }),
    prisma.usuario.count({ where: { tipo: "fornecedor" } }),
    prisma.usuario.count({ where: { tipo: "cliente" } }),
  ]);

  return { total, ativos, inativos, admins, fornecedores, clientes };
}

export default async function UsuariosPage() {
  await requireAdmin();
  const [usuarios, stats] = await Promise.all([getUsuarios(), getUsuarioStats()]);

  const columns: Column<Usuario>[] = [
    {
      key: "nome",
      label: "Nome",
      sortable: true,
      render: (usuario) => (
        <div>
          <p className="font-medium">{usuario.nome}</p>
          <p className="text-xs text-muted-foreground">{usuario.email}</p>
        </div>
      ),
    },
    {
      key: "tipo",
      label: "Tipo",
      render: (usuario) => (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
          {usuario.tipo}
        </span>
      ),
    },
    {
      key: "empresa",
      label: "Empresa",
      render: (usuario) => (
        <span className="text-sm">
          {usuario.fornecedor?.razaoSocial || usuario.cliente?.razaoSocial || "-"}
        </span>
      ),
    },
    {
      key: "criadoEm",
      label: "Cadastro",
      sortable: true,
      render: (usuario) => (
        <span className="text-sm">{formatDate(usuario.criadoEm)}</span>
      ),
    },
    {
      key: "ativo",
      label: "Status",
      render: (usuario) => (
        <span
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            usuario.ativo
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {usuario.ativo ? "Ativo" : "Inativo"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: "/dashboard/admin" },
            { label: "Usuários" },
          ]}
        />
        <div className="mt-4">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Gestão de Usuários</h1>
          <p className="text-muted-foreground">
            Gerencie todos os usuários da plataforma
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ativos</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.ativos}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inativos</CardTitle>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.inativos}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administradores</CardTitle>
            <Shield className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.admins}</div>
          </CardContent>
        </Card>
      </div>

      {/* User Type Distribution */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Fornecedores</span>
                <span className="text-2xl font-bold">{stats.fornecedores}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Clientes</span>
                <span className="text-2xl font-bold">{stats.clientes}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Administradores</span>
                <span className="text-2xl font-bold">{stats.admins}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-green-600">Ativos</span>
                <span className="text-2xl font-bold text-green-600">{stats.ativos}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-red-600">Inativos</span>
                <span className="text-2xl font-bold text-red-600">{stats.inativos}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Todos os Usuários</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={usuarios}
            columns={columns}
            keyExtractor={(user) => user.id}
            searchable
            searchPlaceholder="Buscar usuários..."
            emptyMessage="Nenhum usuário encontrado"
          />
        </CardContent>
      </Card>
    </div>
  );
}
