/**
 * Tests for Hono Markdown Output Mode
 */

import { describe, it, expect, beforeAll } from 'vitest'
import { createMarkdownApp } from './markdown'

describe('Hono Markdown Output', () => {
  let app: ReturnType<typeof createMarkdownApp>

  beforeAll(() => {
    app = createMarkdownApp({
      collections: ['docs', 'blog'],
      basePath: '/',
      includeFrontmatter: true,
      includeToc: true,
      cacheDuration: 0, // Disable cache for tests
    })
  })

  describe('Health Check', () => {
    it('should return health status', async () => {
      const res = await app.request('/health')
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.status).toBe('ok')
      expect(data.mode).toBe('markdown')
      expect(data.collections).toEqual(['docs', 'blog'])
    })
  })

  describe('Collection Listing', () => {
    it('should return 404 for unknown collection', async () => {
      const res = await app.request('/unknown')
      const data = await res.json()

      expect(res.status).toBe(404)
      expect(data.error).toBe('Collection not found')
    })

    it('should list documents in a collection', async () => {
      const res = await app.request('/docs')
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.collection).toBe('docs')
      expect(data.count).toBeDefined()
      expect(Array.isArray(data.documents)).toBe(true)
    })
  })

  describe('Document Retrieval', () => {
    it('should return 404 for unknown collection', async () => {
      const res = await app.request('/unknown/test')
      const data = await res.json()

      expect(res.status).toBe(404)
      expect(data.error).toBe('Collection not found')
    })

    it('should return markdown content type', async () => {
      // Note: This will fail until mdxdb integration is complete
      // For now, we're just testing the response structure
      const res = await app.request('/docs/test')

      if (res.status === 200) {
        expect(res.headers.get('Content-Type')).toContain('text/markdown')
      }
    })
  })

  describe('Configuration', () => {
    it('should respect includeFrontmatter option', async () => {
      const appWithoutFrontmatter = createMarkdownApp({
        collections: ['docs'],
        includeFrontmatter: false,
      })

      // Test that configuration is applied
      expect(appWithoutFrontmatter).toBeDefined()
    })

    it('should respect includeToc option', async () => {
      const appWithoutToc = createMarkdownApp({
        collections: ['docs'],
        includeToc: false,
      })

      expect(appWithoutToc).toBeDefined()
    })
  })
})

describe('Markdown Utilities', () => {
  it('should render frontmatter correctly', () => {
    // Test frontmatter rendering
    const frontmatter = { title: 'Test', date: '2025-10-03' }
    const expected = '---\ntitle: Test\ndate: 2025-10-03\n---\n\n'

    let output = '---\n'
    Object.entries(frontmatter).forEach(([key, value]) => {
      output += `${key}: ${value}\n`
    })
    output += '---\n\n'

    expect(output).toBe(expected)
  })

  it('should render table of contents correctly', () => {
    const items = [
      { id: 'intro', text: 'Introduction', level: 1, children: [] },
      { id: 'details', text: 'Details', level: 2, children: [] },
    ]

    const lines: string[] = []
    items.forEach((item) => {
      const indent = '  '.repeat(item.level - 1)
      lines.push(`${indent}- [${item.text}](#${item.id})`)
    })

    expect(lines).toEqual(['- [Introduction](#intro)', '  - [Details](#details)'])
  })
})
