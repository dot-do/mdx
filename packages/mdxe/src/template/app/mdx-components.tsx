// @ts-nocheck
import type { MDXComponents } from 'mdx/types'
import { useMDXComponents as getDefaultComponents } from '../components/mdx-components'

// Try to load user-defined components from mdx-components.js
let userComponents: any = null
try {
  // Dynamic import to handle cases where the file doesn't exist
  const userComponentsModule = require('../mdx-components.js')
  if (typeof userComponentsModule.useMDXComponents === 'function') {
    userComponents = userComponentsModule.useMDXComponents
  } else if (userComponentsModule.default && typeof userComponentsModule.default.useMDXComponents === 'function') {
    userComponents = userComponentsModule.default.useMDXComponents
  } else {
    // Fallback to direct export
    userComponents = userComponentsModule.default || userComponentsModule
  }
} catch (error) {
  // File doesn't exist or has errors, use null
  userComponents = null
}

// This function will be called by MDX to get the components
export function useMDXComponents(components: MDXComponents): MDXComponents {
  // Start with default mdxe components
  const defaultComponents = getDefaultComponents({})

  // If user has a useMDXComponents function, call it
  if (typeof userComponents === 'function') {
    return userComponents({
      ...defaultComponents,
      ...components,
    })
  }

  // If user has direct component exports, merge them
  if (userComponents && typeof userComponents === 'object') {
    return {
      ...defaultComponents,
      ...userComponents,
      ...components,
    }
  }

  // No user components, just return defaults with passed components
  return {
    ...defaultComponents,
    ...components,
  }
}
