/**
 * Global functions and objects for MDX code execution
 * Integrates with sdk.do when available, provides fallbacks otherwise
 */

// Try to dynamically import sdk.do if available
let sdkRuntime: any = null
let isSDKAvailable = false

async function initializeSDK() {
  if (sdkRuntime) return sdkRuntime

  try {
    // Try to import cli.do for authenticated access
    try {
      const cliDo = await import('cli.do')

      // Check if we're in an interactive environment
      const isInteractive = process.stdout && process.stdout.isTTY
      const isCI = process.env.CI === 'true'

      // Use device flow in CI/CD, browser flow in interactive terminals
      const deviceFlow = isCI || !isInteractive

      console.log(`[mdxe] Authenticating via cli.do (${deviceFlow ? 'device flow' : 'browser flow'})...`)

      // Create authenticated SDK instance
      sdkRuntime = await cliDo.createAuthenticatedSDK({
        baseUrl: process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.do',
        deviceFlow,
      })

      isSDKAvailable = true
      console.log('[mdxe] ✅ Authenticated SDK initialized')

      return sdkRuntime
    } catch (cliError) {
      // cli.do not available or authentication failed, try direct SDK access
      console.log('[mdxe] cli.do not available, trying direct SDK access...')

      // Fallback to unauthenticated SDK with API key
      const sdk = await import('sdk.do')

      const config = {
        baseUrl: process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.do',
        apiKey: process.env.API_KEY || process.env.NEXT_PUBLIC_API_KEY,
      }

      sdkRuntime = sdk.createSDK(config)
      isSDKAvailable = true
      console.log('[mdxe] sdk.do initialized (unauthenticated):', config.baseUrl)

      return sdkRuntime
    }
  } catch (error) {
    // SDK not available - use fallback implementations
    console.log('[mdxe] sdk.do not available, using fallback implementations')
    isSDKAvailable = false
    return createFallbackRuntime()
  }
}

/**
 * Create HTTP-based runtime that calls deployed workers
 */
function createFallbackRuntime() {
  const AI_BASE_URL = process.env.AI_BASE_URL || 'https://ai.apis.do'
  const DB_BASE_URL = process.env.DB_BASE_URL || 'https://db.apis.do'

  return {
    ai: {
      generate: async (prompt: string, options?: any) => {
        try {
          const response = await fetch(`${AI_BASE_URL}/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, ...options }),
          })
          if (!response.ok) throw new Error(`AI request failed: ${response.statusText}`)
          return await response.json()
        } catch (error) {
          console.warn('[mdxe] AI request failed, using fallback:', error)
          return { text: `[AI unavailable] Response for: ${prompt}`, model: 'fallback', cost: 0 }
        }
      },
      embed: async (text: string, options?: any) => {
        try {
          const response = await fetch(`${AI_BASE_URL}/embed`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, ...options }),
          })
          if (!response.ok) throw new Error(`Embed request failed: ${response.statusText}`)
          return await response.json()
        } catch (error) {
          console.warn('[mdxe] Embed request failed, using fallback:', error)
          return { embedding: Array(1536).fill(0), dimensions: 1536, model: 'fallback' }
        }
      },
      list: async (topic: string, options?: any) => {
        try {
          const response = await fetch(`${AI_BASE_URL}/list`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ topic, ...options }),
          })
          if (!response.ok) throw new Error(`List request failed: ${response.statusText}`)
          return await response.json()
        } catch (error) {
          console.warn('[mdxe] List request failed, using fallback:', error)
          return { items: [`Item 1 about ${topic}`, `Item 2 about ${topic}`], model: 'fallback' }
        }
      },
      code: async (description: string, options?: any) => {
        try {
          const response = await fetch(`${AI_BASE_URL}/code`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ description, ...options }),
          })
          if (!response.ok) throw new Error(`Code request failed: ${response.statusText}`)
          return await response.json()
        } catch (error) {
          console.warn('[mdxe] Code request failed, using fallback:', error)
          return { code: `// Code for: ${description}`, language: 'typescript', model: 'fallback' }
        }
      },
      analyze: async (content: string, analysis: string, options?: any) => {
        try {
          const response = await fetch(`${AI_BASE_URL}/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content, analysis, ...options }),
          })
          if (!response.ok) throw new Error(`Analyze request failed: ${response.statusText}`)
          return await response.json()
        } catch (error) {
          console.warn('[mdxe] Analyze request failed, using fallback:', error)
          return { result: `Analysis of "${content}": ${analysis}`, model: 'fallback' }
        }
      },
      models: {
        getModels: () => [],
        getModel: () => null,
      },
    },
    db: {
      get: async (ns: string, id: string, options?: any) => {
        try {
          const response = await fetch(`${DB_BASE_URL}/${ns}/${id}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          })
          if (!response.ok) throw new Error(`DB get failed: ${response.statusText}`)
          return await response.json()
        } catch (error) {
          console.warn('[mdxe] DB get failed:', error)
          throw error
        }
      },
      list: async (ns: string, options?: any) => {
        try {
          const params = new URLSearchParams(options || {})
          const response = await fetch(`${DB_BASE_URL}/${ns}?${params}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          })
          if (!response.ok) throw new Error(`DB list failed: ${response.statusText}`)
          return await response.json()
        } catch (error) {
          console.warn('[mdxe] DB list failed:', error)
          return { items: [], total: 0 }
        }
      },
      upsert: async (thing: any) => {
        try {
          const response = await fetch(`${DB_BASE_URL}/${thing.ns}/${thing.id || ''}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(thing),
          })
          if (!response.ok) throw new Error(`DB upsert failed: ${response.statusText}`)
          return await response.json()
        } catch (error) {
          console.warn('[mdxe] DB upsert failed:', error)
          throw error
        }
      },
      delete: async (ns: string, id: string) => {
        try {
          const response = await fetch(`${DB_BASE_URL}/${ns}/${id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
          })
          if (!response.ok) throw new Error(`DB delete failed: ${response.statusText}`)
          return await response.json()
        } catch (error) {
          console.warn('[mdxe] DB delete failed:', error)
          throw error
        }
      },
      search: async (query: string, embedding?: number[], options?: any) => {
        try {
          const response = await fetch(`${DB_BASE_URL}/search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, embedding, ...options }),
          })
          if (!response.ok) throw new Error(`DB search failed: ${response.statusText}`)
          return await response.json()
        } catch (error) {
          console.warn('[mdxe] DB search failed:', error)
          return { items: [], total: 0 }
        }
      },
      vectorSearch: async (embedding: number[], options?: any) => {
        try {
          const response = await fetch(`${DB_BASE_URL}/vector-search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ embedding, ...options }),
          })
          if (!response.ok) throw new Error(`DB vector search failed: ${response.statusText}`)
          return await response.json()
        } catch (error) {
          console.warn('[mdxe] DB vector search failed:', error)
          return { items: [], total: 0 }
        }
      },
      count: async (ns: string, options?: any) => {
        try {
          const params = new URLSearchParams({ ...options, count: 'true' })
          const response = await fetch(`${DB_BASE_URL}/${ns}?${params}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          })
          if (!response.ok) throw new Error(`DB count failed: ${response.statusText}`)
          const result = await response.json()
          return result.total || 0
        } catch (error) {
          console.warn('[mdxe] DB count failed:', error)
          return 0
        }
      },
      upsertRelationship: async (relationship: any) => {
        try {
          const response = await fetch(`${DB_BASE_URL}/relationships`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(relationship),
          })
          if (!response.ok) throw new Error(`DB upsert relationship failed: ${response.statusText}`)
          return await response.json()
        } catch (error) {
          console.warn('[mdxe] DB upsert relationship failed:', error)
          throw error
        }
      },
      getRelationships: async (ns: string, id: string, options?: any) => {
        try {
          const params = new URLSearchParams(options || {})
          const response = await fetch(`${DB_BASE_URL}/${ns}/${id}/relationships?${params}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          })
          if (!response.ok) throw new Error(`DB get relationships failed: ${response.statusText}`)
          return await response.json()
        } catch (error) {
          console.warn('[mdxe] DB get relationships failed:', error)
          return { items: [], total: 0 }
        }
      },
      find: async (query: any) => {
        // Legacy method - map to list
        return this.list(query.collection || 'default', query)
      },
      create: async (data: any) => {
        // Legacy method - map to upsert
        return this.upsert(data)
      },
      update: async (id: string, data: any) => {
        // Legacy method - map to upsert
        return this.upsert({ ...data, id })
      },
    },
    api: {
      get: async (url: string, options?: any) => {
        try {
          const params = options?.params ? `?${new URLSearchParams(options.params)}` : ''
          const response = await fetch(`${url}${params}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              ...options?.headers,
            },
          })
          if (!response.ok) throw new Error(`API GET failed: ${response.statusText}`)

          // Try to parse as JSON, fall back to text
          const contentType = response.headers.get('content-type')
          if (contentType?.includes('application/json')) {
            return await response.json()
          } else {
            return await response.text()
          }
        } catch (error) {
          console.warn('[mdxe] API GET failed:', error)
          throw error
        }
      },
      post: async (url: string, options?: any) => {
        try {
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...options?.headers,
            },
            body: JSON.stringify(options?.body || {}),
          })
          if (!response.ok) throw new Error(`API POST failed: ${response.statusText}`)
          return await response.json()
        } catch (error) {
          console.warn('[mdxe] API POST failed:', error)
          throw error
        }
      },
    },
    send: {
      email: async (to: string, subject: string, body: string) => ({ to, subject, body }),
      webhook: async (url: string, data: any) => ({ url, data }),
    },
    on: {
      created: (callback: Function) => callback,
      updated: (callback: Function) => callback,
      deleted: (callback: Function) => callback,
    },
  }
}

/**
 * Lazy-loaded $ runtime that initializes SDK on first access
 */
export const $ = new Proxy({} as any, {
  get: (target, prop) => {
    if (!sdkRuntime) {
      // Return a promise-based proxy for lazy initialization
      return new Proxy({}, {
        get: (_t, method) => {
          return async (...args: any[]) => {
            const runtime = await initializeSDK()
            if (runtime && runtime[prop] && runtime[prop][method]) {
              return runtime[prop][method](...args)
            }
            throw new Error(`Method ${String(prop)}.${String(method)} not available`)
          }
        },
        apply: async (_t, _thisArg, args) => {
          const runtime = await initializeSDK()
          if (runtime && runtime[prop]) {
            return runtime[prop](...args)
          }
          throw new Error(`Property ${String(prop)} not available`)
        },
      })
    }
    return sdkRuntime[prop]
  },
})

// Legacy global functions for backwards compatibility
export const on = (event: string, callback: Function) => {
  return callback
}

export const send = (event: string, data: any) => {
  return { event, data }
}

export const ai = new Proxy(
  {},
  {
    apply: async (_target, _thisArg, args) => {
      const runtime = await initializeSDK()
      if (runtime?.ai?.generate) {
        return runtime.ai.generate(args[0])
      }
      return `AI response for: ${args[0]}`
    },
    get: (_target, prop) => {
      return async (...args: any[]) => {
        const runtime = await initializeSDK()
        if (runtime?.ai?.[prop]) {
          return runtime.ai[prop](...args)
        }
        return { function: prop, args }
      }
    },
  },
)

export const list = (strings: TemplateStringsArray, ...values: any[]) => {
  const input = strings.reduce((acc, str, i) => acc + str + (values[i] !== undefined ? JSON.stringify(values[i]) : ''), '')

  return {
    [Symbol.asyncIterator]: async function* () {
      for (let i = 1; i <= 3; i++) {
        yield `Item ${i} for ${input}`
      }
    },
  }
}

export const research = (strings: TemplateStringsArray, ...values: any[]) => {
  const input = strings.reduce((acc, str, i) => acc + str + (values[i] !== undefined ? JSON.stringify(values[i]) : ''), '')

  return `Research results for: ${input}`
}

export const extract = (strings: TemplateStringsArray, ...values: any[]) => {
  const input = strings.reduce((acc, str, i) => acc + str + (values[i] !== undefined ? JSON.stringify(values[i]) : ''), '')

  return {
    [Symbol.asyncIterator]: async function* () {
      for (let i = 1; i <= 3; i++) {
        yield `Extracted item ${i} from ${input}`
      }
    },
  }
}

export const db = new Proxy(
  {},
  {
    get: (_target, collection) => {
      return {
        create: async (title: string, content: string) => {
          const runtime = await initializeSDK()
          if (runtime?.db?.create) {
            return runtime.db.create({ collection, title, content })
          }
          return { collection, title, content }
        },
        find: async (query: any) => {
          const runtime = await initializeSDK()
          if (runtime?.db?.find) {
            return runtime.db.find({ collection, ...query })
          }
          return { collection, query }
        },
      }
    },
  },
)
