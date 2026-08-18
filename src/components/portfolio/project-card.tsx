import type { CSSProperties } from 'react'
import Image from 'next/image'
import { ArrowUpRight, Eye, ExternalLink, Github } from 'lucide-react'
import { Link } from '@/navigation'
import type { ProjectStatus } from '@/lib/types/database'
import styles from './gallery.module.css'

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
  status?: ProjectStatus
  created_at?: string
  isFallback?: boolean
  technologies?: Array<{ id?: number | string; name: string; color_hex?: string | null }>
  tags?: Array<{ id?: number | string; name: string }>
}

interface ProjectCardProps {
  project: EditorialProject
  index?: number
  count?: number
  locale?: string
}

const STATUS_COPY: Record<ProjectStatus, { en: string; pt: string }> = {
  dev: { en: 'In development', pt: 'Em desenvolvimento' },
  concluido: { en: 'Shipped', pt: 'Concluído' },
  pausado: { en: 'Paused', pt: 'Pausado' },
  arquivado: { en: 'Archived', pt: 'Arquivado' },
}

export function ProjectCard({ project, index = 0, count, locale = 'pt-BR' }: ProjectCardProps) {
  const isEnglish = locale === 'en'
  const href = project.isFallback
    ? '/projetos'
    : {
        pathname: '/projetos/[slug]' as const,
        params: { slug: project.slug },
      }
  const technologies = project.technologies || []
  const primaryTech = technologies[0]
  const year = project.created_at ? new Date(project.created_at).getFullYear() : null
  const statusLabel = project.status
    ? STATUS_COPY[project.status]?.[isEnglish ? 'en' : 'pt']
    : null
  const accent = primaryTech?.color_hex || '#4da3ff'
  const visibleTech = technologies.slice(0, 4)

  return (
    <article
      className={styles.card}
      style={{ '--card-accent': accent } as CSSProperties}
      data-gallery-card=""
      aria-roledescription="slide"
      aria-label={
        count
          ? `${project.title}, ${index + 1} / ${count}`
          : project.title
      }
    >
      <Link
        href={href}
        className={styles.cardLink}
        aria-label={`${isEnglish ? 'Open case' : 'Abrir case'}: ${project.title}`}
      >
        <div className={styles.media}>
          {project.cover_image_url ? (
            <Image
              src={project.cover_image_url}
              alt=""
              fill
              draggable={false}
              priority={index < 2}
              sizes="(max-width: 860px) 82vw, 36.5rem"
              className={styles.coverImage}
            />
          ) : (
            <div className={styles.coverFallback} aria-hidden="true">
              {project.title.charAt(0)}
            </div>
          )}

          <span className={styles.frame} aria-hidden="true" />

          <div className={styles.mediaChrome}>
            <span className={styles.index}>{String(index + 1).padStart(2, '0')}</span>
            <span className={styles.mediaArrow} aria-hidden="true">
              <ArrowUpRight size={16} strokeWidth={1.8} />
            </span>
          </div>
        </div>

        <div className={styles.body}>
          <div className={styles.meta}>
            {primaryTech && (
              <span className={styles.metaLead}>
                <span className={styles.metaDot} aria-hidden="true" />
                {primaryTech.name}
              </span>
            )}
            {year && <span>{year}</span>}
            {statusLabel && <span>{statusLabel}</span>}
            {project.is_featured && (
              <span className={styles.featuredBadge}>{isEnglish ? 'Featured' : 'Destaque'}</span>
            )}
          </div>

          <h2 className={styles.title}>{project.title}</h2>

          {(project.short_description || project.subtitle) && (
            <p className={styles.summary}>{project.short_description || project.subtitle}</p>
          )}

          {visibleTech.length > 0 && (
            <ul className={styles.techList} aria-label={isEnglish ? 'Technologies' : 'Tecnologias'}>
              {visibleTech.map((technology) => (
                <li
                  className={styles.tech}
                  key={technology.id || technology.name}
                  style={{ '--tech-color': technology.color_hex || accent } as CSSProperties}
                >
                  <span className={styles.techDot} aria-hidden="true" />
                  {technology.name}
                </li>
              ))}
              {technologies.length > visibleTech.length && (
                <li className={styles.tech}>+{technologies.length - visibleTech.length}</li>
              )}
            </ul>
          )}

          <div className={styles.footer}>
            <span className={styles.cta}>
              <span>{isEnglish ? 'View case' : 'Ver case'}</span>
              <span className={styles.ctaIcon} aria-hidden="true">
                <ArrowUpRight size={16} strokeWidth={1.8} />
              </span>
            </span>
            <span className={styles.views}>
              <Eye aria-hidden="true" size={13} />
              {project.views_count ?? 0}
            </span>
          </div>
        </div>
      </Link>

      {(project.repo_url || project.deploy_url) && (
        <div className={styles.quickLinks}>
          {project.repo_url && (
            <a
              className={styles.quickLink}
              href={project.repo_url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={isEnglish ? `${project.title} repository` : `Repositório de ${project.title}`}
            >
              <Github size={15} strokeWidth={1.8} />
            </a>
          )}
          {project.deploy_url && (
            <a
              className={styles.quickLink}
              href={project.deploy_url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={isEnglish ? `${project.title} live site` : `Site de ${project.title}`}
            >
              <ExternalLink size={15} strokeWidth={1.8} />
            </a>
          )}
        </div>
      )}
    </article>
  )
}
