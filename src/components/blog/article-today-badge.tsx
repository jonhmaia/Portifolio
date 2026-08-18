'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import styles from './editorial.module.css'

interface ArticleTodayBadgeProps {
  locale?: string
  className?: string
}

function resolveIntlLocale(locale?: string) {
  if (locale === 'en') return 'en-US'
  if (locale === 'pt-BR' || locale === 'pt') return 'pt-BR'
  return locale || 'pt-BR'
}

export function ArticleTodayBadge({ locale, className }: ArticleTodayBadgeProps) {
  const isEnglish = locale === 'en'

  const formattedDate = useMemo(
    () =>
      new Intl.DateTimeFormat(resolveIntlLocale(locale), {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(new Date()),
    [locale],
  )

  return (
    <span
      className={cn(styles.richTodayBadge, className)}
      role="status"
      aria-label={
        isEnglish
          ? `Today: ${formattedDate}`
          : `Hoje: ${formattedDate}`
      }
    >
      <span className={styles.richTodayBadgeDot} aria-hidden="true" />
      <span className={styles.richTodayBadgeLabel}>
        {isEnglish ? 'Today' : 'Hoje'}
      </span>
      <span className={styles.richTodayBadgeSep} aria-hidden="true">
        /
      </span>
      <time className={styles.richTodayBadgeDate} dateTime={new Date().toISOString().slice(0, 10)}>
        {formattedDate}
      </time>
    </span>
  )
}
