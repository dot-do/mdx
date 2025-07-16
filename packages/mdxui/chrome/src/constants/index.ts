// Centralized constants for Chrome extension

// Rendering constants
export const RENDER_DEBOUNCE_MS = 50
export const SCROLL_THRESHOLD_PX = 50

// Shiki theme constants
export const DEFAULT_SHIKI_THEME = 'github-dark'
export const FALLBACK_LANGUAGE = 'text'

// Monaco timeout constants
export const MONACO_INIT_TIMEOUT_MS = 10000

// HTML escape mappings
export const HTML_ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#039;',
} as const

// File type constants
export const SUPPORTED_EXTENSIONS = [
  '.md',
  '.mdx',
  '.markdown',
  '.txt',
  '.js',
  '.ts',
  '.tsx',
  '.jsx',
  '.json',
  '.html',
  '.css',
  '.scss',
  '.less',
  '.xml',
  '.yaml',
  '.yml',
] as const

export const SUPPORTED_MIME_TYPES = [
  'text/plain',
  'text/markdown',
  'text/x-markdown',
  'application/javascript',
  'text/javascript',
  'application/typescript',
  'text/typescript',
  'application/json',
  'text/html',
  'text/css',
  'text/xml',
  'application/xml',
  'text/yaml',
  'application/yaml',
] as const

// Monaco CDN constants
export const MONACO_CDN_VERSION = '0.45.0'
export const MONACO_CDN_BASE = `https://unpkg.com/monaco-editor@${MONACO_CDN_VERSION}/min/vs`

// CSS styles for fallback rendering
export const FALLBACK_STYLES = {
  container: `
    font-family: ui-monospace, SFMono-Regular, 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace;
    font-size: 15px;
    line-height: 1.4;
    color: #e6edf3;
    background-color: #0d1117;
    padding: 20px;
    margin: 0;
    white-space: pre-wrap;
    word-wrap: break-word;
    overflow-wrap: break-word;
    max-width: 100%;
  `,
  fallbackPre: `
    color: #e6edf3;
    padding: 0 20px;
    margin: 0;
    font-family: ui-monospace, SFMono-Regular, 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace;
    font-size: 15px;
    line-height: 1.4;
    white-space: pre-wrap;
    word-wrap: break-word;
    overflow-wrap: break-word;
    max-width: 100%;
  `,
} as const

// Keyboard shortcuts
export const KEYBOARD_SHORTCUTS = {
  TOGGLE_MODE: 'e',
} as const
