/**
 * @mdxui/react - React components with dual API support
 *
 * All components support two usage patterns:
 * 1. Explicit props: <Hero headline="..." />
 * 2. MDX children: <Hero># Headline</Hero>
 *
 * Components automatically extract structured props from markdown content.
 */

// Hooks
export { useDualAPI } from './hooks/useDualAPI.js'

// Utilities
export { cn } from './utils/cn.js'

// Background components
export * from './components/backgrounds/index.js'

// Marketing components
export * from './components/marketing/index.js'
