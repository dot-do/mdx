/**
 * HTTP client for db worker RPC interface
 *
 * Provides HTTP-based implementation of DbWorkerClient for CLI usage
 */

import type { DbWorkerClient } from './commands/push.js'

export interface HttpClientConfig {
  /**
   * Base URL for the db worker API
   * @example 'https://db.do' or 'http://localhost:8787'
   */
  baseUrl: string

  /**
   * API key for authentication
   */
  apiKey?: string

  /**
   * Custom headers to include in requests
   */
  headers?: Record<string, string>
}

/**
 * Create HTTP client for db worker
 */
export function createHttpClient(config: HttpClientConfig): DbWorkerClient {
  const { baseUrl, apiKey, headers = {} } = config

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  }

  if (apiKey) {
    defaultHeaders['Authorization'] = `Bearer ${apiKey}`
  }

  async function request<T>(endpoint: string, method: string, body?: any): Promise<T> {
    const url = `${baseUrl}${endpoint}`
    const options: RequestInit = {
      method,
      headers: defaultHeaders,
    }

    if (body) {
      options.body = JSON.stringify(body)
    }

    const response = await fetch(url, options)

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }

    return response.json()
  }

  return {
    async getThing(params: { ns: string; id: string }) {
      try {
        return await request(`/api/things/${params.ns}/${params.id}`, 'GET')
      } catch (error: any) {
        if (error.message.includes('404')) {
          return null
        }
        throw error
      }
    },

    async createThing(params: {
      ns: string
      id: string
      type: string
      content: string
      data: any
      visibility?: 'public' | 'private' | 'unlisted'
    }) {
      return await request('/api/things', 'POST', params)
    },

    async updateThing(params: {
      ns: string
      id: string
      data?: any
      content?: string
      visibility?: 'public' | 'private' | 'unlisted'
    }) {
      return await request(`/api/things/${params.ns}/${params.id}`, 'PATCH', params)
    },

    async queryThings(params: {
      ns?: string
      type?: string
      limit?: number
      offset?: number
    }) {
      const queryParams = new URLSearchParams()
      if (params.ns) queryParams.append('ns', params.ns)
      if (params.type) queryParams.append('type', params.type)
      if (params.limit) queryParams.append('limit', params.limit.toString())
      if (params.offset) queryParams.append('offset', params.offset.toString())

      return await request(`/api/things?${queryParams.toString()}`, 'GET')
    },
  }
}
