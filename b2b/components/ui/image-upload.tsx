// ImageUpload component with preview
'use client';

import { Upload, X, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { useRef, useState } from 'react';
import { Button } from './button';

interface ImageUploadProps {
  value?: string;
  onChange: (file: File | null) => void;
  onRemove?: () => void;
  disabled?: boolean;
  maxSizeMB?: number;
  acceptedFormats?: string[];
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  disabled = false,
  maxSizeMB = 5,
  acceptedFormats = ['image/jpeg', 'image/png', 'image/webp'],
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!acceptedFormats.includes(file.type)) {
      setError('Formato de arquivo não suportado');
      return;
    }

    // Validate file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setError(`O arquivo deve ter no máximo ${maxSizeMB}MB`);
      return;
    }

    setError(null);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    onChange(file);
  };

  const handleRemove = () => {
    setPreview(null);
    setError(null);
    onChange(null);
    if (onRemove) onRemove();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedFormats.join(',')}
        onChange={handleFileChange}
        disabled={disabled}
        className="hidden"
      />

      {preview ? (
        <div className="relative group">
          <div className="relative h-48 w-full overflow-hidden rounded-lg border">
            <Image
              src={preview}
              alt="Preview"
              fill
              className="object-cover"
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleRemove}
            disabled={disabled}
          >
            <X className="h-4 w-4 mr-1" />
            Remover
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleClick}
          disabled={disabled}
          className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Upload className="h-8 w-8 text-gray-400 mb-2" />
          <p className="text-sm text-gray-600">Clique para fazer upload</p>
          <p className="text-xs text-gray-400 mt-1">
            {acceptedFormats.map(f => f.split('/')[1].toUpperCase()).join(', ')} - Máx. {maxSizeMB}MB
          </p>
        </button>
      )}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
