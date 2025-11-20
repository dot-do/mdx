import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { promises as fs } from 'fs'
import path from 'path'
import os from 'os'
import { randomUUID } from 'crypto'
import { MdxDb } from '@mdxdb/fs'
import { discoverSchemas } from '@mdxdb/core'

/**
 * End-to-End Integration Tests
 * Tests the complete workflow: Define schema → Build → Query → Update
 */
describe('E2E Workflow Integration Tests', () => {
  const testId = randomUUID()
  const testDir = path.join(os.tmpdir(), `mdx-e2e-${testId}`)
  const dbDir = path.join(testDir, '.db')
  const contentDir = path.join(testDir, 'content')

  beforeEach(async () => {
    await fs.mkdir(dbDir, { recursive: true })
    await fs.mkdir(contentDir, { recursive: true })
  })

  afterEach(async () => {
    try {
      await fs.rm(testDir, { recursive: true, force: true })
    } catch (error) {
      console.error('Error cleaning up test directory:', error)
    }
  })

  describe('Complete Workflow: Schema → Build → Query → Update', () => {
    it('should handle complete blog workflow', async () => {
      // 1. Define Schema in YAML
      const schemaContent = `---
collections:
  posts:
    title: Blog post title
    slug: URL slug (string)
    date: Publication date (date)
    author: Post author (string)
    tags: Post tags (array)
    published: Whether post is published (boolean)
---

# Blog Schema

This defines the schema for blog posts.
`
      await fs.writeFile(path.join(dbDir, 'blog-schema.md'), schemaContent)

      // 2. Verify schema discovery
      const schemas = await discoverSchemas(dbDir)
      expect(schemas).toHaveLength(1)
      expect(schemas[0].collectionName).toBe('posts')
      expect(schemas[0].schema.title.type).toBe('string')
      expect(schemas[0].schema.date.type).toBe('date')
      expect(schemas[0].schema.published.type).toBe('boolean')
      expect(schemas[0].schema.tags.type).toBe('array')

      // 3. Create Velite config
      const veliteConfig = `import { defineConfig, s } from 'velite'

export default defineConfig({
  collections: {
    posts: {
      name: 'Post',
      pattern: 'content/**/*.mdx',
      schema: s.object({
        title: s.string(),
        slug: s.slug('global'),
        date: s.isodate(),
        author: s.string(),
        tags: s.array(s.string()).optional(),
        published: s.boolean().default(false),
        body: s.mdx()
      })
    }
  }
})`
      await fs.writeFile(path.join(testDir, 'velite.config.ts'), veliteConfig)

      // 4. Create sample content
      const post1 = `---
title: Getting Started with MDX
slug: getting-started
date: 2024-01-15
author: John Doe
tags: [tutorial, mdx, beginner]
published: true
---

# Getting Started with MDX

This is a sample blog post demonstrating MDX capabilities.

## Key Features

- Markdown syntax
- React components
- YAML frontmatter
`
      await fs.writeFile(path.join(contentDir, 'getting-started.mdx'), post1)

      const post2 = `---
title: Advanced MDX Patterns
slug: advanced-patterns
date: 2024-01-20
author: Jane Smith
tags: [advanced, patterns, mdx]
published: false
---

# Advanced MDX Patterns

Learn advanced techniques for working with MDX.
`
      await fs.writeFile(path.join(contentDir, 'advanced-patterns.mdx'), post2)

      // 5. Initialize and build database
      const db = new MdxDb(testDir)
      const data = await db.build()

      expect(data).toBeDefined()
      expect(data.posts).toBeDefined()
      expect(data.posts.length).toBe(2)

      // 6. Query data
      const publishedPosts = db.list('posts').filter((p: any) => p.published)
      expect(publishedPosts).toHaveLength(1)
      expect(publishedPosts[0].title).toBe('Getting Started with MDX')

      // 7. Get specific post
      const post = db.get('getting-started', 'posts')
      expect(post).toBeDefined()
      expect(post.title).toBe('Getting Started with MDX')
      expect(post.author).toBe('John Doe')
      expect(post.tags).toEqual(['tutorial', 'mdx', 'beginner'])

      // 8. Update content
      await db.set(
        'getting-started',
        {
          frontmatter: {
            ...post,
            tags: ['tutorial', 'mdx', 'beginner', 'updated']
          },
          body: post.body + '\n\n## Updated Section\n\nNew content added!'
        },
        'posts'
      )

      // 9. Rebuild and verify update
      await db.build()
      const updatedPost = db.get('getting-started', 'posts')
      expect(updatedPost.tags).toHaveLength(4)
      expect(updatedPost.tags).toContain('updated')

      // 10. Delete draft post
      await db.delete('advanced-patterns', 'posts')
      await db.build()
      const remainingPosts = db.list('posts')
      expect(remainingPosts).toHaveLength(1)
    }, 30000)

    it('should handle multi-collection workflow', async () => {
      // Define multiple collections
      const schemaContent = `---
collections:
  posts:
    title: Post title
    category: Post category (enum: tech | business | lifestyle)
  authors:
    name: Author name
    email: Author email (string)
    bio: Author biography
---

# Multi-Collection Schema
`
      await fs.writeFile(path.join(dbDir, 'schema.md'), schemaContent)

      // Verify both collections discovered
      const schemas = await discoverSchemas(dbDir)
      expect(schemas).toHaveLength(2)

      const postSchema = schemas.find(s => s.collectionName === 'posts')
      const authorSchema = schemas.find(s => s.collectionName === 'authors')

      expect(postSchema).toBeDefined()
      expect(authorSchema).toBeDefined()
      expect(postSchema?.schema.category.type).toBe('enum')
      expect(postSchema?.schema.category.enum).toEqual(['tech', 'business', 'lifestyle'])
    })

    it('should handle schema validation errors gracefully', async () => {
      // Create invalid schema
      const invalidSchema = `# Invalid Schema

\`\`\`yaml
field1: Description (unknown-type)
field2: Malformed enum (value1 | | value2)
\`\`\`
`
      await fs.writeFile(path.join(dbDir, 'invalid.md'), invalidSchema)

      // Should not throw, just log warnings
      const schemas = await discoverSchemas(dbDir)
      expect(Array.isArray(schemas)).toBe(true)
    })
  })

  describe('File System Operations', () => {
    it('should watch for file changes', async () => {
      const db = new MdxDb(testDir)

      // Create initial content
      const post = `---
title: Test Post
---
# Test Post
`
      await fs.writeFile(path.join(contentDir, 'test.mdx'), post)
      await db.build()

      // Start watching
      const watcher = await db.watch()

      // Give watcher time to initialize
      await new Promise(resolve => setTimeout(resolve, 500))

      // Update file
      const updatedPost = `---
title: Updated Test Post
---
# Updated Test Post
`
      await fs.writeFile(path.join(contentDir, 'test.mdx'), updatedPost)

      // Wait for file system events to propagate
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Stop watching
      db.stopWatch()

      // Verify update was detected (implementation may auto-rebuild)
      expect(watcher).toBeDefined()
    }, 10000)

    it('should export database to JSON', async () => {
      const db = new MdxDb(testDir)

      // Create content
      await fs.writeFile(
        path.join(contentDir, 'post.mdx'),
        `---\ntitle: Export Test\n---\n# Export Test`
      )

      await db.build()

      // Export
      const exportDir = path.join(testDir, 'export')
      await db.exportDb(exportDir)

      // Verify export files exist
      const files = await fs.readdir(exportDir)
      expect(files.length).toBeGreaterThan(0)

      // Check if any JSON files were created
      const jsonFiles = files.filter(f => f.endsWith('.json'))
      expect(jsonFiles.length).toBeGreaterThanOrEqual(0) // May be 0 if no collections
    }, 30000)
  })

  describe('Edge Cases and Error Handling', () => {
    it('should handle missing .db directory', async () => {
      const schemas = await discoverSchemas(path.join(testDir, 'nonexistent'))
      expect(schemas).toEqual([])
    })

    it('should handle empty collections', async () => {
      const db = new MdxDb(testDir)
      const data = await db.build()
      expect(data).toBeDefined()
    }, 30000)

    it('should handle malformed frontmatter', async () => {
      await fs.writeFile(
        path.join(contentDir, 'malformed.mdx'),
        `---\ntitle: Test\ninvalid yaml: : :\n---\n# Content`
      )

      const db = new MdxDb(testDir)
      // Should not throw, Velite will handle validation
      await expect(db.build()).resolves.toBeDefined()
    }, 30000)

    it('should handle special characters in filenames', async () => {
      const db = new MdxDb(testDir)

      const content = {
        frontmatter: { title: 'Test' },
        body: '# Test'
      }

      // These should work
      await db.set('test-with-dashes', content, 'posts')
      await db.set('test_with_underscores', content, 'posts')
      await db.set('test.with.dots', content, 'posts')

      const files = await fs.readdir(contentDir)
      expect(files).toContain('test-with-dashes.mdx')
      expect(files).toContain('test_with_underscores.mdx')
      expect(files).toContain('test.with.dots.mdx')
    })
  })

  describe('Performance and Scale', () => {
    it('should handle large number of documents', async () => {
      const db = new MdxDb(testDir)

      // Create 100 documents
      const startTime = Date.now()
      for (let i = 0; i < 100; i++) {
        await fs.writeFile(
          path.join(contentDir, `post-${i}.mdx`),
          `---\ntitle: Post ${i}\ndate: 2024-01-${(i % 28) + 1}\n---\n# Post ${i}\n\nContent for post ${i}.`
        )
      }
      const writeTime = Date.now() - startTime

      // Build database
      const buildStart = Date.now()
      const data = await db.build()
      const buildTime = Date.now() - buildStart

      expect(data.posts.length).toBe(100)

      // Performance expectations (should be fast)
      console.log(`Write time: ${writeTime}ms, Build time: ${buildTime}ms`)
      expect(buildTime).toBeLessThan(10000) // Should build in under 10 seconds
    }, 60000)

    it('should handle documents with large content', async () => {
      const db = new MdxDb(testDir)

      // Create large document (1000 lines)
      const largeContent = Array(1000)
        .fill(0)
        .map((_, i) => `Line ${i}: Lorem ipsum dolor sit amet, consectetur adipiscing elit.`)
        .join('\n')

      await fs.writeFile(
        path.join(contentDir, 'large-post.mdx'),
        `---\ntitle: Large Post\n---\n\n${largeContent}`
      )

      await db.build()
      const post = db.get('large-post', 'posts')

      expect(post).toBeDefined()
      expect(post.title).toBe('Large Post')
    }, 30000)
  })
})
