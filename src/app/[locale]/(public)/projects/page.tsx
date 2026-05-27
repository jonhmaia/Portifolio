import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getCachedProjects } from '@/lib/supabase/cached'
import { ProjectGrid } from '@/components/portfolio/project-grid'
import { Button } from '@/components/ui/button'
import { getTranslations, getLocale, setRequestLocale } from 'next-intl/server'

interface ProjectsPageProps {
  params: Promise<{ locale: string }>
}

export const metadata: Metadata = {
  title: 'Projects',
  description: 'Explore my software development projects',
}

export default async function ProjectsPage({ params }: ProjectsPageProps) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('projects')

  // Get projects with relations and translations from the cached layer
  let projects: any[] = []
  try {
    projects = await getCachedProjects()
  } catch (error) {
    console.error('Error fetching projects from cache:', error)
    notFound()
  }

  // Process projects with translations
  const processedProjects = projects?.map((project: any) => {
    const translations = (project.translations || []) as Array<{ 
      language: string
      title?: string
      subtitle?: string | null
      short_description?: string | null
    }>
    const ptTranslation = translations.find((tr) => tr.language === 'pt-BR')
    const enTranslation = translations.find((tr) => tr.language === 'en')
    const currentTranslation = locale === 'en' ? enTranslation || ptTranslation : ptTranslation

    return {
      ...project,
      title: currentTranslation?.title || project.title,
      subtitle: currentTranslation?.subtitle || project.subtitle,
      short_description: currentTranslation?.short_description || project.short_description,
      technologies: (project.technologies as Array<{ technology: unknown }> | null)?.map((pt) => pt.technology).filter(Boolean) || [],
      tags: (project.tags as Array<{ tag: unknown }> | null)?.map((pt) => pt.tag).filter(Boolean) || [],
    }
  }) || []

  const featuredProjects = processedProjects.filter((p: any) => p.is_featured)
  const regularProjects = processedProjects.filter((p: any) => !p.is_featured)

  return (
    <div className="container py-12 md:py-16 min-h-screen">
      {/* Header */}
      <div className="text-center mb-12 md:mb-16">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
          {t('title')}
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          {t('description')}
        </p>
      </div>

      {/* Featured Projects */}
      {featuredProjects.length > 0 && (
        <section className="mb-16 md:mb-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              {t('featured')}
            </h2>
            <div className="h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent flex-1 mx-6" />
          </div>
          <ProjectGrid projects={featuredProjects} />
        </section>
      )}

      {/* All Projects */}
      {regularProjects.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              {t('allProjects')}
            </h2>
            <div className="h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent flex-1 mx-6" />
          </div>
          <ProjectGrid projects={regularProjects} />
        </section>
      )}

      {/* Empty State */}
      {processedProjects.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🚧</div>
          <h3 className="text-xl font-semibold mb-2">{t('noProjects')}</h3>
          <p className="text-muted-foreground mb-6">{t('noProjectsDescription')}</p>
          <Link href="/contact">
            <Button>{t('contactMe')}</Button>
          </Link>
        </div>
      )}
    </div>
  )
}
