// Enhanced file detection utilities for Chrome extension
import type { FileTypeInfo } from '../types/index.js'
import { SUPPORTED_EXTENSIONS } from '../constants/index.js'

export function getFileExtension(url: string): string {
  const path = url.split('/').pop() || ''
  const parts = path.split('.')
  return parts.length > 1 ? parts.pop()!.toLowerCase() : ''
}

export function detectFileTypeFromUrl(url: string): FileTypeInfo {
  const extension = getFileExtension(url)
  const fullExtension = `.${extension}`

  const isSupported = SUPPORTED_EXTENSIONS.includes(fullExtension as (typeof SUPPORTED_EXTENSIONS)[number])

  let fileType: FileTypeInfo['fileType'] = 'other'
  if (extension === 'md' || extension === 'markdown') {
    fileType = 'markdown'
  } else if (extension === 'mdx') {
    fileType = 'mdx'
  } else if (extension === 'txt') {
    fileType = 'text'
  } else if ((SUPPORTED_EXTENSIONS as readonly string[]).includes(fullExtension)) {
    fileType = 'code'
  }

  return {
    fileType,
    isSupported,
    extension,
  }
}

export function isSupportedFile(url: string, mimeType?: string): boolean {
  // Only activate on direct file URLs, not regular websites
  const extension = getFileExtension(url)
  const fullExtension = `.${extension}`

  // Special case for llms.txt files
  const isLlmsTxt = /\/llms\.txt(?:\?|#|$)/i.test(url)
  if (isLlmsTxt) {
    return true
  }

  // Exclude common website patterns that may have file extensions in URLs
  const isWebsitePage = 
    // GitHub website pages (not raw content)
    /^https?:\/\/github\.com\/.+\/(actions|issues|pulls|releases|wiki|discussions|security|insights|settings)\//.test(url) ||
    // General website patterns that aren't direct file access
    /^https?:\/\/[^/]+\/[^/]*\.(php|jsp|asp|aspx|cgi|do|action)/.test(url) ||
    // URLs with common web app patterns
    /\/api\/|\/app\/|\/admin\/|\/dashboard\//.test(url)

  if (isWebsitePage) {
    return false
  }

  // Check if URL looks like a direct file (has extension in path, not just query params)
  const hasFileExtensionInPath = /\.[a-zA-Z0-9]+(?:\?|#|$)/.test(url)

  // Only proceed if it looks like a file URL
  if (!hasFileExtensionInPath) {
    return false
  }

  const hasSupported = (SUPPORTED_EXTENSIONS as readonly string[]).includes(fullExtension)

  // For MIME type, be much more restrictive - only pure content types
  const restrictedSupportedMimes = [
    'text/markdown',
    'text/x-markdown',
    'text/plain', // Only for direct file access
    'text/mdx',
    'text/mdx+ld',
    'text/markdown+ld',
  ]

  const hasSupportedMime = mimeType ? restrictedSupportedMimes.includes(mimeType) : false

  return hasSupported || hasSupportedMime
}

export function shouldRenderWithMdx(fileInfo: FileTypeInfo): boolean {
  return fileInfo.fileType === 'markdown' || fileInfo.fileType === 'mdx'
}

export function checkIfMarkdownFile(): boolean {
  const url = window.location.href
  const contentType = document.contentType || ''

  console.log('FileDetection: Checking if markdown - URL:', url, 'Content-Type:', contentType)

  // Exclude GitHub website pages that aren't raw content
  const isGitHubWebsitePage = 
    /^https?:\/\/github\.com\/.+\/(actions|issues|pulls|releases|wiki|discussions|security|insights|settings|blob|tree)\//.test(url)
  
  if (isGitHubWebsitePage) {
    console.log('FileDetection: Skipping GitHub website page:', url)
    return false
  }

  // Much more restrictive - only activate on:
  // 1. URLs that clearly end with markdown extensions
  // 2. Raw content URLs (github raw, etc.)
  // 3. File:// protocol
  // 4. Direct markdown MIME types (not text/html)
  // 5. llms.txt files (AI-readable site information)

  const hasMarkdownExtension = /\.(md|mdx|markdown)(?:\?|#|$)/i.test(url)
  const isLlmsTxt = /\/llms\.txt(?:\?|#|$)/i.test(url)
  const isRawContent = /raw\.githubusercontent\.com|cdn\.rawgit\.com|rawgit\.com|gist\.githubusercontent\.com/.test(url)
  const isFileProtocol = url.startsWith('file://')
  const isMarkdownMimeType =
    contentType.startsWith('text/markdown') ||
    contentType.startsWith('text/x-markdown') ||
    contentType.startsWith('text/mdx') ||
    contentType === 'text/mdx+ld' ||
    contentType === 'text/markdown+ld'

  // Only activate if it's clearly a markdown file, llms.txt, or not a regular webpage
  return hasMarkdownExtension || isLlmsTxt || isRawContent || isFileProtocol || isMarkdownMimeType
}

export function getLanguageFromExtension(extension: string): string {
  const languageMap: Record<string, string> = {
    md: 'markdown',
    mdx: 'markdown',
    markdown: 'markdown',
    js: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    jsx: 'javascript',
    json: 'json',
    html: 'html',
    css: 'css',
    scss: 'scss',
    less: 'less',
    xml: 'xml',
    yaml: 'yaml',
    yml: 'yaml',
    txt: 'plaintext',
  }
  return languageMap[extension] || 'plaintext'
}

export function getLanguageFromMimeType(mimeType: string): string {
  const mimeLanguageMap: Record<string, string> = {
    'text/markdown': 'markdown',
    'text/x-markdown': 'markdown',
    'application/javascript': 'javascript',
    'text/javascript': 'javascript',
    'application/typescript': 'typescript',
    'text/typescript': 'typescript',
    'application/json': 'json',
    'text/html': 'html',
    'text/css': 'css',
    'text/xml': 'xml',
    'application/xml': 'xml',
    'text/yaml': 'yaml',
    'application/yaml': 'yaml',
    'text/plain': 'plaintext',
  }
  return mimeLanguageMap[mimeType] || 'plaintext'
}

export function detectLanguage(url: string, mimeType: string): string {
  // First try to detect from MIME type (more reliable for dynamic URLs)
  const languageFromMime = getLanguageFromMimeType(mimeType)
  if (languageFromMime !== 'plaintext') {
    return languageFromMime
  }

  // Fallback to extension-based detection
  const extension = url.split('/').pop()?.split('.').pop()?.toLowerCase() || ''
  return getLanguageFromExtension(extension)
}
