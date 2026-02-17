"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingBag, AlertCircle, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // TODO: Implement password reset email sending
      // This would typically call an API endpoint that sends a reset email
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erro ao enviar email");
      }

      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao enviar email de recuperação. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--color-neutral-25))] px-[var(--space-4)] py-[var(--space-12)]">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-[var(--space-8)]">
          <Link href="/" className="flex items-center gap-[var(--space-2)] text-[length:var(--text-2xl)] font-bold text-primary">
            <ShoppingBag className="h-8 w-8" />
            <span>B2B Marketplace</span>
          </Link>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-[length:var(--text-2xl)] font-bold text-center text-[hsl(var(--color-neutral-900))]">Esqueceu sua senha?</CardTitle>
            <CardDescription className="text-center text-[hsl(var(--color-neutral-500))]">
              Digite seu email e enviaremos instruções para redefinir sua senha
            </CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="space-y-4">
                <div className="flex items-center gap-[var(--space-2)] p-[var(--space-3)] text-[length:var(--text-sm)] text-[hsl(var(--color-success-700))] bg-[hsl(var(--color-success-50))] border border-[hsl(var(--color-success-200))] rounded-[var(--radius-md)]">
                  <CheckCircle className="h-4 w-4 shrink-0" />
                  <span>
                    Email enviado! Verifique sua caixa de entrada e siga as instruções.
                  </span>
                </div>
                <Link href="/auth/login">
                  <Button className="w-full">Voltar para o login</Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="flex items-center gap-[var(--space-2)] p-[var(--space-3)] text-[length:var(--text-sm)] text-[hsl(var(--color-error-700))] bg-[hsl(var(--color-error-50))] border border-[hsl(var(--color-error-200))] rounded-[var(--radius-md)]">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="space-y-[var(--space-2)]">
                  <label htmlFor="email" className="text-[length:var(--text-sm)] font-medium text-[hsl(var(--color-neutral-700))]">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Enviando..." : "Enviar instruções"}
                </Button>

                <div className="text-center text-sm">
                  <Link href="/auth/login" className="text-primary hover:underline">
                    Voltar para o login
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        <div className="mt-[var(--space-6)] text-center">
          <Link href="/" className="text-[length:var(--text-sm)] text-[hsl(var(--color-neutral-500))] hover:text-primary">
            ← Voltar para página inicial
          </Link>
        </div>
      </div>
    </div>
  );
}
