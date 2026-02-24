import { NextRequest } from "next/server";
import { successResponse, errorResponse, requireFornecedor } from "@/lib/api-helpers";
import { logger } from "@/lib/logger";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

async function uploadToVercelBlob(filename: string, file: File) {
  const { put } = await import("@vercel/blob");
  const blob = await put(filename, file, {
    access: "public",
    addRandomSuffix: false,
  });
  return blob.url;
}

async function uploadToLocal(filename: string, file: File) {
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  const filePath = path.join(uploadsDir, filename);
  const dirPath = path.dirname(filePath);

  await mkdir(dirPath, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);

  return `/uploads/${filename}`;
}

// POST /api/upload - Upload de imagem
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

    let url: string;

    if (process.env.BLOB_READ_WRITE_TOKEN) {
      // Produção: Upload para Vercel Blob
      url = await uploadToVercelBlob(filename, file);
      logger.info("Imagem enviada ao Vercel Blob", { url });
    } else {
      // Desenvolvimento local: salvar em public/uploads/
      url = await uploadToLocal(filename, file);
      logger.info("Imagem salva localmente (sem BLOB_READ_WRITE_TOKEN)", { url });
    }

    return successResponse({ url }, 201);
  } catch (error) {
    if (error instanceof Error) {
      return errorResponse(error.message, 400);
    }

    logger.error("Erro ao fazer upload de imagem", error);
    return errorResponse("Erro ao fazer upload de imagem", 500);
  }
}
