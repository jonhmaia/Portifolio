'use client'

import {
  Children,
  Fragment,
  cloneElement,
  isValidElement,
  useMemo,
  type ComponentPropsWithoutRef,
  type JSX,
  type ReactElement,
  type ReactNode,
} from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { useLocale } from 'next-intl'
import { cn } from '@/lib/utils'
import { MermaidRenderer } from '@/components/ui/mermaid-renderer'
import { ArticleTodayBadge } from '@/components/blog/article-today-badge'
import {
  isAnimatedImageUrl,
  parseArticleImageAlt,
  type ArticleImageSize,
} from '@/lib/markdown/article-images'
import { parseMarkdownSegments } from '@/lib/markdown/article-shortcodes'
import styles from './editorial.module.css'

interface MarkdownRendererProps {
  content: string
  className?: string
  locale?: string
}

type MarkdownDomProps<T extends keyof JSX.IntrinsicElements> =
  ComponentPropsWithoutRef<T> & {
    node?: unknown
    index?: unknown
    ordered?: unknown
    checked?: unknown
    inline?: unknown
    depth?: unknown
  }

function omitMarkdownProps<T extends Record<string, unknown>>({
  node: _node,
  index: _index,
  ordered: _ordered,
  checked: _checked,
  inline: _inline,
  depth: _depth,
  ...props
}: T) {
  void _node
  void _index
  void _ordered
  void _checked
  void _inline
  void _depth
  return props
}

/** Converts next-intl-style <emphasis> tags to markdown bold */
function prepareMarkdownContent(content: string) {
  return content.replace(/<emphasis>([\s\S]*?)<\/emphasis>/gi, '**$1**')
}

const IMAGE_WRAP_CLASS: Record<ArticleImageSize, string | undefined> = {
  small: styles.richImageWrapSmall,
  medium: styles.richImageWrapMedium,
  large: undefined,
}

type MarkdownImageProps = MarkdownDomProps<'img'> & {
  isInline?: boolean
}

function MarkdownImage({ src, alt, isInline = false, ...props }: MarkdownImageProps) {
  const srcUrl = typeof src === 'string' ? src : ''
  if (!srcUrl) return null

  const { caption, size } = parseArticleImageAlt(alt)
  const showCaption = Boolean(caption) && !isInline
  const animated = isAnimatedImageUrl(srcUrl)

  return (
    <span
      className={cn(
        styles.richImageWrap,
        IMAGE_WRAP_CLASS[size],
        !showCaption && styles.richImageWrapNoCaption,
        animated && styles.richImageWrapGif,
        isInline && styles.richImageWrapInline
      )}
    >
      {/* Markdown images have author-defined dimensions and remote origins. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        {...omitMarkdownProps(props)}
        src={srcUrl}
        alt={caption}
        className={styles.richImage}
        referrerPolicy="no-referrer"
        loading="lazy"
        decoding="async"
      />
      {showCaption ? <span className={styles.richCaption}>{caption}</span> : null}
    </span>
  )
}

function isWhitespaceNode(node: ReactNode) {
  return typeof node === 'string' && !node.trim()
}

function isMarkdownImageNode(node: ReactNode): node is ReactElement<MarkdownImageProps> {
  return isValidElement(node) && node.type === MarkdownImage
}

const markdownComponents = {
  h1: ({ children, ...props }: MarkdownDomProps<'h1'>) => (
    <h1 className={styles.richH1} {...omitMarkdownProps(props)}>
      {children}
    </h1>
  ),
  h2: ({ children, ...props }: MarkdownDomProps<'h2'>) => (
    <h2 className={styles.richH2} {...omitMarkdownProps(props)}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }: MarkdownDomProps<'h3'>) => (
    <h3 className={styles.richH3} {...omitMarkdownProps(props)}>
      {children}
    </h3>
  ),
  p: ({ children, ...props }: MarkdownDomProps<'p'>) => {
    const nodes = Children.toArray(children)
    const contentNodes = nodes.filter((node) => !isWhitespaceNode(node))
    const imageOnly = contentNodes.length > 0 && contentNodes.every(isMarkdownImageNode)

    if (imageOnly) {
      return <>{contentNodes}</>
    }

    return (
      <p className={styles.richParagraph} {...omitMarkdownProps(props)}>
        {Children.map(children, (child) =>
          isMarkdownImageNode(child) ? cloneElement(child, { isInline: true }) : child
        )}
      </p>
    )
  },
  strong: ({ children, ...props }: MarkdownDomProps<'strong'>) => (
    <strong className={styles.richStrong} {...omitMarkdownProps(props)}>
      {children}
    </strong>
  ),
  a: ({ children, href, ...props }: MarkdownDomProps<'a'>) => (
    <a
      href={href}
      target={href?.startsWith('http') ? '_blank' : undefined}
      rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
      className={styles.richLink}
      {...omitMarkdownProps(props)}
    >
      {children}
    </a>
  ),
  ul: ({ children, ...props }: MarkdownDomProps<'ul'>) => (
    <ul className={styles.richList} {...omitMarkdownProps(props)}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }: MarkdownDomProps<'ol'>) => (
    <ol className={styles.richList} {...omitMarkdownProps(props)}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }: MarkdownDomProps<'li'>) => (
    <li className={styles.richListItem} {...omitMarkdownProps(props)}>
      {children}
    </li>
  ),
  blockquote: ({ children, ...props }: MarkdownDomProps<'blockquote'>) => (
    <blockquote className={styles.richQuote} {...omitMarkdownProps(props)}>
      {children}
    </blockquote>
  ),
  code: ({ children, className, inline, ...props }: MarkdownDomProps<'code'>) => {
    const match = /language-(\w+)/.exec(className || '')
    const isMermaid = match && match[1] === 'mermaid'

    if (isMermaid) {
      return <MermaidRenderer chart={String(children)} />
    }

    const isInline = inline ?? !className
    if (isInline) {
      return (
        <code className={styles.richInlineCode} {...omitMarkdownProps(props)}>
          {children}
        </code>
      )
    }
    return (
      <code className={cn(styles.richCode, className)} {...omitMarkdownProps(props)}>
        {children}
      </code>
    )
  },
  pre: ({ children, ...props }: MarkdownDomProps<'pre'>) => (
    <pre className={styles.richPre} {...omitMarkdownProps(props)}>
      {children}
    </pre>
  ),
  img: MarkdownImage,
  hr: (props: MarkdownDomProps<'hr'>) => (
    <hr className={styles.richRule} {...omitMarkdownProps(props)} />
  ),
  table: ({ children, ...props }: MarkdownDomProps<'table'>) => (
    <div className={styles.richTableWrap}>
      <table className={styles.richTable} {...omitMarkdownProps(props)}>
        {children}
      </table>
    </div>
  ),
  th: ({ children, ...props }: MarkdownDomProps<'th'>) => (
    <th className={styles.richTh} {...omitMarkdownProps(props)}>
      {children}
    </th>
  ),
  td: ({ children, ...props }: MarkdownDomProps<'td'>) => (
    <td className={styles.richTd} {...omitMarkdownProps(props)}>
      {children}
    </td>
  ),
}

function RichMarkdownBlock({ content }: { content: string }) {
  if (!content.trim()) return null

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight]}
      components={markdownComponents}
    >
      {content}
    </ReactMarkdown>
  )
}

export function MarkdownRenderer({ content, className, locale }: MarkdownRendererProps) {
  const defaultLocale = useLocale()
  const activeLocale = locale ?? defaultLocale

  const segments = useMemo(() => {
    const preparedContent = prepareMarkdownContent(content)
    return parseMarkdownSegments(preparedContent)
  }, [content])

  return (
    <div className={cn(styles.richText, className)}>
      {segments.map((segment, index) => (
        <Fragment key={`${segment.type}-${index}`}>
          {segment.type === 'today-badge' ? (
            <ArticleTodayBadge locale={activeLocale} />
          ) : (
            <RichMarkdownBlock content={segment.content} />
          )}
        </Fragment>
      ))}
    </div>
  )
}
