/**
 * AI Service Client for mdxdb
 * Communicates with https://ai.do for AI generation
 */

import { getAccessToken } from './auth.js'

export interface GenerateOptions {
  provider?: 'openai' | 'anthropic' | 'workers-ai'
  model?: string
  systemPrompt?: string
  temperature?: number
  maxTokens?: number
  fallback?: boolean
}

export interface BackgroundJobOptions extends GenerateOptions {
  priority?: 'high' | 'normal' | 'low'
  webhook?: string
}

export interface GenerateResponse {
  text: string
  model: string
  provider: string
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export interface BackgroundJobResponse {
  jobId: string
  status: 'queued' | 'processing' | 'completed' | 'failed'
  message: string
}

export interface JobStatusResponse {
  jobId: string
  status: 'queued' | 'processing' | 'completed' | 'failed'
  result?: GenerateResponse
  error?: string
  createdAt: number
  completedAt?: number
}

/**
 * AI Service Client
 */
export class AIServiceClient {
  private baseUrl: string
  private apiKey?: string

  constructor(baseUrl: string = 'https://ai.do', apiKey?: string) {
    this.baseUrl = baseUrl
    this.apiKey = apiKey
  }

  /**
   * Get authorization headers
   */
  private async getHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    // Try to get access token from auth module
    const token = await getAccessToken()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    } else if (this.apiKey) {
      // Fallback to API key if no OAuth token
      headers['X-API-Key'] = this.apiKey
    }

    return headers
  }

  /**
   * Generate text synchronously
   * Uses /ai/generate endpoint
   */
  async generate(prompt: string, options?: GenerateOptions): Promise<GenerateResponse> {
    const headers = await this.getHeaders()

    const response = await fetch(`${this.baseUrl}/ai/generate`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        prompt,
        provider: options?.provider || 'openai',
        model: options?.model || 'o1', // Use o1 (GPT-5) by default
        systemPrompt: options?.systemPrompt,
        temperature: options?.temperature ?? 0.7,
        maxTokens: options?.maxTokens ?? 2048,
        fallback: options?.fallback ?? true,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`AI generation failed: ${error.message || response.statusText}`)
    }

    return await response.json()
  }

  /**
   * Submit background generation job (uses flex tier for 50% discount)
   * Uses /ai/background endpoint
   */
  async generateBackground(prompt: string, options?: BackgroundJobOptions): Promise<BackgroundJobResponse> {
    const headers = await this.getHeaders()

    const response = await fetch(`${this.baseUrl}/ai/background`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        type: 'generate',
        input: prompt,
        options: {
          provider: options?.provider || 'openai',
          model: options?.model || 'o1-background', // Use o1-background for flex tier
          systemPrompt: options?.systemPrompt,
          temperature: options?.temperature ?? 0.7,
          maxTokens: options?.maxTokens ?? 2048,
          fallback: options?.fallback ?? true,
          priority: options?.priority || 'normal',
          webhook: options?.webhook,
        },
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Background job submission failed: ${error.message || response.statusText}`)
    }

    return await response.json()
  }

  /**
   * Check status of background job
   */
  async getJobStatus(jobId: string): Promise<JobStatusResponse> {
    const headers = await this.getHeaders()

    const response = await fetch(`${this.baseUrl}/ai/jobs/${jobId}`, {
      method: 'GET',
      headers,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Failed to get job status: ${error.message || response.statusText}`)
    }

    return await response.json()
  }

  /**
   * Wait for background job to complete
   * Polls every interval until job is done
   */
  async waitForJob(jobId: string, pollInterval: number = 2000, maxWaitTime: number = 300000): Promise<GenerateResponse> {
    const startTime = Date.now()

    while (Date.now() - startTime < maxWaitTime) {
      const status = await this.getJobStatus(jobId)

      if (status.status === 'completed') {
        if (!status.result) {
          throw new Error('Job completed but no result available')
        }
        return status.result
      }

      if (status.status === 'failed') {
        throw new Error(`Job failed: ${status.error || 'Unknown error'}`)
      }

      // Wait before polling again
      await new Promise((resolve) => setTimeout(resolve, pollInterval))
    }

    throw new Error(`Job ${jobId} timed out after ${maxWaitTime}ms`)
  }

  /**
   * Analyze content using AI
   */
  async analyze(content: string, analysis: string, options?: GenerateOptions): Promise<GenerateResponse> {
    const prompt = `Analyze the following content for ${analysis}:\n\n${content}`
    return this.generate(prompt, options)
  }
}

/**
 * Create default AI service client
 */
export function createAIClient(apiKey?: string): AIServiceClient {
  const baseUrl = process.env.AI_SERVICE_URL || 'https://ai.do'
  return new AIServiceClient(baseUrl, apiKey)
}
