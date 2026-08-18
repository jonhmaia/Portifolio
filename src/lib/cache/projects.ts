import { revalidatePath, revalidateTag } from 'next/cache'

export const PROJECTS_CACHE_TAG = 'projects'

export function projectSlugCacheTag(slug: string) {
  return `project-${slug}`
}

export function revalidateProjectContent(slug?: string | null) {
  revalidateTag(PROJECTS_CACHE_TAG, 'max')
  revalidatePath('/projetos')
  revalidatePath('/en/projects')

  if (!slug) return

  revalidateTag(projectSlugCacheTag(slug), { expire: 0 })
  revalidatePath(`/projetos/${slug}`)
  revalidatePath(`/en/projects/${slug}`)
}
