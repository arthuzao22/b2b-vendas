"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { ShoppingBag, Menu, X, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { cn } from "@/lib/utils";

const publicNavLinks = [
  { label: "Início", href: "/" },
  { label: "Fornecedores", href: "/fornecedores" },
  { label: "Catálogo", href: "/catalogo" },
];

export default function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const dashboardHref = session?.user
    ? `/dashboard/${(session.user as any).tipo === "fornecedor" ? "fornecedor" : "cliente"}`
    : "/auth/login";

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-[var(--z-sticky)]",
          "h-16 bg-[hsl(var(--color-neutral-0)/0.95)] backdrop-blur-[12px]",
          "border-b border-[hsl(var(--color-neutral-100))]"
        )}
      >
        <Container className="h-full flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-[var(--space-2)] text-[length:var(--text-md)] font-bold text-[hsl(var(--color-neutral-900))] no-underline hover:text-[hsl(var(--color-neutral-900))]"
          >
            <ShoppingBag className="size-7 text-[hsl(var(--color-brand-500))]" aria-hidden="true" />
            <span>B2B Marketplace</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-[var(--space-1)]" aria-label="Navegação principal">
            {publicNavLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative px-[var(--space-3)] py-[var(--space-2)]",
                    "text-[length:var(--text-sm)] font-medium no-underline",
                    "transition-colors duration-[var(--transition-fast)]",
                    "rounded-[var(--radius-md)]",
                    isActive
                      ? "text-[hsl(var(--color-brand-500))]"
                      : "text-[hsl(var(--color-neutral-600))] hover:text-[hsl(var(--color-brand-500))] hover:bg-[hsl(var(--color-neutral-50))]"
                  )}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-[var(--space-3)] right-[var(--space-3)] h-0.5 bg-[hsl(var(--color-brand-500))] rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-[var(--space-3)]">
            {session?.user ? (
              <>
                <Link href="/carrinho">
                  <Button variant="ghost" size="icon" aria-label="Carrinho">
                    <ShoppingCart className="size-5" />
                  </Button>
                </Link>
                <Button asChild>
                  <Link href={dashboardHref}>Dashboard</Link>
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/auth/login">Login</Link>
                </Button>
                <Button variant="primary" asChild>
                  <Link href="/auth/register">Cadastrar</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={cn(
              "lg:hidden flex items-center justify-center size-10 rounded-[var(--radius-md)]",
              "text-[hsl(var(--color-neutral-600))]",
              "hover:bg-[hsl(var(--color-neutral-50))]",
              "transition-colors duration-[var(--transition-fast)]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-brand-500))]"
            )}
            aria-label={mobileMenuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </Container>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-[var(--z-overlay)] bg-[hsl(var(--color-neutral-900)/0.5)] lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          {/* Drawer */}
          <div
            className={cn(
              "fixed top-16 right-0 bottom-0 z-[var(--z-modal)]",
              "w-72 bg-[hsl(var(--color-neutral-0))]",
              "border-l border-[hsl(var(--color-neutral-100))]",
              "shadow-[var(--shadow-xl)]",
              "lg:hidden",
              "animate-in slide-in-from-right duration-[var(--transition-slow)]"
            )}
          >
            <nav className="flex flex-col p-[var(--space-4)]" aria-label="Menu mobile">
              {publicNavLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center h-11 px-[var(--space-4)] rounded-[var(--radius-md)]",
                      "text-[length:var(--text-sm)] font-medium no-underline",
                      "transition-colors duration-[var(--transition-fast)]",
                      isActive
                        ? "bg-[hsl(var(--color-brand-50))] text-[hsl(var(--color-brand-600))]"
                        : "text-[hsl(var(--color-neutral-600))] hover:bg-[hsl(var(--color-neutral-50))] hover:text-[hsl(var(--color-neutral-800))]"
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}

              <div className="my-[var(--space-3)] border-t border-[hsl(var(--color-neutral-100))]" />

              {session?.user ? (
                <>
                  <Link
                    href="/carrinho"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-[var(--space-2)] h-11 px-[var(--space-4)] rounded-[var(--radius-md)] text-[length:var(--text-sm)] font-medium text-[hsl(var(--color-neutral-600))] hover:bg-[hsl(var(--color-neutral-50))] no-underline"
                  >
                    <ShoppingCart className="size-4" aria-hidden="true" />
                    Carrinho
                  </Link>
                  <Link
                    href={dashboardHref}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center h-11 px-[var(--space-4)] rounded-[var(--radius-md)] text-[length:var(--text-sm)] font-medium text-[hsl(var(--color-brand-500))] hover:bg-[hsl(var(--color-brand-50))] no-underline"
                  >
                    Dashboard
                  </Link>
                </>
              ) : (
                <div className="space-y-[var(--space-2)] px-[var(--space-4)] pt-[var(--space-2)]">
                  <Button variant="secondary" className="w-full" asChild>
                    <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                      Login
                    </Link>
                  </Button>
                  <Button variant="primary" className="w-full" asChild>
                    <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)}>
                      Cadastrar
                    </Link>
                  </Button>
                </div>
              )}
            </nav>
          </div>
        </>
      )}
    </>
  );
}
