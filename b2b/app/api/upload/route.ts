import { NextRequest } from "next/server";
import { put } from "@vercel/blob";
import { successResponse, errorResponse, requireFornecedor } from "@/lib/api-helpers";
import { logger } from "@/lib/logger";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

// POST /api/upload - Upload de imagem para Vercel Blob
export async function POST(request: NextRequest) {
  try {
    await requireFornecedor();

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return errorResponse("Nenhum arquivo enviado", 400);
    }

    // Validar tipo de arquivo
    if (!ALLOWED_TYPES.includes(file.type)) {
      return errorResponse(
        "Formato de arquivo não suportado. Use JPEG, PNG ou WebP.",
        400
      );
    }

    // Validar tamanho
    if (file.size > MAX_SIZE_BYTES) {
      return errorResponse("O arquivo deve ter no máximo 5MB", 400);
    }

    // Gerar nome único para o arquivo
    const ext = file.name.split(".").pop() || "jpg";
    const filename = `produtos/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

    // Upload para Vercel Blob
    const blob = await put(filename, file, {
      access: "public",
      addRandomSuffix: false,
    });

    logger.info("Imagem enviada ao Vercel Blob", { url: blob.url });

    return successResponse({ url: blob.url }, 201);
  } catch (error) {
    if (error instanceof Error) {
      return errorResponse(error.message, 400);
    }

    logger.error("Erro ao fazer upload de imagem", error);
    return errorResponse("Erro ao fazer upload de imagem", 500);
  }
}
