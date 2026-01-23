import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, handleZodError, getUserSession } from "@/lib/api-helpers";
import { logger } from "@/lib/logger";
import { Decimal } from "@prisma/client/runtime/library";

const calcularCarrinhoSchema = z.object({
  fornecedorId: z.string().min(1, "Fornecedor é obrigatório"),
  clienteId: z.string().optional(),
  items: z.array(z.object({
    produtoId: z.string().min(1, "Produto é obrigatório"),
    quantidade: z.number().int().min(1, "Quantidade deve ser maior que 0"),
  })).min(1, "Carrinho deve ter ao menos 1 item"),
});

// POST /api/carrinho/calcular - Calcular totais do carrinho
export async function POST(request: NextRequest) {
  try {
    const user = await getUserSession();
    
    const body = await request.json();
    const validatedData = calcularCarrinhoSchema.parse(body);

    const { fornecedorId, clienteId, items } = validatedData;

    // Verificar se fornecedor existe
    const fornecedor = await prisma.fornecedor.findUnique({
      where: { id: fornecedorId },
    });

    if (!fornecedor) {
      return errorResponse("Fornecedor não encontrado", 404);
    }

    // Buscar produtos
    const produtoIds = items.map(item => item.produtoId);
    const produtos = await prisma.produto.findMany({
      where: {
        id: { in: produtoIds },
        fornecedorId,
        ativo: true,
      },
    });

    if (produtos.length !== items.length) {
      return errorResponse("Um ou mais produtos não foram encontrados", 404);
    }

    // Verificar disponibilidade de estoque
    const itemsWithoutStock = items.filter(item => {
      const produto = produtos.find(p => p.id === item.produtoId);
      return produto && produto.quantidadeEstoque < item.quantidade;
    });

    if (itemsWithoutStock.length > 0) {
      const produtosIndisponiveis = itemsWithoutStock.map(item => {
        const produto = produtos.find(p => p.id === item.produtoId);
        return {
          produtoId: item.produtoId,
          nome: produto?.nome,
          disponiveis: produto?.quantidadeEstoque,
          solicitados: item.quantidade,
        };
      });

      return errorResponse("Estoque insuficiente para alguns produtos", 400, {
        produtosIndisponiveis,
      });
    }

    // Buscar lista de preço do cliente (se fornecido)
    let clienteFornecedor = null;
    if (clienteId) {
      clienteFornecedor = await prisma.clienteFornecedor.findUnique({
        where: {
          clienteId_fornecedorId: {
            clienteId,
            fornecedorId,
          },
        },
        include: {
          listaPreco: true,
        },
      });
    }

    // Buscar preços customizados do cliente
    const precosCustomizados = clienteId
      ? await prisma.precoCustomizado.findMany({
          where: {
            clienteId,
            produtoId: { in: produtoIds },
          },
        })
      : [];

    // Buscar itens da lista de preço
    const itensListaPreco = clienteFornecedor?.listaPrecoId
      ? await prisma.itemListaPreco.findMany({
          where: {
            listaPrecoId: clienteFornecedor.listaPrecoId,
            produtoId: { in: produtoIds },
          },
        })
      : [];

    // Calcular preço para cada item
    const itemsCalculados = items.map(item => {
      const produto = produtos.find(p => p.id === item.produtoId)!;
      
      // Prioridade: Preço Customizado > Item Lista Preço > Lista Preço (desconto) > Preço Base
      let precoUnitario = produto.precoBase;

      // Verificar preço customizado
      const precoCustomizado = precosCustomizados.find(pc => pc.produtoId === item.produtoId);
      if (precoCustomizado) {
        precoUnitario = precoCustomizado.preco;
      } else {
        // Verificar item da lista de preço (preço especial)
        const itemLista = itensListaPreco.find(ilp => ilp.produtoId === item.produtoId);
        if (itemLista?.precoEspecial) {
          precoUnitario = itemLista.precoEspecial;
        } else if (clienteFornecedor?.listaPreco && clienteFornecedor.listaPreco.ativo) {
          // Aplicar desconto da lista de preço
          const lista = clienteFornecedor.listaPreco;
          if (lista.tipoDesconto === "percentual") {
            const desconto = produto.precoBase.mul(lista.valorDesconto).div(100);
            precoUnitario = produto.precoBase.sub(desconto);
          } else {
            // fixo
            precoUnitario = produto.precoBase.sub(lista.valorDesconto);
          }
          
          // Garantir que o preço não seja negativo
          if (precoUnitario.lessThan(0)) {
            precoUnitario = new Decimal(0);
          }
        }
      }

      const precoTotal = precoUnitario.mul(item.quantidade);

      return {
        produto: {
          id: produto.id,
          nome: produto.nome,
          sku: produto.sku,
          imagens: produto.imagens,
          quantidadeEstoque: produto.quantidadeEstoque,
        },
        quantidade: item.quantidade,
        precoUnitario: precoUnitario.toString(),
        precoTotal: precoTotal.toString(),
      };
    });

    // Calcular totais
    const subtotal = itemsCalculados.reduce(
      (acc, item) => acc.add(new Decimal(item.precoTotal)),
      new Decimal(0)
    );

    const desconto = new Decimal(0); // Pode ser implementado posteriormente
    const frete = new Decimal(0); // Pode ser implementado posteriormente
    const total = subtotal.sub(desconto).add(frete);

    logger.info("Carrinho calculado", {
      fornecedorId,
      clienteId,
      itemsCount: items.length,
      total: total.toString(),
    });

    return successResponse({
      items: itemsCalculados,
      subtotal: subtotal.toString(),
      desconto: desconto.toString(),
      frete: frete.toString(),
      total: total.toString(),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return handleZodError(error);
    }

    if (error instanceof Error) {
      return errorResponse(error.message, 400);
    }

    logger.error("Erro ao calcular carrinho", error);
    return errorResponse("Erro ao calcular carrinho", 500);
  }
}
