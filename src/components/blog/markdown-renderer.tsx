'use client'

import type { ComponentPropsWithoutRef, JSX } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { cn } from '@/lib/utils'
import { MermaidRenderer } from '@/components/ui/mermaid-renderer'
import styles from './editorial.module.css'

interface MarkdownRendererProps {
  content: string
  className?: string
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

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  const preparedContent = prepareMarkdownContent(content)

  return (
    <div className={cn(styles.richText, className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
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
          p: ({ children, ...props }: MarkdownDomProps<'p'>) => (
            <p className={styles.richParagraph} {...omitMarkdownProps(props)}>
              {children}
            </p>
          ),
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
            <blockquote
              className={styles.richQuote}
              {...omitMarkdownProps(props)}
            >
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
                <code
                  className={styles.richInlineCode}
                  {...omitMarkdownProps(props)}
                >
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
            <pre
              className={styles.richPre}
              {...omitMarkdownProps(props)}
            >
              {children}
            </pre>
          ),
          img: ({ src, alt, ...props }: MarkdownDomProps<'img'>) => (
            <span className={styles.richImageWrap}>
              {/* Markdown images have author-defined dimensions and remote origins. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={alt || ''}
                className={styles.richImage}
                {...omitMarkdownProps(props)}
              />
              {alt && (
                <span className={styles.richCaption}>
                  {alt}
                </span>
              )}
            </span>
          ),
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
            <th
              className={styles.richTh}
              {...omitMarkdownProps(props)}
            >
              {children}
            </th>
          ),
          td: ({ children, ...props }: MarkdownDomProps<'td'>) => (
            <td className={styles.richTd} {...omitMarkdownProps(props)}>
              {children}
            </td>
          ),
        }}
      >
        {preparedContent}
      </ReactMarkdown>
    </div>
  )
}
