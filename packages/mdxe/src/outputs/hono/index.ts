/**
 * Hono Output Format
 *
 * Export all Hono-related functionality
 */

export { createMarkdownApp, type MarkdownOutputOptions } from './markdown'
export { createHtmlApp, type HtmlOutputOptions } from './html'
export { createRouter, createWorkerExport, type RouterOptions, type OutputMode } from './router'

// Re-export shared types
export type { MdxDocument, OutputConfig, StylingConfig, RenderContext, TableOfContents, TocItem } from '../shared/types'

// Re-export shared utilities
export { parseMdx, generateToc, markdownToHtml, sanitizeContent, formatDocument } from '../shared/mdx-utils'
