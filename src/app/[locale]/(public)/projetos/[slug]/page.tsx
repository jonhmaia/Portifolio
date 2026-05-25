import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { Link } from '@/navigation'
import { createClient } from '@/lib/supabase/server'
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
  Eye
} from 'lucide-react'
import { MarkdownRenderer } from '@/components/blog/markdown-renderer'
import { getTranslations, getLocale } from 'next-intl/server'
import 'highlight.js/styles/github-dark.css' // Import highlight.js styles

interface ProjectPageProps {
  params: Promise<{ slug: string; locale: string }>
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug, locale } = await params
  const supabase = await createClient()

  const { data: project } = await supabase
    .from('projects')
    .select(`
      title, 
      short_description, 
      meta_description, 
      cover_image_url,
      translations:project_translations(*)
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

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
  const { slug } = await params
  const locale = await getLocale()
  const t = await getTranslations('projectDetail')
  const supabase = await createClient()

  // Get project with relations and translations
  const { data: projectData, error } = await supabase
    .from('projects')
    .select(`
      *,
      technologies:project_technologies(
        technology:technologies(*)
      ),
      tags:project_tags(
        tag:tags(*)
      ),
      images:project_images(*),
      translations:project_translations(*)
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error || !projectData) {
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
    technologies: (typedProjectData.technologies as Array<{ technology: unknown }> | null)?.map((pt) => pt.technology).filter(Boolean) || [],
    tags: (typedProjectData.tags as Array<{ tag: unknown }> | null)?.map((pt) => pt.tag).filter(Boolean) || [],
    images: typedProjectData.images || [],
  }

  // Increment view count
  await (supabase.rpc as any)('increment_project_views', { project_id: project.id })

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
          {/* Cover Image - Now smaller and in the sidebar */}
          {project.cover_image_url && (
            <div className="relative aspect-video rounded-2xl overflow-hidden border border-border/50 shadow-lg group">
              <Image
                src={project.cover_image_url}
                alt={project.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          )}

          {/* Actions Card */}
          <Card className="border-border/50 shadow-sm overflow-hidden">
            <CardContent className="p-4 space-y-3">
              {project.deploy_url && (
                <Button asChild className="w-full font-semibold shadow-md" size="lg">
                  <a href={project.deploy_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    {t('viewDemo')}
                  </a>
                </Button>
              )}
              {project.repo_url && (
                <Button asChild variant="outline" className="w-full font-medium" size="lg">
                  <a href={project.repo_url} target="_blank" rel="noopener noreferrer">
                    <Github className="mr-2 h-4 w-4" />
                    {t('viewCode')}
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="border-border/50 shadow-sm">
            <CardContent className="p-5 space-y-5">
              {/* Status */}
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">{t('statusLabel')}</h3>
                <Badge 
                  variant="outline" 
                  className={`px-3 py-1 text-sm font-medium ${statusColors[project.status as keyof typeof statusColors]}`}
                >
                  {statusLabels[project.status as keyof typeof statusLabels]}
                </Badge>
              </div>

              <Separator />

              {/* Date */}
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">{t('createdAt')}</h3>
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Calendar className="h-4 w-4 text-primary/70" />
                  {new Date(project.created_at).toLocaleDateString(locale === 'en' ? 'en-US' : 'pt-BR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </div>
              </div>

              <Separator />

              {/* Views */}
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">{t('views')}</h3>
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Eye className="h-4 w-4 text-primary/70" />
                  {project.views_count}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Technologies Card */}
          {project.technologies && project.technologies.length > 0 && (
            <Card className="border-border/50 shadow-sm">
              <CardContent className="p-5">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{t('technologies')}</h3>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech: any) => (
                    <div
                      key={tech.id}
                      className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border bg-background transition-colors hover:bg-muted/50"
                      style={{
                        borderColor: `${tech.color_hex}40`,
                        color: tech.color_hex,
                      }}
                    >
                      <div 
                        className="w-1.5 h-1.5 rounded-full mr-1.5" 
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
            <Card className="border-border/50 shadow-sm">
              <CardContent className="p-5">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{t('tags')}</h3>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag: any) => (
                    <Badge
                      key={tag.id}
                      variant="outline"
                      className="hover:bg-muted/50 transition-colors"
                      style={{ borderColor: tag.color_hex, color: tag.color_hex }}
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

          {/* Description */}
          {/* Description */}
          {project.full_description && (
            <MarkdownRenderer content={project.full_description} />
          )}

          {/* Gallery Carousel */}
          {project.images && project.images.length > 0 && (
            <div className="space-y-6 pt-8 border-t">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold tracking-tight">{t('gallery')}</h2>
                <Badge variant="secondary" className="rounded-full px-2.5">
                  {project.images.length}
                </Badge>
              </div>
              <Carousel 
                images={project.images.sort((a: any, b: any) => a.display_order - b.display_order)} 
                className="shadow-2xl"
              />
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
