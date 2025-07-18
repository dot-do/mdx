// Centralized constants for Chrome extension

// Rendering constants
export const RENDER_DEBOUNCE_MS = 50
export const SCROLL_THRESHOLD_PX = 50

// Shiki theme constants
export const DEFAULT_SHIKI_THEME = 'github-dark'
export const FALLBACK_LANGUAGE = 'text'

// Monaco timeout constants
export const MONACO_INIT_TIMEOUT_MS = 10000

// Language subsetting - only bundle these languages for smaller bundle size
export const SUPPORTED_LANGUAGES = [
  'yaml',
  'javascript', 
  'typescript',
  'markdown',
  'md',
  'mdx', 
  'html',
  'json',
  'xml',
  'css'
] as const

export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number]

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
] as const

export const SUPPORTED_MIME_TYPES = [
  'text/plain', // For direct file access only
  'text/markdown',
  'text/x-markdown',
  // Removed text/html, application/javascript, etc. to prevent activation on regular websites
] as const

// Monaco configuration is now handled directly in monaco-renderer.ts
// Workers are disabled to prevent CSP issues in Chrome extensions

// CSS styles for fallback rendering
export const FALLBACK_STYLES = {
  container: `
    font-family: ui-monospace, SFMono-Regular, 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace;
    font-size: 15px;
    line-height: 1.4;
    color: #e6edf3;
    padding: var(--content-padding-x, 20px);
    margin: 0;
    white-space: pre-wrap;
    word-wrap: break-word;
    overflow-wrap: break-word;
    max-width: 100%;
  `,
  fallbackPre: `
    color: #e6edf3;
    padding: 0 var(--content-padding-x, 20px);
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
  TOGGLE_MODE: 'c',
} as const
