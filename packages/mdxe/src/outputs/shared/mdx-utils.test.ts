/**
 * Tests for shared MDX utilities
 */

import { describe, it, expect } from 'vitest'
import { parseMdx, generateToc, markdownToHtml, sanitizeContent, formatDocument } from './mdx-utils'
import type { MdxDocument } from './types'

describe('MDX Utilities', () => {
  describe('parseMdx', () => {
    it('should parse frontmatter and content', () => {
      const mdx = `---
title: Test Post
date: 2025-10-03
---

# Hello World

This is content.`

      const result = parseMdx(mdx)

      expect(result.frontmatter.title).toBe('Test Post')
      expect(result.frontmatter.date).toBe('2025-10-03')
      expect(result.content).toContain('# Hello World')
    })

    it('should handle content without frontmatter', () => {
      const mdx = `# Hello World

This is content without frontmatter.`

      const result = parseMdx(mdx)

      expect(result.frontmatter).toEqual({})
      expect(result.content).toBe(mdx)
    })

    it('should remove quotes from frontmatter values', () => {
      const mdx = `---
title: "Quoted Title"
author: 'Single Quoted'
---

Content here.`

      const result = parseMdx(mdx)

      expect(result.frontmatter.title).toBe('Quoted Title')
      expect(result.frontmatter.author).toBe('Single Quoted')
    })
  })

  describe('generateToc', () => {
    it('should generate table of contents from headings', () => {
      const content = `# Introduction

Some text here.

## Getting Started

More text.

### Installation

Details about installation.

## Advanced Topics

Advanced content.`

      const toc = generateToc(content)

      expect(toc.items).toHaveLength(2) // Introduction and Advanced Topics at root
      expect(toc.items[0].text).toBe('Introduction')
      expect(toc.items[0].children).toHaveLength(1) // Getting Started
      expect(toc.items[0].children[0].text).toBe('Getting Started')
      expect(toc.items[0].children[0].children).toHaveLength(1) // Installation
    })

    it('should generate proper IDs', () => {
      const content = `# Hello World!

## This is a Test`

      const toc = generateToc(content)

      expect(toc.items[0].id).toBe('hello-world')
      expect(toc.items[0].children[0].id).toBe('this-is-a-test')
    })

    it('should handle empty content', () => {
      const toc = generateToc('')
      expect(toc.items).toEqual([])
    })
  })

  describe('markdownToHtml', () => {
    it('should convert headings to HTML', () => {
      const markdown = `# Heading 1
## Heading 2
### Heading 3`

      const html = markdownToHtml(markdown)

      expect(html).toContain('<h1>Heading 1</h1>')
      expect(html).toContain('<h2>Heading 2</h2>')
      expect(html).toContain('<h3>Heading 3</h3>')
    })

    it('should convert bold and italic', () => {
      const markdown = `**bold text** and *italic text*`

      const html = markdownToHtml(markdown)

      expect(html).toContain('<strong>bold text</strong>')
      expect(html).toContain('<em>italic text</em>')
    })

    it('should convert links', () => {
      const markdown = `[Link Text](https://example.com)`

      const html = markdownToHtml(markdown)

      expect(html).toContain('<a href="https://example.com">Link Text</a>')
    })

    it('should convert paragraphs', () => {
      const markdown = `First paragraph.

Second paragraph.`

      const html = markdownToHtml(markdown)

      expect(html).toContain('<p>First paragraph.</p>')
      expect(html).toContain('<p>Second paragraph.</p>')
    })
  })

  describe('sanitizeContent', () => {
    it('should escape HTML special characters', () => {
      const content = `<script>alert("xss")</script>`
      const sanitized = sanitizeContent(content)

      expect(sanitized).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;')
      expect(sanitized).not.toContain('<script>')
    })

    it('should escape quotes', () => {
      const content = `"double" and 'single' quotes`
      const sanitized = sanitizeContent(content)

      expect(sanitized).toContain('&quot;')
      expect(sanitized).toContain('&#039;')
    })
  })

  describe('formatDocument', () => {
    it('should add TOC to document', () => {
      const doc: MdxDocument = {
        id: 'test',
        slug: 'test',
        collection: 'docs',
        frontmatter: { title: 'Test' },
        content: `# Introduction\n\n## Details`,
      }

      const formatted = formatDocument(doc)

      expect(formatted.toc).toBeDefined()
      expect(formatted.toc!.items).toHaveLength(1)
      expect(formatted.toc!.items[0].text).toBe('Introduction')
    })

    it('should preserve existing TOC', () => {
      const toc = {
        items: [{ id: 'custom', text: 'Custom', level: 1 }],
      }

      const doc: MdxDocument = {
        id: 'test',
        slug: 'test',
        collection: 'docs',
        frontmatter: {},
        content: '',
        toc,
      }

      const formatted = formatDocument(doc)

      expect(formatted.toc).toBe(toc)
    })
  })
})
