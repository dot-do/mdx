import { serve } from 'bun'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Mock functions will be defined inside the vi.mock calls
let mockReaddir: any
let mockMkdir: any
let mockBunFile: any
let mockBunWrite: any

vi.mock('node:fs/promises', () => {
  const mockReaddir = vi.fn()
  const mockMkdir = vi.fn()

  return {
    default: {
      readdir: mockReaddir,
      mkdir: mockMkdir,
    },
    readdir: mockReaddir,
    mkdir: mockMkdir,
  }
})

vi.mock('node:path', () => ({
  default: {
    join: (...args: string[]) => args.join('/'),
    basename: (path: string) => path.split('/').pop() || '',
    resolve: (...args: string[]) => args.join('/'),
    dirname: (path: string) => path.split('/').slice(0, -1).join('/'),
  },
  join: (...args: string[]) => args.join('/'),
  basename: (path: string) => path.split('/').pop() || '',
  resolve: (...args: string[]) => args.join('/'),
  dirname: (path: string) => path.split('/').slice(0, -1).join('/'),
}))

vi.mock('bun', () => {
  const mockBunFile = vi.fn()
  const mockBunWrite = vi.fn()

  return {
    serve: vi.fn((options) => options),
    file: mockBunFile,
    write: mockBunWrite,
  }
})

const getFetchHandler = async () => {
  vi.resetModules()
  await import('../src/backend')
  const lastCall = (serve as any).mock.lastCall
  return lastCall[0].fetch
}

describe('backend.ts API', () => {
  beforeEach(async () => {
    vi.clearAllMocks()

    // Get fresh references to the mocked functions
    const { readdir, mkdir } = await import('node:fs/promises')
    const bunModule = await import('bun')

    mockReaddir = readdir as any
    mockMkdir = mkdir as any
    mockBunFile = bunModule.file as any
    mockBunWrite = bunModule.write as any

    // Setup default mock behaviors - readdir should return Dirent objects
    const createDirent = (name: string, isFile: boolean) => ({
      name,
      isFile: () => isFile,
      isDirectory: () => !isFile,
    })

    mockReaddir.mockResolvedValue([createDirent('sample.mdx', true), createDirent('example2.mdx', true)])

    // Mock mkdir to succeed (never throws)
    mockMkdir.mockResolvedValue(undefined)

    // Mock Bun.file to return an object with text() method that never throws
    const mockFileObj = {
      text: vi.fn().mockResolvedValue('# Sample MDX\n\nThis is a test file.'),
    }
    mockBunFile.mockReturnValue(mockFileObj)

    // Mock Bun.write to succeed (never throws)
    mockBunWrite.mockResolvedValue(undefined)

    // Also mock the global Bun object since backend.ts uses Bun.file() and Bun.write()
    global.Bun = {
      file: mockBunFile,
      write: mockBunWrite,
      serve: vi.fn((options) => options),
    } as any
  })

  afterEach(() => {
    // Clean up global mocks
    delete (global as any).Bun
  })

  describe('/api/ping', () => {
    it('should return ping response', async () => {
      const fetchHandler = await getFetchHandler()

      const req = new Request('http://localhost:3000/api/ping')
      const res = await fetchHandler(req)
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data).toEqual({ ok: true })
    })
  })

  describe('/api/files', () => {
    it('should return a list of mdx files', async () => {
      const fetchHandler = await getFetchHandler()

      const req = new Request('http://localhost:3000/api/files')
      const res = await fetchHandler(req)
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data).toEqual([
        { path: 'sample.mdx', name: 'sample.mdx' },
        { path: 'example2.mdx', name: 'example2.mdx' },
      ])
      expect(mockReaddir).toHaveBeenCalled()
    })

    it('should handle recursive directory traversal', async () => {
      const fetchHandler = await getFetchHandler()

      // Mock nested directory structure
      const createDirent = (name: string, isFile: boolean) => ({
        name,
        isFile: () => isFile,
        isDirectory: () => !isFile,
      })

      mockReaddir
        .mockResolvedValueOnce([
          createDirent('file1.mdx', true),
          createDirent('subdir', false), // Directory
          createDirent('file2.txt', true), // Non-MDX file
        ])
        .mockResolvedValueOnce([createDirent('nested.mdx', true)])

      const req = new Request('http://localhost:3000/api/files')
      const res = await fetchHandler(req)
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data).toEqual([
        { path: 'file1.mdx', name: 'file1.mdx' },
        { path: 'subdir/nested.mdx', name: 'nested.mdx' },
      ])
      expect(mockReaddir).toHaveBeenCalledTimes(2)
    })

    it('should handle readdir errors gracefully', async () => {
      // Create a separate test that sets up the error before importing backend
      const { readdir } = await import('node:fs/promises')
      ;(readdir as any).mockRejectedValueOnce(new Error('Permission denied'))

      // Import fresh backend with the error mock in place
      await vi.resetModules()
      const _backendModule = await import('../src/backend')
      const lastCall = (serve as any).mock.lastCall
      const fetchHandler = lastCall[0].fetch

      const req = new Request('http://localhost:3000/api/files')

      // The error should bubble up and cause the endpoint to fail
      try {
        const res = await fetchHandler(req)
        // If we get here, the request succeeded despite the error
        expect(res.status).toBeGreaterThanOrEqual(400)
      } catch (error) {
        // Error bubbled up - this is actually the expected behavior
        expect(error).toBeInstanceOf(Error)
        expect((error as Error).message).toBe('Permission denied')
      }
    })
  })

  describe('/api/file', () => {
    it('should return file content', async () => {
      const fetchHandler = await getFetchHandler()
      const filePath = 'sample.mdx'
      const fileContent = '# Sample MDX\n\nThis is a test file.'

      const req = new Request(`http://localhost:3000/api/file?path=${filePath}`)
      const res = await fetchHandler(req)
      const text = await res.text()

      expect(res.status).toBe(200)
      expect(text).toBe(fileContent)
      expect(mockBunFile).toHaveBeenCalledWith(expect.stringContaining(`examples/${filePath}`))
    })

    it('should return 400 for missing path parameter', async () => {
      const fetchHandler = await getFetchHandler()

      const req = new Request('http://localhost:3000/api/file')
      const res = await fetchHandler(req)

      expect(res.status).toBe(400)
      const errorText = await res.text()
      expect(errorText).toBe('Bad Request')
    })

    it('should return 404 for non-existent file', async () => {
      const fetchHandler = await getFetchHandler()

      // Mock Bun.file to throw an error
      const mockFileObj = {
        text: vi.fn().mockRejectedValue(new Error('File not found')),
      }
      mockBunFile.mockReturnValue(mockFileObj)

      const req = new Request('http://localhost:3000/api/file?path=nonexistent.mdx')
      const res = await fetchHandler(req)

      expect(res.status).toBe(404)
      const errorText = await res.text()
      expect(errorText).toBe('Not Found')
    })

    it('should return null for empty file path', async () => {
      const fetchHandler = await getFetchHandler()

      const req = new Request('http://localhost:3000/api/file?path=')
      const res = await fetchHandler(req)

      expect(res.status).toBe(400)
      const errorText = await res.text()
      expect(errorText).toBe('Bad Request')
    })
  })

  describe('/api/save', () => {
    it('should save file content', async () => {
      const fetchHandler = await getFetchHandler()
      const filePath = 'new-file.mdx'
      const markdownContent = '# New File\n\nThis is new content.'

      const req = new Request('http://localhost:3000/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath, markdownContent }),
      })

      const res = await fetchHandler(req)
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data).toEqual({ ok: true, message: 'File saved' })
      expect(mockBunWrite).toHaveBeenCalledWith(expect.stringContaining(`examples/${filePath}`), markdownContent)
    })

    it('should return 400 for missing markdownContent', async () => {
      const fetchHandler = await getFetchHandler()

      const req = new Request('http://localhost:3000/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath: 'test.mdx' }), // Missing markdownContent
      })

      const res = await fetchHandler(req)

      expect(res.status).toBe(400)
      const errorText = await res.text()
      expect(errorText).toBe('Bad Request: Missing content or filePath')
    })

    it('should return 400 for missing filePath', async () => {
      const fetchHandler = await getFetchHandler()

      const req = new Request('http://localhost:3000/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markdownContent: '# Test' }), // Missing filePath
      })

      const res = await fetchHandler(req)

      expect(res.status).toBe(400)
      const errorText = await res.text()
      expect(errorText).toBe('Bad Request: Missing content or filePath')
    })

    it('should return 500 for save errors', async () => {
      const fetchHandler = await getFetchHandler()

      // Mock Bun.write to throw an error
      mockBunWrite.mockRejectedValue(new Error('Disk full'))

      const req = new Request('http://localhost:3000/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath: 'test.mdx', markdownContent: '# Test' }),
      })

      const res = await fetchHandler(req)

      expect(res.status).toBe(500)
      const errorText = await res.text()
      expect(errorText).toBe('Error saving file')
    })

    it('should return 500 for invalid JSON', async () => {
      const fetchHandler = await getFetchHandler()

      const req = new Request('http://localhost:3000/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid json{',
      })

      const res = await fetchHandler(req)

      expect(res.status).toBe(500)
      const errorText = await res.text()
      expect(errorText).toBe('Error saving file')
    })

    it('should handle invalid request data types', async () => {
      const fetchHandler = await getFetchHandler()

      const req = new Request('http://localhost:3000/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath: 'test.mdx', markdownContent: null }), // Invalid type
      })

      const res = await fetchHandler(req)

      expect(res.status).toBe(400)
      const errorText = await res.text()
      expect(errorText).toBe('Bad Request: Missing content or filePath')
    })
  })

  describe('unknown routes', () => {
    it('should return 404 for unknown routes', async () => {
      const fetchHandler = await getFetchHandler()

      const req = new Request('http://localhost:3000/unknown/route')
      const res = await fetchHandler(req)

      expect(res.status).toBe(404)
      const errorText = await res.text()
      expect(errorText).toBe('Not Found')
    })
  })

  describe('HTTP method handling', () => {
    it('should handle POST to /api/files (returns files list)', async () => {
      const fetchHandler = await getFetchHandler()

      const req = new Request('http://localhost:3000/api/files', { method: 'POST' })
      const res = await fetchHandler(req)

      expect(res.status).toBe(200)
      const data = await res.json()
      expect(Array.isArray(data)).toBe(true)
    })

    it('should return 400 for POST to /api/file (missing path)', async () => {
      const fetchHandler = await getFetchHandler()

      const req = new Request('http://localhost:3000/api/file', { method: 'POST' })
      const res = await fetchHandler(req)

      expect(res.status).toBe(400)
      const errorText = await res.text()
      expect(errorText).toBe('Bad Request')
    })

    it('should return 404 for GET to /api/save', async () => {
      const fetchHandler = await getFetchHandler()

      const req = new Request('http://localhost:3000/api/save', { method: 'GET' })
      const res = await fetchHandler(req)

      expect(res.status).toBe(404)
      const errorText = await res.text()
      expect(errorText).toBe('Not Found')
    })
  })
})
