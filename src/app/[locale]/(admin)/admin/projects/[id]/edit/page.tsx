import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProjectForm } from '@/components/admin/project-form'
import { AdminPageHeader } from '@/components/admin/admin-page-header'
import type { Project, ProjectTranslation, ProjectImage } from '@/lib/types/database'

export const metadata: Metadata = {
  title: 'Editar Projeto | Admin',
}

interface EditProjectPageProps {
  params: Promise<{ id: string }>
}

export default async function EditProjectPage({ params }: EditProjectPageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch project with relations and translations
  const { data: projectDataRaw, error } = await supabase
    .from('projects')
    .select(`
      *,
      technologies:project_technologies(technology_id),
      tags:project_tags(tag_id),
      images:project_images(*),
      translations:project_translations(*)
    `)
    .eq('id', parseInt(id))
    .single()

  if (error || !projectDataRaw) {
    notFound()
  }

  // Type assertion for complex query result - need all Project properties
  const projectData = projectDataRaw as Project & {
    technologies?: Array<{ technology_id?: number }>
    tags?: Array<{ tag_id?: number }>
    images?: ProjectImage[]
    translations?: Array<ProjectTranslation & { language: string }>
  }

  // Get translations
  const translations = projectData.translations || []
  const ptTranslation = translations.find((t) => t.language === 'pt-BR')
  const enTranslation = translations.find((t) => t.language === 'en')

  // Transform data to match ProjectFormProps
  const project: Project & {
    technology_ids?: number[]
    tag_ids?: number[]
    images?: ProjectImage[]
    translations?: {
      pt?: ProjectTranslation
      en?: ProjectTranslation
    }
  } = {
    ...projectData,
    technology_ids: (projectData.technologies || []).map((t) => t.technology_id).filter((id): id is number => Boolean(id)),
    tag_ids: (projectData.tags || []).map((t) => t.tag_id).filter((id): id is number => Boolean(id)),
    images: projectData.images || [],
    translations: {
      pt: ptTranslation ? {
        id: ptTranslation.id,
        project_id: ptTranslation.project_id,
        language: ptTranslation.language,
        title: ptTranslation.title,
        subtitle: ptTranslation.subtitle,
        short_description: ptTranslation.short_description,
        full_description: ptTranslation.full_description,
        meta_description: ptTranslation.meta_description,
        created_at: ptTranslation.created_at,
        updated_at: ptTranslation.updated_at,
      } : undefined,
      en: enTranslation ? {
        id: enTranslation.id,
        project_id: enTranslation.project_id,
        language: enTranslation.language,
        title: enTranslation.title,
        subtitle: enTranslation.subtitle,
        short_description: enTranslation.short_description,
        full_description: enTranslation.full_description,
        meta_description: enTranslation.meta_description,
        created_at: enTranslation.created_at,
        updated_at: enTranslation.updated_at,
      } : undefined,
    },
  }

  // Fetch technologies and tags for the form
  const [{ data: technologies }, { data: tags }] = await Promise.all([
    supabase.from('technologies').select('*').eq('is_active', true).order('name'),
    supabase.from('tags').select('*').order('name'),
  ])

  return (
    <div className="space-y-6">
      <AdminPageHeader
        index="03 — Projetos"
        title="Editar Projeto"
        description="Atualize as informações do projeto em ambos os idiomas"
      />

      <ProjectForm
        project={project}
        technologies={technologies || []}
        tags={tags || []}
      />
    </div>
  )
}
