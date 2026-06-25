import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { Link } from '@/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Carousel } from '@/components/ui/simple-carousel'
import { 
  ArrowLeft, 
  ExternalLink, 
  Github, 
  Calendar, 
  Eye,
  FileText,
  Code2,
  Download,
  Image as ImageIcon,
  Hash,
  Cpu,
} from 'lucide-react'
import { MarkdownRenderer } from '@/components/blog/markdown-renderer'
import { ColorPill } from '@/components/portfolio/color-pill'
import { MermaidRenderer } from '@/components/ui/mermaid-renderer'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getTranslations, getLocale, setRequestLocale } from 'next-intl/server'
import { cache } from 'react'
import { getCachedProjectBySlug, getCachedSitemapProjects } from '@/lib/supabase/cached'
import { ViewCounter } from '@/components/blog/view-counter'
import { routing } from '@/i18n/routing'
import 'highlight.js/styles/github-dark.css' // Import highlight.js styles

interface ProjectPageProps {
  params: Promise<{ slug: string; locale: string }>
}

// Request-scoped cache to deduplicate fetches between metadata generation and rendering
const getProject = cache(async (slug: string) => {
  try {
    return await getCachedProjectBySlug(slug)
  } catch (error) {
    console.error('Error loading project by slug:', error)
    return null
  }
})

export async function generateStaticParams() {
  try {
    const projects = (await getCachedSitemapProjects()) as any[]
    return routing.locales.flatMap((locale) =>
      projects.map((project) => ({
        locale,
        slug: project.slug,
      }))
    )
  } catch (error) {
    console.error('Error generating static params for projects:', error)
    return []
  }
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug, locale } = await params
  const project = await getProject(slug)

  if (!project) {
    return { title: locale === 'en' ? 'Project not found' : 'Projeto não encontrado' }
  }

  const projectData = project as any
  const translations = (projectData.translations || []) as Array<{ 
    language: string
    title?: string
    short_description?: string | null
    meta_description?: string | null 
  }>
  const ptTranslation = translations.find((tr) => tr.language === 'pt-BR')
  const enTranslation = translations.find((tr) => tr.language === 'en')
  const currentTranslation = locale === 'en' ? enTranslation || ptTranslation : ptTranslation

  const title = currentTranslation?.title || projectData.title
  const description = currentTranslation?.meta_description || currentTranslation?.short_description || projectData.meta_description || projectData.short_description || ''

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

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug, locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('projectDetail')

  // Get project with relations and translations from the cached layer
  const projectData = await getProject(slug)

  if (!projectData) {
    notFound()
  }

  const typedProjectData = projectData as any
  
  // Get translations
  const translations = (typedProjectData.translations || []) as Array<{ 
    language: string
    title?: string
    subtitle?: string | null
    short_description?: string | null
    full_description?: string | null
    meta_description?: string | null 
  }>
  const ptTranslation = translations.find((tr) => tr.language === 'pt-BR')
  const enTranslation = translations.find((tr) => tr.language === 'en')
  const currentTranslation = locale === 'en' ? enTranslation || ptTranslation : ptTranslation

  // Transform the data with translations applied
  const project = {
    ...typedProjectData,
    title: currentTranslation?.title || typedProjectData.title,
    subtitle: currentTranslation?.subtitle || typedProjectData.subtitle,
    short_description: currentTranslation?.short_description || typedProjectData.short_description,
    full_description: currentTranslation?.full_description || typedProjectData.full_description,
    meta_description: currentTranslation?.meta_description || typedProjectData.meta_description,
    diagrams: (currentTranslation as any)?.diagrams || [],
    downloads: (currentTranslation as any)?.downloads || [],
    technologies: (typedProjectData.technologies as Array<{ technology: unknown }> | null)?.map((pt) => pt.technology).filter(Boolean) || [],
    tags: (typedProjectData.tags as Array<{ tag: unknown }> | null)?.map((pt) => pt.tag).filter(Boolean) || [],
    images: typedProjectData.images || [],
  }

  // Render client-side view counter instead of server-side mutation
  const renderViewCounter = <ViewCounter id={project.id} type="project" />

  const statusLabels = {
    dev: t('status.dev'),
    concluido: t('status.completed'),
    pausado: t('status.paused'),
    arquivado: t('status.archived'),
  }

  const statusColors = {
    dev: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    concluido: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    pausado: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    arquivado: 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800',
  }

  return (
    <article className="container py-12 md:py-16 flex flex-col lg:min-h-[calc(100dvh-4rem)] lg:overflow-y-auto">
      {renderViewCounter}
      {/* Back button */}
      <Link
        href="/projetos"
        className="inline-flex shrink-0 items-center gap-2 text-muted-foreground hover:text-primary mb-8 transition-colors group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        {t('backToProjects')}
      </Link>

      <div className="flex flex-col flex-1 min-h-0 gap-8">
        {/* Meta bar — cover isolated left, details on the right */}
        <div className="shrink-0 rounded-xl border border-border/40 bg-card/30 backdrop-blur-md overflow-hidden">
          <div className="flex flex-col sm:flex-row">
            {project.cover_image_url && (
              <div className="shrink-0 w-full sm:w-52 md:w-60 lg:w-72 p-3 sm:p-4 border-b sm:border-b-0 sm:border-r border-border/30 bg-muted/10">
                <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-border/40 shadow-lg ring-1 ring-white/5">
                  <Image
                    src={project.cover_image_url}
                    alt={project.title}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </div>
            )}

            <div className="flex flex-1 flex-col justify-center gap-3 p-3 md:p-4 min-w-0">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                {(project.deploy_url || project.repo_url) && (
                  <div className="flex shrink-0 gap-2">
                    {project.deploy_url && (
                      <Button asChild size="sm" className="h-8 rounded-lg text-xs font-semibold shadow-sm">
                        <a href={project.deploy_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3.5 w-3.5" />
                          {t('viewDemo')}
                        </a>
                      </Button>
                    )}
                    {project.repo_url && (
                      <Button asChild variant="outline" size="sm" className="h-8 rounded-lg text-xs font-medium border-border/50">
                        <a href={project.repo_url} target="_blank" rel="noopener noreferrer">
                          <Github className="h-3.5 w-3.5" />
                          {t('viewCode')}
                        </a>
                      </Button>
                    )}
                  </div>
                )}

                {(project.deploy_url || project.repo_url) && (
                  <div className="hidden sm:block h-8 w-px bg-border/40 shrink-0" />
                )}

                <dl className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <dt className="sr-only">{t('statusLabel')}</dt>
                    <dd>
                      <Badge
                        variant="outline"
                        className={`h-6 px-2 text-[11px] font-medium rounded-md ${statusColors[project.status as keyof typeof statusColors]}`}
                      >
                        {statusLabels[project.status as keyof typeof statusLabels]}
                      </Badge>
                    </dd>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <dt className="sr-only">{t('createdAt')}</dt>
                    <Calendar className="h-3.5 w-3.5 shrink-0 text-primary" />
                    <dd className="text-xs font-medium text-foreground">
                      <time dateTime={project.created_at}>
                        {new Date(project.created_at).toLocaleDateString(locale === 'en' ? 'en-US' : 'pt-BR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </time>
                    </dd>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <dt className="sr-only">{t('views')}</dt>
                    <Eye className="h-3.5 w-3.5 shrink-0 text-primary" />
                    <dd className="text-xs font-medium text-foreground">{project.views_count}</dd>
                  </div>
                </dl>
              </div>

              {project.technologies && project.technologies.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 min-w-0">
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mr-0.5 shrink-0">
                    {t('technologies')}
                  </span>
                  {project.technologies.map((tech: any) => (
                    <ColorPill
                      key={tech.id}
                      label={tech.name}
                      color={tech.color_hex || '#38BDF8'}
                      icon={Cpu}
                    />
                  ))}
                </div>
              )}

              {project.tags && project.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 min-w-0">
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mr-0.5 shrink-0">
                    {t('tags')}
                  </span>
                  {project.tags.map((tag: any) => (
                    <ColorPill
                      key={tag.id}
                      label={tag.name}
                      color={tag.color_hex || '#F97316'}
                      icon={Hash}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="shrink-0 space-y-2 border-b pb-5">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            {project.title}
          </h1>
          {project.subtitle && (
            <p className="text-sm md:text-base text-muted-foreground font-light leading-relaxed">
              {project.subtitle}
            </p>
          )}
        </div>

        <div className="flex flex-col flex-1 min-h-0">
          {(() => {
            const hasDiagrams = Array.isArray(project.diagrams) && project.diagrams.length > 0
            const hasDownloads = Array.isArray(project.downloads) && project.downloads.length > 0
            const hasGallery = Array.isArray(project.images) && project.images.length > 0

            const activeTabsCount = 1 + (hasDiagrams ? 1 : 0) + (hasDownloads ? 1 : 0) + (hasGallery ? 1 : 0)
            const gridColsClass = 
              activeTabsCount === 4 ? 'md:grid-cols-4' 
              : activeTabsCount === 3 ? 'md:grid-cols-3' 
              : 'md:grid-cols-2'

            return (
              <Tabs defaultValue="details" className="w-full flex flex-col flex-1 min-h-0 gap-8">
                {/* Responsive Glassmorphic Tab Selector list - shown only if more than 1 tab is active */}
                {activeTabsCount > 1 && (
                  <TabsList className={`shrink-0 flex flex-wrap md:grid w-full ${gridColsClass} h-auto md:h-11 p-1 bg-muted/40 border border-border/30 rounded-2xl gap-1 md:gap-0`}>
                    <TabsTrigger value="details" className="rounded-lg h-9 gap-2 flex-1 justify-center">
                      <FileText className="h-4 w-4" />
                      {t('tabs.details')}
                    </TabsTrigger>
                    
                    {hasDiagrams && (
                      <TabsTrigger value="diagrams" className="rounded-lg h-9 gap-2 flex-1 justify-center">
                        <Code2 className="h-4 w-4" />
                        {t('tabs.diagrams')}
                      </TabsTrigger>
                    )}
                    
                    {hasDownloads && (
                      <TabsTrigger value="downloads" className="rounded-lg h-9 gap-2 flex-1 justify-center">
                        <Download className="h-4 w-4" />
                        {t('tabs.downloads')}
                      </TabsTrigger>
                    )}
                    
                    {hasGallery && (
                      <TabsTrigger value="gallery" className="rounded-lg h-9 gap-2 flex-1 justify-center">
                        <ImageIcon className="h-4 w-4" />
                        {t('tabs.gallery')}
                      </TabsTrigger>
                    )}
                  </TabsList>
                )}

                {/* Content: Details */}
                <TabsContent value="details" className="scroll-panel outline-none space-y-6 flex-1 min-h-0 overflow-y-auto overscroll-contain pr-1 lg:pr-2 lg:max-h-[calc(100dvh-18rem)]">
                  {project.full_description && (
                    <MarkdownRenderer content={project.full_description} />
                  )}
                </TabsContent>

                {/* Content: Diagrams */}
                {hasDiagrams && (
                  <TabsContent value="diagrams" className="scroll-panel outline-none space-y-8 animate-in fade-in-50 duration-300 flex-1 min-h-0 overflow-y-auto overscroll-contain pr-1 lg:pr-2 lg:max-h-[calc(100dvh-18rem)]">
                    <div className="grid gap-6">
                      {project.diagrams.map((diag: any, index: number) => (
                        <Card key={index} className="border-border/50 bg-card/40 backdrop-blur-md rounded-2xl overflow-hidden p-6 space-y-4">
                          <h3 className="text-lg font-bold text-foreground flex items-center gap-2 border-b pb-3 border-border/25">
                            <Code2 className="h-4 w-4 text-primary" />
                            {diag.title}
                          </h3>
                          <MermaidRenderer chart={diag.code} />
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                )}

                {/* Content: Downloads */}
                {hasDownloads && (
                  <TabsContent value="downloads" className="scroll-panel outline-none space-y-6 animate-in fade-in-50 duration-300 flex-1 min-h-0 overflow-y-auto overscroll-contain pr-1 lg:pr-2 lg:max-h-[calc(100dvh-18rem)]">
                    <div className="grid gap-4 sm:grid-cols-2">
                      {project.downloads.map((file: any, index: number) => {
                        const ext = file.file_url.split('.').pop()?.toUpperCase() || 'FILE'
                        return (
                          <Card key={index} className="border-border/50 bg-card/40 backdrop-blur-md rounded-2xl overflow-hidden p-5 flex flex-col justify-between group/file hover:border-primary/40 hover:bg-card/75 transition-all duration-300 shadow-md">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <Badge variant="secondary" className="rounded-md font-mono text-[10px] uppercase bg-primary/10 text-primary border-none py-0.5 px-2">
                                  {ext}
                                </Badge>
                                <Download className="h-4 w-4 text-muted-foreground/40 group-hover/file:text-primary group-hover/file:translate-y-[2px] transition-all" />
                              </div>
                              <h4 className="font-bold text-sm text-foreground line-clamp-1 group-hover/file:text-primary transition-colors">{file.label || 'Arquivo'}</h4>
                              {file.description && (
                                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                                  {file.description}
                                </p>
                              )}
                            </div>
                            <Button asChild size="sm" className="mt-4 rounded-xl w-full text-xs font-semibold shadow-sm active:scale-95 transition-all">
                              <a href={file.file_url} download target="_blank" rel="noreferrer">
                                <Download className="mr-2 h-3.5 w-3.5" />
                                Baixar Arquivo
                              </a>
                            </Button>
                          </Card>
                        )
                      })}
                    </div>
                  </TabsContent>
                )}

                {/* Content: Gallery */}
                {hasGallery && (
                  <TabsContent value="gallery" className="outline-none space-y-6 animate-in fade-in-50 duration-300 overflow-visible lg:flex-none">
                    <div className="flex items-center gap-2 border-b pb-3 border-border/20">
                      <h2 className="text-2xl font-bold tracking-tight">{t('gallery')}</h2>
                      <Badge variant="secondary" className="rounded-full px-2.5">
                        {project.images.length}
                      </Badge>
                    </div>
                    <Carousel
                      fit="contain"
                      images={project.images.sort((a: any, b: any) => a.display_order - b.display_order)}
                      className="shadow-2xl rounded-2xl overflow-hidden"
                    />
                  </TabsContent>
                )}
              </Tabs>
            )
          })()}
        </div>
      </div>
    </article>
  )
}
