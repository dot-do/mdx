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

    await waitFor(() => {
      expect(screen.getByText('Click me')).toBeTruthy()
    })

    const link = screen.getByText('Click me')
    act(() => {
      fireEvent.click(link)
    })

    await waitFor(() => {
      expect(onNavigate).toHaveBeenCalledWith('https://example.com')
    })
  })

  it('should save content when switching away from edit mode', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined)
    render(<MdxBrowser content='Initial content' mode='edit' onSave={onSave} />)

    const previewButton = screen.getByRole('button', { name: /Preview/i })
    fireEvent.click(previewButton)

    await waitFor(() => {
      expect(onSave).toHaveBeenCalled()
    })
  })

  it('should disable navigation buttons while saving', async () => {
    const onSave = vi.fn().mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)))
    render(<MdxBrowser content='Initial content' mode='edit' onSave={onSave} />)

    const previewButton = screen.getByRole('button', { name: /Preview/i })
    fireEvent.click(previewButton)

    await waitFor(() => {
      const buttons = screen.getAllByRole('button')
      buttons.forEach((btn) => {
        expect(btn.hasAttribute('disabled')).toBe(true)
      })
    })

    // Wait for save to complete
    await waitFor(() => {
      expect(onSave).toHaveBeenCalled()
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
    render(<MdxBrowser files={files} mode='browse' onFileSelect={onFileSelect} />)

    await waitFor(() => {
      expect(screen.getAllByText('test.mdx')).toBeTruthy()
    })

    const fileLink = screen.getAllByText('test.mdx')[0]
    fireEvent.click(fileLink)

    await waitFor(() => {
      expect(onFileSelect).toHaveBeenCalledWith(files[0])
    })
  })

  it('should call onContentChange when editor content changes', async () => {
    const onContentChange = vi.fn()
    render(<MdxBrowser content='Initial content' mode='edit' onContentChange={onContentChange} />)

    // Wait for editor to be ready
    await waitFor(() => {
      expect(mockedEditorInstance.getValue).toBeTruthy()
    })

    // Simulate content change using the mock helper
    act(() => {
      mockedEditorInstance.simulateContentChange('new content')
    })

    await waitFor(() => {
      expect(onContentChange).toHaveBeenCalledWith('new content')
    })
  })

  it('should switch to preview mode if readOnly is set while in edit mode', async () => {
    const { rerender } = render(<MdxBrowser content='Some content' mode='edit' />)

    // Initially in edit mode
    await waitFor(() => {
      const editButton = screen.getByRole('button', { name: /Edit/i })
      expect(editButton?.className).toContain('border-gray-900')
    })

    rerender(<MdxBrowser content='Some content' mode='edit' readOnly />)

    // Should switch to preview mode
    await waitFor(() => {
      const previewButton = screen.getByRole('button', { name: /Preview/i })
      expect(previewButton?.className).toContain('border-gray-900')
    })
  })

  it('should render the component into the specified container', async () => {
    const { update } = renderMdxBrowser(rootElement, { content: fixtures.simpleMarkdown, mode: 'preview' })

    await waitFor(() => {
      expect(rootElement.innerHTML).toContain('Hello, world!')
    })

    update({ content: '# Updated content', mode: 'preview' })

    await waitFor(() => {
      expect(rootElement.innerHTML).toContain('Updated content')
    })
  })

  it('should return an update function that updates the component', async () => {
    const { update } = renderMdxBrowser(rootElement, { content: fixtures.simpleMarkdown, mode: 'preview' })

    await waitFor(() => {
      expect(rootElement.innerHTML).toContain('Hello, world!')
    })

    update({ content: '# Different content', mode: 'preview' })

    await waitFor(() => {
      expect(rootElement.innerHTML).toContain('Different content')
    })
  })
})
