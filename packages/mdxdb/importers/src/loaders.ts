/**
 * Source Data Loaders
 *
 * Implements loading data from various source formats.
 */

import fs from 'node:fs/promises'
import path from 'node:path'
import { parse } from 'csv-parse/sync'
import matter from 'gray-matter'
import type { SourceDefinition } from './types.js'

/**
 * Load data from a TSV/CSV source
 */
export async function loadTSV(source: SourceDefinition, filePath: string): Promise<any[]> {
  console.log(`  Loading TSV data from ${filePath}...`)

  // Check if file exists locally
  const fileExists = await fs
    .access(filePath)
    .then(() => true)
    .catch(() => false)

  if (!fileExists) {
    console.warn(`  ⚠️  File not found: ${filePath}`)
    return []
  }

  // Read file content
  const content = await fs.readFile(filePath, 'utf-8')

  // Parse TSV
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    delimiter: '\t', // TSV uses tabs
    relax_column_count: true, // Allow inconsistent column counts
  })

  console.log(`  ✓ Loaded ${records.length} records`)

  return records
}

/**
 * Load data from CSV source
 */
export async function loadCSV(source: SourceDefinition, filePath: string): Promise<any[]> {
  console.log(`  Loading CSV data from ${filePath}...`)

  const fileExists = await fs
    .access(filePath)
    .then(() => true)
    .catch(() => false)

  if (!fileExists) {
    console.warn(`  ⚠️  File not found: ${filePath}`)
    return []
  }

  const content = await fs.readFile(filePath, 'utf-8')

  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    delimiter: ',', // CSV uses commas
    relax_column_count: true,
  })

  console.log(`  ✓ Loaded ${records.length} records`)

  return records
}

/**
 * Load data from MDX files
 */
export async function loadMDX(source: SourceDefinition, dirPath: string): Promise<any[]> {
  console.log(`  Loading MDX files from ${dirPath}...`)

  const dirExists = await fs
    .access(dirPath)
    .then(() => true)
    .catch(() => false)

  if (!dirExists) {
    console.warn(`  ⚠️  Directory not found: ${dirPath}`)
    return []
  }

  // Read all .mdx files in directory
  const files = await fs.readdir(dirPath)
  const mdxFiles = files.filter(f => f.endsWith('.mdx'))

  console.log(`  Found ${mdxFiles.length} MDX files`)

  const records = []

  for (const file of mdxFiles) {
    const filePath = path.join(dirPath, file)

    // Check if it's a file (not a directory)
    const stats = await fs.stat(filePath)
    if (!stats.isFile()) {
      continue
    }

    const content = await fs.readFile(filePath, 'utf-8')

    // Parse frontmatter
    const { data, content: markdown } = matter(content)

    records.push({
      ...data,
      _filename: file,
      _content: markdown,
    })
  }

  console.log(`  ✓ Loaded ${records.length} MDX records`)

  return records
}

/**
 * Download data from remote URL
 */
export async function downloadFile(url: string): Promise<string> {
  console.log(`  Downloading ${url}...`)

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Download failed: ${response.statusText}`)
  }

  const content = await response.text()
  console.log(`  ✓ Downloaded ${(content.length / 1024).toFixed(1)} KB`)

  return content
}

/**
 * Load O*NET data files
 */
export async function loadONetData(dataDir: string, version: string = '30_0') {
  const baseUrl = `https://www.onetcenter.org/dl_files/database/db_${version}_text/`

  // Try local files first, download if not available
  const files = {
    occupations: 'Occupation Data.txt',
    tasks: 'Task Statements.txt',
    skills: 'Skills.txt',
    abilities: 'Abilities.txt',
    knowledge: 'Knowledge.txt',
  }

  const data: Record<string, any[]> = {}

  for (const [key, filename] of Object.entries(files)) {
    const localPath = path.join(dataDir, filename)

    let content: string

    try {
      // Try to read local file
      content = await fs.readFile(localPath, 'utf-8')
      console.log(`  ✓ Using local file: ${filename}`)
    } catch {
      // Download if not available locally
      console.log(`  Downloading ${filename}...`)
      content = await downloadFile(baseUrl + encodeURIComponent(filename))

      // Save for future use
      await fs.mkdir(dataDir, { recursive: true })
      await fs.writeFile(localPath, content, 'utf-8')
    }

    // Parse TSV
    const records = parse(content, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      delimiter: '\t',
      relax_column_count: true,
      relax_quotes: true, // Handle unescaped quotes in text fields
    })

    data[key] = records
    console.log(`  ✓ Loaded ${records.length} ${key}`)
  }

  return data
}

/**
 * Load NAICS data
 */
export async function loadNAICSData(filePath: string): Promise<any[]> {
  console.log(`  Loading NAICS data from ${filePath}...`)

  // Check for local TSV file
  const localPath = filePath || path.join(process.cwd(), 'mdx/config/datasets/naics.tsv')

  const fileExists = await fs
    .access(localPath)
    .then(() => true)
    .catch(() => false)

  if (!fileExists) {
    console.warn(`  ⚠️  NAICS file not found: ${localPath}`)
    console.log(`  You can download it from: https://www.census.gov/naics/`)
    return []
  }

  const content = await fs.readFile(localPath, 'utf-8')

  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    delimiter: '\t',
    relax_column_count: true,
  })

  console.log(`  ✓ Loaded ${records.length} NAICS codes`)

  return records
}

/**
 * Load Schema.org data from existing MDX files
 */
export async function loadSchemaOrgData(mdxDir: string): Promise<any[]> {
  console.log(`  Loading Schema.org types from ${mdxDir}...`)

  const dirExists = await fs
    .access(mdxDir)
    .then(() => true)
    .catch(() => false)

  if (!dirExists) {
    console.warn(`  ⚠️  Schema.org directory not found: ${mdxDir}`)
    return []
  }

  return await loadMDX({ id: 'schema-org' } as SourceDefinition, mdxDir)
}

// Cache for O*NET data to avoid reloading for each collection
let onetDataCache: Record<string, any[]> | null = null

/**
 * Generic source loader that dispatches to appropriate loader
 */
export async function loadSourceData(
  source: SourceDefinition,
  options?: {
    dataDir?: string
    filePath?: string
    collection?: string
  }
): Promise<any[]> {
  console.log(`\n📥 Loading data for source: ${source.name}`)

  switch (source.id) {
    case 'onet': {
      const dataDir = options?.dataDir || './data/onet'

      // Load O*NET data once and cache it
      if (!onetDataCache) {
        onetDataCache = await loadONetData(dataDir)
      }

      // Return the appropriate collection based on mapping
      const collection = options?.collection?.toLowerCase()

      if (collection === 'tasks') {
        return onetDataCache.tasks || []
      } else if (collection === 'skills') {
        return onetDataCache.skills || []
      } else if (collection === 'abilities') {
        return onetDataCache.abilities || []
      } else if (collection === 'knowledge') {
        return onetDataCache.knowledge || []
      } else {
        // Default to occupations
        return onetDataCache.occupations || []
      }
    }

    case 'naics': {
      const filePath = options?.filePath || './mdx/config/datasets/naics.tsv'
      return await loadNAICSData(filePath)
    }

    case 'schema-org': {
      const mdxDir = options?.dataDir || './mdx/schema.org'
      return await loadSchemaOrgData(mdxDir)
    }

    default:
      console.warn(`  ⚠️  Unknown source: ${source.id}`)
      return []
  }
}
