// ID validation utilities
import { z } from "zod";

/**
 * Zod schemas for ID validation
 */
export const cuidSchema = z.string().cuid("ID inválido (formato CUID esperado)");
export const uuidSchema = z.string().uuid("ID inválido (formato UUID esperado)");

/**
 * Validate CUID format
 */
export function validateId(id: string): { valid: boolean; error?: string } {
  const result = cuidSchema.safeParse(id);
  return result.success 
    ? { valid: true } 
    : { valid: false, error: result.error.issues[0]?.message || "ID inválido" };
}

/**
 * Validate UUID format
 */
export function validateUuid(id: string): { valid: boolean; error?: string } {
  const result = uuidSchema.safeParse(id);
  return result.success 
    ? { valid: true } 
    : { valid: false, error: result.error.issues[0]?.message || "UUID inválido" };
}

/**
 * Validate and return ID or throw error
 */
export function requireValidId(id: string): string {
  const validation = validateId(id);
  if (!validation.valid) {
    throw new Error(validation.error);
  }
  return id;
}
