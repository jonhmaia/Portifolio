export type MarkdownSegment =
  | { type: 'markdown'; content: string }
  | { type: 'today-badge' }

const TODAY_BADGE_PATTERN = /::today::|<today\s*\/?>/gi

/** Splits markdown into blocks and today-badge shortcodes. */
export function parseMarkdownSegments(content: string): MarkdownSegment[] {
  if (!TODAY_BADGE_PATTERN.test(content)) {
    return [{ type: 'markdown', content }]
  }

  TODAY_BADGE_PATTERN.lastIndex = 0

  const segments: MarkdownSegment[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = TODAY_BADGE_PATTERN.exec(content)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        type: 'markdown',
        content: content.slice(lastIndex, match.index),
      })
    }

    segments.push({ type: 'today-badge' })
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < content.length) {
    segments.push({
      type: 'markdown',
      content: content.slice(lastIndex),
    })
  }

  return segments.length > 0 ? segments : [{ type: 'markdown', content }]
}

/** Strips today-badge shortcodes before plain markdown transforms. */
export function stripTodayBadgeShortcodes(content: string) {
  return content.replace(TODAY_BADGE_PATTERN, '')
}
