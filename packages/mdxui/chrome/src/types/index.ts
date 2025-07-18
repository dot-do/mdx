// Shared type definitions for Chrome extension

export interface ExtensionMessage {
  type: 'toggleMode' | 'getMode' | 'setMode' | 'initializeMonaco' | 'initializeShiki' | 'checkExtensionEnabled'
  mode?: 'browse' | 'edit'
  tabId?: number
  enabled?: boolean
  success?: boolean
  error?: string
}

export interface ExtensionResponse {
  enabled?: boolean
  success?: boolean
  error?: string
  mode?: 'browse' | 'edit'
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

// Monaco Environment is now configured directly in monaco-renderer.ts
