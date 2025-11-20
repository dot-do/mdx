/**
 * Example Hono Worker - HTML Mode
 *
 * Serves MDX content as beautiful HTML with Tailwind CSS.
 * Perfect for documentation sites and public-facing content.
 */

import { createHtmlApp } from '../../src/outputs/hono/html'

// Configure the app
const app = createHtmlApp({
  collections: ['docs', 'blog', 'api'],
  basePath: '/',
  siteTitle: 'My Documentation',
  siteDescription: 'Beautiful documentation powered by mdxe',
  includeTocSidebar: true,
  typographyTheme: 'slate',
  cacheDuration: 3600,
  styling: {
    typography: {
      DEFAULT: {
        css: {
          maxWidth: 'none',
          color: '#333',
          a: {
            color: '#3182ce',
            '&:hover': {
              color: '#2c5282',
            },
          },
        },
      },
    },
    customCss: `
      /* Custom styles */
      .prose code {
        background-color: #f7fafc;
        padding: 0.2em 0.4em;
        border-radius: 0.25rem;
        font-size: 0.875em;
      }
    `,
  },
})

// Export for Cloudflare Workers
export default {
  fetch: app.fetch,
}

// Export for local development
export { app }
