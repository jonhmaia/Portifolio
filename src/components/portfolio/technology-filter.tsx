'use client'

import type { CSSProperties } from 'react'
import { useSearchParams } from 'next/navigation'
import { useLocale } from 'next-intl'
import { useRouter } from '@/navigation'
import type { Technology } from '@/lib/types/database'
import { cn } from '@/lib/utils'
import styles from './portfolio.module.css'

interface TechnologyFilterProps {
  technologies: Technology[]
}

export function TechnologyFilter({ technologies }: TechnologyFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const locale = useLocale()
  const currentTechnology = searchParams.get('technology')

  const handleFilter = (technologySlug: string | null) => {
    const params = new URLSearchParams(searchParams)
    if (technologySlug) {
      params.set('technology', technologySlug)
    } else {
      params.delete('technology')
    }

    const query = params.toString()
    router.push(`${'/projetos'}${query ? `?${query}` : ''}` as never)
  }

  return (
    <div className={styles.filterShell}>
      <div className={styles.filterList}>
        <button
          type="button"
          onClick={() => handleFilter(null)}
          aria-pressed={!currentTechnology}
          className={cn(styles.filterButton, !currentTechnology && styles.filterButtonActive)}
        >
          {locale === 'en' ? 'All' : 'Todos'}
        </button>

        {technologies.map((technology) => {
          const active = currentTechnology === technology.slug
          return (
            <button
              key={technology.id}
              type="button"
              onClick={() => handleFilter(technology.slug)}
              aria-pressed={active}
              className={cn(styles.filterButton, active && styles.filterButtonActive)}
            >
              <span
                className={styles.filterDot}
                style={{ '--filter-color': technology.color_hex } as CSSProperties}
                aria-hidden="true"
              />
              {technology.name}
            </button>
          )
        })}
      </div>
    </div>
  )
}
