/**
 * Shared types for mdxe output formats
 */

export interface MdxDocument {
  id: string
  slug: string
  collection: string
  frontmatter: Record<string, any>
  content: string
  html?: string
  toc?: TableOfContents
}

export interface TableOfContents {
  items: TocItem[]
}

export interface TocItem {
  id: string
  text: string
  level: number
  children?: TocItem[]
}

export interface OutputConfig {
  /**
   * Base path for content
   */
  basePath?: string

  /**
   * Collections to expose
   */
  collections: string[]

  /**
   * Custom styling options
   */
  styling?: StylingConfig

  /**
   * mdxdb configuration
   */
  mdxdb?: any
}

export interface StylingConfig {
  /**
   * Tailwind config path or inline config
   */
  tailwind?: string | Record<string, any>

  /**
   * Custom CSS to inject
   */
  customCss?: string

  /**
   * Typography plugin options
   */
  typography?: Record<string, any>
}

export interface RenderContext {
  document: MdxDocument
  collection: string
  config: OutputConfig
}
