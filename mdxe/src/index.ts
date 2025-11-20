/**
 * MDXE Main API
 * Core functionality for MDX development environment
 */

// Export core API functions
export * from './esbuild/index.js'

// Export types explicitly to avoid conflicts
export type { CodeBlock, EnhancedCodeBlock, MdxContentItem, MdxContentMap, MdxeBuildOptions } from './esbuild/types.js'
