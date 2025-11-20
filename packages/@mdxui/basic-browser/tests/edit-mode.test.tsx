import { act, render } from '@testing-library/react'
import { createRef } from 'react'
import { describe, expect, it, type Mock, vi } from 'vitest'
import { EditMode, type EditModeRef } from '../src/components/edit-mode'
import { StoreContext } from '../src/index'
import { createAppStore } from '../src/store'
import { editor as monacoEditor } from '../test-mocks/monaco-editor'
import React from 'react'

const mockedEditorInstance = (monacoEditor.create as Mock)()

describe('EditMode Component', () => {
  it('should create a monaco editor instance', () => {
    const store = createAppStore()
    store.getState().actions.setContent('Initial content')

    render(
      <StoreContext.Provider value={store}>
        <EditMode />
      </StoreContext.Provider>,
    )

    expect(monacoEditor.create).toHaveBeenCalledWith(
      expect.any(HTMLElement),
      expect.objectContaining({
        value: 'Initial content',
        language: 'markdown',
        readOnly: false,
      }),
    )
  })

  it('should call setContent when saveContent is called via ref', () => {
    const store = createAppStore()
    const setContentSpy = vi.spyOn(store.getState().actions, 'setContent')
    const ref = createRef<EditModeRef>()
    const updatedContent = 'Updated from test'
    mockedEditorInstance.getValue.mockReturnValue(updatedContent)

    render(
      <StoreContext.Provider value={store}>
        <EditMode ref={ref} />
      </StoreContext.Provider>,
    )

    act(() => {
      ref.current?.saveContent()
    })

    expect(setContentSpy).toHaveBeenCalledWith(updatedContent)
  })

  it('should create editor with readOnly true if specified in store', () => {
    const store = createAppStore()
    store.getState().actions.setReadOnly(true)

    render(
      <StoreContext.Provider value={store}>
        <EditMode />
      </StoreContext.Provider>,
    )

    expect(monacoEditor.create).toHaveBeenCalledWith(
      expect.any(HTMLElement),
      expect.objectContaining({
        readOnly: true,
      }),
    )
  })
})
