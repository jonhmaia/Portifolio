import { MetadataRoute } from 'next'
import { getCachedSitemapArticles, getCachedSitemapProjects } from '@/lib/supabase/cached'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.devjoaomarcos.com').replace(/\/$/, '')
  const now = new Date()
  const staticPaths = [
    ['', 1, 'monthly'],
    ['/projetos', 0.9, 'weekly'],
    ['/blog', 0.9, 'weekly'],
    ['/curriculo', 0.75, 'monthly'],
    ['/contact', 0.75, 'monthly'],
    ['/en', 0.9, 'monthly'],
    ['/en/projects', 0.85, 'weekly'],
    ['/en/blog', 0.85, 'weekly'],
    ['/en/resume', 0.7, 'monthly'],
    ['/en/contact', 0.7, 'monthly'],
  ] as const

  const staticPages: MetadataRoute.Sitemap = staticPaths.map(([path, priority, changeFrequency]) => ({
    url: `${baseUrl}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }))

  const hasSupabaseEnvironment = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
  if (!hasSupabaseEnvironment) return staticPages

  try {
    const [projects, articles] = await Promise.all([
      getCachedSitemapProjects(),
      getCachedSitemapArticles(),
    ])

    const projectPages: MetadataRoute.Sitemap = projects.flatMap((project) => [
      {
        url: `${baseUrl}/projetos/${project.slug}`,
        lastModified: new Date(project.updated_at),
        changeFrequency: 'monthly' as const,
        priority: 0.8,
      },
      {
        url: `${baseUrl}/en/projects/${project.slug}`,
        lastModified: new Date(project.updated_at),
        changeFrequency: 'monthly' as const,
        priority: 0.75,
      },
    ])

    const articlePages: MetadataRoute.Sitemap = articles.flatMap((article) => [
      {
        url: `${baseUrl}/blog/${article.slug}`,
        lastModified: new Date(article.updated_at),
        changeFrequency: 'monthly' as const,
        priority: 0.8,
      },
      {
        url: `${baseUrl}/en/blog/${article.slug}`,
        lastModified: new Date(article.updated_at),
        changeFrequency: 'monthly' as const,
        priority: 0.75,
      },
    ])

    return [...staticPages, ...projectPages, ...articlePages]
  } catch (error) {
    console.error('Unable to enrich sitemap with dynamic content:', error)
    return staticPages
  }
}
