"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable, Column } from "@/components/ui/data-table";
import { Dialog } from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form-field";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Plus, Edit, Trash2, FolderTree } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface Categoria {
  id: string;
  nome: string;
  descricao?: string;
  pai?: {
    id: string;
    nome: string;
  } | null;
  _count?: {
    produtos: number;
    subcategorias: number;
  };
}

export default function CategoriasPage() {
  const { fornecedorId } = useAuth();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState<Categoria | null>(null);
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    paiId: "",
  });

  useEffect(() => {
    fetchCategorias();
  }, [fornecedorId]);

  const fetchCategorias = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/categorias?flat=true");
      if (response.ok) {
        const data = await response.json();
        setCategorias(Array.isArray(data.data?.categorias) ? data.data.categorias : []);
      }
    } catch (error) {
      console.error("Error fetching categorias:", error);
      setCategorias([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingCategoria
        ? `/api/categorias/${editingCategoria.id}`
        : "/api/categorias";
      
      const response = await fetch(url, {
        method: editingCategoria ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchCategorias();
        handleCloseDialog();
      }
    } catch (error) {
      console.error("Error saving categoria:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta categoria?")) return;

    try {
      const response = await fetch(`/api/categorias/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchCategorias();
      }
    } catch (error) {
      console.error("Error deleting categoria:", error);
    }
  };

  const handleEdit = (categoria: Categoria) => {
    setEditingCategoria(categoria);
    setFormData({
      nome: categoria.nome,
      descricao: categoria.descricao || "",
      paiId: categoria.pai?.id || "",
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingCategoria(null);
    setFormData({ nome: "", descricao: "", paiId: "" });
  };

  const columns: Column<Categoria>[] = [
    {
      key: "nome",
      label: "Nome",
      sortable: true,
      render: (categoria) => (
        <div className="flex items-center gap-2">
          <FolderTree className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{categoria.nome}</span>
        </div>
      ),
    },
    {
      key: "descricao",
      label: "Descrição",
      render: (categoria) => (
        <span className="text-sm text-muted-foreground">
          {categoria.descricao || "-"}
        </span>
      ),
    },
    {
      key: "pai",
      label: "Categoria Pai",
      render: (categoria) => (
        <span className="text-sm">
          {categoria.pai?.nome || "-"}
        </span>
      ),
    },
    {
      key: "_count",
      label: "Produtos",
      render: (categoria) => (
        <span className="text-sm">
          {categoria._count?.produtos || 0}
        </span>
      ),
    },
    {
      key: "_count.subcategorias",
      label: "Subcategorias",
      render: (categoria) => (
        <span className="text-sm">
          {categoria._count?.subcategorias || 0}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Ações",
      width: "120px",
      render: (categoria) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(categoria)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(categoria.id)}
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
            { label: "Categorias" },
          ]}
        />
        <div className="flex items-center justify-between mt-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Categorias</h1>
            <p className="text-muted-foreground">
              Gerencie as categorias dos seus produtos
            </p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Categoria
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Todas as Categorias</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={categorias}
            columns={columns}
            keyExtractor={(cat) => cat.id}
            loading={loading}
            emptyMessage="Nenhuma categoria cadastrada"
          />
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">
            {editingCategoria ? "Editar Categoria" : "Nova Categoria"}
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
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="paiId" className="text-sm font-medium">
                Categoria Pai (opcional)
              </label>
              <select
                id="paiId"
                value={formData.paiId}
                onChange={(e) => setFormData({ ...formData, paiId: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Nenhuma (categoria raiz)</option>
                {categorias
                  .filter((c) => c.id !== editingCategoria?.id)
                  .map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nome}
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingCategoria ? "Salvar" : "Criar"}
              </Button>
            </div>
          </form>
        </div>
      </Dialog>
    </div>
  );
}
