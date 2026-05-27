import { Metadata } from 'next'
import { Crown } from 'lucide-react'
import { FlowingLights } from '@/components/ui/flowing-lights'
import { getCachedProjects } from '@/lib/supabase/cached'
import { getTranslations, getLocale, setRequestLocale } from 'next-intl/server'
import { ProjectGrid } from '@/components/portfolio/project-grid'
import type { ProjectWithRelations } from '@/lib/types/database'

interface ProjectsPageProps {
  params: Promise<{ locale: string }>
}

export const metadata: Metadata = {
  title: 'Projetos | Galeria Premium',
  description: 'Uma coleção curada de projetos de engenharia de software e inteligência artificial.',
}

export default async function ProjectsPage({ params }: ProjectsPageProps) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('projects')

  let projectsData: any[] = []
  try {
    const rawProjects = (await getCachedProjects()) as any[]
    // Sort by is_featured (descending) then display_order (ascending) to match the original database ordering
    projectsData = [...rawProjects].sort((a, b) => {
      const aFeatured = a.is_featured ? 1 : 0
      const bFeatured = b.is_featured ? 1 : 0
      if (bFeatured !== aFeatured) {
        return bFeatured - aFeatured
      }
      return a.display_order - b.display_order
    })
  } catch (error) {
    console.error('Error fetching projects from cache:', error)
    projectsData = []
  }

  // Transform data to match the expected format
  const projects =
    (projectsData as any)?.map((project: any) => {
      const translations = (project.translations || []) as Array<{ language: string; title?: string; subtitle?: string | null; short_description?: string | null; full_description?: string | null; meta_description?: string | null }>
      const ptTranslation = translations.find((tr) => tr.language === 'pt-BR')
      const enTranslation = translations.find((tr) => tr.language === 'en')
      const currentTranslation = locale === 'en' ? enTranslation || ptTranslation : ptTranslation

      return {
        ...project,
        technologies:
          (project.technologies as any)?.map((pt: { technology: unknown } | null) => pt?.technology).filter(Boolean) || [],
        tags: (project.tags as any)?.map((pt: { tag: unknown } | null) => pt?.tag).filter(Boolean) || [],
        title: currentTranslation?.title || (project as any).title,
        subtitle: currentTranslation?.subtitle || (project as any).subtitle,
        short_description:
          currentTranslation?.short_description || (project as any).short_description,
        full_description: currentTranslation?.full_description || (project as any).full_description,
        meta_description: currentTranslation?.meta_description || (project as any).meta_description,
      } as ProjectWithRelations
    }) || []

  return (
    <div className="min-h-screen bg-background transition-colors duration-500 relative overflow-hidden selection:bg-primary/30">
      
      {/* Background Animation & Gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-primary/5 dark:bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-500/5 dark:bg-blue-500/10 blur-[100px]" />
      </div>
      <div className="opacity-60 fixed inset-0 pointer-events-none z-0">
        <FlowingLights />
      </div>

      {/* Header Section */}
      <section className="relative pt-32 pb-20 px-6 md:px-12 z-10">
        <div className="container mx-auto text-center max-w-5xl space-y-8">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-foreground to-foreground/40 mb-6 drop-shadow-sm">
            {t('title')}
          </h1>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="container mx-auto px-4 sm:px-6 md:px-12 pb-24 md:pb-32 relative z-10">
        {projects.length === 0 ? (
          <div className="text-center py-32 space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted/50 mb-4">
              <Crown className="w-10 h-10 text-muted-foreground/50" />
            </div>
            <p className="text-xl md:text-2xl font-medium text-muted-foreground">{t('empty')}</p>
            <p className="text-sm text-muted-foreground/70 max-w-md mx-auto">
              Novos projetos serão adicionados em breve. Fique atento!
            </p>
          </div>
        ) : (
          <div className="pb-20">
            <ProjectGrid projects={projects} />
          </div>
        )}
      </section>
    </div>
  )
}
