/**
 * Hono HTML Output Mode
 *
 * Full HTML rendering with Tailwind CSS typography.
 * Beautiful, responsive documentation sites out of the box.
 */

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { cache } from 'hono/cache'
import type { MdxDocument, OutputConfig } from '../shared/types'
import { formatDocument, markdownToHtml } from '../shared/mdx-utils'

export interface HtmlOutputOptions extends OutputConfig {
  /**
   * Site title
   */
  siteTitle?: string

  /**
   * Site description
   */
  siteDescription?: string

  /**
   * Custom head HTML
   */
  headHtml?: string

  /**
   * Include table of contents sidebar
   */
  includeTocSidebar?: boolean

  /**
   * Typography theme (default, slate, gray, zinc, neutral, stone)
   */
  typographyTheme?: string

  /**
   * Cache duration in seconds
   */
  cacheDuration?: number
}

/**
 * Create a Hono app with HTML output
 */
export function createHtmlApp(options: HtmlOutputOptions) {
  const app = new Hono()

  // Default options
  const config: Required<HtmlOutputOptions> = {
    basePath: options.basePath || '/',
    collections: options.collections,
    styling: options.styling || {},
    mdxdb: options.mdxdb,
    siteTitle: options.siteTitle || 'MDX Documentation',
    siteDescription: options.siteDescription || 'Documentation powered by mdxe',
    headHtml: options.headHtml || '',
    includeTocSidebar: options.includeTocSidebar ?? true,
    typographyTheme: options.typographyTheme || 'default',
    cacheDuration: options.cacheDuration ?? 3600,
  }

  // CORS middleware
  app.use('*', cors())

  // Cache middleware
  if (config.cacheDuration > 0) {
    app.use(
      '*',
      cache({
        cacheName: 'mdxe-html',
        cacheControl: `max-age=${config.cacheDuration}`,
      })
    )
  }

  /**
   * Home page - collection index
   */
  app.get('/', async (c) => {
    const html = renderIndexPage(config)
    return c.html(html)
  })

  /**
   * Collection index page
   */
  app.get('/:collection', async (c) => {
    const collection = c.req.param('collection')

    if (!config.collections.includes(collection)) {
      return c.html(render404Page(config), 404)
    }

    try {
      const documents = await getDocuments(collection, config)
      const html = renderCollectionPage(collection, documents, config)
      return c.html(html)
    } catch (error) {
      return c.html(render500Page(config), 500)
    }
  })

  /**
   * Document page
   */
  app.get('/:collection/:slug', async (c) => {
    const collection = c.req.param('collection')
    const slug = c.req.param('slug')

    if (!config.collections.includes(collection)) {
      return c.html(render404Page(config), 404)
    }

    try {
      const document = await getDocument(collection, slug, config)

      if (!document) {
        return c.html(render404Page(config), 404)
      }

      const formatted = formatDocument(document)
      const html = renderDocumentPage(formatted, config)
      return c.html(html)
    } catch (error) {
      return c.html(render500Page(config), 500)
    }
  })

  /**
   * Health check
   */
  app.get('/health', (c) => {
    return c.json({
      status: 'ok',
      mode: 'html',
      collections: config.collections,
    })
  })

  return app
}

/**
 * Base HTML layout
 */
function renderLayout(title: string, content: string, config: Required<HtmlOutputOptions>): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - ${config.siteTitle}</title>
  <meta name="description" content="${config.siteDescription}">
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          typography: ${JSON.stringify(config.styling.typography || {})}
        }
      }
    }
  </script>
  <style>
    /* Custom typography styles */
    ${config.styling.customCss || ''}
  </style>
  ${config.headHtml}
</head>
<body class="bg-gray-50 text-gray-900">
  <div class="min-h-screen">
    ${content}
  </div>
</body>
</html>`
}

/**
 * Render index page
 */
function renderIndexPage(config: Required<HtmlOutputOptions>): string {
  const content = `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold mb-4">${config.siteTitle}</h1>
        <p class="text-xl text-gray-600">${config.siteDescription}</p>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        ${config.collections
          .map(
            (collection) => `
          <a href="${config.basePath}${collection}" class="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h2 class="text-2xl font-semibold mb-2 capitalize">${collection}</h2>
            <p class="text-gray-600">Browse ${collection} documentation</p>
          </a>
        `
          )
          .join('')}
      </div>
    </div>
  `
  return renderLayout(config.siteTitle, content, config)
}

/**
 * Render collection index page
 */
function renderCollectionPage(collection: string, documents: MdxDocument[], config: Required<HtmlOutputOptions>): string {
  const content = `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <nav class="mb-8">
        <a href="${config.basePath}" class="text-blue-600 hover:text-blue-800">&larr; Back to home</a>
      </nav>
      <h1 class="text-4xl font-bold mb-8 capitalize">${collection}</h1>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        ${documents
          .map(
            (doc) => `
          <a href="${config.basePath}${collection}/${doc.slug}" class="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h2 class="text-2xl font-semibold mb-2">${doc.frontmatter.title || doc.slug}</h2>
            ${doc.frontmatter.description ? `<p class="text-gray-600">${doc.frontmatter.description}</p>` : ''}
          </a>
        `
          )
          .join('')}
      </div>
    </div>
  `
  return renderLayout(collection, content, config)
}

/**
 * Render document page
 */
function renderDocumentPage(doc: MdxDocument, config: Required<HtmlOutputOptions>): string {
  const htmlContent = markdownToHtml(doc.content)
  const hasToc = doc.toc && doc.toc.items.length > 0

  const content = `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <nav class="mb-8">
        <a href="${config.basePath}${doc.collection}" class="text-blue-600 hover:text-blue-800">&larr; Back to ${doc.collection}</a>
      </nav>
      <div class="${hasToc && config.includeTocSidebar ? 'lg:flex lg:gap-8' : ''}">
        ${
          hasToc && config.includeTocSidebar
            ? `
          <aside class="lg:w-64 mb-8 lg:mb-0">
            <div class="sticky top-8">
              <h3 class="text-lg font-semibold mb-4">On this page</h3>
              <nav class="space-y-2">
                ${renderTocHtml(doc.toc!.items)}
              </nav>
            </div>
          </aside>
        `
            : ''
        }
        <article class="flex-1 prose prose-${config.typographyTheme} max-w-none">
          <h1>${doc.frontmatter.title || doc.slug}</h1>
          ${doc.frontmatter.description ? `<p class="lead">${doc.frontmatter.description}</p>` : ''}
          ${htmlContent}
        </article>
      </div>
    </div>
  `
  return renderLayout(doc.frontmatter.title || doc.slug, content, config)
}

/**
 * Render table of contents as HTML
 */
function renderTocHtml(items: any[]): string {
  return items
    .map(
      (item) => `
    <div>
      <a href="#${item.id}" class="text-gray-600 hover:text-gray-900 block py-1 text-sm">
        ${item.text}
      </a>
      ${item.children && item.children.length > 0 ? `<div class="ml-4">${renderTocHtml(item.children)}</div>` : ''}
    </div>
  `
    )
    .join('')
}

/**
 * Render 404 page
 */
function render404Page(config: Required<HtmlOutputOptions>): string {
  const content = `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
      <h1 class="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p class="text-xl text-gray-600 mb-8">The page you're looking for doesn't exist.</p>
      <a href="${config.basePath}" class="text-blue-600 hover:text-blue-800 font-semibold">Go back home</a>
    </div>
  `
  return renderLayout('404 - Not Found', content, config)
}

/**
 * Render 500 page
 */
function render500Page(config: Required<HtmlOutputOptions>): string {
  const content = `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
      <h1 class="text-4xl font-bold mb-4">500 - Server Error</h1>
      <p class="text-xl text-gray-600 mb-8">Something went wrong. Please try again later.</p>
      <a href="${config.basePath}" class="text-blue-600 hover:text-blue-800 font-semibold">Go back home</a>
    </div>
  `
  return renderLayout('500 - Server Error', content, config)
}

/**
 * Get all documents in a collection (stub - implement with mdxdb)
 */
async function getDocuments(collection: string, config: Required<HtmlOutputOptions>): Promise<MdxDocument[]> {
  // This will be implemented with mdxdb integration
  return []
}

/**
 * Get a single document (stub - implement with mdxdb)
 */
async function getDocument(collection: string, slug: string, config: Required<HtmlOutputOptions>): Promise<MdxDocument | null> {
  // This will be implemented with mdxdb integration
  return null
}

/**
 * Export default for direct usage
 */
export default createHtmlApp
