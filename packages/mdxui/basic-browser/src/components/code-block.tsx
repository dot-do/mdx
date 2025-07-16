/* eslint-disable react/no-danger */
import type React from 'react'
import { useEffect, useState } from 'react'
import { codeToHtml } from 'shiki'
import { cn } from '../utils'

export type CodeBlockProps = {
  children?: React.ReactNode
  className?: string
} & React.HTMLProps<HTMLDivElement>

export function CodeBlock({ children, className, ...props }: CodeBlockProps) {
  return (
    <div className={cn('not-prose flex w-full flex-col overflow-clip border rounded-md', 'border-border text-card-foreground bg-card', className)} {...props}>
      {children}
    </div>
  )
}

export type CodeBlockCodeProps = {
  code: string
  language?: string
  theme?: string
  className?: string
} & React.HTMLProps<HTMLDivElement>

export function CodeBlockCode({ code, language = 'tsx', theme = 'dracula', className, ...props }: CodeBlockCodeProps) {
  const [highlightedHtml, setHighlightedHtml] = useState<string | null>(null)

  useEffect(() => {
    async function highlight() {
      if (!code) {
        setHighlightedHtml('<pre><code></code></pre>')
        return
      }
      const html = await codeToHtml(code.toString(), {
        lang: language,
        theme,
      })
      setHighlightedHtml(html)
    }
    highlight()
  }, [code, language, theme])

  const classNames = cn('[&>pre]:w-full [&>pre]:overflow-auto text-[13px] [&>pre]:px-4 [&>pre]:py-4', className)

  return highlightedHtml ? (
    <div
      className={classNames}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
      dangerouslySetInnerHTML={{ __html: highlightedHtml }}
      {...props}
    />
  ) : (
    <div className={classNames} {...props}>
      <pre>
        <code>{code}</code>
      </pre>
    </div>
  )
}

export type CodeBlockGroupProps = React.HTMLAttributes<HTMLDivElement>

export function CodeBlockGroup({ children, className, ...props }: CodeBlockGroupProps) {
  return (
    <div className={cn('flex items-center justify-between', className)} {...props}>
      {children}
    </div>
  )
}
