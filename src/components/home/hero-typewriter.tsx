'use client'

import { useEffect, useState } from 'react'
import styles from '@/components/blog/editorial.module.css'

type PhrasePart = {
  text: string
  accent?: boolean
}

type Phrase = PhrasePart[][]

const PHRASES = {
  en: [
    [
      [{ text: 'Creativity', accent: true }],
      [{ text: 'Beyond' }, { text: 'code', accent: true }],
    ],
    [
      [{ text: 'Innovation', accent: true }],
      [{ text: 'Beyond the' }, { text: 'Algorithm', accent: true }],
    ],
    [
      [{ text: 'Solution', accent: true }],
      [{ text: 'beyond the' }, { text: 'problem', accent: true }],
    ],
  ],
  pt: [
    [
      [{ text: 'Criatividade', accent: true }],
      [{ text: 'Além do' }, { text: 'código', accent: true }],
    ],
    [
      [{ text: 'Inovação', accent: true }],
      [{ text: 'Além do' }, { text: 'Algoritmo', accent: true }],
    ],
    [
      [{ text: 'Solução', accent: true }],
      [{ text: 'além do' }, { text: 'problema', accent: true }],
    ],
  ],
} as const satisfies Record<string, Phrase[]>

type TypewriterPhase = 'typing' | 'holding' | 'deleting'

function getLineText(parts: readonly PhrasePart[]) {
  return parts.map((part) => part.text).join('')
}

function getPhraseText(lines: readonly PhrasePart[][]) {
  return lines.map((line) => getLineText(line)).join('')
}

function getPhraseLabel(lines: readonly PhrasePart[][]) {
  return lines.map((line) => line.map((part) => part.text).join(' ')).join(' ')
}

function sliceParts(parts: readonly PhrasePart[], count: number) {
  let remaining = count
  return parts.map((part) => {
    const text = remaining > 0 ? part.text.slice(0, remaining) : ''
    remaining = Math.max(0, remaining - part.text.length)
    return { ...part, text }
  })
}

export function HeroTypewriter({ locale }: { locale: string }) {
  const isEnglish = locale === 'en'
  const phrases = isEnglish ? PHRASES.en : PHRASES.pt
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [count, setCount] = useState(() => getPhraseText(phrases[0]).length)
  const [phase, setPhase] = useState<TypewriterPhase>('holding')
  const [reduceMotion, setReduceMotion] = useState(false)
  const lines = phrases[phraseIndex]
  const fullText = getPhraseText(lines)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const syncPreference = () => setReduceMotion(media.matches)

    syncPreference()
    media.addEventListener('change', syncPreference)
    return () => media.removeEventListener('change', syncPreference)
  }, [])

  useEffect(() => {
    setPhraseIndex(0)
    setCount(getPhraseText(phrases[0]).length)
    setPhase('holding')
  }, [isEnglish, phrases])

  useEffect(() => {
    if (!reduceMotion) return

    const interval = window.setInterval(() => {
      setPhraseIndex((current) => (current + 1) % phrases.length)
    }, 2400)
    return () => window.clearInterval(interval)
  }, [phrases.length, reduceMotion])

  useEffect(() => {
    if (reduceMotion) return

    let timeout = 0

    if (phase === 'typing') {
      timeout = window.setTimeout(() => {
        if (count < fullText.length) {
          setCount((current) => current + 1)
          return
        }
        setPhase('holding')
      }, 118)
    } else if (phase === 'holding') {
      timeout = window.setTimeout(() => setPhase('deleting'), 2200)
    } else if (count > 0) {
      timeout = window.setTimeout(() => setCount((current) => current - 1), 28)
    } else {
      timeout = window.setTimeout(() => {
        setPhraseIndex((current) => (current + 1) % phrases.length)
        setPhase('typing')
      }, 420)
    }

    return () => window.clearTimeout(timeout)
  }, [count, fullText.length, phase, phrases.length, reduceMotion])

  const visibleCount = reduceMotion ? fullText.length : count
  const firstLineLength = getLineText(lines[0]).length
  const ariaLabel = phrases.map((phrase) => getPhraseLabel(phrase)).join('. ')
  let remaining = visibleCount

  return (
    <p className={`${styles.mastheadAside} ${styles.heroStatement}`} aria-label={ariaLabel}>
      {lines.map((parts, lineIndex) => {
        const lineLength = getLineText(parts).length
        const visibleParts = sliceParts(parts, remaining)
        const showCaret = !reduceMotion && (
          lineIndex === 0
            ? visibleCount <= firstLineLength
            : visibleCount > firstLineLength
        )
        remaining = Math.max(0, remaining - lineLength)

        return (
          <span className={styles.heroStatementLine} key={`${phraseIndex}-${lineIndex}`}>
            {visibleParts.map((part, partIndex) => (
              part.text ? (
                <span
                  className={part.accent ? styles.heroStatementAccent : undefined}
                  key={`${lineIndex}-${partIndex}`}
                >
                  {part.text}
                </span>
              ) : null
            ))}
            {showCaret ? <span className={styles.heroStatementCaret} /> : null}
          </span>
        )
      })}
    </p>
  )
}
