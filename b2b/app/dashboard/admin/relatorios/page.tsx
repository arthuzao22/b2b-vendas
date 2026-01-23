import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { requireAdmin } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import {
  BarChart3,
  TrendingUp,
  Package,
  Users,
  ShoppingCart,
  DollarSign,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

async function getRelatorioData() {
  // Get overall stats
  const [
    totalPedidos,
    pedidosPendentes,
    totalProdutos,
    totalFornecedores,
    totalClientes,
    pedidosRecentes,
  ] = await Promise.all([
    prisma.pedido.count(),
    prisma.pedido.count({ where: { status: "pendente" } }),
    prisma.produto.count(),
    prisma.fornecedor.count({ where: { verificado: true } }),
    prisma.cliente.count(),
    prisma.pedido.findMany({
      take: 10,
      orderBy: { criadoEm: "desc" },
      select: {
        total: true,
        status: true,
      },
    }),
  ]);

  // Calculate revenue
  const receitaTotal = pedidosRecentes.reduce(
    (sum, pedido) => sum + Number(pedido.total),
    0
  );

  // Get products by category
  const produtosPorCategoria = await prisma.categoria.findMany({
    select: {
      nome: true,
      _count: {
        select: {
          produtos: true,
        },
      },
    },
    take: 10,
    orderBy: {
      produtos: {
        _count: "desc",
      },
    },
  });

  // Get top suppliers by orders
  const topFornecedores = await prisma.fornecedor.findMany({
    select: {
      razaoSocial: true,
      nomeFantasia: true,
      _count: {
        select: {
          pedidos: true,
        },
      },
    },
    take: 5,
    orderBy: {
      pedidos: {
        _count: "desc",
      },
    },
  });

  return {
    stats: {
      totalPedidos,
      pedidosPendentes,
      totalProdutos,
      totalFornecedores,
      totalClientes,
      receitaTotal,
    },
    produtosPorCategoria,
    topFornecedores,
  };
}

export default async function RelatoriosPage() {
  await requireAdmin();
  const data = await getRelatorioData();

  return (
    <div className="space-y-6">
      <div>
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: "/dashboard/admin" },
            { label: "Relatórios" },
          ]}
        />
        <div className="mt-4">
          <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
          <p className="text-muted-foreground">
            Visão consolidada dos dados do marketplace
          </p>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.totalPedidos}</div>
            <p className="text-xs text-muted-foreground">
              {data.stats.pedidosPendentes} pendentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(data.stats.receitaTotal)}
            </div>
            <p className="text-xs text-muted-foreground">Últimos 10 pedidos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.totalProdutos}</div>
            <p className="text-xs text-muted-foreground">No catálogo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fornecedores</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.totalFornecedores}</div>
            <p className="text-xs text-muted-foreground">Verificados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.totalClientes}</div>
            <p className="text-xs text-muted-foreground">Cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                data.stats.totalPedidos > 0
                  ? data.stats.receitaTotal / data.stats.totalPedidos
                  : 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">Por pedido</p>
          </CardContent>
        </Card>
      </div>

      {/* Category Distribution */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            <CardTitle>Produtos por Categoria</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.produtosPorCategoria.map((categoria) => (
              <div key={categoria.nome} className="flex items-center justify-between">
                <span className="text-sm font-medium">{categoria.nome}</span>
                <div className="flex items-center gap-3">
                  <div className="w-48 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${
                          (categoria._count.produtos / data.stats.totalProdutos) * 100
                        }%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-bold w-12 text-right">
                    {categoria._count.produtos}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Suppliers */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            <CardTitle>Top Fornecedores por Pedidos</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.topFornecedores.map((fornecedor, index) => (
              <div
                key={fornecedor.razaoSocial}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-sm">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium">
                      {fornecedor.nomeFantasia || fornecedor.razaoSocial}
                    </p>
                    {fornecedor.nomeFantasia && (
                      <p className="text-xs text-muted-foreground">
                        {fornecedor.razaoSocial}
                      </p>
                    )}
                  </div>
                </div>
                <span className="text-lg font-bold">{fornecedor._count.pedidos}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle>Exportar Relatórios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
              Exportar para Excel
            </button>
            <button className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
              Exportar para PDF
            </button>
            <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Exportar para CSV
            </button>
          </div>
          <p className="text-sm text-muted-foreground mt-4 text-center">
            Funcionalidade de exportação em desenvolvimento
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
