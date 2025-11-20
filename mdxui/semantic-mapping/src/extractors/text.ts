import type { MDXNode } from '../utils/types.js'
import { isString } from '../utils/types.js'

/**
 * Extract all text content from a node and its children
 */
export function extractText(node: MDXNode): string {
  if (!node) return ''

  const parts: string[] = []

  const processNode = (n: MDXNode): void => {
    if (isString(n.children)) {
      parts.push(n.children)
    } else if (Array.isArray(n.children)) {
      n.children.forEach(processNode)
    }
  }

  processNode(node)
  return parts.join(' ').replace(/\s+/g, ' ').trim()
}

/**
 * Extract text from multiple nodes
 */
export function extractTextFromNodes(nodes: MDXNode[]): string {
  return nodes.map(extractText).filter(Boolean).join(' ')
}

/**
 * Extract text from specific node type
 */
export function extractTextByType(nodes: MDXNode[], type: string): string[] {
  return nodes.filter(n => n.type === type).map(extractText).filter(Boolean)
}

/**
 * Find first text content in nodes
 */
export function findFirstText(nodes: MDXNode[]): string {
  for (const node of nodes) {
    const text = extractText(node)
    if (text) return text
  }
  return ''
}
