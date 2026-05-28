'use client'

import { useState, useCallback, useRef } from 'react'
import Image from 'next/image'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, X, Loader2, Plus, ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export interface GalleryImage {
  id?: number
  image_url: string
  caption: string | null
  display_order: number
  _tempId?: string // Para imagens novas que ainda não têm ID
}

interface GalleryManagerProps {
  images: GalleryImage[]
  onChange: (images: GalleryImage[]) => void
  bucket?: string
  folder?: string
}

interface SortableImageItemProps {
  image: GalleryImage
  onRemove: () => void
  onCaptionChange: (caption: string) => void
}

function SortableImageItem({ image, onRemove, onCaptionChange }: SortableImageItemProps) {
  const id = image.id?.toString() || image._tempId || image.image_url
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative bg-card border border-border rounded-lg overflow-hidden',
        isDragging && 'opacity-50 z-50'
      )}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 z-10 p-1 bg-black/50 rounded cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4 text-white" />
      </div>

      {/* Remove Button */}
      <Button
        type="button"
        variant="destructive"
        size="icon"
        className="absolute top-2 right-2 z-10 h-7 w-7"
        onClick={onRemove}
      >
        <X className="h-4 w-4" />
      </Button>

      {/* Image Preview */}
      <div className="aspect-video relative">
        <Image
          src={image.image_url}
          alt={image.caption || 'Imagem da galeria'}
          fill
          className="object-cover"
        />
      </div>

      {/* Caption Input */}
      <div className="p-2">
        <Input
          placeholder="Legenda (opcional)"
          value={image.caption || ''}
          onChange={(e) => onCaptionChange(e.target.value)}
          className="text-sm"
        />
      </div>
    </div>
  )
}

export function GalleryManager({
  images,
  onChange,
  bucket = 'projects',
  folder,
}: GalleryManagerProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isDraggingFile, setIsDraggingFile] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const uploadFiles = async (files: FileList) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
    const validFiles = Array.from(files).filter((file) => {
      if (!validTypes.includes(file.type)) {
        toast.error(`${file.name}: Tipo inválido`)
        return false
      }
      return true
    })

    if (validFiles.length === 0) return

    setIsUploading(true)
    const newImages: GalleryImage[] = []

    try {
      for (const file of validFiles) {
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
          throw new Error(error.error || `Erro ao enviar ${file.name}`)
        }

        const { data } = await res.json()
        newImages.push({
          image_url: data.url,
          caption: null,
          display_order: images.length + newImages.length,
          _tempId: `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        })
      }

      onChange([...images, ...newImages])
      toast.success(`${newImages.length} imagem(ns) adicionada(s)`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao fazer upload')
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files && files.length > 0) {
        uploadFiles(files)
      }
      if (inputRef.current) {
        inputRef.current.value = ''
      }
    },
    [images, bucket, folder]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDraggingFile(false)

      const files = e.dataTransfer.files
      if (files && files.length > 0) {
        uploadFiles(files)
      }
    },
    [images, bucket, folder]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDraggingFile(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDraggingFile(false)
  }, [])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = images.findIndex(
        (img) => (img.id?.toString() || img._tempId || img.image_url) === active.id
      )
      const newIndex = images.findIndex(
        (img) => (img.id?.toString() || img._tempId || img.image_url) === over.id
      )

      const newImages = arrayMove(images, oldIndex, newIndex).map((img, index) => ({
        ...img,
        display_order: index,
      }))

      onChange(newImages)
    }
  }

  const handleRemove = (index: number) => {
    const newImages = images
      .filter((_, i) => i !== index)
      .map((img, i) => ({ ...img, display_order: i }))
    onChange(newImages)
  }

  const handleCaptionChange = (index: number, caption: string) => {
    const newImages = images.map((img, i) =>
      i === index ? { ...img, caption: caption || null } : img
    )
    onChange(newImages)
  }

  const sortableIds = images.map(
    (img) => img.id?.toString() || img._tempId || img.image_url
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Galeria de Imagens
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
          onChange={handleFileSelect}
          className="hidden"
          multiple
          disabled={isUploading}
        />

        {/* Upload Area */}
        <div
          onClick={() => !isUploading && inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            'rounded-lg border-2 border-dashed p-6 transition-colors cursor-pointer',
            'flex flex-col items-center justify-center gap-2 text-muted-foreground',
            isDraggingFile
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50 hover:bg-muted/50',
            isUploading && 'pointer-events-none opacity-50'
          )}
        >
          {isUploading ? (
            <>
              <Loader2 className="h-6 w-6 animate-spin" />
              <p className="text-sm">Enviando imagens...</p>
            </>
          ) : (
            <>
              <Plus className="h-6 w-6" />
              <p className="text-sm">Adicionar imagens à galeria</p>
              <p className="text-xs">Arraste ou clique para selecionar múltiplas imagens</p>
            </>
          )}
        </div>

        {/* Image Grid */}
        {images.length > 0 && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={sortableIds} strategy={rectSortingStrategy}>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {images.map((image, index) => (
                  <SortableImageItem
                    key={image.id?.toString() || image._tempId || image.image_url}
                    image={image}
                    onRemove={() => handleRemove(index)}
                    onCaptionChange={(caption) => handleCaptionChange(index, caption)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {images.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhuma imagem na galeria. Adicione imagens acima.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
