import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { ArticleForm } from '@/components/admin/article-form'
import { AdminPageHeader } from '@/components/admin/admin-page-header'

export const metadata: Metadata = {
  title: 'Novo Artigo | Admin',
}

export default async function NewArticlePage() {
  const supabase = await createClient()

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
        title="Novo Artigo"
        description="Escreva um novo artigo para o blog"
      />

      <ArticleForm
        categories={categories || []}
        tags={tags || []}
        projects={projects || []}
      />
    </div>
  )
}
