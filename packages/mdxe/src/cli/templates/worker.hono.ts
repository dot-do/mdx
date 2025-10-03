import { Hono } from 'hono'
import { getAssetFromKV } from '@cloudflare/kv-asset-handler'

/**
 * Cloudflare Worker for mdxe using Hono
 * Serves Next.js static output with dynamic routing
 */

type Bindings = {
  __STATIC_CONTENT: KVNamespace
  CACHE?: KVNamespace
  ASSETS?: Fetcher
}

const app = new Hono<{ Bindings: Bindings }>()

// Health check endpoint
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: Date.now() })
})

// API routes (example)
app.get('/api/*', (c) => {
  return c.json({ error: 'API not implemented' }, 404)
})

// Serve static assets and Next.js pages
app.get('/*', async (c) => {
  const url = new URL(c.req.url)

  try {
    // Try to serve from KV asset handler (static files)
    const response = await getAssetFromKV(c.req.raw, {
      ASSET_NAMESPACE: c.env.__STATIC_CONTENT,
      ASSET_MANIFEST: __STATIC_CONTENT_MANIFEST,
    })

    // Add caching headers
    const headers = new Headers(response.headers)
    headers.set('cache-control', 'public, max-age=3600')

    return new Response(response.body, {
      status: response.status,
      headers,
    })
  } catch (error) {
    // Fallback: serve index.html for client-side routing
    try {
      const indexResponse = await getAssetFromKV(c.req.raw, {
        ASSET_NAMESPACE: c.env.__STATIC_CONTENT,
        ASSET_MANIFEST: __STATIC_CONTENT_MANIFEST,
        mapRequestToAsset: () => new Request(`${url.origin}/index.html`),
      })

      return new Response(indexResponse.body, {
        status: 200,
        headers: indexResponse.headers,
      })
    } catch (e) {
      return c.text('Not found', 404)
    }
  }
})

export default app
