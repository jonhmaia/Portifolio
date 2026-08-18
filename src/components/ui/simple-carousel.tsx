'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface CarouselProps {
  images: {
    id: number
    image_url: string
    caption?: string | null
  }[]
  className?: string
  /** cover = crop to aspect-video; contain = show full image at natural height */
  fit?: 'cover' | 'contain'
}

const GALLERY_SIZES = '(max-width: 56rem) 94vw, 70rem'
const BLUR_DATA_URL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYGD4DwABBAEAfbFIhwAAAABJRU5ErkJggg=='

function wrapIndex(index: number, length: number) {
  return (index + length) % length
}

function shouldRenderImage(index: number, currentIndex: number, length: number, seen: Set<number>) {
  if (seen.has(index)) return true
  if (length <= 3) return true
  return (
    index === currentIndex ||
    index === wrapIndex(currentIndex - 1, length) ||
    index === wrapIndex(currentIndex + 1, length)
  )
}

export function Carousel({ images, className, fit = 'cover' }: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [seen, setSeen] = useState(() => new Set([0]))
  const [loaded, setLoaded] = useState(() => new Set<number>())

  const showFullImage = fit === 'contain'
  const swipeConfidenceThreshold = 8000

  const visibleIndexes = useMemo(
    () => images.map((_, index) => index).filter((index) => shouldRenderImage(index, currentIndex, images.length, seen)),
    [currentIndex, images, seen],
  )

  const goTo = (index: number) => {
    const nextIndex = wrapIndex(index, images.length)
    setCurrentIndex(nextIndex)
    setSeen((current) => {
      const next = new Set(current)
      next.add(nextIndex)
      next.add(wrapIndex(nextIndex - 1, images.length))
      next.add(wrapIndex(nextIndex + 1, images.length))
      return next
    })
  }

  const paginate = (direction: number) => {
    goTo(currentIndex + direction)
  }

  if (!images.length) return null

  return (
    <div className={cn('relative group overflow-hidden rounded-xl border border-border bg-background', className)}>
      <motion.div
        className={cn(
          'relative w-full overflow-hidden bg-[#171914]',
          showFullImage ? 'aspect-[16/10]' : 'aspect-video',
        )}
        drag={images.length > 1 ? 'x' : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.18}
        onDragEnd={(_, { offset, velocity }) => {
          const swipe = Math.abs(offset.x) * Math.abs(velocity.x)
          if (swipe < swipeConfidenceThreshold) return
          paginate(offset.x < 0 ? 1 : -1)
        }}
      >
        {visibleIndexes.map((index) => {
          const image = images[index]
          const isActive = index === currentIndex
          const isNeighbor =
            index === wrapIndex(currentIndex - 1, images.length) ||
            index === wrapIndex(currentIndex + 1, images.length)

          return (
            <div
              key={image.id}
              className={cn(
                'absolute inset-0 transition-opacity duration-300 ease-out',
                isActive ? 'opacity-100 z-[1]' : 'opacity-0 z-0 pointer-events-none',
              )}
              aria-hidden={!isActive}
            >
              <Image
                src={image.image_url}
                alt={image.caption || ''}
                fill
                sizes={GALLERY_SIZES}
                quality={80}
                priority={index === 0}
                loading={index === 0 ? undefined : isActive || isNeighbor ? 'eager' : 'lazy'}
                fetchPriority={index === 0 ? 'high' : isActive ? 'high' : 'low'}
                placeholder="blur"
                blurDataURL={BLUR_DATA_URL}
                onLoad={() => {
                  setLoaded((current) => {
                    if (current.has(index)) return current
                    const next = new Set(current)
                    next.add(index)
                    return next
                  })
                }}
                className={cn(
                  showFullImage ? 'object-contain' : 'object-cover',
                  'transition-opacity duration-300',
                  loaded.has(index) ? 'opacity-100' : 'opacity-0',
                )}
              />
              {isActive && image.caption && (
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent pointer-events-none">
                  <p className="text-white text-sm font-medium">{image.caption}</p>
                </div>
              )}
            </div>
          )
        })}
      </motion.div>

      {images.length > 1 && (
        <>
          <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[2]">
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 rounded-full bg-black/50 hover:bg-black/70 text-white border-0 pointer-events-auto backdrop-blur-sm"
              onClick={() => paginate(-1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 rounded-full bg-black/50 hover:bg-black/70 text-white border-0 pointer-events-auto backdrop-blur-sm"
              onClick={() => paginate(1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="absolute left-1/2 -translate-x-1/2 bottom-3 flex gap-2 z-[2]">
            {images.map((image, index) => (
              <button
                key={image.id}
                type="button"
                onClick={() => goTo(index)}
                className={cn(
                  'w-2 h-2 rounded-full transition-all shadow-sm',
                  index === currentIndex ? 'bg-white w-4' : 'bg-white/50 hover:bg-white/80',
                )}
                aria-label={`Imagem ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
