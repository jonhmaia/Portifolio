import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { Link } from '@/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
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
  Image as ImageIcon
} from 'lucide-react'
import { MarkdownRenderer } from '@/components/blog/markdown-renderer'
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
    <article className="container py-12 md:py-16 min-h-screen">
      {renderViewCounter}
      {/* Back button */}
      <Link
        href="/projetos"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 transition-colors group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        {t('backToProjects')}
      </Link>

      <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Column - Sidebar & Metadata (approx 33%) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Cover Image - Now framed elegantly as a device mockup */}
          {project.cover_image_url && (
            <div className="relative aspect-video rounded-2xl overflow-hidden border border-border/40 shadow-xl shadow-black/10 group p-1.5 bg-card/30 backdrop-blur-sm">
              <div className="relative w-full h-full rounded-xl overflow-hidden">
                <Image
                  src={project.cover_image_url}
                  alt={project.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
              </div>
            </div>
          )}

          {/* Actions Card - Conditional: Only shown if at least one URL exists */}
          {(project.deploy_url || project.repo_url) && (
            <Card className="border-border/50 bg-card/40 backdrop-blur-md rounded-2xl overflow-hidden shadow-xl shadow-black/5">
              <CardContent className="p-4 space-y-3">
                {project.deploy_url && (
                  <Button asChild className="w-full font-semibold shadow-md rounded-xl" size="lg">
                    <a href={project.deploy_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      {t('viewDemo')}
                    </a>
                  </Button>
                )}
                {project.repo_url && (
                  <Button asChild variant="outline" className="w-full font-medium rounded-xl border-border/60 hover:bg-muted/40" size="lg">
                    <a href={project.repo_url} target="_blank" rel="noopener noreferrer">
                      <Github className="mr-2 h-4 w-4" />
                      {t('viewCode')}
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Info Card */}
          <Card className="border-border/50 bg-card/40 backdrop-blur-md rounded-2xl overflow-hidden shadow-xl shadow-black/5">
            <CardContent className="p-5 space-y-5">
              {/* Status */}
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">{t('statusLabel')}</h3>
                <Badge 
                  variant="outline" 
                  className={`px-3 py-1 text-sm font-medium rounded-lg ${statusColors[project.status as keyof typeof statusColors]}`}
                >
                  {statusLabels[project.status as keyof typeof statusLabels]}
                </Badge>
              </div>

              <div className="border-b border-border/15" />

              {/* Date */}
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">{t('createdAt')}</h3>
                <div className="flex items-center gap-2.5 text-sm font-medium text-foreground">
                  <Calendar className="h-4 w-4 text-primary" />
                  {new Date(project.created_at).toLocaleDateString(locale === 'en' ? 'en-US' : 'pt-BR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </div>
              </div>

              <div className="border-b border-border/15" />

              {/* Views */}
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">{t('views')}</h3>
                <div className="flex items-center gap-2.5 text-sm font-medium text-foreground">
                  <Eye className="h-4 w-4 text-primary" />
                  {project.views_count}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Technologies Card */}
          {project.technologies && project.technologies.length > 0 && (
            <Card className="border-border/50 bg-card/40 backdrop-blur-md rounded-2xl overflow-hidden shadow-xl shadow-black/5">
              <CardContent className="p-5">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{t('technologies')}</h3>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech: any) => (
                    <div
                      key={tech.id}
                      className="inline-flex items-center px-2.5 py-1.5 rounded-xl text-xs font-semibold border bg-background/50 backdrop-blur-sm transition-all hover:bg-muted/30"
                      style={{
                        borderColor: `${tech.color_hex}30`,
                        color: tech.color_hex,
                      }}
                    >
                      <div 
                        className="w-1.5 h-1.5 rounded-full mr-2" 
                        style={{ backgroundColor: tech.color_hex }}
                      />
                      {tech.name}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tags Card */}
          {project.tags && project.tags.length > 0 && (
            <Card className="border-border/50 bg-card/40 backdrop-blur-md rounded-2xl overflow-hidden shadow-xl shadow-black/5">
              <CardContent className="p-5">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{t('tags')}</h3>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag: any) => (
                    <Badge
                      key={tag.id}
                      variant="outline"
                      className="hover:bg-muted/40 transition-colors rounded-lg px-2.5 py-1 text-xs border-border/60"
                      style={{ borderColor: tag.color_hex ? `${tag.color_hex}40` : undefined, color: tag.color_hex }}
                    >
                      #{tag.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Main Content (approx 66%) */}
        <div className="lg:col-span-8 space-y-10">
          {/* Header */}
          <div className="space-y-4 border-b pb-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
              {project.title}
            </h1>
            {project.subtitle && (
              <p className="text-xl md:text-2xl text-muted-foreground font-light leading-relaxed">
                {project.subtitle}
              </p>
            )}
          </div>

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
              <Tabs defaultValue="details" className="w-full space-y-8">
                {/* Responsive Glassmorphic Tab Selector list - shown only if more than 1 tab is active */}
                {activeTabsCount > 1 && (
                  <TabsList className={`flex flex-wrap md:grid w-full ${gridColsClass} h-auto md:h-11 p-1 bg-muted/40 border border-border/30 rounded-2xl gap-1 md:gap-0`}>
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
                <TabsContent value="details" className="outline-none space-y-6">
                  {project.full_description && (
                    <MarkdownRenderer content={project.full_description} />
                  )}
                </TabsContent>

                {/* Content: Diagrams */}
                {hasDiagrams && (
                  <TabsContent value="diagrams" className="outline-none space-y-8 animate-in fade-in-50 duration-300">
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
                  <TabsContent value="downloads" className="outline-none space-y-6 animate-in fade-in-50 duration-300">
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
                  <TabsContent value="gallery" className="outline-none space-y-6 animate-in fade-in-50 duration-300">
                    <div className="flex items-center gap-2 mb-4 border-b pb-3 border-border/20">
                      <h2 className="text-2xl font-bold tracking-tight">{t('gallery')}</h2>
                      <Badge variant="secondary" className="rounded-full px-2.5">
                        {project.images.length}
                      </Badge>
                    </div>
                    <Carousel 
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
