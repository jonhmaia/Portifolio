"use client"

import * as React from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

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

export function Carousel({ images, className, fit = 'cover' }: CarouselProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const [direction, setDirection] = React.useState(0)

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  }

  const swipeConfidenceThreshold = 10000
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity
  }

  const paginate = (newDirection: number) => {
    setDirection(newDirection)
    setCurrentIndex((prevIndex) => {
      let nextIndex = prevIndex + newDirection
      if (nextIndex < 0) nextIndex = images.length - 1
      if (nextIndex >= images.length) nextIndex = 0
      return nextIndex
    })
  }

  if (!images.length) return null

  const showFullImage = fit === 'contain'

  return (
    <div className={cn("relative group overflow-hidden rounded-xl border border-border bg-background", className)}>
      <div
        className={cn(
          "relative w-full overflow-hidden",
          showFullImage ? "bg-muted/10" : "aspect-video"
        )}
      >
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = swipePower(offset.x, velocity.x)

              if (swipe < -swipeConfidenceThreshold) {
                paginate(1)
              } else if (swipe > swipeConfidenceThreshold) {
                paginate(-1)
              }
            }}
            className={cn(
              showFullImage ? "relative w-full" : "absolute inset-0 w-full h-full"
            )}
          >
            {showFullImage ? (
              <Image
                src={images[currentIndex].image_url}
                alt={images[currentIndex].caption || ""}
                width={0}
                height={0}
                sizes="100vw"
                className="block w-full h-auto"
                style={{ width: '100%', height: 'auto' }}
                priority
              />
            ) : (
              <Image
                src={images[currentIndex].image_url}
                alt={images[currentIndex].caption || ""}
                fill
                className="object-cover"
                priority
              />
            )}
            {images[currentIndex].caption && (
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent pointer-events-none">
                <p className="text-white text-sm font-medium">{images[currentIndex].caption}</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
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

      {/* Indicators */}
      <div
        className={cn(
          "absolute left-1/2 -translate-x-1/2 flex gap-2 z-10",
          showFullImage ? "bottom-3" : "bottom-4"
        )}
      >
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setDirection(index > currentIndex ? 1 : -1)
              setCurrentIndex(index)
            }}
            className={cn(
              "w-2 h-2 rounded-full transition-all shadow-sm",
              index === currentIndex 
                ? "bg-white w-4" 
                : "bg-white/50 hover:bg-white/80"
            )}
          />
        ))}
      </div>
    </div>
  )
}
