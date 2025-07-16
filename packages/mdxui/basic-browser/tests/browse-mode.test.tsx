import { fireEvent, render, screen } from '@testing-library/react'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { BrowseMode } from '../src/components/browse-mode'
import { StoreContext } from '../src/index'
import { createAppStore, type FileEntry } from '../src/store'

describe('BrowseMode Component', () => {
  it('should display a list of files', () => {
    const store = createAppStore()
    const files: FileEntry[] = [
      { name: 'file1.mdx', path: 'path/to/file1.mdx' },
      { name: 'file2.mdx', path: 'path/to/file2.mdx' },
    ]
    store.getState().actions.setFiles(files)

    render(
      <StoreContext.Provider value={store}>
        <BrowseMode />
      </StoreContext.Provider>,
    )

    expect(screen.getByText('file1.mdx')).toBeInTheDocument()
    expect(screen.getByText('file2.mdx')).toBeInTheDocument()
  })

  it('should call selectFile action when a file is clicked', () => {
    const store = createAppStore()
    const files: FileEntry[] = [{ name: 'file1.mdx', path: 'path/to/file1.mdx' }]
    store.getState().actions.setFiles(files)
    const selectFileSpy = vi.spyOn(store.getState().actions, 'selectFile')

    render(
      <StoreContext.Provider value={store}>
        <BrowseMode />
      </StoreContext.Provider>,
    )

    const fileButton = screen.getByText('file1.mdx')
    fireEvent.click(fileButton)

    expect(selectFileSpy).toHaveBeenCalledWith(files[0])
  })

  it('should display an error message if there is an error', () => {
    const store = createAppStore()
    store.getState().actions.setError('Failed to load files')

    render(
      <StoreContext.Provider value={store}>
        <BrowseMode />
      </StoreContext.Provider>,
    )

    expect(screen.getByText('An error occurred:')).toBeInTheDocument()
    expect(screen.getByText('Failed to load files')).toBeInTheDocument()
  })

  it('should display a message when no files are found', () => {
    const store = createAppStore()
    render(
      <StoreContext.Provider value={store}>
        <BrowseMode />
      </StoreContext.Provider>,
    )

    expect(screen.getByText('No MDX files found')).toBeInTheDocument()
  })
})
