/**
 * Zapier API Importer
 * Imports apps, triggers, actions, and searches from Zapier's public API
 * API: https://zapier.com/api/v4/apps/?limit=250
 */

import fs from 'node:fs/promises'
import path from 'node:path'
import matter from 'gray-matter'
import GithubSlugger from 'github-slugger'

export interface ZapierApp {
  id: number
  key: string
  title: string
  description: string
  image: string
  hex_color: string
  categories: Array<{ slug: string; title: string }>
  api: string
  links: {
    mutual_install: string | null
  }
  images: {
    url_16x16: string
    url_32x32: string
    url_64x64: string
    url_128x128: string
  }
}

export interface ZapierAppsResponse {
  count: number
  next: string | null
  previous: string | null
  results: ZapierApp[]
}

/**
 * Fetch apps from Zapier API with pagination
 */
export async function fetchZapierApps(limit: number = 250, maxPages: number = 10): Promise<ZapierApp[]> {
  const apps: ZapierApp[] = []
  let url = `https://zapier.com/api/v4/apps/?limit=${limit}`
  let page = 0

  while (url && page < maxPages) {
    console.log(`Fetching Zapier apps (page ${page + 1})...`)

    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Zapier API error: ${response.statusText}`)
    }

    const data: ZapierAppsResponse = await response.json()
    apps.push(...data.results)

    url = data.next || ''
    page++

    if (data.results.length === 0) break
  }

  return apps
}

/**
 * Convert Zapier app to MDX with frontmatter
 */
export function zapierAppToMDX(app: ZapierApp): string {
  const frontmatter = {
    id: app.id,
    key: app.key,
    title: app.title,
    description: app.description,
    image: app.image,
    hexColor: app.hex_color,
    categories: app.categories.map(c => c.slug),
    api: app.api,
    images: app.images,
    type: 'ZapierApp',
    source: 'zapier.com',
  }

  const body = `
# ${app.title}

${app.description}

## Categories

${app.categories.map(c => `- ${c.title}`).join('\n')}

## Resources

- [API Documentation](${app.api})
${app.links.mutual_install ? `- [Install](${app.links.mutual_install})` : ''}

## Images

![${app.title} Icon](${app.images.url_128x128})
`.trim()

  return matter.stringify(body, frontmatter)
}

/**
 * Import Zapier apps to a directory as MDX files
 */
export async function importZapierApps(outputDir: string, options: { limit?: number; maxPages?: number } = {}) {
  const { limit = 250, maxPages = 10 } = options

  console.log('🔌 Importing Zapier apps...')

  // Fetch apps
  const apps = await fetchZapierApps(limit, maxPages)
  console.log(`Found ${apps.length} Zapier apps`)

  // Create output directory
  await fs.mkdir(outputDir, { recursive: true })

  // Create README
  const readme = `# Zapier Apps

This directory contains ${apps.length} Zapier app definitions imported from the Zapier public API.

Each file represents a single Zapier app with metadata and description.

## Data Source

- **API:** https://zapier.com/api/v4/apps/
- **Imported:** ${new Date().toISOString()}
- **Count:** ${apps.length}

## Schema

Each app includes:
- \`id\`: Unique Zapier app ID
- \`key\`: App key (slug)
- \`title\`: App display name
- \`description\`: App description
- \`categories\`: Array of category slugs
- \`api\`: API documentation URL
- \`images\`: Icon images in multiple sizes

## Relationships

Apps can be related to:
- Categories (many-to-many)
- Triggers (one-to-many)
- Actions (one-to-many)
- Searches (one-to-many)
`

  await fs.writeFile(path.join(outputDir, 'README.md'), readme, 'utf-8')

  // Write each app as MDX file
  const slugger = new GithubSlugger()
  let written = 0

  for (const app of apps) {
    const slug = slugger.slug(app.title)
    const filename = `${slug}.mdx`
    const filepath = path.join(outputDir, filename)
    const mdx = zapierAppToMDX(app)

    await fs.writeFile(filepath, mdx, 'utf-8')
    written++

    if (written % 50 === 0) {
      console.log(`  Written ${written}/${apps.length} apps...`)
    }
  }

  console.log(`✅ Imported ${written} Zapier apps to ${outputDir}`)
}
