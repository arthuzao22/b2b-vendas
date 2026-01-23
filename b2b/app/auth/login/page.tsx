"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingBag, AlertCircle } from "lucide-react";

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
        password: formData.senha,
        redirect: false,
      });

      if (result?.error) {
        setError("Email ou senha inválidos");
        setLoading(false);
        return;
      }

      if (result?.ok) {
        // Redirect will be handled by NextAuth callback
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError("Erro ao fazer login. Tente novamente.");
      setLoading(false);
    }
  };

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
            <CardTitle className="text-2xl font-bold text-center">Bem-vindo de volta</CardTitle>
            <CardDescription className="text-center">
              Entre com suas credenciais para acessar sua conta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 text-sm text-red-800 bg-red-50 border border-red-200 rounded-md">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              )}

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
                  placeholder="••••••••"
                  value={formData.senha}
                  onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Entrando..." : "Entrar"}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                Não tem uma conta?{" "}
                <Link href="/auth/register" className="text-primary hover:underline font-medium">
                  Cadastre-se
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
