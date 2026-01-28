// Helpers para API routes
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { TipoUsuario } from "@prisma/client";
import { ZodError } from "zod";
import { logger } from "./logger";
import { ApiError } from "./api/error-handler";

// Resposta de sucesso
export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

// Resposta de erro
export function errorResponse(message: string, status = 400, errors?: any) {
  logger.error("API Error", { message, status, errors });
  return NextResponse.json(
    {
      success: false,
      error: message,
      ...(errors && { errors }),
    },
    { status }
  );
}

// Tratamento de erros do Zod
export function handleZodError(error: ZodError<any>) {
  const errors = error.issues.map((err) => ({
    path: err.path.join("."),
    message: err.message,
  }));
  return errorResponse("Erro de validação", 422, errors);
}

// Obter sessão do usuário
export async function getUserSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return null;
  }
  return session.user;
}

// Verificar autenticação
export async function requireAuth() {
  const user = await getUserSession();
  if (!user) {
    throw new ApiError("Não autenticado", 401);
  }
  return user;
}

// Verificar role
export async function requireRole(roles: TipoUsuario[]) {
  const user = await requireAuth();
  if (!roles.includes(user.tipo)) {
    throw new ApiError("Sem permissão", 403);
  }
  return user;
}

// Verificar se é fornecedor
export async function requireFornecedor() {
  const user = await requireRole([TipoUsuario.fornecedor]);
  if (!user.fornecedorId) {
    throw new ApiError("Fornecedor não encontrado", 404);
  }
  return { user, fornecedorId: user.fornecedorId };
}

// Verificar se é cliente
export async function requireCliente() {
  const user = await requireRole([TipoUsuario.cliente]);
  if (!user.clienteId) {
    throw new ApiError("Cliente não encontrado", 404);
  }
  return { user, clienteId: user.clienteId };
}

// Verificar se é admin
export async function requireAdmin() {
  return await requireRole([TipoUsuario.admin]);
}
