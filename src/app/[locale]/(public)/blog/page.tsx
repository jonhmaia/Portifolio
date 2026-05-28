import { Suspense } from 'react'
import { Metadata } from 'next'
import { getCachedArticles } from '@/lib/supabase/cached'
import { ArticleCard } from '@/components/blog/article-card'
import { Skeleton } from '@/components/ui/skeleton'
import { FileText } from 'lucide-react'
import { getLocale, getTranslations, setRequestLocale } from 'next-intl/server'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Artigos sobre desenvolvimento web, programação, tecnologia e dicas para desenvolvedores.',
}

interface BlogPageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ category?: string; tag?: string }>
}

async function ArticlesGrid({ category, tag, locale }: { category?: string; tag?: string; locale: string }) {
  const t = await getTranslations('blog')

  let articlesData: any[] = []
  try {
    articlesData = await getCachedArticles()
  } catch (error) {
    console.error('Error fetching articles from cache:', error)
  }

  if (category) {
    articlesData = articlesData.filter((a: any) => a.category?.slug === category)
  }

  // Transform and filter articles
  let articles =
    (articlesData as any)?.map((article: any) => {
      const translations = (article.translations || []) as Array<{ language: string; title?: string; summary?: string; content?: string; meta_description?: string }>
      const ptTranslation = translations.find((tr) => tr.language === 'pt-BR')
      const enTranslation = translations.find((tr) => tr.language === 'en')
      const currentTranslation = locale === 'en' ? enTranslation || ptTranslation : ptTranslation

      const categoryTranslations = (article.category?.translations || []) as Array<{ language: string; name?: string; description?: string | null }>
      const ptCategory = categoryTranslations.find((tr) => tr.language === 'pt-BR')
      const enCategory = categoryTranslations.find((tr) => tr.language === 'en')
      const currentCategory = locale === 'en' ? enCategory || ptCategory : ptCategory

      return {
        ...article,
        tags: (article.tags as any)?.map((at: { tag: { slug?: string } | null }) => at.tag).filter(Boolean) || [],
        title: currentTranslation?.title || (article as any).title,
        summary: currentTranslation?.summary || (article as any).summary,
        content: currentTranslation?.content || (article as any).content,
        meta_description: currentTranslation?.meta_description || (article as any).meta_description,
        category: article.category
          ? {
              ...article.category,
              name: currentCategory?.name || (article.category as any).name,
              description: currentCategory?.description || (article.category as any).description,
            }
          : null,
      }
    }) || []

  if (tag) {
    articles = articles.filter((a: any) =>
      a.tags?.some((t: { slug?: string }) => t.slug === tag)
    )
  }

  if (articles.length === 0) {
    return (
      <div className="text-center py-16">
        <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">{t('empty.title')}</h3>
        <p className="text-muted-foreground">
          {category || tag
            ? t('empty.filtered')
            : t('empty.default')}
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {articles.map((article: any) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  )
}

function ArticlesLoading() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="rounded-2xl border-none bg-black/40 overflow-hidden shadow-xl">
          <Skeleton className="aspect-[16/10] w-full" />
          <div className="p-4 space-y-3">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="flex justify-between items-center pt-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default async function BlogPage({ params, searchParams }: BlogPageProps) {
  const { locale } = await params
  setRequestLocale(locale)
  const { category, tag } = await searchParams
  const t = await getTranslations('blog')

  return (
    <div className="relative min-h-screen pt-24 md:pt-32 pb-12 flex flex-col">
      <div className="container relative z-10 flex-1 animate-in fade-in duration-500 max-w-6xl mx-auto">
        <div className="bg-black/20 backdrop-blur-md shadow-2xl rounded-3xl p-8 md:p-12 border-none">
          {/* Header */}
          <div className="max-w-2xl mx-auto text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-white uppercase drop-shadow-lg">{t('title')}</h1>
            <p className="text-white/60 text-lg md:text-xl leading-relaxed font-light">
              {t('subtitle')}
            </p>
          </div>

      {/* Articles Grid */}
      <Suspense fallback={<ArticlesLoading />}>
        <ArticlesGrid category={category} tag={tag} locale={locale} />
      </Suspense>
        </div>
      </div>
    </div>
  )
}
