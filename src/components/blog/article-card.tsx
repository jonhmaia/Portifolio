import type { CSSProperties } from 'react'
import Image from 'next/image'
import { ArrowUpRight, Calendar, Clock, Eye } from 'lucide-react'
import { Link } from '@/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { ArticleWithRelations } from '@/lib/types/database'
import styles from './editorial.module.css'

interface ArticleCardProps {
  article: ArticleWithRelations
  index?: number
  locale?: string
}

export function ArticleCard({ article, index = 0, locale = 'pt-BR' }: ArticleCardProps) {
  const isEnglish = locale === 'en'
  const isFeatured = index === 0
  const articleHref = `/blog/${article.slug}` as const
  const authorInitials = article.author?.full_name
    ?.split(' ')
    .map((name) => name[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'AU'
  const publishedDate = article.published_at
    ? new Intl.DateTimeFormat(isEnglish ? 'en-US' : 'pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).format(new Date(article.published_at))
    : null
  const categoryStyle = article.category
    ? ({ '--category-color': article.category.color_hex } as CSSProperties)
    : undefined

  return (
    <article className={`${styles.card} ${isFeatured ? styles.featuredCard : ''}`}>
      <Link
        href={articleHref as any}
        className={styles.mediaLink}
        aria-label={`${isEnglish ? 'Read' : 'Ler'}: ${article.title}`}
      >
        <div className={styles.media}>
          {article.cover_image_url ? (
            <Image
              src={article.cover_image_url}
              alt={article.title}
              fill
              priority={isFeatured}
              sizes={isFeatured ? '(max-width: 780px) 100vw, 58vw' : '(max-width: 780px) 100vw, 46vw'}
              className={styles.coverImage}
            />
          ) : (
            <div className={styles.coverFallback} aria-hidden="true">
              {article.title.charAt(0)}
            </div>
          )}
        </div>

        <span className={styles.cardIndex}>{String(index + 1).padStart(2, '0')}</span>

        {article.category && (
          <span className={styles.categoryBadge} style={categoryStyle}>
            <span className={styles.categoryDot} aria-hidden="true" />
            {article.category.name}
          </span>
        )}
      </Link>

      <div className={styles.cardContent}>
        <header className={styles.cardHeader}>
          <Link href={articleHref as any} className={styles.cardTitleLink}>
            <h2 className={styles.cardTitle}>{article.title}</h2>
          </Link>

          {article.summary && <p className={styles.summary}>{article.summary}</p>}

          {article.tags && article.tags.length > 0 && (
            <div className={styles.tagList} aria-label={isEnglish ? 'Article tags' : 'Tags do artigo'}>
              {article.tags.slice(0, 4).map((tag) => (
                <span className={styles.tag} key={tag.id}>
                  #{tag.name}
                </span>
              ))}
              {article.tags.length > 4 && (
                <span className={styles.tag}>+{article.tags.length - 4}</span>
              )}
            </div>
          )}
        </header>

        <div className={styles.cardFooter}>
          <div className={styles.author}>
            <Avatar className={styles.avatar}>
              <AvatarImage src={article.author?.avatar_url || undefined} />
              <AvatarFallback className={styles.avatarFallback}>{authorInitials}</AvatarFallback>
            </Avatar>
            <span className={styles.authorName}>{article.author?.full_name || (isEnglish ? 'Author' : 'Autor')}</span>
          </div>

          <div className={styles.cardMeta}>
            {publishedDate && (
              <span className={styles.metaItem}>
                <Calendar aria-hidden="true" size={13} />
                {publishedDate}
              </span>
            )}
            {article.reading_time_minutes && (
              <span className={styles.metaItem}>
                <Clock aria-hidden="true" size={13} />
                {article.reading_time_minutes} min
              </span>
            )}
            <span className={styles.metaItem}>
              <Eye aria-hidden="true" size={13} />
              {article.views_count ?? 0}
            </span>
          </div>
        </div>

        <Link href={articleHref as any} className={styles.readLink}>
          <span>{isEnglish ? 'Read article' : 'Ler artigo'}</span>
          <span className={styles.readArrow} aria-hidden="true">
            <ArrowUpRight size={18} strokeWidth={1.7} />
          </span>
        </Link>
      </div>
    </article>
  )
}
