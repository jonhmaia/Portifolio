import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { calculateReadingTime } from '@/lib/utils/reading-time'
import type { ArticleQueryResponse, ArticleTranslation, Tag, Project } from '@/lib/types/database'

// GET /api/articles/[id] - Get a single article
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
      .from('articles')
      .select(`
        *,
        author:profiles(*),
        category:categories(*),
        tags:article_tags(
          tag:tags(*)
        ),
        projects:article_projects(
          project:projects(id, title, slug, cover_image_url)
        ),
        translations:article_translations(*)
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Article not found' }, { status: 404 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const typedData = data as any

    const translations = (typedData.translations || []) as ArticleTranslation[]
    const ptTranslation = translations.find((t) => t.language === 'pt-BR')
    const enTranslation = translations.find((t) => t.language === 'en')
    const currentTranslation = lang === 'en' ? (enTranslation || ptTranslation) : ptTranslation

    // Get IDs for the form
    const tag_ids = (typedData.tags as any)?.map((at: any) => at.tag?.id).filter((id: any): id is number => Boolean(id)) || []
    const project_ids = (typedData.projects as any)?.map((ap: any) => ap.project?.id).filter((id: any): id is number => Boolean(id)) || []

    const baseArticle = {
      ...typedData,
      tags: (typedData.tags as any)?.map((at: any) => at.tag).filter((t: any): t is Tag => t !== null && t !== undefined) || [],
      projects: (typedData.projects as any)?.map((ap: any) => ap.project).filter((p: any): p is Pick<Project, 'id' | 'title' | 'slug' | 'cover_image_url'> => p !== null && p !== undefined) || [],
      tag_ids,
      project_ids,
    }

    if (include_translations) {
      return NextResponse.json({
        data: {
          ...baseArticle,
          translations: {
            pt: ptTranslation || null,
            en: enTranslation || null,
          },
        },
      })
    } else {
      return NextResponse.json({
        data: {
          ...baseArticle,
          title: currentTranslation?.title || typedData.title,
          content: currentTranslation?.content || typedData.content,
          summary: currentTranslation?.summary || typedData.summary,
          excerpt: currentTranslation?.excerpt || typedData.excerpt,
          meta_description: currentTranslation?.meta_description || typedData.meta_description,
        },
      })
    }
  } catch (error) {
    console.error('Error fetching article:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/articles/[id] - Update an article
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
    const { tag_ids, project_ids, translations, ...articleData } = body

    // Validate required fields
    if (!translations?.pt?.title || !translations?.pt?.content) {
      return NextResponse.json({ error: 'Título e conteúdo (PT-BR) são obrigatórios' }, { status: 400 })
    }

    // Calculate reading time based on PT content
    const reading_time_minutes = calculateReadingTime(translations.pt.content)

    // Update the article with PT translation
    const { data: article, error: articleError } = await ((supabase
      .from('articles') as any)
      .update({
        ...articleData,
        title: translations.pt.title,
        content: translations.pt.content,
        summary: translations.pt.summary,
        excerpt: translations.pt.excerpt,
        meta_description: translations.pt.meta_description,
        reading_time_minutes,
      })
      .eq('id', id)
      .select()
      .single())

    if (articleError) {
      return NextResponse.json({ error: articleError.message }, { status: 500 })
    }

    // Update PT-BR translation (upsert)
    await (supabase.from('article_translations') as any).upsert({
      article_id: parseInt(id),
      language: 'pt-BR',
      title: translations.pt.title,
      content: translations.pt.content,
      summary: translations.pt.summary || null,
      excerpt: translations.pt.excerpt || null,
      meta_description: translations.pt.meta_description || null,
    }, { onConflict: 'article_id,language' })

    // Handle EN translation
    if (translations.en?.title && translations.en?.content) {
      await (supabase.from('article_translations') as any).upsert({
        article_id: parseInt(id),
        language: 'en',
        title: translations.en.title,
        content: translations.en.content,
        summary: translations.en.summary || null,
        excerpt: translations.en.excerpt || null,
        meta_description: translations.en.meta_description || null,
      }, { onConflict: 'article_id,language' })
    } else {
      // Remove EN translation if not provided
      await supabase
        .from('article_translations')
        .delete()
        .eq('article_id', id)
        .eq('language', 'en')
    }

    // Update tags if provided
    if (tag_ids !== undefined) {
      await supabase.from('article_tags').delete().eq('article_id', id)
      
      if (tag_ids.length > 0) {
        const articleTags = tag_ids.map((tag_id: number) => ({
          article_id: parseInt(id),
          tag_id,
        }))
        await (supabase.from('article_tags') as any).insert(articleTags)
      }
    }

    // Update related projects if provided
    if (project_ids !== undefined) {
      await supabase.from('article_projects').delete().eq('article_id', id)
      
      if (project_ids.length > 0) {
        const articleProjects = project_ids.map((project_id: number) => ({
          article_id: parseInt(id),
          project_id,
        }))
        await supabase.from('article_projects').insert(articleProjects)
      }
    }

    revalidateTag('articles', 'default')
    if ((article as any)?.slug) {
      revalidateTag(`article-${(article as any).slug}`, 'default')
    }

    return NextResponse.json({ data: article })
  } catch (error) {
    console.error('Error updating article:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/articles/[id] - Delete an article
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

    // Translations are deleted automatically via CASCADE
    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    revalidateTag('articles', 'default')

    return NextResponse.json({ message: 'Article deleted successfully' })
  } catch (error) {
    console.error('Error deleting article:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
