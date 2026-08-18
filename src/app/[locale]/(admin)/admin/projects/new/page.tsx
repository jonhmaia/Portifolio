import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { ProjectForm } from '@/components/admin/project-form'
import { AdminPageHeader } from '@/components/admin/admin-page-header'

export const metadata: Metadata = {
  title: 'Novo Projeto | Admin',
}

export default async function NewProjectPage() {
  const supabase = await createClient()

  // Fetch technologies and tags for the form
  const [{ data: technologies }, { data: tags }] = await Promise.all([
    supabase.from('technologies').select('*').eq('is_active', true).order('name'),
    supabase.from('tags').select('*').order('name'),
  ])

  return (
    <div className="space-y-6">
      <AdminPageHeader
        index="03 — Projetos"
        title="Novo Projeto"
        description="Adicione um novo projeto ao seu portfólio"
      />

      <ProjectForm
        technologies={technologies || []}
        tags={tags || []}
      />
    </div>
  )
}
