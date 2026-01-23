import { TipoUsuario } from "@prisma/client";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      tipo: TipoUsuario;
      fornecedorId?: string | null;
      clienteId?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    tipo: TipoUsuario;
    fornecedorId?: string | null;
    clienteId?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    tipo: TipoUsuario;
    fornecedorId?: string | null;
    clienteId?: string | null;
  }
}
