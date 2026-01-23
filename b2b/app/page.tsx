import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/header";
import Footer from "@/components/footer";
import {
  ShoppingCart,
  Users,
  TrendingUp,
  Shield,
  Clock,
  CheckCircle,
  Package,
  BarChart3,
  ArrowRight,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 to-white py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                A melhor plataforma <span className="text-primary">B2B</span> do Brasil
              </h1>
              <p className="text-lg text-muted-foreground">
                Conecte sua empresa com fornecedores e clientes de todo o país. 
                Simplifique processos, reduza custos e aumente suas vendas.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild>
                  <Link href="/auth/register">
                    Começar agora <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/auth/login">Fazer login</Link>
                </Button>
              </div>
              <div className="flex items-center gap-8 pt-4">
                <div>
                  <div className="text-2xl font-bold">500+</div>
                  <div className="text-sm text-muted-foreground">Empresas ativas</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">10K+</div>
                  <div className="text-sm text-muted-foreground">Produtos</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">98%</div>
                  <div className="text-sm text-muted-foreground">Satisfação</div>
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/10 rounded-full blur-3xl"></div>
                <div className="relative bg-white p-8 rounded-2xl shadow-2xl">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <ShoppingCart className="h-8 w-8 text-primary" />
                      <div>
                        <div className="font-semibold">Pedidos Rápidos</div>
                        <div className="text-sm text-muted-foreground">Em poucos cliques</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <TrendingUp className="h-8 w-8 text-green-600" />
                      <div>
                        <div className="font-semibold">Aumente suas Vendas</div>
                        <div className="text-sm text-muted-foreground">Alcance novos clientes</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                      <Shield className="h-8 w-8 text-purple-600" />
                      <div>
                        <div className="font-semibold">100% Seguro</div>
                        <div className="text-sm text-muted-foreground">Transações protegidas</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Por que escolher nossa plataforma?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Recursos pensados para facilitar a gestão do seu negócio B2B
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <div className="mb-2">
                  <Package className="h-10 w-10 text-primary" />
                </div>
                <CardTitle>Gestão de Catálogo</CardTitle>
                <CardDescription>
                  Organize e gerencie seus produtos com facilidade. Upload em massa, 
                  categorização e controle de estoque integrado.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-2">
                  <BarChart3 className="h-10 w-10 text-primary" />
                </div>
                <CardTitle>Relatórios Detalhados</CardTitle>
                <CardDescription>
                  Acompanhe suas vendas, produtos mais vendidos e performance 
                  com dashboards intuitivos e relatórios completos.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-2">
                  <Users className="h-10 w-10 text-primary" />
                </div>
                <CardTitle>Multi-usuários</CardTitle>
                <CardDescription>
                  Adicione múltiplos usuários à sua conta com diferentes níveis 
                  de permissão e controle de acesso.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-2">
                  <Clock className="h-10 w-10 text-primary" />
                </div>
                <CardTitle>Pedidos em Tempo Real</CardTitle>
                <CardDescription>
                  Acompanhe pedidos em tempo real, com notificações instantâneas 
                  e histórico completo de transações.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-2">
                  <Shield className="h-10 w-10 text-primary" />
                </div>
                <CardTitle>Segurança Garantida</CardTitle>
                <CardDescription>
                  Seus dados protegidos com criptografia de ponta a ponta e 
                  conformidade com LGPD.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-2">
                  <TrendingUp className="h-10 w-10 text-primary" />
                </div>
                <CardTitle>Precificação Dinâmica</CardTitle>
                <CardDescription>
                  Crie múltiplas listas de preços por cliente, região ou volume 
                  de compra. Flexibilidade total.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Como funciona</h2>
            <p className="text-lg text-muted-foreground">
              Simples e eficiente para fornecedores e clientes
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Para Fornecedores */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Package className="h-6 w-6 text-primary" />
                  Para Fornecedores
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <div className="font-semibold mb-1">Cadastre sua empresa</div>
                    <div className="text-sm text-muted-foreground">
                      Crie sua conta e complete o perfil da sua empresa
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <div className="font-semibold mb-1">Adicione seus produtos</div>
                    <div className="text-sm text-muted-foreground">
                      Monte seu catálogo com fotos, descrições e preços
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <div className="font-semibold mb-1">Receba pedidos</div>
                    <div className="text-sm text-muted-foreground">
                      Gerencie pedidos e acompanhe suas vendas em tempo real
                    </div>
                  </div>
                </div>

                <Button className="w-full mt-4" asChild>
                  <Link href="/auth/register">
                    Cadastrar como Fornecedor
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Para Clientes */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <ShoppingCart className="h-6 w-6 text-primary" />
                  Para Clientes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <div className="font-semibold mb-1">Crie sua conta</div>
                    <div className="text-sm text-muted-foreground">
                      Cadastro rápido e acesso imediato à plataforma
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <div className="font-semibold mb-1">Encontre fornecedores</div>
                    <div className="text-sm text-muted-foreground">
                      Navegue pelo catálogo e encontre os melhores produtos
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <div className="font-semibold mb-1">Faça seus pedidos</div>
                    <div className="text-sm text-muted-foreground">
                      Compre com segurança e acompanhe suas encomendas
                    </div>
                  </div>
                </div>

                <Button className="w-full mt-4" asChild>
                  <Link href="/auth/register">
                    Cadastrar como Cliente
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card className="bg-gradient-to-br from-primary to-blue-600 text-white border-0">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-3xl md:text-4xl mb-4">
                Pronto para transformar seu negócio?
              </CardTitle>
              <CardDescription className="text-blue-50 text-lg">
                Junte-se a centenas de empresas que já confiam na nossa plataforma
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/auth/register">
                  Criar conta gratuita
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-white/10 border-white text-white hover:bg-white/20" asChild>
                <Link href="/auth/login">
                  Já tenho conta
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}
