import { describe, it, expect, vi } from 'vitest'
import { compileMdxForInk, renderMdxToAnsi } from './renderer'
import { defaultInkComponents } from './components'

describe('React-ink Renderer', () => {
  describe('compileMdxForInk', () => {
    it('should compile simple MDX content', async () => {
      const mdx = '# Hello World\n\nThis is a test.'
      const Component = await compileMdxForInk(mdx)

      expect(Component).toBeDefined()
      expect(typeof Component).toBe('function')
    })

    it('should compile MDX with components', async () => {
      const mdx = '<CustomComponent>Test</CustomComponent>'
      const CustomComponent = vi.fn(() => null)

      const Component = await compileMdxForInk(mdx, {
        components: { CustomComponent },
      })

      expect(Component).toBeDefined()
    })

    it('should handle MDX with frontmatter', async () => {
      const mdx = `---
title: Test
---

# {frontmatter.title}
      `

      const Component = await compileMdxForInk(mdx)
      expect(Component).toBeDefined()
    })

    it('should support scope variables', async () => {
      const mdx = 'Username: {username}'

      const Component = await compileMdxForInk(mdx, {
        scope: { username: 'Alice' },
      })

      expect(Component).toBeDefined()
    })
  })

  describe('renderMdxToAnsi', () => {
    it('should render simple MDX to ANSI string', async () => {
      const mdx = '# Hello World\n\nThis is a test.'

      const output = await renderMdxToAnsi(mdx, {
        components: defaultInkComponents,
      })

      expect(output).toBeDefined()
      expect(typeof output).toBe('string')
      expect(output.length).toBeGreaterThan(0)
    })

    it('should render headings with proper formatting', async () => {
      const mdx = '# Heading 1\n\n## Heading 2'

      const output = await renderMdxToAnsi(mdx, {
        components: defaultInkComponents,
      })

      expect(output).toContain('Heading 1')
      expect(output).toContain('Heading 2')
    })

    it('should render code blocks', async () => {
      const mdx = '```typescript\nconst x = 1\n```'

      const output = await renderMdxToAnsi(mdx, {
        components: defaultInkComponents,
      })

      expect(output).toContain('const x = 1')
    })

    it('should render lists', async () => {
      const mdx = `
- Item 1
- Item 2
- Item 3
      `

      const output = await renderMdxToAnsi(mdx, {
        components: defaultInkComponents,
      })

      expect(output).toContain('Item 1')
      expect(output).toContain('Item 2')
      expect(output).toContain('Item 3')
    })

    it('should render with scope data', async () => {
      const mdx = 'Hello, {name}!'

      const output = await renderMdxToAnsi(mdx, {
        components: defaultInkComponents,
        scope: { name: 'World' },
      })

      expect(output).toContain('World')
    })
  })
})
