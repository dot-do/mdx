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
 * Create fallback runtime when sdk.do is not available
 */
function createFallbackRuntime() {
  return {
    ai: {
      generate: async (prompt: string) => `[STUB] AI response for: ${prompt}`,
      embed: async (text: string) => Array(1536).fill(0),
      models: {
        getModels: () => [],
        getModel: () => null,
      },
    },
    db: {
      find: async (query: any) => ({ query, results: [] }),
      create: async (data: any) => ({ created: data }),
      update: async (id: string, data: any) => ({ id, updated: data }),
      delete: async (id: string) => ({ id, deleted: true }),
    },
    api: {
      get: async (url: string) => ({ url, method: 'GET' }),
      post: async (url: string, data: any) => ({ url, method: 'POST', data }),
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
