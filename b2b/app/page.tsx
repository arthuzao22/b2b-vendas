import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/layout/container";
import Header from "@/components/header";
import Footer from "@/components/footer";
import {
  ShoppingCart,
  Users,
  TrendingUp,
  Shield,
  Clock,
  Package,
  BarChart3,
  ArrowRight,
  CheckCircle,
  Zap,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col" id="main-content">
      <Header />

      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[hsl(var(--color-brand-50))] via-[hsl(var(--color-neutral-0))] to-[hsl(var(--color-neutral-25))] py-[var(--space-24)] px-[var(--space-4)]">
        {/* Decorative grid */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, hsl(var(--color-brand-500)) 1px, transparent 1px)', backgroundSize: '24px 24px' }} aria-hidden="true" />

        <Container>
          <div className="grid lg:grid-cols-2 gap-[var(--space-16)] items-center">
            <div className="space-y-[var(--space-8)]">
              <div className="inline-flex items-center gap-[var(--space-2)] px-[var(--space-4)] py-[var(--space-2)] rounded-[var(--radius-full)] bg-[hsl(var(--color-brand-50))] border border-[hsl(var(--color-brand-200))]">
                <Zap className="size-4 text-[hsl(var(--color-brand-500))]" aria-hidden="true" />
                <span className="text-[length:var(--text-sm)] font-medium text-[hsl(var(--color-brand-600))]">Plataforma #1 em B2B</span>
              </div>

              <h1 className="text-[2.5rem] md:text-[3.25rem] lg:text-[3.75rem] font-bold leading-[1.1] tracking-tight text-[hsl(var(--color-neutral-900))]">
                A melhor plataforma{" "}
                <span className="bg-gradient-to-r from-[hsl(var(--color-brand-500))] to-[hsl(var(--color-brand-600))] bg-clip-text text-transparent">
                  B2B
                </span>{" "}
                do Brasil
              </h1>

              <p className="text-[length:var(--text-lg)] text-[hsl(var(--color-neutral-600))] leading-relaxed max-w-lg">
                Conecte sua empresa com fornecedores e clientes de todo o país.
                Simplifique processos, reduza custos e aumente suas vendas.
              </p>

              <div className="flex flex-col sm:flex-row gap-[var(--space-4)]">
                <Button size="lg" asChild>
                  <Link href="/auth/register">
                    Começar agora <ArrowRight className="ml-2" />
                  </Link>
                </Button>
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/auth/login">Fazer login</Link>
                </Button>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-[var(--space-10)] pt-[var(--space-6)]">
                {[
                  { value: "500+", label: "Empresas ativas" },
                  { value: "10K+", label: "Produtos" },
                  { value: "98%", label: "Satisfação" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className="text-[length:var(--text-2xl)] font-bold text-[hsl(var(--color-neutral-900))]">
                      {stat.value}
                    </div>
                    <div className="text-[length:var(--text-sm)] text-[hsl(var(--color-neutral-500))]">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero visual */}
            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--color-brand-500)/0.1)] to-transparent rounded-full blur-[80px]" aria-hidden="true" />
                <div className="relative bg-[hsl(var(--color-neutral-0))] p-[var(--space-8)] rounded-[var(--radius-xl)] shadow-[var(--shadow-xl)] border border-[hsl(var(--color-neutral-100))]">
                  <div className="space-y-[var(--space-4)]">
                    {[
                      { icon: ShoppingCart, label: "Pedidos Rápidos", desc: "Em poucos cliques", bg: "bg-[hsl(var(--color-brand-50))]", color: "text-[hsl(var(--color-brand-500))]" },
                      { icon: TrendingUp, label: "Aumente suas Vendas", desc: "Alcance novos clientes", bg: "bg-[hsl(var(--color-success-50))]", color: "text-[hsl(var(--color-success-500))]" },
                      { icon: Shield, label: "100% Seguro", desc: "Transações protegidas", bg: "bg-[hsl(var(--color-info-50))]", color: "text-[hsl(var(--color-info-500))]" },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className={`flex items-center gap-[var(--space-4)] p-[var(--space-4)] ${item.bg} rounded-[var(--radius-lg)] transition-transform duration-[var(--transition-base)] hover:scale-[1.02]`}
                      >
                        <item.icon className={`size-8 ${item.color}`} aria-hidden="true" />
                        <div>
                          <div className="font-semibold text-[hsl(var(--color-neutral-800))]">{item.label}</div>
                          <div className="text-[length:var(--text-sm)] text-[hsl(var(--color-neutral-500))]">{item.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section className="py-[var(--space-24)] px-[var(--space-4)]">
        <Container>
          <div className="text-center mb-[var(--space-16)]">
            <h2 className="text-[length:var(--text-3xl)] md:text-[length:var(--text-4xl)] font-bold mb-[var(--space-4)] text-[hsl(var(--color-neutral-900))]">
              Por que escolher nossa plataforma?
            </h2>
            <p className="text-[length:var(--text-lg)] text-[hsl(var(--color-neutral-500))] max-w-2xl mx-auto">
              Recursos pensados para facilitar a gestão do seu negócio B2B
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-[var(--space-6)]">
            {[
              { icon: Package, title: "Gestão de Catálogo", desc: "Organize e gerencie seus produtos com facilidade. Upload em massa, categorização e controle de estoque integrado." },
              { icon: BarChart3, title: "Relatórios Detalhados", desc: "Acompanhe suas vendas, produtos mais vendidos e performance com dashboards intuitivos e relatórios completos." },
              { icon: Users, title: "Multi-usuários", desc: "Adicione múltiplos usuários à sua conta com diferentes níveis de permissão e controle de acesso." },
              { icon: Clock, title: "Pedidos em Tempo Real", desc: "Acompanhe pedidos em tempo real, com notificações instantâneas e histórico completo de transações." },
              { icon: Shield, title: "Segurança Garantida", desc: "Seus dados protegidos com criptografia de ponta a ponta e conformidade com LGPD." },
              { icon: TrendingUp, title: "Precificação Dinâmica", desc: "Crie múltiplas listas de preços por cliente, região ou volume de compra. Flexibilidade total." },
            ].map((feature) => (
              <Card key={feature.title} variant="interactive">
                <CardHeader>
                  <div className="flex items-center justify-center size-12 rounded-[var(--radius-lg)] bg-[hsl(var(--color-brand-50))] mb-[var(--space-4)]">
                    <feature.icon className="size-6 text-[hsl(var(--color-brand-500))]" aria-hidden="true" />
                  </div>
                  <CardTitle className="text-[length:var(--text-md)]">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-[length:var(--text-sm)] text-[hsl(var(--color-neutral-500))] leading-relaxed">
                    {feature.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="py-[var(--space-24)] px-[var(--space-4)] bg-[hsl(var(--color-neutral-25))]">
        <Container>
          <div className="text-center mb-[var(--space-16)]">
            <h2 className="text-[length:var(--text-3xl)] md:text-[length:var(--text-4xl)] font-bold mb-[var(--space-4)] text-[hsl(var(--color-neutral-900))]">
              Como funciona
            </h2>
            <p className="text-[length:var(--text-lg)] text-[hsl(var(--color-neutral-500))]">
              Simples e eficiente para fornecedores e clientes
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-[var(--space-8)]">
            {/* Para Fornecedores */}
            <Card variant="elevated" className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-[hsl(var(--color-brand-50))] to-[hsl(var(--color-neutral-0))] pb-[var(--space-6)]">
                <CardTitle className="text-[length:var(--text-xl)] flex items-center gap-[var(--space-3)]">
                  <div className="flex items-center justify-center size-10 rounded-[var(--radius-md)] bg-[hsl(var(--color-brand-500))]">
                    <Package className="size-5 text-white" aria-hidden="true" />
                  </div>
                  Para Fornecedores
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-[var(--space-5)] pt-[var(--space-6)]">
                {[
                  { step: "1", title: "Cadastre sua empresa", desc: "Crie sua conta e complete o perfil da sua empresa" },
                  { step: "2", title: "Adicione seus produtos", desc: "Monte seu catálogo com fotos, descrições e preços" },
                  { step: "3", title: "Receba pedidos", desc: "Gerencie pedidos e acompanhe suas vendas em tempo real" },
                ].map((item) => (
                  <div key={item.step} className="flex gap-[var(--space-4)]">
                    <div className="flex items-center justify-center size-9 shrink-0 rounded-full bg-[hsl(var(--color-brand-500))] text-white text-[length:var(--text-sm)] font-bold">
                      {item.step}
                    </div>
                    <div>
                      <div className="font-semibold text-[hsl(var(--color-neutral-800))] mb-[var(--space-0-5)]">
                        {item.title}
                      </div>
                      <div className="text-[length:var(--text-sm)] text-[hsl(var(--color-neutral-500))]">
                        {item.desc}
                      </div>
                    </div>
                  </div>
                ))}
                <Button className="w-full mt-[var(--space-4)]" asChild>
                  <Link href="/auth/register">Cadastrar como Fornecedor</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Para Clientes */}
            <Card variant="elevated" className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-[hsl(var(--color-success-50))] to-[hsl(var(--color-neutral-0))] pb-[var(--space-6)]">
                <CardTitle className="text-[length:var(--text-xl)] flex items-center gap-[var(--space-3)]">
                  <div className="flex items-center justify-center size-10 rounded-[var(--radius-md)] bg-[hsl(var(--color-success-500))]">
                    <ShoppingCart className="size-5 text-white" aria-hidden="true" />
                  </div>
                  Para Clientes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-[var(--space-5)] pt-[var(--space-6)]">
                {[
                  { step: "1", title: "Crie sua conta", desc: "Cadastro rápido e acesso imediato à plataforma" },
                  { step: "2", title: "Encontre fornecedores", desc: "Navegue pelo catálogo e encontre os melhores produtos" },
                  { step: "3", title: "Faça seus pedidos", desc: "Compre com segurança e acompanhe suas encomendas" },
                ].map((item) => (
                  <div key={item.step} className="flex gap-[var(--space-4)]">
                    <div className="flex items-center justify-center size-9 shrink-0 rounded-full bg-[hsl(var(--color-success-500))] text-white text-[length:var(--text-sm)] font-bold">
                      {item.step}
                    </div>
                    <div>
                      <div className="font-semibold text-[hsl(var(--color-neutral-800))] mb-[var(--space-0-5)]">
                        {item.title}
                      </div>
                      <div className="text-[length:var(--text-sm)] text-[hsl(var(--color-neutral-500))]">
                        {item.desc}
                      </div>
                    </div>
                  </div>
                ))}
                <Button className="w-full mt-[var(--space-4)]" variant="secondary" asChild>
                  <Link href="/auth/register">Cadastrar como Cliente</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </Container>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-[var(--space-24)] px-[var(--space-4)]">
        <Container>
          <div className="relative overflow-hidden rounded-[var(--radius-xl)] bg-gradient-to-br from-[hsl(var(--color-brand-500))] to-[hsl(var(--color-brand-700))] p-[var(--space-16)] text-center">
            {/* Decorative circles */}
            <div className="absolute -top-20 -right-20 size-60 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
            <div className="absolute -bottom-16 -left-16 size-48 rounded-full bg-white/5 blur-xl" aria-hidden="true" />

            <div className="relative space-y-[var(--space-6)]">
              <h2 className="text-[length:var(--text-3xl)] md:text-[length:var(--text-4xl)] font-bold text-white">
                Pronto para transformar seu negócio?
              </h2>
              <p className="text-[length:var(--text-lg)] text-white/80 max-w-xl mx-auto">
                Junte-se a centenas de empresas que já confiam na nossa plataforma
              </p>
              <div className="flex flex-col sm:flex-row gap-[var(--space-4)] justify-center pt-[var(--space-4)]">
                <Button size="lg" className="bg-white text-[hsl(var(--color-brand-600))] hover:bg-white/90 hover:text-[hsl(var(--color-brand-700))]" asChild>
                  <Link href="/auth/register">Criar conta gratuita</Link>
                </Button>
                <Button size="lg" variant="secondary" className="bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm" asChild>
                  <Link href="/auth/login">Já tenho conta</Link>
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <Footer />
    </div>
  );
}
