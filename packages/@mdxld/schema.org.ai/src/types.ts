/**
 * schema.org.ai TypeScript Type Definitions
 *
 * AI-native vocabulary for the semantic web
 * Version: 1.0.0
 *
 * This file provides TypeScript types for all 38 entity types defined in schema.org.ai
 */

// Base types

/** Base class for all AI-native entities */
export interface AIEntity {
  '@context'?: string | string[]
  '@type': string
  '@id'?: string
  name?: string
  description?: string
  aiVersion?: string
  aiProvider?: Organization | string
  generatedBy?: Agent | Model | string
  generatedAt?: string
  humanVerified?: boolean
  confidenceScore?: number
}

/** Schema.org Organization */
export interface Organization {
  '@type': 'Organization'
  name: string
  url?: string
}

/** Schema.org Person */
export interface Person {
  '@type': 'Person'
  name: string
  email?: string
}

// Core AI-Native Types

/** Autonomous AI agent with tools and goals */
export interface Agent extends AIEntity {
  '@type': 'Agent' | 'AgentTeam'
  role: string
  capabilities?: string[]
  tools?: (Tool | string)[]
  model?: Model | string
  systemPrompt?: string
  temperature?: number
  maxTokens?: number
  topP?: number
  goals?: string[]
  policies?: (Policy | string)[]
  skills?: (Skill | string)[]
  team?: AgentTeam | string
  teammates?: (Agent | string)[]
  coordinator?: Agent | string
  autonomyLevel?: 'supervised' | 'semi-autonomous' | 'fully-autonomous'
  humanInTheLoop?: boolean
  escalationPolicy?: Policy | string
  memoryType?: 'short-term' | 'long-term' | 'episodic' | 'semantic' | 'procedural'
  contextWindow?: number
  learningEnabled?: boolean
}

/** Coordinated team of AI agents */
export interface AgentTeam extends Agent {
  '@type': 'AgentTeam'
  teammates: (Agent | string)[]
  coordinator: Agent | string
  collaboration?: 'hierarchical' | 'flat' | 'specialized'
}

/** Specific capability or skill */
export interface Skill extends AIEntity {
  '@type': 'Skill'
  name: string
  category?: string
  proficiencyLevel?: number
  prerequisites?: (Skill | string)[]
  examples?: any[]
}

/** Rule governing agent behavior */
export interface Policy extends AIEntity {
  '@type': 'Policy'
  name: string
  policyType?: 'safety' | 'privacy' | 'compliance' | 'operational'
  rules?: string[]
  enforcement?: 'blocking' | 'warning' | 'logging'
  priority?: number
}

/** AI/ML model for inference or generation */
export interface Model extends AIEntity {
  '@type': 'Model' | 'Embedding'
  modelType?: 'llm' | 'embedding' | 'vision' | 'audio' | 'multimodal'
  modelFamily?: string
  provider?: Organization | string
  contextWindowSize?: number
  inputTokenLimit?: number
  outputTokenLimit?: number
  trainingData?: Dataset | string
  trainingCutoff?: string
  finetuning?: FineTuning | string
  baseModel?: Model | string
  multimodal?: boolean
  supportedModalities?: string[]
  visionEnabled?: boolean
  audioEnabled?: boolean
  functionCalling?: boolean
  structuredOutput?: boolean
  reasoningModel?: boolean
  costPerInputToken?: number
  costPerOutputToken?: number
  latencyMs?: number
  tokensPerSecond?: number
}

/** Model converting text/data to vectors */
export interface Embedding extends Model {
  '@type': 'Embedding'
  embeddingDimensions: number
  embeddingModel?: string
  maxInputTokens?: number
  costPer1MTokens?: number
  batchSize?: number
}

/** Process of fine-tuning a model */
export interface FineTuning extends AIEntity {
  '@type': 'FineTuning'
  baseModel: Model | string
  trainingData: Dataset | string
  hyperparameters?: Record<string, any>
  epochs?: number
  batchSize?: number
  learningRate?: number
  validationSplit?: number
  status?: 'pending' | 'training' | 'completed' | 'failed'
  completedAt?: string
  metrics?: Record<string, number>
}

/** Software tool or function agents can invoke */
export interface Tool extends AIEntity {
  '@type': 'Tool'
  toolType?: 'api' | 'function' | 'code' | 'search' | 'database'
  parameters?: Record<string, any>
  authentication?: 'api-key' | 'oauth' | 'none'
  rateLimit?: number
  apiEndpoint?: string
  apiMethod?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  apiHeaders?: string
  requestSchema?: string
  responseSchema?: string
  examples?: any[]
  requiresApproval?: boolean
  dangerLevel?: 'safe' | 'low' | 'medium' | 'high' | 'critical'
  timeout?: number
  retryPolicy?: 'none' | 'exponential' | 'fixed'
  caching?: boolean
  cacheDuration?: number
  parallel?: boolean
  dependencies?: (Tool | string)[]
}

/** Discrete unit of work */
export interface Task extends AIEntity {
  '@type': 'Task'
  taskType?: 'generation' | 'analysis' | 'transformation' | 'execution'
  taskStatus?: 'pending' | 'in-progress' | 'completed' | 'failed' | 'cancelled'
  taskPriority?: 'low' | 'medium' | 'high' | 'critical'
  assignedTo?: Agent | string
  dependencies?: (Task | string)[]
  subtasks?: (Task | string)[]
  parentTask?: Task | string
  estimatedDuration?: number
  actualDuration?: number
  deadline?: string
  startedAt?: string
  completedAt?: string
  result?: string
  error?: string
  retryCount?: number
  maxRetries?: number
  plan?: Plan | string
}

/** Structured sequence of tasks */
export interface Plan extends AIEntity {
  '@type': 'Plan'
  planType?: 'sequential' | 'parallel' | 'conditional' | 'iterative'
  planStatus?: 'draft' | 'active' | 'paused' | 'completed' | 'failed'
  steps: (Task | string)[]
  currentStep?: Task | string
  completedSteps?: (Task | string)[]
  objective?: string
  successCriteria?: string[]
  rollbackStrategy?: string
  createdAt?: string
  startedAt?: string
  completedAt?: string
  estimatedDuration?: number
  actualDuration?: number
}

/** Queryable knowledge collection */
export interface KnowledgeBase extends AIEntity {
  '@type': 'KnowledgeBase'
  knowledgeType?: 'factual' | 'procedural' | 'conceptual' | 'meta-cognitive'
  knowledgeSource?: string
  vectorStore?: string
  indexStrategy?: 'semantic' | 'keyword' | 'hybrid'
  chunkSize?: number
  chunkOverlap?: number
  searchTopK?: number
  rerankingModel?: Model | string
  documentCount?: number
  lastUpdated?: string
}

/** Template for AI interaction */
export interface Prompt extends AIEntity {
  '@type': 'Prompt' | 'PromptChain'
  promptTemplate: string
  promptVariables?: string[]
  promptType?: 'system' | 'user' | 'assistant' | 'few-shot' | 'chain-of-thought'
  fewShotExamples?: any[]
  chainOfThought?: boolean
  thoughtProcess?: string
  model?: Model | string
  temperature?: number
  maxTokens?: number
}

/** Sequence of prompts */
export interface PromptChain extends Prompt {
  '@type': 'PromptChain'
  prompts: (Prompt | string)[]
  chainType?: 'sequential' | 'parallel' | 'conditional' | 'recursive'
  nextPrompt?: Prompt | string
  previousPrompt?: Prompt | string
  branchCondition?: string
  stopCondition?: string
  maxIterations?: number
  aggregationStrategy?: 'concat' | 'merge' | 'select'
}

/** Stored knowledge or experience */
export interface Memory extends AIEntity {
  '@type': 'Memory'
  memoryType?: 'short-term' | 'long-term' | 'episodic' | 'semantic' | 'procedural'
  memoryStore?: 'vector-db' | 'database' | 'file' | 'cache'
  retrievalStrategy?: 'semantic' | 'temporal' | 'relevance'
  relevanceScore?: number
  decayRate?: number
  accessCount?: number
  lastAccessed?: string
  content?: string
  embedding?: number[]
  metadata?: Record<string, any>
}

/** Environmental information */
export interface Context extends AIEntity {
  '@type': 'Context'
  contextType?: 'user' | 'session' | 'conversation' | 'global' | 'domain'
  contextData?: string | Record<string, any>
  scope?: 'request' | 'session' | 'global'
  expiresAt?: string
  priority?: number
}

/** Thread of messages */
export interface Conversation extends AIEntity {
  '@type': 'Conversation'
  messages: (Message | string)[]
  participants?: (Agent | Person | string)[]
  startedAt?: string
  lastMessageAt?: string
  status?: 'active' | 'archived' | 'completed'
  title?: string
  summary?: string
  totalTokens?: number
}

/** Single message in conversation */
export interface Message extends AIEntity {
  '@type': 'Message'
  conversation: Conversation | string
  messageRole: 'system' | 'user' | 'assistant' | 'function'
  messageContent: string
  functionCall?: string
  functionResult?: string
  tokenCount?: number
  timestamp: string
  inReplyTo?: Message | string
  attachments?: any[]
}

// Schema.org Extensions

/** AI-powered software application */
export interface AIApplication extends AIEntity {
  '@type': 'AIApplication'
  aiCapabilities?: string[]
  aiModels?: (Model | string)[]
  aiProvider?: Organization | string
  autonomyLevel?: 'supervised' | 'semi-autonomous' | 'autonomous'
  humanInTheLoop?: boolean
  privacyPolicy?: string
  ethicsGuidelines?: string
}

/** Action performed by AI agent */
export interface AgenticAction extends AIEntity {
  '@type': 'AgenticAction'
  agent: Agent | string
  toolsUsed?: (Tool | string)[]
  reasoning?: string
  confidenceScore?: number
  requiresApproval?: boolean
  approved?: boolean
  approvedBy?: Person | string
}

/** Creative work generated by AI */
export interface GeneratedWork extends AIEntity {
  '@type': 'GeneratedWork' | 'GeneratedArticle' | 'GeneratedCode' | 'GeneratedImage' | 'GeneratedVideo' | 'GeneratedAudio'
  generatedBy: Agent | Model | string
  generatedAt: string
  prompt?: Prompt | string
  model?: Model | string
  humanEdited?: boolean
  humanVerified?: boolean
  generationMetadata?: Record<string, any>
}

/** AI-generated article */
export interface GeneratedArticle extends GeneratedWork {
  '@type': 'GeneratedArticle'
  headline?: string
  wordCount?: number
  readingTime?: number
}

/** AI-generated source code */
export interface GeneratedCode extends GeneratedWork {
  '@type': 'GeneratedCode'
  programmingLanguage?: string
  linesOfCode?: number
  testCoverage?: number
  passesTests?: boolean
}

/** AI-generated image */
export interface GeneratedImage extends GeneratedWork {
  '@type': 'GeneratedImage'
  width?: number
  height?: number
  style?: string
}

/** AI-generated video */
export interface GeneratedVideo extends GeneratedWork {
  '@type': 'GeneratedVideo'
  duration?: number
  frameRate?: number
}

/** AI-generated audio */
export interface GeneratedAudio extends GeneratedWork {
  '@type': 'GeneratedAudio'
  duration?: number
  voice?: string
  language?: string
}

/** Dataset for model training */
export interface TrainingDataset extends AIEntity {
  '@type': 'TrainingDataset'
  dataType?: 'text' | 'image' | 'audio' | 'tabular'
  size?: number
  format?: string
  license?: string
  splits?: Record<string, number>
  preprocessing?: string[]
  quality?: number
  bias?: Record<string, any>
}

/** Dataset for validation */
export interface ValidationDataset extends AIEntity {
  '@type': 'ValidationDataset'
  dataType?: 'text' | 'image' | 'audio' | 'tabular'
  size?: number
  format?: string
  groundTruth?: boolean
}

/** Standardized evaluation dataset */
export interface BenchmarkDataset extends AIEntity {
  '@type': 'BenchmarkDataset'
  dataType?: 'text' | 'image' | 'audio' | 'tabular'
  size?: number
  task?: string
  metrics?: string[]
  leaderboard?: string
}

/** Multi-step AI process */
export interface AIWorkflow extends AIEntity {
  '@type': 'AIWorkflow'
  steps?: (Task | string)[]
  agents?: (Agent | string)[]
  tools?: (Tool | string)[]
  estimatedTime?: number
  successRate?: number
}

/** Specific AI capability */
export interface AICapability extends AIEntity {
  '@type': 'AICapability'
  capabilityType?: string
  models?: (Model | string)[]
  accuracy?: number
  latency?: number
}

/** API service providing AI capabilities */
export interface AIService extends AIEntity {
  '@type': 'AIService'
  apiEndpoint?: string
  authentication?: string
  pricing?: Record<string, any>
  rateLimit?: number
  capabilities?: string[]
  models?: (Model | string)[]
}

/** Model documentation and ethics */
export interface AIModelCard extends AIEntity {
  '@type': 'AIModelCard'
  model: Model | string
  intendedUse?: string
  limitations?: string[]
  biases?: string[]
  ethicalConsiderations?: string[]
  performance?: Record<string, any>
  trainingData?: Dataset | string
}

/** Model performance evaluation */
export interface AIEvaluation extends AIEntity {
  '@type': 'AIEvaluation'
  model: Model | string
  dataset: Dataset | string
  metrics?: Array<{ name: string; value: number; unit?: string }>
  score?: number
  evaluatedAt?: string
}

/** Standardized benchmark test */
export interface AIBenchmark extends AIEntity {
  '@type': 'AIBenchmark'
  task?: string
  dataset?: BenchmarkDataset | string
  metric?: string
  baseline?: number
}

/** Performance measurement */
export interface AIMetric extends AIEntity {
  '@type': 'AIMetric'
  metricName: string
  value: number
  unit?: string
  timestamp?: string
}

/** AI research experiment */
export interface AIExperiment extends AIEntity {
  '@type': 'AIExperiment'
  hypothesis?: string
  methodology?: string
  model?: Model | string
  dataset?: Dataset | string
  results?: Record<string, any>
  conclusion?: string
}

/** Model deployment to production */
export interface AIDeployment extends AIEntity {
  '@type': 'AIDeployment'
  model: Model | string
  environment?: string
  deployedAt?: string
  version?: string
  status?: 'active' | 'inactive' | 'deprecated'
  endpoint?: string
}

/** Production model monitoring */
export interface AIMonitoring extends AIEntity {
  '@type': 'AIMonitoring'
  model: Model | string
  metrics?: string[]
  alerts?: Array<{ type: string; threshold: number; action: string }>
  period?: 'realtime' | 'hourly' | 'daily'
  lastChecked?: string
}

// Schema.org base types

export interface Dataset {
  '@type': 'Dataset'
  name: string
  description?: string
  url?: string
}

// Union types for convenience

export type AIType =
  | Agent
  | AgentTeam
  | Skill
  | Policy
  | Model
  | Embedding
  | FineTuning
  | Tool
  | Task
  | Plan
  | KnowledgeBase
  | Prompt
  | PromptChain
  | Memory
  | Context
  | Conversation
  | Message
  | AIApplication
  | AgenticAction
  | GeneratedWork
  | GeneratedArticle
  | GeneratedCode
  | GeneratedImage
  | GeneratedVideo
  | GeneratedAudio
  | TrainingDataset
  | ValidationDataset
  | BenchmarkDataset
  | AIWorkflow
  | AICapability
  | AIService
  | AIModelCard
  | AIEvaluation
  | AIBenchmark
  | AIMetric
  | AIExperiment
  | AIDeployment
  | AIMonitoring

export type AITypeNames =
  | 'Agent'
  | 'AgentTeam'
  | 'Skill'
  | 'Policy'
  | 'Model'
  | 'Embedding'
  | 'FineTuning'
  | 'Tool'
  | 'Task'
  | 'Plan'
  | 'KnowledgeBase'
  | 'Prompt'
  | 'PromptChain'
  | 'Memory'
  | 'Context'
  | 'Conversation'
  | 'Message'
  | 'AIApplication'
  | 'AgenticAction'
  | 'GeneratedWork'
  | 'GeneratedArticle'
  | 'GeneratedCode'
  | 'GeneratedImage'
  | 'GeneratedVideo'
  | 'GeneratedAudio'
  | 'TrainingDataset'
  | 'ValidationDataset'
  | 'BenchmarkDataset'
  | 'AIWorkflow'
  | 'AICapability'
  | 'AIService'
  | 'AIModelCard'
  | 'AIEvaluation'
  | 'AIBenchmark'
  | 'AIMetric'
  | 'AIExperiment'
  | 'AIDeployment'
  | 'AIMonitoring'
