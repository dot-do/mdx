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

/**
 * All Mappings
 */
export const mappings: ThingMapping[] = [
  onetOccupationsMapping,
  onetTasksMapping,
  naicsIndustriesMapping,
  schemaOrgTypesMapping,
]

/**
 * All Sources
 */
export const sources: SourceDefinition[] = [
  onetSource,
  naicsSource,
  schemaOrgSource,
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
