/**
 * Example Hono Worker - Markdown Mode
 *
 * Serves MDX content as pure markdown.
 * Perfect for AI agents and markdown viewers.
 */

import { createMarkdownApp } from '../../src/outputs/hono/markdown'

// Configure the app
const app = createMarkdownApp({
  collections: ['docs', 'blog', 'api'],
  basePath: '/',
  includeFrontmatter: true,
  includeToc: true,
  cacheDuration: 3600, // 1 hour
})

// Export for Cloudflare Workers
export default {
  fetch: app.fetch,
}

// Export for local development
export { app }
