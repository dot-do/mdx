# MDX Ecosystem

A monorepo providing the foundational MDX ecosystem for AI-native content with linked data capabilities.

## What is MDX?

**MDX = Markdown + JSX + Linked Data + AI**

MDX extends Markdown by combining:
- **Unstructured content** via Markdown
- **Structured data** via YAML frontmatter (YAML-LD)
- **Executable code** via JavaScript/TypeScript
- **UI components** via JSX/React
- **Linked data** via JSON-LD integration

This repository implements key MDX standards:
- [mdxld.org](https://mdxld.org) - Linked data for MDX
- [mdx.org.ai](https://mdx.org.ai) - AI-native MDX capabilities
- [schema.org.ai](https://schema.org.ai) - Semantic web vocabulary

## Repository Scope

### ✅ Belongs in This Repo

**MDX-Specific Functionality:**
- Directly processes, generates, or manipulates MDX files
- Integrates MDX with other tools/frameworks
- Provides MDX-specific developer experience

**MDX Standards Implementation:**
- mdxld.org - Linked data for MDX
- mdx.org.ai - AI-native MDX capabilities
- schema.org.ai - Semantic web vocabulary

**Core MDX Packages:**
- mdxai - AI-powered MDX generation
- mdxdb - MDX as a database
- mdxe - MDX development environment
- mdxld - MDX linked data
- mdxui - MDX UI components
- mdxtra - MDX integrations

### ❌ Does NOT Belong

- Generic AI functions → Use [@dot-do/ai](https://github.com/dot-do/ai) instead
- Project-specific code → Use projects/ repo
- Experimental code → Use experiments/ repo
- Research notes → Use /notes directory

## Core Packages

## [`mdxai`](./packages/mdxai) - Generate & Edit Markdown & MDX

```bash
mdxai generate 100 blog post titles about the future of work post-AGI
```

## [`mdxdb`](./packages/mdxdb) - Markdown/MDX Files as a Database

```ts
import { ai } from 'mdxai'
import { db } from '@mdxdb/fs'

const count = 100
const topic = 'the future of work post-AGI'
const titles = await ai.list`${count} blog post titles about ${topic}`

for (const title of titles) {
  const post = await ai`Write a blog post about ${title}`
  await db.set(`blog/${title.replace(' ', '_')}`, post)
}
```

## [`mdxld`](./packages/mdxld) - Linked Data for Markdown & MDX

MDXLD builds upon the foundations of Linked Data like (JSON-LD and YAML-LD) with ontologies like [schema.org](https://schema.org), to create a powerful integration between structured data and content.

```mdx
---
$id: https://example.com
$type: https://schema.org/WebSite
title: Example Domain
description: This domain is for use in illustrative examples in documents
---

# Example Domain

This domain is for use in illustrative examples in documents. You may use this
domain in literature without prior coordination or asking for permission.

[More information...](https://www.iana.org/domains/example)
```

## [`mdxe`](./packages/mdxe) - Build, Execute, Test, & Deploy Code in Markdown & MDX

MDXE is a zero-config CLI that allows you to build, execute, test, and deploy code in Markdown & MDX files. It uses MDX, ESBuild, ESLint, Next.js, React, Velite, and Vitest under the hood to rapidly develop apps and sites.

### Literate Testing - Documentation That Tests Itself ✨

Turn your MDX documentation into self-verifying tests with executable code blocks and automatic assertions:

````markdown
## Array Operations

```ts assert
const numbers = [1, 2, 3, 4, 5]
const doubled = numbers.map(n => n * 2)

expect(doubled.length).toBe(5)
expect(doubled[0]).toBe(2)
expect(doubled[4]).toBe(10)
```
````

Run tests on your documentation:

```bash
mdxe test:doc your-file.mdx

# 📊 Document Test Results
#
# 📄 your-file.mdx
#    Blocks: 1/1 passed (100%)
#    Assertions: 3/3 passed (100%)
#
# ✅ All tests passed!
```

**Features:**
- 15+ assertion methods (toBe, toEqual, toContain, toBeGreaterThan, etc.)
- Auto-inject results with `--update` flag
- Run in CLI or browser (Monaco editor with Cmd+Shift+T)
- Living documentation that stays accurate

See [RELEASE-NOTES-LITERATE-TESTING.md](./RELEASE-NOTES-LITERATE-TESTING.md) for complete details.

### Traditional Unit Testing

For traditional unit tests, use Vitest syntax:

````markdown
# Addition

Sometimes you need to `sum` two numbers:

```typescript
export function sum(a: number, b: number): number {
  return a + b
}
```

and make sure it works:

```typescript test
describe('sum', () => {
  it('returns the sum of two positive numbers', () => {
    expect(sum(2, 3)).toBe(5)
  })
})
```
````

Execute the tests:

```bash
mdxe test
```

### Full Development Environment

Run the development server:

```bash
mdxe dev

#  next dev --turbopack --port 3000

#    ▲ Next.js 15.3.0 (Turbopack)
#    - Local:        http://localhost:3000
#    - Network:      http://192.168.6.6:3000

#  ✓ Starting...
#  ✓ Ready in 1995ms
```

Develop and deploy entire projects:

```jsonc
// package.json
{
  "scripts": {
    "dev": "mdxe dev",
    "build": "mdxe build",
    "start": "mdxe start",
    "test": "mdxe test",
    "test:doc": "mdxe test:doc",
    "lint": "mdxe lint",
  },
}
```

## [`mdxui`](./packages/mdxui) - UI Component Library for MDX

All of the `mdxui` components are available automatically in `mdxe`

```mdx
<Hero
  headline='Bring your ideas to life with MDX'
  content='MDX combines unstructured content in Markdown, structured data in YAML, executable code, and UI components.'
/>
```

The components can also be used in any React/Next.js application:

```tsx
// mdx-components.tsx
export { useMDXComponents } from 'mdxui'
```
