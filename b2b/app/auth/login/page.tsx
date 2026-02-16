"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShoppingBag, AlertCircle, Mail, Lock } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    senha: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        senha: formData.senha,
        redirect: false,
      });

      if (result?.error) {
        setError("Email ou senha inválidos");
        setLoading(false);
        return;
      }

      if (result?.ok) {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError("Erro ao fazer login. Tente novamente.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-[hsl(var(--color-neutral-25))] px-[var(--space-4)] py-[var(--space-12)]">
      <div className="w-full max-w-[420px]">
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

        <Card variant="elevated">
          <CardHeader className="text-center space-y-[var(--space-1-5)]">
            <CardTitle className="text-[length:var(--text-xl)]">Bem-vindo de volta</CardTitle>
            <CardDescription>
              Entre com suas credenciais para acessar sua conta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-[var(--space-5)]">
              {error && (
                <div
                  className="flex items-center gap-[var(--space-2)] p-[var(--space-3)] text-[length:var(--text-sm)] text-[hsl(var(--color-error-700))] bg-[hsl(var(--color-error-50))] border border-[hsl(var(--color-error-500)/0.2)] rounded-[var(--radius-md)]"
                  role="alert"
                >
                  <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
                  <span>{error}</span>
                </div>
              )}

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
                <div className="flex items-center justify-between">
                  <Label htmlFor="senha">Senha</Label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-[length:var(--text-xs)] text-[hsl(var(--color-brand-500))] hover:text-[hsl(var(--color-brand-600))] no-underline transition-colors duration-[var(--transition-fast)]"
                  >
                    Esqueceu a senha?
                  </Link>
                </div>
                <Input
                  id="senha"
                  type="password"
                  placeholder="••••••••"
                  value={formData.senha}
                  onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                  required
                  disabled={loading}
                  icon={<Lock />}
                />
              </div>

              <Button type="submit" className="w-full" loading={loading}>
                {loading ? "Entrando..." : "Entrar"}
              </Button>

              <div className="text-center text-[length:var(--text-sm)] text-[hsl(var(--color-neutral-500))]">
                Não tem uma conta?{" "}
                <Link
                  href="/auth/register"
                  className="text-[hsl(var(--color-brand-500))] hover:text-[hsl(var(--color-brand-600))] font-medium no-underline"
                >
                  Cadastre-se
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
