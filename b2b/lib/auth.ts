// Configuração de autenticação com NextAuth.js
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "./prisma";
import { TipoUsuario } from "@prisma/client";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        senha: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.senha) {
          throw new Error("Email e senha são obrigatórios");
        }

        const usuario = await prisma.usuario.findUnique({
          where: { email: credentials.email },
          include: {
            fornecedor: true,
            cliente: true,
          },
        });

        if (!usuario || !usuario.ativo) {
          throw new Error("Credenciais inválidas");
        }

        const senhaValida = await compare(credentials.senha, usuario.senha);

        if (!senhaValida) {
          throw new Error("Credenciais inválidas");
        }

        return {
          id: usuario.id,
          email: usuario.email,
          name: usuario.nome,
          tipo: usuario.tipo,
          fornecedorId: usuario.fornecedor?.id || null,
          clienteId: usuario.cliente?.id || null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.tipo = user.tipo;
        token.fornecedorId = user.fornecedorId;
        token.clienteId = user.clienteId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.tipo = token.tipo;
        session.user.fornecedorId = token.fornecedorId;
        session.user.clienteId = token.clienteId;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// Helper para obter redirecionamento baseado no tipo de usuário
export function getRedirectByUserType(tipo: TipoUsuario): string {
  const redirects: Record<TipoUsuario, string> = {
    [TipoUsuario.admin]: "/dashboard/admin",
    [TipoUsuario.fornecedor]: "/dashboard/fornecedor",
    [TipoUsuario.cliente]: "/dashboard/cliente",
  };
  return redirects[tipo] || "/";
}
