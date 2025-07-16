// Monaco renderer utilities for Chrome extension
// Refactored from monacoRenderer.ts to work with unified architecture

import type { MonacoEditorProxy, RenderOptions } from '../types/index.js'
import { MONACO_INIT_TIMEOUT_MS } from '../constants/index.js'

// Import types to get global Window extensions
import '../types/index.js'

export async function initializeMonaco(): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log('Monaco: Sending init message to background script')

    const handleMonacoReady = () => {
      console.log('Monaco: Ready event received')
      window.removeEventListener('monaco-ready', handleMonacoReady)
      resolve()
    }

    window.addEventListener('monaco-ready', handleMonacoReady)

    try {
      chrome.runtime.sendMessage({ type: 'initializeMonaco' }, (response) => {
        console.log('Monaco: Background script response:', response)
        if (chrome.runtime.lastError) {
          console.error('Monaco: Chrome runtime error:', chrome.runtime.lastError.message)
          window.removeEventListener('monaco-ready', handleMonacoReady)
          reject(new Error(`Extension communication failed: ${chrome.runtime.lastError.message}`))
          return
        }
        if (!response?.success) {
          window.removeEventListener('monaco-ready', handleMonacoReady)
          reject(new Error('Failed to initialize Monaco'))
        }
      })
    } catch (error) {
      console.error('Monaco: Failed to send message to background script:', error)
      window.removeEventListener('monaco-ready', handleMonacoReady)
      reject(new Error('Extension context invalidated - please reload the page'))
    }

    setTimeout(() => {
      window.removeEventListener('monaco-ready', handleMonacoReady)
      reject(new Error('Monaco initialization timeout'))
    }, MONACO_INIT_TIMEOUT_MS)
  })
}

export function setupMonacoThemes(): void {
  window.dispatchEvent(
    new CustomEvent('setup-monaco-theme', {
      detail: {
        name: 'github-dark',
        theme: {
          base: 'vs-dark',
          inherit: true,
          rules: [
            { token: '', foreground: 'e1e4e8', background: '0d1117' },
            { token: 'comment', foreground: '8b949e', fontStyle: 'italic' },
            { token: 'keyword', foreground: 'ff7b72' },
            { token: 'string', foreground: 'a5d6ff' },
            { token: 'number', foreground: '79c0ff' },
            { token: 'regexp', foreground: '7ee787' },
            { token: 'type', foreground: 'ffa657' },
            { token: 'class', foreground: 'ffa657' },
            { token: 'function', foreground: 'd2a8ff' },
            { token: 'variable', foreground: 'ffa657' },
            { token: 'constant', foreground: '79c0ff' },
            { token: 'property', foreground: '79c0ff' },
            { token: 'attribute', foreground: '7ee787' },
            { token: 'tag', foreground: '7ee787' },
            { token: 'delimiter', foreground: 'e1e4e8' },
          ],
          colors: {
            'editor.background': '#0d1117',
            'editor.foreground': '#e1e4e8',
            'editor.lineHighlightBackground': '#161b22',
            'editor.selectionBackground': '#264f78',
            'editor.inactiveSelectionBackground': '#3a3d41',
            'editorCursor.foreground': '#e1e4e8',
            'editorWhitespace.foreground': '#484f58',
            'editorLineNumber.foreground': '#6e7681',
            'editorLineNumber.activeForeground': '#e1e4e8',
          },
        },
      },
    }),
  )
}

// Language detection functions are now centralized in utils/fileDetection.ts

export function createMonacoEditor(container: HTMLElement, options: RenderOptions): Promise<MonacoEditorProxy> {
  return new Promise((resolve, reject) => {
    console.log('Monaco: Creating editor via main world')

    // Generate unique ID for this editor request
    const editorId = `editor-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Ensure container has an ID
    if (!container.id) {
      container.id = `monaco-container-${editorId}`
    }

    const handleEditorCreated = (event: Event) => {
      const customEvent = event as CustomEvent

      if (!customEvent.detail) {
        console.error('Monaco: Editor created event has no detail')
        return
      }

      if (customEvent.detail.editorId === editorId && customEvent.detail.success) {
        console.log('Monaco: Editor created successfully in main world')
        window.removeEventListener('monaco-editor-created', handleEditorCreated)
        window.removeEventListener('monaco-editor-error', handleEditorError)

        // Create a proxy object for the editor since the real editor stays in main world
        const editorProxy: MonacoEditorProxy = {
          editorId,
          layout: () => {
            window.dispatchEvent(new CustomEvent(`monaco-editor-${editorId}-resize`))
          },
          dispose: () => {
            window.dispatchEvent(new CustomEvent(`monaco-editor-${editorId}-dispose`))
          },
          getValue: () => {
            // For future implementation - would need message passing to get value
            return undefined
          },
          setValue: (value: string) => {
            // For future implementation - would need message passing to set value
            window.dispatchEvent(
              new CustomEvent(`monaco-editor-${editorId}-setValue`, {
                detail: { value },
              }),
            )
          },
        }

        resolve(editorProxy)
      }
    }

    const handleEditorError = (event: Event) => {
      const customEvent = event as CustomEvent

      if (!customEvent.detail) {
        console.error('Monaco: Editor error event has no detail')
        window.removeEventListener('monaco-editor-error', handleEditorError)
        window.removeEventListener('monaco-editor-created', handleEditorCreated)
        reject(new Error('Monaco editor creation failed with no error details'))
        return
      }

      if (customEvent.detail.editorId === editorId) {
        console.error('Monaco: Editor creation failed:', customEvent.detail.error)
        window.removeEventListener('monaco-editor-error', handleEditorError)
        window.removeEventListener('monaco-editor-created', handleEditorCreated)
        reject(new Error(customEvent.detail.error))
      }
    }

    window.addEventListener('monaco-editor-created', handleEditorCreated)
    window.addEventListener('monaco-editor-error', handleEditorError)

    // Send create editor request to main world
    window.dispatchEvent(
      new CustomEvent('create-monaco-editor', {
        detail: {
          editorId,
          containerId: container.id,
          options: {
            value: options.content,
            language: options.language,
            theme: options.theme || 'github-dark',
            wordWrap: 'on',
            lineNumbers: 'off',
            readOnly: options.readOnly || false,
            automaticLayout: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            renderWhitespace: 'none',
            renderControlCharacters: false,
            fontSize: 14,
            fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
            lineHeight: 1.5,
            padding: {
              top: 16,
              bottom: 16,
            },
            scrollbar: {
              vertical: 'auto',
              horizontal: 'auto',
              verticalScrollbarSize: 8,
              horizontalScrollbarSize: 8,
              verticalSliderSize: 8,
              horizontalSliderSize: 8,
              useShadows: false,
              verticalHasArrows: false,
              horizontalHasArrows: false,
              alwaysConsumeMouseWheel: false,
            },
          },
        },
      }),
    )

    // Timeout after 5 seconds
    setTimeout(() => {
      window.removeEventListener('monaco-editor-created', handleEditorCreated)
      window.removeEventListener('monaco-editor-error', handleEditorError)
      reject(new Error('Monaco editor creation timeout'))
    }, 5000)
  })
}
