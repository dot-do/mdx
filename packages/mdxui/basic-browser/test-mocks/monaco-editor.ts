import { vi } from 'vitest'

// Store for callbacks to simulate content changes
const contentChangeCallbacks: ((e: any) => void)[] = []

// Mock model object
const mockModel = {
  getValue: vi.fn(() => 'mocked value'),
  setValue: vi.fn(),
  onDidChangeModelContent: vi.fn((callback) => {
    contentChangeCallbacks.push(callback)
    return {
      dispose: vi.fn(() => {
        const index = contentChangeCallbacks.indexOf(callback)
        if (index > -1) {
          contentChangeCallbacks.splice(index, 1)
        }
      }),
    }
  }),
}

// Mock editor instance that will be returned by editor.create()
export const mockedEditorInstance = {
  getValue: vi.fn(() => 'mocked value'),
  setValue: vi.fn(),
  dispose: vi.fn(),
  getModel: vi.fn(() => mockModel),
  updateOptions: vi.fn(),
  onDidChangeModelContent: vi.fn((callback) => {
    contentChangeCallbacks.push(callback)
    return {
      dispose: vi.fn(() => {
        const index = contentChangeCallbacks.indexOf(callback)
        if (index > -1) {
          contentChangeCallbacks.splice(index, 1)
        }
      }),
    }
  }),
  getModels: vi.fn(() => []),
  focus: vi.fn(),
  layout: vi.fn(),
  // Helper method to simulate content changes
  simulateContentChange: (newValue: string) => {
    mockedEditorInstance.getValue.mockReturnValue(newValue)
    mockModel.getValue.mockReturnValue(newValue)
    contentChangeCallbacks.forEach((callback) => callback({}))
  },
}

// Mock editor namespace
export const editor = {
  create: vi.fn(() => mockedEditorInstance),
  getModels: vi.fn(() => []),
  createModel: vi.fn(),
  setTheme: vi.fn(),
  setModelLanguage: vi.fn(),
}

// Mock languages namespace
export const languages = {
  register: vi.fn(),
  setMonarchTokensProvider: vi.fn(),
  setLanguageConfiguration: vi.fn(),
  registerCompletionItemProvider: vi.fn(),
}

// Default export to match monaco-editor module
export default {
  editor,
  languages,
}
