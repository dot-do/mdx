/**
 * @mdxui/types - TypeScript types for mdxui components
 *
 * All components support dual API:
 * - Explicit props: <Component prop="value" />
 * - MDX children: <Component>markdown content</Component>
 *
 * Components are organized by use case:
 * - Marketing: Landing pages, marketing sites
 * - Docs: Documentation sites, technical guides
 * - Dashboard: Data visualization, analytics
 * - Chat: Conversational interfaces, AI assistants
 */

// Base types and utilities
export * from './shared/common.js'
export * from './utils/polymorphic.js'
export * from './utils/mdx.js'

// Component types by category
export * from './components/marketing/index.js'
export * from './components/docs/index.js'
export * from './components/dashboard/index.js'
export * from './components/chat/index.js'

// Theme configuration
export * from './theme/index.js'
