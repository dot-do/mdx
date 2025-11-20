import type { ReactNode, ReactElement } from 'react'

/**
 * Represents an MDX AST node
 */
export interface MDXNode {
  type: string
  props?: Record<string, any>
  children?: MDXNode[] | string
}

/**
 * Type guard to check if a value is a React element
 */
export function isReactElement(node: any): node is ReactElement {
  return node !== null && typeof node === 'object' && 'type' in node && 'props' in node
}

/**
 * Type guard to check if a value is a string
 */
export function isString(node: any): node is string {
  return typeof node === 'string'
}

/**
 * Type guard to check if a node is a heading
 */
export function isHeading(node: MDXNode): boolean {
  return node.type === 'h1' || node.type === 'h2' || node.type === 'h3' || node.type === 'h4' || node.type === 'h5' || node.type === 'h6'
}

/**
 * Get heading depth (1-6)
 */
export function getHeadingDepth(node: MDXNode): number | null {
  if (node.type === 'h1') return 1
  if (node.type === 'h2') return 2
  if (node.type === 'h3') return 3
  if (node.type === 'h4') return 4
  if (node.type === 'h5') return 5
  if (node.type === 'h6') return 6
  return null
}

/**
 * Type guard to check if a node is a paragraph
 */
export function isParagraph(node: MDXNode): boolean {
  return node.type === 'p'
}

/**
 * Type guard to check if a node is an image
 */
export function isImage(node: MDXNode): boolean {
  return node.type === 'img'
}

/**
 * Type guard to check if a node is a link
 */
export function isLink(node: MDXNode): boolean {
  return node.type === 'a'
}

/**
 * Type guard to check if a node is a list
 */
export function isList(node: MDXNode): boolean {
  return node.type === 'ul' || node.type === 'ol'
}

/**
 * Type guard to check if a node is a list item
 */
export function isListItem(node: MDXNode): boolean {
  return node.type === 'li'
}
