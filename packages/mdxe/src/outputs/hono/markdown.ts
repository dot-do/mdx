/**
 * Hono Markdown Output Mode
 *
 * Pure markdown output with minimal processing.
 * Fast, lightweight, and perfect for AI consumption or markdown viewers.
 */

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { cache } from 'hono/cache'
import type { MdxDocument, OutputConfig } from '../shared/types'
import { formatDocument } from '../shared/mdx-utils'

export interface MarkdownOutputOptions extends OutputConfig {
  /**
   * Include frontmatter in output
   */
  includeFrontmatter?: boolean

  /**
   * Include table of contents
   */
  includeToc?: boolean

  /**
   * Cache duration in seconds
   */
  cacheDuration?: number
}

/**
 * Create a Hono app with markdown output
 */
export function createMarkdownApp(options: MarkdownOutputOptions) {
  const app = new Hono()

  // Default options
  const config: Required<MarkdownOutputOptions> = {
    basePath: options.basePath || '/',
    collections: options.collections,
    styling: options.styling || {},
    mdxdb: options.mdxdb,
    includeFrontmatter: options.includeFrontmatter ?? true,
    includeToc: options.includeToc ?? false,
    cacheDuration: options.cacheDuration ?? 3600, // 1 hour default
  }

  // CORS middleware
  app.use('*', cors())

  // Cache middleware (if supported by runtime)
  if (config.cacheDuration > 0) {
    app.use(
      '*',
      cache({
        cacheName: 'mdxe-markdown',
        cacheControl: `max-age=${config.cacheDuration}`,
      })
    )
  }

  /**
   * List documents in a collection
   */
  app.get('/:collection', async (c) => {
    const collection = c.req.param('collection')

    if (!config.collections.includes(collection)) {
      return c.json({ error: 'Collection not found' }, 404)
    }

    try {
      // Get documents from mdxdb
      const documents = await getDocuments(collection, config)

      return c.json({
        collection,
        count: documents.length,
        documents: documents.map((doc) => ({
          id: doc.id,
          slug: doc.slug,
          frontmatter: doc.frontmatter,
          url: `${config.basePath}${collection}/${doc.slug}`,
        })),
      })
    } catch (error) {
      return c.json({ error: 'Failed to list documents' }, 500)
    }
  })

  /**
   * Get a single document as markdown
   */
  app.get('/:collection/:slug', async (c) => {
    const collection = c.req.param('collection')
    const slug = c.req.param('slug')

    if (!config.collections.includes(collection)) {
      return c.json({ error: 'Collection not found' }, 404)
    }

    try {
      const document = await getDocument(collection, slug, config)

      if (!document) {
        return c.json({ error: 'Document not found' }, 404)
      }

      const formatted = formatDocument(document)
      const markdown = renderMarkdown(formatted, config)

      // Return as markdown with proper content type
      return c.text(markdown, 200, {
        'Content-Type': 'text/markdown; charset=utf-8',
      })
    } catch (error) {
      return c.json({ error: 'Failed to get document' }, 500)
    }
  })

  /**
   * Health check endpoint
   */
  app.get('/health', (c) => {
    return c.json({
      status: 'ok',
      mode: 'markdown',
      collections: config.collections,
    })
  })

  return app
}

/**
 * Render document as markdown
 */
function renderMarkdown(doc: MdxDocument, config: Required<MarkdownOutputOptions>): string {
  let output = ''

  // Add frontmatter
  if (config.includeFrontmatter && doc.frontmatter) {
    output += '---\n'
    Object.entries(doc.frontmatter).forEach(([key, value]) => {
      output += `${key}: ${value}\n`
    })
    output += '---\n\n'
  }

  // Add table of contents
  if (config.includeToc && doc.toc) {
    output += '## Table of Contents\n\n'
    renderTocMarkdown(doc.toc.items, 0).forEach((line) => {
      output += line + '\n'
    })
    output += '\n'
  }

  // Add content
  output += doc.content

  return output
}

/**
 * Render table of contents as markdown list
 */
function renderTocMarkdown(items: any[], depth: number): string[] {
  const lines: string[] = []
  const indent = '  '.repeat(depth)

  items.forEach((item) => {
    lines.push(`${indent}- [${item.text}](#${item.id})`)
    if (item.children && item.children.length > 0) {
      lines.push(...renderTocMarkdown(item.children, depth + 1))
    }
  })

  return lines
}

/**
 * Get all documents in a collection (stub - implement with mdxdb)
 */
async function getDocuments(collection: string, config: Required<MarkdownOutputOptions>): Promise<MdxDocument[]> {
  // This will be implemented with mdxdb integration
  // For now, return mock data
  return []
}

/**
 * Get a single document (stub - implement with mdxdb)
 */
async function getDocument(collection: string, slug: string, config: Required<MarkdownOutputOptions>): Promise<MdxDocument | null> {
  // This will be implemented with mdxdb integration
  // For now, return null
  return null
}

/**
 * Export default for direct usage
 */
export default createMarkdownApp
