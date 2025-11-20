# @mdxdb/velite

Velite integration for mdxdb with schema validation based on Payload CMS field types.

## Features

- **YAML Schema Definitions** - Define collection schemas using simple YAML syntax based on Payload CMS field types
- **Schema Validation** - Validate MDX frontmatter against schemas at build time
- **Velite Plugin** - Easy integration with existing Velite projects
- **Flexible Modes** - Optional validation with strict/non-strict modes
- **Comprehensive Field Types** - Support for text, number, checkbox, date, richText, relationship, select, array, and more

## Installation

```bash
pnpm add @mdxdb/velite
```

## Quick Start

### 1. Create Schema Definitions

Create YAML schema files in a `.db` directory:

`.db/posts.yaml`:
```yaml
name: Post
slug: posts
labels:
  singular: Post
  plural: Posts
admin:
  useAsTitle: title
fields:
  title: "Post title (text)"
  description: "Post description (textarea)"
  published: "Is published (checkbox)"
  publishedAt: "Publish date (date)"
  content: "Post content (richText)"
  status: "Post status (draft|published|archived)"
  author:
    type: relationship
    label: Author
    relationTo: users
    required: true
```

### 2. Use in Velite Config

`velite.config.ts`:
```typescript
import { defineConfig } from 'velite'
import { createValidationPlugin } from '@mdxdb/velite'

export default defineConfig({
  root: '.',
  collections: {
    // Your collections...
  },
  plugins: [
    createValidationPlugin({
      enabled: true,
      schemaPath: '.db', // Directory containing schema YAML files
      strict: false, // Set to true to throw errors on validation failure
      verbose: true, // Log validation results
    }),
  ],
})
```

### 3. Validate Manually

```typescript
import { VeliteSchemaValidator } from '@mdxdb/velite'

const validator = new VeliteSchemaValidator({
  enabled: true,
  schemaPath: '.db',
  strict: false,
  verbose: true,
})

await validator.loadSchemas()

// Validate a single file
const result = await validator.validateFile('content/posts/my-post.mdx', 'posts')
console.log(result.valid) // true or false
console.log(result.errors) // Array of error messages

// Validate entire collection
const collectionResult = await validator.validateCollection(
  'posts',
  'content/posts/**/*.mdx',
  process.cwd()
)
console.log(`${collectionResult.validFiles}/${collectionResult.totalFiles} files valid`)
```

## Schema Format

### Simple Field Definitions

Use string descriptions with type annotations:

```yaml
fields:
  title: "Post title (text)"
  count: "View count (number)"
  published: "Is published (checkbox)"
  publishedAt: "Publish date (date)"
  content: "Rich content (richText)"
  email: "Contact email (email)"
```

### Enum/Select Fields

Use pipe-separated values for select fields:

```yaml
fields:
  status: "Post status (draft|published|archived)"
  priority: "Priority (low|medium|high)"
```

### Complex Field Definitions

Specify detailed field configurations:

```yaml
fields:
  title:
    type: text
    label: Post Title
    required: true
    description: The title of the post
    minLength: 3
    maxLength: 100

  price:
    type: number
    label: Price
    required: true
    min: 0
    max: 10000

  category:
    type: select
    label: Category
    required: true
    options:
      - label: Tech
        value: tech
      - label: Design
        value: design

  author:
    type: relationship
    label: Author
    relationTo: users
    required: true

  tags:
    type: relationship
    label: Tags
    relationTo: tags
    hasMany: true
    max: 5
```

### Array and Group Fields

Create nested field structures:

```yaml
fields:
  sections:
    type: array
    label: Page Sections
    min: 1
    max: 10
    fields:
      title: "Section title (text)"
      content: "Section content (richText)"

  metadata:
    type: group
    label: Metadata
    fields:
      seoTitle: "SEO Title (text)"
      seoDescription: "SEO Description (textarea)"
```

## Supported Field Types

Based on [Payload CMS field types](https://payloadcms.com/docs/fields/overview):

- `text` - Single line text input
- `textarea` - Multi-line text input
- `email` - Email address (validated)
- `number` - Numeric input with min/max constraints
- `checkbox` - Boolean checkbox
- `date` - Date picker
- `richText` - Rich text editor content
- `relationship` - Reference to other collections
- `select` - Dropdown selection
- `array` - Repeatable field groups
- `group` - Grouped fields
- `code` - Code editor
- `json` - JSON editor

## Validation Options

```typescript
interface ValidationOptions {
  /**
   * Whether to validate MDX files against schema
   * Default: true
   */
  enabled?: boolean

  /**
   * Path to schema definition file or directory
   * Can be a single YAML file or directory with multiple YAML files
   * Default: '.db'
   */
  schemaPath?: string

  /**
   * Whether to throw errors on validation failure
   * Default: false (only logs warnings)
   */
  strict?: boolean

  /**
   * Whether to log validation results
   * Default: true
   */
  verbose?: boolean

  /**
   * Custom schemas to use instead of loading from files
   */
  schemas?: CollectionSchema[]
}
```

## API Reference

### VeliteSchemaValidator

Main validator class for schema validation.

```typescript
class VeliteSchemaValidator {
  constructor(options?: ValidationOptions)

  // Load schemas from configured path
  async loadSchemas(): Promise<void>

  // Get schema for a collection
  getSchema(collectionName: string): CollectionSchema | undefined

  // Check if validation is enabled
  isEnabled(): boolean

  // Validate MDX content against schema
  validateContent(content: string, collectionName: string): FileValidationResult

  // Validate a single file
  async validateFile(filePath: string, collectionName: string): Promise<FileValidationResult>

  // Validate entire collection
  async validateCollection(
    collectionName: string,
    pattern: string,
    baseDir?: string
  ): Promise<ValidationResult>

  // Validate multiple collections
  async validateCollections(
    collections: Array<{
      name: string
      pattern: string
      baseDir?: string
    }>
  ): Promise<ValidationResult>
}
```

### createValidationPlugin

Create a Velite plugin for schema validation.

```typescript
function createValidationPlugin(options?: ValidationOptions)
```

### validateVeliteConfig

Convenience function to validate a Velite config.

```typescript
async function validateVeliteConfig(config: {
  collections: Record<string, { name: string; pattern: string }>
  root?: string
  schemaPath?: string
  strict?: boolean
}): Promise<ValidationResult>
```

## Examples

### Example 1: Basic Blog Validation

`.db/posts.yaml`:
```yaml
name: BlogPost
slug: posts
fields:
  title: "Post title (text)"
  slug: "URL slug (text)"
  date: "Publish date (date)"
  author: "Author name (text)"
  excerpt: "Post excerpt (textarea)"
  content: "Post content (richText)"
  featured: "Featured post (checkbox)"
```

`content/posts/my-first-post.mdx`:
```mdx
---
title: My First Post
slug: my-first-post
date: 2024-01-01
author: John Doe
excerpt: This is my first blog post
content: Full content here...
featured: true
---

# My First Post

Content goes here...
```

### Example 2: Product Catalog

`.db/products.yaml`:
```yaml
name: Product
slug: products
fields:
  name:
    type: text
    required: true
    minLength: 3
    maxLength: 100

  price:
    type: number
    required: true
    min: 0

  category:
    type: select
    required: true
    options:
      - label: Electronics
        value: electronics
      - label: Clothing
        value: clothing
      - label: Books
        value: books

  inStock:
    type: checkbox
    defaultValue: true

  images:
    type: array
    min: 1
    max: 5
    fields:
      url: "Image URL (text)"
      alt: "Alt text (text)"
```

### Example 3: Advanced Schema with Relationships

`.db/articles.yaml`:
```yaml
name: Article
slug: articles
fields:
  title: "Article title (text)"

  author:
    type: relationship
    relationTo: users
    required: true

  tags:
    type: relationship
    relationTo: tags
    hasMany: true
    max: 5

  metadata:
    type: group
    fields:
      seoTitle: "SEO Title (text)"
      seoDescription: "SEO Description (textarea)"
      ogImage: "OG Image URL (text)"

  sections:
    type: array
    label: Article Sections
    fields:
      heading: "Section heading (text)"
      content: "Section content (richText)"
      callout:
        type: group
        fields:
          type: "Callout type (info|warning|success)"
          message: "Callout message (text)"
```

## Integration with @mdxdb/core

The validation module integrates seamlessly with `@mdxdb/core`:

```typescript
import { MdxDbFs } from '@mdxdb/fs'
import { VeliteSchemaValidator } from '@mdxdb/velite'

const db = new MdxDbFs({ packageDir: process.cwd() })
await db.build()

const validator = new VeliteSchemaValidator({
  schemaPath: '.db',
})
await validator.loadSchemas()

// Validate all posts
const posts = db.list('posts')
for (const post of posts) {
  // Get the source file path and validate
  const filePath = post.filePath
  if (filePath) {
    const result = await validator.validateFile(filePath, 'posts')
    if (!result.valid) {
      console.error(`Invalid post ${post.slug}:`, result.errors)
    }
  }
}
```

## CLI Usage

You can also use the validator from the command line:

```bash
# Validate all collections
npx @mdxdb/velite validate

# Validate specific collection
npx @mdxdb/velite validate --collection posts

# Strict mode (exit with error on validation failure)
npx @mdxdb/velite validate --strict
```

## License

MIT
