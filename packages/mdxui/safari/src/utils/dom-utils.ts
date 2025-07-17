// DOM utilities for Safari extension
import { HTML_ESCAPE_MAP, FALLBACK_STYLES } from '../constants/index.js'

/**
 * Extracts page content from various sources
 */
export function extractPageContent(): string {
  const sources = [
    () => document.querySelector('pre')?.textContent || '',
    () => document.querySelector('body > *:first-child')?.textContent || '',
    () => document.body.textContent || '',
    () => document.documentElement.textContent || '',
  ]

  for (const getContent of sources) {
    const content = getContent()
    if (content.trim()) {
      return content
    }
  }

  return ''
}

/**
 * Escapes HTML characters in a text string
 */
export function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (m: string) => HTML_ESCAPE_MAP[m] || m)
}

/**
 * Creates fallback HTML content when other rendering methods fail
 */
export function createFallbackContent(content: string): string {
  return `
    <div style="${FALLBACK_STYLES.container}">
      <pre style="${FALLBACK_STYLES.fallbackPre}">${escapeHtml(content)}</pre>
    </div>
  `
}

/**
 * Creates a CSS style element with the given styles
 */
export function createStyleElement(id: string, styles: string): HTMLStyleElement {
  const existingStyle = document.getElementById(id)
  if (existingStyle) {
    existingStyle.remove()
  }

  const style = document.createElement('style')
  style.id = id
  style.textContent = styles
  return style
}

/**
 * Checks if a node contains only text content
 */
export function isTextOnlyNode(node: Node): boolean {
  if (node.nodeType === Node.TEXT_NODE) {
    return true
  }

  if (node.nodeType === Node.ELEMENT_NODE) {
    const element = node as Element
    return element.children.length === 0 && element.textContent?.trim() !== ''
  }

  return false
}

/**
 * Safely gets scroll position
 */
export function getScrollPosition(): number {
  return window.scrollY || document.documentElement.scrollTop || 0
}

/**
 * Safely scrolls to a position
 */
export function scrollToPosition(position: number): void {
  try {
    window.scrollTo({
      top: position,
      behavior: 'instant',
    })
  } catch {
    // Fallback for older browsers
    window.scrollTo(0, position)
  }
}

/**
 * Checks if user has scrolled near bottom of page
 */
export function isNearBottom(threshold: number = 50): boolean {
  const scrollPosition = window.scrollY + window.innerHeight
  const documentHeight = document.documentElement.scrollHeight
  return scrollPosition >= documentHeight - threshold
}
