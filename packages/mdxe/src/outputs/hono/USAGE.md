# Hono Output Format - Usage Guide

Quick start guide for using the Hono output format in mdxe.

## Installation

```bash
npm install hono mdxe
# or
pnpm add hono mdxe
```

## Quick Start

### Option 1: Markdown Mode

Perfect for AI agents, APIs, and markdown viewers.

```typescript
// index.ts
import { createMarkdownApp } from 'mdxe/outputs/hono'

const app = createMarkdownApp({
  collections: ['docs', 'blog'],
  includeFrontmatter: true,
  includeToc: true,
})

export default { fetch: app.fetch }
```

**Deploy:**
```bash
wrangler deploy
```

**Test:**
```bash
curl https://your-worker.workers.dev/docs/getting-started
```

### Option 2: HTML Mode

Perfect for documentation sites and public content.

```typescript
// index.ts
import { createHtmlApp } from 'mdxe/outputs/hono'

const app = createHtmlApp({
  collections: ['docs', 'api'],
  siteTitle: 'My Documentation',
  siteDescription: 'Comprehensive API docs',
  typographyTheme: 'slate',
})

export default { fetch: app.fetch }
```

**Deploy:**
```bash
wrangler deploy
```

**Visit:**
```
https://your-worker.workers.dev/
```

### Option 3: Auto-Detect Router

Automatically serve markdown or HTML based on Accept header.

```typescript
// index.ts
import { createRouter } from 'mdxe/outputs/hono'

const app = createRouter({
  mode: 'auto',
  markdownOptions: {
    collections: ['api'],
    includeToc: true,
  },
  htmlOptions: {
    collections: ['docs'],
    siteTitle: 'Documentation',
  },
})

export default { fetch: app.fetch }
```

**Test:**
```bash
# Get HTML
curl https://your-worker.workers.dev/docs/intro

# Get Markdown
curl -H "Accept: text/markdown" https://your-worker.workers.dev/docs/intro
```

## Configuration

### Markdown Options

```typescript
createMarkdownApp({
  // Required
  collections: ['docs', 'blog', 'api'],

  // Optional
  basePath: '/',                    // Base URL path
  includeFrontmatter: true,         // Include YAML frontmatter
  includeToc: true,                 // Include table of contents
  cacheDuration: 3600,              // Cache for 1 hour
})
```

### HTML Options

```typescript
createHtmlApp({
  // Required
  collections: ['docs', 'guides'],

  // Optional
  siteTitle: 'My Docs',            // Site title
  siteDescription: 'Description',   // Meta description
  typographyTheme: 'slate',        // Typography theme
  includeTocSidebar: true,         // Show TOC sidebar
  cacheDuration: 3600,             // Cache for 1 hour

  // Custom styling
  styling: {
    customCss: `
      .prose code {
        @apply bg-gray-100 px-1 rounded;
      }
    `,
    typography: {
      DEFAULT: {
        css: {
          maxWidth: 'none',
        },
      },
    },
  },
})
```

### Router Options

```typescript
createRouter({
  mode: 'auto',                    // 'markdown' | 'html' | 'auto'

  // Markdown configuration
  markdownOptions: {
    collections: ['api'],
    includeToc: true,
  },

  // HTML configuration
  htmlOptions: {
    collections: ['docs'],
    siteTitle: 'Docs',
  },

  // Middleware
  enableLogging: true,             // Request logging
  enableCompression: true,         // Response compression
  rateLimit: 100,                  // 100 requests/min per IP

  // CORS
  corsOptions: {
    origin: '*',
    credentials: true,
  },
})
```

## Typography Themes

Choose from these built-in themes:

- `default` - Default Tailwind typography
- `slate` - Slate color scheme (recommended)
- `gray` - Gray color scheme
- `zinc` - Zinc color scheme
- `neutral` - Neutral color scheme
- `stone` - Stone color scheme

```typescript
createHtmlApp({
  typographyTheme: 'slate',  // 👈 Set theme here
  // ...
})
```

## Custom Styling

### Add Custom CSS

```typescript
createHtmlApp({
  styling: {
    customCss: `
      /* Custom code blocks */
      .prose code {
        background-color: #f7fafc;
        padding: 0.2em 0.4em;
        border-radius: 0.25rem;
        font-size: 0.875em;
      }

      /* Custom links */
      .prose a {
        color: #3182ce;
        text-decoration: underline;
      }

      /* Dark code blocks */
      .prose pre {
        background-color: #1a202c;
        color: #e2e8f0;
      }
    `,
  },
})
```

### Customize Typography

```typescript
createHtmlApp({
  styling: {
    typography: {
      DEFAULT: {
        css: {
          maxWidth: 'none',
          color: '#1a202c',
          a: {
            color: '#3182ce',
            '&:hover': {
              color: '#2c5282',
            },
          },
          code: {
            color: '#d6336c',
            backgroundColor: '#f7fafc',
          },
        },
      },
    },
  },
})
```

## Middleware

### Enable Logging

```typescript
createRouter({
  enableLogging: true,  // 👈 Logs all requests
  // ...
})
```

### Enable Compression

```typescript
createRouter({
  enableCompression: true,  // 👈 Compresses responses
  // ...
})
```

### Rate Limiting

```typescript
createRouter({
  rateLimit: 100,  // 👈 100 requests per minute per IP
  // ...
})
```

### CORS Configuration

```typescript
createRouter({
  corsOptions: {
    origin: 'https://example.com',
    credentials: true,
    allowHeaders: ['Content-Type'],
    exposeHeaders: ['X-Custom-Header'],
  },
  // ...
})
```

## API Endpoints

### List Collections

```
GET /
```

Returns index page (HTML mode) or collection list (JSON).

### List Documents

```
GET /:collection
```

Returns list of documents in the collection.

**Response:**
```json
{
  "collection": "docs",
  "count": 10,
  "documents": [
    {
      "id": "getting-started",
      "slug": "getting-started",
      "frontmatter": {
        "title": "Getting Started"
      },
      "url": "/docs/getting-started"
    }
  ]
}
```

### Get Document

```
GET /:collection/:slug
```

Returns the document.

**Markdown Mode:**
- Content-Type: `text/markdown`
- Raw markdown content

**HTML Mode:**
- Content-Type: `text/html`
- Rendered HTML with Tailwind

### Health Check

```
GET /health
```

Returns service health.

**Response:**
```json
{
  "status": "ok",
  "mode": "markdown",
  "collections": ["docs", "blog"]
}
```

## Deployment

### Cloudflare Workers

1. **Create `wrangler.toml`:**

```toml
name = "my-docs"
main = "index.ts"
compatibility_date = "2024-10-01"

# Optional: Custom routes
# routes = [
#   { pattern = "docs.example.com/*", zone_name = "example.com" }
# ]
```

2. **Deploy:**

```bash
wrangler deploy
```

3. **Test:**

```bash
curl https://my-docs.your-subdomain.workers.dev/health
```

### Local Development

```bash
wrangler dev
```

Visit: http://localhost:8787

## Examples

See the `examples/` directory for complete examples:

- **`hono-worker-markdown/`** - Markdown mode example
- **`hono-worker-html/`** - HTML mode example

Each includes:
- Full Worker implementation
- `wrangler.toml` configuration
- README with usage instructions

## Performance

### Markdown Mode
- ⚡ **Cold Start:** ~50ms
- 🚀 **Request Time:** ~10ms
- ✨ **Cache Hit:** ~1ms
- 💾 **Memory:** ~10MB

### HTML Mode
- ⚡ **Cold Start:** ~100ms
- 🚀 **Request Time:** ~20ms
- ✨ **Cache Hit:** ~1ms
- 💾 **Memory:** ~20MB

## Troubleshooting

### Issue: "Collection not found"

**Solution:** Check that the collection is in your `collections` array:

```typescript
createMarkdownApp({
  collections: ['docs', 'blog'],  // 👈 Add your collections
})
```

### Issue: "Document not found"

**Solution:** Verify the slug matches your MDX filename (without extension):

```
content/docs/getting-started.mdx  →  /docs/getting-started
```

### Issue: Styles not loading

**Solution:** Check that Tailwind CDN is accessible:

```typescript
createHtmlApp({
  // Tailwind CDN is loaded automatically
  // Check browser console for errors
})
```

### Issue: Rate limit exceeded

**Solution:** Adjust rate limit or implement authentication:

```typescript
createRouter({
  rateLimit: 200,  // 👈 Increase limit
})
```

## Next Steps

- [ ] Connect to mdxdb for real content
- [ ] Add syntax highlighting for code blocks
- [ ] Implement search functionality
- [ ] Add RSS feed generation
- [ ] Create sitemap

## Resources

- [Hono Documentation](https://hono.dev)
- [Tailwind Typography](https://tailwindcss.com/docs/typography-plugin)
- [Cloudflare Workers](https://workers.cloudflare.com)
- [mdxe Documentation](../../../README.md)

## Support

For issues or questions:
1. Check the [README](./README.md)
2. See [examples](../../../examples/)
3. Open an issue on GitHub
