import type { CSSProperties } from 'react'
import { cache } from 'react'
import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { ArrowLeft, CalendarDays, Clock, Eye } from 'lucide-react'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Link } from '@/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MarkdownRenderer } from '@/components/blog/markdown-renderer'
import { ArticleReadingSurface } from '@/components/blog/article-reading-surface'
import { ViewCounter } from '@/components/blog/view-counter'
import { getCachedArticleBySlug, getCachedSitemapArticles } from '@/lib/supabase/cached'
import { routing } from '@/i18n/routing'
import styles from '@/components/blog/editorial.module.css'

const AUTHOR_PORTRAIT = '/joao-maia.jpg'

interface ArticlePageProps {
  params: Promise<{ slug: string; locale: string }>
}

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
    translations?: Array<{
      language: string
      title?: string
      meta_description?: string | null
      summary?: string | null
    }>
  }
  const translations = articleData.translations || []
  const ptTranslation = translations.find((translation) => translation.language === 'pt-BR')
  const enTranslation = translations.find((translation) => translation.language === 'en')
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
  const articleData = await getArticle(slug)

  if (!articleData) {
    notFound()
  }

  const typedArticleData = articleData as any
  const article = {
    ...typedArticleData,
    tags: (typedArticleData.tags as Array<{ tag: unknown }> | null)
      ?.map((articleTag) => articleTag.tag)
      .filter(Boolean) || [],
    projects: (typedArticleData.projects as Array<{ project: unknown }> | null)
      ?.map((articleProject) => articleProject.project)
      .filter(Boolean) || [],
  }

  const translations = (article.translations || []) as Array<{
    language: string
    title?: string
    summary?: string | null
    content?: string
    meta_description?: string | null
  }>
  const ptTranslation = translations.find((translation) => translation.language === 'pt-BR')
  const enTranslation = translations.find((translation) => translation.language === 'en')
  const currentTranslation = locale === 'en' ? enTranslation || ptTranslation : ptTranslation

  if (currentTranslation) {
    article.title = currentTranslation.title || article.title
    article.summary = currentTranslation.summary || article.summary
    article.content = currentTranslation.content || article.content
    article.meta_description = currentTranslation.meta_description || article.meta_description
  }

  const categoryTranslations = (article.category?.translations || []) as Array<{
    language: string
    name?: string
    description?: string | null
  }>
  const ptCategory = categoryTranslations.find((translation) => translation.language === 'pt-BR')
  const enCategory = categoryTranslations.find((translation) => translation.language === 'en')
  const currentCategory = locale === 'en' ? enCategory || ptCategory : ptCategory

  if (article.category && currentCategory) {
    article.category.name = currentCategory.name || article.category.name
    article.category.description = currentCategory.description || article.category.description
  }

  const isEnglish = locale === 'en'
  const copy = isEnglish
    ? {
        article: 'Journal entry',
        writtenBy: 'Written by',
        date: 'Published',
        reading: 'Reading time',
        views: 'Views',
        minutes: 'min read',
        topics: 'Topics / index',
        related: 'Related projects',
        project: 'View project',
      }
    : {
        article: 'Entrada do caderno',
        writtenBy: 'Escrito por',
        date: 'Publicado',
        reading: 'Tempo de leitura',
        views: 'Visualizações',
        minutes: 'min de leitura',
        topics: 'Tópicos / índice',
        related: 'Projetos relacionados',
        project: 'Ver projeto',
      }
  const authorInitials = article.author?.full_name
    ?.split(' ')
    .map((name: string) => name[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'AU'
  const publishedDate = article.published_at
    ? new Intl.DateTimeFormat(isEnglish ? 'en-US' : 'pt-BR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(new Date(article.published_at))
    : null
  const categoryStyle = article.category
    ? ({ '--category-color': article.category.color_hex } as CSSProperties)
    : undefined

  return (
    <article className={styles.articlePage}>
      <ViewCounter id={article.id} type="article" />

      <header className={styles.articleHero}>
        <div className={`${styles.shell} ${styles.articleHeroGrid}`}>
          <Link href="/blog" className={styles.backLink}>
            <ArrowLeft aria-hidden="true" size={15} />
            {t('back')}
          </Link>

          <div className={styles.articleCategory} style={categoryStyle}>
            {article.category?.name || copy.article}
          </div>

          <h1 className={styles.articleTitle}>{article.title}</h1>

          {article.summary && <p className={styles.articleLead}>{article.summary}</p>}

          <div className={styles.articleMetaRail}>
            {publishedDate && (
              <div className={styles.articleMetaItem}>
                <span className={styles.articleMetaLabel}>{copy.date}</span>
                <div className={styles.articleMetaValue}>
                  <CalendarDays aria-hidden="true" size={13} /> {publishedDate}
                </div>
              </div>
            )}

            {article.reading_time_minutes && (
              <div className={styles.articleMetaItem}>
                <span className={styles.articleMetaLabel}>{copy.reading}</span>
                <div className={styles.articleMetaValue}>
                  <Clock aria-hidden="true" size={13} /> {article.reading_time_minutes} {copy.minutes}
                </div>
              </div>
            )}

            <div className={styles.articleMetaItem}>
              <span className={styles.articleMetaLabel}>{copy.views}</span>
              <div className={styles.articleMetaValue}>
                <Eye aria-hidden="true" size={13} /> {article.views_count ?? 0}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className={styles.articleAuthorStrip}>
        <div className={styles.shell}>
          <div className={styles.articleAuthorMini}>
            <Avatar className={styles.articleAvatar}>
              <AvatarImage src={article.author?.avatar_url || AUTHOR_PORTRAIT} />
              <AvatarFallback className={styles.articleAvatarFallback}>{authorInitials}</AvatarFallback>
            </Avatar>
            <div>
              <span className={styles.articleMetaLabel}>{copy.writtenBy}</span>
              <div className={styles.articleAuthorName}>
                {article.author?.full_name || (isEnglish ? 'Author' : 'Autor')}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ArticleReadingSurface>
        <div className={`${styles.shell} ${styles.articleBodyGrid}`}>
          <aside className={styles.articleAside} aria-label={copy.topics}>
            <div className={styles.asideLabel}>{copy.topics}</div>
            {article.tags.length > 0 && (
              <nav className={styles.articleTagList} aria-label={isEnglish ? 'Filter blog by tag' : 'Filtrar blog por tag'}>
                {article.tags.map((tag: any) => (
                  <Link className={styles.tagLink} key={tag.id} href={`/blog?tag=${tag.slug}` as any}>
                    #{tag.name}
                  </Link>
                ))}
              </nav>
            )}
          </aside>

          <div className={styles.articleContent}>
            <MarkdownRenderer content={article.content || ''} />
          </div>

          <div className={styles.articleAfterword}>
            {article.projects.length > 0 && (
              <section className={styles.relatedSection} aria-labelledby="related-projects">
                <div className={styles.relatedHeader}>
                  <h2 className={styles.relatedTitle} id="related-projects">
                    {copy.related}
                  </h2>
                  <span className={styles.asideLabel}>{String(article.projects.length).padStart(2, '0')} / SELECTED</span>
                </div>

                <div className={styles.relatedGrid}>
                  {article.projects.map((project: any, index: number) => (
                    <Link className={styles.projectLink} key={project.id} href={`/projetos/${project.slug}` as any}>
                      <div className={styles.projectImage} aria-hidden={!project.cover_image_url}>
                        {project.cover_image_url && (
                          <Image src={project.cover_image_url} alt="" fill sizes="112px" />
                        )}
                      </div>
                      <div className={styles.projectCopy}>
                        <span className={styles.relatedIndex}>{String(index + 1).padStart(2, '0')} / PROJECT</span>
                        <h3 className={styles.projectTitle}>{project.title}</h3>
                        <span className={styles.projectCta}>{copy.project} ↗</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

          </div>
        </div>
      </ArticleReadingSurface>
    </article>
  )
}
