import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { Container } from "@/components/layout/container";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[hsl(var(--color-neutral-900))]" role="contentinfo">
      <Container>
        <div className="py-[var(--space-16)]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[var(--space-10)]">
            {/* Brand Column */}
            <div className="space-y-[var(--space-4)]">
              <Link
                href="/"
                className="inline-flex items-center gap-[var(--space-2)] text-[hsl(var(--color-neutral-0))] no-underline hover:text-[hsl(var(--color-neutral-0))]"
              >
                <ShoppingBag className="size-6 text-[hsl(var(--color-brand-400))]" aria-hidden="true" />
                <span className="text-[length:var(--text-md)] font-bold">B2B Marketplace</span>
              </Link>
              <p className="text-[length:var(--text-sm)] text-[hsl(var(--color-neutral-400))] leading-relaxed max-w-[280px]">
                Conectando fornecedores e compradores. A plataforma B2B mais completa do Brasil.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-[length:var(--text-sm)] font-semibold text-[hsl(var(--color-neutral-0))] mb-[var(--space-4)]">
                Links Rápidos
              </h3>
              <ul className="space-y-[var(--space-3)]">
                {[
                  { label: "Início", href: "/" },
                  { label: "Catálogo", href: "/catalogo" },
                  { label: "Fornecedores", href: "/fornecedores" },
                  { label: "Sobre nós", href: "#" },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[length:var(--text-sm)] text-[hsl(var(--color-neutral-400))] hover:text-[hsl(var(--color-brand-400))] no-underline transition-colors duration-[var(--transition-fast)]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-[length:var(--text-sm)] font-semibold text-[hsl(var(--color-neutral-0))] mb-[var(--space-4)]">
                Suporte
              </h3>
              <ul className="space-y-[var(--space-3)]">
                {[
                  { label: "Central de Ajuda", href: "#" },
                  { label: "FAQ", href: "#" },
                  { label: "Contato", href: "#" },
                  { label: "Status do Sistema", href: "#" },
                ].map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[length:var(--text-sm)] text-[hsl(var(--color-neutral-400))] hover:text-[hsl(var(--color-brand-400))] no-underline transition-colors duration-[var(--transition-fast)]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-[length:var(--text-sm)] font-semibold text-[hsl(var(--color-neutral-0))] mb-[var(--space-4)]">
                Contato
              </h3>
              <ul className="space-y-[var(--space-3)]">
                <li className="text-[length:var(--text-sm)] text-[hsl(var(--color-neutral-400))]">
                  contato@b2bmarketplace.com.br
                </li>
                <li className="text-[length:var(--text-sm)] text-[hsl(var(--color-neutral-400))]">
                  (11) 3000-0000
                </li>
                <li className="text-[length:var(--text-sm)] text-[hsl(var(--color-neutral-400))]">
                  São Paulo, SP — Brasil
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[hsl(var(--color-neutral-800))] py-[var(--space-6)] flex flex-col sm:flex-row items-center justify-between gap-[var(--space-4)]">
          <p className="text-[length:var(--text-xs)] text-[hsl(var(--color-neutral-400))]">
            © {currentYear} B2B Marketplace. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-[var(--space-6)]">
            <Link
              href="#"
              className="text-[length:var(--text-xs)] text-[hsl(var(--color-neutral-400))] hover:text-[hsl(var(--color-brand-400))] no-underline transition-colors duration-[var(--transition-fast)]"
            >
              Termos de Uso
            </Link>
            <Link
              href="#"
              className="text-[length:var(--text-xs)] text-[hsl(var(--color-neutral-400))] hover:text-[hsl(var(--color-brand-400))] no-underline transition-colors duration-[var(--transition-fast)]"
            >
              Privacidade
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
