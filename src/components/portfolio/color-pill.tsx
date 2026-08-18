import type { CSSProperties } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import styles from './portfolio.module.css'

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

export function ColorPill({ label, color = '#4da3ff', icon: Icon, className }: ColorPillProps) {
  return (
    <span
      className={cn(styles.colorPill, className)}
      style={{
        '--pill-color': color,
        '--pill-background': hexWithAlpha(color, 0.1),
        '--pill-icon-background': hexWithAlpha(color, 0.2),
      } as CSSProperties}
    >
      <span className={styles.colorPillIcon}>
        <Icon size={12} strokeWidth={2.2} />
      </span>
      {label}
    </span>
  )
}
