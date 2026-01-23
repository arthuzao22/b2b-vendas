import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, requireAuth } from "@/lib/api-helpers";
import { logger } from "@/lib/logger";
import { TipoUsuario } from "@prisma/client";

// GET /api/estoque/alertas - Obter produtos com estoque baixo
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const skip = (page - 1) * limit;

    // Construir filtros baseados no tipo de usuário
    const where: any = {
      ativo: true,
    };

    // Fornecedor: apenas seus produtos
    if (user.tipo === TipoUsuario.fornecedor) {
      if (!user.fornecedorId) {
        return errorResponse("Fornecedor não encontrado", 404);
      }
      where.fornecedorId = user.fornecedorId;
    } else if (user.tipo === TipoUsuario.cliente) {
      // Cliente não tem acesso a esta informação
      return errorResponse("Sem permissão para visualizar alertas de estoque", 403);
    }

    // Produtos com estoque <= estoqueMinimo
    const [produtosComEstoqueBaixo, total] = await Promise.all([
      prisma.$queryRaw`
        SELECT 
          p.id,
          p.nome,
          p.sku,
          p."quantidade_estoque" as "quantidadeEstoque",
          p."estoque_minimo" as "estoqueMinimo",
          p."estoque_maximo" as "estoqueMaximo",
          p.imagens,
          p."fornecedor_id" as "fornecedorId",
          f."nome_fantasia" as "fornecedorNomeFantasia",
          f."razao_social" as "fornecedorRazaoSocial"
        FROM produtos p
        INNER JOIN fornecedores f ON p."fornecedor_id" = f.id
        WHERE p."quantidade_estoque" <= p."estoque_minimo"
          AND p.ativo = true
          ${user.tipo === TipoUsuario.fornecedor ? prisma.$queryRaw`AND p."fornecedor_id" = ${user.fornecedorId}` : prisma.$queryRaw``}
        ORDER BY (p."quantidade_estoque"::float / NULLIF(p."estoque_minimo", 0)) ASC
        LIMIT ${limit}
        OFFSET ${skip}
      ` as Promise<any[]>,
      prisma.produto.count({
        where: {
          ...where,
          quantidadeEstoque: {
            lte: prisma.produto.fields.estoqueMinimo,
          },
        },
      }),
    ]);

    // Calcular percentual de estoque para cada produto
    const alertas = produtosComEstoqueBaixo.map((produto: any) => ({
      ...produto,
      percentualEstoque: produto.estoqueMinimo > 0 
        ? Math.round((produto.quantidadeEstoque / produto.estoqueMinimo) * 100)
        : 0,
      criticidade: produto.quantidadeEstoque === 0 
        ? "critico" 
        : produto.quantidadeEstoque <= produto.estoqueMinimo * 0.5 
        ? "alto" 
        : "medio",
    }));

    return successResponse({
      alertas,
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

    logger.error("Erro ao obter alertas de estoque", error);
    return errorResponse("Erro ao obter alertas de estoque", 500);
  }
}
