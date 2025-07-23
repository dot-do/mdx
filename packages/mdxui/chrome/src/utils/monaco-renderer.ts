// Monaco renderer utilities for Chrome extension - simplified with bundled Monaco

import * as monaco from 'monaco-editor'
import type { RenderOptions } from '../types/index.js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(window as any).MonacoEnvironment = {
  getWorkerUrl: () => {
    // Return empty data URL to prevent worker creation
    return 'data:text/javascript;charset=utf-8,'
  },
  getWorker: () => {
    // Return a mock worker that does nothing
    return {
      postMessage: () => {},
      terminate: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
    }
  },
}

// Override Monaco's worker creation at the module level to prevent any worker attempts
const originalFetch = window.fetch
window.fetch = (...args) => {
  const url = args[0]
  if (typeof url === 'string' && url.includes('monaco') && url.includes('worker')) {
    // Block any Monaco worker-related fetch requests
    return Promise.reject(new Error('Monaco workers disabled in Chrome extension'))
  }
  return originalFetch.apply(window, args)
}

// Override Worker constructor to prevent Monaco from creating workers
const OriginalWorker = window.Worker
window.Worker = class extends OriginalWorker {
  constructor(scriptURL: string | URL, options?: WorkerOptions) {
    if (typeof scriptURL === 'string' && scriptURL.includes('monaco')) {
      // Throw error for Monaco workers to force fallback to main thread
      throw new Error('Monaco workers disabled in Chrome extension')
    }
    super(scriptURL, options)
  }
} as typeof Worker

export async function initializeMonaco(): Promise<void> {
  console.log('Monaco: Initializing bundled Monaco editor (workers disabled)')

  // Suppress Monaco worker warnings
  const originalWarn = console.warn
  console.warn = (...args) => {
    const message = args.join(' ')
    if (message.includes('Could not create web worker') || message.includes('Falling back to loading web worker code in main thread')) {
      return // Suppress these specific warnings
    }
    originalWarn.apply(console, args)
  }

  // Monaco is already available via import, just set up themes
  setupMonacoThemes()

  // Inject CSS to prevent codicon font loading
  const style = document.createElement('style')
  style.textContent = `
    /* Prevent Monaco codicon font loading errors */
    .monaco-editor .codicon {
      font-family: system-ui, -apple-system, sans-serif !important;
    }
    .monaco-editor .codicon:before {
      content: "" !important;
    }
  `
  document.head.appendChild(style)

  console.log('Monaco: Initialization complete')
}

export function setupMonacoThemes(): void {
  monaco.editor.defineTheme('github-dark', {
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
  })
}

export function createMonacoEditor(container: HTMLElement, options: RenderOptions): Promise<monaco.editor.IStandaloneCodeEditor> {
  return new Promise((resolve, reject) => {
    try {
      console.log('Monaco: Creating editor directly with bundled Monaco')

      const editor = monaco.editor.create(container, {
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
        // Disable codicon font loading
        glyphMargin: true,
        folding: false,
        padding: {
          top: 20,
          bottom: 20,
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
      })

      console.log('Monaco: Editor created successfully')
      resolve(editor)
    } catch (error) {
      console.error('Monaco: Failed to create editor:', error)
      reject(error)
    }
  })
}
