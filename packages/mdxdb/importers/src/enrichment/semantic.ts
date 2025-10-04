/**
 * Semantic Enrichment Service
 *
 * Phase 1: Automated enrichment without LLMs
 * - Extract tags from titles/descriptions
 * - Infer industries from categories
 * - Classify complexity/frequency
 * - Generate basic examples
 */

import type { App, Verb, Disposition, EventType, CollectionEntity } from '../schemas.js'
import { EnrichmentService, type EnrichmentResult, type EnrichmentOptions } from './base.js'
import { extractKeywords, normalizeTag, calculateComplexity, inferFrequency } from './base.js'

/**
 * Category to industry mappings
 */
const CATEGORY_TO_INDUSTRIES: Record<string, string[]> = {
  // Technology & Software
  'team chat': ['Technology', 'Software Development', 'Professional Services'],
  'project management': ['Technology', 'Professional Services', 'Construction', 'Consulting'],
  'crm': ['Sales', 'Marketing', 'Technology', 'Professional Services'],
  'email': ['Technology', 'Professional Services', 'Marketing'],
  'marketing': ['Marketing', 'Advertising', 'Retail', 'E-commerce'],
  'developer tools': ['Software Development', 'Technology'],
  'analytics': ['Technology', 'Marketing', 'Finance', 'Healthcare'],
  'automation': ['Technology', 'Manufacturing', 'Professional Services'],

  // Business
  'accounting': ['Finance', 'Accounting', 'Professional Services'],
  'hr': ['Human Resources', 'Professional Services'],
  'recruiting': ['Human Resources', 'Professional Services', 'Technology'],
  'sales': ['Sales', 'Technology', 'Professional Services'],
  'customer support': ['Technology', 'Professional Services', 'Retail'],
  'ecommerce': ['E-commerce', 'Retail', 'Technology'],
  'payment processing': ['Finance', 'E-commerce', 'Technology'],

  // Productivity
  'productivity': ['Technology', 'Professional Services', 'Education'],
  'collaboration': ['Technology', 'Professional Services', 'Education'],
  'documents': ['Technology', 'Professional Services', 'Education'],
  'file management': ['Technology', 'Professional Services'],
  'scheduling': ['Professional Services', 'Healthcare', 'Education'],

  // Communication
  'video': ['Technology', 'Media', 'Education'],
  'phone': ['Technology', 'Professional Services', 'Sales'],
  'sms': ['Technology', 'Marketing', 'Professional Services'],
  'social media': ['Marketing', 'Media', 'Technology'],

  // Industry-specific
  'healthcare': ['Healthcare'],
  'education': ['Education'],
  'real estate': ['Real Estate'],
  'legal': ['Legal', 'Professional Services'],
  'nonprofit': ['Nonprofit', 'Professional Services'],
}

/**
 * Semantic enrichment service
 */
export class SemanticEnrichmentService extends EnrichmentService {
  name = 'SemanticEnrichment'
  version = '1.0'

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
      // Enrich based on collection type
      let enriched: CollectionEntity = entity

      switch (entity.collection) {
        case 'Apps':
          enriched = await this.enrichApp(entity as App, changes)
          break

        case 'Verbs':
          enriched = await this.enrichVerb(entity as Verb, changes)
          break

        case 'Dispositions':
          enriched = await this.enrichDisposition(entity as Disposition, changes)
          break

        case 'EventTypes':
          enriched = await this.enrichEventType(entity as EventType, changes)
          break

        default:
          this.log(`Unknown collection: ${entity.collection}`, options?.verbose)
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
   * Enrich an App entity
   */
  private async enrichApp(app: App, changes: string[]): Promise<App> {
    const enriched = { ...app }

    // Extract tags from title and description
    const text = `${app.title} ${app.description}`
    const keywords = extractKeywords(text, { maxKeywords: 8 })
    if (keywords.length > 0) {
      enriched.tags = keywords.map(normalizeTag)
      changes.push(`Added ${keywords.length} tags`)
    }

    // Infer industries from categories
    if (app.categories) {
      const categoryStr = typeof app.categories === 'string' ? app.categories : app.categories.join(' ')
      const industries = this.inferIndustries(categoryStr)
      if (industries.length > 0) {
        enriched.industries = industries
        changes.push(`Inferred ${industries.length} industries`)
      }
    }

    // Detect authentication methods from description
    const authMethods = this.detectAuthMethods(app.description)
    if (authMethods.length > 0) {
      enriched.authentication = authMethods
      changes.push(`Detected ${authMethods.length} auth methods`)
    }

    // Infer webhook support
    if (app.description.toLowerCase().includes('webhook')) {
      enriched.webhookSupport = true
      changes.push('Detected webhook support')
    }

    // Infer realtime support
    if (
      app.description.toLowerCase().includes('real-time') ||
      app.description.toLowerCase().includes('realtime') ||
      app.description.toLowerCase().includes('live')
    ) {
      enriched.realtimeSupport = true
      changes.push('Detected real-time support')
    }

    return enriched
  }

  /**
   * Enrich a Verb entity
   */
  private async enrichVerb(verb: Verb, changes: string[]): Promise<Verb> {
    const enriched = { ...verb }

    // Extract tags from description
    const keywords = extractKeywords(verb.description, { maxKeywords: 6 })
    if (keywords.length > 0) {
      enriched.tags = keywords.map(normalizeTag)
      changes.push(`Added ${keywords.length} tags`)
    }

    // Calculate complexity
    const complexity = calculateComplexity(verb.description)
    enriched.complexity = complexity
    changes.push(`Classified complexity: ${complexity}`)

    // Infer frequency
    const frequency = inferFrequency(verb.description)
    if (frequency) {
      enriched.frequency = frequency
      changes.push(`Inferred frequency: ${frequency}`)
    }

    // Infer industries from category
    if (verb.category) {
      const industries = this.inferIndustries(verb.category)
      if (industries.length > 0) {
        enriched.usedInIndustries = industries
        changes.push(`Inferred ${industries.length} industries`)
      }
    }

    return enriched
  }

  /**
   * Enrich a Disposition entity
   */
  private async enrichDisposition(disposition: Disposition, changes: string[]): Promise<Disposition> {
    const enriched = { ...disposition }

    // Extract tags from description
    const keywords = extractKeywords(disposition.description, { maxKeywords: 6 })
    if (keywords.length > 0) {
      enriched.tags = keywords.map(normalizeTag)
      changes.push(`Added ${keywords.length} tags`)
    }

    // Infer if terminal state
    const isTerminal = this.isTerminalState(disposition.name, disposition.description)
    if (isTerminal !== undefined) {
      enriched.isTerminal = isTerminal
      changes.push(`Classified as ${isTerminal ? 'terminal' : 'non-terminal'} state`)
    }

    // Infer if initial state
    const isInitial = this.isInitialState(disposition.name, disposition.description)
    if (isInitial !== undefined) {
      enriched.isInitial = isInitial
      changes.push(`Classified as ${isInitial ? 'initial' : 'non-initial'} state`)
    }

    // Infer industries from category
    if (disposition.category) {
      const industries = this.inferIndustries(disposition.category)
      if (industries.length > 0) {
        enriched.usedInIndustries = industries
        changes.push(`Inferred ${industries.length} industries`)
      }
    }

    return enriched
  }

  /**
   * Enrich an EventType entity
   */
  private async enrichEventType(eventType: EventType, changes: string[]): Promise<EventType> {
    const enriched = { ...eventType }

    // Extract tags from description
    const keywords = extractKeywords(eventType.description, { maxKeywords: 6 })
    if (keywords.length > 0) {
      enriched.tags = keywords.map(normalizeTag)
      changes.push(`Added ${keywords.length} tags`)
    }

    // Infer frequency
    const frequency = inferFrequency(eventType.description)
    if (frequency) {
      enriched.frequency = frequency
      changes.push(`Inferred frequency: ${frequency}`)
    }

    // Infer importance from description
    const importance = this.inferImportance(eventType.description)
    if (importance) {
      enriched.importance = importance
      changes.push(`Inferred importance: ${importance}`)
    }

    // Infer industries from category
    if (eventType.category) {
      const industries = this.inferIndustries(eventType.category)
      if (industries.length > 0) {
        enriched.usedInIndustries = industries
        changes.push(`Inferred ${industries.length} industries`)
      }
    }

    return enriched
  }

  /**
   * Infer industries from category text
   */
  private inferIndustries(categoryText: string): string[] {
    const industries = new Set<string>()
    const lower = categoryText.toLowerCase()

    // Check each category mapping
    for (const [category, categoryIndustries] of Object.entries(CATEGORY_TO_INDUSTRIES)) {
      if (lower.includes(category)) {
        categoryIndustries.forEach(industry => industries.add(industry))
      }
    }

    return Array.from(industries).slice(0, 5) // Limit to top 5
  }

  /**
   * Detect authentication methods from text
   */
  private detectAuthMethods(text: string): Array<'oauth2' | 'api-key' | 'basic-auth' | 'jwt' | 'custom'> {
    const methods: Array<'oauth2' | 'api-key' | 'basic-auth' | 'jwt' | 'custom'> = []
    const lower = text.toLowerCase()

    if (lower.includes('oauth') || lower.includes('o-auth')) {
      methods.push('oauth2')
    }

    if (lower.includes('api key') || lower.includes('api-key') || lower.includes('api token')) {
      methods.push('api-key')
    }

    if (lower.includes('basic auth')) {
      methods.push('basic-auth')
    }

    if (lower.includes('jwt') || lower.includes('json web token')) {
      methods.push('jwt')
    }

    return methods
  }

  /**
   * Check if state is terminal
   */
  private isTerminalState(name: string, description: string): boolean | undefined {
    const lower = `${name} ${description}`.toLowerCase()

    // Terminal indicators
    if (
      lower.includes('final') ||
      lower.includes('complete') ||
      lower.includes('finished') ||
      lower.includes('closed') ||
      lower.includes('terminated') ||
      lower.includes('end')
    ) {
      return true
    }

    // Non-terminal indicators
    if (
      lower.includes('active') ||
      lower.includes('pending') ||
      lower.includes('transit') ||
      lower.includes('progress') ||
      lower.includes('processing')
    ) {
      return false
    }

    return undefined
  }

  /**
   * Check if state is initial
   */
  private isInitialState(name: string, description: string): boolean | undefined {
    const lower = `${name} ${description}`.toLowerCase()

    // Initial indicators
    if (
      lower.includes('initial') ||
      lower.includes('new') ||
      lower.includes('created') ||
      lower.includes('start') ||
      lower.includes('begin')
    ) {
      return true
    }

    // Non-initial indicators
    if (
      lower.includes('complete') ||
      lower.includes('finished') ||
      lower.includes('final') ||
      lower.includes('closed')
    ) {
      return false
    }

    return undefined
  }

  /**
   * Infer importance from description
   */
  private inferImportance(description: string): 'low' | 'medium' | 'high' | 'critical' | undefined {
    const lower = description.toLowerCase()

    if (lower.includes('critical') || lower.includes('essential') || lower.includes('vital')) {
      return 'critical'
    }

    if (lower.includes('important') || lower.includes('significant') || lower.includes('key')) {
      return 'high'
    }

    if (lower.includes('minor') || lower.includes('supplementary') || lower.includes('optional')) {
      return 'low'
    }

    return 'medium' // Default
  }
}

/**
 * Create and export semantic enrichment service
 */
export const semanticEnricher = new SemanticEnrichmentService()
