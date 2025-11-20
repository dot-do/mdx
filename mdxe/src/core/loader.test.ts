/**
 * Tests for Worker Loader wrapper
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { WorkerLoader, createCodeWorker, createSecureWorkerConfig } from './loader.js'
import type { WorkerLoaderBinding, WorkerInstance } from './loader.js'

describe('WorkerLoader', () => {
  it('should detect when loader is not available', () => {
    const loader = new WorkerLoader()
    expect(loader.isAvailable()).toBe(false)
  })

  it('should detect when loader is available', () => {
    const mockBinding: WorkerLoaderBinding = {
      get: async () => ({} as WorkerInstance),
    }

    const loader = new WorkerLoader(mockBinding)
    expect(loader.isAvailable()).toBe(true)
  })

  it('should throw error when loading without binding', async () => {
    const loader = new WorkerLoader()

    await expect(
      loader.load('test-worker', {
        modules: { 'index.js': 'export default {}' },
      }),
    ).rejects.toThrow('Worker Loader not available')
  })

  it('should load a worker with configuration', async () => {
    const mockWorker: WorkerInstance = {
      fetch: async () => new Response('OK'),
    }

    const mockBinding: WorkerLoaderBinding = {
      get: async (id, configFn) => {
        const config = await configFn()
        expect(config.modules).toBeDefined()
        expect(config.modules['index.js']).toBe('export default {}')
        return mockWorker
      },
    }

    const loader = new WorkerLoader(mockBinding)

    const worker = await loader.load('test-worker', {
      modules: { 'index.js': 'export default {}' },
    })

    expect(worker).toBe(mockWorker)
  })

  it('should cache loaded workers', async () => {
    let loadCount = 0
    const mockWorker: WorkerInstance = {
      fetch: async () => new Response('OK'),
    }

    const mockBinding: WorkerLoaderBinding = {
      get: async () => {
        loadCount++
        return mockWorker
      },
    }

    const loader = new WorkerLoader(mockBinding)

    await loader.load('test-worker', {
      modules: { 'index.js': 'export default {}' },
    })

    await loader.load('test-worker', {
      modules: { 'index.js': 'export default {}' },
    })

    expect(loadCount).toBe(1) // Should only load once
  })

  it('should execute worker with fetch handler', async () => {
    const mockWorker: WorkerInstance = {
      fetch: async (request) => {
        return new Response(`Received: ${request.url}`)
      },
    }

    const mockBinding: WorkerLoaderBinding = {
      get: async () => mockWorker,
    }

    const loader = new WorkerLoader(mockBinding)
    await loader.load('test-worker', {
      modules: { 'index.js': 'export default {}' },
    })

    const response = await loader.execute('test-worker', {
      request: new Request('https://example.com/test'),
    })

    expect(response).toBeInstanceOf(Response)
    const text = await response.text()
    expect(text).toContain('https://example.com/test')
  })

  it('should execute worker with custom method', async () => {
    const mockWorker: WorkerInstance = {
      customMethod: (a: number, b: number) => a + b,
    }

    const mockBinding: WorkerLoaderBinding = {
      get: async () => mockWorker,
    }

    const loader = new WorkerLoader(mockBinding)
    await loader.load('test-worker', {
      modules: { 'index.js': 'export default {}' },
    })

    const result = await loader.execute('test-worker', {
      method: 'customMethod',
      args: [10, 20],
    })

    expect(result).toBe(30)
  })

  it('should unload workers', async () => {
    const mockWorker: WorkerInstance = {
      fetch: async () => new Response('OK'),
    }

    const mockBinding: WorkerLoaderBinding = {
      get: async () => mockWorker,
    }

    const loader = new WorkerLoader(mockBinding)
    await loader.load('test-worker', {
      modules: { 'index.js': 'export default {}' },
    })

    loader.unload('test-worker')

    await expect(loader.execute('test-worker', {})).rejects.toThrow('Worker test-worker not loaded')
  })

  it('should unload all workers', async () => {
    const mockWorker: WorkerInstance = {
      fetch: async () => new Response('OK'),
    }

    const mockBinding: WorkerLoaderBinding = {
      get: async () => mockWorker,
    }

    const loader = new WorkerLoader(mockBinding)
    await loader.load('worker-1', { modules: { 'index.js': 'export default {}' } })
    await loader.load('worker-2', { modules: { 'index.js': 'export default {}' } })

    loader.unloadAll()

    await expect(loader.execute('worker-1', {})).rejects.toThrow()
    await expect(loader.execute('worker-2', {})).rejects.toThrow()
  })
})

describe('createCodeWorker', () => {
  it('should create a worker with code', async () => {
    const mockWorker: WorkerInstance = {
      fetch: async () => new Response('OK'),
    }

    const mockBinding: WorkerLoaderBinding = {
      get: async (id, configFn) => {
        const config = await configFn()
        expect(config.modules['index.js']).toContain('console.log')
        return mockWorker
      },
    }

    const code = "console.log('Hello, World!')"
    const { loader, id } = await createCodeWorker(mockBinding, code)

    expect(loader).toBeInstanceOf(WorkerLoader)
    expect(id).toBeDefined()
    expect(typeof id).toBe('string')
  })

  it('should accept custom options', async () => {
    const mockWorker: WorkerInstance = {
      fetch: async () => new Response('OK'),
    }

    const mockBinding: WorkerLoaderBinding = {
      get: async (id, configFn) => {
        const config = await configFn()
        expect(id).toBe('custom-id')
        expect(config.mainModule).toBe('custom.js')
        expect(config.bindings?.apiKey).toBe('secret')
        return mockWorker
      },
    }

    const code = "console.log('Hello')"
    const { loader, id } = await createCodeWorker(mockBinding, code, {
      id: 'custom-id',
      mainModule: 'custom.js',
      bindings: { apiKey: 'secret' },
    })

    expect(id).toBe('custom-id')
  })
})

describe('createSecureWorkerConfig', () => {
  it('should create basic worker config', () => {
    const code = "console.log('test')"
    const config = createSecureWorkerConfig(code)

    expect(config.modules).toBeDefined()
    expect(config.modules['index.js']).toBe(code)
    expect(config.compatibilityDate).toBe('2025-01-01')
    expect(config.mainModule).toBe('index.js')
  })

  it('should apply CPU limit', () => {
    const code = "console.log('test')"
    const config = createSecureWorkerConfig(code, {
      cpuLimit: 1000,
    })

    expect(config.limits?.cpuMs).toBe(1000)
  })

  it('should apply memory limit', () => {
    const code = "console.log('test')"
    const config = createSecureWorkerConfig(code, {
      memoryLimit: 128,
    })

    expect(config.limits?.memoryMb).toBe(128)
  })

  it('should apply multiple security options', () => {
    const code = "console.log('test')"
    const config = createSecureWorkerConfig(code, {
      cpuLimit: 500,
      memoryLimit: 64,
      blockNetwork: true,
      allowedDomains: ['example.com'],
    })

    expect(config.limits?.cpuMs).toBe(500)
    expect(config.limits?.memoryMb).toBe(64)
  })
})
