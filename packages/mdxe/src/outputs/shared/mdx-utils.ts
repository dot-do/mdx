/**
 * Shared MDX utilities for output formats
 */

import { MdxDocument, TableOfContents } from './types'

/**
 * Extract frontmatter and content from raw MDX
 */
export function parseMdx(content: string): { frontmatter: Record<string, any>; content: string } {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/
  const match = content.match(frontmatterRegex)

  if (!match) {
    return { frontmatter: {}, content }
  }

  const [, frontmatterStr, bodyContent] = match
  const frontmatter: Record<string, any> = {}

  // Simple YAML parser (supports key: value pairs)
  frontmatterStr.split('\n').forEach((line) => {
    const [key, ...valueParts] = line.split(':')
    if (key && valueParts.length > 0) {
      const value = valueParts.join(':').trim()
      // Remove quotes if present
      frontmatter[key.trim()] = value.replace(/^["']|["']$/g, '')
    }
  })

  return { frontmatter, content: bodyContent.trim() }
}

/**
 * Generate a table of contents from markdown headings
 */
export function generateToc(content: string): TableOfContents {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm
  const items: any[] = []
  let match

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length
    const text = match[2].trim()
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    items.push({ id, text, level })
  }

  // Build hierarchical structure
  const root: any[] = []
  const stack: any[] = []

  items.forEach((item) => {
    const tocItem = { ...item, children: [] }

    while (stack.length > 0 && stack[stack.length - 1].level >= item.level) {
      stack.pop()
    }

    if (stack.length === 0) {
      root.push(tocItem)
    } else {
      stack[stack.length - 1].children.push(tocItem)
    }

    stack.push(tocItem)
  })

  return { items: root }
}

/**
 * Convert markdown to HTML (basic implementation)
 * For production, use a proper markdown parser
 */
export function markdownToHtml(markdown: string): string {
  let html = markdown

  // Headings
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>')
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>')
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>')

  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')

  // Italic
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')

  // Paragraphs
  html = html
    .split('\n\n')
    .map((p) => `<p>${p.replace(/\n/g, '<br>')}</p>`)
    .join('\n')

  return html
}

/**
 * Sanitize content for safe rendering
 */
export function sanitizeContent(content: string): string {
  return content
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

/**
 * Format document for output
 */
export function formatDocument(doc: MdxDocument): MdxDocument {
  return {
    ...doc,
    toc: doc.toc || generateToc(doc.content),
  }
}
