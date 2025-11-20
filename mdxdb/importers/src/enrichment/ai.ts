/**
 * AI Enrichment Service
 *
 * Phase 2: LLM-powered enrichment using GPT-5
 * - Uses background mode with service_tier: flex for 50% discount
 * - Generates use cases, features, examples, relationships
 * - Validates against Zod schemas
 */

import { AIServiceClient, createAIClient } from '../utils/ai-client.js'
import type { App, Verb, Disposition, EventType, CollectionEntity } from '../schemas.js'
import { validateFrontmatter } from '../schemas.js'
import { EnrichmentService, type EnrichmentResult, type EnrichmentOptions } from './base.js'

/**
 * AI enrichment configuration
 */
export interface AIEnrichmentConfig {
  /**
   * API key for fallback when OAuth not available
   */
  apiKey?: string

  /**
   * Model to use (default: o1 - GPT-5)
   */
  model?: string

  /**
   * Temperature (0-2, lower = more focused)
   */
  temperature?: number

  /**
   * Maximum tokens per request
   */
  maxTokens?: number

  /**
   * Batch size for processing
   */
  batchSize?: number

  /**
   * Use background mode with flex tier for 50% discount (default: true)
   */
  useBackground?: boolean
}

/**
 * AI enrichment service
 */
export class AIEnrichmentService extends EnrichmentService {
  name = 'AIEnrichment'
  version = '2.0'

  private aiClient: AIServiceClient
  private config: {
    apiKey?: string
    model: string
    temperature: number
    maxTokens: number
    batchSize: number
    useBackground: boolean
  }

  constructor(config: AIEnrichmentConfig = {}) {
    super()

    // Initialize AI service client
    this.aiClient = createAIClient(config.apiKey)

    // Default configuration
    this.config = {
      apiKey: config.apiKey,
      model: config.model || 'o1', // GPT-5 (o1 model)
      temperature: config.temperature ?? 0.3,
      maxTokens: config.maxTokens ?? 2000,
      batchSize: config.batchSize ?? 10,
      useBackground: config.useBackground ?? true, // Use background mode by default for 50% discount
    }
  }

  /**
   * Enrich a single entity
   */
  async enrichEntity(entity: CollectionEntity, options?: EnrichmentOptions): Promise<EnrichmentResult> {
    const startTime = Date.now()
    const changes: string[] = []
    const errors: string[] = []

    // Check if needs enrichment
    if (!this.needsEnrichment(entity, options)) {
      return {
        entity,
        enriched: false,
        changes: [],
        errors: [],
        duration: Date.now() - startTime,
      }
    }

    try {
      // Generate enrichments based on collection type
      let enriched: CollectionEntity = entity

      switch (entity.collection) {
        case 'Apps':
          enriched = await this.enrichAppWithAI(entity as App, changes, options)
          break

        case 'Verbs':
          enriched = await this.enrichVerbWithAI(entity as Verb, changes, options)
          break

        case 'Dispositions':
          enriched = await this.enrichDispositionWithAI(entity as Disposition, changes, options)
          break

        case 'EventTypes':
          enriched = await this.enrichEventTypeWithAI(entity as EventType, changes, options)
          break

        default:
          this.log(`Unknown collection: ${entity.collection}`, options?.verbose)
      }

      // Validate against schema
      try {
        enriched = validateFrontmatter(entity.collection, enriched) as CollectionEntity
      } catch (validationError) {
        const errorMessage = validationError instanceof Error ? validationError.message : String(validationError)
        errors.push(`Validation failed: ${errorMessage}`)
        this.log(`Validation error: ${errorMessage}`, options?.verbose)
      }

      // Mark as enriched
      enriched = this.markEnriched(enriched)

      return {
        entity: enriched,
        enriched: true,
        changes,
        errors,
        duration: Date.now() - startTime,
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      errors.push(errorMessage)

      return {
        entity,
        enriched: false,
        changes,
        errors,
        duration: Date.now() - startTime,
      }
    }
  }

  /**
   * Enrich an App with AI
   */
  private async enrichAppWithAI(app: App, changes: string[], options?: EnrichmentOptions): Promise<App> {
    const prompt = `
You are an expert at analyzing software applications and integrations. Given this application:

**Title**: ${app.title}
**Description**: ${app.description}
**Categories**: ${typeof app.categories === 'string' ? app.categories : (app.categories || []).join(', ')}
**Existing Tags**: ${(app.tags || []).join(', ') || 'None'}
**Existing Industries**: ${(app.industries || []).join(', ') || 'None'}

Generate comprehensive enrichment data for this app in JSON format:

{
  "tags": ["5-10 relevant topic tags (lowercase-with-hyphens)"],
  "industries": ["3-5 industries that commonly use this app"],
  "useCases": [
    {
      "title": "Use case title",
      "description": "Detailed description",
      "industry": "Relevant industry",
      "complexity": "simple|moderate|complex"
    }
  ],
  "features": [
    {
      "name": "Feature name",
      "description": "Feature description",
      "category": "Feature category"
    }
  ],
  "relatedApps": [
    {
      "id": "App_Name",
      "name": "App Name",
      "relationship": "alternative|complement|competitor|integration",
      "reason": "Why they're related"
    }
  ],
  "pricing": {
    "model": "free|freemium|subscription|usage-based|enterprise",
    "startingPrice": "Price or 'Free'",
    "currency": "USD"
  }
}

Provide 3-5 use cases, 5-10 features, and 3-5 related apps. Be specific and accurate.
`.trim()

    const response = await this.callOpenAI(prompt, options)

    if (response) {
      const enrichments = JSON.parse(response)

      // Merge with existing data
      return {
        ...app,
        tags: this.mergeArrays(app.tags || [], enrichments.tags || []),
        industries: this.mergeArrays(app.industries || [], enrichments.industries || []),
        useCases: enrichments.useCases || app.useCases || [],
        features: enrichments.features || app.features || [],
        relatedApps: enrichments.relatedApps || app.relatedApps || [],
        pricing: enrichments.pricing || app.pricing,
      }
    }

    return app
  }

  /**
   * Enrich a Verb with AI
   */
  private async enrichVerbWithAI(verb: Verb, changes: string[], options?: EnrichmentOptions): Promise<Verb> {
    const prompt = `
You are an expert at analyzing business actions and processes. Given this action:

**Name**: ${verb.name}
**Description**: ${verb.description}
**Category**: ${verb.category}
**Existing Tags**: ${(verb.tags || []).join(', ') || 'None'}

Generate comprehensive enrichment data in JSON format:

{
  "synonyms": ["3-5 alternative names for this action"],
  "antonyms": ["2-3 opposite actions"],
  "relatedVerbs": [
    {
      "id": "Action_Name",
      "name": "Action Name",
      "relationship": "similar|broader|narrower|sequence|alternative",
      "reason": "Why they're related"
    }
  ],
  "usedInIndustries": ["3-5 industries that perform this action"],
  "usedInProcesses": ["3-5 business processes that include this action"],
  "examples": [
    {
      "scenario": "Real-world scenario title",
      "description": "Detailed description",
      "industry": "Industry name",
      "outcome": "Expected outcome"
    }
  ],
  "prerequisites": [
    {
      "condition": "What must happen before",
      "required": true|false
    }
  ],
  "outcomes": [
    {
      "result": "What happens after",
      "probability": "certain|likely|possible"
    }
  ]
}

Provide 3-5 examples, 2-3 prerequisites, and 2-3 outcomes. Be specific.
`.trim()

    const response = await this.callOpenAI(prompt, options)

    if (response) {
      const enrichments = JSON.parse(response)

      return {
        ...verb,
        synonyms: this.mergeArrays(verb.synonyms || [], enrichments.synonyms || []),
        antonyms: this.mergeArrays(verb.antonyms || [], enrichments.antonyms || []),
        relatedVerbs: enrichments.relatedVerbs || verb.relatedVerbs || [],
        usedInIndustries: this.mergeArrays(verb.usedInIndustries || [], enrichments.usedInIndustries || []),
        usedInProcesses: this.mergeArrays(verb.usedInProcesses || [], enrichments.usedInProcesses || []),
        examples: enrichments.examples || verb.examples || [],
        prerequisites: enrichments.prerequisites || verb.prerequisites || [],
        outcomes: enrichments.outcomes || verb.outcomes || [],
      }
    }

    return verb
  }

  /**
   * Enrich a Disposition with AI
   */
  private async enrichDispositionWithAI(
    disposition: Disposition,
    changes: string[],
    options?: EnrichmentOptions
  ): Promise<Disposition> {
    const prompt = `
You are an expert at state management and object lifecycles. Given this state:

**Name**: ${disposition.name}
**Description**: ${disposition.description}
**Category**: ${disposition.category}

Generate comprehensive enrichment data in JSON format:

{
  "transitionsFrom": [
    {
      "dispositionId": "Previous_State",
      "dispositionName": "Previous State",
      "trigger": "What causes this transition",
      "conditions": ["Conditions that must be met"]
    }
  ],
  "transitionsTo": [
    {
      "dispositionId": "Next_State",
      "dispositionName": "Next State",
      "trigger": "What causes this transition",
      "conditions": ["Conditions that must be met"]
    }
  ],
  "usedInIndustries": ["3-5 industries that use this state"],
  "appliesTo": ["3-5 types of objects this state applies to"],
  "examples": [
    {
      "scenario": "Scenario description",
      "objectType": "Type of object",
      "industry": "Industry"
    }
  ],
  "implications": [
    {
      "type": "financial|operational|legal|quality|security",
      "description": "Business impact",
      "severity": "low|medium|high|critical"
    }
  ]
}

Provide 2-3 transitions in each direction, 3 examples, and 2-3 implications.
`.trim()

    const response = await this.callOpenAI(prompt, options)

    if (response) {
      const enrichments = JSON.parse(response)

      return {
        ...disposition,
        transitionsFrom: enrichments.transitionsFrom || disposition.transitionsFrom || [],
        transitionsTo: enrichments.transitionsTo || disposition.transitionsTo || [],
        usedInIndustries: this.mergeArrays(disposition.usedInIndustries || [], enrichments.usedInIndustries || []),
        appliesTo: this.mergeArrays(disposition.appliesTo || [], enrichments.appliesTo || []),
        examples: enrichments.examples || disposition.examples || [],
        implications: enrichments.implications || disposition.implications || [],
      }
    }

    return disposition
  }

  /**
   * Enrich an EventType with AI
   */
  private async enrichEventTypeWithAI(
    eventType: EventType,
    changes: string[],
    options?: EnrichmentOptions
  ): Promise<EventType> {
    const prompt = `
You are an expert at event-driven systems and EPCIS. Given this event type:

**Name**: ${eventType.name}
**Description**: ${eventType.description}
**Dimensions**: ${eventType.dimensions}

Generate comprehensive enrichment data in JSON format:

{
  "requiredFields": [
    {
      "field": "Field name",
      "type": "Data type",
      "description": "Field description"
    }
  ],
  "optionalFields": [
    {
      "field": "Field name",
      "type": "Data type",
      "description": "Field description"
    }
  ],
  "usedInIndustries": ["3-5 industries that use this event"],
  "usedInProcesses": ["3-5 processes that generate this event"],
  "examples": [
    {
      "scenario": "Scenario description",
      "description": "Detailed description",
      "industry": "Industry",
      "jsonExample": "JSON example string"
    }
  ],
  "relatedEvents": [
    {
      "eventTypeId": "Related_Event",
      "eventTypeName": "Related Event",
      "relationship": "precedes|follows|contains|alternative",
      "reason": "Why they're related"
    }
  ]
}

Provide 3-5 required fields, 3-5 optional fields, 3 examples, and 2-3 related events.
`.trim()

    const response = await this.callOpenAI(prompt, options)

    if (response) {
      const enrichments = JSON.parse(response)

      return {
        ...eventType,
        requiredFields: enrichments.requiredFields || eventType.requiredFields || [],
        optionalFields: enrichments.optionalFields || eventType.optionalFields || [],
        usedInIndustries: this.mergeArrays(eventType.usedInIndustries || [], enrichments.usedInIndustries || []),
        usedInProcesses: this.mergeArrays(eventType.usedInProcesses || [], enrichments.usedInProcesses || []),
        examples: enrichments.examples || eventType.examples || [],
        relatedEvents: enrichments.relatedEvents || eventType.relatedEvents || [],
      }
    }

    return eventType
  }

  /**
   * Call AI service with background mode and flex tier
   */
  private async callOpenAI(prompt: string, options?: EnrichmentOptions): Promise<string | null> {
    try {
      const systemPrompt = 'You are an expert data enrichment assistant. Provide accurate, well-structured JSON responses. Be specific and detailed.'
      const fullPrompt = `${systemPrompt}\n\n${prompt}\n\nProvide a JSON response only.`

      if (this.config.useBackground) {
        // Use background mode for 50% discount (flex tier)
        this.log('Submitting background job to AI service...', options?.verbose)

        const jobResponse = await this.aiClient.generateBackground(fullPrompt, {
          model: this.config.model,
          systemPrompt,
          temperature: this.config.temperature,
          maxTokens: this.config.maxTokens,
        })

        this.log(`Job queued: ${jobResponse.jobId}`, options?.verbose)

        // Wait for job to complete
        const result = await this.aiClient.waitForJob(jobResponse.jobId)

        if (result.text) {
          this.log(`Received ${result.text.length} characters`, options?.verbose)
          return result.text
        }

        return null
      } else {
        // Use sync generation
        this.log('Calling AI service (sync)...', options?.verbose)

        const result = await this.aiClient.generate(fullPrompt, {
          model: this.config.model,
          systemPrompt,
          temperature: this.config.temperature,
          maxTokens: this.config.maxTokens,
        })

        if (result.text) {
          this.log(`Received ${result.text.length} characters`, options?.verbose)
          return result.text
        }

        return null
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      this.log(`AI service error: ${errorMessage}`, options?.verbose)
      throw error
    }
  }

  /**
   * Merge two arrays, removing duplicates
   */
  private mergeArrays(arr1: string[], arr2: string[]): string[] {
    return Array.from(new Set([...arr1, ...arr2]))
  }
}

/**
 * Create AI enrichment service from environment
 * Uses OAuth via cli.do when available, falls back to API key
 */
export function createAIEnricher(config?: Partial<AIEnrichmentConfig>): AIEnrichmentService {
  const apiKey = config?.apiKey || process.env.OPENAI_API_KEY

  // API key is optional when using OAuth via cli.do
  // If neither is available, authentication will fail at request time

  return new AIEnrichmentService({
    apiKey,
    ...config,
  })
}
