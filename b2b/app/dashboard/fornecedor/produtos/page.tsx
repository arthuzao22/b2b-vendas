"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { Package, Plus, Search, Edit, Trash2, Image as ImageIcon } from "lucide-react"

interface Produto {
  id: string
  nome: string
  sku: string
  descricao: string
  precoBase: number
  quantidadeEstoque: number
  estoqueMinimo: number
  unidadeMedida: string
  ativo: boolean
  imagemUrl?: string
}

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const perPage = 10

  useEffect(() => {
    fetchProdutos()
  }, [page, search])

  const fetchProdutos = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: perPage.toString(),
        ...(search && { search }),
      })
      
      const response = await fetch(`/api/produtos?${params}`)
      const data = await response.json()

      if (data.success) {
        setProdutos(data.data.produtos)
        setTotal(data.data.total)
      }
    } catch (error) {
      console.error("Erro ao carregar produtos:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este produto?")) {
      return
    }

    try {
      const response = await fetch(`/api/produtos/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchProdutos()
      } else {
        alert("Erro ao excluir produto")
      }
    } catch (error) {
      console.error("Erro ao excluir produto:", error)
      alert("Erro ao excluir produto")
    }
  }

  const totalPages = Math.ceil(total / perPage)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Produtos</h1>
          <p className="text-muted-foreground">
            Gerencie seu catálogo de produtos
          </p>
        </div>
        <Link href="/dashboard/fornecedor/produtos/novo">
          <Button className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Novo Produto
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou SKU..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products List */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">
              Carregando produtos...
            </div>
          ) : produtos.length === 0 ? (
            <div className="p-8 text-center">
              <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {search ? "Nenhum produto encontrado" : "Nenhum produto cadastrado"}
              </p>
              {!search && (
                <Link href="/dashboard/fornecedor/produtos/novo">
                  <Button className="mt-4">
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Primeiro Produto
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              {/* Mobile Cards */}
              <div className="md:hidden divide-y">
                {produtos.map((produto) => (
                  <div key={produto.id} className="p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-14 h-14 bg-muted rounded-md flex items-center justify-center overflow-hidden shrink-0">
                        {produto.imagemUrl ? (
                          <img
                            src={produto.imagemUrl}
                            alt={produto.nome}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{produto.nome}</p>
                        <p className="text-sm text-muted-foreground font-mono">{produto.sku}</p>
                      </div>
                      <Badge variant={produto.ativo ? "success" : "secondary"} className="shrink-0">
                        {produto.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <span className="font-semibold">{formatCurrency(produto.precoBase)}</span>
                        <span className="text-xs text-muted-foreground">/{produto.unidadeMedida}</span>
                      </div>
                      <div className={produto.quantidadeEstoque <= produto.estoqueMinimo ? "text-yellow-600 font-semibold" : "text-muted-foreground"}>
                        Estoque: {produto.quantidadeEstoque} {produto.unidadeMedida}
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Link href={`/dashboard/fornecedor/produtos/${produto.id}/editar`}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(produto.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table */}
              <table className="w-full hidden md:table">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="text-left p-3 lg:p-4 font-medium">Imagem</th>
                    <th className="text-left p-3 lg:p-4 font-medium">Produto</th>
                    <th className="text-left p-3 lg:p-4 font-medium">SKU</th>
                    <th className="text-left p-3 lg:p-4 font-medium">Preço Base</th>
                    <th className="text-left p-3 lg:p-4 font-medium">Estoque</th>
                    <th className="text-left p-3 lg:p-4 font-medium">Status</th>
                    <th className="text-right p-3 lg:p-4 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {produtos.map((produto) => (
                    <tr key={produto.id} className="border-b hover:bg-muted/50">
                      <td className="p-3 lg:p-4">
                        <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center overflow-hidden">
                          {produto.imagemUrl ? (
                            <img
                              src={produto.imagemUrl}
                              alt={produto.nome}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="h-6 w-6 text-muted-foreground" />
                          )}
                        </div>
                      </td>
                      <td className="p-3 lg:p-4">
                        <div className="space-y-1">
                          <p className="font-medium">{produto.nome}</p>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {produto.descricao}
                          </p>
                        </div>
                      </td>
                      <td className="p-3 lg:p-4">
                        <span className="font-mono text-sm">{produto.sku}</span>
                      </td>
                      <td className="p-3 lg:p-4">
                        <span className="font-semibold">
                          {formatCurrency(produto.precoBase)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          /{produto.unidadeMedida}
                        </span>
                      </td>
                      <td className="p-3 lg:p-4">
                        <div className="space-y-1">
                          <p className={produto.quantidadeEstoque <= produto.estoqueMinimo ? "text-yellow-600 font-semibold" : ""}>
                            {produto.quantidadeEstoque} {produto.unidadeMedida}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Mín: {produto.estoqueMinimo}
                          </p>
                        </div>
                      </td>
                      <td className="p-3 lg:p-4">
                        <Badge variant={produto.ativo ? "success" : "secondary"}>
                          {produto.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                      </td>
                      <td className="p-3 lg:p-4">
                        <div className="flex justify-end gap-2">
                          <Link href={`/dashboard/fornecedor/produtos/${produto.id}/editar`}>
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(produto.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground text-center sm:text-left">
            Mostrando {(page - 1) * perPage + 1} a {Math.min(page * perPage, total)} de {total} produtos
          </p>
          <div className="flex gap-2 justify-center sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
