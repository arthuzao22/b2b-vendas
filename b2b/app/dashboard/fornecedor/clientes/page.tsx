"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Users, Plus, Search, Eye, Edit, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

interface Cliente {
  id: string
  razaoSocial: string
  nomeFantasia: string
  cnpj: string
  email: string
  telefone: string
  cidade: string
  estado: string
  endereco?: string
  cep?: string
  ativo: boolean
  listaPreco?: {
    id: string
    nome: string
  }
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null)
  const [formData, setFormData] = useState({
    razaoSocial: "",
    nomeFantasia: "",
    cnpj: "",
    email: "",
    telefone: "",
    endereco: "",
    cidade: "",
    estado: "",
    cep: "",
  })
  const [saving, setSaving] = useState(false)
  const perPage = 10

  useEffect(() => {
    fetchClientes()
  }, [page, search])

  const fetchClientes = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: perPage.toString(),
        ...(search && { search }),
      })

      const response = await fetch(`/api/clientes?${params}`)
      const data = await response.json()

      if (data.success) {
        setClientes(data.data.clientes)
        setTotal(data.data.total)
      }
    } catch (error) {
      console.error("Erro ao carregar clientes:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewCliente = (cliente: Cliente) => {
    setSelectedCliente(cliente)
    setIsViewDialogOpen(true)
  }

  const handleEditCliente = (cliente: Cliente) => {
    setSelectedCliente(cliente)
    setFormData({
      razaoSocial: cliente.razaoSocial,
      nomeFantasia: cliente.nomeFantasia,
      cnpj: cliente.cnpj,
      email: cliente.email,
      telefone: cliente.telefone,
      endereco: cliente.endereco || "",
      cidade: cliente.cidade,
      estado: cliente.estado,
      cep: cliente.cep || "",
    })
    setIsEditDialogOpen(true)
  }

  const handleAddCliente = () => {
    setSelectedCliente(null)
    setFormData({
      razaoSocial: "",
      nomeFantasia: "",
      cnpj: "",
      email: "",
      telefone: "",
      endereco: "",
      cidade: "",
      estado: "",
      cep: "",
    })
    setIsAddDialogOpen(true)
  }

  const handleSaveCliente = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const url = selectedCliente
        ? `/api/clientes/${selectedCliente.id}`
        : `/api/clientes`

      const response = await fetch(url, {
        method: selectedCliente ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        await fetchClientes()
        setIsEditDialogOpen(false)
        setIsAddDialogOpen(false)
        setSelectedCliente(null)
      } else {
        alert(data.error || "Erro ao salvar cliente")
      }
    } catch (error) {
      console.error("Erro ao salvar cliente:", error)
      alert("Erro ao salvar cliente")
    } finally {
      setSaving(false)
    }
  }

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const totalPages = Math.ceil(total / perPage)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">
            Gerencie seus clientes e suas listas de preço
          </p>
        </div>
        <Button onClick={handleAddCliente}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Cliente
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Buscar Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por razão social, CNPJ ou cidade..."
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

      {/* Clients List */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">
              Carregando clientes...
            </div>
          ) : clientes.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {search ? "Nenhum cliente encontrado" : "Nenhum cliente cadastrado"}
              </p>
              {!search && (
                <Button className="mt-4" onClick={handleAddCliente}>
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Primeiro Cliente
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-medium">Cliente</th>
                    <th className="text-left p-4 font-medium">CNPJ</th>
                    <th className="text-left p-4 font-medium">Contato</th>
                    <th className="text-left p-4 font-medium">Localização</th>
                    <th className="text-left p-4 font-medium">Lista de Preço</th>
                    <th className="text-left p-4 font-medium">Status</th>
                    <th className="text-right p-4 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {clientes.map((cliente) => (
                    <tr key={cliente.id} className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <div className="space-y-1">
                          <p className="font-medium">{cliente.razaoSocial}</p>
                          {cliente.nomeFantasia && (
                            <p className="text-sm text-muted-foreground">
                              {cliente.nomeFantasia}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-mono text-sm">{cliente.cnpj}</span>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          <p className="text-sm">{cliente.email}</p>
                          <p className="text-sm text-muted-foreground">
                            {cliente.telefone}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-sm">
                          {cliente.cidade}, {cliente.estado}
                        </span>
                      </td>
                      <td className="p-4">
                        {cliente.listaPreco ? (
                          <Badge variant="secondary">
                            {cliente.listaPreco.nome}
                          </Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            Sem lista
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <Badge variant={cliente.ativo ? "success" : "secondary"}>
                          {cliente.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Ver detalhes"
                            onClick={() => handleViewCliente(cliente)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Editar"
                            onClick={() => handleEditCliente(cliente)}
                          >
                            <Edit className="h-4 w-4" />
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
            Mostrando {(page - 1) * perPage + 1} a {Math.min(page * perPage, total)} de {total} clientes
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

      {/* View Client Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Cliente</DialogTitle>
            <DialogDescription>
              Informações completas do cliente
            </DialogDescription>
          </DialogHeader>

          {selectedCliente && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Razão Social</p>
                  <p className="font-medium">{selectedCliente.razaoSocial}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Nome Fantasia</p>
                  <p className="font-medium">{selectedCliente.nomeFantasia || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">CNPJ</p>
                  <p className="font-mono">{selectedCliente.cnpj}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={selectedCliente.ativo ? "success" : "secondary"}>
                    {selectedCliente.ativo ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedCliente.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Telefone</p>
                  <p className="font-medium">{selectedCliente.telefone}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Endereço</p>
                  <p className="font-medium">{selectedCliente.endereco || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cidade</p>
                  <p className="font-medium">{selectedCliente.cidade}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Estado</p>
                  <p className="font-medium">{selectedCliente.estado}</p>
                </div>
                {selectedCliente.cep && (
                  <div>
                    <p className="text-sm text-muted-foreground">CEP</p>
                    <p className="font-medium">{selectedCliente.cep}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Lista de Preço</p>
                  <p className="font-medium">
                    {selectedCliente.listaPreco?.nome || "Sem lista atribuída"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit/Add Client Dialog */}
      <Dialog open={isEditDialogOpen || isAddDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsEditDialogOpen(false)
          setIsAddDialogOpen(false)
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedCliente ? "Editar Cliente" : "Novo Cliente"}
            </DialogTitle>
            <DialogDescription>
              {selectedCliente ? "Atualize as informações do cliente" : "Adicione um novo cliente"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveCliente} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="razaoSocial">
                  Razão Social <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="razaoSocial"
                  name="razaoSocial"
                  value={formData.razaoSocial}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nomeFantasia">Nome Fantasia</Label>
                <Input
                  id="nomeFantasia"
                  name="nomeFantasia"
                  value={formData.nomeFantasia}
                  onChange={handleFormChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cnpj">
                  CNPJ <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="cnpj"
                  name="cnpj"
                  value={formData.cnpj}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefone">
                  Telefone <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="telefone"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cep">CEP</Label>
                <Input
                  id="cep"
                  name="cep"
                  value={formData.cep}
                  onChange={handleFormChange}
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="endereco">Endereço</Label>
                <Input
                  id="endereco"
                  name="endereco"
                  value={formData.endereco}
                  onChange={handleFormChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cidade">
                  Cidade <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="cidade"
                  name="cidade"
                  value={formData.cidade}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estado">
                  Estado <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="estado"
                  name="estado"
                  value={formData.estado}
                  onChange={handleFormChange}
                  maxLength={2}
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false)
                  setIsAddDialogOpen(false)
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
