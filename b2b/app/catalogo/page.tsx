"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PriceDisplay } from "@/components/ui/price-display";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingSkeleton, CardSkeleton } from "@/components/ui/loading-skeleton";
import { useCart } from "@/hooks/useCart";
import { Search, Package, ShoppingCart, Filter } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface Produto {
  id: string;
  nome: string;
  sku: string;
  descricao: string | null;
  precoBase: number;
  imagens: string[];
  quantidadeEstoque: number;
  categoria: {
    id: string;
    nome: string;
    slug: string;
  } | null;
  fornecedor: {
    id: string;
    slug: string;
    nomeFantasia: string | null;
    razaoSocial: string;
  };
}

interface Categoria {
  id: string;
  nome: string;
  slug: string;
}

export default function CatalogoPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { addToCart, hasItem } = useCart();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoria, setSelectedCategoria] = useState<string>("");

  const isLoggedIn = status === "authenticated" && session?.user;
  const isCliente = isLoggedIn && session.user.tipo === "cliente";

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login?callbackUrl=/catalogo");
    }
  }, [status, router]);

  useEffect(() => {
    if (isLoggedIn) {
      fetchProdutos();
      fetchCategorias();
    }
  }, [isLoggedIn]);

  const fetchProdutos = async () => {
    try {
      const response = await fetch("/api/produtos");
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const produtosData = Array.isArray(data.data)
            ? data.data
            : data.data?.produtos || [];
          setProdutos(produtosData);
        }
      }
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategorias = async () => {
    try {
      const response = await fetch("/api/categorias");
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const categoriasData = Array.isArray(data.data)
            ? data.data
            : data.data?.categorias || [];
          setCategorias(categoriasData);
        }
      }
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
    }
  };

  const handleAddToCart = async (produto: Produto) => {
    if (!isCliente) {
      alert("Apenas clientes podem adicionar produtos ao carrinho");
      return;
    }

    const result = await addToCart({
      id: produto.id,
      nome: produto.nome,
      sku: produto.sku,
      preco: Number(produto.precoBase),
      fornecedorId: produto.fornecedor.id,
      fornecedorNome: produto.fornecedor.nomeFantasia || produto.fornecedor.razaoSocial,
      estoqueDisponivel: produto.quantidadeEstoque,
      imagemUrl: produto.imagens[0],
    });

    if (!result.success) {
      alert(result.error);
    }
  };

  const filteredProdutos = produtos.filter((produto) => {
    const matchesSearch =
      produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      produto.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (produto.fornecedor.nomeFantasia || produto.fornecedor.razaoSocial)
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesCategoria =
      !selectedCategoria || produto.categoria?.id === selectedCategoria;

    return matchesSearch && matchesCategoria;
  });

  if (status === "loading" || loading) {
    return (
      <Container className="py-[var(--space-6)] md:py-[var(--space-10)]">
        <div className="mb-[var(--space-6)] md:mb-[var(--space-8)]">
          <LoadingSkeleton className="h-8 w-48 sm:w-64 mb-2" />
          <LoadingSkeleton className="h-4 w-64 sm:w-96" />
        </div>
        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </Container>
    );
  }

  if (!isLoggedIn) {
    return null;
  }

  return (
    <Container className="py-[var(--space-6)] md:py-[var(--space-10)]">
      <div className="mb-[var(--space-6)] md:mb-[var(--space-8)]">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[hsl(var(--color-neutral-900))]">Catálogo de Produtos</h1>
        <p className="text-[length:var(--text-sm)] md:text-[length:var(--text-base)] text-[hsl(var(--color-neutral-500))]">
          Explore e adicione produtos ao seu carrinho
        </p>
      </div>

      <div className="mb-[var(--space-4)] md:mb-[var(--space-6)] flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar produtos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {categorias.length > 0 && (
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={selectedCategoria}
              onChange={(e) => setSelectedCategoria(e.target.value)}
              className="h-10 px-3 py-2 rounded-md border border-input bg-background text-sm"
            >
              <option value="">Todas as categorias</option>
              {categorias.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nome}
                </option>
              ))}
            </select>
          </div>
        )}

        {isCliente && (
          <Link href="/carrinho">
            <Button>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Ver Carrinho
            </Button>
          </Link>
        )}
      </div>

      {filteredProdutos.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Nenhum produto encontrado"
          description={
            searchTerm || selectedCategoria
              ? "Tente ajustar os filtros de busca"
              : "Não há produtos disponíveis no momento"
          }
        />
      ) : (
        <>
          <p className="mb-[var(--space-4)] md:mb-[var(--space-6)] text-[length:var(--text-sm)] text-[hsl(var(--color-neutral-500))]">
            {filteredProdutos.length}{" "}
            {filteredProdutos.length === 1 ? "produto encontrado" : "produtos encontrados"}
          </p>

          <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProdutos.map((produto) => (
              <Card
                key={produto.id}
                className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col"
              >
                <Link href={`/fornecedor/${produto.fornecedor.slug}`}>
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
                    {produto.categoria && (
                      <div className="absolute top-2 right-2">
                        <span className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium">
                          {produto.categoria.nome}
                        </span>
                      </div>
                    )}
                  </div>
                </Link>

                <CardContent className="p-4 space-y-3 flex-1 flex flex-col">
                  <div>
                    <Link href={`/fornecedor/${produto.fornecedor.slug}`}>
                      <h3 className="font-semibold line-clamp-2 mb-1 hover:text-primary">
                        {produto.nome}
                      </h3>
                    </Link>
                    <p className="text-xs text-muted-foreground">SKU: {produto.sku}</p>
                    <p className="text-xs text-muted-foreground">
                      {produto.fornecedor.nomeFantasia || produto.fornecedor.razaoSocial}
                    </p>
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
                        ? `${produto.quantidadeEstoque} em estoque`
                        : "Sem estoque"}
                    </p>
                  </div>

                  {isCliente && (
                    <div className="mt-auto pt-2">
                      <Button
                        className="w-full"
                        onClick={() => handleAddToCart(produto)}
                        disabled={produto.quantidadeEstoque === 0 || hasItem(produto.id)}
                      >
                        {hasItem(produto.id) ? (
                          "No Carrinho"
                        ) : (
                          <>
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            Adicionar ao Carrinho
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </Container>
  );
}
