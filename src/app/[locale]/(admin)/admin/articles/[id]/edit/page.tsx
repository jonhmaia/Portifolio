import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ArticleForm } from '@/components/admin/article-form'
import { AdminPageHeader } from '@/components/admin/admin-page-header'
import type { Article, ArticleTranslation } from '@/lib/types/database'

export const metadata: Metadata = {
  title: 'Editar Artigo | Admin',
}

interface EditArticlePageProps {
  params: Promise<{ id: string }>
}

export default async function EditArticlePage({ params }: EditArticlePageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch article with relations and translations
  const { data: articleDataRaw, error } = await supabase
    .from('articles')
    .select(`
      *,
      tags:article_tags(tag_id),
      projects:article_projects(project_id),
      translations:article_translations(*)
    `)
    .eq('id', parseInt(id))
    .single()

  if (error || !articleDataRaw) {
    notFound()
  }

  // Type assertion for complex query result - need all Article properties
  const articleData = articleDataRaw as Article & {
    tags?: Array<{ tag_id?: number }>
    projects?: Array<{ project_id?: number }>
    translations?: Array<ArticleTranslation & { language: string }>
  }

  // Get translations
  const translations = articleData.translations || []
  const ptTranslation = translations.find((t) => t.language === 'pt-BR')
  const enTranslation = translations.find((t) => t.language === 'en')

  // Transform data to match ArticleFormProps
  const article: Article & {
    tag_ids?: number[]
    project_ids?: number[]
    translations?: {
      pt?: ArticleTranslation
      en?: ArticleTranslation
    }
  } = {
    ...articleData,
    tag_ids: (articleData.tags || []).map((t) => t.tag_id).filter((id): id is number => Boolean(id)),
    project_ids: (articleData.projects || []).map((p) => p.project_id).filter((id): id is number => Boolean(id)),
    translations: {
      pt: ptTranslation ? {
        id: ptTranslation.id,
        article_id: ptTranslation.article_id,
        language: ptTranslation.language,
        title: ptTranslation.title,
        content: ptTranslation.content,
        summary: ptTranslation.summary,
        excerpt: ptTranslation.excerpt,
        meta_description: ptTranslation.meta_description,
        created_at: ptTranslation.created_at,
        updated_at: ptTranslation.updated_at,
      } : undefined,
      en: enTranslation ? {
        id: enTranslation.id,
        article_id: enTranslation.article_id,
        language: enTranslation.language,
        title: enTranslation.title,
        content: enTranslation.content,
        summary: enTranslation.summary,
        excerpt: enTranslation.excerpt,
        meta_description: enTranslation.meta_description,
        created_at: enTranslation.created_at,
        updated_at: enTranslation.updated_at,
      } : undefined,
    },
  }

  // Fetch categories, tags, and projects for the form
  const [{ data: categories }, { data: tags }, { data: projects }] = await Promise.all([
    supabase.from('categories').select('*').order('display_order'),
    supabase.from('tags').select('*').order('name'),
    supabase.from('projects').select('id, title, slug').eq('is_active', true).order('title'),
  ])

  return (
    <div className="space-y-6">
      <AdminPageHeader
        index="04 — Artigos"
        title="Editar Artigo"
        description="Atualize o conteúdo do artigo em ambos os idiomas"
      />

      <ArticleForm
        article={article}
        categories={categories || []}
        tags={tags || []}
        projects={projects || []}
      />
    </div>
  )
}
