// Enhanced file detection utilities for Chrome extension
import type { FileTypeInfo } from '../types/index.js'
import { SUPPORTED_EXTENSIONS, SUPPORTED_MIME_TYPES } from '../constants/index.js'

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
  const extension = getFileExtension(url)
  const fullExtension = `.${extension}`

  const hasSupported = (SUPPORTED_EXTENSIONS as readonly string[]).includes(fullExtension)
  const hasSupportedMime = mimeType ? (SUPPORTED_MIME_TYPES as readonly string[]).includes(mimeType) : false

  return hasSupported || hasSupportedMime
}

export function shouldRenderWithMdx(fileInfo: FileTypeInfo): boolean {
  return fileInfo.fileType === 'markdown' || fileInfo.fileType === 'mdx'
}

export function checkIfMarkdownFile(): boolean {
  const url = window.location.href
  const contentType = document.contentType || ''

  console.log('FileDetection: Checking if markdown - URL:', url, 'Content-Type:', contentType)

  return (
    /\.(md|mdx|markdown)$/i.test(url) ||
    contentType.startsWith('text/markdown') ||
    contentType.startsWith('text/plain') ||
    contentType.startsWith('text/mdx') ||
    contentType.startsWith('text/mdx+ld') ||
    contentType.startsWith('text/markdown+ld')
  )
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
