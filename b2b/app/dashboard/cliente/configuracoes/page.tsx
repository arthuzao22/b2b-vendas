"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { useAuth } from "@/hooks/useAuth";
import { User, Building2, MapPin, Bell, Save } from "lucide-react";

interface ClienteData {
    id: string;
    razaoSocial: string;
    nomeFantasia: string | null;
    cnpj: string;
    inscricaoEstadual: string | null;
    endereco: string | null;
    cidade: string | null;
    estado: string | null;
    cep: string | null;
    usuario: {
        id: string;
        nome: string;
        email: string;
        telefone: string | null;
    };
}

export default function ConfiguracoesClientePage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [cliente, setCliente] = useState<ClienteData | null>(null);
    const [formData, setFormData] = useState({
        nome: "",
        telefone: "",
        razaoSocial: "",
        nomeFantasia: "",
        inscricaoEstadual: "",
        endereco: "",
        cidade: "",
        estado: "",
        cep: "",
    });
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    useEffect(() => {
        fetchClienteData();
    }, []);

    const fetchClienteData = async () => {
        try {
            const response = await fetch("/api/clientes/me");
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.data) {
                    setCliente(data.data);
                    setFormData({
                        nome: data.data.usuario?.nome || "",
                        telefone: data.data.usuario?.telefone || "",
                        razaoSocial: data.data.razaoSocial || "",
                        nomeFantasia: data.data.nomeFantasia || "",
                        inscricaoEstadual: data.data.inscricaoEstadual || "",
                        endereco: data.data.endereco || "",
                        cidade: data.data.cidade || "",
                        estado: data.data.estado || "",
                        cep: data.data.cep || "",
                    });
                }
            }
        } catch (error) {
            console.error("Error fetching cliente data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        try {
            const response = await fetch("/api/clientes/me", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setMessage({ type: "success", text: "Configurações salvas com sucesso!" });
                await fetchClienteData();
            } else {
                const errorData = await response.json();
                setMessage({ type: "error", text: errorData.message || "Erro ao salvar configurações" });
            }
        } catch (error) {
            setMessage({ type: "error", text: "Erro ao salvar configurações" });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <Breadcrumbs
                    items={[
                        { label: "Dashboard", href: "/dashboard/cliente" },
                        { label: "Configurações" },
                    ]}
                />
                <LoadingSkeleton className="h-8 w-48" />
                <div className="grid gap-6 md:grid-cols-2">
                    <LoadingSkeleton className="h-64" />
                    <LoadingSkeleton className="h-64" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <Breadcrumbs
                    items={[
                        { label: "Dashboard", href: "/dashboard/cliente" },
                        { label: "Configurações" },
                    ]}
                />
                <div className="mt-4">
                    <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
                    <p className="text-muted-foreground">
                        Gerencie suas informações pessoais e da empresa
                    </p>
                </div>
            </div>

            {message && (
                <div
                    className={`p-4 rounded-md ${message.type === "success"
                            ? "bg-green-50 text-green-800 border border-green-200"
                            : "bg-red-50 text-red-800 border border-red-200"
                        }`}
                >
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Dados Pessoais */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Dados Pessoais
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField
                                label="Nome"
                                id="nome"
                                value={formData.nome}
                                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                required
                            />

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Email</label>
                                <input
                                    type="email"
                                    value={cliente?.usuario?.email || ""}
                                    disabled
                                    className="w-full px-3 py-2 border rounded-md bg-gray-50 text-gray-500"
                                />
                                <p className="text-xs text-muted-foreground">
                                    O email não pode ser alterado
                                </p>
                            </div>

                            <FormField
                                label="Telefone"
                                id="telefone"
                                value={formData.telefone}
                                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                                placeholder="(00) 00000-0000"
                            />
                        </CardContent>
                    </Card>

                    {/* Dados da Empresa */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="h-5 w-5" />
                                Dados da Empresa
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField
                                label="Razão Social"
                                id="razaoSocial"
                                value={formData.razaoSocial}
                                onChange={(e) => setFormData({ ...formData, razaoSocial: e.target.value })}
                                required
                            />

                            <FormField
                                label="Nome Fantasia"
                                id="nomeFantasia"
                                value={formData.nomeFantasia}
                                onChange={(e) => setFormData({ ...formData, nomeFantasia: e.target.value })}
                            />

                            <div className="space-y-2">
                                <label className="text-sm font-medium">CNPJ</label>
                                <input
                                    type="text"
                                    value={cliente?.cnpj || ""}
                                    disabled
                                    className="w-full px-3 py-2 border rounded-md bg-gray-50 text-gray-500"
                                />
                                <p className="text-xs text-muted-foreground">
                                    O CNPJ não pode ser alterado
                                </p>
                            </div>

                            <FormField
                                label="Inscrição Estadual"
                                id="inscricaoEstadual"
                                value={formData.inscricaoEstadual}
                                onChange={(e) => setFormData({ ...formData, inscricaoEstadual: e.target.value })}
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* Endereço */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="h-5 w-5" />
                            Endereço
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="md:col-span-2">
                                <FormField
                                    label="Endereço"
                                    id="endereco"
                                    value={formData.endereco}
                                    onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                                    placeholder="Rua, número, complemento"
                                />
                            </div>

                            <FormField
                                label="Cidade"
                                id="cidade"
                                value={formData.cidade}
                                onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    label="Estado"
                                    id="estado"
                                    value={formData.estado}
                                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                                    maxLength={2}
                                    placeholder="UF"
                                />

                                <FormField
                                    label="CEP"
                                    id="cep"
                                    value={formData.cep}
                                    onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                                    placeholder="00000-000"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Notificações */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="h-5 w-5" />
                            Notificações
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Notificações por Email</p>
                                    <p className="text-sm text-muted-foreground">
                                        Receba atualizações sobre seus pedidos por email
                                    </p>
                                </div>
                                <input
                                    type="checkbox"
                                    defaultChecked
                                    className="h-4 w-4"
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Novidades e Promoções</p>
                                    <p className="text-sm text-muted-foreground">
                                        Receba informações sobre novos produtos e ofertas
                                    </p>
                                </div>
                                <input
                                    type="checkbox"
                                    defaultChecked
                                    className="h-4 w-4"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button type="submit" disabled={saving}>
                        <Save className="mr-2 h-4 w-4" />
                        {saving ? "Salvando..." : "Salvar Alterações"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
