export type ArticleImageSize = 'small' | 'medium' | 'large'

export const ARTICLE_IMAGE_SIZE_ALIASES: Record<string, ArticleImageSize> = {
  small: 'small',
  sm: 'small',
  pequeno: 'small',
  p: 'small',
  medium: 'medium',
  md: 'medium',
  medio: 'medium',
  médio: 'medium',
  m: 'medium',
  large: 'large',
  lg: 'large',
  grande: 'large',
  l: 'large',
}

/**
 * Parses article image alt text.
 *
 * Caption is optional. Size can live after `|` or be the whole alt:
 * - `![](url)`
 * - `![|small](url)`
 * - `![small](url)`
 * - `![legenda|small](url)`
 */
export function parseArticleImageAlt(alt?: string | null): {
  caption: string
  size: ArticleImageSize
} {
  const raw = alt?.trim() ?? ''
  if (!raw) return { caption: '', size: 'large' }

  const parts = raw.split('|').map((part) => part.trim())
  const last = parts.at(-1)?.toLowerCase() ?? ''
  const size = ARTICLE_IMAGE_SIZE_ALIASES[last]

  if (size) {
    return {
      caption: parts.slice(0, -1).join('|').trim(),
      size,
    }
  }

  return { caption: raw, size: 'large' }
}

export function isAnimatedImageUrl(src?: string | null) {
  if (!src) return false
  const path = src.split(/[?#]/)[0] ?? src
  return /\.gif$/i.test(path)
}
