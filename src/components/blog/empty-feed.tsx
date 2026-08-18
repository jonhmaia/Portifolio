import { ArrowUpRight } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/navigation'
import styles from './editorial.module.css'

type EmptyFeedProps = {
  filter?: string
}

export async function EmptyFeed({ filter }: EmptyFeedProps) {
  const t = await getTranslations('blog')
  const isFiltered = Boolean(filter)
  const topics = t.raw('topics.items') as string[]

  return (
    <div className={styles.emptyState} role="status">
      <span className={styles.emptyGlyph} aria-hidden="true">
        00
      </span>

      <div className={styles.emptyBody}>
        <span className={styles.emptyIndex}>
          {isFiltered ? t('empty.indexFiltered') : t('empty.index')}
        </span>

        <h2 className={styles.emptyTitle}>
          {isFiltered ? t('empty.titleFiltered') : t('empty.title')}
        </h2>

        <p className={styles.emptyCopy}>
          {filter ? t('empty.filtered', { filter }) : t('empty.default')}
        </p>

        {!isFiltered && (
          <ul className={styles.emptyTopics} aria-label={t('empty.upcoming')}>
            {topics.map((topic) => (
              <li className={styles.emptyTopic} key={topic}>
                {topic}
              </li>
            ))}
          </ul>
        )}

        <div className={styles.emptyActions}>
          {isFiltered ? (
            <Link href="/blog" className={styles.actionPrimary}>
              {t('empty.clear')}
              <ArrowUpRight aria-hidden="true" size={14} strokeWidth={1.8} />
            </Link>
          ) : (
            <Link href="/projetos" className={styles.actionPrimary}>
              {t('empty.projects')}
              <ArrowUpRight aria-hidden="true" size={14} strokeWidth={1.8} />
            </Link>
          )}
          <Link href={isFiltered ? '/projetos' : '/contact'} className={styles.actionGhost}>
            {isFiltered ? t('empty.projects') : t('empty.contact')}
            <ArrowUpRight aria-hidden="true" size={14} strokeWidth={1.8} />
          </Link>
        </div>
      </div>
    </div>
  )
}
