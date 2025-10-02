/**
 * schema.org.ai
 *
 * TypeScript types for AI-native Schema.org vocabulary
 *
 * @see https://schema.org.ai
 * @version 1.0.0
 */

export * from './types.js'

// Context URLs
export const SCHEMA_ORG_AI_CONTEXT = 'http://schema.org.ai/context/ai-context.jsonld'
export const AGENTS_CONTEXT = 'http://schema.org.ai/context/agents-context.jsonld'
export const MODELS_CONTEXT = 'http://schema.org.ai/context/models-context.jsonld'
export const TOOLS_CONTEXT = 'http://schema.org.ai/context/tools-context.jsonld'
export const MEMORY_CONTEXT = 'http://schema.org.ai/context/memory-context.jsonld'
export const WORKFLOWS_CONTEXT = 'http://schema.org.ai/context/workflows-context.jsonld'
export const KNOWLEDGE_CONTEXT = 'http://schema.org.ai/context/knowledge-context.jsonld'

// Type guards

export function isAgent(obj: any): obj is import('./types.js').Agent {
  return obj && obj['@type'] === 'Agent'
}

export function isModel(obj: any): obj is import('./types.js').Model {
  return obj && obj['@type'] === 'Model'
}

export function isTool(obj: any): obj is import('./types.js').Tool {
  return obj && obj['@type'] === 'Tool'
}

export function isTask(obj: any): obj is import('./types.js').Task {
  return obj && obj['@type'] === 'Task'
}

export function isPlan(obj: any): obj is import('./types.js').Plan {
  return obj && obj['@type'] === 'Plan'
}

export function isKnowledgeBase(obj: any): obj is import('./types.js').KnowledgeBase {
  return obj && obj['@type'] === 'KnowledgeBase'
}

export function isPrompt(obj: any): obj is import('./types.js').Prompt {
  return obj && obj['@type'] === 'Prompt'
}

export function isMemory(obj: any): obj is import('./types.js').Memory {
  return obj && obj['@type'] === 'Memory'
}

export function isConversation(obj: any): obj is import('./types.js').Conversation {
  return obj && obj['@type'] === 'Conversation'
}

export function isMessage(obj: any): obj is import('./types.js').Message {
  return obj && obj['@type'] === 'Message'
}

export function isGeneratedWork(obj: any): obj is import('./types.js').GeneratedWork {
  return obj && (
    obj['@type'] === 'GeneratedWork' ||
    obj['@type'] === 'GeneratedArticle' ||
    obj['@type'] === 'GeneratedCode' ||
    obj['@type'] === 'GeneratedImage' ||
    obj['@type'] === 'GeneratedVideo' ||
    obj['@type'] === 'GeneratedAudio'
  )
}
