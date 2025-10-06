import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import rehypeSlug from 'rehype-slug'
import remarkGfm from 'remark-gfm'
import remarkFrontmatter from 'remark-frontmatter'
import { visit } from 'unist-util-visit'
import type { TweakcnConfig } from './tweakcn.js'
import { getComponentStyles, getComponentInlineStyles } from './tweakcn.js'

/**
 * MDX rendering options
 */
export interface MdxRenderOptions {
  config?: TweakcnConfig
  includeCSS?: boolean
  prose?: boolean
  wrapperClassName?: string
}

/**
 * Render result
 */
export interface MdxRenderResult {
  html: string
  css?: string
  frontmatter?: Record<string, any>
}

/**
 * Create a rehype plugin to apply tweakcn styles
 */
function rehypeTweakcn(config?: TweakcnConfig) {
  return (tree: any) => {
    if (!config) return

    visit(tree, 'element', (node) => {
      const { tagName } = node

      // Map HTML tags to component names
      const componentMap: Record<string, string> = {
        h1: 'heading',
        h2: 'heading',
        h3: 'heading',
        h4: 'heading',
        h5: 'heading',
        h6: 'heading',
        p: 'paragraph',
        a: 'link',
        img: 'image',
        code: 'code',
        pre: 'pre',
        blockquote: 'blockquote',
        table: 'table',
        th: 'th',
        td: 'td',
        button: 'button',
        ul: 'list',
        ol: 'list',
      }

      const componentName = componentMap[tagName]
      if (componentName) {
        // Get variant for headings
        const variant = tagName.match(/^h[1-6]$/) ? tagName : undefined

        // Get styles
        const className = getComponentStyles(config, componentName, variant)
        const inlineStyles = getComponentInlineStyles(config, componentName)

        // Apply className
        if (className) {
          node.properties = node.properties || {}
          const existingClass = node.properties.className || []
          node.properties.className = Array.isArray(existingClass)
            ? [...existingClass, ...className.split(' ')]
            : [existingClass, ...className.split(' ')].filter(Boolean)
        }

        // Apply inline styles
        if (Object.keys(inlineStyles).length > 0) {
          node.properties = node.properties || {}
          const existingStyle = node.properties.style || {}
          node.properties.style = {
            ...existingStyle,
            ...inlineStyles,
          }
        }
      }
    })
  }
}

/**
 * Extract frontmatter from markdown
 */
function extractFrontmatter() {
  return (tree: any, file: any) => {
    visit(tree, 'yaml', (node: any) => {
      try {
        // Simple YAML parsing for frontmatter
        const lines = node.value.split('\n')
        const frontmatter: Record<string, any> = {}
        for (const line of lines) {
          const match = line.match(/^([^:]+):\s*(.+)$/)
          if (match) {
            frontmatter[match[1].trim()] = match[2].trim()
          }
        }
        file.data.frontmatter = frontmatter
      } catch (error) {
        // Ignore parsing errors
      }
    })
  }
}

/**
 * Render MDX content to HTML with tweakcn styles
 */
export async function renderMdx(content: string, options: MdxRenderOptions = {}): Promise<MdxRenderResult> {
  const { config, includeCSS = true, prose = true, wrapperClassName = 'mdx-content' } = options

  // Process markdown to HTML
  const processor = unified()
    .use(remarkParse)
    .use(remarkFrontmatter, ['yaml'])
    .use(extractFrontmatter)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeSlug)
    .use(rehypeTweakcn, config)
    .use(rehypeStringify, { allowDangerousHtml: true })

  const file = await processor.process(content)

  let html = String(file)

  // Wrap in container with optional prose class
  const classes = [wrapperClassName]
  if (prose) {
    classes.push('prose', 'prose-slate', 'max-w-none')
  }

  html = `<div class="${classes.join(' ')}">\n${html}\n</div>`

  // Generate CSS if requested
  let css: string | undefined
  if (includeCSS && config) {
    css = generateCSS(config)
  }

  return {
    html,
    css,
    frontmatter: file.data.frontmatter as Record<string, any> | undefined,
  }
}

/**
 * Generate CSS from tweakcn config
 */
function generateCSS(config: TweakcnConfig): string {
  const cssBlocks: string[] = []

  // Add CSS variables
  if (config.theme?.colors) {
    const vars: string[] = [':root {']
    Object.entries(config.theme.colors).forEach(([key, value]) => {
      if (value) {
        vars.push(`  --color-${key}: ${value};`)
      }
    })
    vars.push('}')
    cssBlocks.push(vars.join('\n'))
  }

  // Add font imports if using web fonts
  if (config.theme?.fonts) {
    const fonts = Object.values(config.theme.fonts).filter(Boolean)
    const uniqueFonts = [...new Set(fonts)]

    // Generate Google Fonts import (example)
    if (uniqueFonts.length > 0 && uniqueFonts.some(f => f !== 'system-ui' && f !== 'monospace')) {
      const fontFamilies = uniqueFonts
        .filter((f): f is string => typeof f === 'string' && f !== 'system-ui' && f !== 'monospace')
        .map(f => f.replace(/\s+/g, '+'))
        .join('&family=')

      if (fontFamilies) {
        cssBlocks.push(`@import url('https://fonts.googleapis.com/css2?family=${fontFamilies}&display=swap');`)
      }
    }
  }

  // Add custom CSS
  if (config.theme?.customCSS) {
    cssBlocks.push(config.theme.customCSS)
  }

  return cssBlocks.join('\n\n')
}

/**
 * Render MDX to plain text (strip HTML)
 */
export async function renderMdxToText(content: string): Promise<string> {
  const processor = unified()
    .use(remarkParse)
    .use(remarkFrontmatter, ['yaml'])
    .use(remarkGfm)

  const tree = processor.parse(content)
  const textParts: string[] = []

  visit(tree, 'text', (node: any) => {
    textParts.push(node.value)
  })

  return textParts.join(' ').replace(/\s+/g, ' ').trim()
}

/**
 * Extract metadata from MDX content
 */
export async function extractMdxMetadata(content: string): Promise<{
  frontmatter?: Record<string, any>
  headings: Array<{ level: number; text: string; id: string }>
  wordCount: number
  readingTime: number // in minutes
}> {
  const processor = unified()
    .use(remarkParse)
    .use(remarkFrontmatter, ['yaml'])
    .use(extractFrontmatter)
    .use(remarkGfm)

  const file = await processor.process(content)
  const tree = processor.parse(content)

  // Extract headings
  const headings: Array<{ level: number; text: string; id: string }> = []
  visit(tree, 'heading', (node: any) => {
    const text = node.children
      .filter((child: any) => child.type === 'text')
      .map((child: any) => child.value)
      .join('')

    const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')

    headings.push({
      level: node.depth,
      text,
      id,
    })
  })

  // Calculate word count
  const text = await renderMdxToText(content)
  const wordCount = text.split(/\s+/).filter(Boolean).length

  // Estimate reading time (average 200 words per minute)
  const readingTime = Math.ceil(wordCount / 200)

  return {
    frontmatter: file.data.frontmatter as Record<string, any> | undefined,
    headings,
    wordCount,
    readingTime,
  }
}

/**
 * Render MDX with custom components (React-like syntax)
 */
export interface ComponentMapping {
  [key: string]: (props: any, children: string) => string
}

export async function renderMdxWithComponents(
  content: string,
  components: ComponentMapping,
  options: MdxRenderOptions = {}
): Promise<MdxRenderResult> {
  // First, render basic MDX
  const result = await renderMdx(content, options)

  // Then, apply component replacements
  let html = result.html
  for (const [name, renderer] of Object.entries(components)) {
    // Simple regex-based component replacement
    const regex = new RegExp(`<${name}([^>]*)>(.*?)</${name}>`, 'gs')
    html = html.replace(regex, (match, attrs, children) => {
      const props = parseAttributes(attrs)
      return renderer(props, children)
    })
  }

  return {
    ...result,
    html,
  }
}

/**
 * Parse HTML attributes string to object
 */
function parseAttributes(attrString: string): Record<string, string> {
  const attrs: Record<string, string> = {}
  const regex = /(\w+)=["']([^"']*)["']/g
  let match

  while ((match = regex.exec(attrString)) !== null) {
    if (match[1] && match[2] !== undefined) {
      attrs[match[1]] = match[2]
    }
  }

  return attrs
}
