import { NextRequest } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, handleZodError } from "@/lib/api-helpers";
import { TipoUsuario } from "@prisma/client";
import { slugify } from "@/lib/utils";
import { logger } from "@/lib/logger";

const registerSchema = z.object({
  email: z.string().email("Email inválido"),
  senha: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
  nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  telefone: z.string().optional(),
  tipo: z.nativeEnum(TipoUsuario),
  
  // Campos específicos para fornecedor
  razaoSocial: z.string().optional(),
  nomeFantasia: z.string().optional(),
  cnpj: z.string().optional(),
  descricao: z.string().optional(),
  
  // Campos específicos para cliente
  inscricaoEstadual: z.string().optional(),
  endereco: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  cep: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    // Verificar se email já existe
    const existingUser = await prisma.usuario.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return errorResponse("Email já cadastrado", 409);
    }

    // Hash da senha
    const hashedPassword = await hash(validatedData.senha, 10);

    // Criar usuário com dados específicos do tipo
    const usuario = await prisma.usuario.create({
      data: {
        email: validatedData.email,
        senha: hashedPassword,
        nome: validatedData.nome,
        telefone: validatedData.telefone,
        tipo: validatedData.tipo,
        ...(validatedData.tipo === TipoUsuario.fornecedor && validatedData.razaoSocial && validatedData.cnpj
          ? {
              fornecedor: {
                create: {
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
              },
            }
          : {}),
        ...(validatedData.tipo === TipoUsuario.cliente && validatedData.razaoSocial && validatedData.cnpj
          ? {
              cliente: {
                create: {
                  razaoSocial: validatedData.razaoSocial,
                  nomeFantasia: validatedData.nomeFantasia || validatedData.razaoSocial,
                  cnpj: validatedData.cnpj,
                  inscricaoEstadual: validatedData.inscricaoEstadual,
                  endereco: validatedData.endereco,
                  cidade: validatedData.cidade,
                  estado: validatedData.estado,
                  cep: validatedData.cep,
                },
              },
            }
          : {}),
      },
      select: {
        id: true,
        email: true,
        nome: true,
        tipo: true,
        criadoEm: true,
      },
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
    if (error instanceof z.ZodError) {
      return handleZodError(error);
    }

    logger.error("Erro ao cadastrar usuário", error);
    return errorResponse("Erro ao cadastrar usuário", 500);
  }
}
