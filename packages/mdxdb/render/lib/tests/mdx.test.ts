import { describe, it, expect } from 'vitest'
import { renderMdx, renderMdxToText, extractMdxMetadata } from '../mdx.js'
import { loadPresetConfig } from '../tweakcn.js'

describe('mdx', () => {
  describe('renderMdx', () => {
    it('should render basic markdown', async () => {
      const content = '# Hello World\n\nThis is a test.'
      const result = await renderMdx(content)

      expect(result.html).toContain('<h1')
      expect(result.html).toContain('Hello World')
      expect(result.html).toContain('<p>')
      expect(result.html).toContain('This is a test.')
    })

    it('should apply tweakcn styles', async () => {
      const content = '# Styled Heading\n\n[Link](https://example.com)'
      const config = loadPresetConfig('modern')
      const result = await renderMdx(content, { config })

      expect(result.html).toContain('class=')
      expect(result.css).toBeDefined()
    })

    it('should extract frontmatter', async () => {
      const content = `---
title: Test Post
author: John Doe
---

# Content`

      const result = await renderMdx(content)
      expect(result.frontmatter).toBeDefined()
      expect(result.frontmatter?.title).toBe('Test Post')
    })

    it('should handle GFM features', async () => {
      const content = `
| Column 1 | Column 2 |
|----------|----------|
| Data 1   | Data 2   |

- [ ] Todo item
- [x] Completed item

~~Strikethrough~~
`

      const result = await renderMdx(content)
      expect(result.html).toContain('<table')
      expect(result.html).toContain('<input')
      expect(result.html).toContain('checked')
    })

    it('should include prose class when prose is true', async () => {
      const content = '# Test'
      const result = await renderMdx(content, { prose: true })
      expect(result.html).toContain('prose')
    })

    it('should exclude prose class when prose is false', async () => {
      const content = '# Test'
      const result = await renderMdx(content, { prose: false })
      expect(result.html).not.toContain('prose')
    })

    it('should use custom wrapper className', async () => {
      const content = '# Test'
      const result = await renderMdx(content, { wrapperClassName: 'custom-wrapper' })
      expect(result.html).toContain('custom-wrapper')
    })
  })

  describe('renderMdxToText', () => {
    it('should extract plain text from markdown', async () => {
      const content = '# Hello World\n\nThis is **bold** text.'
      const text = await renderMdxToText(content)

      expect(text).toContain('Hello World')
      expect(text).toContain('This is bold text')
      expect(text).not.toContain('#')
      expect(text).not.toContain('**')
    })

    it('should handle links', async () => {
      const content = '[Link text](https://example.com)'
      const text = await renderMdxToText(content)
      expect(text).toContain('Link text')
    })

    it('should handle lists', async () => {
      const content = `
- Item 1
- Item 2
- Item 3
`
      const text = await renderMdxToText(content)
      expect(text).toContain('Item 1')
      expect(text).toContain('Item 2')
      expect(text).toContain('Item 3')
    })
  })

  describe('extractMdxMetadata', () => {
    it('should extract headings', async () => {
      const content = `
# Main Heading
## Sub Heading
### Nested Heading
`

      const metadata = await extractMdxMetadata(content)
      expect(metadata.headings).toHaveLength(3)
      expect(metadata.headings[0].level).toBe(1)
      expect(metadata.headings[0].text).toBe('Main Heading')
      expect(metadata.headings[1].level).toBe(2)
      expect(metadata.headings[2].level).toBe(3)
    })

    it('should calculate word count', async () => {
      const content = 'This is a test with ten words in the content.'
      const metadata = await extractMdxMetadata(content)
      expect(metadata.wordCount).toBe(10)
    })

    it('should estimate reading time', async () => {
      const content = Array(200).fill('word').join(' ') // 200 words
      const metadata = await extractMdxMetadata(content)
      expect(metadata.readingTime).toBe(1) // 1 minute
    })

    it('should extract frontmatter', async () => {
      const content = `---
title: Test
author: John
tags: tag1, tag2
---

# Content`

      const metadata = await extractMdxMetadata(content)
      expect(metadata.frontmatter).toBeDefined()
      expect(metadata.frontmatter?.title).toBe('Test')
    })

    it('should handle empty content', async () => {
      const content = ''
      const metadata = await extractMdxMetadata(content)
      expect(metadata.headings).toHaveLength(0)
      expect(metadata.wordCount).toBe(0)
    })

    it('should generate heading IDs', async () => {
      const content = '# Hello World\n## Test Heading!'
      const metadata = await extractMdxMetadata(content)
      expect(metadata.headings[0].id).toBe('hello-world')
      expect(metadata.headings[1].id).toBe('test-heading')
    })
  })

  describe('code blocks', () => {
    it('should render code blocks', async () => {
      const content = '```javascript\nconst x = 1;\n```'
      const result = await renderMdx(content)
      expect(result.html).toContain('<pre')
      expect(result.html).toContain('<code')
    })

    it('should render inline code', async () => {
      const content = 'This is `inline code` in text.'
      const result = await renderMdx(content)
      expect(result.html).toContain('<code')
      expect(result.html).toContain('inline code')
    })
  })

  describe('links and images', () => {
    it('should render links', async () => {
      const content = '[Link Text](https://example.com)'
      const result = await renderMdx(content)
      expect(result.html).toContain('<a')
      expect(result.html).toContain('href="https://example.com"')
      expect(result.html).toContain('Link Text')
    })

    it('should render images', async () => {
      const content = '![Alt Text](https://example.com/image.png)'
      const result = await renderMdx(content)
      expect(result.html).toContain('<img')
      expect(result.html).toContain('src="https://example.com/image.png"')
      expect(result.html).toContain('alt="Alt Text"')
    })
  })

  describe('blockquotes', () => {
    it('should render blockquotes', async () => {
      const content = '> This is a quote'
      const result = await renderMdx(content)
      expect(result.html).toContain('<blockquote')
      expect(result.html).toContain('This is a quote')
    })
  })
})
