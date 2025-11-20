# @mdxdb/core

Core utilities for treating MDX files as a database.

## 🎉 Auto-Authenticated with `do login`

Install @mdxdb/core and get the `do` command automatically:

```bash
# Install @mdxdb/core
npm install @mdxdb/core

# Authenticate once - works for ALL .do packages
npx do login

# @mdxdb/core is now automatically authenticated!
```

## Installation

```bash
npm install @mdxdb/core
# or
pnpm add @mdxdb/core
# or
yarn add @mdxdb/core
```

## Features

### 🔐 Automatic Authentication

@mdxdb/core automatically uses your token from `do login`:
- No configuration needed
- Secure token storage
- Works across all .do packages

### 📁 File-as-Database

Treat MDX files as a structured database:

```typescript
import { queryMdxFiles } from '@mdxdb/core'

// Query MDX files like a database
const posts = await queryMdxFiles('./content', {
  where: {
    status: 'published',
    tags: { contains: 'typescript' }
  },
  orderBy: { date: 'desc' },
  limit: 10
})
```

### 🏷️ Frontmatter Validation

Validate frontmatter with Zod schemas:

```typescript
import { z } from 'zod'
import { validateFrontmatter } from '@mdxdb/core'

const schema = z.object({
  title: z.string(),
  date: z.string().datetime(),
  tags: z.array(z.string())
})

const { data, errors } = await validateFrontmatter('./post.mdx', schema)
```

### 🔍 Advanced Queries

Powerful query capabilities:

```typescript
import { query } from '@mdxdb/core'

// Complex queries
const results = await query()
  .where('status', '==', 'published')
  .where('date', '>=', '2025-01-01')
  .where('tags', 'array-contains', 'react')
  .orderBy('date', 'desc')
  .limit(20)
  .get()
```

### 🏗️ Schema.org Support

Built-in support for Schema.org types:

```typescript
import { extractSchema } from '@mdxdb/core'

// Extract Schema.org data from MDX
const schema = await extractSchema('./article.mdx')
// Returns: { '@type': 'Article', headline: '...', ... }
```

## Quick Start

```typescript
import { createMdxDb } from '@mdxdb/core'

// Create database instance
const db = await createMdxDb('./content')

// Query files
const posts = await db.query({
  where: { type: 'post' },
  orderBy: { date: 'desc' }
})

// Get single file
const post = await db.get('posts/my-post.mdx')

// Search content
const results = await db.search('typescript')
```

## Authentication

### Automatic Authentication

All database operations automatically use your token from `do login`:

```typescript
import { getAuthHeaders } from '@mdxdb/core'

// Get auth headers for HTTP requests
const headers = await getAuthHeaders()
// Returns: { Authorization: 'Bearer ...' }
```

### Check Authentication

```typescript
import { isAuthenticated, getCurrentUser } from '@mdxdb/core'

if (isAuthenticated()) {
  const user = await getCurrentUser()
  console.log(`Authenticated as ${user.email}`)
}
```

## API Reference

### Database Operations

```typescript
import { createMdxDb } from '@mdxdb/core'

const db = await createMdxDb('./content')

// Query files
db.query(options)
db.get(path)
db.search(query)
db.find(predicate)

// Write operations
db.create(path, data)
db.update(path, data)
db.delete(path)
```

### Query API

```typescript
import { query } from '@mdxdb/core'

// Build queries
query()
  .where(field, operator, value)
  .orderBy(field, direction)
  .limit(count)
  .offset(count)
  .get()
```

**Operators:**
- `==` - Equal
- `!=` - Not equal
- `>` - Greater than
- `>=` - Greater than or equal
- `<` - Less than
- `<=` - Less than or equal
- `contains` - String contains
- `startsWith` - String starts with
- `endsWith` - String ends with
- `in` - Value in array
- `array-contains` - Array contains value

### Frontmatter API

```typescript
import {
  parseFrontmatter,
  validateFrontmatter,
  extractFrontmatter
} from '@mdxdb/core'

// Parse frontmatter
const { frontmatter, content } = await parseFrontmatter('./post.mdx')

// Validate with schema
const { data, errors } = await validateFrontmatter('./post.mdx', schema)

// Extract specific fields
const metadata = await extractFrontmatter('./post.mdx', ['title', 'date'])
```

### Taxonomy API

```typescript
import { getTags, getCategories, groupByTag } from '@mdxdb/core'

// Get all tags
const tags = await getTags('./content')

// Get all categories
const categories = await getCategories('./content')

// Group files by tag
const grouped = await groupByTag('./content')
```

### Authentication API

```typescript
import {
  isAuthenticated,
  getCurrentUser,
  getAccessToken,
  getAuthHeaders
} from '@mdxdb/core'

// Check authentication
const authenticated = isAuthenticated()

// Get current user
const user = await getCurrentUser()

// Get access token
const token = await getAccessToken()

// Get auth headers for HTTP requests
const headers = await getAuthHeaders()
```

## Integration with Other Packages

### With @mdxdb/fs

File system storage:

```typescript
import { createMdxDb } from '@mdxdb/core'
import { FsStorage } from '@mdxdb/fs'

const db = await createMdxDb('./content', {
  storage: new FsStorage()
})
```

### With @mdxdb/sqlite

SQLite storage for better performance:

```typescript
import { createMdxDb } from '@mdxdb/core'
import { SqliteStorage } from '@mdxdb/sqlite'

const db = await createMdxDb('./content', {
  storage: new SqliteStorage('./db.sqlite')
})
```

### With Velite

Build-time processing:

```typescript
import { defineConfig } from '@mdxdb/core'
import { velite } from '@mdxdb/velite'

export default defineConfig({
  plugins: [velite()]
})
```

## Examples

### Blog Post Query

```typescript
import { query } from '@mdxdb/core'

// Get published posts from last month
const posts = await query()
  .where('type', '==', 'post')
  .where('status', '==', 'published')
  .where('date', '>=', '2025-09-01')
  .where('date', '<', '2025-10-01')
  .orderBy('date', 'desc')
  .get()
```

### Tag-Based Filtering

```typescript
import { groupByTag } from '@mdxdb/core'

// Group posts by tag
const postsByTag = await groupByTag('./content/posts')

// Get posts for specific tag
const typescriptPosts = postsByTag['typescript']
```

### Full-Text Search

```typescript
import { search } from '@mdxdb/core'

// Search content
const results = await search('./content', 'typescript', {
  fields: ['title', 'content'],
  fuzzy: true,
  limit: 10
})
```

### Schema Validation

```typescript
import { z } from 'zod'
import { validateFrontmatter } from '@mdxdb/core'

const postSchema = z.object({
  title: z.string().min(1).max(100),
  date: z.string().datetime(),
  tags: z.array(z.string()),
  author: z.object({
    name: z.string(),
    email: z.string().email()
  }),
  status: z.enum(['draft', 'published'])
})

// Validate all posts
const posts = await glob('./content/posts/*.mdx')
for (const post of posts) {
  const { errors } = await validateFrontmatter(post, postSchema)
  if (errors.length > 0) {
    console.error(`Invalid frontmatter in ${post}:`, errors)
  }
}
```

## Related Packages

- **[token.do](https://github.com/dot-do/sdk/tree/main/packages/token.do)** - Shared authentication
- **[cli.do](https://github.com/dot-do/sdk/tree/main/packages/cli.do)** - Authentication CLI (`do` command)
- **[@mdxdb/fs](../fs)** - File system storage adapter
- **[@mdxdb/sqlite](../sqlite)** - SQLite storage adapter
- **[@mdxdb/importers](../importers)** - Import from various sources
- **[mdxe](../../mdxe)** - MDX development environment
- **[mdxai](../../mdxai)** - AI-powered content generation

## Links

- **Documentation:** [mdx.org.ai](https://mdx.org.ai)
- **GitHub:** [dot-do/mdx](https://github.com/dot-do/mdx)
- **Issues:** [GitHub Issues](https://github.com/dot-do/mdx/issues)

## License

MIT
