"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { DataTable, Column } from "@/components/ui/data-table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { PageHeader } from "@/components/layout/page-header";
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
          <p className="font-medium text-[hsl(var(--color-neutral-800))]">{lista.nome}</p>
          {lista.descricao && (
            <p className="text-[length:var(--text-xs)] text-[hsl(var(--color-neutral-500))]">{lista.descricao}</p>
          )}
        </div>
      ),
    },
    {
      key: "tipoDesconto",
      label: "Desconto",
      render: (lista) => (
        <div>
          <span className="font-medium text-[hsl(var(--color-success-600))]">
            {formatDesconto(lista)}
          </span>
          <p className="text-[length:var(--text-xs)] text-[hsl(var(--color-neutral-500))] capitalize">
            {lista.tipoDesconto}
          </p>
        </div>
      ),
    },
    {
      key: "totais",
      label: "Produtos/Clientes",
      render: (lista) => (
        <div className="flex items-center gap-[var(--space-3)] text-[length:var(--text-sm)]">
          <span className="flex items-center gap-[var(--space-1)] text-[hsl(var(--color-neutral-600))]">
            <DollarSign className="size-3.5" />
            {lista.totalProdutos || 0}
          </span>
          <span className="flex items-center gap-[var(--space-1)] text-[hsl(var(--color-neutral-600))]">
            <Users className="size-3.5" />
            {lista.totalClientes || 0}
          </span>
        </div>
      ),
    },
    {
      key: "ativo",
      label: "Status",
      render: (lista) => (
        <Badge variant={lista.ativo ? "success" : "neutral"}>
          {lista.ativo ? "Ativa" : "Inativa"}
        </Badge>
      ),
    },
    {
      key: "criadoEm",
      label: "Criada em",
      render: (lista) => (
        <span className="text-[length:var(--text-sm)] text-[hsl(var(--color-neutral-500))]">
          {formatDate(lista.criadoEm)}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Ações",
      width: "150px",
      render: (lista) => (
        <div className="flex items-center gap-[var(--space-1)]">
          <Button variant="ghost" size="sm" title="Gerenciar produtos" asChild>
            <Link href={`/dashboard/fornecedor/precos/${lista.id}`}>
              <Settings className="size-4" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(lista)}
            title="Editar"
          >
            <Edit className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(lista.id)}
            className="text-[hsl(var(--color-error-500))] hover:text-[hsl(var(--color-error-700))] hover:bg-[hsl(var(--color-error-50))]"
            title="Excluir"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-[var(--space-6)]">
      <div>
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: "/dashboard/fornecedor" },
            { label: "Listas de Preço" },
          ]}
        />
        <div className="flex items-center justify-between mt-[var(--space-4)]">
          <div>
            <h1 className="text-[length:var(--text-2xl)] font-bold tracking-tight text-[hsl(var(--color-neutral-900))]">
              Listas de Preço
            </h1>
            <p className="text-[length:var(--text-sm)] text-[hsl(var(--color-neutral-500))] mt-[var(--space-1)]">
              Gerencie as listas de preços e descontos para seus clientes
            </p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 size-4" />
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

      {/* Modal — Design System Pattern */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingLista ? "Editar Lista de Preço" : "Nova Lista de Preço"}
            </DialogTitle>
            <DialogDescription>
              {editingLista ? "Atualize as informações da lista de preço" : "Crie uma nova lista de preço para seus clientes"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-[var(--space-4)] p-[var(--space-6)] pt-[var(--space-4)]">
            <div className="space-y-[var(--space-2)]">
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Ex: Lista VIP"
                required
              />
            </div>

            <div className="space-y-[var(--space-2)]">
              <Label htmlFor="descricao">Descrição (opcional)</Label>
              <textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) =>
                  setFormData({ ...formData, descricao: e.target.value })
                }
                className="flex min-h-[80px] w-full rounded-[var(--radius-md)] border border-[hsl(var(--color-neutral-200))] bg-[hsl(var(--color-neutral-0))] px-[var(--space-3)] py-[var(--space-2)] text-[length:var(--text-sm)] text-[hsl(var(--color-neutral-700))] placeholder:text-[hsl(var(--color-neutral-400))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-brand-500))] focus-visible:ring-offset-2 transition-all duration-[var(--transition-fast)]"
                rows={3}
                placeholder="Descreva esta lista de preço..."
              />
            </div>

            <div className="space-y-[var(--space-2)]">
              <Label htmlFor="tipoDesconto">Tipo de Desconto</Label>
              <select
                id="tipoDesconto"
                value={formData.tipoDesconto}
                onChange={(e) =>
                  setFormData({ ...formData, tipoDesconto: e.target.value as "percentual" | "fixo" })
                }
                className="flex h-9 w-full rounded-[var(--radius-md)] border border-[hsl(var(--color-neutral-200))] bg-[hsl(var(--color-neutral-0))] px-[var(--space-3)] py-[var(--space-2)] text-[length:var(--text-sm)] text-[hsl(var(--color-neutral-700))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-brand-500))] focus-visible:ring-offset-2 transition-all duration-[var(--transition-fast)]"
              >
                <option value="percentual">Percentual (%)</option>
                <option value="fixo">Valor Fixo (R$)</option>
              </select>
            </div>

            <div className="space-y-[var(--space-2)]">
              <Label htmlFor="valorDesconto">
                {formData.tipoDesconto === "percentual" ? "Desconto (%)" : "Desconto (R$)"} *
              </Label>
              <Input
                id="valorDesconto"
                type="number"
                min="0"
                max={formData.tipoDesconto === "percentual" ? "100" : undefined}
                step="0.01"
                value={formData.valorDesconto}
                onChange={(e) =>
                  setFormData({ ...formData, valorDesconto: e.target.value })
                }
                placeholder="0.00"
                required
              />
            </div>

            <div className="flex items-center gap-[var(--space-3)]">
              <input
                type="checkbox"
                id="ativo"
                checked={formData.ativo}
                onChange={(e) =>
                  setFormData({ ...formData, ativo: e.target.checked })
                }
                className="size-4 rounded-[var(--radius-sm)] border-[hsl(var(--color-neutral-300))] text-[hsl(var(--color-brand-500))] focus:ring-[hsl(var(--color-brand-500))]"
              />
              <Label htmlFor="ativo" className="cursor-pointer">Lista ativa</Label>
            </div>

            <DialogFooter>
              <Button type="button" variant="secondary" onClick={handleCloseDialog}>
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
