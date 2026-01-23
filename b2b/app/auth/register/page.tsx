"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingBag, AlertCircle, CheckCircle2 } from "lucide-react";

type UserType = "FORNECEDOR" | "CLIENTE";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState<UserType>("CLIENTE");
  const [formData, setFormData] = useState({
    email: "",
    senha: "",
    nome: "",
    telefone: "",
    // Fornecedor fields
    razaoSocial: "",
    nomeFantasia: "",
    cnpj: "",
    descricao: "",
    // Cliente fields
    endereco: "",
    cidade: "",
    estado: "",
    cep: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload: any = {
        email: formData.email,
        senha: formData.senha,
        nome: formData.nome,
        telefone: formData.telefone,
        tipo: userType,
      };

      if (userType === "FORNECEDOR") {
        payload.razaoSocial = formData.razaoSocial;
        payload.nomeFantasia = formData.nomeFantasia;
        payload.cnpj = formData.cnpj;
        payload.descricao = formData.descricao;
      } else {
        payload.endereco = formData.endereco;
        payload.cidade = formData.cidade;
        payload.estado = formData.estado;
        payload.cep = formData.cep;
      }

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Erro ao criar conta");
        setLoading(false);
        return;
      }

      // Auto login after successful registration
      const signInResult = await signIn("credentials", {
        email: formData.email,
        senha: formData.senha,
        redirect: false,
      });

      if (signInResult?.ok) {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError("Erro ao criar conta. Tente novamente.");
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="space-y-3">
        <label className="text-sm font-medium">Tipo de Conta</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setUserType("CLIENTE")}
            className={`p-4 border-2 rounded-lg text-left transition-all ${
              userType === "CLIENTE"
                ? "border-primary bg-primary/5"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="font-semibold">Cliente</div>
            <div className="text-xs text-muted-foreground mt-1">Comprar produtos</div>
          </button>
          <button
            type="button"
            onClick={() => setUserType("FORNECEDOR")}
            className={`p-4 border-2 rounded-lg text-left transition-all ${
              userType === "FORNECEDOR"
                ? "border-primary bg-primary/5"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="font-semibold">Fornecedor</div>
            <div className="text-xs text-muted-foreground mt-1">Vender produtos</div>
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="nome" className="text-sm font-medium">
          Nome Completo
        </label>
        <Input
          id="nome"
          type="text"
          placeholder="Seu nome completo"
          value={formData.nome}
          onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
          required
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <Input
          id="email"
          type="email"
          placeholder="seu@email.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="senha" className="text-sm font-medium">
          Senha
        </label>
        <Input
          id="senha"
          type="password"
          placeholder="Mínimo 6 caracteres"
          value={formData.senha}
          onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
          required
          minLength={6}
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="telefone" className="text-sm font-medium">
          Telefone
        </label>
        <Input
          id="telefone"
          type="tel"
          placeholder="(11) 98765-4321"
          value={formData.telefone}
          onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
          disabled={loading}
        />
      </div>

      <Button
        type="button"
        className="w-full"
        onClick={() => setStep(2)}
        disabled={!formData.nome || !formData.email || !formData.senha || loading}
      >
        Próximo
      </Button>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="razaoSocial" className="text-sm font-medium">
          Razão Social
        </label>
        <Input
          id="razaoSocial"
          type="text"
          placeholder="Razão social da empresa"
          value={formData.razaoSocial}
          onChange={(e) => setFormData({ ...formData, razaoSocial: e.target.value })}
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="nomeFantasia" className="text-sm font-medium">
          Nome Fantasia
        </label>
        <Input
          id="nomeFantasia"
          type="text"
          placeholder="Nome fantasia da empresa"
          value={formData.nomeFantasia}
          onChange={(e) => setFormData({ ...formData, nomeFantasia: e.target.value })}
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="cnpj" className="text-sm font-medium">
          CNPJ
        </label>
        <Input
          id="cnpj"
          type="text"
          placeholder="00.000.000/0000-00"
          value={formData.cnpj}
          onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
          disabled={loading}
        />
      </div>

      {userType === "FORNECEDOR" ? (
        <div className="space-y-2">
          <label htmlFor="descricao" className="text-sm font-medium">
            Descrição da Empresa
          </label>
          <textarea
            id="descricao"
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Conte sobre sua empresa..."
            value={formData.descricao}
            onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
            disabled={loading}
          />
        </div>
      ) : (
        <>
          <div className="space-y-2">
            <label htmlFor="endereco" className="text-sm font-medium">
              Endereço
            </label>
            <Input
              id="endereco"
              type="text"
              placeholder="Rua, número, bairro"
              value={formData.endereco}
              onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label htmlFor="cidade" className="text-sm font-medium">
                Cidade
              </label>
              <Input
                id="cidade"
                type="text"
                placeholder="Cidade"
                value={formData.cidade}
                onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="estado" className="text-sm font-medium">
                Estado
              </label>
              <Input
                id="estado"
                type="text"
                placeholder="SP"
                maxLength={2}
                value={formData.estado}
                onChange={(e) => setFormData({ ...formData, estado: e.target.value.toUpperCase() })}
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="cep" className="text-sm font-medium">
              CEP
            </label>
            <Input
              id="cep"
              type="text"
              placeholder="00000-000"
              value={formData.cep}
              onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
              disabled={loading}
            />
          </div>
        </>
      )}

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => setStep(1)}
          disabled={loading}
        >
          Voltar
        </Button>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Criando conta..." : "Criar conta"}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-primary">
            <ShoppingBag className="h-8 w-8" />
            <span>B2B Marketplace</span>
          </Link>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Criar conta</CardTitle>
            <CardDescription className="text-center">
              Passo {step} de 2 - {step === 1 ? "Informações básicas" : "Dados da empresa"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="flex items-center gap-2 p-3 mb-4 text-sm text-red-800 bg-red-50 border border-red-200 rounded-md">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              )}

              {step === 1 ? renderStep1() : renderStep2()}

              <div className="mt-4 text-center text-sm text-muted-foreground">
                Já tem uma conta?{" "}
                <Link href="/auth/login" className="text-primary hover:underline font-medium">
                  Faça login
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-muted-foreground hover:text-primary">
            ← Voltar para página inicial
          </Link>
        </div>
      </div>
    </div>
  );
}
