import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "B2B Marketplace - Conectando Fornecedores e Compradores",
  description: "Plataforma B2B moderna para negócios entre empresas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
