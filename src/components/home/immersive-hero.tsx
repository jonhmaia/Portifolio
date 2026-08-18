'use client'

import { useRef } from 'react'
import { HeroTypewriter } from '@/components/home/hero-typewriter'
import { gsap, useGSAP } from '@/lib/gsap/register'
import { setupHeroScroll } from './home-scroll'
import styles from '@/components/blog/editorial.module.css'

const brandLetters = ['M', 'a', 'i', 'a'] as const

interface ImmersiveHeroProps {
  locale: string
  name: string
  role: string
  location: string
}

export function ImmersiveHero({ locale, name, role, location }: ImmersiveHeroProps) {
  const rootRef = useRef<HTMLElement>(null)
  const isEnglish = locale === 'en'
  const firstName = name.split(' ')[0] || name

  useGSAP(() => {
    const root = rootRef.current
    if (!root) return

    const mm = gsap.matchMedia()
    mm.add(
      {
        reduceMotion: '(prefers-reduced-motion: reduce)',
        allowMotion: '(prefers-reduced-motion: no-preference)',
      },
      (context) => {
        setupHeroScroll(root, {
          reduceMotion: Boolean(context.conditions?.reduceMotion),
        })
      },
      root,
    )

    return () => mm.revert()
  }, { scope: rootRef, dependencies: [locale] })

  return (
    <header ref={rootRef} className={`${styles.masthead} ${styles.mastheadHome}`} data-scroll="hero">
      <div className={styles.heroRole} data-scroll="hero-role">{role}</div>

      <div className={styles.titleBlock} data-scroll="hero-title">
        <h1
          className={`${styles.title} ${styles.titleInline}`}
          id="hero-title"
          aria-label={`${firstName} Maia`}
        >
          <span className={styles.titleName}>{firstName}</span>
          <span className={styles.titleBrand} aria-hidden="true">
            {brandLetters.map((letter, index) => (
              <span className={styles.titleBrandLetter} key={`${letter}-${index}`}>
                {letter}
              </span>
            ))}
          </span>
        </h1>
      </div>

      <div className={styles.mastheadCluster} data-scroll="hero-cluster">
        <HeroTypewriter locale={locale} />
      </div>

      <div className={styles.mastheadMeta} data-scroll="hero-meta" aria-label={isEnglish ? 'Location' : 'Local'}>
        <span className={styles.feedCount}>{location}</span>
      </div>
    </header>
  )
}
