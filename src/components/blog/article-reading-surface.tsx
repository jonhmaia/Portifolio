'use client'

import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import { Minus, Moon, Plus, Sun } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import styles from './editorial.module.css'

const STORAGE_KEY = 'maia-article-reading'
const FONT_SCALES = [1, 1.125, 1.25, 1.375, 1.5] as const

type ReadingTheme = 'light' | 'dark'

type StoredPrefs = {
  theme: ReadingTheme
  scaleIndex: number
}

interface ArticleReadingSurfaceProps {
  children: ReactNode
}

function readStoredPrefs(): StoredPrefs {
  if (typeof window === 'undefined') {
    return { theme: 'light', scaleIndex: 0 }
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return { theme: 'light', scaleIndex: 0 }

    const parsed = JSON.parse(raw) as Partial<StoredPrefs>
    const scaleIndex =
      typeof parsed.scaleIndex === 'number' &&
      parsed.scaleIndex >= 0 &&
      parsed.scaleIndex < FONT_SCALES.length
        ? parsed.scaleIndex
        : 0

    return {
      theme: parsed.theme === 'dark' ? 'dark' : 'light',
      scaleIndex,
    }
  } catch {
    return { theme: 'light', scaleIndex: 0 }
  }
}

export function ArticleReadingSurface({ children }: ArticleReadingSurfaceProps) {
  const t = useTranslations('blogArticle.readingPrefs')
  const [theme, setTheme] = useState<ReadingTheme>('light')
  const [scaleIndex, setScaleIndex] = useState(0)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const stored = readStoredPrefs()
    setTheme(stored.theme)
    setScaleIndex(stored.scaleIndex)
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return

    const payload: StoredPrefs = { theme, scaleIndex }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  }, [ready, theme, scaleIndex])

  const canDecrease = scaleIndex > 0
  const canIncrease = scaleIndex < FONT_SCALES.length - 1

  return (
    <div
      className={cn(styles.articlePaper, theme === 'dark' && styles.articlePaperDark)}
      style={
        {
          '--reading-font-scale': FONT_SCALES[scaleIndex],
        } as CSSProperties
      }
    >
      <div className={styles.readingToolbarRow}>
        <div className={styles.shell}>
          <div className={styles.readingToolbar} role="toolbar" aria-label={t('toolbar')}>
            <div className={styles.readingToolbarGroup}>
              <span className={styles.readingToolbarLabel}>{t('background')}</span>
              <div className={styles.readingThemeSwitch} role="group" aria-label={t('background')}>
                <button
                  type="button"
                  className={cn(styles.readingThemeButton, theme === 'light' && styles.readingThemeButtonActive)}
                  aria-pressed={theme === 'light'}
                  onClick={() => setTheme('light')}
                >
                  <Sun aria-hidden="true" size={14} />
                  {t('light')}
                </button>
                <button
                  type="button"
                  className={cn(styles.readingThemeButton, theme === 'dark' && styles.readingThemeButtonActive)}
                  aria-pressed={theme === 'dark'}
                  onClick={() => setTheme('dark')}
                >
                  <Moon aria-hidden="true" size={14} />
                  {t('dark')}
                </button>
              </div>
            </div>

            <div className={styles.readingToolbarGroup}>
              <span className={styles.readingToolbarLabel}>{t('fontSize')}</span>
              <div className={styles.readingFontControls}>
                <button
                  type="button"
                  className={styles.readingFontButton}
                  aria-label={t('decrease')}
                  disabled={!canDecrease}
                  onClick={() => setScaleIndex((current) => Math.max(0, current - 1))}
                >
                  <Minus aria-hidden="true" size={14} />
                </button>
                <span className={styles.readingFontValue} aria-live="polite">
                  {Math.round(FONT_SCALES[scaleIndex] * 100)}%
                </span>
                <button
                  type="button"
                  className={styles.readingFontButton}
                  aria-label={t('increase')}
                  disabled={!canIncrease}
                  onClick={() =>
                    setScaleIndex((current) => Math.min(FONT_SCALES.length - 1, current + 1))
                  }
                >
                  <Plus aria-hidden="true" size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {children}
    </div>
  )
}
