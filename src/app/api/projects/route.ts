import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ProjectQueryResponse, ProjectTranslation, Technology, Tag } from '@/lib/types/database'

// GET /api/projects - List all projects
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    const status = searchParams.get('status')
    const is_active = searchParams.get('is_active')
    const is_featured = searchParams.get('is_featured')
    const technology = searchParams.get('technology')
    const tag = searchParams.get('tag')
    const lang = searchParams.get('lang') || 'pt-BR'
    const include_translations = searchParams.get('include_translations') === 'true'
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
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
      `, { count: 'exact' })
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) {
      query = query.eq('status', status)
    }
    if (is_active !== null) {
      query = query.eq('is_active', is_active === 'true')
    }
    if (is_featured !== null) {
      query = query.eq('is_featured', is_featured === 'true')
    }

    const { data, error, count } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Transform the data to flatten relations and handle translations
    const projects = (data as any)?.map((project: any) => {
      const translations = (project.translations || []) as ProjectTranslation[]
      const ptTranslation = translations.find((t) => t.language === 'pt-BR')
      const enTranslation = translations.find((t) => t.language === 'en')
      
      // Get translation based on requested language
      const currentTranslation = lang === 'en' ? (enTranslation || ptTranslation) : ptTranslation

      const baseProject = {
        ...project,
        technologies: (project.technologies as any)?.map((pt: any) => pt.technology).filter((t: any): t is Technology => t !== null) || [],
        tags: (project.tags as any)?.map((pt: any) => pt.tag).filter((t: any): t is Tag => t !== null) || [],
      }

      if (include_translations) {
        // Return all translations for admin
        return {
          ...baseProject,
          translations: {
            pt: ptTranslation || null,
            en: enTranslation || null,
          },
        }
      } else {
        // Return merged data with current language translation
        return {
          ...baseProject,
          title: currentTranslation?.title || project.title,
          subtitle: currentTranslation?.subtitle || project.subtitle,
          short_description: currentTranslation?.short_description || project.short_description,
          full_description: currentTranslation?.full_description || project.full_description,
          meta_description: currentTranslation?.meta_description || project.meta_description,
        }
      }
    })

    // Filter by technology or tag if specified (post-query filtering)
    let filteredProjects = projects
    if (technology) {
      filteredProjects = filteredProjects?.filter((p: any) => 
        p.technologies?.some((t: any) => t.slug === technology)
      )
    }
    if (tag) {
      filteredProjects = filteredProjects?.filter((p: any) => 
        p.tags?.some((t: any) => t.slug === tag)
      )
    }

    return NextResponse.json({
      data: filteredProjects,
      total: count || 0,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/projects - Create a new project
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { technology_ids, tag_ids, translations, images, ...projectData } = body

    // Validate required fields
    if (!translations?.pt?.title || !projectData.slug) {
      return NextResponse.json({ error: 'Título (PT-BR) e slug são obrigatórios' }, { status: 400 })
    }

    // Create the project with basic data (use PT title for legacy field)
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        ...projectData,
        title: translations.pt.title,
        subtitle: translations.pt.subtitle,
        short_description: translations.pt.short_description,
        full_description: translations.pt.full_description,
        meta_description: translations.pt.meta_description,
        language: 'pt-BR',
      })
      .select()
      .single()

    if (projectError) {
      return NextResponse.json({ error: projectError.message }, { status: 500 })
    }

    const projectId = (project as any).id

    // Add PT-BR translation
    await (supabase.from('project_translations') as any).insert({
      project_id: projectId,
      language: 'pt-BR',
      title: translations.pt.title,
      subtitle: translations.pt.subtitle || null,
      short_description: translations.pt.short_description || null,
      full_description: translations.pt.full_description || null,
      meta_description: translations.pt.meta_description || null,
    })

    // Add EN translation if provided
    if (translations.en?.title) {
      await (supabase.from('project_translations') as any).insert({
        project_id: projectId,
        language: 'en',
        title: translations.en.title,
        subtitle: translations.en.subtitle || null,
        short_description: translations.en.short_description || null,
        full_description: translations.en.full_description || null,
        meta_description: translations.en.meta_description || null,
      })
    }

    // Add technologies if provided
    if (technology_ids && technology_ids.length > 0) {
      const projectTechnologies = technology_ids.map((tech_id: number) => ({
        project_id: projectId,
        technology_id: tech_id,
      }))
      await supabase.from('project_technologies').insert(projectTechnologies)
    }

    // Add tags if provided
    if (tag_ids && tag_ids.length > 0) {
      const projectTags = tag_ids.map((tag_id: number) => ({
        project_id: projectId,
        tag_id,
      }))
      await supabase.from('project_tags').insert(projectTags)
    }

    // Add gallery images if provided
    if (images && images.length > 0) {
      const projectImages = images.map((img: any, index: number) => ({
        project_id: projectId,
        image_url: img.image_url,
        caption: img.caption || null,
        display_order: img.display_order ?? index,
      }))
      await supabase.from('project_images').insert(projectImages)
    }

    revalidateTag('projects', 'default')

    return NextResponse.json({ data: project }, { status: 201 })
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
