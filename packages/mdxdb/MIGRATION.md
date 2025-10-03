# mdxdb Migration Guide

This guide helps you migrate to the latest version of mdxdb and understand the evolution of the API.

## Table of Contents

- [Migration from v0.0.x to v0.1.x](#migration-from-v00x-to-v01x)
- [New Features in v0.1.x](#new-features-in-v01x)
- [Breaking Changes](#breaking-changes)
- [Upgrade Path](#upgrade-path)
- [Future Roadmap](#future-roadmap)

## Migration from v0.0.x to v0.1.x

### Package Structure Changes

**Old Structure (v0.0.x):**
```typescript
import { MdxDb } from 'mdxdb'
```

**New Structure (v0.1.x):**
```typescript
// Choose your implementation
import { MdxDb } from '@mdxdb/fs'        // File system with Velite
import { MdxDbSqlite } from '@mdxdb/sqlite'  // SQLite with embeddings
import { /* types */ } from '@mdxdb/core'    // Shared types
```

### API Changes

#### 1. Initialization

**Old:**
```typescript
const db = new MdxDb()
```

**New:**
```typescript
const db = new MdxDb(process.cwd())  // Explicit directory required
```

#### 2. Building the Database

**Old:**
```typescript
await db.build()
```

**New:**
```typescript
const data = await db.build()  // Returns built data
console.log(data.posts)  // Access collections directly
```

#### 3. Schema Discovery

**New Feature (v0.1.x):**
```typescript
import { discoverSchemas } from '@mdxdb/core'

const schemas = await discoverSchemas('./.db')
console.log(schemas)
// [
//   {
//     collectionName: 'posts',
//     source: 'frontmatter',
//     schema: { title: { type: 'string', ... }, ... }
//   }
// ]
```

#### 4. Collection API

**Old:**
```typescript
const posts = db.posts.all()
const post = db.posts.get('slug')
```

**New:**
```typescript
const posts = db.list('posts')  // Returns array
const post = db.get('slug', 'posts')  // Collection name required
```

#### 5. CRUD Operations

**Creating Documents:**

Old:
```typescript
await db.posts.create({ slug: 'test', title: 'Test', body: 'Content' })
```

New:
```typescript
await db.set('test', {
  frontmatter: { title: 'Test' },
  body: '# Test\n\nContent'
}, 'posts')
```

**Deleting Documents:**

Old:
```typescript
await db.posts.delete('slug')
```

New:
```typescript
await db.delete('slug', 'posts')  // Returns boolean
```

## New Features in v0.1.x

### 1. Schema Discovery from `.db` Folder

Place schema definitions in a `.db/` folder for automatic discovery:

**`.db/blog-schema.md`:**
```markdown
---
collections:
  posts:
    title: Post title
    date: Publication date (date)
    tags: Post tags (array)
    published: Whether published (boolean)
---

# Blog Schema
```

Or use heading-based schemas:

```markdown
# Posts Schema

\`\`\`yaml
title: Post title
date: Publication date (date)
tags: Post tags (array)
published: Whether published (boolean)
\`\`\`
```

### 2. Type Annotations

Schemas now support rich type annotations:

```yaml
# Basic types
name: Field description (string)
age: Field description (number)
active: Field description (boolean)
birthday: Field description (date)
tags: Field description (array)

# Enum types
status: Field description (active | inactive | pending)

# Or standalone
status: active | inactive | pending
```

### 3. Multiple Schema Sources

You can define schemas in:
- YAML frontmatter (collections key)
- YAML code blocks under headings
- Multiple schemas per file

### 4. SQLite Backend (Experimental)

**New in v0.1.x:**
```typescript
import { MdxDbSqlite } from '@mdxdb/sqlite'

const db = new MdxDbSqlite({
  url: 'file:./content.db',
  packageDir: process.cwd()
})

await db.build()

// Vector search (SQLite only)
const results = await db.search('query text', 'posts')
```

### 5. Git Integration

Both `@mdxdb/fs` and `@mdxdb/sqlite` track git history:

```typescript
const post = db.get('my-post', 'posts')
console.log(post.metadata.git)
// {
//   firstCommit: '2024-01-01T10:00:00Z',
//   lastCommit: '2024-01-15T14:30:00Z',
//   commitCount: 12
// }
```

### 6. Watch Mode

Monitor file changes in development:

```typescript
await db.watch()  // Start watching
// Make changes to files...
db.stopWatch()    // Stop watching
```

### 7. Export Functionality

Export database to JSON:

```typescript
await db.exportDb('./export')
// Creates JSON files for each collection
```

## Breaking Changes

### 1. Package Naming

- ❌ `mdxdb` → ✅ `@mdxdb/fs` or `@mdxdb/sqlite`

### 2. Constructor Signature

- ❌ `new MdxDb()` → ✅ `new MdxDb(directory)`

### 3. Method Signatures

- ❌ `db.posts.all()` → ✅ `db.list('posts')`
- ❌ `db.posts.get(slug)` → ✅ `db.get(slug, 'posts')`
- ❌ `db.posts.create(data)` → ✅ `db.set(id, data, 'posts')`
- ❌ `db.posts.delete(slug)` → ✅ `db.delete(slug, 'posts')`

### 4. Velite Configuration

**Old:**
No explicit Velite configuration needed.

**New:**
Requires `velite.config.ts` in project root:

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
        body: s.mdx()
      })
    }
  }
})
```

### 5. Return Types

**Old:**
```typescript
await db.build()  // void
```

**New:**
```typescript
const data = await db.build()  // Returns CollectionData
console.log(data)  // { posts: [...], pages: [...] }
```

## Upgrade Path

### Step 1: Update Package Dependencies

```bash
# Remove old package
pnpm remove mdxdb

# Install new packages
pnpm add @mdxdb/fs @mdxdb/core
# Or for SQLite
pnpm add @mdxdb/sqlite @mdxdb/core
```

### Step 2: Update Imports

```typescript
// Before
import { MdxDb } from 'mdxdb'

// After
import { MdxDb } from '@mdxdb/fs'
import { discoverSchemas } from '@mdxdb/core'
```

### Step 3: Create Velite Config

Create `velite.config.ts` in your project root:

```typescript
import { defineConfig, s } from 'velite'

export default defineConfig({
  collections: {
    // Your collections here
    posts: {
      name: 'Post',
      pattern: 'content/posts/**/*.mdx',
      schema: s.object({
        title: s.string(),
        slug: s.slug('global'),
        body: s.mdx()
      })
    }
  }
})
```

### Step 4: Update Initialization

```typescript
// Before
const db = new MdxDb()

// After
const db = new MdxDb(process.cwd())
```

### Step 5: Update Method Calls

```typescript
// Before
const posts = db.posts.all()
const post = db.posts.get('slug')
await db.posts.create({ slug: 'test', ... })
await db.posts.delete('slug')

// After
const posts = db.list('posts')
const post = db.get('slug', 'posts')
await db.set('test', { frontmatter: {...}, body: '...' }, 'posts')
await db.delete('slug', 'posts')
```

### Step 6: Handle Build Return Value

```typescript
// Before
await db.build()
// Use db methods...

// After
const data = await db.build()
console.log(data.posts)  // Direct access if needed
// Or continue using db methods
```

### Step 7: Optional - Add Schema Discovery

Create a `.db` folder with schema definitions:

```bash
mkdir .db
```

**`.db/schemas.md`:**
```markdown
---
collections:
  posts:
    title: Post title
    slug: URL slug (string)
    date: Publication date (date)
---
```

## Future Roadmap

### Planned for v0.2.x

1. **Payload CMS Integration**
   - D1/SQLite adapter for Payload
   - Automatic collection generation from schemas
   - Admin UI for content management

2. **Enhanced Worker Loader Support**
   - Real-time MDX evaluation in Workers
   - Secure sandboxing for untrusted code
   - Dynamic imports with type safety

3. **Multiple Output Formats**
   - Hono (markdown + HTML modes)
   - React-ink (CLI rendering)
   - MCP protocol (AI agent integration)

4. **Advanced Schema Features**
   - Relationship types (one-to-one, one-to-many)
   - Validation rules (min/max, regex)
   - Computed fields
   - Hooks (beforeSave, afterSave)

### Planned for v0.3.x

1. **Performance Optimizations**
   - Incremental builds
   - Parallel processing
   - Smart caching

2. **Advanced Querying**
   - Filter, sort, paginate
   - Full-text search (all backends)
   - Aggregations

3. **Migration Tools**
   - Schema versioning
   - Data migrations
   - Backup/restore utilities

## Troubleshooting

### Common Issues

#### 1. "Cannot find module '@mdxdb/fs'"

**Solution:** Ensure you've installed the new packages:
```bash
pnpm add @mdxdb/fs @mdxdb/core
```

#### 2. "Velite config not found"

**Solution:** Create `velite.config.ts` in your project root. See [Step 3](#step-3-create-velite-config).

#### 3. "Collection not found"

**Solution:** Ensure collection name matches your Velite config:
```typescript
// velite.config.ts defines 'posts'
db.list('posts')  // ✅ Correct
db.list('Posts')  // ❌ Wrong (case sensitive)
```

#### 4. Type errors after upgrade

**Solution:** Update your TypeScript interfaces:
```typescript
import type { DocumentContent, CollectionData } from '@mdxdb/core'

const content: DocumentContent = {
  frontmatter: { title: 'Test' },
  body: '# Content'
}
```

#### 5. Watch mode not detecting changes

**Solution:** Ensure your editor saves files correctly and you're watching the right directory:
```typescript
const db = new MdxDb(process.cwd())  // Watch from project root
await db.watch()
```

## Getting Help

- **Documentation:** [packages/mdxdb/README.md](./README.md)
- **Issues:** https://github.com/dot-do/mdx/issues
- **Examples:** [examples/](../../examples/)

## Version History

### v0.1.2 (Current)
- Enhanced schema discovery
- Git metadata integration
- Export functionality
- Bug fixes

### v0.1.0
- Monorepo restructure (@mdxdb/fs, @mdxdb/core, @mdxdb/sqlite)
- Schema discovery from `.db` folder
- Type annotations in schemas
- SQLite backend (experimental)

### v0.0.x (Legacy)
- Initial implementation
- Basic CRUD operations
- Single package structure
