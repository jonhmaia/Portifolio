'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

export function HeroWrapper({ children, className }: { children: ReactNode, className?: string }) {
  return (
    <section className={cn("relative flex-1 flex flex-col justify-center items-center py-20 md:py-32 overflow-hidden", className)}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="container px-4 md:px-6 relative z-10"
      >
        {children}
      </motion.div>
    </section>
  )
}

export function HeroContent({ children }: { children: ReactNode }) {
  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.2
          }
        }
      }}
      className="flex flex-col items-center text-center max-w-5xl mx-auto space-y-8"
    >
      {children}
    </motion.div>
  )
}

export function AnimatedElement({ children, className, delay = 0 }: { children: ReactNode, className?: string, delay?: number }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function BioWrapper({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8 }}
      className="mt-16 md:mt-20 max-w-5xl mx-auto py-8 md:py-12 relative overflow-hidden text-left group transition-colors duration-500"
    >
      {children}
    </motion.div>
  )
}

interface FloatingIllustrationProps {
  src: string
  alt: string
}

export function FloatingIllustration({ src, alt }: FloatingIllustrationProps) {
  return (
    <motion.div
      animate={{
        y: [0, -12, 0],
      }}
      transition={{
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className="relative w-72 h-72 sm:w-96 sm:h-96 md:w-[420px] md:h-[420px] max-w-full"
    >
      <Image
        src={src}
        alt={alt}
        fill
        priority
        className="object-contain drop-shadow-[0_15px_30px_rgba(0,255,204,0.15)] dark:drop-shadow-[0_15px_30px_rgba(0,255,204,0.25)]"
      />
    </motion.div>
  )
}
