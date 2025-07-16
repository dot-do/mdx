import { vi } from 'vitest'

// Mock Bun.serve function
export const serve = vi.fn((options) => {
  console.log('Mocked Bun.serve called with:', options)
  return options
})

// Mock Bun.file function
export const file = vi.fn((path: string) => ({
  text: () => Promise.resolve(`mocked content for ${path}`),
}))

// Mock Bun.write function
export const write = vi.fn((path: string, content: string) => {
  console.log('Mocked Bun.write called:', path, content)
  return Promise.resolve()
})

 
