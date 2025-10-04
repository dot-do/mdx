/**
 * Mapping Configurations
 *
 * Defines concrete mappings from sources to collections.
 */

import type {
  SourceDefinition,
  CollectionConfig,
  ThingMapping,
  ImportPipelineConfig,
} from './types.js'

/**
 * Source Definitions
 */

export const onetSource: SourceDefinition = {
  id: 'onet',
  name: 'O*NET Database',
  endpoint: 'https://www.onetcenter.org/database.html',
  format: 'TSV',
  updateFrequency: 'quarterly',
  authentication: 'none',
  metadata: {
    version: '30.0',
    license: 'Public Domain',
    authority: 'U.S. Department of Labor',
  },
}

export const naicsSource: SourceDefinition = {
  id: 'naics',
  name: 'NAICS Classification System',
  endpoint: 'https://www.census.gov/naics/',
  format: 'TSV',
  updateFrequency: 'annually',
  authentication: 'none',
  metadata: {
    version: '2022',
    license: 'Public Domain',
    authority: 'U.S. Census Bureau',
  },
}

export const schemaOrgSource: SourceDefinition = {
  id: 'schema-org',
  name: 'Schema.org Vocabulary',
  endpoint: '/Users/nathanclevenger/Projects/.do/mdx/schema.org/',
  format: 'MDX',
  updateFrequency: 'continuous',
  authentication: 'none',
  metadata: {
    version: '27.01',
    license: 'CC BY-SA 3.0',
    authority: 'W3C Community Group',
  },
}

export const zapierSource: SourceDefinition = {
  id: 'zapier',
  name: 'Zapier Platform API',
  endpoint: 'https://zapier.com/api/v4/',
  format: 'JSON',
  updateFrequency: 'continuous',
  authentication: 'none',
  metadata: {
    version: '4.0',
    license: 'API Terms of Service',
    authority: 'Zapier Inc.',
  },
}

export const gs1Source: SourceDefinition = {
  id: 'gs1',
  name: 'GS1 Core Business Vocabulary',
  endpoint: 'https://ref.gs1.org/cbv/',
  format: 'JSON',
  updateFrequency: 'annually',
  authentication: 'none',
  metadata: {
    version: '2.0',
    license: 'GS1 General Specifications',
    authority: 'GS1 Global',
  },
}

/**
 * Collection Configurations
 */

export const collections: CollectionConfig[] = [
  // O*NET Collections
  {
    name: 'Occupations',
    path: 'collections/Occupations',
    expectedCount: 900,
    description: 'O*NET occupation profiles',
  },
  {
    name: 'Tasks',
    path: 'collections/Tasks',
    expectedCount: 20000,
    description: 'Work tasks and activities',
  },
  {
    name: 'Skills',
    path: 'collections/Skills',
    expectedCount: 35,
    description: 'Skill types with occupation mappings',
  },
  {
    name: 'Abilities',
    path: 'collections/Abilities',
    expectedCount: 52,
    description: 'Ability types with occupation mappings',
  },
  {
    name: 'Knowledge',
    path: 'collections/Knowledge',
    expectedCount: 33,
    description: 'Knowledge areas',
  },

  // NAICS Collections
  {
    name: 'Industries',
    path: 'collections/Industries',
    expectedCount: 1000,
    description: 'NAICS industry classifications',
  },

  // Schema.org Collections
  {
    name: 'Types',
    path: 'collections/Types',
    expectedCount: 800,
    description: 'Schema.org type vocabulary',
  },
  {
    name: 'Properties',
    path: 'collections/Properties',
    expectedCount: 1400,
    description: 'Schema.org property definitions',
  },

  // GraphDL/Zapier Unified Collections
  {
    name: 'Nouns',
    path: 'collections/Nouns',
    expectedCount: 500,
    description: 'Business entity types (GraphDL + Zapier)',
  },
  {
    name: 'Verbs',
    path: 'collections/Verbs',
    expectedCount: 300,
    description: 'Business actions and functions (GraphDL + Zapier + GS1)',
  },
  {
    name: 'Graphs',
    path: 'collections/Graphs',
    expectedCount: 100,
    description: 'GraphDL graph definitions',
  },

  // Zapier Collections
  {
    name: 'Apps',
    path: 'collections/Apps',
    expectedCount: 7000,
    description: 'Zapier integration applications',
  },
  {
    name: 'Triggers',
    path: 'collections/Triggers',
    expectedCount: 2000,
    description: 'Zapier trigger definitions',
  },
  {
    name: 'Searches',
    path: 'collections/Searches',
    expectedCount: 1000,
    description: 'Zapier search actions',
  },
  {
    name: 'Actions',
    path: 'collections/Actions',
    expectedCount: 3000,
    description: 'Zapier action definitions',
  },

  // GS1 CBV Collections
  {
    name: 'Dispositions',
    path: 'collections/Dispositions',
    expectedCount: 50,
    description: 'GS1 business object dispositions',
  },
  {
    name: 'EventTypes',
    path: 'collections/EventTypes',
    expectedCount: 20,
    description: 'GS1 event type classifications',
  },
]

/**
 * Slug Generator (Wikipedia-style)
 *
 * Preserves Title Case and replaces spaces with underscores
 * Example: "Software Developers, Applications" -> "Software_Developers_Applications"
 */
export function generateSlug(text: string): string {
  // Replace spaces with underscores
  let slug = text.replace(/\s+/g, '_')

  // Remove or replace other URL-unsafe characters
  slug = slug.replace(/[,\/\\]/g, '') // Remove commas, slashes
  slug = slug.replace(/[()]/g, '') // Remove parentheses
  slug = slug.replace(/&/g, 'and') // Replace ampersand
  slug = slug.replace(/_+/g, '_') // Collapse multiple underscores
  slug = slug.replace(/^_|_$/g, '') // Remove leading/trailing underscores

  return slug
}

/**
 * Thing Mappings
 */

// O*NET: Occupations
export const onetOccupationsMapping: ThingMapping = {
  id: 'onet-occupations',
  sourceId: 'onet',
  collection: 'Occupations',
  transform: async (data: any) => {
    const code = data['O*NET-SOC Code']
    const title = data['Title']
    const description = data['Description']

    return {
      slug: generateSlug(title),
      frontmatter: {
        code,
        title,
        description,
        collection: 'Occupations',
        source: 'onet',
        version: '30.0',
        alternativeTitles: [],
        taskCount: 0,
        skillCount: 0,
        abilityCount: 0,
        relatedOccupations: [],
      },
      content: `
# ${title}

**O*NET-SOC Code:** \`${code}\`

## Description

${description}

## Overview

This occupation is part of the O*NET database, which provides comprehensive occupational information.

## Tasks

See [[../../Tasks|Tasks]] collection for detailed work activities.

## Required Skills

See [[../../Skills|Skills]] collection for skill requirements.

## Required Abilities

See [[../../Abilities|Abilities]] collection for ability requirements.

## Knowledge Areas

See [[../../Knowledge|Knowledge]] collection for required knowledge.

## Related Occupations

*To be populated with similar occupations*

## Labor Market Information

- **Employment:** Data from Bureau of Labor Statistics
- **Wages:** Median annual wage data
- **Growth:** Projected growth rate

## References

- [O*NET Online](https://www.onetonline.org/link/summary/${code})
- [Occupation Data](https://www.onetcenter.org/)
`.trim(),
    }
  },
}

// O*NET: Tasks
export const onetTasksMapping: ThingMapping = {
  id: 'onet-tasks',
  sourceId: 'onet',
  collection: 'Tasks',
  transform: async (data: any) => {
    const taskId = data['Task ID']
    const occupationCode = data['O*NET-SOC Code']
    const statement = data['Task']
    const taskType = data['Task Type']
    const incumbentsResponding = parseFloat(data['Incumbents Responding'] || '0')

    // Generate slug from task statement
    const slug = generateSlug(statement.substring(0, 80))

    return {
      slug,
      frontmatter: {
        taskId,
        occupationCode,
        occupationTitle: '', // Will be populated via lookup
        statement,
        taskType,
        incumbentsResponding,
        collection: 'Tasks',
        source: 'onet',
      },
      content: `
# ${statement}

**Task ID:** ${taskId}
**Occupation:** [[../Occupations|Occupation]] with code \`${occupationCode}\`

## Task Statement

> ${statement}

## Details

- **Type:** ${taskType}
- **Performed By:** ${incumbentsResponding.toFixed(1)}% of incumbents

## Context

This task is part of the standard duties performed in this occupation. The percentage indicates how common this task is among workers in the field.

## Related Information

- **Skills Required:** See [[../Skills|Skills]] collection
- **Abilities Required:** See [[../Abilities|Abilities]] collection
- **Knowledge Required:** See [[../Knowledge|Knowledge]] collection
`.trim(),
    }
  },
}

// NAICS: Industries
export const naicsIndustriesMapping: ThingMapping = {
  id: 'naics-industries',
  sourceId: 'naics',
  collection: 'Industries',
  transform: async (data: any) => {
    const naicsCode = data.naics || data['NAICS Code']
    const title = data.industry || data['NAICS Title']
    const level = naicsCode?.length || 0
    const parentCode = level > 2 ? naicsCode.substring(0, level - 1) : undefined
    const sectorCode = naicsCode?.substring(0, 2) || ''

    return {
      slug: generateSlug(title),
      frontmatter: {
        naicsCode,
        title,
        level,
        parentCode,
        sectorCode,
        sectorTitle: '', // Will be populated via lookup
        collection: 'Industries',
        source: 'naics',
        version: '2022',
        children: [],
        occupations: [],
      },
      content: `
# ${title}

**NAICS Code:** \`${naicsCode}\` (${level}-digit ${level === 2 ? 'Sector' : level === 3 ? 'Subsector' : level === 4 ? 'Industry Group' : level === 5 ? 'NAICS Industry' : 'National Industry'})

## Classification

${parentCode ? `- **Parent Industry:** [[../${parentCode}|Parent]]` : '- **Level:** Sector (top level)'}
- **Sector:** ${sectorCode}

## Description

This industry is part of the North American Industry Classification System (NAICS), which provides a uniform framework for classifying business establishments.

## Related Occupations

See [[../Occupations|Occupations]] collection for jobs typically found in this industry.

## Statistics

*To be enriched with Bureau of Labor Statistics employment data*

## References

- [NAICS Definition](https://www.census.gov/naics/)
- [Industry Examples](https://www.census.gov/naics/2022NAICS/)
`.trim(),
    }
  },
}

// Schema.org: Types
export const schemaOrgTypesMapping: ThingMapping = {
  id: 'schema-org-types',
  sourceId: 'schema-org',
  collection: 'Types',
  transform: async (data: any) => {
    const schemaId = data.$id
    const label = data.label

    // Handle description - might not be a string
    let description = ''
    if (typeof data.comment === 'string') {
      description = data.comment.trim()
    } else if (data.comment) {
      description = String(data.comment)
    }

    // Handle parent URL - might be array or non-string
    let parentUrl = 'https://schema.org/Thing'
    if (typeof data['rdfs:subClassOf'] === 'string') {
      parentUrl = data['rdfs:subClassOf']
    } else if (Array.isArray(data['rdfs:subClassOf']) && data['rdfs:subClassOf'].length > 0) {
      // If array, take the first URL
      parentUrl = typeof data['rdfs:subClassOf'][0] === 'string'
        ? data['rdfs:subClassOf'][0]
        : 'https://schema.org/Thing'
    }

    const parentType = parentUrl.split('/').pop() || 'Thing'

    return {
      slug: generateSlug(label),
      frontmatter: {
        schemaId,
        label,
        description,
        parentType,
        parentUrl,
        collection: 'Types',
        source: 'schema.org',
        version: '27.01',
        properties: [],
        subTypes: [],
        relatedOccupations: [],
        relatedIndustries: [],
      },
      content: `
# ${label}

**Schema.org Type:** [\`${label}\`](${schemaId})
**Parent Type:** [[../${generateSlug(parentType)}|${parentType}]]

## Description

${description}

## Properties

*Properties inherited from [[../${generateSlug(parentType)}|${parentType}]] and specific to this type*

See [[../Properties|Properties]] collection for detailed property definitions.

## Sub-Types

*Types that extend this type*

## Usage Examples

### JSON-LD

\`\`\`json
{
  "@context": "https://schema.org",
  "@type": "${label}",
  "name": "Example ${label}",
  "description": "Description here"
}
\`\`\`

### TypeScript

\`\`\`typescript
import { ${label} } from 'schema.org.ai'

const item: ${label} = {
  '@type': '${label}',
  name: 'Example ${label}',
  description: 'Description here',
}
\`\`\`

## References

- [Schema.org Documentation](${schemaId})
- [Schema.org Full Hierarchy](https://schema.org/docs/full.html)
`.trim(),
    }
  },
}

// GS1: Verbs (Business Steps)
export const gs1VerbsMapping: ThingMapping = {
  id: 'gs1-verbs',
  sourceId: 'gs1',
  collection: 'Verbs',
  transform: async (data: any) => {
    const verbId = data.id
    const description = data.description

    return {
      slug: generateSlug(verbId),
      frontmatter: {
        id: verbId,
        name: verbId,
        description,
        collection: 'Verbs',
        source: 'gs1',
        category: 'supply-chain',
        cbvType: 'bizStep',
        url: `https://ref.gs1.org/cbv/BizStep-${verbId.replace(/\s+/g, '')}`,
      },
      content: `
# ${verbId}

**GS1 Business Step**

## Description

${description}

## Category

Supply Chain Operations

## Usage

This business step is part of the GS1 Core Business Vocabulary (CBV) 2.0 standard. It is used in EPCIS events to indicate the business context of supply chain activities.

## Related Standards

- **GS1 CBV 2.0**: [Core Business Vocabulary](https://ref.gs1.org/standards/cbv/)
- **EPCIS 2.0**: [Event Processing Standard](https://ref.gs1.org/standards/epcis/)

## References

- [Official GS1 Definition](https://ref.gs1.org/cbv/BizStep-${verbId.replace(/\s+/g, '')})
- [GS1 Standards Documentation](https://www.gs1.org/standards)
`.trim(),
    }
  },
}

// GS1: Dispositions
export const gs1DispositionsMapping: ThingMapping = {
  id: 'gs1-dispositions',
  sourceId: 'gs1',
  collection: 'Dispositions',
  transform: async (data: any) => {
    const dispId = data.id
    const description = data.description

    return {
      slug: generateSlug(dispId),
      frontmatter: {
        id: dispId,
        name: dispId,
        description,
        collection: 'Dispositions',
        source: 'gs1',
        category: 'object-state',
        cbvType: 'disposition',
        url: `https://ref.gs1.org/cbv/Disp-${dispId.replace(/\s+/g, '')}`,
      },
      content: `
# ${dispId}

**GS1 Business Object Disposition**

## Description

${description}

## Category

Object State Management

## Usage

This disposition value is part of the GS1 Core Business Vocabulary (CBV) 2.0 standard. It is used in EPCIS events to indicate the business state or condition of objects in the supply chain.

## Related Standards

- **GS1 CBV 2.0**: [Core Business Vocabulary](https://ref.gs1.org/standards/cbv/)
- **EPCIS 2.0**: [Event Processing Standard](https://ref.gs1.org/standards/epcis/)

## References

- [Official GS1 Definition](https://ref.gs1.org/cbv/Disp-${dispId.replace(/\s+/g, '')})
- [GS1 Standards Documentation](https://www.gs1.org/standards)
`.trim(),
    }
  },
}

// Zapier: Apps
export const zapierAppsMapping: ThingMapping = {
  id: 'zapier-apps',
  sourceId: 'zapier',
  collection: 'Apps',
  transform: async (data: any) => {
    const appKey = data.key || data.id
    const title = data.title || data.name
    const description = data.description || ''
    const image = data.image || data.images?.url_128x128 || ''
    const hexColor = data.hex_color || data.hexColor || '#000000'
    const categories = Array.isArray(data.categories) ? data.categories.map((c: any) => c.title || c).join(', ') : ''
    const apiUrl = data.api || ''

    return {
      slug: generateSlug(title),
      frontmatter: {
        key: appKey,
        title,
        description,
        image,
        hexColor,
        categories,
        apiUrl,
        collection: 'Apps',
        source: 'zapier',
        type: 'Integration',
        zapierUrl: `https://zapier.com/apps/${appKey}`,
      },
      content: `
# ${title}

**Zapier Integration App**

## Description

${description}

## Categories

${categories || 'General'}

## Features

This app can be integrated with 7,000+ other apps on Zapier to automate workflows without code.

### Available Integrations

- **Triggers**: Events that start automated workflows
- **Actions**: Operations performed when triggered
- **Searches**: Find existing data in the app

## Getting Started

1. [Connect ${title} to Zapier](https://zapier.com/apps/${appKey})
2. Choose a trigger or action
3. Connect your ${title} account
4. Configure your automation
5. Test and activate your Zap

## Popular Use Cases

Automate common workflows by connecting ${title} with other apps:

- Sync data between ${title} and your CRM
- Create notifications when new items are added
- Back up ${title} data to cloud storage
- Generate reports from ${title} data

## Resources

- [${title} on Zapier](https://zapier.com/apps/${appKey})
- [Integration Documentation](https://zapier.com/apps/${appKey}/integrations)
- [API Documentation](${apiUrl || 'Contact app developer'})

## Related Apps

Browse similar apps in the ${categories} category on Zapier.
`.trim(),
    }
  },
}

// GS1: Event Types
export const gs1EventTypesMapping: ThingMapping = {
  id: 'gs1-eventtypes',
  sourceId: 'gs1',
  collection: 'EventTypes',
  transform: async (data: any) => {
    const eventId = data.id
    const description = data.description
    const dimensions = data.dimensions || ''

    return {
      slug: generateSlug(eventId),
      frontmatter: {
        id: eventId,
        name: eventId,
        description,
        dimensions,
        collection: 'EventTypes',
        source: 'gs1',
        category: 'epcis',
        epcisVersion: '2.0',
        url: `https://ref.gs1.org/epcis/${eventId.replace(/\s+/g, '')}`,
      },
      content: `
# ${eventId}

**EPCIS 2.0 Event Type**

## Description

${description}

## Event Dimensions

${dimensions}

## Category

Supply Chain Event Tracking

## Usage

This event type is part of the EPCIS 2.0 standard for recording supply chain events. EPCIS (Electronic Product Code Information Services) enables trading partners to share information about the physical movement and status of products.

## EPCIS Model: The 5 W's + How

- **What**: Identifies objects involved
- **When**: Timestamp of the event
- **Where**: Location information
- **Why**: Business context (bizStep, disposition)
- **Who**: Trading partners involved
- **How**: Action performed

## Related Standards

- **EPCIS 2.0**: [Event Processing Standard](https://ref.gs1.org/standards/epcis/)
- **GS1 CBV 2.0**: [Core Business Vocabulary](https://ref.gs1.org/standards/cbv/)

## References

- [Official EPCIS Definition](https://ref.gs1.org/epcis/${eventId.replace(/\s+/g, '')})
- [EPCIS Documentation](https://www.gs1.org/standards/epcis)
`.trim(),
    }
  },
}

/**
 * All Mappings
 */
export const mappings: ThingMapping[] = [
  onetOccupationsMapping,
  onetTasksMapping,
  naicsIndustriesMapping,
  schemaOrgTypesMapping,
  zapierAppsMapping,
  gs1VerbsMapping,
  gs1DispositionsMapping,
  gs1EventTypesMapping,
]

/**
 * All Sources
 */
export const sources: SourceDefinition[] = [
  onetSource,
  naicsSource,
  schemaOrgSource,
  zapierSource,
  gs1Source,
]

/**
 * Complete Pipeline Configuration
 */
export function createPipelineConfig(outputDir: string): ImportPipelineConfig {
  return {
    sources,
    collections,
    mappings,
    outputDir,
    options: {
      parallel: false,
      concurrency: 5,
      skipExisting: false,
      dryRun: false,
      verbose: true,
    },
  }
}
