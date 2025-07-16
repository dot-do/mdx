import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock the global Bun object
;(global as any).Bun = {
  env: {
    NODE_ENV: 'test',
  },
  serve: vi.fn(),
}

// Mock fetch for API calls
;(global as any).fetch = vi.fn(async (url: string) => {
  if (url.includes('/api/files')) {
    return {
      ok: true,
      json: async () => [
        { path: 'example.mdx', name: 'example.mdx' },
        { path: 'test.mdx', name: 'test.mdx' },
      ],
    }
  }

  if (url.includes('/api/file')) {
    return {
      ok: true,
      text: async () => '# Test Content\n\nThis is test content.',
    }
  }

  return { ok: false, status: 404 }
})
