import { Suspense } from 'react'
import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { getCachedArticles } from '@/lib/supabase/cached'
import { ArticleCard } from '@/components/blog/article-card'
import { EmptyFeed } from '@/components/blog/empty-feed'
import styles from '@/components/blog/editorial.module.css'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Artigos sobre desenvolvimento web, programação, tecnologia e dicas para desenvolvedores.',
}

interface BlogPageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ category?: string; tag?: string }>
}

async function ArticlesGrid({ category, tag, locale }: { category?: string; tag?: string; locale: string }) {
  let articlesData: any[] = []
  try {
    articlesData = await getCachedArticles()
  } catch (error) {
    console.error('Error fetching articles from cache:', error)
  }

  if (category) {
    articlesData = articlesData.filter((article: any) => article.category?.slug === category)
  }

  let articles = articlesData.map((article: any) => {
    const translations = (article.translations || []) as Array<{
      language: string
      title?: string
      summary?: string
      content?: string
      meta_description?: string
    }>
    const ptTranslation = translations.find((translation) => translation.language === 'pt-BR')
    const enTranslation = translations.find((translation) => translation.language === 'en')
    const currentTranslation = locale === 'en' ? enTranslation || ptTranslation : ptTranslation

    const categoryTranslations = (article.category?.translations || []) as Array<{
      language: string
      name?: string
      description?: string | null
    }>
    const ptCategory = categoryTranslations.find((translation) => translation.language === 'pt-BR')
    const enCategory = categoryTranslations.find((translation) => translation.language === 'en')
    const currentCategory = locale === 'en' ? enCategory || ptCategory : ptCategory

    return {
      ...article,
      tags: (article.tags as Array<{ tag: { slug?: string } | null }> | undefined)
        ?.map((articleTag) => articleTag.tag)
        .filter(Boolean) || [],
      title: currentTranslation?.title || article.title,
      summary: currentTranslation?.summary || article.summary,
      content: currentTranslation?.content || article.content,
      meta_description: currentTranslation?.meta_description || article.meta_description,
      category: article.category
        ? {
            ...article.category,
            name: currentCategory?.name || article.category.name,
            description: currentCategory?.description || article.category.description,
          }
        : null,
    }
  })

  if (tag) {
    articles = articles.filter((article: any) =>
      article.tags?.some((articleTag: { slug?: string }) => articleTag.slug === tag)
    )
  }

  if (articles.length === 0) {
    return (
      <div className={styles.articleGrid}>
        <EmptyFeed filter={category || tag} />
      </div>
    )
  }

  return (
    <div className={styles.articleGrid}>
      {articles.map((article: any, index: number) => (
        <ArticleCard key={article.id} article={article} index={index} locale={locale} />
      ))}
    </div>
  )
}

function ArticlesLoading() {
  return (
    <div className={styles.articleGrid} aria-label="Carregando artigos" aria-busy="true">
      {[0, 1, 2].map((index) => (
        <div className={styles.loadingCard} key={index}>
          <div className={styles.loadingMedia} />
          <div className={styles.loadingBody}>
            <div className={styles.loadingLine} />
            <div className={styles.loadingLine} />
            <div className={styles.loadingLine} />
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
  const isEnglish = locale === 'en'
  const activeFilter = category || tag

  return (
    <main className={styles.blogPage}>
      <div className={styles.shell}>
        <header className={styles.masthead}>
          <div className={styles.kicker}>
            {isEnglish ? 'Independent field notes' : 'Caderno independente'}
          </div>

          <div className={styles.titleBlock}>
            <h1 className={styles.title} aria-label={`${t('title')} — ${isEnglish ? 'Field notes' : 'Notas de campo'}`}>
              <span>{t('title')}</span>
              <span className={styles.titleGhost} aria-hidden="true">
                {isEnglish ? 'Field notes' : 'Notas de campo'}
              </span>
            </h1>
          </div>

          <div className={styles.mastheadMeta} aria-label={isEnglish ? 'Topics' : 'Temas'}>
            <span className={styles.feedCount}>{t('topics.practice')}</span>
            <span className={styles.mastheadMetaLine} aria-hidden="true" />
            <span className={styles.feedCount}>{t('topics.life')}</span>
          </div>

          <p className={styles.mastheadAside}>{t('subtitle')}</p>
        </header>

        <section aria-labelledby="latest-notes">
          <div className={styles.feedHeader}>
            <h2 className={styles.sectionLabel} id="latest-notes">
              {isEnglish ? 'Latest notes' : 'Últimas notas'}
            </h2>
            <div className={styles.feedTools}>
              <span className={styles.feedCount}>{isEnglish ? 'Selected writing / 2026' : 'Escritos selecionados / 2026'}</span>
              {activeFilter && (
                <span className={styles.filterChip} title={activeFilter}>
                  {category ? 'CATEGORY' : 'TAG'} / {activeFilter}
                </span>
              )}
            </div>
          </div>

          <Suspense fallback={<ArticlesLoading />}>
            <ArticlesGrid category={category} tag={tag} locale={locale} />
          </Suspense>
        </section>
      </div>
    </main>
  )
}
