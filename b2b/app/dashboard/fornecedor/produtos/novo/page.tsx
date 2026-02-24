"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { MultiImageUpload } from "@/components/ui/multi-image-upload"

interface Categoria {
  id: string
  nome: string
}

export default function NovoProdutoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [formData, setFormData] = useState({
    nome: "",
    sku: "",
    descricao: "",
    precoBase: "",
    categoriaId: "",
    quantidadeEstoque: "",
    estoqueMinimo: "",
    unidadeMedida: "UN",
  })
  const [imagens, setImagens] = useState<string[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchCategorias()
  }, [])

  const fetchCategorias = async () => {
    try {
      const response = await fetch("/api/categorias?flat=true")
      const data = await response.json()
      if (data.success) {
        setCategorias(Array.isArray(data.data?.categorias) ? data.data.categorias : [])
      }
    } catch (error) {
      console.error("Erro ao carregar categorias:", error)
      setCategorias([])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }))
    }
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.nome.trim()) {
      newErrors.nome = "Nome é obrigatório"
    }
    if (!formData.sku.trim()) {
      newErrors.sku = "SKU é obrigatório"
    }
    if (!formData.precoBase || Number(formData.precoBase) <= 0) {
      newErrors.precoBase = "Preço base deve ser maior que zero"
    }
    if (!formData.categoriaId) {
      newErrors.categoriaId = "Categoria é obrigatória"
    }
    if (!formData.quantidadeEstoque || Number(formData.quantidadeEstoque) < 0) {
      newErrors.quantidadeEstoque = "Quantidade em estoque deve ser maior ou igual a zero"
    }
    if (!formData.estoqueMinimo || Number(formData.estoqueMinimo) < 0) {
      newErrors.estoqueMinimo = "Estoque mínimo deve ser maior ou igual a zero"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/produtos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          precoBase: Number(formData.precoBase),
          quantidadeEstoque: Number(formData.quantidadeEstoque),
          estoqueMinimo: Number(formData.estoqueMinimo),
          imagens,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        router.push("/dashboard/fornecedor/produtos")
      } else {
        alert(data.error || "Erro ao criar produto")
      }
    } catch (error) {
      console.error("Erro ao criar produto:", error)
      alert("Erro ao criar produto")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/fornecedor/produtos">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Novo Produto</h1>
          <p className="text-muted-foreground">
            Adicione um novo produto ao seu catálogo
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informações do Produto</CardTitle>
            <CardDescription>
              Preencha os campos abaixo para cadastrar um novo produto
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Nome */}
              <div className="space-y-2">
                <Label htmlFor="nome">
                  Nome do Produto <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="nome"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  placeholder="Ex: Produto Premium"
                />
                {errors.nome && (
                  <p className="text-sm text-destructive">{errors.nome}</p>
                )}
              </div>

              {/* SKU */}
              <div className="space-y-2">
                <Label htmlFor="sku">
                  SKU <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="sku"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  placeholder="Ex: PROD-001"
                />
                {errors.sku && (
                  <p className="text-sm text-destructive">{errors.sku}</p>
                )}
              </div>

              {/* Descrição */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="descricao">Descrição</Label>
                <textarea
                  id="descricao"
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleChange}
                  placeholder="Descreva o produto..."
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              {/* Preço Base */}
              <div className="space-y-2">
                <Label htmlFor="precoBase">
                  Preço Base (R$) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="precoBase"
                  name="precoBase"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.precoBase}
                  onChange={handleChange}
                  placeholder="0.00"
                />
                {errors.precoBase && (
                  <p className="text-sm text-destructive">{errors.precoBase}</p>
                )}
              </div>

              {/* Categoria */}
              <div className="space-y-2">
                <Label htmlFor="categoriaId">
                  Categoria <span className="text-destructive">*</span>
                </Label>
                <select
                  id="categoriaId"
                  name="categoriaId"
                  value={formData.categoriaId}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Selecione uma categoria</option>
                  {categorias.map((categoria) => (
                    <option key={categoria.id} value={categoria.id}>
                      {categoria.nome}
                    </option>
                  ))}
                </select>
                {errors.categoriaId && (
                  <p className="text-sm text-destructive">{errors.categoriaId}</p>
                )}
              </div>

              {/* Quantidade em Estoque */}
              <div className="space-y-2">
                <Label htmlFor="quantidadeEstoque">
                  Quantidade em Estoque <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="quantidadeEstoque"
                  name="quantidadeEstoque"
                  type="number"
                  min="0"
                  value={formData.quantidadeEstoque}
                  onChange={handleChange}
                  placeholder="0"
                />
                {errors.quantidadeEstoque && (
                  <p className="text-sm text-destructive">{errors.quantidadeEstoque}</p>
                )}
              </div>

              {/* Estoque Mínimo */}
              <div className="space-y-2">
                <Label htmlFor="estoqueMinimo">
                  Estoque Mínimo <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="estoqueMinimo"
                  name="estoqueMinimo"
                  type="number"
                  min="0"
                  value={formData.estoqueMinimo}
                  onChange={handleChange}
                  placeholder="0"
                />
                {errors.estoqueMinimo && (
                  <p className="text-sm text-destructive">{errors.estoqueMinimo}</p>
                )}
              </div>

              {/* Unidade de Medida */}
              <div className="space-y-2">
                <Label htmlFor="unidadeMedida">Unidade de Medida</Label>
                <select
                  id="unidadeMedida"
                  name="unidadeMedida"
                  value={formData.unidadeMedida}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="UN">Unidade (UN)</option>
                  <option value="CX">Caixa (CX)</option>
                  <option value="KG">Quilograma (KG)</option>
                  <option value="L">Litro (L)</option>
                  <option value="M">Metro (M)</option>
                  <option value="PCT">Pacote (PCT)</option>
                </select>
              </div>

              {/* Upload de Imagens */}
              <div className="space-y-2 md:col-span-2">
                <Label>Imagens do Produto</Label>
                <MultiImageUpload
                  value={imagens}
                  onChange={setImagens}
                  disabled={loading}
                  maxImages={5}
                />
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Link href="/dashboard/fornecedor/produtos">
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </Link>
              <Button type="submit" disabled={loading}>
                {loading ? "Salvando..." : "Salvar Produto"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
