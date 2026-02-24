import { NextRequest } from "next/server";
import { del } from "@vercel/blob";
import { successResponse, errorResponse, requireFornecedor } from "@/lib/api-helpers";
import { logger } from "@/lib/logger";

// POST /api/upload/delete - Deletar imagem do Vercel Blob
export async function POST(request: NextRequest) {
  try {
    await requireFornecedor();

    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== "string") {
      return errorResponse("URL da imagem é obrigatória", 400);
    }

    // Validar que a URL pertence ao Vercel Blob
    if (!url.includes(".blob.vercel-storage.com")) {
      return errorResponse("URL inválida - não pertence ao Vercel Blob", 400);
    }

    await del(url);

    logger.info("Imagem deletada do Vercel Blob", { url });

    return successResponse({ message: "Imagem deletada com sucesso" });
  } catch (error) {
    if (error instanceof Error) {
      return errorResponse(error.message, 400);
    }

    logger.error("Erro ao deletar imagem do Blob", error);
    return errorResponse("Erro ao deletar imagem", 500);
  }
}
