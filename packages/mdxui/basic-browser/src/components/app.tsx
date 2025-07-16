import { useCallback, useContext, useEffect, useRef } from 'react'
import { useShallow } from 'zustand/react/shallow'
import type { ApiClient } from '../adapters'
import { cn } from '../utils'
import { BrowseMode } from './browse-mode'
import { type EditModeRef, EditMode } from './edit-mode'
import { PreviewMode } from './preview-mode'
import { browserStoreSelector, type FileEntry, useAppStore } from '../store'
import { StoreContext } from '../index'
import '../styles.css'

interface AppProps {
  apiClient: ApiClient
  onContentChange?: (content: string) => void
  onNavigate?: (url: string) => void
  onFileSelect?: (file: FileEntry) => void
  onSave?: (content: string, file: FileEntry | null) => Promise<void>
  readOnly?: boolean
  mode?: 'browse' | 'preview' | 'edit'
}

export function App({ apiClient, onContentChange, onNavigate, onFileSelect, onSave, readOnly, mode }: AppProps) {
  const contextStore = useContext(StoreContext)
  const globalStore = useAppStore(useShallow(browserStoreSelector))

  // Use context store if available, otherwise use global store
  const {
    mode: currentMode,
    actions,
    isSaving,
    saveError,
    files,
    readOnly: currentReadOnly,
    currentFile,
    content,
  } = contextStore
    ? {
        mode: contextStore.getState().mode,
        actions: contextStore.getState().actions,
        isSaving: contextStore.getState().isSaving,
        saveError: contextStore.getState().saveError,
        files: contextStore.getState().files,
        readOnly: contextStore.getState().readOnly,
        currentFile: contextStore.getState().currentFile,
        content: contextStore.getState().content,
      }
    : globalStore
  const editModeRef = useRef<EditModeRef | null>(null)

  // Set readOnly and mode from props
  useEffect(() => {
    if (readOnly !== undefined && readOnly !== currentReadOnly) {
      actions.setReadOnly(readOnly)
    }

    // Handle mode changes, but override if readOnly conflicts
    if (mode !== undefined && mode !== currentMode) {
      if (readOnly && mode === 'edit') {
        // If trying to set edit mode while readOnly, force preview instead
        actions.setMode('preview')
      } else {
        actions.setMode(mode)
      }
    } else if (readOnly && readOnly !== currentReadOnly && currentMode === 'edit') {
      // If readOnly changed to true and we're in edit mode, switch to preview
      actions.setMode('preview')
    }
  }, [readOnly, mode, currentReadOnly, currentMode, actions])

  // Load files on mount (only for BrowserApiClient)
  useEffect(() => {
    // Skip file loading if using StaticApiClient (legacy mode)
    // The legacy StoreUpdater handles static content initialization
    if (apiClient.constructor.name === 'StaticApiClient') {
      return
    }

    const loadFiles = async () => {
      try {
        const fileList = await apiClient.getFiles()
        actions.setFiles(fileList)

        // Load first file if available
        if (fileList.length > 0) {
          const firstFile = fileList[0]
          if (firstFile) {
            const fileContent = await apiClient.getFile(firstFile.path)
            if (fileContent) {
              actions.setCurrentFile(firstFile, fileContent)
            }
          }
        }
      } catch (error) {
        actions.setError(`Failed to load files: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    loadFiles()
  }, [apiClient, actions])

  // Load file content when current file changes
  useEffect(() => {
    if (currentFile) {
      const loadContent = async () => {
        try {
          const fileContent = await apiClient.getFile(currentFile.path)
          if (fileContent !== null) {
            actions.setCurrentFile(currentFile, fileContent)
          }
        } catch (error) {
          console.error('Failed to load file content:', error)
          actions.setError(error instanceof Error ? error.message : 'Failed to load file')
        }
      }
      loadContent()
    }
  }, [currentFile?.path, apiClient, actions])

  const handleModeChange = async (newMode: 'browse' | 'edit' | 'preview') => {
    if (currentMode === 'edit' && newMode !== 'edit' && editModeRef.current) {
      const editorContent = editModeRef.current.saveContent()
      if (editorContent !== undefined && editorContent !== content) {
        // Use the onSave prop if provided, otherwise use the apiClient
        const saveAction = onSave ? () => onSave(editorContent, currentFile) : () => apiClient.saveFile(currentFile!.path, editorContent)

        await actions.save(saveAction)
        actions.setContent(editorContent)
      }
    }
    actions.setMode(newMode)
  }

  return (
    <div className='h-screen flex flex-col bg-white'>
      {/* Header */}

      <div className='border-b border-gray-200 p-4'>
        <div className='flex items-center justify-between'>
          <h1 className='text-xl font-semibold text-gray-900'>MDX Browser</h1>
          <div className='flex items-center gap-4'>
            {/* Navigation */}
            <nav className='flex'>
              {[
                { key: 'browse', label: 'Browse', show: files.length > 0 },
                { key: 'edit', label: 'Edit', show: !readOnly && !currentReadOnly },
                { key: 'preview', label: 'Preview', show: true },
              ]
                .filter((tab) => tab.show)
                .map((tab) => (
                  <button
                    key={tab.key}
                    type='button'
                    onClick={() => handleModeChange(tab.key as 'browse' | 'edit' | 'preview')}
                    disabled={isSaving}
                    aria-label={tab.label}
                    className={cn(
                      'px-4 py-2 text-sm font-medium transition-colors cursor-pointer',
                      currentMode === tab.key ? 'text-gray-900 border-b-2 border-gray-900' : 'text-gray-500 hover:text-gray-700',
                      isSaving && 'cursor-not-allowed opacity-50',
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
            </nav>
          </div>
        </div>

        {/* Error Display */}
        {saveError && (
          <div className='mt-2 p-2 bg-red-50 border border-red-200 rounded-md'>
            <p className='text-sm text-red-600'>{saveError}</p>
          </div>
        )}
      </div>

      {/* Content */}
      <div className='flex-1 overflow-hidden'>
        {currentMode === 'browse' && <BrowseMode onFileSelect={onFileSelect} />}
        {currentMode === 'edit' && <EditMode ref={editModeRef} onContentChange={onContentChange} />}
        {currentMode === 'preview' && <PreviewMode onNavigate={onNavigate} />}
      </div>
    </div>
  )
}
