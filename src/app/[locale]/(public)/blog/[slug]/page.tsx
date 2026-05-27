import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { MarkdownRenderer } from '@/components/blog/markdown-renderer'
import { getLocale, getTranslations, setRequestLocale } from 'next-intl/server'
import { Link } from '@/navigation'
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Eye,
  Share2,
  Twitter,
  Linkedin,
  Facebook
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cache } from 'react'
import { getCachedArticleBySlug, getCachedSitemapArticles } from '@/lib/supabase/cached'
import { ViewCounter } from '@/components/blog/view-counter'
import { routing } from '@/i18n/routing'

interface ArticlePageProps {
  params: Promise<{ slug: string; locale: string }>
}

// Request-scoped cache to deduplicate fetches between metadata generation and rendering
const getArticle = cache(async (slug: string) => {
  try {
    return await getCachedArticleBySlug(slug)
  } catch (error) {
    console.error('Error loading article by slug:', error)
    return null
  }
})

export async function generateStaticParams() {
  try {
    const articles = (await getCachedSitemapArticles()) as any[]
    return routing.locales.flatMap((locale) =>
      articles.map((article) => ({
        locale,
        slug: article.slug,
      }))
    )
  } catch (error) {
    console.error('Error generating static params for blog:', error)
    return []
  }
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug, locale } = await params
  const article = await getArticle(slug)

  if (!article) {
    return { title: locale === 'en' ? 'Article not found' : 'Artigo não encontrado' }
  }

  const articleData = article as {
    title: string
    summary: string | null
    meta_description: string | null
    cover_image_url: string | null
    translations?: Array<{ language: string; title?: string; meta_description?: string | null; summary?: string | null }>
  }

  const translations = (articleData.translations || []) as Array<{ language: string; title?: string; meta_description?: string | null; summary?: string | null }>
  const ptTranslation = translations.find((tr) => tr.language === 'pt-BR')
  const enTranslation = translations.find((tr) => tr.language === 'en')
  const currentTranslation = locale === 'en' ? enTranslation || ptTranslation : ptTranslation

  const title = currentTranslation?.title || articleData.title
  const description =
    currentTranslation?.meta_description ||
    currentTranslation?.summary ||
    articleData.meta_description ||
    articleData.summary ||
    ''

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      images: articleData.cover_image_url ? [articleData.cover_image_url] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: articleData.cover_image_url ? [articleData.cover_image_url] : [],
    },
  }
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug, locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('blogArticle')

  // Get article with relations from the cached layer
  const articleData = await getArticle(slug)

  if (!articleData) {
    notFound()
  }

  // Type assertion for the data
  const typedArticleData = articleData as any

  // Transform the data
  const article = {
    ...typedArticleData,
    tags: (typedArticleData.tags as Array<{ tag: unknown }> | null)?.map((at) => at.tag).filter(Boolean) || [],
    projects: (typedArticleData.projects as Array<{ project: unknown }> | null)?.map((ap) => ap.project).filter(Boolean) || [],
  }

  const translations = (article.translations || []) as Array<{ language: string; title?: string; summary?: string | null; content?: string; meta_description?: string | null }>
  const ptTranslation = translations.find((tr) => tr.language === 'pt-BR')
  const enTranslation = translations.find((tr) => tr.language === 'en')
  const currentTranslation = locale === 'en' ? enTranslation || ptTranslation : ptTranslation

  if (currentTranslation) {
    article.title = currentTranslation.title || article.title
    article.summary = currentTranslation.summary || article.summary
    article.content = currentTranslation.content || article.content
    article.meta_description = currentTranslation.meta_description || article.meta_description
  }

  const categoryTranslations = (article.category?.translations || []) as Array<{ language: string; name?: string; description?: string | null }>
  const ptCategory = categoryTranslations.find((tr) => tr.language === 'pt-BR')
  const enCategory = categoryTranslations.find((tr) => tr.language === 'en')
  const currentCategory = locale === 'en' ? enCategory || ptCategory : ptCategory

  if (article.category && currentCategory) {
    article.category.name = currentCategory.name || article.category.name
    article.category.description =
      currentCategory.description || article.category.description
  }

  // Render client-side view counter instead of server-side mutation
  const renderViewCounter = <ViewCounter id={article.id} type="article" />

  const authorInitials = article.author?.full_name
    ?.split(' ')
    .map((n: string) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'AU'

  const publishedDate = article.published_at
    ? new Date(article.published_at).toLocaleDateString(locale === 'en' ? 'en-US' : 'pt-BR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null

  return (
    <article className="container py-12 md:py-16">
      {renderViewCounter}
      {/* Back button */}
      <Link
        href="/blog"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('back')}
      </Link>

      <div className="max-w-4xl mx-auto">
        {/* Category Badge */}
        {article.category && (
          <Badge
            className="mb-4"
            style={{
              backgroundColor: article.category.color_hex,
              color: '#fff',
            }}
          >
            {article.category.name}
          </Badge>
        )}

        {/* Title */}
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
          {article.title}
        </h1>

        {/* Meta Info */}
        <div className="flex flex-wrap items-center gap-6 mb-8 text-muted-foreground">
          {/* Author */}
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={article.author?.avatar_url || undefined} />
              <AvatarFallback>{authorInitials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-foreground">
                {article.author?.full_name || 'Autor'}
              </p>
              {publishedDate && (
                <p className="text-sm">{publishedDate}</p>
              )}
            </div>
          </div>

          <Separator orientation="vertical" className="h-8" />

          {/* Reading Time */}
          {article.reading_time_minutes && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{article.reading_time_minutes} min de leitura</span>
            </div>
          )}

          {/* Views */}
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            <span>{article.views_count} visualizações</span>
          </div>
        </div>

        {/* Cover Image */}
        {article.cover_image_url && (
          <div className="relative aspect-video rounded-xl overflow-hidden border border-border mb-10">
            <Image
              src={article.cover_image_url}
              alt={article.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-10">
            {article.tags.map((tag: any) => (
              <Link key={tag.id} href={`/blog?tag=${tag.slug}` as any}>
                <Badge variant="secondary" className="hover:bg-accent">
                  #{tag.name}
                </Badge>
              </Link>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="mb-12">
          <MarkdownRenderer content={article.content} />
        </div>

        <Separator className="my-10" />

        {/* Related Projects */}
        {article.projects && article.projects.length > 0 && (
          <div className="mb-10">
            <h2 className="text-2xl font-bold mb-6">Projetos Relacionados</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {article.projects.map((project: any) => (
                <Link key={project.id} href={`/projetos/${project.slug}` as any}>
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4 flex items-center gap-4">
                      {project.cover_image_url && (
                        <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0">
                          <Image
                            src={project.cover_image_url}
                            alt={project.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold hover:text-primary transition-colors">
                          {project.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Ver projeto →
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Author Card */}
        {article.author && (
          <Card className="bg-muted/50">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={article.author.avatar_url || undefined} />
                  <AvatarFallback className="text-xl">{authorInitials}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-bold text-lg">{article.author.full_name}</h3>
                  {article.author.bio && (
                    <p className="text-muted-foreground mt-1">
                      {article.author.bio}
                    </p>
                  )}
                  <div className="flex gap-2 mt-3">
                    {article.author.github_url && (
                      <Button asChild variant="ghost" size="sm">
                        <a href={article.author.github_url} target="_blank" rel="noopener noreferrer">
                          GitHub
                        </a>
                      </Button>
                    )}
                    {article.author.linkedin_url && (
                      <Button asChild variant="ghost" size="sm">
                        <a href={article.author.linkedin_url} target="_blank" rel="noopener noreferrer">
                          LinkedIn
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </article>
  )
}
