"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable, Column } from "@/components/ui/data-table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form-field";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Plus, Edit, Trash2, DollarSign, Users, Settings } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

interface ListaPreco {
  id: string;
  nome: string;
  descricao?: string | null;
  tipoDesconto: "percentual" | "fixo";
  valorDesconto: string;
  ativo: boolean;
  totalProdutos?: number;
  totalClientes?: number;
  criadoEm: string;
}

export default function PrecosPage() {
  const { fornecedorId } = useAuth();
  const [listas, setListas] = useState<ListaPreco[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLista, setEditingLista] = useState<ListaPreco | null>(null);
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    tipoDesconto: "percentual" as "percentual" | "fixo",
    valorDesconto: "",
    ativo: true,
  });

  useEffect(() => {
    fetchListas();
  }, [fornecedorId]);

  const fetchListas = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/listas-preco");
      if (response.ok) {
        const data = await response.json();
        // API retorna { success: true, data: { listas: [...], pagination: {...} } }
        const listasData = data.data?.listas || data.data || [];
        setListas(Array.isArray(listasData) ? listasData : []);
      }
    } catch (error) {
      console.error("Error fetching listas:", error);
      setListas([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingLista
        ? `/api/listas-preco/${editingLista.id}`
        : "/api/listas-preco";

      const response = await fetch(url, {
        method: editingLista ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: formData.nome,
          descricao: formData.descricao || undefined,
          tipoDesconto: formData.tipoDesconto,
          valorDesconto: parseFloat(formData.valorDesconto || "0"),
          ativo: formData.ativo,
        }),
      });

      if (response.ok) {
        await fetchListas();
        handleCloseDialog();
      } else {
        const error = await response.json();
        alert(error.error || "Erro ao salvar lista");
      }
    } catch (error) {
      console.error("Error saving lista:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta lista de preços?")) return;

    try {
      const response = await fetch(`/api/listas-preco/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchListas();
      }
    } catch (error) {
      console.error("Error deleting lista:", error);
    }
  };

  const handleEdit = (lista: ListaPreco) => {
    setEditingLista(lista);
    setFormData({
      nome: lista.nome,
      descricao: lista.descricao || "",
      tipoDesconto: lista.tipoDesconto,
      valorDesconto: lista.valorDesconto,
      ativo: lista.ativo,
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingLista(null);
    setFormData({
      nome: "",
      descricao: "",
      tipoDesconto: "percentual",
      valorDesconto: "",
      ativo: true,
    });
  };

  const formatDesconto = (lista: ListaPreco) => {
    const valor = parseFloat(lista.valorDesconto);
    if (lista.tipoDesconto === "percentual") {
      return `${valor}%`;
    }
    return `R$ ${valor.toFixed(2)}`;
  };

  const columns: Column<ListaPreco>[] = [
    {
      key: "nome",
      label: "Nome",
      sortable: true,
      render: (lista) => (
        <div>
          <p className="font-medium">{lista.nome}</p>
          {lista.descricao && (
            <p className="text-xs text-muted-foreground">{lista.descricao}</p>
          )}
        </div>
      ),
    },
    {
      key: "tipoDesconto",
      label: "Desconto",
      render: (lista) => (
        <div>
          <span className="font-medium text-green-600">
            {formatDesconto(lista)}
          </span>
          <p className="text-xs text-muted-foreground capitalize">
            {lista.tipoDesconto}
          </p>
        </div>
      ),
    },
    {
      key: "totais",
      label: "Produtos/Clientes",
      render: (lista) => (
        <div className="flex items-center gap-3 text-sm">
          <span className="flex items-center gap-1">
            <DollarSign className="h-3 w-3" />
            {lista.totalProdutos || 0}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {lista.totalClientes || 0}
          </span>
        </div>
      ),
    },
    {
      key: "ativo",
      label: "Status",
      render: (lista) => (
        <span
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${lista.ativo
            ? "bg-green-100 text-green-800"
            : "bg-gray-100 text-gray-800"
            }`}
        >
          {lista.ativo ? "Ativa" : "Inativa"}
        </span>
      ),
    },
    {
      key: "criadoEm",
      label: "Criada em",
      render: (lista) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(lista.criadoEm)}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Ações",
      width: "150px",
      render: (lista) => (
        <div className="flex items-center gap-1">
          <Link href={`/dashboard/fornecedor/precos/${lista.id}`}>
            <Button variant="ghost" size="sm" title="Gerenciar produtos">
              <Settings className="h-4 w-4" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(lista)}
            title="Editar"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(lista.id)}
            className="text-red-600 hover:text-red-700"
            title="Excluir"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: "/dashboard/fornecedor" },
            { label: "Listas de Preço" },
          ]}
        />
        <div className="flex items-center justify-between mt-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Listas de Preço</h1>
            <p className="text-muted-foreground">
              Gerencie as listas de preços e descontos para seus clientes
            </p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Lista
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Todas as Listas</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={listas}
            columns={columns}
            keyExtractor={(lista) => lista.id}
            loading={loading}
            searchable
            searchPlaceholder="Buscar listas..."
            emptyMessage="Nenhuma lista de preço cadastrada"
          />
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md bg-white dark:bg-gray-900">
          <DialogHeader>
            <DialogTitle>
              {editingLista ? "Editar Lista de Preço" : "Nova Lista de Preço"}
            </DialogTitle>
            <DialogDescription>
              {editingLista ? "Atualize as informações da lista de preço" : "Crie uma nova lista de preço para seus clientes"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              label="Nome"
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              required
            />

            <div className="space-y-2">
              <label htmlFor="descricao" className="text-sm font-medium">
                Descrição (opcional)
              </label>
              <textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) =>
                  setFormData({ ...formData, descricao: e.target.value })
                }
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="tipoDesconto" className="text-sm font-medium">
                Tipo de Desconto
              </label>
              <select
                id="tipoDesconto"
                value={formData.tipoDesconto}
                onChange={(e) =>
                  setFormData({ ...formData, tipoDesconto: e.target.value as any })
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="percentual">Percentual (%)</option>
                <option value="fixo">Valor Fixo (R$)</option>
              </select>
            </div>

            <FormField
              label={formData.tipoDesconto === "percentual" ? "Desconto (%)" : "Desconto (R$)"}
              id="valorDesconto"
              type="number"
              min="0"
              max={formData.tipoDesconto === "percentual" ? "100" : undefined}
              step="0.01"
              value={formData.valorDesconto}
              onChange={(e) =>
                setFormData({ ...formData, valorDesconto: e.target.value })
              }
              required
            />

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="ativo"
                checked={formData.ativo}
                onChange={(e) =>
                  setFormData({ ...formData, ativo: e.target.checked })
                }
                className="h-4 w-4 rounded border-gray-300"
              />
              <label htmlFor="ativo" className="text-sm font-medium">
                Lista ativa
              </label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingLista ? "Salvar" : "Criar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
