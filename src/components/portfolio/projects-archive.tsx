import { getTranslations, setRequestLocale } from 'next-intl/server'
import { ArrowUpRight } from 'lucide-react'
import { Link } from '@/navigation'
import { getCachedProjects } from '@/lib/supabase/cached'
import type { ProjectWithRelations } from '@/lib/types/database'
import { ProjectGrid } from './project-grid'
import styles from '@/components/blog/editorial.module.css'

export interface ProjectsArchiveProps {
  params: Promise<{ locale: string }>
}

interface ProjectTranslation {
  language: string
  title?: string
  subtitle?: string | null
  short_description?: string | null
  full_description?: string | null
  meta_description?: string | null
}

export async function ProjectsArchive({ params }: ProjectsArchiveProps) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('projects')
  const isEnglish = locale === 'en'

  let projectsData: any[] = []

  try {
    const rawProjects = (await getCachedProjects()) as any[]
    projectsData = [...rawProjects].sort((a, b) => {
      const featuredDifference = Number(Boolean(b.is_featured)) - Number(Boolean(a.is_featured))
      return featuredDifference || a.display_order - b.display_order
    })
  } catch (error) {
    console.error('Error fetching projects from cache:', error)
  }

  const projects = projectsData.map((project: any) => {
    const translations = (project.translations || []) as ProjectTranslation[]
    const ptTranslation = translations.find((translation) => translation.language === 'pt-BR')
    const enTranslation = translations.find((translation) => translation.language === 'en')
    const currentTranslation = locale === 'en' ? enTranslation || ptTranslation : ptTranslation

    return {
      ...project,
      technologies:
        (project.technologies as Array<{ technology: unknown }> | null)
          ?.map((relation) => relation?.technology)
          .filter(Boolean) || [],
      tags:
        (project.tags as Array<{ tag: unknown }> | null)
          ?.map((relation) => relation?.tag)
          .filter(Boolean) || [],
      title: currentTranslation?.title || project.title,
      subtitle: currentTranslation?.subtitle || project.subtitle,
      short_description: currentTranslation?.short_description || project.short_description,
      full_description: currentTranslation?.full_description || project.full_description,
      meta_description: currentTranslation?.meta_description || project.meta_description,
    } as ProjectWithRelations
  })

  const activeFilter = isEnglish ? 'Selected work / 2026' : 'Trabalho selecionado / 2026'

  return (
    <main className={styles.blogPage}>
      <div className={styles.shell}>
        <header className={styles.masthead}>
          <div className={styles.kicker}>
            {isEnglish ? 'Independent engineering' : 'Engenharia independente'}
          </div>

          <div className={styles.titleBlock}>
            <h1 className={`${styles.title} ${styles.titleWithGhost}`} aria-label={`${t('title')} — ${isEnglish ? 'Archive' : 'Arquivo'}`}>
              <span>{isEnglish ? 'Projects' : 'Projetos'}</span>
              <span className={styles.titleGhost} aria-hidden="true">
                {isEnglish ? 'Archive' : 'Arquivo'}
              </span>
            </h1>
          </div>

          <div className={styles.mastheadMeta} aria-label={isEnglish ? 'Practice' : 'Prática'}>
            <span className={styles.feedCount}>PRODUCT / AI</span>
            <span className={styles.mastheadMetaLine} aria-hidden="true" />
            <span className={styles.feedCount}>SYSTEMS / AUTOMATION</span>
          </div>

          <p className={styles.mastheadAside}>
            {isEnglish
              ? 'A curated set of products where engineering, business and experience operate as one system.'
              : 'Uma curadoria de produtos em que engenharia, negócio e experiência funcionam como um único sistema.'}
          </p>
        </header>

        <section aria-labelledby="project-index">
          <div className={styles.feedHeader}>
            <h2 className={styles.sectionLabel} id="project-index">
              {isEnglish ? 'Project index' : 'Índice de projetos'}
            </h2>
            <div className={styles.feedTools}>
              <span className={styles.feedCount}>{activeFilter}</span>
                <span className={styles.filterChip}>
                {String(projects.length).padStart(2, '0')} / CASES
              </span>
            </div>
          </div>

          {projects.length > 0 ? (
            <ProjectGrid projects={projects} locale={locale} />
          ) : (
            <div className={styles.articleGrid}>
              <div className={styles.emptyState} role="status">
                <span className={styles.emptyIndex}>00 / EMPTY INDEX</span>
                <div>
                  <h2 className={styles.emptyTitle}>{t('empty')}</h2>
                  <p className={styles.emptyCopy}>
                    {isEnglish
                      ? 'New case studies are being prepared for publication.'
                      : 'Novos estudos de caso estão sendo preparados para publicação.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>

        <Link href="/contact" className={styles.ctaCard}>
          <div>
            <span className={styles.ctaOverline}>{t('cta.button')} / 2026</span>
            <h2 className={styles.ctaTitle}>{t('cta.title')}</h2>
          </div>
          <span className={styles.readArrow} aria-hidden="true">
            <ArrowUpRight size={18} strokeWidth={1.7} />
          </span>
        </Link>
      </div>
    </main>
  )
}
