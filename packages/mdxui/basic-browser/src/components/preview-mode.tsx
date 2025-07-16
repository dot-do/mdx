import type React from 'react'
import { useContext } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { browserStoreSelector, useAppStore } from '../store'
import { Markdown } from './markdown'
import { StoreContext } from '../index'

interface PreviewModeProps {
  onNavigate?: (url: string) => void
}

export const PreviewMode: React.FC<PreviewModeProps> = ({ onNavigate }) => {
  const contextStore = useContext(StoreContext)
  const globalStore = useAppStore(useShallow(browserStoreSelector))

  // Use context store if available, otherwise use global store
  const { content, currentFile } = contextStore
    ? {
        content: contextStore.getState().content,
        currentFile: contextStore.getState().currentFile,
      }
    : globalStore



  if (!content || !content.trim()) {
    return (
      <div className='flex items-center justify-center h-full'>
        <div className='text-center'>
          <p className='text-gray-500 mb-2'>No content to preview</p>
          <p className='text-sm text-gray-400'>Select a file or create content to see preview</p>
        </div>
      </div>
    )
  }

  return (
    <div className='h-full overflow-auto max-w-screen-lg mx-auto'>
      {currentFile && (
        <div className='border-b border-gray-200 px-6 py-4'>
          <p className='text-sm text-gray-600'>{currentFile.name}</p>
        </div>
      )}
      <div className='p-6'>
        <div className='prose prose-gray max-w-none'>
          <Markdown onNavigate={onNavigate}>{content}</Markdown>
        </div>
      </div>
    </div>
  )
}
