import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { calculateReadingTime } from '@/lib/utils/reading-time'
import type { ArticleQueryResponse, ArticleTranslation, Tag } from '@/lib/types/database'

// GET /api/articles - List all articles
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const tag = searchParams.get('tag')
    const lang = searchParams.get('lang') || 'pt-BR'
    const include_translations = searchParams.get('include_translations') === 'true'
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('articles')
      .select(`
        *,
        author:profiles(*),
        category:categories(*),
        tags:article_tags(
          tag:tags(*)
        ),
        projects:article_projects(
          project:projects(id, title, slug)
        ),
        translations:article_translations(*)
      `, { count: 'exact' })
      .order('published_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) {
      query = query.eq('status', status)
    }
    if (category) {
      query = query.eq('category.slug', category)
    }

    const { data, error, count } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Transform the data
    const articles = (data as any)?.map((article: any) => {
      const translations = (article.translations || []) as ArticleTranslation[]
      const ptTranslation = translations.find((t) => t.language === 'pt-BR')
      const enTranslation = translations.find((t) => t.language === 'en')
      const currentTranslation = lang === 'en' ? (enTranslation || ptTranslation) : ptTranslation

      const baseArticle = {
        ...article,
        tags: (article.tags as any)?.map((at: any) => at.tag).filter((t: any): t is Tag => t !== null) || [],
        projects: (article.projects as any)?.map((ap: any) => ap.project).filter((p: any) => p !== null) || [],
      }

      if (include_translations) {
        return {
          ...baseArticle,
          translations: {
            pt: ptTranslation || null,
            en: enTranslation || null,
          },
        }
      } else {
        return {
          ...baseArticle,
          title: currentTranslation?.title || article.title,
          content: currentTranslation?.content || article.content,
          summary: currentTranslation?.summary || article.summary,
          excerpt: currentTranslation?.excerpt || article.excerpt,
          meta_description: currentTranslation?.meta_description || article.meta_description,
        }
      }
    })

    // Filter by tag if specified
    let filteredArticles = articles
    if (tag) {
      filteredArticles = filteredArticles?.filter((a: any) =>
        a.tags?.some((t: any) => t.slug === tag)
      )
    }

    return NextResponse.json({
      data: filteredArticles,
      total: count || 0,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Error fetching articles:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/articles - Create a new article
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { tag_ids, project_ids, translations, ...articleData } = body

    // Validate required fields
    if (!translations?.pt?.title || !translations?.pt?.content || !articleData.slug) {
      return NextResponse.json({ error: 'Título, conteúdo (PT-BR) e slug são obrigatórios' }, { status: 400 })
    }

    // Calculate reading time based on PT content
    const reading_time_minutes = calculateReadingTime(translations.pt.content)

    // Create the article with PT translation as default
    const { data: article, error: articleError } = await supabase
      .from('articles')
      .insert({
        ...articleData,
        author_id: user.id,
        title: translations.pt.title,
        content: translations.pt.content,
        summary: translations.pt.summary,
        excerpt: translations.pt.excerpt,
        meta_description: translations.pt.meta_description,
        reading_time_minutes,
        language: 'pt-BR',
      })
      .select()
      .single()

    if (articleError) {
      return NextResponse.json({ error: articleError.message }, { status: 500 })
    }

    // Add PT-BR translation
    await (supabase.from('article_translations') as any).insert({
      article_id: (article as any).id,
      language: 'pt-BR',
      title: translations.pt.title,
      content: translations.pt.content,
      summary: translations.pt.summary || null,
      excerpt: translations.pt.excerpt || null,
      meta_description: translations.pt.meta_description || null,
    })

    // Add EN translation if provided
    if (translations.en?.title && translations.en?.content) {
      await (supabase.from('article_translations') as any).insert({
        article_id: (article as any).id,
        language: 'en',
        title: translations.en.title,
        content: translations.en.content,
        summary: translations.en.summary || null,
        excerpt: translations.en.excerpt || null,
        meta_description: translations.en.meta_description || null,
      })
    }

    // Add tags if provided
    if (tag_ids && tag_ids.length > 0) {
      const articleTags = tag_ids.map((tag_id: number) => ({
        article_id: (article as any).id,
        tag_id,
      }))
      await supabase.from('article_tags').insert(articleTags)
    }

    // Add related projects if provided
    if (project_ids && project_ids.length > 0) {
      const articleProjects = project_ids.map((project_id: number) => ({
        article_id: (article as any).id,
        project_id,
      }))
      await supabase.from('article_projects').insert(articleProjects)
    }

    revalidateTag('articles', 'default')

    return NextResponse.json({ data: article }, { status: 201 })
  } catch (error) {
    console.error('Error creating article:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
