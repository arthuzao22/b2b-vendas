"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PriceDisplay } from "@/components/ui/price-display";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingSkeleton, CardSkeleton } from "@/components/ui/loading-skeleton";
import { useCart } from "@/hooks/useCart";
import { ShoppingCart, Search, Package } from "lucide-react";
import Image from "next/image";

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
    nomeFantasia: string | null;
    razaoSocial: string;
  };
}

export default function CatalogoClientePage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { addToCart, hasItem } = useCart();

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
    produto.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <LoadingSkeleton className="h-8 w-48 mb-2" />
            <LoadingSkeleton className="h-4 w-64" />
          </div>
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
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Catálogo de Produtos</h1>
          <p className="text-muted-foreground">
            {filteredProdutos.length} produtos disponíveis
          </p>
        </div>

        <div className="relative w-full md:w-96">
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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProdutos.map((produto) => (
            <Card key={produto.id} className="overflow-hidden hover:shadow-lg transition-shadow">
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
              
              <CardContent className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold line-clamp-2 mb-1">{produto.nome}</h3>
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

                <div className="flex items-center justify-between">
                  <PriceDisplay value={Number(produto.precoBase)} size="md" />
                  <p className="text-xs text-muted-foreground">
                    {produto.quantidadeEstoque > 0 
                      ? `${produto.quantidadeEstoque} disponíveis` 
                      : "Sem estoque"}
                  </p>
                </div>

                <Button
                  className="w-full"
                  onClick={() => handleAddToCart(produto)}
                  disabled={produto.quantidadeEstoque === 0 || hasItem(produto.id)}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  {hasItem(produto.id) ? "No Carrinho" : "Adicionar"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
