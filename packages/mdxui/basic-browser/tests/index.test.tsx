import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MdxBrowser, render as renderMdxBrowser } from '../src'
import * as fixtures from './fixtures'
import { mockedEditorInstance } from '../test-mocks/monaco-editor'
import type { FileEntry } from '../src/store'

vi.mock('monaco-editor', () => import('../test-mocks/monaco-editor'))

describe('MdxBrowser', () => {
  let rootElement: HTMLElement

  beforeEach(() => {
    rootElement = document.createElement('div')
    rootElement.id = 'root'
    document.body.appendChild(rootElement)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    document.body.innerHTML = ''
  })

  it('should render the component with initial props', async () => {
    render(<MdxBrowser content={fixtures.simpleMarkdown} mode='preview' />)
    await waitFor(() => {
      expect(screen.getByText('Hello, world!')).toBeTruthy()
    })
  })

  it('should call onNavigate when a link is clicked in preview mode', async () => {
    const onNavigate = vi.fn()
    render(<MdxBrowser content='[Click me](https://example.com)' mode='preview' onNavigate={onNavigate} />)

    const link = await screen.findByText('Click me')
    act(() => {
      fireEvent.click(link)
    })

    await waitFor(() => {
      expect(onNavigate).toHaveBeenCalledWith('https://example.com')
    })
  })

  it('should save content when switching away from edit mode', async () => {
    const onSave = vi.fn()
    render(<MdxBrowser content='Initial content' mode='edit' onSave={onSave} />)

    const previewButton = screen.getByRole('button', { name: /Preview/i })
    fireEvent.click(previewButton)

    await waitFor(() => {
      expect(onSave).toHaveBeenCalled()
    })
  })

  it('should disable navigation buttons while saving', async () => {
    let resolveSave: (value: unknown) => void
    const savePromise = new Promise((resolve) => {
      resolveSave = resolve
    })
    const onSave = vi.fn().mockImplementation(() => savePromise)

    render(<MdxBrowser content='Initial content' mode='edit' onSave={onSave} />)

    const previewButton = screen.getByRole('button', { name: /Preview/i })
    fireEvent.click(previewButton)

    await waitFor(() => {
      const buttons = screen.getAllByRole('button')
      buttons.forEach((btn) => {
        expect(btn.hasAttribute('disabled')).toBe(true)
      })
    })

    // Complete the save
    await act(async () => {
      resolveSave(undefined)
      await savePromise
    })

    // Buttons should be enabled again
    await waitFor(() => {
      const buttons = screen.getAllByRole('button')
      buttons.forEach((btn) => {
        expect(btn.hasAttribute('disabled')).toBe(false)
      })
    })
  })

  it('should display an error if onSave throws', async () => {
    const onSave = vi.fn().mockRejectedValue(new Error('Failed to save'))
    render(<MdxBrowser content='Initial content' mode='edit' onSave={onSave} />)

    const previewButton = screen.getByRole('button', { name: /Preview/i })
    fireEvent.click(previewButton)

    await waitFor(() => {
      expect(screen.getByText('Failed to save')).toBeTruthy()
    })
  })

  it('should call onFileSelect when a file is clicked in browse mode', async () => {
    const onFileSelect = vi.fn()
    const files: FileEntry[] = [{ name: 'test.mdx', path: 'test.mdx' }]

    render(<MdxBrowser files={files} onFileSelect={onFileSelect} mode='browse' />)

    const fileLink = screen.getAllByText('test.mdx')[0] as HTMLElement
    fireEvent.click(fileLink)

    await waitFor(() => {
      expect(onFileSelect).toHaveBeenCalledWith(files[0])
    })
  })

  it('should call onContentChange when editor content changes', async () => {
    const onContentChange = vi.fn()
    render(<MdxBrowser content='Initial content' mode='edit' onContentChange={onContentChange} />)

    act(() => {
      mockedEditorInstance.simulateContentChange('new content')
    })

    await waitFor(() => {
      expect(onContentChange).toHaveBeenCalledWith('new content')
    })
  })

  it('should switch to preview mode if readOnly is set while in edit mode', async () => {
    const { rerender } = render(<MdxBrowser content='Some content' mode='edit' readOnly={false} />)

    const editButton = screen.getByRole('button', { name: /Edit/i })
    expect(editButton?.className).toContain('border-gray-900')

    rerender(<MdxBrowser content='Some content' mode='edit' readOnly={true} />)

    await waitFor(() => {
      const previewButton = screen.getByRole('button', { name: /Preview/i })
      expect(previewButton?.className).toContain('border-gray-900')
      expect(screen.queryByRole('button', { name: /Edit/i })).toBeNull()
    })
  })

  it('should hide the edit tab when readOnly is true', async () => {
    render(<MdxBrowser content='test' readOnly={true} />)
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /Edit/i })).toBeNull()
    })
  })

  // Tests for the `render` function
  it('should render the component into the specified container', async () => {
    act(() => {
      renderMdxBrowser(rootElement, {
        content: fixtures.simpleMarkdown,
        mode: 'preview',
      })
    })

    await waitFor(() => {
      expect(rootElement.innerHTML).toContain('Hello, world!')
    })
  })

  it('should return an update function that updates the component', async () => {
    let component: ReturnType<typeof renderMdxBrowser> | undefined
    act(() => {
      component = renderMdxBrowser(rootElement, {
        content: fixtures.simpleMarkdown,
        mode: 'preview',
      })
    })

    await waitFor(() => {
      expect(rootElement.innerHTML).toContain('Hello, world!')
    })

    act(() => {
      component?.update({ content: '# New Content' })
    })

    await waitFor(() => {
      expect(rootElement.innerHTML).not.toContain('Hello, world!')
      expect(rootElement.innerHTML).toContain('New Content')
    })
  })

  it('should return a destroy function that unmounts the component', async () => {
    let component: ReturnType<typeof renderMdxBrowser> | undefined
    act(() => {
      component = renderMdxBrowser(rootElement, {
        content: fixtures.simpleMarkdown,
      })
    })

    await waitFor(() => {
      expect(rootElement.innerHTML).not.toBe('')
    })

    act(() => {
      component?.destroy()
    })

    await waitFor(() => {
      expect(rootElement.innerHTML).toBe('')
    })
  })
})
