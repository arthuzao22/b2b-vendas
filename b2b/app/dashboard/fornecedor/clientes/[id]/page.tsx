"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Breadcrumbs } from "@/components/ui/breadcrumbs"
import { LoadingSkeleton } from "@/components/ui/loading-skeleton"
import { PriceDisplay } from "@/components/ui/price-display"
import {
  ArrowLeft,
  Building,
  Mail,
  Phone,
  MapPin,
  Tag,
  ShoppingBag,
  DollarSign,
  Save,
  X,
} from "lucide-react"

interface ClienteDetalhes {
  id: string
  usuario: {
    id: string
    email: string
    nome: string
    telefone: string | null
    ativo: boolean
  }
  razaoSocial: string
  nomeFantasia: string | null
  cnpj: string
  inscricaoEstadual: string | null
  endereco: string | null
  cidade: string | null
  estado: string | null
  cep: string | null
  listaPreco: {
    id: string
    nome: string
    descricao: string | null
    tipoDesconto: string
    valorDesconto: string
    ativo: boolean
  } | null
  precosCustomizados: {
    id: string
    produto: {
      id: string
      nome: string
      sku: string
      precoBase: string
    }
    preco: string
    criadoEm: string
    atualizadoEm: string
  }[]
  criadoEm: string
  atualizadoEm: string
}

interface ListaPreco {
  id: string
  nome: string
  tipoDesconto: string
  valorDesconto: string
  ativo: boolean
  _count?: {
    itens: number
    clientes: number
  }
}

interface Pedido {
  id: string
  numero: string
  status: string
  valorTotal: string
  criadoEm: string
}

export default function ClienteDetalhePage() {
  const params = useParams()
  const router = useRouter()
  const clienteId = params.id as string

  const [cliente, setCliente] = useState<ClienteDetalhes | null>(null)
  const [listasPreco, setListasPreco] = useState<ListaPreco[]>([])
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedListaId, setSelectedListaId] = useState<string>("")
  const [savingLista, setSavingLista] = useState(false)
  const [listaChanged, setListaChanged] = useState(false)

  useEffect(() => {
    if (clienteId) {
      fetchCliente()
      fetchListasPreco()
      fetchPedidos()
    }
  }, [clienteId])

  const fetchCliente = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/clientes/${clienteId}`)
      const data = await response.json()

      if (data.success) {
        setCliente(data.data)
        setSelectedListaId(data.data.listaPreco?.id || "")
      }
    } catch (error) {
      console.error("Erro ao carregar cliente:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchListasPreco = async () => {
    try {
      const response = await fetch("/api/listas-preco?limit=100")
      const data = await response.json()

      if (data.success) {
        const listas = data.data?.listas || []
        setListasPreco(Array.isArray(listas) ? listas : [])
      }
    } catch (error) {
      console.error("Erro ao carregar listas de preço:", error)
    }
  }

  const fetchPedidos = async () => {
    try {
      const response = await fetch(`/api/clientes/${clienteId}/pedidos`)
      const data = await response.json()

      if (data.success) {
        setPedidos(data.data?.pedidos || data.data || [])
      }
    } catch (error) {
      console.error("Erro ao carregar pedidos:", error)
    }
  }

  const handleSaveListaPreco = async () => {
    setSavingLista(true)
    try {
      const response = await fetch(`/api/clientes/${clienteId}/lista-preco`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listaPrecoId: selectedListaId || null,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        await fetchCliente()
        setListaChanged(false)
        alert("Lista de preço atualizada com sucesso!")
      } else {
        alert(data.error || "Erro ao atribuir lista de preço")
      }
    } catch (error) {
      console.error("Erro ao salvar lista de preço:", error)
      alert("Erro ao salvar lista de preço")
    } finally {
      setSavingLista(false)
    }
  }

  const handleListaChange = (value: string) => {
    setSelectedListaId(value)
    setListaChanged(value !== (cliente?.listaPreco?.id || ""))
  }

  const handleRemoveLista = async () => {
    setSelectedListaId("")
    setListaChanged(true)
  }

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      pendente: "Pendente",
      confirmado: "Confirmado",
      em_separacao: "Em Separação",
      enviado: "Enviado",
      entregue: "Entregue",
      cancelado: "Cancelado",
    }
    return map[status] || status
  }

  const getStatusVariant = (status: string) => {
    const map: Record<string, "default" | "secondary" | "destructive" | "success"> = {
      pendente: "default",
      confirmado: "secondary",
      em_separacao: "secondary",
      enviado: "secondary",
      entregue: "success",
      cancelado: "destructive",
    }
    return map[status] || "default"
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton className="h-8 w-64" />
        <LoadingSkeleton className="h-48" />
        <LoadingSkeleton className="h-48" />
      </div>
    )
  }

  if (!cliente) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Cliente não encontrado</p>
        <Link href="/dashboard/fornecedor/clientes">
          <Button variant="link">Voltar para clientes</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumbs & Header */}
      <div>
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: "/dashboard/fornecedor" },
            { label: "Clientes", href: "/dashboard/fornecedor/clientes" },
            { label: cliente.razaoSocial },
          ]}
        />
        <div className="flex items-center gap-3 mt-4">
          <Link href="/dashboard/fornecedor/clientes">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {cliente.nomeFantasia || cliente.razaoSocial}
            </h1>
            <p className="text-muted-foreground">{cliente.razaoSocial}</p>
          </div>
          <Badge variant={cliente.usuario.ativo ? "success" : "secondary"}>
            {cliente.usuario.ativo ? "Ativo" : "Inativo"}
          </Badge>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Dados Cadastrais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Dados Cadastrais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Razão Social</p>
                <p className="font-medium">{cliente.razaoSocial}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Nome Fantasia</p>
                <p className="font-medium">{cliente.nomeFantasia || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">CNPJ</p>
                <p className="font-mono">{cliente.cnpj}</p>
              </div>
              {cliente.inscricaoEstadual && (
                <div>
                  <p className="text-sm text-muted-foreground">Inscrição Estadual</p>
                  <p className="font-medium">{cliente.inscricaoEstadual}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Contato */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Contato & Endereço
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Responsável</p>
                <p className="font-medium">{cliente.usuario.nome}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {cliente.usuario.email}
                </p>
              </div>
              {cliente.usuario.telefone && (
                <div>
                  <p className="text-sm text-muted-foreground">Telefone</p>
                  <p className="font-medium flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {cliente.usuario.telefone}
                  </p>
                </div>
              )}
              {cliente.endereco && (
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Endereço</p>
                  <p className="font-medium flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {cliente.endereco}
                    {cliente.cidade && `, ${cliente.cidade}`}
                    {cliente.estado && ` - ${cliente.estado}`}
                    {cliente.cep && ` (${cliente.cep})`}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Preço */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Lista de Preço
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label
                  htmlFor="listaPreco"
                  className="block text-sm font-medium text-muted-foreground mb-2"
                >
                  Selecione uma lista de preço para este cliente
                </label>
                <div className="flex items-center gap-3">
                  <select
                    id="listaPreco"
                    value={selectedListaId}
                    onChange={(e) => handleListaChange(e.target.value)}
                    className="flex-1 h-10 px-3 py-2 border border-input rounded-md bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="">Sem lista de preço</option>
                    {listasPreco
                      .filter((l) => l.ativo)
                      .map((lista) => (
                        <option key={lista.id} value={lista.id}>
                          {lista.nome} (
                          {lista.tipoDesconto === "percentual"
                            ? `${lista.valorDesconto}%`
                            : `R$ ${parseFloat(lista.valorDesconto).toFixed(2)}`}
                          )
                        </option>
                      ))}
                  </select>

                  {selectedListaId && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleRemoveLista}
                      title="Remover lista"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}

                  {listaChanged && (
                    <Button onClick={handleSaveListaPreco} disabled={savingLista}>
                      <Save className="mr-2 h-4 w-4" />
                      {savingLista ? "Salvando..." : "Salvar"}
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Info da lista selecionada */}
            {cliente.listaPreco && !listaChanged && (
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{cliente.listaPreco.nome}</p>
                  {cliente.listaPreco.descricao && (
                    <p className="text-sm text-muted-foreground">
                      {cliente.listaPreco.descricao}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground mt-1">
                    Desconto:{" "}
                    {cliente.listaPreco.tipoDesconto === "percentual"
                      ? `${cliente.listaPreco.valorDesconto}%`
                      : `R$ ${parseFloat(cliente.listaPreco.valorDesconto).toFixed(2)}`}{" "}
                    ({cliente.listaPreco.tipoDesconto})
                  </p>
                </div>
                <Link href={`/dashboard/fornecedor/precos/${cliente.listaPreco.id}`}>
                  <Button variant="outline" size="sm">
                    Ver Lista
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Preços Customizados */}
      {cliente.precosCustomizados.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Preços Customizados ({cliente.precosCustomizados.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="text-left p-3 font-medium text-sm">Produto</th>
                    <th className="text-left p-3 font-medium text-sm">SKU</th>
                    <th className="text-left p-3 font-medium text-sm">Preço Base</th>
                    <th className="text-left p-3 font-medium text-sm">Preço Customizado</th>
                    <th className="text-left p-3 font-medium text-sm">Desconto</th>
                  </tr>
                </thead>
                <tbody>
                  {cliente.precosCustomizados.map((pc) => {
                    const precoBase = parseFloat(pc.produto.precoBase)
                    const precoCustom = parseFloat(pc.preco)
                    const desconto =
                      precoBase > 0
                        ? (((precoBase - precoCustom) / precoBase) * 100).toFixed(1)
                        : "0"
                    return (
                      <tr key={pc.id} className="border-b">
                        <td className="p-3 font-medium">{pc.produto.nome}</td>
                        <td className="p-3 font-mono text-sm">{pc.produto.sku}</td>
                        <td className="p-3">
                          <PriceDisplay value={precoBase} size="sm" />
                        </td>
                        <td className="p-3">
                          <PriceDisplay
                            value={precoCustom}
                            size="sm"
                            className="text-green-600 font-bold"
                          />
                        </td>
                        <td className="p-3">
                          <span className="text-sm font-medium text-green-600">
                            {desconto}%
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pedidos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Pedidos Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pedidos.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Nenhum pedido encontrado para este cliente
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="text-left p-3 font-medium text-sm">Número</th>
                    <th className="text-left p-3 font-medium text-sm">Status</th>
                    <th className="text-left p-3 font-medium text-sm">Valor Total</th>
                    <th className="text-left p-3 font-medium text-sm">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {pedidos.map((pedido) => (
                    <tr key={pedido.id} className="border-b hover:bg-muted/50">
                      <td className="p-3">
                        <Link
                          href={`/pedidos/${pedido.id}`}
                          className="font-medium text-primary hover:underline"
                        >
                          #{pedido.numero}
                        </Link>
                      </td>
                      <td className="p-3">
                        <Badge variant={getStatusVariant(pedido.status)}>
                          {getStatusLabel(pedido.status)}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <PriceDisplay
                          value={parseFloat(pedido.valorTotal)}
                          size="sm"
                        />
                      </td>
                      <td className="p-3 text-sm text-muted-foreground">
                        {new Date(pedido.criadoEm).toLocaleDateString("pt-BR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
