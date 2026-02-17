import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingBag, AlertCircle } from "lucide-react";

interface ErrorPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function ErrorPage({ searchParams }: ErrorPageProps) {
  const params = await searchParams;
  const error = params.error;

  const getErrorMessage = (error?: string) => {
    switch (error) {
      case "Configuration":
        return "Erro de configuração no servidor. Entre em contato com o suporte.";
      case "AccessDenied":
        return "Acesso negado. Você não tem permissão para acessar este recurso.";
      case "Verification":
        return "O token de verificação expirou ou já foi usado.";
      case "OAuthSignin":
        return "Erro ao iniciar processo de autenticação.";
      case "OAuthCallback":
        return "Erro ao processar resposta de autenticação.";
      case "OAuthCreateAccount":
        return "Não foi possível criar uma conta com este provedor.";
      case "EmailCreateAccount":
        return "Não foi possível criar uma conta com este email.";
      case "Callback":
        return "Erro ao processar callback de autenticação.";
      case "OAuthAccountNotLinked":
        return "Esta conta já está vinculada a outro método de login.";
      case "EmailSignin":
        return "Não foi possível enviar o email de login.";
      case "CredentialsSignin":
        return "Email ou senha inválidos. Verifique suas credenciais.";
      case "SessionRequired":
        return "É necessário estar autenticado para acessar esta página.";
      default:
        return "Ocorreu um erro durante a autenticação. Tente novamente.";
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
            <div className="flex justify-center mb-[var(--space-4)]">
              <div className="p-[var(--space-3)] bg-[hsl(var(--color-error-50))] rounded-full">
                <AlertCircle className="h-8 w-8 text-[hsl(var(--color-error-500))]" />
              </div>
            </div>
            <CardTitle className="text-[length:var(--text-2xl)] font-bold text-center text-[hsl(var(--color-neutral-900))]">Erro de Autenticação</CardTitle>
            <CardDescription className="text-center text-[hsl(var(--color-neutral-500))]">
              {getErrorMessage(error)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full">
              <Link href="/auth/login">Tentar novamente</Link>
            </Button>

            <Button asChild variant="outline" className="w-full">
              <Link href="/">Voltar para página inicial</Link>
            </Button>

            <div className="text-center text-[length:var(--text-sm)] text-[hsl(var(--color-neutral-500))]">
              Precisa de ajuda?{" "}
              <Link href="/contato" className="text-primary hover:underline font-medium">
                Entre em contato
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
