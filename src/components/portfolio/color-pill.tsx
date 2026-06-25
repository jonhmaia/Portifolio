import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

function hexWithAlpha(hex: string, alpha: number) {
  const normalized = hex.replace('#', '')
  if (normalized.length !== 6) return hex
  const a = Math.round(Math.min(1, Math.max(0, alpha)) * 255)
    .toString(16)
    .padStart(2, '0')
  return `#${normalized}${a}`
}

interface ColorPillProps {
  label: string
  color?: string
  icon: LucideIcon
  className?: string
}

export function ColorPill({ label, color = '#38BDF8', icon: Icon, className }: ColorPillProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full border-2 px-2.5 py-1 text-[11px] font-bold leading-none',
        className
      )}
      style={{
        borderColor: color,
        color,
        backgroundColor: hexWithAlpha(color, 0.1),
      }}
    >
      <span
        className="flex size-5 shrink-0 items-center justify-center rounded-md"
        style={{ backgroundColor: hexWithAlpha(color, 0.2) }}
      >
        <Icon className="size-3" strokeWidth={2.5} />
      </span>
      {label}
    </span>
  )
}
