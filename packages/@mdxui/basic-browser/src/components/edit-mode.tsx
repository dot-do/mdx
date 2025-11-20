import * as monaco from 'monaco-editor'
import { forwardRef, useCallback, useContext, useEffect, useImperativeHandle, useRef } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { browserStoreSelector, useAppStore } from '../store'
import { StoreContext } from '../index'

export interface EditModeRef {
  saveContent: () => string | undefined
}

interface EditModeProps {
  onContentChange?: (content: string) => void
}

export const EditMode = forwardRef<EditModeRef, EditModeProps>(({ onContentChange }, ref) => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)
  const contextStore = useContext(StoreContext)
  const globalStore = useAppStore(useShallow(browserStoreSelector))

  // Use context store if available, otherwise use global store
  const { content, actions, currentFile, language, theme, readOnly } = contextStore
    ? {
        content: contextStore.getState().content,
        actions: contextStore.getState().actions,
        currentFile: contextStore.getState().currentFile,
        language: contextStore.getState().language,
        theme: contextStore.getState().theme,
        readOnly: contextStore.getState().readOnly,
      }
    : globalStore

  useEffect(() => {
    if (editorRef.current) {
      monaco.editor.setTheme(theme)
    }
  }, [theme])

  useEffect(() => {
    if (editorRef.current) {
      const model = editorRef.current.getModel()
      if (model) {
        monaco.editor.setModelLanguage(model, language)
      }
    }
  }, [language])

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.updateOptions({ readOnly })
    }
  }, [readOnly])

  // Save editor content to store
  const saveContent = useCallback(() => {
    if (editorRef.current) {
      const currentContent = editorRef.current.getValue()
      actions.setContent(currentContent)
      return currentContent
    }
  }, [actions])

  // Expose saveContent through the ref
  useImperativeHandle(
    ref,
    () => ({
      saveContent,
    }),
    [saveContent],
  )

  // Create editor when container mounts
  const containerRef = useCallback(
    (container: HTMLDivElement | null) => {
      if (!container) {
        // Container is unmounting, dispose editor
        if (editorRef.current) {
          editorRef.current.dispose()
          editorRef.current = null
        }
        return
      }

      if (editorRef.current) return // Already created

      // Create the editor instance
      editorRef.current = monaco.editor.create(container, {
        value: content,
        language,
        theme,
        readOnly,
        automaticLayout: true,
        occurrencesHighlight: 'off',
        selectionHighlight: false,
        wordWrap: 'on',
        lineNumbers: 'on',
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        fontSize: 14,
        lineHeight: 1.6,
        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
      })

      // Attach content change listener
      if (onContentChange) {
        editorRef.current.onDidChangeModelContent(() => {
          onContentChange(editorRef.current?.getValue() || '')
        })
      }
    },
    [content, language, theme, readOnly, onContentChange],
  )

  return (
    <div className='h-full flex flex-col max-w-screen-lg mx-auto'>
      {currentFile && (
        <div className='border-b border-gray-200 px-6 py-4'>
          <p className='text-sm text-gray-600'>{currentFile.name}</p>
        </div>
      )}
      <div className='flex-1'>
        <div ref={containerRef} className='h-full' />
      </div>
    </div>
  )
})

EditMode.displayName = 'EditMode'
