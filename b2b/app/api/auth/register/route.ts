import { NextRequest } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { successResponse } from "@/lib/api-helpers";
import { handleApiError, ApiError } from "@/lib/api/error-handler";
import { rateLimit, rateLimitConfigs } from "@/lib/api/rate-limit";
import { TipoUsuario } from "@prisma/client";
import { slugify } from "@/lib/utils";
import { logger } from "@/lib/logger";

// Validate CNPJ format (14 digits)
const cnpjRegex = /^\d{14}$/;

const registerSchema = z.object({
  email: z.string().email("Email inválido"),
  senha: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
  nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  telefone: z.string().optional(),
  tipo: z.enum(["fornecedor", "cliente", "admin"]),
  
  // Campos específicos para fornecedor e cliente
  razaoSocial: z.string().min(3, "Razão social deve ter no mínimo 3 caracteres").optional(),
  nomeFantasia: z.string().optional(),
  cnpj: z.string().regex(cnpjRegex, "CNPJ deve conter 14 dígitos").optional(),
  descricao: z.string().optional(),
  
  // Campos específicos para cliente
  inscricaoEstadual: z.string().optional(),
  endereco: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  cep: z.string().optional(),
}).refine(
  (data) => {
    // Se for fornecedor ou cliente, razaoSocial e CNPJ são obrigatórios
    if (data.tipo === "fornecedor" || data.tipo === "cliente") {
      return data.razaoSocial && data.cnpj;
    }
    return true;
  },
  {
    message: "Razão social e CNPJ são obrigatórios para fornecedores e clientes",
    path: ["razaoSocial"],
  }
);

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = await rateLimit(rateLimitConfigs.register)(request);
    if (rateLimitResult) {
      return rateLimitResult;
    }

    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    // Verificar se email já existe
    const existingUser = await prisma.usuario.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      throw new ApiError("Email já cadastrado", 409);
    }

    // Verificar se CNPJ já existe (se fornecido)
    if (validatedData.cnpj) {
      const existingCnpj = await prisma.$transaction(async (tx) => {
        const fornecedor = await tx.fornecedor.findUnique({
          where: { cnpj: validatedData.cnpj },
        });
        const cliente = await tx.cliente.findUnique({
          where: { cnpj: validatedData.cnpj },
        });
        return fornecedor || cliente;
      });

      if (existingCnpj) {
        throw new ApiError("CNPJ já cadastrado", 409);
      }
    }

    // Hash da senha
    const hashedPassword = await hash(validatedData.senha, 10);

    // Criar usuário com dados específicos do tipo em transação
    const usuario = await prisma.$transaction(async (tx) => {
      const user = await tx.usuario.create({
        data: {
          email: validatedData.email,
          senha: hashedPassword,
          nome: validatedData.nome,
          telefone: validatedData.telefone,
          tipo: validatedData.tipo as TipoUsuario,
        },
        select: {
          id: true,
          email: true,
          nome: true,
          tipo: true,
          criadoEm: true,
        },
      });

      // Criar perfil de fornecedor se aplicável
      if (validatedData.tipo === "fornecedor" && validatedData.razaoSocial && validatedData.cnpj) {
        await tx.fornecedor.create({
          data: {
            usuarioId: user.id,
            razaoSocial: validatedData.razaoSocial,
            nomeFantasia: validatedData.nomeFantasia || validatedData.razaoSocial,
            cnpj: validatedData.cnpj,
            slug: slugify(validatedData.nomeFantasia || validatedData.razaoSocial),
            descricao: validatedData.descricao,
            endereco: validatedData.endereco,
            cidade: validatedData.cidade,
            estado: validatedData.estado,
            cep: validatedData.cep,
          },
        });
      }

      // Criar perfil de cliente se aplicável
      if (validatedData.tipo === "cliente" && validatedData.razaoSocial && validatedData.cnpj) {
        await tx.cliente.create({
          data: {
            usuarioId: user.id,
            razaoSocial: validatedData.razaoSocial,
            nomeFantasia: validatedData.nomeFantasia || validatedData.razaoSocial,
            cnpj: validatedData.cnpj,
            inscricaoEstadual: validatedData.inscricaoEstadual,
            endereco: validatedData.endereco,
            cidade: validatedData.cidade,
            estado: validatedData.estado,
            cep: validatedData.cep,
          },
        });
      }

      return user;
    });

    logger.info("Novo usuário cadastrado", { usuarioId: usuario.id, tipo: usuario.tipo });

    return successResponse(
      {
        message: "Usuário cadastrado com sucesso",
        usuario,
      },
      201
    );
  } catch (error) {
    return handleApiError(error);
  }
}
