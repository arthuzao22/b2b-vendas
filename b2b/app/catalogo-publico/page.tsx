"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PriceDisplay } from "@/components/ui/price-display";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingSkeleton, CardSkeleton } from "@/components/ui/loading-skeleton";
import { useCart } from "@/hooks/useCart";
import { Search, Package, ShoppingCart, LogIn } from "lucide-react";
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
  fornecedor: {
    id: string;
    slug: string;
    nomeFantasia: string | null;
    razaoSocial: string;
  };
}

export default function CatalogoPublicoPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { addToCart, hasItem } = useCart();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const isLoggedIn = status === "authenticated" && session?.user;
  const isCliente = isLoggedIn && session.user.tipo === "cliente";

  useEffect(() => {
    fetchProdutos();
  }, []);

  const fetchProdutos = async () => {
    try {
      const response = await fetch("/api/produtos");
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // API pode retornar array direto ou objeto com produtos
          const produtosData = Array.isArray(data.data)
            ? data.data
            : data.data?.produtos || [];
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
    if (!isLoggedIn) {
      // Redirecionar para login se não estiver logado
      router.push("/auth/login?callbackUrl=/catalogo-publico");
      return;
    }

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

  const filteredProdutos = produtos.filter((produto) =>
    produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    produto.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (produto.fornecedor.nomeFantasia || produto.fornecedor.razaoSocial)
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="container mx-auto py-8">
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
    <div className="container mx-auto py-8">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Catálogo Público</h1>
          <p className="text-muted-foreground">
            Explore nosso catálogo de produtos
          </p>
        </div>

        {!isLoggedIn && (
          <Link href="/auth/login?callbackUrl=/catalogo-publico">
            <Button variant="outline">
              <LogIn className="mr-2 h-4 w-4" />
              Fazer Login para Comprar
            </Button>
          </Link>
        )}
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar produtos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {filteredProdutos.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Nenhum produto encontrado"
          description={searchTerm ? "Tente buscar com outros termos" : "Não há produtos disponíveis no momento"}
        />
      ) : (
        <>
          <p className="mb-6 text-sm text-muted-foreground">
            {filteredProdutos.length} {filteredProdutos.length === 1 ? "produto encontrado" : "produtos encontrados"}
          </p>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProdutos.map((produto) => (
              <Card key={produto.id} className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
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
                  </div>
                </Link>

                <CardContent className="p-4 space-y-3 flex-1 flex flex-col">
                  <div>
                    <Link href={`/fornecedor/${produto.fornecedor.slug}`}>
                      <h3 className="font-semibold line-clamp-2 mb-1 hover:text-primary">
                        {produto.nome}
                      </h3>
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      SKU: {produto.sku}
                    </p>
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
                        ? "Disponível"
                        : "Sem estoque"}
                    </p>
                  </div>

                  <div className="mt-auto pt-2">
                    <Button
                      className="w-full"
                      onClick={() => handleAddToCart(produto)}
                      disabled={produto.quantidadeEstoque === 0 || (isCliente && hasItem(produto.id))}
                      variant={isLoggedIn ? "default" : "outline"}
                    >
                      {!isLoggedIn ? (
                        <>
                          <LogIn className="mr-2 h-4 w-4" />
                          Login para Comprar
                        </>
                      ) : isCliente && hasItem(produto.id) ? (
                        "No Carrinho"
                      ) : (
                        <>
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          Adicionar ao Carrinho
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
