import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, getUserSession } from "@/lib/api-helpers";
import { logger } from "@/lib/logger";
import { TipoUsuario, TipoDesconto } from "@prisma/client";

// GET /api/produtos/[id]/preco - Calcular preço para cliente
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: produtoId } = params;
    const { searchParams } = new URL(request.url);
    const clienteIdParam = searchParams.get("clienteId");

    // Verificar se produto existe
    const produto = await prisma.produto.findUnique({
      where: { id: produtoId },
      select: {
        id: true,
        nome: true,
        precoBase: true,
        fornecedorId: true,
        ativo: true,
      },
    });

    if (!produto) {
      return errorResponse("Produto não encontrado", 404);
    }

    if (!produto.ativo) {
      return errorResponse("Produto não está ativo", 400);
    }

    // Obter sessão do usuário
    const user = await getUserSession();
    
    // Determinar clienteId
    let clienteId: string | null = null;

    if (user && user.tipo === TipoUsuario.cliente) {
      clienteId = user.clienteId || null;
    } else if (clienteIdParam) {
      // Verificar se o clienteId fornecido existe
      const clienteExists = await prisma.cliente.findUnique({
        where: { id: clienteIdParam },
      });

      if (!clienteExists) {
        return errorResponse("Cliente não encontrado", 404);
      }

      clienteId = clienteIdParam;
    }

    // Se não há clienteId, retornar preço base
    if (!clienteId) {
      return successResponse({
        preco: produto.precoBase.toString(),
        tipo: "base",
        produto: {
          id: produto.id,
          nome: produto.nome,
        },
      });
    }

    // 1. Verificar preço customizado (prioridade máxima)
    const precoCustomizado = await prisma.precoCustomizado.findUnique({
      where: {
        clienteId_produtoId: {
          clienteId,
          produtoId,
        },
      },
    });

    if (precoCustomizado) {
      logger.info("Preço customizado aplicado", { 
        clienteId, 
        produtoId,
        preco: precoCustomizado.preco.toString() 
      });

      return successResponse({
        preco: precoCustomizado.preco.toString(),
        tipo: "customizado",
        produto: {
          id: produto.id,
          nome: produto.nome,
        },
      });
    }

    // 2. Verificar lista de preço via relacionamento ClienteFornecedor
    const clienteFornecedor = await prisma.clienteFornecedor.findUnique({
      where: {
        clienteId_fornecedorId: {
          clienteId,
          fornecedorId: produto.fornecedorId,
        },
      },
      include: {
        listaPreco: {
          include: {
            itens: {
              where: {
                produtoId,
              },
            },
          },
        },
      },
    });

    if (
      clienteFornecedor?.listaPreco && 
      clienteFornecedor.listaPreco.ativo &&
      clienteFornecedor.listaPreco.itens.length > 0
    ) {
      const itemListaPreco = clienteFornecedor.listaPreco.itens[0];
      
      // Se tem preço especial definido, usar ele
      if (itemListaPreco.precoEspecial) {
        logger.info("Preço de lista especial aplicado", { 
          clienteId, 
          produtoId,
          listaPrecoId: clienteFornecedor.listaPreco.id,
          preco: itemListaPreco.precoEspecial.toString() 
        });

        return successResponse({
          preco: itemListaPreco.precoEspecial.toString(),
          tipo: "lista",
          listaPreco: {
            id: clienteFornecedor.listaPreco.id,
            nome: clienteFornecedor.listaPreco.nome,
          },
          produto: {
            id: produto.id,
            nome: produto.nome,
          },
        });
      }

      // Se não tem preço especial, aplicar desconto da lista no preço base
      const { tipoDesconto, valorDesconto } = clienteFornecedor.listaPreco;
      let precoFinal = produto.precoBase;

      if (tipoDesconto === TipoDesconto.percentual) {
        // Desconto percentual
        const desconto = produto.precoBase.mul(valorDesconto).div(100);
        precoFinal = produto.precoBase.sub(desconto);
      } else if (tipoDesconto === TipoDesconto.fixo) {
        // Desconto fixo
        precoFinal = produto.precoBase.sub(valorDesconto);
        // Garantir que o preço não fique negativo
        if (precoFinal.lt(0)) {
          precoFinal = new (require("@prisma/client/runtime/library").Decimal)(0);
        }
      }

      logger.info("Preço de lista com desconto aplicado", { 
        clienteId, 
        produtoId,
        listaPrecoId: clienteFornecedor.listaPreco.id,
        tipoDesconto,
        valorDesconto: valorDesconto.toString(),
        precoBase: produto.precoBase.toString(),
        precoFinal: precoFinal.toString() 
      });

      return successResponse({
        preco: precoFinal.toString(),
        tipo: "lista",
        listaPreco: {
          id: clienteFornecedor.listaPreco.id,
          nome: clienteFornecedor.listaPreco.nome,
          tipoDesconto,
          valorDesconto: valorDesconto.toString(),
        },
        produto: {
          id: produto.id,
          nome: produto.nome,
        },
      });
    }

    // 3. Retornar preço base se não houver nenhum preço especial
    logger.info("Preço base aplicado", { 
      clienteId, 
      produtoId,
      preco: produto.precoBase.toString() 
    });

    return successResponse({
      preco: produto.precoBase.toString(),
      tipo: "base",
      produto: {
        id: produto.id,
        nome: produto.nome,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      return errorResponse(error.message, 400);
    }

    logger.error("Erro ao calcular preço do produto", error);
    return errorResponse("Erro ao calcular preço do produto", 500);
  }
}
