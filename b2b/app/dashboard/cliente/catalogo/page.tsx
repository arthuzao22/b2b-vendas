"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PriceDisplay } from "@/components/ui/price-display";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingSkeleton, CardSkeleton } from "@/components/ui/loading-skeleton";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { useCart } from "@/hooks/useCart";
import { Search, Package, ShoppingCart, Tag, Store } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface Produto {
  id: string;
  nome: string;
  slug: string;
  sku: string;
  descricao: string | null;
  precoBase: string;
  precoFinal: string;
  tipoPreco: "base" | "customizado" | "lista";
  imagens: string[];
  quantidadeEstoque: number;
  fornecedor: {
    id: string;
    slug: string;
    nomeFantasia: string | null;
    razaoSocial: string;
  };
  categoria: {
    id: string;
    nome: string;
    slug: string;
  } | null;
}

interface ProdutosPorFornecedor {
  fornecedor: {
    id: string;
    slug: string;
    nome: string;
  };
  produtos: Produto[];
}

export default function CatalogoClientePage() {
  const { addToCart, hasItem } = useCart();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"all" | "byFornecedor">("all");

  useEffect(() => {
    fetchProdutos();
  }, []);

  const fetchProdutos = async () => {
    try {
      // Usa a nova API de catálogo que calcula preços personalizados
      const response = await fetch("/api/catalogo?limit=100");
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const produtosData = Array.isArray(data.data?.produtos)
            ? data.data.produtos
            : [];
          setProdutos(produtosData);
        }
      }
    } catch (error) {
      console.error("Error fetching produtos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (produto: Produto) => {
    const result = await addToCart({
      id: produto.id,
      nome: produto.nome,
      sku: produto.sku,
      preco: parseFloat(produto.precoFinal),
      fornecedorId: produto.fornecedor.id,
      fornecedorNome: produto.fornecedor.nomeFantasia || produto.fornecedor.razaoSocial,
      estoqueDisponivel: produto.quantidadeEstoque,
      imagemUrl: produto.imagens[0],
    });

    if (!result.success) {
      alert(result.error);
    }
  };

  const filteredProdutos = produtos.filter((produto) =>
    produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    produto.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (produto.fornecedor.nomeFantasia || produto.fornecedor.razaoSocial)
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  // Agrupar por fornecedor
  const produtosPorFornecedor = filteredProdutos.reduce<ProdutosPorFornecedor[]>((acc, produto) => {
    const fornecedorId = produto.fornecedor.id;
    const existing = acc.find((item) => item.fornecedor.id === fornecedorId);

    if (existing) {
      existing.produtos.push(produto);
    } else {
      acc.push({
        fornecedor: {
          id: fornecedorId,
          slug: produto.fornecedor.slug,
          nome: produto.fornecedor.nomeFantasia || produto.fornecedor.razaoSocial,
        },
        produtos: [produto],
      });
    }

    return acc;
  }, []);

  const getTipoPrecoLabel = (tipo: string) => {
    switch (tipo) {
      case "customizado": return "Preço Especial";
      case "lista": return "Preço de Lista";
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: "/dashboard/cliente" },
            { label: "Catálogo" },
          ]}
        />
        <div className="mb-8">
          <LoadingSkeleton className="h-8 w-64 mb-2" />
          <LoadingSkeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: "/dashboard/cliente" },
            { label: "Catálogo" },
          ]}
        />
        <div className="mt-4">
          <h1 className="text-3xl font-bold tracking-tight">Catálogo de Produtos</h1>
          <p className="text-muted-foreground">
            Confira os produtos disponíveis com seus preços personalizados
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar produtos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("all")}
          >
            <Package className="mr-2 h-4 w-4" />
            Todos
          </Button>
          <Button
            variant={viewMode === "byFornecedor" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("byFornecedor")}
          >
            <Store className="mr-2 h-4 w-4" />
            Por Fornecedor
          </Button>
        </div>
      </div>

      {filteredProdutos.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Nenhum produto encontrado"
          description={searchTerm ? "Tente buscar com outros termos" : "Não há produtos disponíveis no momento"}
        />
      ) : viewMode === "byFornecedor" ? (
        // View by Fornecedor
        <div className="space-y-10">
          {produtosPorFornecedor.map((grupo) => (
            <div key={grupo.fornecedor.id}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Store className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">{grupo.fornecedor.nome}</h2>
                    <p className="text-sm text-muted-foreground">
                      {grupo.produtos.length} produtos
                    </p>
                  </div>
                </div>
                <Link href={`/fornecedor/${grupo.fornecedor.slug}`}>
                  <Button variant="outline" size="sm">Ver Fornecedor</Button>
                </Link>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {grupo.produtos.map((produto) => (
                  <ProductCard
                    key={produto.id}
                    produto={produto}
                    onAddToCart={() => handleAddToCart(produto)}
                    isInCart={hasItem(produto.id)}
                    getTipoPrecoLabel={getTipoPrecoLabel}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // View All
        <>
          <p className="text-sm text-muted-foreground">
            {filteredProdutos.length} {filteredProdutos.length === 1 ? "produto" : "produtos"}
          </p>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProdutos.map((produto) => (
              <ProductCard
                key={produto.id}
                produto={produto}
                onAddToCart={() => handleAddToCart(produto)}
                isInCart={hasItem(produto.id)}
                getTipoPrecoLabel={getTipoPrecoLabel}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function ProductCard({
  produto,
  onAddToCart,
  isInCart,
  getTipoPrecoLabel,
}: {
  produto: Produto;
  onAddToCart: () => void;
  isInCart: boolean;
  getTipoPrecoLabel: (tipo: string) => string | null;
}) {
  const precoBase = parseFloat(produto.precoBase);
  const precoFinal = parseFloat(produto.precoFinal);
  const temDesconto = precoFinal < precoBase;
  const tipoPrecoLabel = getTipoPrecoLabel(produto.tipoPreco);

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
      <Link href={`/fornecedor/${produto.fornecedor.slug}`}>
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
          {tipoPrecoLabel && (
            <div className="absolute top-2 left-2">
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <Tag className="h-3 w-3" />
                {tipoPrecoLabel}
              </span>
            </div>
          )}
        </div>
      </Link>

      <CardContent className="p-4 space-y-3 flex-1 flex flex-col">
        <div>
          <h3 className="font-semibold line-clamp-2 mb-1">{produto.nome}</h3>
          <p className="text-xs text-muted-foreground">SKU: {produto.sku}</p>
          <p className="text-xs text-muted-foreground">
            {produto.fornecedor.nomeFantasia || produto.fornecedor.razaoSocial}
          </p>
        </div>

        {produto.descricao && (
          <p className="text-sm text-muted-foreground line-clamp-2">{produto.descricao}</p>
        )}

        <div className="flex items-center justify-between pt-2 border-t">
          <div>
            {temDesconto && (
              <p className="text-xs text-muted-foreground line-through">
                R$ {precoBase.toFixed(2)}
              </p>
            )}
            <PriceDisplay
              value={precoFinal}
              size="md"
              className={temDesconto ? "text-green-600" : ""}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {produto.quantidadeEstoque > 0 ? `${produto.quantidadeEstoque} em estoque` : "Sem estoque"}
          </p>
        </div>

        <div className="mt-auto pt-2">
          <Button
            className="w-full"
            onClick={onAddToCart}
            disabled={produto.quantidadeEstoque === 0 || isInCart}
          >
            {isInCart ? (
              "No Carrinho"
            ) : (
              <>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Adicionar
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
