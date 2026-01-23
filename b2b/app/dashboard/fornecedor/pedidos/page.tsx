"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate } from "@/lib/utils"
import { ShoppingBag, Eye } from "lucide-react"

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
                          <Button variant="ghost" size="icon" title="Ver detalhes">
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
    </div>
  )
}
