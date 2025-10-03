/**
 * mdxai AI SDK Agent
 * Natural language interface to mdxdb with generation capabilities
 */

import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { mdxaiTools } from './tools.js'

export interface AgentOptions {
  model?: string
  background?: boolean
  maxSteps?: number
  cwd?: string
}

export interface AgentResult {
  text: string
  steps: any[]
  usage?: any
  toolCalls: number
  finishReason: string
}

/**
 * Run the mdxai agent with natural language prompt
 */
export async function runAgent(prompt: string, options: AgentOptions = {}): Promise<AgentResult> {
  const {
    model = 'gpt-4o',
    background = false,
    maxSteps = 10,
    cwd = process.cwd(),
  } = options

  // Configure model
  const modelConfig = openai(model, {
    ...(background && {
      modalities: ['text'],
      reasoningEffort: 'low',
    }),
  })

  // System prompt
  const systemPrompt = `You are an AI agent that helps generate and manage MDX content.

You have access to these tools:

**mdxdb Tools:**
- list: List MDX files matching a glob pattern
- search: Search MDX files by frontmatter fields
- get: Get full content of a specific MDX file
- put: Write or update an MDX file

**Generation Tools:**
- generate: Generate AI content for a single item with context
- forEach: Generate content for multiple files matching a pattern (supports parallel generation)

**OpenAI Features:**
- background: Use background mode for 50% cost reduction (already ${background ? 'ENABLED' : 'disabled'})
- service_tier: flex is automatically used for background mode

**Working Directory:** ${cwd}

**Guidelines:**
1. Use glob patterns to find files (e.g., "**/*.mdx", "occupations/*.mdx")
2. Use forEach for batch generation with validation and concurrency control
3. Generate only missing/invalid fields when schema is provided
4. Use background mode for large batch operations (50% cheaper)
5. Provide progress updates during long operations

**Example Workflows:**

List all occupations:
- list(pattern: "occupations/*.mdx")

Generate blog posts for all occupations:
- forEach(pattern: "occupations/*.mdx", prompt: "Write a blog post about {title}", output: "blog-posts/", concurrency: 25, background: true)

Search for specific items:
- search(pattern: "**/*.mdx", field: "category", value: "technology")

Update a file:
- get(path: "example.mdx")
- put(path: "example.mdx", frontmatter: {...}, content: "...")

Respond conversationally and explain what you're doing.`

  // Run agent with tools
  const result = await generateText({
    model: modelConfig,
    system: systemPrompt,
    prompt,
    tools: mdxaiTools,
    maxSteps,
    ...(background && {
      providerOptions: {
        openai: {
          service_tier: 'flex',
        },
      },
    }),
  })

  return {
    text: result.text,
    steps: result.steps,
    usage: result.usage,
    toolCalls: result.steps.filter((step: any) => step.toolCalls && step.toolCalls.length > 0).length,
    finishReason: result.finishReason,
  }
}

/**
 * Run agent with streaming
 */
export async function* streamAgent(prompt: string, options: AgentOptions = {}) {
  const {
    model = 'gpt-4o',
    background = false,
    maxSteps = 10,
    cwd = process.cwd(),
  } = options

  const { streamText } = await import('ai')

  const modelConfig = openai(model, {
    ...(background && {
      modalities: ['text'],
      reasoningEffort: 'low',
    }),
  })

  const systemPrompt = `You are an AI agent that helps generate and manage MDX content.

You have access to mdxdb tools (list, search, get, put) and generation tools (generate, forEach).

Working Directory: ${cwd}
Background Mode: ${background ? 'ENABLED (50% cost reduction)' : 'disabled'}

Use tools to accomplish the user's request and explain what you're doing.`

  const result = streamText({
    model: modelConfig,
    system: systemPrompt,
    prompt,
    tools: mdxaiTools,
    maxSteps,
    ...(background && {
      providerOptions: {
        openai: {
          service_tier: 'flex',
        },
      },
    }),
  })

  for await (const chunk of result.textStream) {
    yield chunk
  }

  return result
}

/**
 * Interactive agent for multi-turn conversations
 */
export class MdxaiAgent {
  private model: string
  private background: boolean
  private maxSteps: number
  private cwd: string
  private history: Array<{ role: 'user' | 'assistant'; content: string }> = []

  constructor(options: AgentOptions = {}) {
    this.model = options.model || 'gpt-4o'
    this.background = options.background || false
    this.maxSteps = options.maxSteps || 10
    this.cwd = options.cwd || process.cwd()
  }

  /**
   * Send a message to the agent
   */
  async send(message: string): Promise<AgentResult> {
    this.history.push({ role: 'user', content: message })

    const result = await runAgent(message, {
      model: this.model,
      background: this.background,
      maxSteps: this.maxSteps,
      cwd: this.cwd,
    })

    this.history.push({ role: 'assistant', content: result.text })

    return result
  }

  /**
   * Get conversation history
   */
  getHistory() {
    return this.history
  }

  /**
   * Clear conversation history
   */
  clearHistory() {
    this.history = []
  }

  /**
   * Set working directory
   */
  setCwd(cwd: string) {
    this.cwd = cwd
  }

  /**
   * Enable/disable background mode
   */
  setBackgroundMode(enabled: boolean) {
    this.background = enabled
  }
}

// Export all agent functionality
export { mdxaiTools } from './tools.js'
export type { AgentOptions, AgentResult }
