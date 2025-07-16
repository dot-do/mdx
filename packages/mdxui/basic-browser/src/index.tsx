import { createContext, useEffect, useRef, useContext } from 'react'
import { createRoot } from 'react-dom/client'
import type { ApiClient } from './adapters'
import { BrowserApiClient, StaticApiClient } from './adapters'
import { App } from './components/app'
import { type AppStore, createAppStore, type FileEntry } from './store'

// Create StoreContext for backward compatibility with existing components
export const StoreContext = createContext<AppStore | null>(null)

// Legacy interface for backward compatibility with tests
export interface MdxBrowserLegacyProps {
  content?: string
  mode?: 'browse' | 'edit' | 'preview'
  files?: FileEntry[]
  readOnly?: boolean
  onNavigate?: (url: string) => void
  onFileSelect?: (file: FileEntry) => void
  onSave?: (content: string, file: FileEntry | null) => Promise<void>
  onContentChange?: (content: string) => void
}

// New API client-based interface
export interface MdxBrowserNewProps {
  apiClient?: ApiClient
  onContentChange?: (content: string) => void
  onNavigate?: (url: string) => void
  readOnly?: boolean
  mode?: 'browse' | 'edit' | 'preview'
}

export type MdxBrowserProps = MdxBrowserLegacyProps | MdxBrowserNewProps

// Type guard to distinguish between legacy and new props
function isLegacyProps(props: MdxBrowserProps): props is MdxBrowserLegacyProps {
  return (
    'content' in props || 'mode' in props || 'files' in props || 'readOnly' in props || 'onNavigate' in props || 'onFileSelect' in props || 'onSave' in props
  )
}

function StoreUpdater(props: MdxBrowserLegacyProps) {
  const store = useContext(StoreContext)
  if (!store) throw new Error('StoreUpdater must be used within a StoreContext.Provider')

  const { actions } = store.getState()

  useEffect(() => {
    // Set readOnly first
    if (props.readOnly !== undefined) {
      actions.setReadOnly(props.readOnly)
    }

    // Handle files and content together
    if (props.files && props.files.length > 0) {
      actions.setFiles(props.files)
      // If content is provided with files, set current file with content
      if (props.content !== undefined && props.files[0]) {
        actions.setCurrentFile(props.files[0], props.content)
      }
    } else if (props.content !== undefined) {
      // If only content is provided without files, create a default file
      const defaultFile = { name: 'content.mdx', path: 'content.mdx' }
      actions.setFiles([defaultFile])
      actions.setCurrentFile(defaultFile, props.content)
      // Also set content directly for immediate access
      actions.setContent(props.content)
    }

    // Set mode after content and files are configured
    if (props.mode !== undefined) {
      actions.setMode(props.mode)
    } else if (props.readOnly) {
      actions.setMode('preview')
    } else if (props.content && !props.files) {
      // If only content is provided (no files), default to preview
      actions.setMode('preview')
    } else if (props.files && props.files.length > 0) {
      // If files are provided, default to browse mode
      actions.setMode('browse')
    } else {
      // Default fallback
      actions.setMode('browse')
    }
  }, [props.content, props.mode, props.files, props.readOnly, actions])

  return null
}

function LegacyMdxBrowser(props: MdxBrowserLegacyProps) {
  const storeRef = useRef<AppStore | null>(null)
  if (!storeRef.current) {
    storeRef.current = createAppStore()

    // Initialize store with props synchronously
    const store = storeRef.current
    const { actions } = store.getState()

    // Set readOnly first
    if (props.readOnly !== undefined) {
      actions.setReadOnly(props.readOnly)
    }

    // Handle files and content
    if (props.files && props.files.length > 0) {
      actions.setFiles(props.files)
      if (props.content !== undefined && props.files[0]) {
        actions.setCurrentFile(props.files[0], props.content)
      }
    } else if (props.content !== undefined) {
      const defaultFile = { name: 'content.mdx', path: 'content.mdx' }
      actions.setFiles([defaultFile])
      actions.setCurrentFile(defaultFile, props.content)
      actions.setContent(props.content)
    }

    // Set mode
    if (props.mode !== undefined) {
      actions.setMode(props.mode)
    } else if (props.readOnly) {
      actions.setMode('preview')
    } else if (props.content && !props.files) {
      actions.setMode('preview')
    } else if (props.files && props.files.length > 0) {
      actions.setMode('browse')
    } else {
      actions.setMode('browse')
    }
  }
  const store = storeRef.current

  const apiClient = new StaticApiClient({
    files: props.files || [{ name: 'content.mdx', path: 'content.mdx' }],
    content: props.content || '',
    onSave: props.onSave,
  })

  return (
    <StoreContext.Provider value={store}>
      <StoreUpdater {...props} />
      <App
        apiClient={apiClient}
        onContentChange={props.onContentChange}
        onNavigate={props.onNavigate}
        onFileSelect={props.onFileSelect}
        onSave={props.onSave}
        readOnly={props.readOnly}
        mode={props.mode}
      />
    </StoreContext.Provider>
  )
}

export function MdxBrowser(props: MdxBrowserProps) {
  if (isLegacyProps(props)) {
    return <LegacyMdxBrowser {...props} />
  }

  // New API client-based approach
  const client = props.apiClient || new BrowserApiClient()

  return <App apiClient={client} onContentChange={props.onContentChange} onNavigate={props.onNavigate} readOnly={props.readOnly} mode={props.mode} />
}

// Legacy render function for backward compatibility
export function render(container: HTMLElement, props: MdxBrowserLegacyProps = {}) {
  const root = createRoot(container)

  const component = <LegacyMdxBrowser {...props} />

  root.render(component)

  return {
    update: (newProps: MdxBrowserLegacyProps) => {
      const updatedComponent = <LegacyMdxBrowser {...newProps} />
      root.render(updatedComponent)
    },
    destroy: () => {
      root.unmount()
    },
  }
}
// Export types and adapters for library consumers
export type { ApiClient } from './adapters'
export { BrowserApiClient, StaticApiClient } from './adapters'
export type { FileEntry } from './store'
export { useBrowserStore } from './store'
