"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate } from "@/lib/utils"
import { ShoppingBag, Eye, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Pedido {
  id: string
  numeroPedido: string
  criadoEm: Date
  status: string
  total: number
  cliente: {
    razaoSocial: string
    cnpj: string
  }
}

interface PedidoDetalhado extends Pedido {
  subtotal: number
  desconto: number
  frete: number
  itens: Array<{
    id: string
    quantidade: number
    precoUnitario: number
    precoTotal: number
    produto: {
      nome: string
      sku: string
    }
  }>
}

const statusColors: Record<string, "default" | "success" | "warning" | "destructive"> = {
  pendente: "warning",
  confirmado: "default",
  em_preparacao: "default",
  enviado: "default",
  entregue: "success",
  cancelado: "destructive",
}

const statusLabels: Record<string, string> = {
  pendente: "Pendente",
  confirmado: "Confirmado",
  em_preparacao: "Em Preparação",
  enviado: "Enviado",
  entregue: "Entregue",
  cancelado: "Cancelado",
}

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>("todos")
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [selectedPedido, setSelectedPedido] = useState<PedidoDetalhado | null>(null)
  const [loadingDetalhes, setLoadingDetalhes] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const perPage = 10

  useEffect(() => {
    fetchPedidos()
  }, [page, statusFilter])

  const fetchPedidos = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: perPage.toString(),
        ...(statusFilter !== "todos" && { status: statusFilter }),
      })
      
      const response = await fetch(`/api/pedidos?${params}`)
      const data = await response.json()

      if (data.success) {
        setPedidos(data.data.pedidos)
        setTotal(data.data.total)
      }
    } catch (error) {
      console.error("Erro ao carregar pedidos:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (pedidoId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/pedidos/${pedidoId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        fetchPedidos()
      } else {
        alert("Erro ao atualizar status")
      }
    } catch (error) {
      console.error("Erro ao atualizar status:", error)
      alert("Erro ao atualizar status")
    }
  }

  const handleViewPedido = async (pedidoId: string) => {
    try {
      setLoadingDetalhes(true)
      setIsDialogOpen(true)
      const response = await fetch(`/api/pedidos/${pedidoId}`)
      const data = await response.json()

      if (response.ok && data.success) {
        setSelectedPedido(data.data)
      } else {
        alert("Erro ao carregar detalhes do pedido")
        setIsDialogOpen(false)
      }
    } catch (error) {
      console.error("Erro ao carregar detalhes:", error)
      alert("Erro ao carregar detalhes")
      setIsDialogOpen(false)
    } finally {
      setLoadingDetalhes(false)
    }
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setSelectedPedido(null)
  }

  const totalPages = Math.ceil(total / perPage)

  const statusOptions = [
    { value: "todos", label: "Todos" },
    { value: "pendente", label: "Pendente" },
    { value: "confirmado", label: "Confirmado" },
    { value: "em_preparacao", label: "Em Preparação" },
    { value: "enviado", label: "Enviado" },
    { value: "entregue", label: "Entregue" },
    { value: "cancelado", label: "Cancelado" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pedidos</h1>
        <p className="text-muted-foreground">
          Gerencie os pedidos dos seus clientes
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((option) => (
              <Button
                key={option.value}
                variant={statusFilter === option.value ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setStatusFilter(option.value)
                  setPage(1)
                }}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">
              Carregando pedidos...
            </div>
          ) : pedidos.length === 0 ? (
            <div className="p-8 text-center">
              <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhum pedido encontrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-medium">Número do Pedido</th>
                    <th className="text-left p-4 font-medium">Cliente</th>
                    <th className="text-left p-4 font-medium">Data</th>
                    <th className="text-left p-4 font-medium">Status</th>
                    <th className="text-left p-4 font-medium">Total</th>
                    <th className="text-right p-4 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {pedidos.map((pedido) => (
                    <tr key={pedido.id} className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <span className="font-mono font-semibold">
                          {pedido.numeroPedido}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          <p className="font-medium">{pedido.cliente.razaoSocial}</p>
                          <p className="text-sm text-muted-foreground">
                            CNPJ: {pedido.cliente.cnpj}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-sm">
                          {formatDate(pedido.criadoEm)}
                        </span>
                      </td>
                      <td className="p-4">
                        <select
                          value={pedido.status}
                          onChange={(e) => handleStatusChange(pedido.id, e.target.value)}
                          className="text-xs font-semibold rounded-full px-2.5 py-0.5 border bg-background"
                        >
                          <option value="pendente">Pendente</option>
                          <option value="confirmado">Confirmado</option>
                          <option value="em_preparacao">Em Preparação</option>
                          <option value="enviado">Enviado</option>
                          <option value="entregue">Entregue</option>
                          <option value="cancelado">Cancelado</option>
                        </select>
                      </td>
                      <td className="p-4">
                        <span className="font-bold">{formatCurrency(pedido.total)}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            title="Ver detalhes"
                            onClick={() => handleViewPedido(pedido.id)}
                          >
                            <Eye className="h-4 w-4" />
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
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {(page - 1) * perPage + 1} a {Math.min(page * perPage, total)} de {total} pedidos
          </p>
          <div className="flex gap-2">
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

      {/* Dialog for Order Details */}
      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Pedido</DialogTitle>
            <DialogDescription>
              Informações completas do pedido
            </DialogDescription>
          </DialogHeader>

          {loadingDetalhes ? (
            <div className="p-8 text-center text-muted-foreground">
              Carregando detalhes...
            </div>
          ) : selectedPedido ? (
            <div className="space-y-6">
              {/* Order Header */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Número do Pedido</p>
                  <p className="font-mono font-bold">{selectedPedido.numeroPedido}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Data</p>
                  <p className="font-medium">{formatDate(selectedPedido.criadoEm)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cliente</p>
                  <p className="font-medium">{selectedPedido.cliente.razaoSocial}</p>
                  <p className="text-sm text-muted-foreground">{selectedPedido.cliente.cnpj}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={statusColors[selectedPedido.status]}>
                    {statusLabels[selectedPedido.status]}
                  </Badge>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-semibold mb-4">Itens do Pedido</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-3 text-sm font-medium">Produto</th>
                        <th className="text-right p-3 text-sm font-medium">Qtd</th>
                        <th className="text-right p-3 text-sm font-medium">Preço Unit.</th>
                        <th className="text-right p-3 text-sm font-medium">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedPedido.itens.map((item) => (
                        <tr key={item.id} className="border-t">
                          <td className="p-3">
                            <p className="font-medium">{item.produto.nome}</p>
                            <p className="text-sm text-muted-foreground">SKU: {item.produto.sku}</p>
                          </td>
                          <td className="text-right p-3">{item.quantidade}</td>
                          <td className="text-right p-3">{formatCurrency(item.precoUnitario)}</td>
                          <td className="text-right p-3 font-medium">{formatCurrency(item.precoTotal)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Order Summary */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(selectedPedido.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Desconto</span>
                  <span className="text-green-600">-{formatCurrency(selectedPedido.desconto)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Frete</span>
                  <span>{formatCurrency(selectedPedido.frete)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total</span>
                  <span>{formatCurrency(selectedPedido.total)}</span>
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
