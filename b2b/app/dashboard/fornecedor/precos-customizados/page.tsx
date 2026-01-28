"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Search } from "lucide-react";

interface PrecoCustomizado {
  id: string;
  clienteId: string;
  produtoId: string;
  preco: string;
  criadoEm: string;
  atualizadoEm: string;
  cliente: {
    id: string;
    razaoSocial: string;
    nomeFantasia: string | null;
  };
  produto: {
    id: string;
    nome: string;
    sku: string;
    precoBase: string;
  };
}

interface Cliente {
  id: string;
  razaoSocial: string;
  nomeFantasia: string | null;
}

interface Produto {
  id: string;
  nome: string;
  sku: string;
  precoBase: string;
}

export default function PrecosCustomizadosPage() {
  const [precos, setPrecos] = useState<PrecoCustomizado[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form state
  const [selectedClienteId, setSelectedClienteId] = useState("");
  const [selectedProdutoId, setSelectedProdutoId] = useState("");
  const [preco, setPreco] = useState("");
  
  // Search filters
  const [searchCliente, setSearchCliente] = useState("");
  const [searchProduto, setSearchProduto] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [precosRes, clientesRes, produtosRes] = await Promise.all([
        fetch("/api/precos-customizados"),
        fetch("/api/clientes"),
        fetch("/api/produtos"),
      ]);

      if (precosRes.ok) {
        const data = await precosRes.json();
        setPrecos(data.data || []);
      }

      if (clientesRes.ok) {
        const data = await clientesRes.json();
        setClientes(data.data?.clientes || []);
      }

      if (produtosRes.ok) {
        const data = await produtosRes.json();
        setProdutos(data.data?.produtos || []);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingId
        ? `/api/precos-customizados/${editingId}`
        : "/api/precos-customizados";
      
      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clienteId: selectedClienteId,
          produtoId: selectedProdutoId,
          preco: parseFloat(preco),
        }),
      });

      if (response.ok) {
        await loadData();
        resetForm();
        setIsModalOpen(false);
      } else {
        const error = await response.json();
        alert(error.error || "Erro ao salvar preço customizado");
      }
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar preço customizado");
    }
  };

  const handleEdit = (preco: PrecoCustomizado) => {
    setEditingId(preco.id);
    setSelectedClienteId(preco.clienteId);
    setSelectedProdutoId(preco.produtoId);
    setPreco(preco.preco);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este preço customizado?")) {
      return;
    }

    try {
      const response = await fetch(`/api/precos-customizados/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await loadData();
      } else {
        const error = await response.json();
        alert(error.error || "Erro ao excluir preço customizado");
      }
    } catch (error) {
      console.error("Erro ao excluir:", error);
      alert("Erro ao excluir preço customizado");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setSelectedClienteId("");
    setSelectedProdutoId("");
    setPreco("");
  };

  const formatCurrency = (value: string | number) => {
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(numValue);
  };

  const filteredPrecos = precos.filter((preco) => {
    const clienteMatch = searchCliente
      ? preco.cliente.razaoSocial.toLowerCase().includes(searchCliente.toLowerCase()) ||
        preco.cliente.nomeFantasia?.toLowerCase().includes(searchCliente.toLowerCase())
      : true;
    
    const produtoMatch = searchProduto
      ? preco.produto.nome.toLowerCase().includes(searchProduto.toLowerCase()) ||
        preco.produto.sku.toLowerCase().includes(searchProduto.toLowerCase())
      : true;

    return clienteMatch && produtoMatch;
  });

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Preços Customizados</h1>
          <p className="text-gray-600 mt-1">
            Gerencie preços especiais para clientes específicos
          </p>
        </div>

        <Dialog open={isModalOpen} onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Preço
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Editar Preço" : "Novo Preço Customizado"}
              </DialogTitle>
              <DialogDescription>
                Configure um preço especial para um cliente específico
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Cliente</label>
                <select
                  value={selectedClienteId}
                  onChange={(e) => setSelectedClienteId(e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                  disabled={!!editingId}
                >
                  <option value="">Selecione um cliente</option>
                  {clientes.map((cliente) => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.nomeFantasia || cliente.razaoSocial}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Produto</label>
                <select
                  value={selectedProdutoId}
                  onChange={(e) => setSelectedProdutoId(e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                  disabled={!!editingId}
                >
                  <option value="">Selecione um produto</option>
                  {produtos.map((produto) => (
                    <option key={produto.id} value={produto.id}>
                      {produto.nome} (SKU: {produto.sku}) - {formatCurrency(produto.precoBase)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Preço Customizado</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={preco}
                  onChange={(e) => setPreco(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingId ? "Atualizar" : "Criar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-2">Buscar por Cliente</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchCliente}
                  onChange={(e) => setSearchCliente(e.target.value)}
                  className="w-full pl-10 p-2 border rounded"
                  placeholder="Nome ou razão social..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Buscar por Produto</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchProduto}
                  onChange={(e) => setSearchProduto(e.target.value)}
                  className="w-full pl-10 p-2 border rounded"
                  placeholder="Nome ou SKU..."
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Preços Cadastrados</CardTitle>
          <CardDescription>
            {filteredPrecos.length} {filteredPrecos.length === 1 ? "preço" : "preços"} encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Cliente</th>
                  <th className="text-left py-3 px-4">Produto</th>
                  <th className="text-right py-3 px-4">Preço Base</th>
                  <th className="text-right py-3 px-4">Preço Customizado</th>
                  <th className="text-right py-3 px-4">Economia</th>
                  <th className="text-right py-3 px-4">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredPrecos.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500">
                      Nenhum preço customizado encontrado
                    </td>
                  </tr>
                ) : (
                  filteredPrecos.map((preco) => {
                    const economia = parseFloat(preco.produto.precoBase) - parseFloat(preco.preco);
                    const economiaPercent = (economia / parseFloat(preco.produto.precoBase)) * 100;

                    return (
                      <tr key={preco.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          {preco.cliente.nomeFantasia || preco.cliente.razaoSocial}
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium">{preco.produto.nome}</div>
                            <div className="text-sm text-gray-500">SKU: {preco.produto.sku}</div>
                          </div>
                        </td>
                        <td className="text-right py-3 px-4">
                          {formatCurrency(preco.produto.precoBase)}
                        </td>
                        <td className="text-right py-3 px-4 font-semibold text-green-600">
                          {formatCurrency(preco.preco)}
                        </td>
                        <td className="text-right py-3 px-4">
                          <div className="text-sm">
                            {formatCurrency(economia)}
                            <div className="text-xs text-gray-500">
                              ({economiaPercent.toFixed(1)}%)
                            </div>
                          </div>
                        </td>
                        <td className="text-right py-3 px-4">
                          <div className="flex gap-2 justify-end">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(preco)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(preco.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
