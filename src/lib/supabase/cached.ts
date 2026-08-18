import { unstable_cache } from 'next/cache'
import { PROJECTS_CACHE_TAG, projectSlugCacheTag } from '@/lib/cache/projects'
import { createPublicClient } from './public'

// Cache duration: 5 minutes (300 seconds)
const CACHE_REVALIDATE_TIME = 300

/**
 * HOMEPAGE
 */
export const getCachedHomepageData = unstable_cache(
  async () => {
    const supabase = createPublicClient()
    const { data, error } = await supabase
      .from('homepage_data')
      .select('*')
      .eq('id', 1)
      .single()
    if (error) throw error
    return data
  },
  ['homepage_data'],
  { revalidate: CACHE_REVALIDATE_TIME, tags: ['homepage_data'] }
)

export const getCachedSkills = unstable_cache(
  async () => {
    const supabase = createPublicClient()
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .order('display_order', { ascending: true })
    if (error) throw error
    return data || []
  },
  ['skills'],
  { revalidate: CACHE_REVALIDATE_TIME, tags: ['skills'] }
)

/**
 * PROJECTS
 */
export const getCachedProjects = unstable_cache(
  async () => {
    const supabase = createPublicClient()
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
        translations:project_translations(*)
      `)
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  },
  ['projects'],
  { revalidate: CACHE_REVALIDATE_TIME, tags: [PROJECTS_CACHE_TAG] }
)

export const getCachedProjectBySlug = (slug: string) =>
  unstable_cache(
    async (projectSlug: string) => {
      const supabase = createPublicClient()
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
        .eq('slug', projectSlug)
        .eq('is_active', true)
        .single()
      if (error) throw error
      return data
    },
    ['project-by-slug', slug],
    {
      revalidate: 3600,
      tags: [PROJECTS_CACHE_TAG, projectSlugCacheTag(slug)],
    }
  )(slug)

type SitemapSlugRow = { slug: string; updated_at: string }

export const getCachedSitemapProjects = unstable_cache(
  async (): Promise<SitemapSlugRow[]> => {
    const supabase = createPublicClient()
    const { data, error } = await supabase
      .from('projects')
      .select('slug, updated_at')
      .eq('is_active', true)
    if (error) throw error
    return (data as SitemapSlugRow[] | null) || []
  },
  ['sitemap-projects'],
  { revalidate: CACHE_REVALIDATE_TIME, tags: [PROJECTS_CACHE_TAG] }
)

/**
 * ARTICLES / BLOG
 */
export const getCachedArticles = unstable_cache(
  async () => {
    const supabase = createPublicClient()
    const { data, error } = await supabase
      .from('articles')
      .select(`
        *,
        author:profiles(*),
        category:categories(*, translations:category_translations(*)),
        tags:article_tags(
          tag:tags(*)
        ),
        translations:article_translations(*)
      `)
      .eq('status', 'published')
      .order('published_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  },
  ['articles'],
  { revalidate: CACHE_REVALIDATE_TIME, tags: ['articles'] }
)

export const getCachedArticleBySlug = async (slug: string) => {
  const supabase = createPublicClient()
  const { data, error } = await supabase
    .from('articles')
    .select(`
      *,
      author:profiles(*),
      category:categories(*, translations:category_translations(*)),
      tags:article_tags(
        tag:tags(*)
      ),
      projects:article_projects(
        project:projects(id, title, slug, cover_image_url)
      ),
      translations:article_translations(*)
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .single()
  if (error) throw error
  return data
}

export const getCachedSitemapArticles = unstable_cache(
  async (): Promise<SitemapSlugRow[]> => {
    const supabase = createPublicClient()
    const { data, error } = await supabase
      .from('articles')
      .select('slug, updated_at')
      .eq('status', 'published')
    if (error) throw error
    return (data as SitemapSlugRow[] | null) || []
  },
  ['sitemap-articles'],
  { revalidate: CACHE_REVALIDATE_TIME, tags: ['articles'] }
)

/**
 * RESUME & PROFILE
 */
export const getCachedResumeData = (locale: string) => {
  return unstable_cache(
    async (loc: string) => {
      const supabase = createPublicClient()
      const { data, error } = await supabase
        .from('resume_data')
        .select('*')
        .eq('language', loc)
        .maybeSingle()
      if (error) throw error
      return data
    },
    ['resume-data', locale],
    { revalidate: CACHE_REVALIDATE_TIME, tags: ['resume_data', `resume-${locale}`] }
  )(locale)
}

export const getCachedProfile = unstable_cache(
  async () => {
    const supabase = createPublicClient()
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .single()
    if (error) throw error
    return data
  },
  ['profile'],
  { revalidate: CACHE_REVALIDATE_TIME, tags: ['profile'] }
)
