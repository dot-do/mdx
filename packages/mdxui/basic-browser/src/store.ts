import { create, type StoreApi } from 'zustand'
import { useShallow } from 'zustand/react/shallow'

export interface FileEntry {
  name: string
  path: string
}

export type Mode = 'browse' | 'preview' | 'edit'

export interface AppState {
  files: FileEntry[]
  currentFile: FileEntry | null
  content: string
  language: string
  theme: string
  isSaving: boolean
  saveError?: string
  readOnly: boolean
  error?: string
  mode: Mode
  actions: {
    setFiles: (files: FileEntry[]) => void
    setCurrentFile: (file: FileEntry, content: string) => void
    setContent: (content: string) => void
    setLanguage: (language: string) => void
    setTheme: (theme: string) => void
    setError: (error?: string) => void
    setMode: (mode: Mode) => void
    selectFile: (file: FileEntry) => void
    setReadOnly: (readOnly: boolean) => void
    save: (onSave: (content: string, file: FileEntry | null) => Promise<void>) => Promise<void>
  }
}

export type AppStore = StoreApi<AppState>

export const createAppStore = () =>
  create<AppState>((set, get) => ({
    mode: 'browse',
    files: [],
    currentFile: null,
    content: '',
    language: 'markdown',
    theme: 'vs-light',
    isSaving: false,
    saveError: undefined,
    readOnly: false,
    error: undefined,
    actions: {
      setMode: (mode: Mode) => set({ mode }),
      setFiles: (files: FileEntry[]) => set({ files }),
      setCurrentFile: (file: FileEntry, content: string) => set({ currentFile: file, content, error: undefined }),
      setContent: (content: string) => set({ content }),
      setLanguage: (language: string) => set({ language }),
      setTheme: (theme: string) => set({ theme }),
      setError: (error?: string) => set({ error }),
      selectFile: (file: FileEntry) => set({ currentFile: file, mode: 'edit' }),
      setReadOnly: (readOnly: boolean) => set({ readOnly }),
      save: async (onSave) => {
        const { content, currentFile } = get()
        set({ isSaving: true, saveError: undefined })
        try {
          await onSave(content, currentFile)
        } catch (error) {
          set({
            saveError: error instanceof Error ? error.message : 'Save failed',
          })
        } finally {
          set({ isSaving: false })
        }
      },
    },
  }))

export const useAppStore = createAppStore()

export const browserStoreSelector = (s: AppState) => ({
  mode: s.mode,
  files: s.files,
  currentFile: s.currentFile,
  content: s.content,
  language: s.language,
  theme: s.theme,
  isSaving: s.isSaving,
  saveError: s.saveError,
  readOnly: s.readOnly,
  error: s.error,
  actions: s.actions,
})

export const useBrowserStore = () => useAppStore(useShallow(browserStoreSelector))
