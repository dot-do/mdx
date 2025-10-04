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

    case 'zapier': {
      const collection = options?.collection?.toLowerCase()
      const maxPages = (options as any)?.maxPages // For testing, limit pages
      return await loadZapierData(collection, maxPages)
    }

    case 'gs1': {
      const collection = options?.collection?.toLowerCase()
      return await loadGS1Data(collection)
    }

    default:
      console.warn(`  ⚠️  Unknown source: ${source.id}`)
      return []
  }
}

/**
 * Load Zapier data from API
 */
export async function loadZapierData(collection?: string, maxPagesLimit?: number): Promise<any[]> {
  console.log(`  Loading Zapier data for collection: ${collection || 'apps'}`)

  const baseUrl = 'https://zapier.com/api/v4/'

  switch (collection) {
    case 'apps': {
      // Fetch apps from Zapier API
      const apps: any[] = []
      let url = `${baseUrl}apps/?limit=250`
      let page = 0
      const maxPages = maxPagesLimit || 30 // default ~7,500 apps, or limit for testing

      while (url && page < maxPages) {
        console.log(`    Fetching page ${page + 1}...`)
        const response = await fetch(url)
        if (!response.ok) {
          console.error(`    ❌ Failed to fetch: ${response.statusText}`)
          break
        }
        const data = await response.json()
        apps.push(...data.results)
        url = data.next || ''
        page++
      }

      console.log(`  ✓ Loaded ${apps.length} Zapier apps`)
      return apps
    }

    default:
      console.warn(`  ⚠️  Zapier collection not implemented: ${collection}`)
      return []
  }
}

/**
 * Load GS1 Core Business Vocabulary data
 */
export async function loadGS1Data(collection?: string): Promise<any[]> {
  console.log(`  Loading GS1 data for collection: ${collection || 'verbs'}`)

  // GS1 CBV vocabulary (hardcoded from official spec)
  const businessSteps = [
    { id: 'Accepting', description: 'Denotes the receiving of goods from external parties' },
    { id: 'Arriving', description: 'Denotes the receiving of goods after transportation' },
    { id: 'Assembling', description: 'Denotes the assembly of objects into aggregations or transformations' },
    { id: 'Collecting', description: 'Denotes the assembly of objects for the purpose of transportation' },
    { id: 'Commissioning', description: 'Denotes the creation of new trade items or instances' },
    { id: 'Consigning', description: 'Denotes the transfer of physical possession of objects for transportation' },
    { id: 'Creating Class Instance', description: 'Denotes the creation of a specific class of trade item' },
    { id: 'Cycle Counting', description: 'Denotes a physical count of inventory' },
    { id: 'Decommissioning', description: 'Denotes the removal of objects from the supply chain' },
    { id: 'Departing', description: 'Denotes the departure of objects for transportation' },
    { id: 'Destroying', description: 'Denotes the permanent destruction of objects' },
    { id: 'Dispensing', description: 'Denotes the dispensing of objects to end users' },
    { id: 'Encoding', description: 'Denotes the writing of data to RFID tags' },
    { id: 'Entering Exiting', description: 'Denotes objects entering or exiting a location' },
    { id: 'Holding', description: 'Denotes objects being held in inventory' },
    { id: 'Inspecting', description: 'Denotes the inspection of objects for quality or compliance' },
    { id: 'Installing', description: 'Denotes the installation of objects at a location' },
    { id: 'Killing', description: 'Denotes the permanent deactivation of RFID tags' },
    { id: 'Loading', description: 'Denotes the loading of objects onto transportation equipment' },
    { id: 'Packing', description: 'Denotes the packing of objects into shipping containers' },
    { id: 'Picking', description: 'Denotes the selection of objects from inventory for fulfillment' },
    { id: 'Receiving', description: 'Denotes the receiving of objects from suppliers' },
    { id: 'Removing', description: 'Denotes the removal of objects from aggregations' },
    { id: 'Repackaging', description: 'Denotes the repackaging of objects' },
    { id: 'Repairing', description: 'Denotes the repair of damaged objects' },
    { id: 'Replacing', description: 'Denotes the replacement of defective objects' },
    { id: 'Reserving', description: 'Denotes the reservation of objects for future use' },
    { id: 'Retail Selling', description: 'Denotes the sale of objects to end consumers' },
    { id: 'Shipping', description: 'Denotes the shipment of objects to destinations' },
    { id: 'Staging Outbound', description: 'Denotes the staging of objects for outbound shipment' },
    { id: 'Stock Taking', description: 'Denotes a comprehensive inventory count' },
    { id: 'Storing', description: 'Denotes the storage of objects in inventory' },
    { id: 'Transforming', description: 'Denotes the transformation of objects into new products' },
    { id: 'Transporting', description: 'Denotes the transportation of objects between locations' },
    { id: 'Unloading', description: 'Denotes the unloading of objects from transportation equipment' },
    { id: 'Unpacking', description: 'Denotes the unpacking of objects from containers' },
    { id: 'Void Shipping', description: 'Denotes the cancellation of a shipment' },
  ]

  const dispositions = [
    { id: 'Active', description: 'Objects are active and available for business transactions' },
    { id: 'Available', description: 'Objects are available for use or sale' },
    { id: 'Completeness Inferred', description: 'Completeness is inferred from partial observations' },
    { id: 'Completeness Verified', description: 'Completeness has been verified' },
    { id: 'Conformant', description: 'Objects conform to specifications' },
    { id: 'Container Closed', description: 'Container has been closed' },
    { id: 'Container Open', description: 'Container has been opened' },
    { id: 'Damaged', description: 'Objects have been damaged' },
    { id: 'Destroyed', description: 'Objects have been destroyed' },
    { id: 'Dispensed', description: 'Objects have been dispensed' },
    { id: 'Disposed', description: 'Objects have been disposed of' },
    { id: 'Encoded', description: 'Data has been encoded' },
    { id: 'Expired', description: 'Objects have expired' },
    { id: 'In Progress', description: 'Business process is in progress' },
    { id: 'In Transit', description: 'Objects are in transit' },
    { id: 'Inactive', description: 'Objects are inactive' },
    { id: 'Mismatch Instance', description: 'Instance data does not match expectations' },
    { id: 'Mismatch Class', description: 'Class data does not match expectations' },
    { id: 'Mismatch Quantity', description: 'Quantity does not match expectations' },
    { id: 'No Pedigree Match', description: 'Pedigree does not match expectations' },
    { id: 'Non Conformant', description: 'Objects do not conform to specifications' },
    { id: 'Non Sellable Other', description: 'Objects are not sellable for other reasons' },
    { id: 'Partially Dispensed', description: 'Objects have been partially dispensed' },
    { id: 'Recalled', description: 'Objects have been recalled' },
    { id: 'Reserved', description: 'Objects have been reserved' },
    { id: 'Retail Sold', description: 'Objects have been sold at retail' },
    { id: 'Returned', description: 'Objects have been returned' },
    { id: 'Sellable Accessible', description: 'Objects are sellable and accessible' },
    { id: 'Sellable Not Accessible', description: 'Objects are sellable but not accessible' },
    { id: 'Stolen', description: 'Objects have been stolen' },
    { id: 'Unknown', description: 'Disposition is unknown' },
  ]

  const eventTypes = [
    {
      id: 'Object Event',
      description: 'Records an event that happened to one or more objects',
      dimensions: 'What (objects), When (eventTime), Where (location), Why (bizStep, disposition)',
    },
    {
      id: 'Aggregation Event',
      description: 'Records the assembly or disassembly of objects into or from an aggregation',
      dimensions: 'What (parent, children), When (eventTime), Where (location), Why (bizStep), How (action: ADD/DELETE/OBSERVE)',
    },
    {
      id: 'Transaction Event',
      description: 'Records the association of objects with a business transaction',
      dimensions: 'What (objects), When (eventTime), Where (location), Why (bizStep, bizTransactionList), Who (source, destination)',
    },
    {
      id: 'Transformation Event',
      description: 'Records the transformation of input objects into output objects',
      dimensions: 'What (inputEPCList, outputEPCList), When (eventTime), Where (location), Why (bizStep, transformationID), How (quantity, ilmd)',
    },
    {
      id: 'Association Event',
      description: 'Records the association between an object and an entity (person, location, etc.)',
      dimensions: 'What (parentID, childEPCs/childQuantityList), When (eventTime), Where (location), Why (bizStep), How (action: ADD/DELETE/OBSERVE)',
    },
  ]

  switch (collection) {
    case 'verbs':
      console.log(`  ✓ Loaded ${businessSteps.length} GS1 business steps (verbs)`)
      return businessSteps

    case 'dispositions':
      console.log(`  ✓ Loaded ${dispositions.length} GS1 dispositions`)
      return dispositions

    case 'eventtypes':
      console.log(`  ✓ Loaded ${eventTypes.length} GS1 event types`)
      return eventTypes

    default:
      console.warn(`  ⚠️  GS1 collection not implemented: ${collection}`)
      return []
  }
}
