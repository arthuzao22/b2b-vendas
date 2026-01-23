"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PriceDisplay } from "@/components/ui/price-display";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingSkeleton, CardSkeleton } from "@/components/ui/loading-skeleton";
import { Search, Package } from "lucide-react";
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
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchProdutos();
  }, []);

  const fetchProdutos = async () => {
    try {
      const response = await fetch("/api/produtos");
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setProdutos(data.data);
        }
      }
    } catch (error) {
      console.error("Error fetching produtos:", error);
    } finally {
      setLoading(false);
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Catálogo Público</h1>
        <p className="text-muted-foreground">
          Explore nosso catálogo de produtos
        </p>
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
              <Link
                key={produto.id}
                href={`/fornecedor/${produto.fornecedor.slug}`}
              >
                <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
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
                      <h3 className="font-semibold line-clamp-2 mb-1">
                        {produto.nome}
                      </h3>
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
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
