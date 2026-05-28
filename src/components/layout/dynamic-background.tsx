'use client'

import { usePathname } from 'next/navigation'
import { FlowingLights } from '@/components/ui/flowing-lights'

export function DynamicBackground() {
  const pathname = usePathname()

  // Exclude curriculum/resume pages from having this background
  const isExcluded = pathname ? /\/(curriculo|resume)(\/|$)/.test(pathname) : false

  if (isExcluded) return null

  return (
    <>
      {/* Background Animation & Gradient */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-primary/5 dark:bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-500/5 dark:bg-blue-500/10 blur-[100px]" />
      </div>
      <div className="opacity-60 fixed inset-0 pointer-events-none z-0">
        <FlowingLights />
      </div>
    </>
  )
}
