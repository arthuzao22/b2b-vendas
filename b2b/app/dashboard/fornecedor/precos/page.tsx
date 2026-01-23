"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable, Column } from "@/components/ui/data-table";
import { Dialog } from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form-field";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { PriceDisplay } from "@/components/ui/price-display";
import { Plus, Edit, Trash2, DollarSign, Users } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { formatDate } from "@/lib/utils";

interface ListaPreco {
  id: string;
  nome: string;
  descricao?: string;
  ativa: boolean;
  dataInicio: Date;
  dataFim?: Date | null;
  descontoPercentual: number;
  _count?: {
    precos: number;
    clientes: number;
  };
  criadoEm: Date;
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
    dataInicio: "",
    dataFim: "",
    descontoPercentual: "",
    ativa: true,
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
        setListas(Array.isArray(data.data) ? data.data : []);
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
          ...formData,
          descontoPercentual: parseFloat(formData.descontoPercentual || "0"),
        }),
      });

      if (response.ok) {
        await fetchListas();
        handleCloseDialog();
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
      dataInicio: new Date(lista.dataInicio).toISOString().split("T")[0],
      dataFim: lista.dataFim ? new Date(lista.dataFim).toISOString().split("T")[0] : "",
      descontoPercentual: lista.descontoPercentual.toString(),
      ativa: lista.ativa,
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingLista(null);
    setFormData({
      nome: "",
      descricao: "",
      dataInicio: "",
      dataFim: "",
      descontoPercentual: "",
      ativa: true,
    });
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
      key: "descontoPercentual",
      label: "Desconto",
      render: (lista) => (
        <span className="font-medium text-green-600">
          {lista.descontoPercentual}%
        </span>
      ),
    },
    {
      key: "dataInicio",
      label: "Vigência",
      render: (lista) => (
        <div className="text-sm">
          <p>Início: {formatDate(lista.dataInicio)}</p>
          {lista.dataFim && <p>Fim: {formatDate(lista.dataFim)}</p>}
        </div>
      ),
    },
    {
      key: "_count",
      label: "Preços/Clientes",
      render: (lista) => (
        <div className="flex items-center gap-3 text-sm">
          <span className="flex items-center gap-1">
            <DollarSign className="h-3 w-3" />
            {lista._count?.precos || 0}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {lista._count?.clientes || 0}
          </span>
        </div>
      ),
    },
    {
      key: "ativa",
      label: "Status",
      render: (lista) => (
        <span
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            lista.ativa
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {lista.ativa ? "Ativa" : "Inativa"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Ações",
      width: "120px",
      render: (lista) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(lista)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(lista.id)}
            className="text-red-600 hover:text-red-700"
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
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">
            {editingLista ? "Editar Lista de Preço" : "Nova Lista de Preço"}
          </h2>
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
                Descrição
              </label>
              <textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) =>
                  setFormData({ ...formData, descricao: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-md"
                rows={3}
              />
            </div>

            <FormField
              label="Desconto Percentual"
              id="descontoPercentual"
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={formData.descontoPercentual}
              onChange={(e) =>
                setFormData({ ...formData, descontoPercentual: e.target.value })
              }
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Data Início"
                id="dataInicio"
                type="date"
                value={formData.dataInicio}
                onChange={(e) =>
                  setFormData({ ...formData, dataInicio: e.target.value })
                }
                required
              />

              <FormField
                label="Data Fim (opcional)"
                id="dataFim"
                type="date"
                value={formData.dataFim}
                onChange={(e) =>
                  setFormData({ ...formData, dataFim: e.target.value })
                }
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="ativa"
                checked={formData.ativa}
                onChange={(e) =>
                  setFormData({ ...formData, ativa: e.target.checked })
                }
                className="h-4 w-4"
              />
              <label htmlFor="ativa" className="text-sm font-medium">
                Lista ativa
              </label>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingLista ? "Salvar" : "Criar"}
              </Button>
            </div>
          </form>
        </div>
      </Dialog>
    </div>
  );
}
