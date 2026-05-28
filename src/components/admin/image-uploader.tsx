'use client'

import { useState, useCallback, useRef } from 'react'
import Image from 'next/image'
import { Upload, X, Loader2, ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface ImageUploaderProps {
  value?: string | null
  onChange: (url: string | null) => void
  bucket?: string
  folder?: string
  className?: string
  aspectRatio?: 'video' | 'square' | 'auto'
  placeholder?: string
}

export function ImageUploader({
  value,
  onChange,
  bucket = 'projects',
  folder,
  className,
  aspectRatio = 'video',
  placeholder = 'Arraste uma imagem ou clique para selecionar',
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const aspectClasses = {
    video: 'aspect-video',
    square: 'aspect-square',
    auto: 'min-h-[200px]',
  }

  const uploadFile = async (file: File) => {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
    if (!validTypes.includes(file.type)) {
      toast.error('Tipo de arquivo inválido. Use: JPG, PNG, GIF, WebP ou SVG')
      return
    }


    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('bucket', bucket)
      if (folder) {
        formData.append('folder', folder)
      }

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Erro ao fazer upload')
      }

      const { data } = await res.json()
      onChange(data.url)
      toast.success('Imagem enviada com sucesso!')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao fazer upload')
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        uploadFile(file)
      }
      // Reset input so the same file can be selected again
      if (inputRef.current) {
        inputRef.current.value = ''
      }
    },
    [bucket, folder]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

      const file = e.dataTransfer.files?.[0]
      if (file) {
        uploadFile(file)
      }
    },
    [bucket, folder]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleRemove = () => {
    onChange(null)
  }

  return (
    <div className={cn('relative', className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
      />

      {value ? (
        // Preview da imagem
        <div className={cn('relative rounded-lg overflow-hidden border border-border', aspectClasses[aspectRatio])}>
          <Image
            src={value}
            alt="Preview"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => inputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              Trocar
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleRemove}
              disabled={isUploading}
            >
              <X className="h-4 w-4" />
              Remover
            </Button>
          </div>
        </div>
      ) : (
        // Área de upload
        <div
          onClick={() => !isUploading && inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            'rounded-lg border-2 border-dashed transition-colors cursor-pointer',
            aspectClasses[aspectRatio],
            'flex flex-col items-center justify-center gap-2 text-muted-foreground',
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50 hover:bg-muted/50',
            isUploading && 'pointer-events-none opacity-50'
          )}
        >
          {isUploading ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="text-sm">Enviando...</p>
            </>
          ) : (
            <>
              <ImageIcon className="h-8 w-8" />
              <p className="text-sm text-center px-4">{placeholder}</p>
              <p className="text-xs">JPG, PNG, GIF, WebP ou SVG</p>
            </>
          )}
        </div>
      )}
    </div>
  )
}
