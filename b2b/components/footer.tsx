import Link from "next/link";
import { ShoppingBag, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full border-t bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xl font-bold text-primary">
              <ShoppingBag className="h-6 w-6" />
              <span>B2B Marketplace</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Conectando fornecedores e compradores para negócios B2B eficientes e transparentes.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold mb-4">Navegação</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/fornecedores"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Fornecedores
                </Link>
              </li>
              <li>
                <Link
                  href="/catalogo"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Catálogo
                </Link>
              </li>
            </ul>
          </div>

          {/* Auth */}
          <div>
            <h3 className="font-semibold mb-4">Acesso</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/auth/login"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Login
                </Link>
              </li>
              <li>
                <Link
                  href="/auth/register"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Cadastrar
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Contato</h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>contato@b2bmarketplace.com</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>(11) 1234-5678</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>São Paulo, Brasil</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} B2B Marketplace. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
