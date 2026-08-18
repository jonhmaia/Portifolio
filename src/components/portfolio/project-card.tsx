import type { CSSProperties } from 'react'
import Image from 'next/image'
import { ArrowUpRight, Eye } from 'lucide-react'
import { Link } from '@/navigation'
import styles from '@/components/blog/editorial.module.css'

export interface EditorialProject {
  id: number | string
  slug: string
  title: string
  subtitle?: string | null
  short_description?: string | null
  cover_image_url?: string | null
  repo_url?: string | null
  deploy_url?: string | null
  views_count?: number | null
  is_featured?: boolean
  created_at?: string
  isFallback?: boolean
  technologies?: Array<{ id?: number | string; name: string; color_hex?: string | null }>
  tags?: Array<{ id?: number | string; name: string }>
}

interface ProjectCardProps {
  project: EditorialProject
  index?: number
  locale?: string
}

export function ProjectCard({ project, index = 0, locale = 'pt-BR' }: ProjectCardProps) {
  const isEnglish = locale === 'en'
  const isFeatured = index === 0
  const href = project.isFallback ? '/projetos' : `/projetos/${project.slug}`
  const technologies = project.technologies || []
  const primaryTech = technologies[0]
  const year = project.created_at ? new Date(project.created_at).getFullYear() : null
  const categoryStyle = primaryTech?.color_hex
    ? ({ '--category-color': primaryTech.color_hex } as CSSProperties)
    : undefined

  return (
    <article className={`${styles.card} ${isFeatured ? styles.featuredCard : ''}`}>
      <Link
        href={href as never}
        className={styles.mediaLink}
        aria-label={`${isEnglish ? 'Open case' : 'Abrir case'}: ${project.title}`}
      >
        <div className={styles.media}>
          {project.cover_image_url ? (
            <Image
              src={project.cover_image_url}
              alt={project.title}
              fill
              priority={isFeatured}
              sizes={isFeatured ? '(max-width: 780px) 100vw, 58vw' : '(max-width: 780px) 100vw, 46vw'}
              className={styles.coverImage}
            />
          ) : (
            <div className={styles.coverFallback} aria-hidden="true">
              {project.title.charAt(0)}
            </div>
          )}
        </div>

        <span className={styles.cardIndex}>{String(index + 1).padStart(2, '0')}</span>

        {(primaryTech || project.is_featured) && (
          <span className={styles.categoryBadge} style={categoryStyle}>
            <span className={styles.categoryDot} aria-hidden="true" />
            {primaryTech?.name || (isEnglish ? 'Selected' : 'Destaque')}
          </span>
        )}
      </Link>

      <div className={styles.cardContent}>
        <header className={styles.cardHeader}>
          <Link href={href as never} className={styles.cardTitleLink}>
            <h2 className={styles.cardTitle}>{project.title}</h2>
          </Link>

          {(project.short_description || project.subtitle) && (
            <p className={styles.summary}>{project.short_description || project.subtitle}</p>
          )}

          {technologies.length > 0 && (
            <div className={styles.tagList} aria-label={isEnglish ? 'Technologies' : 'Tecnologias'}>
              {technologies.slice(0, 4).map((technology) => (
                <span className={styles.tag} key={technology.id || technology.name}>
                  {technology.name}
                </span>
              ))}
              {technologies.length > 4 && (
                <span className={styles.tag}>+{technologies.length - 4}</span>
              )}
            </div>
          )}
        </header>

        <div className={styles.cardFooter}>
          <div className={styles.author}>
            <span className={styles.avatarFallback} aria-hidden="true">JM</span>
            <span className={styles.authorName}>João Marcos</span>
          </div>

          <div className={styles.cardMeta}>
            {year && <span className={styles.metaItem}>{year}</span>}
            <span className={styles.metaItem}>
              <Eye aria-hidden="true" size={13} />
              {project.views_count ?? 0}
            </span>
          </div>
        </div>

        <Link href={href as never} className={styles.readLink}>
          <span>{isEnglish ? 'View case' : 'Ver case'}</span>
          <span className={styles.readArrow} aria-hidden="true">
            <ArrowUpRight size={18} strokeWidth={1.7} />
          </span>
        </Link>
      </div>
    </article>
  )
}
