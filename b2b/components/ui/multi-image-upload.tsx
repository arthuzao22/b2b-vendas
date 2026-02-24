'use client';

import { Upload, X, Loader2, ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { useRef, useState, useCallback } from 'react';
import { Button } from './button';

interface MultiImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  disabled?: boolean;
  maxImages?: number;
  maxSizeMB?: number;
  acceptedFormats?: string[];
}

export function MultiImageUpload({
  value = [],
  onChange,
  disabled = false,
  maxImages = 5,
  maxSizeMB = 5,
  acceptedFormats = ['image/jpeg', 'image/png', 'image/webp'],
}: MultiImageUploadProps) {
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isUploading = Object.values(uploading).some(Boolean);
  const canAddMore = value.length < maxImages && !disabled;

  const uploadFile = useCallback(async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        return data.data.url;
      } else {
        throw new Error(data.error || 'Erro ao fazer upload');
      }
    } catch (err) {
      throw err;
    }
  }, []);

  const deleteBlob = useCallback(async (url: string) => {
    // Só deleta do Blob se for uma URL do Vercel Blob
    if (!url.includes('.blob.vercel-storage.com')) return;

    try {
      await fetch('/api/upload/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
    } catch (err) {
      console.error('Erro ao deletar imagem do blob:', err);
    }
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setError(null);

    const remaining = maxImages - value.length;
    const filesToUpload = Array.from(files).slice(0, remaining);

    if (files.length > remaining) {
      setError(`Apenas ${remaining} imagem(ns) pode(m) ser adicionada(s). Máximo: ${maxImages}`);
    }

    // Validar cada arquivo
    for (const file of filesToUpload) {
      if (!acceptedFormats.includes(file.type)) {
        setError(`Arquivo "${file.name}" tem formato não suportado. Use JPEG, PNG ou WebP.`);
        return;
      }
      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`Arquivo "${file.name}" excede o tamanho máximo de ${maxSizeMB}MB.`);
        return;
      }
    }

    // Upload de cada arquivo
    const uploadPromises = filesToUpload.map(async (file) => {
      const tempId = `${file.name}-${Date.now()}`;
      setUploading(prev => ({ ...prev, [tempId]: true }));

      try {
        const url = await uploadFile(file);
        return url;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao fazer upload');
        return null;
      } finally {
        setUploading(prev => {
          const next = { ...prev };
          delete next[tempId];
          return next;
        });
      }
    });

    const results = await Promise.all(uploadPromises);
    const successUrls = results.filter((url): url is string => url !== null);

    if (successUrls.length > 0) {
      onChange([...value, ...successUrls]);
    }

    // Limpar input para permitir reenvio do mesmo arquivo
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemove = async (index: number) => {
    const urlToRemove = value[index];
    const newUrls = value.filter((_, i) => i !== index);
    onChange(newUrls);

    // Deletar do Blob em background
    await deleteBlob(urlToRemove);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedFormats.join(',')}
        onChange={handleFileChange}
        disabled={disabled || isUploading}
        multiple
        className="hidden"
      />

      {/* Grid de imagens existentes */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {value.map((url, index) => (
            <div key={url} className="relative group aspect-square">
              <div className="relative h-full w-full overflow-hidden rounded-lg border bg-muted">
                <Image
                  src={url}
                  alt={`Imagem ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                />
              </div>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                onClick={() => handleRemove(index)}
                disabled={disabled || isUploading}
              >
                <X className="h-3 w-3" />
              </Button>
              {index === 0 && (
                <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
                  Principal
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Zona de upload */}
      {canAddMore && (
        <button
          type="button"
          onClick={handleClick}
          disabled={disabled || isUploading}
          className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-muted/30"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-8 w-8 text-gray-400 mb-2 animate-spin" />
              <p className="text-sm text-gray-600">Enviando imagem...</p>
            </>
          ) : (
            <>
              <Upload className="h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">Clique para fazer upload</p>
              <p className="text-xs text-gray-400 mt-1">
                {acceptedFormats.map(f => f.split('/')[1].toUpperCase()).join(', ')} - Máx. {maxSizeMB}MB
              </p>
              <p className="text-xs text-gray-400">
                {value.length}/{maxImages} imagens
              </p>
            </>
          )}
        </button>
      )}

      {/* Limite atingido */}
      {!canAddMore && value.length >= maxImages && (
        <p className="text-xs text-muted-foreground text-center">
          Limite de {maxImages} imagens atingido
        </p>
      )}

      {/* Erro */}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
