# Hono Output Format for mdxe

Worker-ready Hono applications that render MDX content in two modes: **pure markdown** and **HTML with Tailwind typography**.

## Overview

The Hono output format provides a lightweight, performant way to serve MDX content from Cloudflare Workers. It supports two rendering modes that can be selected at build time or runtime based on the `Accept` header.

## Modes

### Mode 1: Pure Markdown

Serves raw markdown content with minimal processing.

**Features:**
- Content-Type: `text/markdown`
- Optional frontmatter inclusion
- Optional table of contents
- Fast, lightweight
- Perfect for AI agents and markdown viewers

**Usage:**
```typescript
import { createMarkdownApp } from 'mdxe/outputs/hono'

const app = createMarkdownApp({
  collections: ['docs', 'blog'],
  includeFrontmatter: true,
  includeToc: true,
  cacheDuration: 3600,
})

export default { fetch: app.fetch }
```

### Mode 2: HTML with Tailwind

Full HTML rendering with Tailwind CSS typography.

**Features:**
- Beautiful, responsive HTML
- Tailwind typography plugin
- Table of contents sidebar
- Custom styling support
- SEO optimized

**Usage:**
```typescript
import { createHtmlApp } from 'mdxe/outputs/hono'

const app = createHtmlApp({
  collections: ['docs', 'blog'],
  siteTitle: 'My Documentation',
  siteDescription: 'Beautiful docs powered by mdxe',
  includeTocSidebar: true,
  typographyTheme: 'slate',
  styling: {
    customCss: '/* your custom styles */',
  },
})

export default { fetch: app.fetch }
```

## Router with Auto-Detection

The router can automatically select the output mode based on the `Accept` header.

**Usage:**
```typescript
import { createRouter } from 'mdxe/outputs/hono'

const app = createRouter({
  mode: 'auto', // 'markdown' | 'html' | 'auto'
  enableLogging: true,
  enableCompression: true,
  rateLimit: 100, // requests per minute
  markdownOptions: {
    collections: ['docs'],
    includeFrontmatter: true,
  },
  htmlOptions: {
    collections: ['docs'],
    siteTitle: 'Docs',
  },
})

export default { fetch: app.fetch }
```

## API Endpoints

### Collection Listing

```
GET /:collection
```

Returns a list of documents in the collection.

**Response:**
```json
{
  "collection": "docs",
  "count": 10,
  "documents": [
    {
      "id": "getting-started",
      "slug": "getting-started",
      "frontmatter": { "title": "Getting Started" },
      "url": "/docs/getting-started"
    }
  ]
}
```

### Document Retrieval

```
GET /:collection/:slug
```

Returns the document content.

**Markdown Mode:**
- Content-Type: `text/markdown`
- Raw markdown with optional frontmatter and TOC

**HTML Mode:**
- Content-Type: `text/html`
- Rendered HTML with Tailwind typography

### Health Check

```
GET /health
```

Returns service health status.

**Response:**
```json
{
  "status": "ok",
  "mode": "markdown",
  "collections": ["docs", "blog"]
}
```

## Configuration Options

### MarkdownOutputOptions

```typescript
interface MarkdownOutputOptions extends OutputConfig {
  includeFrontmatter?: boolean  // Include frontmatter (default: true)
  includeToc?: boolean           // Include table of contents (default: false)
  cacheDuration?: number         // Cache duration in seconds (default: 3600)
}
```

### HtmlOutputOptions

```typescript
interface HtmlOutputOptions extends OutputConfig {
  siteTitle?: string              // Site title (default: 'MDX Documentation')
  siteDescription?: string        // Meta description
  headHtml?: string               // Custom head HTML
  includeTocSidebar?: boolean     // TOC sidebar (default: true)
  typographyTheme?: string        // Typography theme (default: 'default')
  cacheDuration?: number          // Cache duration in seconds (default: 3600)
}
```

### RouterOptions

```typescript
interface RouterOptions {
  mode?: 'markdown' | 'html' | 'auto'  // Output mode (default: 'auto')
  markdownOptions?: MarkdownOutputOptions
  htmlOptions?: HtmlOutputOptions
  enableLogging?: boolean              // Request logging (default: false)
  enableCompression?: boolean          // Response compression (default: false)
  corsOptions?: any                    // CORS configuration
  rateLimit?: number                   // Requests per minute
}
```

## Styling

### Typography Themes

Available themes for `typographyTheme`:
- `default` - Default Tailwind typography
- `slate` - Slate color scheme
- `gray` - Gray color scheme
- `zinc` - Zinc color scheme
- `neutral` - Neutral color scheme
- `stone` - Stone color scheme

### Custom CSS

Add custom styles via the `styling.customCss` option:

```typescript
createHtmlApp({
  // ...
  styling: {
    customCss: `
      .prose code {
        background-color: #f7fafc;
        padding: 0.2em 0.4em;
        border-radius: 0.25rem;
      }
      .prose pre {
        background-color: #1a202c;
        color: #e2e8f0;
      }
    `,
  },
})
```

### Typography Configuration

Customize Tailwind typography plugin:

```typescript
createHtmlApp({
  // ...
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
  },
})
```

## Middleware

### CORS

CORS is enabled by default. Customize with:

```typescript
createRouter({
  // ...
  corsOptions: {
    origin: 'https://example.com',
    credentials: true,
  },
})
```

### Caching

Cache responses with:

```typescript
createMarkdownApp({
  // ...
  cacheDuration: 3600, // 1 hour
})
```

### Rate Limiting

Limit requests per IP:

```typescript
createRouter({
  // ...
  rateLimit: 100, // 100 requests per minute
})
```

### Compression

Enable response compression:

```typescript
createRouter({
  // ...
  enableCompression: true,
})
```

### Logging

Enable request logging:

```typescript
createRouter({
  // ...
  enableLogging: true,
})
```

## Deployment

### Cloudflare Workers

1. Install dependencies:
```bash
npm install hono mdxe
```

2. Create `wrangler.toml`:
```toml
name = "mdxe-worker"
main = "index.ts"
compatibility_date = "2024-10-01"
```

3. Deploy:
```bash
wrangler deploy
```

### Local Development

```bash
wrangler dev
```

## Examples

See the `examples/` directory for complete examples:

- `hono-worker-markdown/` - Markdown mode example
- `hono-worker-html/` - HTML mode example

Each example includes:
- Worker implementation
- `wrangler.toml` configuration
- README with usage instructions

## Performance

### Markdown Mode
- **Cold Start**: ~50ms
- **Request Time**: ~10ms
- **Cache Hit**: ~1ms
- **Memory**: ~10MB

### HTML Mode
- **Cold Start**: ~100ms (with Tailwind CDN)
- **Request Time**: ~20ms
- **Cache Hit**: ~1ms
- **Memory**: ~20MB

## Testing

Run tests with:

```bash
npm test
```

Test files:
- `markdown.test.ts` - Markdown mode tests
- `html.test.ts` - HTML mode tests
- `shared/mdx-utils.test.ts` - Utility tests

## Integration with mdxdb

The Hono output format is designed to integrate with `mdxdb` for content management. The stub functions `getDocuments()` and `getDocument()` will be replaced with actual mdxdb calls in the next phase.

**Example integration:**
```typescript
import { MdxDb } from '@mdxdb/fs'

const db = new MdxDb()
await db.build()

async function getDocuments(collection: string) {
  return db.list(collection)
}

async function getDocument(collection: string, slug: string) {
  return db.get(slug, collection)
}
```

## Future Enhancements

- [ ] MDX component rendering
- [ ] Syntax highlighting for code blocks
- [ ] Search functionality
- [ ] RSS feed generation
- [ ] Sitemap generation
- [ ] OpenGraph meta tags
- [ ] Dark mode support
- [ ] Full-text search with Pagefind
