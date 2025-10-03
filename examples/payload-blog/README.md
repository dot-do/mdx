# Blog with Payload CMS

A complete blog example using mdxdb with Payload CMS admin interface, demonstrating schema-driven content management and multiple output formats.

## Features

- 📝 **Schema-driven content** - Define your content structure in YAML
- 🎨 **Payload CMS Admin UI** - Edit content through a beautiful admin interface
- 🚀 **Multiple output formats** - HTML, Markdown, and JSON APIs
- 🔍 **Full-text search** - Built-in search functionality
- 📱 **Responsive design** - Mobile-first Tailwind styling
- ⚡ **Fast builds** - Powered by Velite and mdxdb

## Quick Start

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Access the site
open http://localhost:3000

# Access admin UI
open http://localhost:3000/admin
```

## Project Structure

```
payload-blog/
├── .db/
│   └── blog-schema.md          # Schema definitions
├── content/
│   └── posts/
│       ├── getting-started.mdx
│       ├── mdx-features.mdx
│       └── ...
├── public/                     # Static assets
├── .env.example                # Environment variables
├── velite.config.ts            # Velite configuration
├── payload.config.ts           # Payload CMS configuration
└── package.json
```

## Schema Definition

The blog schema is defined in `.db/blog-schema.md`:

```yaml
---
collections:
  posts:
    title: Blog post title
    slug: URL-friendly slug (string)
    date: Publication date (date)
    author: Post author (string)
    excerpt: Short description (string)
    tags: Post tags (array)
    category: Post category (enum: tech | design | business)
    published: Publication status (boolean)
    featuredImage: Featured image URL (string)

  authors:
    name: Author name
    bio: Author biography
    avatar: Avatar URL (string)
    twitter: Twitter handle (string)
    website: Personal website (string)

  categories:
    name: Category name
    description: Category description
    slug: URL slug (string)
    color: Category color (string)
---

# Blog Schema

This schema defines a complete blog structure with posts, authors, and categories.
```

## Configuration

### Environment Variables

Create `.env.local`:

```env
# Payload CMS
PAYLOAD_SECRET=your-secret-key-here
DATABASE_URL=file:./payload.db

# Optional: Email configuration
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=user@example.com
SMTP_PASS=password
```

### Velite Configuration

The `velite.config.ts` file configures mdxdb:

```typescript
import { defineConfig, s } from 'velite'

export default defineConfig({
  collections: {
    posts: {
      name: 'Post',
      pattern: 'content/posts/**/*.mdx',
      schema: s.object({
        title: s.string(),
        slug: s.slug('global'),
        date: s.isodate(),
        author: s.string(),
        excerpt: s.string().optional(),
        tags: s.array(s.string()).optional(),
        category: s.enum(['tech', 'design', 'business']).optional(),
        published: s.boolean().default(false),
        featuredImage: s.string().optional(),
        body: s.mdx()
      }).transform(data => ({
        ...data,
        permalink: `/blog/${data.slug}`,
        readingTime: Math.ceil(data.body.split(' ').length / 200)
      }))
    },
    authors: {
      name: 'Author',
      pattern: 'content/authors/**/*.mdx',
      schema: s.object({
        name: s.string(),
        slug: s.slug('global'),
        bio: s.string(),
        avatar: s.string().optional(),
        twitter: s.string().optional(),
        website: s.string().optional(),
        body: s.mdx()
      })
    },
    categories: {
      name: 'Category',
      pattern: 'content/categories/**/*.mdx',
      schema: s.object({
        name: s.string(),
        slug: s.slug('global'),
        description: s.string(),
        color: s.string().optional(),
        body: s.mdx()
      })
    }
  }
})
```

### Payload Configuration

The `payload.config.ts` generates Payload collections from schemas:

```typescript
import { buildConfig } from 'payload/config'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { discoverSchemas } from '@mdxdb/core'

// Discover schemas from .db folder
const schemas = await discoverSchemas('./.db')

export default buildConfig({
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000',
  admin: {
    user: 'users',
  },
  collections: [
    // Auto-generated from schemas
    ...schemas.map(schema => ({
      slug: schema.collectionName,
      fields: Object.entries(schema.schema).map(([name, field]) => ({
        name,
        type: mapFieldType(field.type),
        required: field.required ?? false,
        // Additional field configuration based on type
      }))
    })),
    // Users collection for authentication
    {
      slug: 'users',
      auth: true,
      fields: [
        {
          name: 'role',
          type: 'select',
          options: ['admin', 'editor', 'author'],
          defaultValue: 'author'
        }
      ]
    }
  ],
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URL || 'file:./payload.db'
    }
  }),
  typescript: {
    outputFile: './payload-types.ts'
  }
})
```

## Usage Examples

### 1. Create Content via Admin UI

1. Start development server: `pnpm dev`
2. Navigate to `/admin`
3. Login with your credentials
4. Create posts, authors, and categories through the UI

### 2. Create Content via Files

Create `content/posts/my-post.mdx`:

```mdx
---
title: Getting Started with mdxdb
slug: getting-started
date: 2024-01-15
author: john-doe
excerpt: Learn how to build a blog with mdxdb and Payload CMS
tags: [tutorial, mdx, payload]
category: tech
published: true
featuredImage: /images/getting-started.jpg
---

# Getting Started with mdxdb

This is a comprehensive guide to building a blog with mdxdb.

## Key Features

- Schema-driven content management
- Multiple output formats
- Full-text search
- Responsive design

<Callout type="info">
  This blog is powered by mdxdb and Payload CMS!
</Callout>

## Getting Started

Install the dependencies:

\`\`\`bash
pnpm add @mdxdb/fs payload
\`\`\`

Then create your schema...
```

### 3. Query Content Programmatically

```typescript
import { MdxDb } from '@mdxdb/fs'

const db = new MdxDb(process.cwd())
await db.build()

// List all published posts
const publishedPosts = db.list('posts').filter(p => p.published)

// Get a specific post
const post = db.get('getting-started', 'posts')

// Search posts
const results = publishedPosts.filter(p =>
  p.title.toLowerCase().includes('mdx') ||
  p.excerpt?.toLowerCase().includes('mdx')
)

// Get posts by category
const techPosts = publishedPosts.filter(p => p.category === 'tech')

// Get posts by tag
const tutorialPosts = publishedPosts.filter(p =>
  p.tags?.includes('tutorial')
)

// Get post author
const author = db.get(post.author, 'authors')
```

### 4. Render with Different Output Formats

**HTML Output (Hono):**

```typescript
import { createHtmlApp } from 'mdxe/outputs/hono/html'
import { MdxDb } from '@mdxdb/fs'

const db = new MdxDb(process.cwd())
await db.build()

const app = createHtmlApp({
  basePath: '/blog/',
  collections: ['posts', 'authors', 'categories'],
  mdxdb: db,
  siteTitle: 'My Blog',
  siteDescription: 'A blog powered by mdxdb',
  typographyTheme: 'slate'
})

// Deploy to Cloudflare Workers
export default app
```

**Markdown API (Hono):**

```typescript
import { createMarkdownApp } from 'mdxe/outputs/hono/markdown'

const app = createMarkdownApp({
  basePath: '/api/blog/',
  collections: ['posts'],
  mdxdb: db,
  includeFrontmatter: true,
  cacheDuration: 3600
})

// GET /api/blog/posts -> List posts as JSON
// GET /api/blog/posts/slug -> Get post as Markdown
```

**CLI Output (React-ink):**

```typescript
import { renderMdxToInk } from 'mdxe/outputs/react-ink'
import { MdxDb } from '@mdxdb/fs'

const db = new MdxDb(process.cwd())
await db.build()

const post = db.get('getting-started', 'posts')

// Render to CLI
await renderMdxToInk(post.body, {
  components: {
    // Custom CLI components
  },
  colorize: true
})
```

## Available Scripts

```json
{
  "scripts": {
    "dev": "mdxe dev",                    // Development server
    "build": "mdxe build",                // Production build
    "start": "mdxe start",                // Start production server
    "admin": "payload dev",               // Payload admin only
    "db:build": "mdxdb build",            // Build mdxdb
    "db:export": "mdxdb export",          // Export to JSON
    "generate:posts": "mdxai generate"    // AI content generation
  }
}
```

## Deployment

### Deploy to Vercel

```bash
# Install Vercel CLI
pnpm add -g vercel

# Deploy
vercel
```

### Deploy to Cloudflare Pages

```bash
# Install Wrangler
pnpm add -g wrangler

# Deploy
pnpm build
wrangler pages deploy .next
```

### Deploy Admin UI Separately

Deploy the Payload admin interface separately:

```bash
# Build admin
payload build

# Deploy to your server
```

## Customization

### Custom Themes

Edit `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          // ... your color scale
        }
      },
      typography: {
        DEFAULT: {
          css: {
            // Custom typography styles
          }
        }
      }
    }
  }
}
```

### Custom Components

Create `mdx-components.tsx`:

```typescript
import { Button, Card, Callout } from 'mdxui'

export function useMDXComponents() {
  return {
    Button,
    Card,
    Callout,
    // Custom components
    CodeBlock: ({ children, language }) => {
      // Custom code block renderer
    },
    Newsletter: () => {
      // Newsletter signup component
    }
  }
}
```

### Custom Payload Fields

Extend the generated Payload config:

```typescript
import baseConfig from './payload.config'

export default {
  ...baseConfig,
  collections: baseConfig.collections.map(collection => {
    if (collection.slug === 'posts') {
      return {
        ...collection,
        fields: [
          ...collection.fields,
          {
            name: 'seoTitle',
            type: 'text',
            label: 'SEO Title'
          },
          {
            name: 'seoDescription',
            type: 'textarea',
            label: 'SEO Description'
          }
        ]
      }
    }
    return collection
  })
}
```

## Advanced Features

### Full-Text Search

```typescript
// Using SQLite backend for search
import { MdxDbSqlite } from '@mdxdb/sqlite'

const db = new MdxDbSqlite({
  url: 'file:./content.db',
  packageDir: process.cwd()
})

await db.build()

// Vector search
const results = await db.search('mdx tutorial', 'posts')
```

### Content Relationships

Link posts to authors and categories:

```typescript
const post = db.get('my-post', 'posts')
const author = db.get(post.author, 'authors')
const category = db.get(post.category, 'categories')

// Get all posts by author
const authorPosts = db.list('posts').filter(p => p.author === author.slug)

// Get all posts in category
const categoryPosts = db.list('posts').filter(p => p.category === category.slug)
```

### RSS Feed

Generate RSS feed:

```typescript
import { Feed } from 'feed'

const feed = new Feed({
  title: 'My Blog',
  description: 'Blog description',
  id: 'https://myblog.com',
  link: 'https://myblog.com',
  language: 'en'
})

db.list('posts')
  .filter(p => p.published)
  .forEach(post => {
    feed.addItem({
      title: post.title,
      id: post.permalink,
      link: `https://myblog.com${post.permalink}`,
      description: post.excerpt,
      date: new Date(post.date)
    })
  })

// Save RSS feed
await fs.writeFile('public/rss.xml', feed.rss2())
```

## Troubleshooting

### Admin UI not loading

Ensure `PAYLOAD_SECRET` is set in `.env.local`:
```env
PAYLOAD_SECRET=your-secret-key
```

### Database errors

Delete and rebuild the database:
```bash
rm payload.db
pnpm dev
```

### Build errors

Clear `.next` cache:
```bash
rm -rf .next
pnpm build
```

## Learn More

- [mdxdb Documentation](../../packages/mdxdb/README.md)
- [mdxe Documentation](../../packages/mdxe/README.md)
- [Payload CMS Documentation](https://payloadcms.com/docs)
- [Velite Documentation](https://velite.js.org)

## License

MIT
