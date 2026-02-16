import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, handleZodError, requireFornecedor } from "@/lib/api-helpers";
import { logger } from "@/lib/logger";
import { TipoUsuario } from "@prisma/client";
import bcrypt from "bcryptjs";
import { isValidCNPJ } from "@/lib/validators";

const createClienteSchema = z.object({
  email: z.string().email("Email inválido"),
  senha: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
  nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  telefone: z.string().optional(),
  razaoSocial: z.string().min(3, "Razão social deve ter no mínimo 3 caracteres"),
  nomeFantasia: z.string().optional(),
  cnpj: z.string()
    .regex(/^\d{14}$/, "CNPJ deve conter 14 dígitos")
    .refine(isValidCNPJ, "CNPJ inválido - dígitos verificadores incorretos"),
  inscricaoEstadual: z.string().optional(),
  endereco: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  cep: z.string().optional(),
});

// POST /api/clientes - Criar cliente (fornecedor only)
export async function POST(request: NextRequest) {
  try {
    const { fornecedorId } = await requireFornecedor();

    const body = await request.json();
    const validatedData = createClienteSchema.parse(body);

    // Verificar se email já existe
    const emailExists = await prisma.usuario.findUnique({
      where: { email: validatedData.email },
    });

    if (emailExists) {
      return errorResponse("Email já cadastrado", 409);
    }

    // Verificar se CNPJ já existe
    const cnpjExists = await prisma.cliente.findUnique({
      where: { cnpj: validatedData.cnpj },
    });

    if (cnpjExists) {
      return errorResponse("CNPJ já cadastrado", 409);
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(validatedData.senha, 10);

    // Criar usuário + cliente + relacionamento com fornecedor em uma transação
    const result = await prisma.$transaction(async (tx) => {
      // Criar usuário
      const usuario = await tx.usuario.create({
        data: {
          email: validatedData.email,
          senha: hashedPassword,
          nome: validatedData.nome,
          tipo: TipoUsuario.cliente,
          telefone: validatedData.telefone,
          ativo: true,
        },
      });

      // Criar cliente
      const cliente = await tx.cliente.create({
        data: {
          usuarioId: usuario.id,
          razaoSocial: validatedData.razaoSocial,
          nomeFantasia: validatedData.nomeFantasia,
          cnpj: validatedData.cnpj,
          inscricaoEstadual: validatedData.inscricaoEstadual,
          endereco: validatedData.endereco,
          cidade: validatedData.cidade,
          estado: validatedData.estado,
          cep: validatedData.cep,
        },
      });

      // Criar relacionamento ClienteFornecedor
      await tx.clienteFornecedor.create({
        data: {
          clienteId: cliente.id,
          fornecedorId,
        },
      });

      return { usuario, cliente };
    });

    logger.info("Cliente criado", {
      clienteId: result.cliente.id,
      fornecedorId,
      cnpj: result.cliente.cnpj,
    });

    return successResponse(
      {
        id: result.cliente.id,
        usuario: {
          id: result.usuario.id,
          email: result.usuario.email,
          nome: result.usuario.nome,
          telefone: result.usuario.telefone,
          ativo: result.usuario.ativo,
        },
        razaoSocial: result.cliente.razaoSocial,
        nomeFantasia: result.cliente.nomeFantasia,
        cnpj: result.cliente.cnpj,
        inscricaoEstadual: result.cliente.inscricaoEstadual,
        endereco: result.cliente.endereco,
        cidade: result.cliente.cidade,
        estado: result.cliente.estado,
        cep: result.cliente.cep,
        criadoEm: result.cliente.criadoEm,
      },
      201
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return handleZodError(error);
    }

    if (error instanceof Error) {
      return errorResponse(error.message, 400);
    }

    logger.error("Erro ao criar cliente", error);
    return errorResponse("Erro ao criar cliente", 500);
  }
}

// GET /api/clientes - Listar clientes do fornecedor com paginação
export async function GET(request: NextRequest) {
  try {
    const { fornecedorId } = await requireFornecedor();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const skip = (page - 1) * limit;
    const search = searchParams.get("search") || undefined;

    // Construir filtros
    const where: any = {
      fornecedores: {
        some: {
          fornecedorId,
        },
      },
    };

    if (search) {
      where.OR = [
        { razaoSocial: { contains: search, mode: "insensitive" } },
        { nomeFantasia: { contains: search, mode: "insensitive" } },
        { cnpj: { contains: search } },
        { usuario: { email: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [clientes, total] = await Promise.all([
      prisma.cliente.findMany({
        where,
        skip,
        take: limit,
        orderBy: { criadoEm: "desc" },
        include: {
          usuario: {
            select: {
              id: true,
              email: true,
              nome: true,
              telefone: true,
              ativo: true,
            },
          },
          fornecedores: {
            where: {
              fornecedorId,
            },
            include: {
              listaPreco: {
                select: {
                  id: true,
                  nome: true,
                },
              },
            },
          },
        },
      }),
      prisma.cliente.count({ where }),
    ]);

    const clientesResponse = clientes.map((cliente) => ({
      id: cliente.id,
      usuario: cliente.usuario,
      razaoSocial: cliente.razaoSocial,
      nomeFantasia: cliente.nomeFantasia,
      cnpj: cliente.cnpj,
      inscricaoEstadual: cliente.inscricaoEstadual,
      endereco: cliente.endereco,
      cidade: cliente.cidade,
      estado: cliente.estado,
      cep: cliente.cep,
      listaPreco: cliente.fornecedores[0]?.listaPreco || null,
      criadoEm: cliente.criadoEm,
      atualizadoEm: cliente.atualizadoEm,
    }));

    return successResponse({
      clientes: clientesResponse,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      return errorResponse(error.message, 400);
    }

    logger.error("Erro ao listar clientes", error);
    return errorResponse("Erro ao listar clientes", 500);
  }
}
