import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserComponent } from './BrowserComponent.js'
import type { BrowserComponentProps, BrowserMode, SimplifiedBrowserOptions, TestResult } from './types.js'
import { TestResultsPanel } from './components/TestResultsPanel.js'

export { BrowserComponent, TestResultsPanel }
export type { BrowserComponentProps, BrowserMode, SimplifiedBrowserOptions, TestResult }

export {
  detectFileType,
  detectFileTypeFromUrl,
  detectFileTypeFromMimeType,
  detectFileTypeFromExtension,
  isSupportedFile,
  getFileExtension,
  isTextFile,
  SUPPORTED_EXTENSIONS,
  SUPPORTED_MIME_TYPES,
  shouldRenderWithMonaco,
  type FileTypeInfo,
} from './fileDetection.js'

export {
  createMonacoEditor,
  createMonacoContainer,
  replacePageWithMonaco,
  renderFileWithMonaco,
  getLanguageFromFileType,
  getLanguageFromExtension,
  setupMonacoThemes,
  setupMonacoEnvironment,
  initializeMonaco,
  DEFAULT_MONACO_CONFIG,
  type MonacoConfig,
} from './monacoUtils.js'

export { extractPageContent, fetchFileContent, addLoadingIndicator, removeLoadingIndicator } from './utils.js'

export function render(elementId: string, options: SimplifiedBrowserOptions): void {
  const element = document.getElementById(elementId)
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found`)
  }

  const reactElement = React.createElement(BrowserComponent, {
    mode: options.mode || 'browse',
    content: options.content,
    language: options.language || 'markdown',
    theme: options.theme || 'github-dark',
    onContentChange: options.onContentChange,
    onNavigate: options.onNavigate,
    onSave: options.onSave,
    readOnly: options.readOnly || false,
    className: options.className || '',
    style: options.style || {},
    // Test runner props
    enableTesting: options.enableTesting !== undefined ? options.enableTesting : true,
    onTestResults: options.onTestResults,
    showTestButton: options.showTestButton !== undefined ? options.showTestButton : true,
  })

  const root = createRoot(element)
  root.render(reactElement)
}
