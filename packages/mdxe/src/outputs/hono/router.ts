/**
 * Hono Router and Middleware
 *
 * Unified router that can switch between markdown and HTML modes.
 * Includes common middleware for CORS, caching, compression, etc.
 */

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { compress } from 'hono/compress'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import { createMarkdownApp, type MarkdownOutputOptions } from './markdown'
import { createHtmlApp, type HtmlOutputOptions } from './html'

export type OutputMode = 'markdown' | 'html' | 'auto'

export interface RouterOptions {
  /**
   * Output mode (markdown, html, or auto-detect from Accept header)
   */
  mode?: OutputMode

  /**
   * Markdown output options
   */
  markdownOptions?: MarkdownOutputOptions

  /**
   * HTML output options
   */
  htmlOptions?: HtmlOutputOptions

  /**
   * Enable request logging
   */
  enableLogging?: boolean

  /**
   * Enable response compression
   */
  enableCompression?: boolean

  /**
   * Custom CORS options
   */
  corsOptions?: any

  /**
   * Rate limiting (requests per minute)
   */
  rateLimit?: number
}

/**
 * Create a Hono router with mode selection
 */
export function createRouter(options: RouterOptions) {
  const app = new Hono()

  // Apply middleware
  if (options.enableLogging) {
    app.use('*', logger())
  }

  if (options.enableCompression) {
    app.use('*', compress())
  }

  if (options.corsOptions !== false) {
    app.use('*', cors(options.corsOptions))
  }

  // Pretty JSON for API responses
  app.use('*', prettyJSON())

  // Rate limiting middleware (if configured)
  if (options.rateLimit) {
    app.use('*', rateLimitMiddleware(options.rateLimit))
  }

  // Mode selection
  const mode = options.mode || 'auto'

  if (mode === 'auto') {
    // Auto-detect mode from Accept header
    const markdownApp = createMarkdownApp(options.markdownOptions!)
    const htmlApp = createHtmlApp(options.htmlOptions!)

    app.use('*', async (c) => {
      const accept = c.req.header('Accept') || ''

      if (accept.includes('text/markdown')) {
        return markdownApp.fetch(c.req.raw)
      } else {
        return htmlApp.fetch(c.req.raw)
      }
    })
  } else if (mode === 'markdown') {
    // Mount markdown app
    const markdownApp = createMarkdownApp(options.markdownOptions!)
    app.route('/', markdownApp)
  } else {
    // Mount HTML app
    const htmlApp = createHtmlApp(options.htmlOptions!)
    app.route('/', htmlApp)
  }

  return app
}

/**
 * Rate limiting middleware
 */
function rateLimitMiddleware(requestsPerMinute: number) {
  const requests = new Map<string, number[]>()

  return async (c: any, next: any) => {
    const ip = c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || 'unknown'
    const now = Date.now()
    const windowStart = now - 60000 // 1 minute window

    // Get request timestamps for this IP
    let timestamps = requests.get(ip) || []

    // Filter out old timestamps
    timestamps = timestamps.filter((ts) => ts > windowStart)

    // Check rate limit
    if (timestamps.length >= requestsPerMinute) {
      return c.json(
        {
          error: 'Rate limit exceeded',
          retryAfter: Math.ceil((timestamps[0] + 60000 - now) / 1000),
        },
        429
      )
    }

    // Add current timestamp
    timestamps.push(now)
    requests.set(ip, timestamps)

    await next()
  }
}

/**
 * Create a Worker-compatible export
 */
export function createWorkerExport(options: RouterOptions) {
  const app = createRouter(options)

  return {
    fetch: app.fetch,
  }
}

/**
 * Export default for convenience
 */
export default createRouter
