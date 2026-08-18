import Image from 'next/image'
import { cn } from '@/lib/utils'

type BrandLogoProps = {
  className?: string
  priority?: boolean
}

export function BrandLogo({ className, priority }: BrandLogoProps) {
  return (
    <Image
      src="/logo.png"
      alt="Maia"
      width={558}
      height={202}
      priority={priority}
      className={cn('h-auto w-auto select-none', className)}
    />
  )
}
