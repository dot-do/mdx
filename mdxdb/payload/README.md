# @mdxdb/payload

Payload CMS integration for mdxdb with unified D1 (Cloudflare Workers) and SQLite (local development) support.

## Features

- ✅ **Unified Adapter** - Works with both Cloudflare D1 and SQLite
- ✅ **Auto-generated Collections** - Generate Payload collections from YAML schemas
- ✅ **Context Switching** - Seamlessly switch between file system and database backends
- ✅ **Vector Embeddings** - Built-in support for vector search
- ✅ **Type-Safe** - Full TypeScript support with Drizzle ORM
- ✅ **Zero Config** - Auto-detects environment and configures accordingly

## Installation

```bash
pnpm add @mdxdb/payload
```

## Quick Start

### Auto-detect Environment

```typescript
import { createPayloadConfig, initializePayload } from '@mdxdb/payload'

// Auto-detects D1 (Workers) or SQLite (local) from environment
const payload = await initializePayload()
```

### Explicit Configuration

**D1 (Cloudflare Workers):**

```typescript
import { initializePayload } from '@mdxdb/payload'

export default {
  async fetch(request, env) {
    const payload = await initializePayload({
      database: { d1: env.DB }, // D1 binding
      secret: env.PAYLOAD_SECRET,
    })

    // Use payload...
  },
}
```

**SQLite (Local Development):**

```typescript
import { initializePayload } from '@mdxdb/payload'

const payload = await initializePayload({
  database: {
    url: 'file:./database.db',
    authToken: process.env.DATABASE_AUTH_TOKEN, // optional, for Turso
  },
  secret: process.env.PAYLOAD_SECRET,
})
```

## YAML Schema to Collections

Define collections in YAML and auto-generate Payload configurations:

```typescript
import { generateCollection } from '@mdxdb/payload'

const schema = {
  name: 'Blog Posts',
  slug: 'posts',
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Post Title',
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
    },
    {
      name: 'published',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'publishedAt',
      type: 'date',
    },
  ],
  admin: {
    useAsTitle: 'title',
  },
}

const collection = generateCollection(schema)
```

**Supported Field Types:**

- `text`, `string` → Payload `text`
- `textarea`, `longText` → Payload `textarea`
- `richText`, `markdown`, `mdx` → Payload `richText`
- `number`, `integer` → Payload `number`
- `checkbox`, `boolean` → Payload `checkbox`
- `date`, `datetime` → Payload `date`
- `select`, `enum` → Payload `select`
- `relationship`, `relation` → Payload `relationship`
- `json`, `object` → Payload `json`
- `array` → Payload `array`
- `email` → Payload `email`
- `url` → Payload `text`
- `slug` → Payload `text` (unique)

## Context Switching

Switch between file system and Payload backends:

```typescript
import { createPayloadContext } from '@mdxdb/payload'

// Use Payload backend
const context = createPayloadContext({
  mode: 'payload',
  database: { url: 'file:./database.db' },
})

// Create/update document
await context.set('my-doc', {
  frontmatter: { title: 'Hello World' },
  body: 'This is the content',
}, 'posts')

// Get document
const doc = await context.get('my-doc', 'posts')

// List documents
const docs = await context.listAsync('posts')

// Delete document
await context.delete('my-doc', 'posts')

// Search with vector embeddings
const results = await context.search('search query', 'posts')
```

## Default Collections

Two collections are included by default:

### Files Collection

Stores MDX files with:
- `slug` - Unique identifier
- `collection` - Collection name
- `frontmatter` - YAML frontmatter as JSON
- `mdx` - Full MDX content
- `markdown` - Markdown body
- `html` - Rendered HTML
- `code` - Compiled JavaScript

### Embeddings Collection

Stores vector embeddings for search:
- `fileId` - Reference to source file
- `content` - Text that was embedded
- `chunkType` - Type of chunk (document, frontmatter, section)
- `sectionPath` - Hierarchical path to section
- `vector` - 1536-dimensional embedding vector
- `collection` - Collection name

## Database Adapter

Low-level adapter for custom use cases:

```typescript
import { createDatabaseAdapter, detectDatabaseConfig } from '@mdxdb/payload'

// Auto-detect configuration
const config = detectDatabaseConfig(env)
const adapter = createDatabaseAdapter(config)

// Check adapter type
if (adapter.isD1()) {
  console.log('Running on Cloudflare D1')
} else if (adapter.isSqlite()) {
  console.log('Running on SQLite')
}

// Get Drizzle database instance
const db = adapter.getDatabase()
```

## Migration Guide

See [MIGRATION.md](./MIGRATION.md) for detailed documentation on:
- D1 vs SQLite differences
- Migration from SQLite to D1
- Migration from D1 to SQLite
- Configuration examples
- Troubleshooting

## Development Workflow

### Local Development (SQLite)

```bash
# Install dependencies
pnpm install

# Run tests
pnpm test

# Type check
pnpm typecheck

# Build
pnpm build
```

### Deploy to Cloudflare Workers (D1)

```bash
# Create D1 database
npx wrangler d1 create my-database

# Configure wrangler.jsonc
# {
#   "d1_databases": [{
#     "binding": "DB",
#     "database_name": "my-database",
#     "database_id": "..."
#   }]
# }

# Run migrations
pnpm payload migrate:create
npx wrangler d1 migrations apply my-database

# Deploy
npx wrangler deploy
```

## API Reference

### `createPayloadConfig(options)`

Create Payload configuration.

**Options:**
- `database?: DatabaseConfig` - Database configuration
- `collections?: SchemaCollection[]` - Additional collections
- `secret?: string` - JWT secret
- `admin?: { disable?: boolean, user?: string }` - Admin panel config
- `embeddings?: boolean` - Enable vector embeddings (default: true)

### `initializePayload(options)`

Initialize Payload CMS instance.

Returns: `Promise<Payload>`

### `getPayloadClient(options)`

Get cached Payload client.

Returns: `Promise<Payload>`

### `createDatabaseAdapter(config)`

Create database adapter.

**Config:**
- `d1?: D1Database` - D1 binding (Workers)
- `url?: string` - SQLite URL (local)
- `authToken?: string` - Auth token (optional, for Turso)
- `inMemory?: boolean` - Use in-memory database

Returns: `PayloadDatabaseAdapter`

### `generateCollection(schema)`

Generate Payload collection from YAML schema.

Returns: `CollectionConfig`

### `createPayloadContext(options)`

Create context for switching between backends.

Returns: `PayloadContext`

## TypeScript Support

Full TypeScript support with auto-generated types:

```typescript
import type {
  DatabaseConfig,
  SchemaCollection,
  SchemaField,
  PayloadConfigOptions,
  PayloadContextOptions,
} from '@mdxdb/payload'
```

## Examples

### Complete Example

```typescript
import { initializePayload, createPayloadContext, generateCollections } from '@mdxdb/payload'

// Define schemas
const schemas = [
  {
    name: 'Blog Posts',
    slug: 'posts',
    fields: [
      { name: 'title', type: 'text', required: true },
      { name: 'content', type: 'richText', required: true },
    ],
  },
]

// Initialize Payload with custom collections
const payload = await initializePayload({
  collections: schemas,
  secret: process.env.PAYLOAD_SECRET,
})

// Create context
const context = createPayloadContext({
  mode: 'payload',
})

// Use mdxdb interface
await context.set('hello-world', {
  frontmatter: { title: 'Hello World' },
  body: '# Hello World\n\nThis is my first post!',
}, 'posts')

const doc = await context.get('hello-world', 'posts')
console.log(doc.title) // "Hello World"
```

## Resources

- [Payload CMS Documentation](https://payloadcms.com/docs)
- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Migration Guide](./MIGRATION.md)

## License

MIT
