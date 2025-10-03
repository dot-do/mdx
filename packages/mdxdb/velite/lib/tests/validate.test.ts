import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { VeliteSchemaValidator, type ValidationOptions } from '../validate.js'
import { CollectionSchema, PayloadField } from '@mdxdb/core'
import { promises as fs } from 'fs'
import path from 'path'
import os from 'os'

describe('VeliteSchemaValidator', () => {
  let tempDir: string
  let validator: VeliteSchemaValidator

  beforeEach(async () => {
    // Create temporary directory for test files
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'velite-validator-test-'))

    // Create test schema
    const testSchema: CollectionSchema = {
      name: 'Post',
      slug: 'posts',
      fields: [
        { name: 'title', type: 'text', required: true, minLength: 3 } as PayloadField,
        { name: 'description', type: 'textarea', required: false } as PayloadField,
        { name: 'published', type: 'checkbox', required: false } as PayloadField,
        { name: 'views', type: 'number', min: 0 } as PayloadField,
      ],
      timestamps: true,
    }

    validator = new VeliteSchemaValidator({
      enabled: true,
      schemas: [testSchema],
      verbose: false,
    })

    await validator.loadSchemas()
  })

  afterEach(async () => {
    // Clean up temporary directory
    await fs.rm(tempDir, { recursive: true, force: true })
  })

  describe('validateContent', () => {
    it('should validate valid MDX content', () => {
      const content = `---
title: My Post Title
description: This is a test post
published: true
views: 100
---

# Content

This is the body of the post.
`

      const result = validator.validateContent(content, 'posts')

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should detect missing required fields', () => {
      const content = `---
description: This is a test post
---

# Content
`

      const result = validator.validateContent(content, 'posts')

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Field "title" is required')
    })

    it('should validate field constraints', () => {
      const content = `---
title: "ab"
description: Test
views: -10
---

# Content
`

      const result = validator.validateContent(content, 'posts')

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Field "title" must be at least 3 characters')
      expect(result.errors).toContain('Field "views" must be at least 0')
    })

    it('should handle content without frontmatter', () => {
      const content = `# Content

This is a post without frontmatter.
`

      const result = validator.validateContent(content, 'posts')

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Field "title" is required')
    })

    it('should warn about unknown collections', () => {
      const content = `---
title: Test
---

# Content
`

      const result = validator.validateContent(content, 'unknown')

      expect(result.valid).toBe(true)
      expect(result.warnings).toContain('No schema found for collection "unknown"')
    })

    it('should handle empty frontmatter', () => {
      const content = `---
---

# Content
`

      const result = validator.validateContent(content, 'posts')

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Field "title" is required')
    })
  })

  describe('validateFile', () => {
    it('should validate a file successfully', async () => {
      const filePath = path.join(tempDir, 'test.mdx')
      const content = `---
title: Valid Post
description: This is valid
published: true
views: 42
---

# Content
`

      await fs.writeFile(filePath, content)

      const result = await validator.validateFile(filePath, 'posts')

      expect(result.valid).toBe(true)
      expect(result.filePath).toBe(filePath)
      expect(result.errors).toHaveLength(0)
    })

    it('should detect validation errors in file', async () => {
      const filePath = path.join(tempDir, 'invalid.mdx')
      const content = `---
title: "ab"
views: -5
---

# Content
`

      await fs.writeFile(filePath, content)

      const result = await validator.validateFile(filePath, 'posts')

      expect(result.valid).toBe(false)
      expect(result.filePath).toBe(filePath)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('should handle non-existent files', async () => {
      const filePath = path.join(tempDir, 'nonexistent.mdx')

      const result = await validator.validateFile(filePath, 'posts')

      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors[0]).toContain('Failed to read file')
    })
  })

  describe('validateCollection', () => {
    beforeEach(async () => {
      // Create test content directory
      const contentDir = path.join(tempDir, 'content', 'posts')
      await fs.mkdir(contentDir, { recursive: true })

      // Create valid post
      await fs.writeFile(
        path.join(contentDir, 'valid.mdx'),
        `---
title: Valid Post
description: Valid description
published: true
views: 100
---

# Content
`,
      )

      // Create invalid post
      await fs.writeFile(
        path.join(contentDir, 'invalid.mdx'),
        `---
title: "ab"
views: -1
---

# Content
`,
      )

      // Create another valid post
      await fs.writeFile(
        path.join(contentDir, 'another.mdx'),
        `---
title: Another Valid Post
---

# Content
`,
      )
    })

    it('should validate all files in a collection', async () => {
      const result = await validator.validateCollection('posts', 'content/posts/**/*.mdx', tempDir)

      expect(result.totalFiles).toBe(3)
      expect(result.validFiles).toBe(2)
      expect(result.invalidFiles).toBe(1)
      expect(result.valid).toBe(false)
    })

    it('should return valid result when all files pass', async () => {
      // Remove invalid file
      await fs.unlink(path.join(tempDir, 'content', 'posts', 'invalid.mdx'))

      const result = await validator.validateCollection('posts', 'content/posts/**/*.mdx', tempDir)

      expect(result.totalFiles).toBe(2)
      expect(result.validFiles).toBe(2)
      expect(result.invalidFiles).toBe(0)
      expect(result.valid).toBe(true)
    })

    it('should handle empty collections', async () => {
      const emptyDir = path.join(tempDir, 'empty')
      await fs.mkdir(emptyDir, { recursive: true })

      const result = await validator.validateCollection('posts', 'empty/**/*.mdx', tempDir)

      expect(result.totalFiles).toBe(0)
      expect(result.validFiles).toBe(0)
      expect(result.invalidFiles).toBe(0)
      expect(result.valid).toBe(true)
    })
  })

  describe('loadSchemas', () => {
    it('should load schemas from YAML files', async () => {
      const schemaDir = path.join(tempDir, '.db')
      await fs.mkdir(schemaDir, { recursive: true })

      const schemaYaml = `
name: Article
slug: articles
fields:
  title: "Article title (text)"
  content: "Article content (richText)"
  published: "Published (checkbox)"
`

      await fs.writeFile(path.join(schemaDir, 'articles.yaml'), schemaYaml)

      const newValidator = new VeliteSchemaValidator({
        enabled: true,
        schemaPath: schemaDir,
        verbose: false,
      })

      await newValidator.loadSchemas()

      const schema = newValidator.getSchema('articles')
      expect(schema).toBeDefined()
      expect(schema?.name).toBe('Article')
      expect(schema?.fields).toHaveLength(3)
    })

    it('should load single schema file', async () => {
      const schemaFile = path.join(tempDir, 'schema.yaml')
      const schemaYaml = `
name: Page
slug: pages
fields:
  title: "Page title (text)"
`

      await fs.writeFile(schemaFile, schemaYaml)

      const newValidator = new VeliteSchemaValidator({
        enabled: true,
        schemaPath: schemaFile,
        verbose: false,
      })

      await newValidator.loadSchemas()

      const schema = newValidator.getSchema('pages')
      expect(schema).toBeDefined()
      expect(schema?.name).toBe('Page')
    })

    it('should handle non-existent schema path', async () => {
      const newValidator = new VeliteSchemaValidator({
        enabled: true,
        schemaPath: path.join(tempDir, 'nonexistent'),
        verbose: false,
      })

      // Should not throw
      await newValidator.loadSchemas()

      const schema = newValidator.getSchema('anything')
      expect(schema).toBeUndefined()
    })
  })

  describe('isEnabled', () => {
    it('should return true when enabled', () => {
      expect(validator.isEnabled()).toBe(true)
    })

    it('should return false when disabled', () => {
      const disabledValidator = new VeliteSchemaValidator({
        enabled: false,
      })

      expect(disabledValidator.isEnabled()).toBe(false)
    })
  })

  describe('strict mode', () => {
    it('should throw error in strict mode on validation failure', async () => {
      const strictValidator = new VeliteSchemaValidator({
        enabled: true,
        schemas: [validator.getSchema('posts')!],
        strict: true,
        verbose: false,
      })

      await strictValidator.loadSchemas()

      const contentDir = path.join(tempDir, 'strict')
      await fs.mkdir(contentDir, { recursive: true })

      await fs.writeFile(
        path.join(contentDir, 'invalid.mdx'),
        `---
title: "ab"
---
`,
      )

      await expect(strictValidator.validateCollection('posts', 'strict/**/*.mdx', tempDir)).rejects.toThrow(
        'Validation failed',
      )
    })

    it('should not throw in non-strict mode', async () => {
      const contentDir = path.join(tempDir, 'non-strict')
      await fs.mkdir(contentDir, { recursive: true })

      await fs.writeFile(
        path.join(contentDir, 'invalid.mdx'),
        `---
title: "ab"
---
`,
      )

      const result = await validator.validateCollection('posts', 'non-strict/**/*.mdx', tempDir)

      expect(result.valid).toBe(false)
      // Should not throw, just return invalid result
    })
  })

  describe('validateCollections', () => {
    beforeEach(async () => {
      // Create multiple collections
      const postsDir = path.join(tempDir, 'content', 'posts')
      const articlesDir = path.join(tempDir, 'content', 'articles')

      await fs.mkdir(postsDir, { recursive: true })
      await fs.mkdir(articlesDir, { recursive: true })

      await fs.writeFile(
        path.join(postsDir, 'post1.mdx'),
        `---
title: Post 1
views: 10
---
`,
      )

      await fs.writeFile(
        path.join(articlesDir, 'article1.mdx'),
        `---
title: Article 1
views: 20
---
`,
      )

      // Add Article schema
      const articleSchema: CollectionSchema = {
        name: 'Article',
        slug: 'articles',
        fields: [{ name: 'title', type: 'text', required: true } as PayloadField],
        timestamps: true,
      }

      validator = new VeliteSchemaValidator({
        enabled: true,
        schemas: [validator.getSchema('posts')!, articleSchema],
        verbose: false,
      })

      await validator.loadSchemas()
    })

    it('should validate multiple collections', async () => {
      const result = await validator.validateCollections([
        { name: 'posts', pattern: 'content/posts/**/*.mdx', baseDir: tempDir },
        { name: 'articles', pattern: 'content/articles/**/*.mdx', baseDir: tempDir },
      ])

      expect(result.totalFiles).toBe(2)
      expect(result.validFiles).toBe(2)
      expect(result.schemasUsed).toContain('posts')
      expect(result.schemasUsed).toContain('articles')
    })
  })
})
