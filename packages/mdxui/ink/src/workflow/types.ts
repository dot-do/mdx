import { z } from 'zod'

export interface Step<TInput = any, TOutput = any> {
  id: string
  name: string
  description?: string
  inputSchema?: z.ZodSchema<TInput>
  outputSchema: z.ZodSchema<TOutput>
  execute?: (input?: TInput) => Promise<TOutput> | TOutput
}

export interface Workflow<TInput = any, TOutput = any> {
  id: string
  name: string
  description?: string
  inputSchema: z.ZodSchema<TInput>
  outputSchema: z.ZodSchema<TOutput>
  steps: Step[]
}

export interface WorkflowExecution<TInput = any, TOutput = any> {
  workflow: Workflow<TInput, TOutput>
  currentStepIndex: number
  stepResults: Record<string, any>
  status: 'pending' | 'running' | 'completed' | 'failed'
  error?: Error
}

export interface WorkflowFrontmatter {
  workflow?: {
    id: string
    name: string
    description?: string
    steps: Array<{
      id: string
      name: string
      description?: string
      input?: Record<string, string>
      output: Record<string, string>
    }>
  }
  steps?: string[]
  screens?: string[]
}
