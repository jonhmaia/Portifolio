import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ProjectQueryResponse, ProjectTranslation, Technology, Tag } from '@/lib/types/database'

// GET /api/projects/[id] - Get a single project
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const lang = searchParams.get('lang') || 'pt-BR'
    const include_translations = searchParams.get('include_translations') === 'true'

    const { data, error } = await supabase
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
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const typedData = data as any

    // Get translations
    const translations = (typedData.translations || []) as ProjectTranslation[]
    const ptTranslation = translations.find((t) => t.language === 'pt-BR')
    const enTranslation = translations.find((t) => t.language === 'en')
    const currentTranslation = lang === 'en' ? (enTranslation || ptTranslation) : ptTranslation

    // Get technology and tag IDs for the form
    const technology_ids = (typedData.technologies as any)?.map((pt: any) => pt.technology?.id).filter((id: any): id is number => Boolean(id)) || []
    const tag_ids = (typedData.tags as any)?.map((pt: any) => pt.tag?.id).filter((id: any): id is number => Boolean(id)) || []

    // Sort images by display_order
    const sortedImages = (typedData.images || []).sort((a: any, b: any) => a.display_order - b.display_order)

    const baseProject = {
      ...typedData,
      technologies: (typedData.technologies as any)?.map((pt: any) => pt.technology).filter((t: any): t is Technology => t !== null && t !== undefined) || [],
      tags: (typedData.tags as any)?.map((pt: any) => pt.tag).filter((t: any): t is Tag => t !== null && t !== undefined) || [],
      images: sortedImages,
      technology_ids,
      tag_ids,
    }

    if (include_translations) {
      // Return all translations for admin
      return NextResponse.json({
        data: {
          ...baseProject,
          translations: {
            pt: ptTranslation || null,
            en: enTranslation || null,
          },
        },
      })
    } else {
      // Return merged data with current language translation
      return NextResponse.json({
        data: {
          ...baseProject,
          title: currentTranslation?.title || typedData.title,
          subtitle: currentTranslation?.subtitle || typedData.subtitle,
          short_description: currentTranslation?.short_description || typedData.short_description,
          full_description: currentTranslation?.full_description || typedData.full_description,
          meta_description: currentTranslation?.meta_description || typedData.meta_description,
        },
      })
    }
  } catch (error) {
    console.error('Error fetching project:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/projects/[id] - Update a project
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { technology_ids, tag_ids, translations, images, ...projectData } = body

    // Validate required fields
    if (!translations?.pt?.title) {
      return NextResponse.json({ error: 'Título (PT-BR) é obrigatório' }, { status: 400 })
    }

    const projectId = parseInt(id)

    // Update the project (update legacy fields with PT translation)
    const { data: project, error: projectError } = await ((supabase
      .from('projects') as any)
      .update({
        ...projectData,
        title: translations.pt.title,
        subtitle: translations.pt.subtitle,
        short_description: translations.pt.short_description,
        full_description: translations.pt.full_description,
        meta_description: translations.pt.meta_description,
      })
      .eq('id', id)
      .select()
      .single())

    if (projectError) {
      return NextResponse.json({ error: projectError.message }, { status: 500 })
    }

    // Update PT-BR translation (upsert)
    await (supabase.from('project_translations') as any).upsert({
      project_id: projectId,
      language: 'pt-BR',
      title: translations.pt.title,
      subtitle: translations.pt.subtitle || null,
      short_description: translations.pt.short_description || null,
      full_description: translations.pt.full_description || null,
      meta_description: translations.pt.meta_description || null,
    }, { onConflict: 'project_id,language' })

    // Handle EN translation
    if (translations.en?.title) {
      await (supabase.from('project_translations') as any).upsert({
        project_id: projectId,
        language: 'en',
        title: translations.en.title,
        subtitle: translations.en.subtitle || null,
        short_description: translations.en.short_description || null,
        full_description: translations.en.full_description || null,
        meta_description: translations.en.meta_description || null,
      }, { onConflict: 'project_id,language' })
    } else {
      // Remove EN translation if not provided
      await supabase
        .from('project_translations')
        .delete()
        .eq('project_id', id)
        .eq('language', 'en')
    }

    // Update technologies if provided
    if (technology_ids !== undefined) {
      await supabase.from('project_technologies').delete().eq('project_id', id)
      
      if (technology_ids.length > 0) {
        const projectTechnologies = technology_ids.map((tech_id: number) => ({
          project_id: projectId,
          technology_id: tech_id,
        }))
        await (supabase.from('project_technologies') as any).insert(projectTechnologies)
      }
    }

    // Update tags if provided
    if (tag_ids !== undefined) {
      await supabase.from('project_tags').delete().eq('project_id', id)
      
      if (tag_ids.length > 0) {
        const projectTags = tag_ids.map((tag_id: number) => ({
          project_id: projectId,
          tag_id,
        }))
        await (supabase.from('project_tags') as any).insert(projectTags)
      }
    }

    // Update gallery images if provided
    if (images !== undefined) {
      // Get existing images
      const { data: existingImages } = await supabase
        .from('project_images')
        .select('id')
        .eq('project_id', projectId)

      const existingIds = existingImages?.map((img: any) => img.id) || []
      const newImageIds = images.filter((img: any) => img.id).map((img: any) => img.id)
      
      // Delete images that are no longer in the list
      const idsToDelete = existingIds.filter((id: number) => !newImageIds.includes(id))
      if (idsToDelete.length > 0) {
        await supabase
          .from('project_images')
          .delete()
          .in('id', idsToDelete)
      }

      // Update or insert images
      for (const img of images) {
        if (img.id && existingIds.includes(img.id)) {
          // Update existing image
          await (supabase
            .from('project_images') as any)
            .update({
              caption: img.caption || null,
              display_order: img.display_order,
            })
            .eq('id', img.id)
        } else {
          // Insert new image
          await (supabase
            .from('project_images') as any)
            .insert({
              project_id: projectId,
              image_url: img.image_url,
              caption: img.caption || null,
              display_order: img.display_order,
            })
        }
      }
    }

    revalidateTag('projects', 'default')
    if ((project as any)?.slug) {
      revalidateTag(`project-${(project as any).slug}`, 'default')
    }

    return NextResponse.json({ data: project })
  } catch (error) {
    console.error('Error updating project:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/projects/[id] - Delete a project
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Translations and images are deleted automatically via CASCADE
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    revalidateTag('projects', 'default')

    return NextResponse.json({ message: 'Project deleted successfully' })
  } catch (error) {
    console.error('Error deleting project:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
