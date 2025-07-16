import { describe, expect, it, vi } from 'vitest'
import { createAppStore } from '../src/store'

describe('Zustand Store', () => {
  it('should have the correct initial state', () => {
    const store = createAppStore()
    const state = store.getState()
    expect(state.mode).toBe('browse')
    expect(state.files).toEqual([])
    expect(state.readOnly).toBe(false)
    expect(state.isSaving).toBe(false)
  })

  it('setMode action should update the mode', () => {
    const store = createAppStore()
    store.getState().actions.setMode('edit')
    expect(store.getState().mode).toBe('edit')
  })

  it('selectFile action should update the currentFile and mode', () => {
    const store = createAppStore()
    const file = { name: 'test.mdx', path: 'test.mdx' }
    store.getState().actions.selectFile(file)
    expect(store.getState().currentFile).toBe(file)
    expect(store.getState().mode).toBe('edit')
  })

  it('setReadOnly action should update readOnly state', () => {
    const store = createAppStore()
    store.getState().actions.setReadOnly(true)
    expect(store.getState().readOnly).toBe(true)
  })

  it('save action should manage isSaving and saveError states', async () => {
    const store = createAppStore()
    const onSaveSuccess = vi.fn().mockResolvedValue(undefined)
    const onSaveFailure = vi.fn().mockRejectedValue(new Error('Save failed'))

    // Test success case
    await store.getState().actions.save(onSaveSuccess)
    expect(onSaveSuccess).toHaveBeenCalled()
    expect(store.getState().isSaving).toBe(false)
    expect(store.getState().saveError).toBeUndefined()

    // Test failure case
    await store.getState().actions.save(onSaveFailure)
    expect(onSaveFailure).toHaveBeenCalled()
    expect(store.getState().isSaving).toBe(false)
    expect(store.getState().saveError).toBe('Save failed')
  })
})
