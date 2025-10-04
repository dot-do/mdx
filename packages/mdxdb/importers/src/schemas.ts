/**
 * Collection Schema Definitions
 *
 * Defines the frontmatter schema for each collection type,
 * including fields for AI enrichment and generation.
 */

import { z } from 'zod'

/**
 * Base schema shared by all collections
 */
export const baseSchema = z.object({
  // Core identification
  id: z.string().describe('Unique identifier (Wikipedia-style slug)'),
  name: z.string().describe('Human-readable name'),
  title: z.string().optional().describe('Display title (may differ from name)'),
  description: z.string().describe('Brief description (1-3 sentences)'),

  // Collection metadata
  collection: z.string().describe('Collection name'),
  source: z.string().describe('Data source ID (zapier, gs1, onet, etc)'),
  type: z.string().optional().describe('Entity type classification'),

  // JSON-LD / Schema.org
  '@context': z.string().optional().describe('JSON-LD context URL'),
  '@type': z.string().optional().describe('Schema.org type'),

  // URLs and references
  url: z.string().url().optional().describe('Canonical URL'),
  image: z.string().url().optional().describe('Primary image URL'),
  logo: z.string().url().optional().describe('Logo image URL'),

  // AI enrichment metadata
  aiEnriched: z.boolean().optional().describe('Whether AI has enriched this content'),
  lastEnriched: z.string().datetime().optional().describe('ISO 8601 timestamp of last AI enrichment'),
  enrichmentVersion: z.string().optional().describe('Version of enrichment schema used'),

  // Embeddings for semantic search
  embeddings: z
    .object({
      model: z.string().describe('Embedding model used'),
      vector: z.array(z.number()).optional().describe('Embedding vector'),
      hash: z.string().optional().describe('Content hash for cache invalidation'),
    })
    .optional(),

  // Timestamps
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
})

/**
 * Apps Collection Schema (Zapier, integrations, SaaS products)
 */
export const appsSchema = baseSchema.extend({
  // App-specific core fields
  key: z.union([z.string(), z.number()]).describe('Zapier app key or unique identifier'),
  title: z.string().describe('App display name'),
  hexColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().describe('Brand hex color'),
  categories: z.union([z.string(), z.array(z.string())]).optional().describe('App categories'),

  // Integration metadata
  apiUrl: z.string().url().optional().describe('API endpoint URL'),
  zapierUrl: z.string().url().optional().describe('Zapier app page URL'),
  websiteUrl: z.string().url().optional().describe('App official website'),
  documentationUrl: z.string().url().optional().describe('API/integration documentation'),

  // AI-enrichable fields
  tags: z.array(z.string()).optional().describe('Topic tags (AI-generated)'),
  industries: z.array(z.string()).optional().describe('Industries using this app (AI-inferred)'),
  useCases: z
    .array(
      z.object({
        title: z.string(),
        description: z.string(),
        industry: z.string().optional(),
        complexity: z.enum(['simple', 'moderate', 'complex']).optional(),
      })
    )
    .optional()
    .describe('Common use cases (AI-generated)'),

  features: z
    .array(
      z.object({
        name: z.string(),
        description: z.string(),
        category: z.string().optional(),
      })
    )
    .optional()
    .describe('Key features (AI-extracted)'),

  relatedApps: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        relationship: z.enum(['alternative', 'complement', 'competitor', 'integration']),
        reason: z.string().optional(),
      })
    )
    .optional()
    .describe('Related applications (AI-inferred)'),

  // Popularity and metrics
  popularity: z
    .object({
      zapierRank: z.number().optional(),
      userCount: z.string().optional(),
      rating: z.number().optional(),
      reviewCount: z.number().optional(),
    })
    .optional(),

  integrationCount: z.number().optional().describe('Number of available integrations'),

  // Pricing
  pricing: z
    .object({
      model: z.enum(['free', 'freemium', 'subscription', 'usage-based', 'enterprise']).optional(),
      startingPrice: z.string().optional(),
      currency: z.string().optional(),
    })
    .optional()
    .describe('Pricing information (AI-researched)'),

  // Technical details
  authentication: z
    .array(z.enum(['oauth2', 'api-key', 'basic-auth', 'jwt', 'custom']))
    .optional()
    .describe('Supported authentication methods'),

  webhookSupport: z.boolean().optional().describe('Whether app supports webhooks'),
  realtimeSupport: z.boolean().optional().describe('Whether app supports real-time updates'),

  // Content sections for MDX
  sections: z
    .object({
      overview: z.string().optional(),
      features: z.string().optional(),
      useCases: z.string().optional(),
      integration: z.string().optional(),
      pricing: z.string().optional(),
      alternatives: z.string().optional(),
    })
    .optional()
    .describe('Markdown sections (AI-generated)'),
})

/**
 * Verbs Collection Schema (Actions, functions, business steps)
 */
export const verbsSchema = baseSchema.extend({
  // Verb-specific fields
  category: z.string().optional().describe('Action category'),
  cbvType: z.string().optional().describe('GS1 CBV type (bizStep, etc)'),

  // Semantic relationships
  synonyms: z.array(z.string()).optional().describe('Alternative names (AI-generated)'),
  antonyms: z.array(z.string()).optional().describe('Opposite actions (AI-generated)'),
  relatedVerbs: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        relationship: z.enum(['similar', 'broader', 'narrower', 'sequence', 'alternative']),
        reason: z.string().optional(),
      })
    )
    .optional()
    .describe('Related actions (AI-inferred)'),

  // Context and usage
  usedInIndustries: z.array(z.string()).optional().describe('Industries using this action (AI-inferred)'),
  usedInProcesses: z.array(z.string()).optional().describe('Business processes using this action (AI-inferred)'),

  examples: z
    .array(
      z.object({
        scenario: z.string(),
        description: z.string(),
        industry: z.string().optional(),
        outcome: z.string().optional(),
      })
    )
    .optional()
    .describe('Real-world examples (AI-generated)'),

  // Process flow
  prerequisites: z
    .array(
      z.object({
        condition: z.string(),
        verbId: z.string().optional(),
        required: z.boolean().optional(),
      })
    )
    .optional()
    .describe('What must happen before (AI-inferred)'),

  outcomes: z
    .array(
      z.object({
        result: z.string(),
        verbId: z.string().optional(),
        probability: z.enum(['certain', 'likely', 'possible']).optional(),
      })
    )
    .optional()
    .describe('What happens after (AI-inferred)'),

  // Classification
  tags: z.array(z.string()).optional().describe('Topic tags (AI-generated)'),
  complexity: z.enum(['simple', 'moderate', 'complex']).optional().describe('Action complexity (AI-assessed)'),
  frequency: z.enum(['rare', 'occasional', 'frequent', 'continuous']).optional().describe('How often performed (AI-estimated)'),

  // Technical implementation
  implementations: z
    .array(
      z.object({
        platform: z.string(),
        method: z.string(),
        example: z.string().optional(),
      })
    )
    .optional()
    .describe('Technical implementations (AI-generated)'),

  // Standards compliance
  standards: z
    .array(
      z.object({
        name: z.string(),
        url: z.string().url().optional(),
        version: z.string().optional(),
      })
    )
    .optional()
    .describe('Related standards'),
})

/**
 * Dispositions Collection Schema (Object states, statuses)
 */
export const dispositionsSchema = baseSchema.extend({
  // Disposition-specific fields
  category: z.string().optional().describe('State category'),
  cbvType: z.string().optional().describe('GS1 CBV type (disposition)'),

  // State transitions
  transitionsFrom: z
    .array(
      z.object({
        dispositionId: z.string(),
        dispositionName: z.string(),
        trigger: z.string().optional(),
        conditions: z.array(z.string()).optional(),
      })
    )
    .optional()
    .describe('Possible previous states (AI-inferred)'),

  transitionsTo: z
    .array(
      z.object({
        dispositionId: z.string(),
        dispositionName: z.string(),
        trigger: z.string().optional(),
        conditions: z.array(z.string()).optional(),
      })
    )
    .optional()
    .describe('Possible next states (AI-inferred)'),

  // Context
  usedInIndustries: z.array(z.string()).optional().describe('Industries using this state (AI-inferred)'),
  appliesTo: z.array(z.string()).optional().describe('Types of objects this state applies to (AI-inferred)'),

  examples: z
    .array(
      z.object({
        scenario: z.string(),
        objectType: z.string(),
        industry: z.string().optional(),
      })
    )
    .optional()
    .describe('Real-world examples (AI-generated)'),

  // Classification
  tags: z.array(z.string()).optional().describe('Topic tags (AI-generated)'),
  isTerminal: z.boolean().optional().describe('Whether this is an end state (AI-inferred)'),
  isInitial: z.boolean().optional().describe('Whether this is a starting state (AI-inferred)'),

  // Business implications
  implications: z
    .array(
      z.object({
        type: z.enum(['financial', 'operational', 'legal', 'quality', 'security']),
        description: z.string(),
        severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
      })
    )
    .optional()
    .describe('Business implications of this state (AI-analyzed)'),

  // Standards
  standards: z
    .array(
      z.object({
        name: z.string(),
        url: z.string().url().optional(),
        version: z.string().optional(),
      })
    )
    .optional(),
})

/**
 * EventTypes Collection Schema (EPCIS events, logging events)
 */
export const eventTypesSchema = baseSchema.extend({
  // Event-specific fields
  category: z.string().optional().describe('Event category'),
  dimensions: z.string().optional().describe('Event dimensions (What, When, Where, Why, How)'),

  // Event structure
  requiredFields: z
    .array(
      z.object({
        field: z.string(),
        type: z.string(),
        description: z.string(),
      })
    )
    .optional()
    .describe('Required fields for this event type (AI-documented)'),

  optionalFields: z
    .array(
      z.object({
        field: z.string(),
        type: z.string(),
        description: z.string(),
      })
    )
    .optional()
    .describe('Optional fields for this event type (AI-documented)'),

  // Context
  usedInIndustries: z.array(z.string()).optional().describe('Industries using this event (AI-inferred)'),
  usedInProcesses: z.array(z.string()).optional().describe('Business processes using this event (AI-inferred)'),

  examples: z
    .array(
      z.object({
        scenario: z.string(),
        description: z.string(),
        industry: z.string().optional(),
        jsonExample: z.string().optional(),
      })
    )
    .optional()
    .describe('Event examples (AI-generated)'),

  // Relationships
  relatedEvents: z
    .array(
      z.object({
        eventTypeId: z.string(),
        eventTypeName: z.string(),
        relationship: z.enum(['precedes', 'follows', 'contains', 'alternative']),
        reason: z.string().optional(),
      })
    )
    .optional()
    .describe('Related event types (AI-inferred)'),

  // Classification
  tags: z.array(z.string()).optional(),
  frequency: z.enum(['rare', 'occasional', 'frequent', 'continuous']).optional(),
  importance: z.enum(['low', 'medium', 'high', 'critical']).optional(),

  // Technical details
  format: z.string().optional().describe('Event data format (JSON, XML, etc)'),
  schema: z.string().optional().describe('JSON schema or XSD URL'),

  // Standards
  standards: z
    .array(
      z.object({
        name: z.string(),
        url: z.string().url().optional(),
        version: z.string().optional(),
      })
    )
    .optional(),
})

/**
 * Nouns Collection Schema (Business entities, concepts)
 */
export const nounsSchema = baseSchema.extend({
  // Noun-specific fields
  category: z.string().optional().describe('Entity category'),
  isAbstract: z.boolean().optional().describe('Whether this is an abstract concept'),

  // Semantic relationships
  synonyms: z.array(z.string()).optional().describe('Alternative names (AI-generated)'),
  hypernyms: z.array(z.string()).optional().describe('More general terms (AI-inferred)'),
  hyponyms: z.array(z.string()).optional().describe('More specific terms (AI-inferred)'),
  meronyms: z.array(z.string()).optional().describe('Parts of this entity (AI-inferred)'),
  holonyms: z.array(z.string()).optional().describe('Wholes this is part of (AI-inferred)'),

  // Attributes
  attributes: z
    .array(
      z.object({
        name: z.string(),
        type: z.string(),
        description: z.string(),
        required: z.boolean().optional(),
      })
    )
    .optional()
    .describe('Entity attributes (AI-documented)'),

  // Relationships
  relatedNouns: z
    .array(
      z.object({
        nounId: z.string(),
        nounName: z.string(),
        relationship: z.enum(['similar', 'opposite', 'contains', 'part-of', 'used-with']),
        reason: z.string().optional(),
      })
    )
    .optional()
    .describe('Related entities (AI-inferred)'),

  // Context
  usedInIndustries: z.array(z.string()).optional().describe('Industries using this entity (AI-inferred)'),
  usedInDomains: z.array(z.string()).optional().describe('Business domains using this entity (AI-inferred)'),

  examples: z
    .array(
      z.object({
        instance: z.string(),
        description: z.string(),
        context: z.string().optional(),
      })
    )
    .optional()
    .describe('Example instances (AI-generated)'),

  // Classification
  tags: z.array(z.string()).optional(),

  // Technical implementation
  representations: z
    .array(
      z.object({
        format: z.string(),
        schema: z.string().optional(),
        example: z.string().optional(),
      })
    )
    .optional()
    .describe('Data representations (AI-generated)'),
})

/**
 * Export schema map for easy lookup
 */
export const collectionSchemas = {
  Apps: appsSchema,
  Verbs: verbsSchema,
  Dispositions: dispositionsSchema,
  EventTypes: eventTypesSchema,
  Nouns: nounsSchema,
} as const

/**
 * Export types inferred from schemas
 */
export type BaseEntity = z.infer<typeof baseSchema>
export type App = z.infer<typeof appsSchema>
export type Verb = z.infer<typeof verbsSchema>
export type Disposition = z.infer<typeof dispositionsSchema>
export type EventType = z.infer<typeof eventTypesSchema>
export type Noun = z.infer<typeof nounsSchema>

/**
 * Union type for all collection entities
 */
export type CollectionEntity = App | Verb | Disposition | EventType | Noun

/**
 * Helper function to validate frontmatter against schema
 */
export function validateFrontmatter(collection: string, frontmatter: unknown): CollectionEntity {
  const schema = collectionSchemas[collection as keyof typeof collectionSchemas]
  if (!schema) {
    throw new Error(`Unknown collection: ${collection}`)
  }
  return schema.parse(frontmatter) as CollectionEntity
}

/**
 * Helper to get schema for a collection
 */
export function getCollectionSchema(collection: string) {
  return collectionSchemas[collection as keyof typeof collectionSchemas]
}
