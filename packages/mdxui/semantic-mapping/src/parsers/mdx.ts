import type { ReactNode } from 'react'
import type { MDXNode } from '../utils/types.js'
import { isReactElement, isString } from '../utils/types.js'

/**
 * Parse React children into MDX AST nodes
 */
export function parseChildren(children: ReactNode): MDXNode[] {
  const nodes: MDXNode[] = []

  const processNode = (node: any): void => {
    // Handle null/undefined
    if (node === null || node === undefined) {
      return
    }

    // Handle arrays of children
    if (Array.isArray(node)) {
      node.forEach(processNode)
      return
    }

    // Handle strings
    if (isString(node)) {
      if (node.trim().length > 0) {
        nodes.push({
          type: 'text',
          children: node,
        })
      }
      return
    }

    // Handle React elements
    if (isReactElement(node)) {
      const props: Record<string, any> = node.props || {}
      const mdxNode: MDXNode = {
        type: typeof node.type === 'string' ? node.type : 'component',
        props,
      }

      // Process children recursively
      if (props.children) {
        const childNodes = parseChildren(props.children)
        if (childNodes.length > 0) {
          mdxNode.children = childNodes
        }
      }

      nodes.push(mdxNode)
      return
    }

    // Handle numbers and other primitives
    if (typeof node === 'number' || typeof node === 'boolean') {
      nodes.push({
        type: 'text',
        children: String(node),
      })
    }
  }

  processNode(children)
  return nodes
}

/**
 * Flatten nested MDX nodes into a single array
 */
export function flattenNodes(nodes: MDXNode[]): MDXNode[] {
  const flattened: MDXNode[] = []

  const processNode = (node: MDXNode): void => {
    flattened.push(node)
    if (Array.isArray(node.children)) {
      node.children.forEach(processNode)
    }
  }

  nodes.forEach(processNode)
  return flattened
}
