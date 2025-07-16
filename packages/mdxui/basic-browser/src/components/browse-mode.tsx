import { useContext, useEffect } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { browserStoreSelector, type FileEntry, useAppStore } from '../store'
import { StoreContext } from '../index'

interface BrowseModeProps {
  onFileSelect?: (file: FileEntry) => void
}

export function BrowseMode({ onFileSelect }: BrowseModeProps) {
  const contextStore = useContext(StoreContext)
  const globalStore = useAppStore(useShallow(browserStoreSelector))

  // Use context store if available, otherwise use global store
  const { actions, files, error } = contextStore
    ? {
        actions: contextStore.getState().actions,
        files: contextStore.getState().files,
        error: contextStore.getState().error,
      }
    : globalStore

  useEffect(() => {
    // This now relies on the parent passing `files` prop
  }, [])

  const handleClick = async (file: FileEntry) => {
    actions.selectFile(file)
    // Call the external callback if provided
    if (onFileSelect) {
      onFileSelect(file)
    }
  }

  if (error) {
    return (
      <div className='flex items-center justify-center h-full'>
        <div className='text-center text-red-500'>
          <p>An error occurred:</p>
          <p className='text-sm'>{error}</p>
        </div>
      </div>
    )
  }

  if (!files || files.length === 0) {
    return (
      <div className='flex items-center justify-center h-full'>
        <div className='text-center'>
          <p className='text-gray-500 mb-2'>No MDX files found</p>
          <p className='text-sm text-gray-400'>Add .mdx files to the examples/ directory</p>
        </div>
      </div>
    )
  }

  return (
    <div className='h-full overflow-auto'>
      <div className='p-6 max-w-screen-lg mx-auto'>
        <div className='space-y-1.5'>
          {files.map((file) => (
            <button
              key={file.path}
              type='button'
              onClick={() => handleClick(file)}
              className='w-full text-left px-3 py-2 rounded hover:bg-gray-50 transition-colors group cursor-pointer border border-gray-100'
            >
              <div className='font-medium text-gray-900 group-hover:text-blue-600'>{file.name}</div>
              <div className='text-sm text-gray-500 mt-0.5'>{file.path}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
