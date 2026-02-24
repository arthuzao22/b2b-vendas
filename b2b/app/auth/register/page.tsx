"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShoppingBag, AlertCircle, Mail, Lock, User, Phone, Building, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

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
    razaoSocial: "",
    nomeFantasia: "",
    cnpj: "",
    descricao: "",
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
        tipo: userType.toLowerCase(),
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
    <div className="space-y-[var(--space-5)]">
      {/* User Type Selection */}
      <div className="space-y-[var(--space-2)]">
        <Label>Tipo de Conta</Label>
        <div className="grid grid-cols-2 gap-[var(--space-3)]">
          {(["CLIENTE", "FORNECEDOR"] as UserType[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setUserType(type)}
              className={cn(
                "p-[var(--space-4)] border-2 rounded-[var(--radius-lg)] text-left",
                "transition-all duration-[var(--transition-base)]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-brand-500))]",
                userType === type
                  ? "border-[hsl(var(--color-brand-500))] bg-[hsl(var(--color-brand-50))]"
                  : "border-[hsl(var(--color-neutral-200))] hover:border-[hsl(var(--color-neutral-300))]"
              )}
            >
              <div className="font-semibold text-[hsl(var(--color-neutral-800))]">
                {type === "CLIENTE" ? "Cliente" : "Fornecedor"}
              </div>
              <div className="text-[length:var(--text-xs)] text-[hsl(var(--color-neutral-500))] mt-[var(--space-0-5)]">
                {type === "CLIENTE" ? "Comprar produtos" : "Vender produtos"}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-[var(--space-1-5)]">
        <Label htmlFor="nome">Nome Completo</Label>
        <Input
          id="nome"
          type="text"
          placeholder="Seu nome completo"
          value={formData.nome}
          onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
          required
          disabled={loading}
          icon={<User />}
        />
      </div>

      <div className="space-y-[var(--space-1-5)]">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="seu@email.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
          disabled={loading}
          icon={<Mail />}
        />
      </div>

      <div className="space-y-[var(--space-1-5)]">
        <Label htmlFor="senha">Senha</Label>
        <Input
          id="senha"
          type="password"
          placeholder="Mínimo 6 caracteres"
          value={formData.senha}
          onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
          required
          minLength={6}
          disabled={loading}
          icon={<Lock />}
        />
      </div>

      <div className="space-y-[var(--space-1-5)]">
        <Label htmlFor="telefone">Telefone</Label>
        <Input
          id="telefone"
          type="tel"
          placeholder="(11) 98765-4321"
          value={formData.telefone}
          onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
          disabled={loading}
          icon={<Phone />}
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
    <div className="space-y-[var(--space-5)]">
      <div className="space-y-[var(--space-1-5)]">
        <Label htmlFor="razaoSocial">Razão Social</Label>
        <Input
          id="razaoSocial"
          type="text"
          placeholder="Razão social da empresa"
          value={formData.razaoSocial}
          onChange={(e) => setFormData({ ...formData, razaoSocial: e.target.value })}
          disabled={loading}
          icon={<Building />}
        />
      </div>

      <div className="space-y-[var(--space-1-5)]">
        <Label htmlFor="nomeFantasia">Nome Fantasia</Label>
        <Input
          id="nomeFantasia"
          type="text"
          placeholder="Nome fantasia da empresa"
          value={formData.nomeFantasia}
          onChange={(e) => setFormData({ ...formData, nomeFantasia: e.target.value })}
          disabled={loading}
        />
      </div>

      <div className="space-y-[var(--space-1-5)]">
        <Label htmlFor="cnpj">CNPJ</Label>
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
        <div className="space-y-[var(--space-1-5)]">
          <Label htmlFor="descricao">Descrição da Empresa</Label>
          <textarea
            id="descricao"
            className={cn(
              "flex min-h-[80px] w-full rounded-[var(--radius-md)]",
              "border border-[hsl(var(--color-neutral-200))] bg-[hsl(var(--color-neutral-0))]",
              "px-[var(--space-3)] py-[var(--space-2)]",
              "text-[length:var(--text-base)] text-[hsl(var(--color-neutral-700))]",
              "placeholder:text-[hsl(var(--color-neutral-400))]",
              "transition-all duration-[var(--transition-fast)]",
              "focus-visible:outline-none focus-visible:border-[hsl(var(--color-brand-500))]",
              "focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-brand-500)/0.2)]",
              "disabled:cursor-not-allowed disabled:opacity-50"
            )}
            placeholder="Conte sobre sua empresa..."
            value={formData.descricao}
            onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
            disabled={loading}
          />
        </div>
      ) : (
        <>
          <div className="space-y-[var(--space-1-5)]">
            <Label htmlFor="endereco">Endereço</Label>
            <Input
              id="endereco"
              type="text"
              placeholder="Rua, número, bairro"
              value={formData.endereco}
              onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
              disabled={loading}
              icon={<MapPin />}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[var(--space-3)]">
            <div className="space-y-[var(--space-1-5)]">
              <Label htmlFor="cidade">Cidade</Label>
              <Input
                id="cidade"
                type="text"
                placeholder="Cidade"
                value={formData.cidade}
                onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                disabled={loading}
              />
            </div>
            <div className="space-y-[var(--space-1-5)]">
              <Label htmlFor="estado">Estado</Label>
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

          <div className="space-y-[var(--space-1-5)]">
            <Label htmlFor="cep">CEP</Label>
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

      <div className="flex gap-[var(--space-3)]">
        <Button
          type="button"
          variant="secondary"
          className="w-full"
          onClick={() => setStep(1)}
          disabled={loading}
        >
          Voltar
        </Button>
        <Button type="submit" className="w-full" loading={loading}>
          {loading ? "Criando conta..." : "Criar conta"}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-[hsl(var(--color-neutral-25))] px-[var(--space-4)] py-[var(--space-12)]">
      <div className="w-full max-w-[460px]">
        {/* Logo */}
        <div className="flex justify-center mb-[var(--space-8)]">
          <Link
            href="/"
            className="flex items-center gap-[var(--space-2)] no-underline"
          >
            <ShoppingBag className="size-8 text-[hsl(var(--color-brand-500))]" aria-hidden="true" />
            <span className="text-[length:var(--text-xl)] font-bold text-[hsl(var(--color-neutral-900))]">
              B2B Marketplace
            </span>
          </Link>
        </div>

        {/* Step Progress */}
        <div className="flex items-center gap-[var(--space-2)] mb-[var(--space-6)] px-[var(--space-2)]">
          <div className={cn(
            "flex-1 h-1 rounded-full transition-colors duration-[var(--transition-base)]",
            "bg-[hsl(var(--color-brand-500))]"
          )} />
          <div className={cn(
            "flex-1 h-1 rounded-full transition-colors duration-[var(--transition-base)]",
            step >= 2 ? "bg-[hsl(var(--color-brand-500))]" : "bg-[hsl(var(--color-neutral-200))]"
          )} />
        </div>

        <Card variant="elevated">
          <CardHeader className="text-center space-y-[var(--space-1-5)]">
            <CardTitle className="text-[length:var(--text-xl)]">Criar conta</CardTitle>
            <CardDescription>
              Passo {step} de 2 — {step === 1 ? "Informações básicas" : "Dados da empresa"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              {error && (
                <div
                  className="flex items-center gap-[var(--space-2)] p-[var(--space-3)] mb-[var(--space-5)] text-[length:var(--text-sm)] text-[hsl(var(--color-error-700))] bg-[hsl(var(--color-error-50))] border border-[hsl(var(--color-error-500)/0.2)] rounded-[var(--radius-md)]"
                  role="alert"
                >
                  <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
                  <span>{error}</span>
                </div>
              )}

              {step === 1 ? renderStep1() : renderStep2()}

              <div className="mt-[var(--space-5)] text-center text-[length:var(--text-sm)] text-[hsl(var(--color-neutral-500))]">
                Já tem uma conta?{" "}
                <Link
                  href="/auth/login"
                  className="text-[hsl(var(--color-brand-500))] hover:text-[hsl(var(--color-brand-600))] font-medium no-underline"
                >
                  Faça login
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="mt-[var(--space-6)] text-center">
          <Link
            href="/"
            className="text-[length:var(--text-sm)] text-[hsl(var(--color-neutral-500))] hover:text-[hsl(var(--color-brand-500))] no-underline transition-colors duration-[var(--transition-fast)]"
          >
            ← Voltar para página inicial
          </Link>
        </div>
      </div>
    </div>
  );
}
