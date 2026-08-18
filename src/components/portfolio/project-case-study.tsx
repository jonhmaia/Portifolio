import type { CSSProperties } from 'react'
import { cache } from 'react'
import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import {
  ArrowLeft,
  ArrowUpRight,
  Calendar,
  Code2,
  Download,
  ExternalLink,
  Eye,
  FileText,
  Github,
  Image as ImageIcon,
  Layers3,
} from 'lucide-react'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Link } from '@/navigation'
import { MarkdownRenderer } from '@/components/blog/markdown-renderer'
import { ViewCounter } from '@/components/blog/view-counter'
import { Carousel } from '@/components/ui/simple-carousel'
import { MermaidRenderer } from '@/components/ui/mermaid-renderer'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getCachedProjectBySlug, getCachedSitemapProjects } from '@/lib/supabase/cached'
import { routing } from '@/i18n/routing'
import styles from './portfolio.module.css'

export interface ProjectPageProps {
  params: Promise<{ slug: string; locale: string }>
}

interface ProjectTranslation {
  language: string
  title?: string
  subtitle?: string | null
  short_description?: string | null
  full_description?: string | null
  meta_description?: string | null
  diagrams?: Array<{ title?: string; code?: string }> | null
  downloads?: Array<{ label?: string; description?: string; file_url: string }> | null
}

const getProject = cache(async (slug: string) => {
  try {
    return await getCachedProjectBySlug(slug)
  } catch (error) {
    console.error('Error loading project by slug:', error)
    return null
  }
})

export async function generateProjectStaticParams() {
  try {
    const projects = (await getCachedSitemapProjects()) as Array<{ slug: string }>
    return routing.locales.flatMap((locale) =>
      projects.map((project) => ({ locale, slug: project.slug }))
    )
  } catch (error) {
    console.error('Error generating static params for projects:', error)
    return []
  }
}

export async function generateProjectMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug, locale } = await params
  const project = await getProject(slug)

  if (!project) {
    return { title: locale === 'en' ? 'Project not found' : 'Projeto não encontrado' }
  }

  const projectData = project as any
  const translations = (projectData.translations || []) as ProjectTranslation[]
  const ptTranslation = translations.find((translation) => translation.language === 'pt-BR')
  const enTranslation = translations.find((translation) => translation.language === 'en')
  const currentTranslation = locale === 'en' ? enTranslation || ptTranslation : ptTranslation
  const title = currentTranslation?.title || projectData.title
  const description =
    currentTranslation?.meta_description ||
    currentTranslation?.short_description ||
    projectData.meta_description ||
    projectData.short_description ||
    ''

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: projectData.cover_image_url ? [projectData.cover_image_url] : [],
    },
  }
}

function formatIndex(value: unknown) {
  const numericValue = Number(value)
  return String(Number.isFinite(numericValue) ? Math.max(1, numericValue + 1) : 1).padStart(2, '0')
}

function getFileExtension(url: string) {
  const cleanUrl = url.split('?')[0].split('#')[0]
  return cleanUrl.split('.').pop()?.toUpperCase() || 'FILE'
}

export async function ProjectCaseStudy({ params }: ProjectPageProps) {
  const { slug, locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('projectDetail')
  const projectData = await getProject(slug)

  if (!projectData) {
    notFound()
  }

  const typedProjectData = projectData as any
  const translations = (typedProjectData.translations || []) as ProjectTranslation[]
  const ptTranslation = translations.find((translation) => translation.language === 'pt-BR')
  const enTranslation = translations.find((translation) => translation.language === 'en')
  const currentTranslation = locale === 'en' ? enTranslation || ptTranslation : ptTranslation

  const project = {
    ...typedProjectData,
    title: currentTranslation?.title || typedProjectData.title,
    subtitle: currentTranslation?.subtitle || typedProjectData.subtitle,
    short_description: currentTranslation?.short_description || typedProjectData.short_description,
    full_description: currentTranslation?.full_description || typedProjectData.full_description,
    meta_description: currentTranslation?.meta_description || typedProjectData.meta_description,
    diagrams: currentTranslation?.diagrams || [],
    downloads: currentTranslation?.downloads || [],
    technologies:
      (typedProjectData.technologies as Array<{ technology: any }> | null)
        ?.map((relation) => relation?.technology)
        .filter(Boolean) || [],
    tags:
      (typedProjectData.tags as Array<{ tag: any }> | null)
        ?.map((relation) => relation?.tag)
        .filter(Boolean) || [],
    images: typedProjectData.images || [],
  }

  const statusLabels: Record<string, string> = {
    dev: t('status.dev'),
    concluido: t('status.completed'),
    pausado: t('status.paused'),
    arquivado: t('status.archived'),
  }

  const hasDiagrams = Array.isArray(project.diagrams) && project.diagrams.length > 0
  const hasDownloads = Array.isArray(project.downloads) && project.downloads.length > 0
  const hasGallery = Array.isArray(project.images) && project.images.length > 0
  const activeTabsCount = 1 + Number(hasDiagrams) + Number(hasDownloads) + Number(hasGallery)
  const projectIndex = formatIndex(project.display_order)
  const date = new Date(project.created_at)
  const formattedDate = date.toLocaleDateString(locale === 'en' ? 'en-US' : 'pt-BR', {
    month: 'short',
    year: 'numeric',
  })
  const labels = locale === 'en'
    ? {
        caseStudy: 'Case study',
        overview: 'Project overview',
        dossier: 'Project dossier',
        narrative: 'Challenge, decisions and result',
        architecture: 'Architecture views',
        resources: 'Project resources',
        gallery: 'Product gallery',
        download: 'Download file',
        close: 'End of case study',
        allProjects: 'Explore all projects',
      }
    : {
        caseStudy: 'Estudo de caso',
        overview: 'Visão do projeto',
        dossier: 'Dossiê do projeto',
        narrative: 'Desafio, decisões e resultado',
        architecture: 'Visões de arquitetura',
        resources: 'Recursos do projeto',
        gallery: 'Galeria do produto',
        download: 'Baixar arquivo',
        close: 'Fim do estudo de caso',
        allProjects: 'Explore todos os projetos',
      }

  return (
    <main className={styles.caseStudy}>
      <ViewCounter id={project.id} type="project" />

      <header className={styles.caseHeader}>
        <div className={styles.shell}>
          <div className={styles.caseTopline}>
            <Link href="/projetos" className={styles.backLink}>
              <ArrowLeft size={15} strokeWidth={1.7} />
              {t('backToProjects')}
            </Link>
            <span className={styles.detailIndex}>{labels.caseStudy} / {projectIndex}</span>
          </div>
        </div>
      </header>

      <section className={styles.detailHero}>
        <div className={styles.shell}>
          <h1 className={styles.detailTitle}>{project.title}</h1>

          <div className={styles.detailIntro}>
            <span className={styles.detailIntroLabel}>{labels.overview} ↘</span>
            <div>
              {(project.short_description || project.subtitle) && (
                <p className={styles.detailSummary}>
                  {project.short_description || project.subtitle}
                </p>
              )}
              {project.subtitle && project.short_description && (
                <p className={styles.detailSubtitle}>{project.subtitle}</p>
              )}

              {(project.deploy_url || project.repo_url) && (
                <div className={styles.actionRow}>
                  {project.deploy_url && (
                    <a
                      href={project.deploy_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.primaryAction}
                    >
                      {t('viewDemo')}
                      <ExternalLink size={14} />
                    </a>
                  )}
                  {project.repo_url && (
                    <a
                      href={project.repo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.secondaryAction}
                    >
                      {t('viewCode')}
                      <Github size={14} />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className={styles.heroMedia}>
        {project.cover_image_url ? (
          <Image
            src={project.cover_image_url}
            alt={project.title}
            fill
            priority
            className={styles.heroMediaImage}
            sizes="(max-width: 1728px) 94vw, 1632px"
          />
        ) : (
          <span className={styles.heroMediaFallback} aria-hidden="true">
            {project.title.charAt(0)}
          </span>
        )}
        <span className={styles.heroMediaCaption}>{project.title} / {date.getFullYear()}</span>
      </div>

      <section className={styles.factsBand}>
        <div className={`${styles.shell} ${styles.factsGrid}`}>
          <div className={styles.fact}>
            <span className={styles.factLabel}>{t('statusLabel')}</span>
            <span className={styles.factValue}>
              <span className={styles.statusDot} aria-hidden="true" />
              {statusLabels[project.status] || project.status}
            </span>
          </div>
          <div className={styles.fact}>
            <span className={styles.factLabel}>{t('createdAt')}</span>
            <span className={styles.factValue}>
              <Calendar size={16} strokeWidth={1.7} aria-hidden="true" />
              <time dateTime={project.created_at}>{formattedDate}</time>
            </span>
          </div>
          <div className={styles.fact}>
            <span className={styles.factLabel}>{t('views')}</span>
            <span className={styles.factValue}>
              <Eye size={16} strokeWidth={1.7} aria-hidden="true" />
              {project.views_count || 0}
            </span>
          </div>
          <div className={styles.fact}>
            <span className={styles.factLabel}>{t('technologies')}</span>
            <span className={styles.factValue}>
              <Layers3 size={16} strokeWidth={1.7} aria-hidden="true" />
              {String(project.technologies.length).padStart(2, '0')}
            </span>
          </div>
        </div>
      </section>

      {(project.technologies.length > 0 || project.tags.length > 0) && (
        <section className={styles.taxonomyBand}>
          <div className={styles.shell}>
            {project.technologies.length > 0 && (
              <div className={styles.taxonomyGroup}>
                <span className={styles.metaLabel}>{t('technologies')}</span>
                <div className={styles.taxonomyList}>
                  {project.technologies.map((technology: any) => (
                    <span key={technology.id} className={styles.taxonomyItem}>
                      <span
                        className={styles.taxonomyDot}
                        style={{ '--item-color': technology.color_hex || '#4da3ff' } as CSSProperties}
                        aria-hidden="true"
                      />
                      {technology.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {project.tags.length > 0 && (
              <div className={styles.taxonomyGroup}>
                <span className={styles.metaLabel}>{t('tags')}</span>
                <div className={styles.taxonomyList}>
                  {project.tags.map((tag: any) => (
                    <span key={tag.id} className={styles.taxonomyItem}>
                      <span
                        className={styles.taxonomyDot}
                        style={{ '--item-color': tag.color_hex || '#4da3ff' } as CSSProperties}
                        aria-hidden="true"
                      />
                      {tag.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      <section className={styles.caseBody}>
        <div className={styles.shell}>
          <Tabs defaultValue="details" className={styles.caseTabs}>
            {activeTabsCount > 1 && (
              <TabsList className={styles.tabList} aria-label={labels.dossier}>
                <TabsTrigger value="details" className={styles.tabTrigger}>
                  <FileText size={15} />
                  {t('tabs.details')}
                </TabsTrigger>
                {hasDiagrams && (
                  <TabsTrigger value="diagrams" className={styles.tabTrigger}>
                    <Code2 size={15} />
                    {t('tabs.diagrams')}
                  </TabsTrigger>
                )}
                {hasDownloads && (
                  <TabsTrigger value="downloads" className={styles.tabTrigger}>
                    <Download size={15} />
                    {t('tabs.downloads')}
                  </TabsTrigger>
                )}
                {hasGallery && (
                  <TabsTrigger value="gallery" className={styles.tabTrigger}>
                    <ImageIcon size={15} />
                    {t('tabs.gallery')}
                  </TabsTrigger>
                )}
              </TabsList>
            )}

            <TabsContent value="details" className={styles.tabContent}>
              <div className={styles.editorialSection}>
                <div className={styles.sectionMarker}>
                  <span className={styles.sectionIndex}>Section / 01</span>
                  <span className={styles.sectionEyebrow}>{labels.dossier}</span>
                  <h2 className={styles.sectionTitle}>{labels.narrative}</h2>
                </div>
                <div className={styles.detailProse}>
                  {project.full_description ? (
                    <MarkdownRenderer content={project.full_description} />
                  ) : (
                    <p className={styles.fallbackDescription}>
                      {project.short_description || project.subtitle}
                    </p>
                  )}
                </div>
              </div>
            </TabsContent>

            {hasDiagrams && (
              <TabsContent value="diagrams" className={styles.tabContent}>
                <div className={styles.editorialSection}>
                  <div className={styles.sectionMarker}>
                    <span className={styles.sectionIndex}>Section / 02</span>
                    <span className={styles.sectionEyebrow}>{t('tabs.diagrams')}</span>
                    <h2 className={styles.sectionTitle}>{labels.architecture}</h2>
                  </div>
                  <div className={styles.diagramGrid}>
                    {project.diagrams.map((diagram: any, index: number) => (
                      <article key={`${diagram.title || 'diagram'}-${index}`} className={styles.diagramCard}>
                        <header className={styles.diagramHeader}>
                          <h3 className={styles.diagramTitle}>{diagram.title || t('tabs.diagrams')}</h3>
                          <span className={styles.diagramNumber}>{String(index + 1).padStart(2, '0')}</span>
                        </header>
                        <MermaidRenderer chart={diagram.code || ''} />
                      </article>
                    ))}
                  </div>
                </div>
              </TabsContent>
            )}

            {hasDownloads && (
              <TabsContent value="downloads" className={styles.tabContent}>
                <div className={styles.editorialSection}>
                  <div className={styles.sectionMarker}>
                    <span className={styles.sectionIndex}>Section / 03</span>
                    <span className={styles.sectionEyebrow}>{t('tabs.downloads')}</span>
                    <h2 className={styles.sectionTitle}>{labels.resources}</h2>
                  </div>
                  <div className={styles.downloadGrid}>
                    {project.downloads.map((file: any, index: number) => (
                      <a
                        key={`${file.file_url}-${index}`}
                        href={file.file_url}
                        download
                        target="_blank"
                        rel="noreferrer"
                        className={styles.downloadCard}
                      >
                        <div className={styles.downloadTop}>
                          <span className={styles.downloadType}>{getFileExtension(file.file_url)}</span>
                          <Download size={18} strokeWidth={1.5} />
                        </div>
                        <div>
                          <h3 className={styles.downloadName}>{file.label || labels.download}</h3>
                          {file.description && (
                            <p className={styles.downloadDescription}>{file.description}</p>
                          )}
                        </div>
                        <div className={styles.downloadBottom}>
                          <span>{labels.download}</span>
                          <span>{String(index + 1).padStart(2, '0')} ↘</span>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </TabsContent>
            )}

            {hasGallery && (
              <TabsContent value="gallery" className={styles.tabContent}>
                <div className={styles.editorialSection}>
                  <div className={styles.sectionMarker}>
                    <span className={styles.sectionIndex}>Section / 04</span>
                    <span className={styles.sectionEyebrow}>{t('gallery')}</span>
                    <h2 className={styles.sectionTitle}>{labels.gallery}</h2>
                  </div>
                  <div className={styles.galleryFrame}>
                    <header className={styles.galleryHeader}>
                      <h3 className={styles.galleryTitle}>{t('gallery')}</h3>
                      <span className={styles.galleryCount}>{String(project.images.length).padStart(2, '0')}</span>
                    </header>
                    <Carousel
                      fit="contain"
                      images={[...project.images].sort((a: any, b: any) => a.display_order - b.display_order)}
                      className={styles.galleryCarousel}
                    />
                  </div>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </section>

      <section className={styles.caseOutro}>
        <div className={`${styles.shell} ${styles.caseOutroGrid}`}>
          <div>
            <span className={styles.caseOutroLabel}>{labels.close} / {projectIndex}</span>
            <h2 className={styles.caseOutroTitle}>{labels.allProjects}</h2>
          </div>
          <Link href="/projetos" className={styles.caseOutroLink} aria-label={t('backToProjects')}>
            <ArrowUpRight size={32} strokeWidth={1.4} />
          </Link>
        </div>
      </section>
    </main>
  )
}
