// Shared type definitions for Safari extension

export interface ViewMode {
  type: 'browse' | 'edit'
  renderer: 'shiki' | 'monaco'
}

export interface ExtensionMessage {
  type: 'toggleMode' | 'getMode' | 'setMode' | 'initializeMonaco' | 'initializeShiki' | 'checkExtensionEnabled'
  mode?: ViewMode['type']
  tabId?: number
  enabled?: boolean
  success?: boolean
  error?: string
}

export interface ExtensionResponse {
  enabled?: boolean
  success?: boolean
  error?: string
  mode?: ViewMode['type']
}

export interface FileTypeInfo {
  fileType: 'markdown' | 'mdx' | 'text' | 'code' | 'other'
  isSupported: boolean
  extension: string
}

export interface RenderOptions {
  content: string
  language: string
  theme?: string
  readOnly?: boolean
}

export interface ModeToggleOptions {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  showTooltip?: boolean
  enableKeyboardShortcut?: boolean
}

export interface ContentState {
  originalContent: string
  currentContent: string
  hasChanges: boolean
  scrollPosition: number
  lastModified: number
}

// Event types for mode switching
export interface ModeChangeEvent extends CustomEvent {
  detail: {
    fromMode: ViewMode['type']
    toMode: ViewMode['type']
    content: string
  }
}

// Monaco editor proxy interface (since real editor lives in main world)
export interface MonacoEditorProxy {
  editorId: string
  layout(): void
  dispose(): void
  getValue?(): string | undefined
  setValue?(value: string): void
}

// Monaco Editor interfaces
export interface MonacoEditor {
  layout: () => void
  dispose: () => void
  [key: string]: unknown
}

export interface MonacoTheme {
  base: string
  inherit: boolean
  rules: Array<{ token: string; foreground: string; background?: string }>
  colors: Record<string, string>
}

export interface MonacoEditorOptions {
  value?: string
  language?: string
  theme?: string
  readOnly?: boolean
  automaticLayout?: boolean
  [key: string]: unknown
}

// Shiki processing result
export interface ShikiRenderResult {
  html: string
  hasCodeBlocks: boolean
  hasFrontmatter: boolean
  isStreaming: boolean
}

// Renderer interface for syntax highlighting
export interface IShikiRenderer {
  render(options: RenderOptions): Promise<ShikiRenderResult>
  getShikiStyles(): string
}

// Global window extensions for Monaco and RequireJS
declare global {
  interface Window {
    MonacoEnvironment?: {
      getWorkerUrl?: () => string | undefined
      getWorker?: () => Worker | undefined
    }
    require?: {
      config: (options: { paths: Record<string, string> }) => void
      (modules: string[], callback: () => void): void
    }
    monaco?: {
      editor: {
        defineTheme: (name: string, theme: MonacoTheme) => void
        create: (container: HTMLElement, options: MonacoEditorOptions) => MonacoEditor
      }
    }
    __monacoEditors?: Record<string, MonacoEditor>
    // Shiki globals
    __shikiLoaded?: boolean
    __shikiHighlighter?: {
      codeToHtml: (code: string, options: { lang: string; theme: string }) => string
    }
    __createHighlighter?: (options: { themes: string[]; langs: string[] }) => Promise<{
      codeToHtml: (code: string, options: { lang: string; theme: string }) => string
    }>
  }
}
