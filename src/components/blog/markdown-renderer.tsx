'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { cn } from '@/lib/utils'
import { MermaidRenderer } from '@/components/ui/mermaid-renderer'

interface MarkdownRendererProps {
  content: string
  className?: string
}

type MarkdownDomProps<T extends keyof JSX.IntrinsicElements> =
  React.ComponentPropsWithoutRef<T> & {
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
  return props
}

/** Converts next-intl-style <emphasis> tags to markdown bold */
function prepareMarkdownContent(content: string) {
  return content.replace(/<emphasis>([\s\S]*?)<\/emphasis>/gi, '**$1**')
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  const preparedContent = prepareMarkdownContent(content)

  return (
    <div className={cn('prose-custom', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          h1: ({ children, ...props }: MarkdownDomProps<'h1'>) => (
            <h1 className="text-3xl font-bold mt-8 mb-4 first:mt-0" {...omitMarkdownProps(props)}>
              {children}
            </h1>
          ),
          h2: ({ children, ...props }: MarkdownDomProps<'h2'>) => (
            <h2 className="text-2xl font-bold mt-8 mb-4" {...omitMarkdownProps(props)}>
              {children}
            </h2>
          ),
          h3: ({ children, ...props }: MarkdownDomProps<'h3'>) => (
            <h3 className="text-xl font-bold mt-6 mb-3" {...omitMarkdownProps(props)}>
              {children}
            </h3>
          ),
          p: ({ children, ...props }: MarkdownDomProps<'p'>) => (
            <p className="mb-4 leading-7" {...omitMarkdownProps(props)}>
              {children}
            </p>
          ),
          strong: ({ children, ...props }: MarkdownDomProps<'strong'>) => (
            <strong className="text-foreground font-semibold" {...omitMarkdownProps(props)}>
              {children}
            </strong>
          ),
          a: ({ children, href, ...props }: MarkdownDomProps<'a'>) => (
            <a
              href={href}
              target={href?.startsWith('http') ? '_blank' : undefined}
              rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="text-primary hover:underline"
              {...omitMarkdownProps(props)}
            >
              {children}
            </a>
          ),
          ul: ({ children, ...props }: MarkdownDomProps<'ul'>) => (
            <ul className="list-disc list-inside mb-4 space-y-2" {...omitMarkdownProps(props)}>
              {children}
            </ul>
          ),
          ol: ({ children, ...props }: MarkdownDomProps<'ol'>) => (
            <ol className="list-decimal list-inside mb-4 space-y-2" {...omitMarkdownProps(props)}>
              {children}
            </ol>
          ),
          li: ({ children, ...props }: MarkdownDomProps<'li'>) => (
            <li className="leading-7" {...omitMarkdownProps(props)}>
              {children}
            </li>
          ),
          blockquote: ({ children, ...props }: MarkdownDomProps<'blockquote'>) => (
            <blockquote
              className="border-l-4 border-primary pl-4 italic text-muted-foreground my-4"
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
                  className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono"
                  {...omitMarkdownProps(props)}
                >
                  {children}
                </code>
              )
            }
            return (
              <code className={cn('font-mono text-sm', className)} {...omitMarkdownProps(props)}>
                {children}
              </code>
            )
          },
          pre: ({ children, ...props }: MarkdownDomProps<'pre'>) => (
            <pre
              className="bg-muted p-4 rounded-lg overflow-x-auto my-4 border border-border"
              {...omitMarkdownProps(props)}
            >
              {children}
            </pre>
          ),
          img: ({ src, alt, ...props }: MarkdownDomProps<'img'>) => (
            <span className="block my-6">
              <img
                src={src}
                alt={alt || ''}
                className="rounded-lg border border-border max-w-full h-auto"
                {...omitMarkdownProps(props)}
              />
              {alt && (
                <span className="block text-sm text-muted-foreground text-center mt-2">
                  {alt}
                </span>
              )}
            </span>
          ),
          hr: (props: MarkdownDomProps<'hr'>) => (
            <hr className="my-8 border-border" {...omitMarkdownProps(props)} />
          ),
          table: ({ children, ...props }: MarkdownDomProps<'table'>) => (
            <div className="overflow-x-auto my-4">
              <table className="w-full border-collapse border border-border" {...omitMarkdownProps(props)}>
                {children}
              </table>
            </div>
          ),
          th: ({ children, ...props }: MarkdownDomProps<'th'>) => (
            <th
              className="border border-border bg-muted px-4 py-2 text-left font-semibold"
              {...omitMarkdownProps(props)}
            >
              {children}
            </th>
          ),
          td: ({ children, ...props }: MarkdownDomProps<'td'>) => (
            <td className="border border-border px-4 py-2" {...omitMarkdownProps(props)}>
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
