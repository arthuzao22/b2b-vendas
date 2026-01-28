// Centralized API error handling
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { logger } from "../logger";

/**
 * Custom API Error class with HTTP status code
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400,
    public errors?: any
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Format error response
 */
export function errorResponse(message: string, status = 400, errors?: any): NextResponse {
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

/**
 * Handle Zod validation errors
 */
export function handleZodError(error: ZodError): NextResponse {
  const errors = error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));
  return errorResponse("Erro de validação", 422, errors);
}

/**
 * Handle Prisma errors
 */
export function handlePrismaError(error: Prisma.PrismaClientKnownRequestError): NextResponse {
  logger.error("Prisma Error", { code: error.code, meta: error.meta });

  switch (error.code) {
    case "P2002":
      // Unique constraint violation
      const field = (error.meta?.target as string[])?.join(", ") || "campo";
      return errorResponse(`${field} já está em uso`, 409);
    
    case "P2025":
      // Record not found
      return errorResponse("Registro não encontrado", 404);
    
    case "P2003":
      // Foreign key constraint violation
      return errorResponse("Operação inválida: registro relacionado não encontrado", 400);
    
    case "P2014":
      // Invalid ID
      return errorResponse("ID inválido fornecido", 400);
    
    default:
      return errorResponse("Erro de banco de dados", 500);
  }
}

/**
 * Main error handler - handles all types of errors
 */
export function handleApiError(error: unknown): NextResponse {
  // Handle ApiError
  if (error instanceof ApiError) {
    return errorResponse(error.message, error.statusCode, error.errors);
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return handleZodError(error);
  }

  // Handle Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return handlePrismaError(error);
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    logger.error("Unhandled Error", { message: error.message, stack: error.stack });
    return errorResponse(error.message, 500);
  }

  // Handle unknown errors
  logger.error("Unknown Error", { error });
  return errorResponse("Erro interno do servidor", 500);
}
