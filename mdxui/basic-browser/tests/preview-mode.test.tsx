import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { PreviewMode } from '../src/components/preview-mode'
import { StoreContext } from '../src/index'
import { createAppStore } from '../src/store'
import React from 'react'

vi.mock('../src/components/markdown', () => ({
  Markdown: ({ children }: { children: string }) => <div data-testid='markdown-mock'>{children}</div>,
}))

describe('PreviewMode Component', () => {
  it('should render the content from the store via the Markdown component', () => {
    const store = createAppStore()
    const content = '# Hello Preview'
    store.getState().actions.setContent(content)

    render(
      <StoreContext.Provider value={store}>
        <PreviewMode />
      </StoreContext.Provider>,
    )

    const markdownMock = screen.getByTestId('markdown-mock')
    expect(markdownMock).not.toBeNull()
    expect(markdownMock.textContent).toBe(content)
  })

  it('should display a message when there is no content', () => {
    const store = createAppStore()
    store.getState().actions.setContent('  ') // Whitespace only

    render(
      <StoreContext.Provider value={store}>
        <PreviewMode />
      </StoreContext.Provider>,
    )

    expect(screen.getByText('No content to preview')).toBeDefined()
  })

  it('should display the current file name if it exists', () => {
    const store = createAppStore()
    const file = { name: 'test.mdx', path: 'test.mdx' }
    store.getState().actions.setCurrentFile(file, '# Hello')

    render(
      <StoreContext.Provider value={store}>
        <PreviewMode />
      </StoreContext.Provider>,
    )

    expect(screen.getByText('test.mdx')).toBeDefined()
  })
})
