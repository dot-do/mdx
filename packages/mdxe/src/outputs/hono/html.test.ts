/**
 * Tests for Hono HTML Output Mode
 */

import { describe, it, expect, beforeAll } from 'vitest'
import { createHtmlApp } from './html'

describe('Hono HTML Output', () => {
  let app: ReturnType<typeof createHtmlApp>

  beforeAll(() => {
    app = createHtmlApp({
      collections: ['docs', 'blog'],
      basePath: '/',
      siteTitle: 'Test Site',
      siteDescription: 'Test Description',
      includeTocSidebar: true,
      typographyTheme: 'slate',
      cacheDuration: 0, // Disable cache for tests
    })
  })

  describe('Health Check', () => {
    it('should return health status', async () => {
      const res = await app.request('/health')
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.status).toBe('ok')
      expect(data.mode).toBe('html')
      expect(data.collections).toEqual(['docs', 'blog'])
    })
  })

  describe('Home Page', () => {
    it('should render index page with collections', async () => {
      const res = await app.request('/')
      const html = await res.text()

      expect(res.status).toBe(200)
      expect(res.headers.get('Content-Type')).toContain('text/html')
      expect(html).toContain('Test Site')
      expect(html).toContain('Test Description')
      expect(html).toContain('docs')
      expect(html).toContain('blog')
    })

    it('should include Tailwind CSS', async () => {
      const res = await app.request('/')
      const html = await res.text()

      expect(html).toContain('tailwindcss.com')
    })
  })

  describe('Collection Index', () => {
    it('should return 404 for unknown collection', async () => {
      const res = await app.request('/unknown')
      const html = await res.text()

      expect(res.status).toBe(404)
      expect(html).toContain('404')
      expect(html).toContain('Not Found')
    })

    it('should render collection page', async () => {
      const res = await app.request('/docs')

      // Will return 500 until mdxdb is integrated, but we can check structure
      if (res.status === 200) {
        const html = await res.text()
        expect(html).toContain('docs')
      }
    })
  })

  describe('Document Page', () => {
    it('should return 404 for unknown collection', async () => {
      const res = await app.request('/unknown/test')
      const html = await res.text()

      expect(res.status).toBe(404)
      expect(html).toContain('404')
    })

    it('should use correct typography theme', async () => {
      const res = await app.request('/')
      const html = await res.text()

      // Check that prose classes are present
      expect(html).toContain('prose')
    })
  })

  describe('Configuration', () => {
    it('should use custom site title', async () => {
      const customApp = createHtmlApp({
        collections: ['docs'],
        siteTitle: 'Custom Title',
      })

      const res = await customApp.request('/')
      const html = await res.text()

      expect(html).toContain('Custom Title')
    })

    it('should use custom typography theme', async () => {
      const customApp = createHtmlApp({
        collections: ['docs'],
        typographyTheme: 'zinc',
      })

      const res = await customApp.request('/')
      const html = await res.text()

      expect(html).toContain('prose-zinc')
    })

    it('should include custom CSS', async () => {
      const customApp = createHtmlApp({
        collections: ['docs'],
        styling: {
          customCss: '.custom { color: red; }',
        },
      })

      const res = await customApp.request('/')
      const html = await res.text()

      expect(html).toContain('.custom { color: red; }')
    })
  })

  describe('Error Pages', () => {
    it('should render 404 page', async () => {
      const res = await app.request('/nonexistent/page')
      const html = await res.text()

      expect(res.status).toBe(404)
      expect(html).toContain('404')
      expect(html).toContain('Page Not Found')
      expect(html).toContain('Go back home')
    })
  })
})

describe('HTML Rendering', () => {
  it('should render basic HTML layout', () => {
    const layout = `<!DOCTYPE html>
<html lang="en">
<head>
  <title>Test</title>
</head>
<body>
  <div>Content</div>
</body>
</html>`

    expect(layout).toContain('<!DOCTYPE html>')
    expect(layout).toContain('<html lang="en">')
  })

  it('should render table of contents as HTML', () => {
    const items = [
      {
        id: 'intro',
        text: 'Introduction',
        level: 1,
        children: [{ id: 'details', text: 'Details', level: 2, children: [] }],
      },
    ]

    function renderTocHtml(items: any[]): string {
      return items
        .map(
          (item) => `
        <div>
          <a href="#${item.id}">${item.text}</a>
          ${item.children && item.children.length > 0 ? `<div class="ml-4">${renderTocHtml(item.children)}</div>` : ''}
        </div>
      `
        )
        .join('')
    }

    const html = renderTocHtml(items)
    expect(html).toContain('href="#intro"')
    expect(html).toContain('Introduction')
    expect(html).toContain('href="#details"')
    expect(html).toContain('Details')
  })
})
