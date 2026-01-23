// Custom hook for authentication
'use client';

import { useSession } from 'next-auth/react';
import { TipoUsuario } from '@prisma/client';

export function useAuth() {
  const { data: session, status } = useSession();
  const loading = status === 'loading';
  const authenticated = status === 'authenticated';

  const user = session?.user;

  const isAdmin = user?.tipo === TipoUsuario.admin;
  const isFornecedor = user?.tipo === TipoUsuario.fornecedor;
  const isCliente = user?.tipo === TipoUsuario.cliente;

  return {
    user,
    session,
    loading,
    authenticated,
    isAdmin,
    isFornecedor,
    isCliente,
    fornecedorId: user?.fornecedorId,
    clienteId: user?.clienteId,
  };
}
