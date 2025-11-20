/**
 * @mdxui/semantic-mapping - Extract structured props from MDX children
 *
 * Parses React children (MDX content) and extracts component props
 * using semantic understanding of markdown structure.
 */

import type { ReactNode } from 'react'
import { parseChildren } from './parsers/mdx.js'
import { extractHeroProps } from './extractors/hero.js'
import { extractFeaturesProps } from './extractors/features.js'

// Re-export utilities
export { parseChildren, flattenNodes } from './parsers/mdx.js'
export { extractText, extractTextFromNodes } from './extractors/text.js'
export { extractHeroProps } from './extractors/hero.js'
export { extractFeaturesProps } from './extractors/features.js'
export type { MDXNode } from './utils/types.js'

/**
 * Main semantic mapping function - extracts props from MDX children
 * Usage:
 *   const props = extractProps(children, 'hero')
 *   const props = extractProps(children, 'features')
 */
export function extractProps<T = any>(children: ReactNode, componentType: string): Partial<T> {
  // Parse children into AST
  const nodes = parseChildren(children)

  // Extract based on component type
  switch (componentType) {
    case 'hero':
      return extractHeroProps(nodes) as Partial<T>

    case 'features':
      return extractFeaturesProps(nodes) as Partial<T>

    // Add more extractors as needed
    default:
      return {} as Partial<T>
  }
}

/**
 * Convenience function for hero sections
 */
export function extractHero(children: ReactNode) {
  return extractProps(children, 'hero')
}

/**
 * Convenience function for features sections
 */
export function extractFeatures(children: ReactNode) {
  return extractProps(children, 'features')
}
