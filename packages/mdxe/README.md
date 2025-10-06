# mdxe + .do Platform

Zero-config CLI for MDX development with **built-in .do platform integration**.

## ✨ What You Get

- 🔐 **Authentication** - WorkOS OAuth (Google, Microsoft, Okta)
- 🤖 **AI Capabilities** - LLM, embeddings, models via `sdk.ai`
- 💼 **Business Runtime** - Data operations via `sdk.$`
- 🌐 **API Infrastructure** - REST and RPC clients
- ⚡ **Real-time Features** - Events, scheduling, messaging
- 🎨 **Next.js + React** - Modern web development
- 📝 **MDX First** - Content as code with components

## 🚀 Quick Start

```bash
# Install mdxe
npm install mdxe

# Start dev server (browser auto-opens with login)
npx mdxe dev

# That's it! No configuration needed.
```

## Installation

```bash
npm install mdxe
# or
pnpm add mdxe
# or
yarn add mdxe
```

## Quick Start

```bash
# Authenticate (comes with mdxe)
npx do login

# Run development server
npx mdxe dev

# Build for production
npx mdxe build

# Run tests
npx mdxe test
```

## Features

### 🔐 Built-in .do Platform Authentication

Authentication works automatically via WorkOS OAuth:
- Sign in with Google, Microsoft, Okta, etc.
- No WorkOS account setup needed (uses .do platform credentials)
- Browser-based OAuth flow
- Tokens shared across all .do packages

### 🤖 .do Platform SDK

Access AI and business capabilities directly in your MDX:

```tsx
'use client'

import { useAI, use$ } from '../components/sdk-provider'

export function MyComponent() {
  const ai = useAI()  // Get AI capabilities
  const $ = use$()    // Get Business runtime

  async function generate() {
    // AI text generation
    const result = await ai.llm.post('/generate', {
      prompt: 'Write a haiku'
    })

    // Business operations (uses CapnWeb - queues until awaited)
    $.db.insert('haikus', { text: result.text })
    $.send('notifications', { message: 'New haiku!' })

    // Only await when you need the result
    const saved = await $.db.query('SELECT * FROM haikus ORDER BY id DESC LIMIT 1')

    return saved
  }

  return <button onClick={generate}>Generate</button>
}
```

**SDK Structure:**
- `sdk.ai` - AI capabilities (LLM, embeddings, models)
- `sdk.$` - Business runtime containing:
  - `$.api` - API client infrastructure
  - `$.db` - Database operations
  - `$.every` - Event scheduling
  - `$.on` - Event handlers
  - `$.send` - Messaging

**Convenience hooks:**
- `useSDK()` - Returns `{ ai, $ }`
- `use$()` - Returns `$` (business runtime)
- `useAI()` - Returns `ai` (AI capabilities)

### ⚡ CapnWeb: Zero-Latency RPC

**IMPORTANT:** The business runtime (`$`) uses **CapnWeb** which queues operations automatically:

```tsx
// ❌ Don't do this (unnecessary awaits)
await $.db.insert('users', user)
await $.db.insert('logs', log)
await $.send('notifications', notification)

// ✅ Do this (queues as single RPC batch)
$.db.insert('users', user)
$.db.insert('logs', log)
$.send('notifications', notification)

// Only await when you need the result
const user = await $.db.query('SELECT * FROM users WHERE id = ?', [id])
```

**Key Benefits:**
- 🚀 **Zero latency** - Operations queue automatically
- 📦 **Automatic batching** - Multiple calls = single RPC
- 🔄 **Streaming results** - Get data as soon as available
- ⚡ **Pipeline efficiency** - No round-trip overhead

This is why `$` operations feel instant - they're queued locally and batched over the network!

### ⚡ Zero Configuration

Just create `.mdx` files and run `mdxe dev`. That's it!

```bash
# Create your first MDX file
echo "# Hello World" > index.mdx

# Start development
npx mdxe dev
```

### 📝 Embedded CMS

mdxe includes Payload CMS for content management:
- Visual editor for MDX files
- Media management
- User permissions
- Custom collections

### 🎨 Multiple Output Formats

- **Next.js** - Full-featured web applications
- **Hono** - Lightweight serverless workers
- **Static** - Pre-rendered HTML
- **React** - Component libraries

### 🧪 Literate Testing - Documentation that Tests Itself

**Make your documentation self-verifying** with executable code blocks and automatic assertions.

#### Quick Start

Add `assert` or `doc` meta to TypeScript code blocks:

```mdx
# My Document

\`\`\`ts assert
const sum = 10 + 20
expect(sum).toBe(30)
\`\`\`
```

Run tests:
```bash
pnpm test:doc path/to/file.mdx --verbose
```

#### What is Literate Testing?

Literate testing turns documentation into living tests:
- **Code blocks execute** and verify behavior
- **Assertions inject** results as inline comments
- **Documentation stays** accurate automatically
- **Examples become** test cases

#### Meta Tags

**`ts assert`** - Enable assertions and output capture:
```mdx
\`\`\`ts assert
const user = { name: 'Alice', age: 30 }
expect(user.name).toBe('Alice')
expect(user.age).toBeGreaterThan(18)
\`\`\`
```

**`ts doc`** - Output capture only (no assertions):
```mdx
\`\`\`ts doc
const sum = 5 + 10
console.log('Sum:', sum)
\`\`\`
```

#### Assertion API

Full Vitest-compatible expect() API:

```typescript
// Equality
expect(value).toBe(expected)           // Strict equality (===)
expect(value).toEqual(expected)        // Deep equality
expect(value).toBeDefined()            // Not undefined
expect(value).toBeNull()               // Exactly null
expect(value).toBeTruthy()             // Truthy value
expect(value).toBeFalsy()              // Falsy value

// Comparisons
expect(value).toBeGreaterThan(n)       // value > n
expect(value).toBeLessThan(n)          // value < n
expect(value).toBeGreaterThanOrEqual(n) // value >= n
expect(value).toBeLessThanOrEqual(n)   // value <= n

// Strings
expect(str).toContain(substring)       // String includes
expect(str).toMatch(/pattern/)         // Regex match

// Arrays
expect(arr).toContain(item)            // Array includes
expect(arr).toHaveLength(n)            // Array length

// Objects
expect(obj).toHaveProperty('key')      // Has property
expect(obj).toMatchObject(partial)     // Contains properties
```

#### Auto-Update Mode

Inject assertion results as inline comments:

```bash
# Run with --update flag
pnpm test:doc file.mdx --update --verbose
```

**Before:**
```ts
const sum = 10 + 20
expect(sum).toBe(30)
```

**After:**
```ts
const sum = 10 + 20
expect(sum).toBe(30)
// ✅ Expected 30 to be 30
```

#### Test Output

**Passing tests:**
```
📊 Document Test Results

📄 my-document.mdx
   Blocks: 3/3 passed (100%)
   Assertions: 6/6 passed (100%)

✅ All tests passed!
```

**Failing tests:**
```
📊 Document Test Results

📄 my-document.mdx
   Blocks: 2/3 passed (67%)
   Assertions: 5/6 passed (83%)

❌ 1 test failed:

Block 2:
  ❌ Expected 30 to be 25
     Expected: 25
     Actual: 30
```

#### Examples

**AI Generation Tests:**
```mdx
\`\`\`ts assert
import { generate } from 'mdxai'

const result = await generate('Write a haiku')
const content = await result.text()

expect(content).toBeDefined()
expect(content.length).toBeGreaterThan(10)
\`\`\`
```

**Database Tests:**
```mdx
\`\`\`ts assert
import { MdxDbFs } from '@mdxdb/fs'

const db = new MdxDbFs()
await db.build()

const posts = db.list('posts')
expect(Array.isArray(posts)).toBe(true)
expect(posts.length).toBeGreaterThan(0)
\`\`\`
```

#### Advanced Usage

**Multiple assertions:**
```typescript
const user = {
  name: 'Alice',
  age: 30,
  email: 'alice@example.com'
}

expect(user).toBeDefined()
expect(user.name).toBe('Alice')
expect(user.age).toBeGreaterThan(18)
expect(user.email).toContain('@')
```

**Async operations:**
```typescript
const data = await fetch('/api/users')
const users = await data.json()

expect(users).toBeDefined()
expect(Array.isArray(users)).toBe(true)
expect(users[0]).toHaveProperty('id')
```

**Error handling:**
```typescript
try {
  const result = riskyOperation()
  expect(result).toBeDefined()
} catch (error) {
  expect(error.message).toContain('expected error')
}
```

#### Integration with Monaco Editor

Run tests directly in browser editor:
- Press **Cmd+Shift+T** (Mac) or **Ctrl+Shift+T** (Windows)
- Click **Run Tests** button
- See results inline with ✅/❌ indicators

See `@mdxui/browser` for Monaco integration details.

#### Commands

```bash
# Run document tests
pnpm test:doc path/to/file.mdx

# With verbose output
pnpm test:doc path/to/file.mdx --verbose

# Auto-inject assertion results
pnpm test:doc path/to/file.mdx --update

# Skip authentication
pnpm test:doc path/to/file.mdx --skip-auth

# Test multiple files
pnpm test:doc tests/**/*.test.mdx
```

Run with: `pnpm test:doc`

## Commands

### Development

```bash
# Start development server
mdxe dev

# Specify port
mdxe dev --port 3000

# Open browser automatically
mdxe dev --open
```

### Build

```bash
# Build for production
mdxe build

# Build for specific platform
mdxe build --target next
mdxe build --target hono
mdxe build --target static
```

### Testing

```bash
# Run tests
mdxe test

# Watch mode
mdxe test --watch

# Coverage report
mdxe test --coverage
```

### Other Commands

```bash
# Lint MDX files
mdxe lint

# Type check
mdxe typecheck

# Send content to external service
mdxe send <destination>
```

## Authentication

### Automatic Authentication (Recommended)

```bash
# Authenticate once
npx do login

# mdxe automatically uses your token
npx mdxe dev
```

### Skip Authentication

For local development without authentication:

```bash
mdxe dev --skip-auth
```

### Check Authentication Status

```typescript
import { isAuthenticated, getCurrentUser } from 'mdxe/auth'

if (isAuthenticated()) {
  const user = await getCurrentUser()
  console.log(`Authenticated as ${user.email}`)
}
```

## Configuration

mdxe works with zero configuration, but you can customize it with `mdxe.config.ts`:

```typescript
import { defineConfig } from 'mdxe'

export default defineConfig({
  // Content directory
  contentDir: './content',

  // Output directory
  outDir: './dist',

  // Target platform
  target: 'next',

  // Payload CMS configuration
  cms: {
    enabled: true,
    collections: ['posts', 'pages']
  },

  // MDX plugins
  mdxPlugins: [
    remarkGfm,
    remarkFrontmatter
  ]
})
```

## MDX Features

### Frontmatter

```mdx
---
title: My Post
date: 2025-10-04
tags: [mdx, javascript]
---

# {frontmatter.title}

Published on {frontmatter.date}
```

### Components

Import and use React components:

```mdx
import { Button } from '@/components/Button'

# Welcome

<Button onClick={() => alert('Hello!')}>
  Click me
</Button>
```

### Code Execution

Execute TypeScript code blocks:

```mdx
\`\`\`typescript
const greeting = "Hello from MDX!"
console.log(greeting)
\`\`\`
```

### Schema.org Support

Add structured data with YAML-LD:

```mdx
---
'@context': 'https://schema.org'
'@type': Article
headline: 'My Article'
author:
  '@type': Person
  name: 'Jane Doe'
---

# My Article

Content here...
```

## Payload CMS Integration

mdxe includes Payload CMS for content management:

### Access the CMS

```bash
# Start development server
npx mdxe dev

# Access CMS at:
http://localhost:3000/admin
```

### Default Collections

- **Posts** - Blog posts and articles
- **Pages** - Static pages
- **Media** - Images and files

### Custom Collections

```typescript
// payload.config.ts
export default {
  collections: [
    {
      slug: 'products',
      fields: [
        { name: 'name', type: 'text' },
        { name: 'price', type: 'number' },
        { name: 'description', type: 'richText' }
      ]
    }
  ]
}
```

## API Reference

### Authentication Utilities

```typescript
import {
  isAuthenticated,
  getCurrentUser,
  ensureAuthenticated,
  getAccessToken
} from 'mdxe/auth'

// Check if user is authenticated
const authenticated = isAuthenticated()

// Get current user
const user = await getCurrentUser()

// Ensure authenticated (prompts if not)
await ensureAuthenticated()

// Get access token for API calls
const token = await getAccessToken()
```

### MDX Utilities

```typescript
import {
  findMdxFiles,
  parseMdxFile,
  findIndexFile
} from 'mdxe'

// Find all MDX files in directory
const files = await findMdxFiles('./content')

// Parse MDX file
const { frontmatter, content } = await parseMdxFile('./post.mdx')

// Find index file (index.mdx, README.mdx, etc.)
const indexFile = await findIndexFile('./content')
```

## Deployment

### Cloudflare Pages

```bash
# Build for Cloudflare
mdxe build --target hono

# Deploy
wrangler pages deploy dist
```

### Vercel

```bash
# Build for Next.js
mdxe build --target next

# Deploy
vercel deploy
```

### Netlify

```bash
# Build static site
mdxe build --target static

# Deploy
netlify deploy --dir=dist
```

## Examples

See the [examples directory](../../examples) for complete examples:

- **Blog** - Simple blog with posts
- **Deck** - Slide presentation
- **Minimal** - Bare minimum setup
- **Payload Blog** - Blog with CMS

## Related Packages

- **[token.do](https://github.com/dot-do/sdk/tree/main/packages/token.do)** - Shared authentication
- **[cli.do](https://github.com/dot-do/sdk/tree/main/packages/cli.do)** - Authentication CLI (`do` command)
- **[@mdxdb/core](../mdxdb/core)** - MDX database utilities
- **[mdxai](../mdxai)** - AI-powered content generation

## Troubleshooting

### Authentication Required

If you see "Authentication required":

```bash
# Login with the do command
npx do login

# Or skip auth for local development
npx mdxe dev --skip-auth
```

### Port Already in Use

```bash
# Use a different port
npx mdxe dev --port 3001
```

### Build Errors

```bash
# Clean and rebuild
rm -rf dist .mdxe
npx mdxe build
```

## Links

- **Documentation:** [mdx.org.ai](https://mdx.org.ai)
- **GitHub:** [dot-do/mdx](https://github.com/dot-do/mdx)
- **Issues:** [GitHub Issues](https://github.com/dot-do/mdx/issues)

## License

MIT
