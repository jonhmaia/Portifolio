'use client'

import { useState, useCallback, useRef } from 'react'
import { Upload, X, Loader2, FileText, Download, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface PdfUploaderProps {
  value?: string | null
  onChange: (url: string | null) => void
  bucket?: string
  folder?: string
  className?: string
  placeholder?: string
}

export function PdfUploader({
  value,
  onChange,
  bucket = 'resumes',
  folder,
  className,
  placeholder = 'Arraste seu currículo em PDF ou clique para selecionar',
}: PdfUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const uploadFile = async (file: File) => {
    // Validate file type
    if (file.type !== 'application/pdf') {
      toast.error('Tipo de arquivo inválido. Somente arquivos PDF são permitidos.')
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Limite máximo: 5MB')
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
      toast.success('Currículo em PDF enviado com sucesso!')
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
    toast.success('Arquivo removido (lembre-se de salvar as alterações).')
  }

  // Extrair o nome do arquivo da URL para exibir um nome amigável
  const getFriendlyFileName = (url: string) => {
    try {
      const decoded = decodeURIComponent(url)
      const parts = decoded.split('/')
      const lastPart = parts[parts.length - 1]
      // Remover o timestamp aleatório se existir no padrão do upload
      if (lastPart.match(/^\d+-\w+\.pdf$/)) {
        return lastPart.substring(lastPart.indexOf('-') + 1)
      }
      return lastPart || 'curriculo.pdf'
    } catch {
      return 'curriculo.pdf'
    }
  }

  return (
    <div className={cn('relative', className)}>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
      />

      {value ? (
        // Preview/Info do PDF
        <div className="relative rounded-2xl border border-border bg-card/50 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
              <FileText className="h-6 w-6" />
            </div>
            <div className="text-left space-y-1 overflow-hidden">
              <p className="font-semibold text-sm truncate max-w-[280px] sm:max-w-[400px]">
                {getFriendlyFileName(value)}
              </p>
              <div className="flex items-center gap-1.5 text-emerald-500 text-xs">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>PDF anexado e pronto</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-none gap-1.5"
              asChild
            >
              <a href={value} target="_blank" rel="noopener noreferrer" download="curriculo.pdf">
                <Download className="h-4 w-4" />
                Baixar
              </a>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => inputRef.current?.click()}
              disabled={isUploading}
              className="flex-1 sm:flex-none gap-1.5"
            >
              {isUploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              Alterar
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleRemove}
              disabled={isUploading}
              className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl"
              title="Remover"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        // Área de Upload (Drag & Drop)
        <div
          onClick={() => !isUploading && inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            'rounded-2xl border-2 border-dashed py-10 px-6 flex flex-col items-center justify-center gap-3 text-muted-foreground transition-all cursor-pointer min-h-[160px]',
            isDragging
              ? 'border-primary bg-primary/5 scale-[0.99]'
              : 'border-border hover:border-primary/50 hover:bg-muted/50',
            isUploading && 'pointer-events-none opacity-50'
          )}
        >
          {isUploading ? (
            <>
              <Loader2 className="h-9 w-9 animate-spin text-primary" />
              <p className="text-sm font-medium">Enviando PDF...</p>
            </>
          ) : (
            <>
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                <Upload className="h-6 w-6" />
              </div>
              <p className="text-sm text-center px-4 font-medium">{placeholder}</p>
              <p className="text-xs text-muted-foreground/60">Somente arquivos PDF (tamanho máximo 5MB)</p>
            </>
          )}
        </div>
      )}
    </div>
  )
}
