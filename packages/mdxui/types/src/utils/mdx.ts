import type { ReactNode } from 'react'

/**
 * Represents extracted content from MDX children
 */
export interface ExtractedContent {
  /** Main headline (first h1 or h2) */
  headline?: string
  /** Description text (first paragraph or multiple paragraphs) */
  description?: string
  /** Image URL (first image src) */
  imageUrl?: string
  /** Image alt text */
  imageAlt?: string
  /** All text content concatenated */
  fullText?: string
  /** Remaining unparsed children */
  remainingChildren?: ReactNode
}

/**
 * Represents a section boundary in MDX content
 */
export interface SectionBoundary {
  /** Section type detected */
  type: 'hero' | 'features' | 'pricing' | 'cta' | 'testimonial' | 'faq' | 'unknown'
  /** Start index in children array */
  startIndex: number
  /** End index in children array */
  endIndex: number
  /** Confidence score (0-100) */
  confidence: number
}

/**
 * MDX parsing result
 */
export interface MDXParseResult<T = any> {
  /** Extracted structured props */
  props: Partial<T>
  /** Sections detected in content */
  sections: SectionBoundary[]
  /** Any unparsed/unrecognized content */
  unparsed: ReactNode[]
}

/**
 * Type guard to check if children exist
 */
export function hasChildren(props: { children?: ReactNode }): props is { children: ReactNode } {
  return props.children !== undefined && props.children !== null
}

/**
 * Type representing MDX component props with dual API support
 * Either explicit props OR MDX children (or both)
 */
export type DualAPIProps<ExplicitProps> = ExplicitProps & {
  /** MDX children content that will be parsed to extract props */
  children?: ReactNode
  /** Whether to prefer explicit props over parsed children (default: true) */
  preferExplicitProps?: boolean
}
