#!/usr/bin/env node
import { Command } from 'commander'
import { query } from '@anthropic-ai/claude-agent-sdk'
import packageJson from '../package.json' with { type: 'json' }
import PQueue from 'p-queue'
import path from 'node:path'
import fs from 'node:fs/promises'
import matter from 'gray-matter'
import { z } from 'zod'
import { generateObject, generateText } from 'ai'
import { openai } from '@ai-sdk/openai'
import GithubSlugger from 'github-slugger'

const program = new Command()

program
  .version(packageJson.version)
  .description('Simplified MDX AI - Natural language content generation')
  .argument('[prompt...]', 'Natural language prompt (e.g., "for every occupation, write a blog post...")')
  .option('-c, --concurrency <number>', 'Maximum concurrent generations', '25')
  .option('-m, --model <model>', 'AI model to use', 'gpt-5')
  .option('-d, --dir <directory>', 'Output directory', 'content')
  .option('--dry-run', 'Show what would be generated without actually generating')
  .action(async (promptParts: string[], options) => {
    const fullPrompt = promptParts.join(' ')

    if (!fullPrompt) {
      console.log('Usage: mdxai <natural language prompt>')
      console.log('Example: mdxai for every occupation, write a blog post about how AI will transform it')
      process.exit(1)
    }

    await runSimplifiedCLI(fullPrompt, {
      concurrency: parseInt(options.concurrency, 10),
      model: options.model,
      outputDir: options.dir,
      dryRun: options.dryRun,
    })
  })

interface SimplifiedOptions {
  concurrency: number
  model: string
  outputDir: string
  dryRun?: boolean
}

/**
 * Parse natural language to extract:
 * - Data source (e.g., "every occupation", "all technologies", "each service")
 * - Task (e.g., "write a blog post", "create documentation", "generate a summary")
 * - Context (additional instructions)
 */
async function parseNaturalLanguage(prompt: string): Promise<{
  dataSource: string | null
  collection: string | null
  task: string
  context: string
}> {
  // Pattern: "for every/each/all <collection>, <task> <context>"
  const forEveryPattern = /for\s+(every|each|all)\s+([a-z]+),?\s+(.+)/i
  const match = prompt.match(forEveryPattern)

  if (match) {
    const [, quantifier, collection, rest] = match
    return {
      dataSource: `${quantifier} ${collection}`,
      collection,
      task: rest.split(/\babout\b/i)[0].trim(),
      context: rest,
    }
  }

  // Fallback: treat entire prompt as single generation task
  return {
    dataSource: null,
    collection: null,
    task: prompt,
    context: prompt,
  }
}

/**
 * Query mdxdb to get items from the specified collection
 * This will integrate with @mdxdb/core to fetch data
 */
async function queryCollection(collection: string, cwd: string): Promise<any[]> {
  // TODO: Integrate with mdxdb to actually query collections
  // For now, return mock data
  console.log(`Querying collection: ${collection}`)

  // Check if there's a local directory with MDX files for this collection
  const collectionPath = path.join(cwd, collection)
  try {
    const stats = await fs.stat(collectionPath)
    if (stats.isDirectory()) {
      const files = await fs.readdir(collectionPath)
      const mdxFiles = files.filter(f => f.endsWith('.mdx') || f.endsWith('.md'))

      const items = await Promise.all(mdxFiles.map(async (file) => {
        const filePath = path.join(collectionPath, file)
        const content = await fs.readFile(filePath, 'utf-8')
        const { data, content: body } = matter(content)
        return {
          ...data,
          _filename: file,
          _path: filePath,
          _content: body,
        }
      }))

      return items
    }
  } catch (err) {
    // Collection directory doesn't exist
  }

  // Return empty array if no data found
  console.warn(`No data found for collection "${collection}"`)
  return []
}

/**
 * Read README.md from the output directory to use as generation instructions
 */
async function getInstructions(outputDir: string): Promise<string | null> {
  const readmePath = path.join(outputDir, 'README.md')
  try {
    const content = await fs.readFile(readmePath, 'utf-8')
    return content
  } catch (err) {
    return null
  }
}

/**
 * Create a Zod schema from frontmatter fields
 * Format: key: description (type inferred from description or default to string)
 */
function createZodSchemaFromFrontmatter(frontmatter: Record<string, any>): z.ZodObject<any> {
  const shape: Record<string, z.ZodTypeAny> = {}

  for (const [key, value] of Object.entries(frontmatter)) {
    if (key.startsWith('_')) continue // Skip internal fields

    // Try to infer type from value
    if (typeof value === 'number') {
      shape[key] = z.number().describe(String(value))
    } else if (typeof value === 'boolean') {
      shape[key] = z.boolean().describe(String(value))
    } else if (Array.isArray(value)) {
      shape[key] = z.array(z.string()).describe(String(value))
    } else {
      // Default to string with description
      shape[key] = z.string().describe(String(value))
    }
  }

  return z.object(shape)
}

/**
 * Generate a single piece of content using AI SDK
 * Only generates fields that are missing or fail Zod validation
 */
async function generateContent(
  item: any,
  task: string,
  context: string,
  options: SimplifiedOptions,
  instructions: string | null,
  templateFrontmatter: Record<string, any> | null
): Promise<{ filename: string; content: string }> {
  const modelName = item.$model || options.model
  const model = openai(modelName)

  // Build prompt
  let prompt = task
  if (instructions) {
    prompt = `${instructions}\n\n${task}`
  }

  // Replace placeholders in prompt with item data
  const interpolatedPrompt = prompt.replace(/\{([^}]+)\}/g, (match, key) => {
    return item[key] || match
  })

  // If we have template frontmatter, use generateObject for structured output
  if (templateFrontmatter && Object.keys(templateFrontmatter).length > 0) {
    const schema = createZodSchemaFromFrontmatter(templateFrontmatter)

    // Validate existing item data against schema
    const validation = schema.safeParse(item)
    const validFields: Record<string, any> = {}
    const invalidFields: string[] = []

    if (validation.success) {
      // All fields are valid, no need to generate anything
      const slugger = new GithubSlugger()
      const filename = item._filename || slugger.slug(item.title || item.name || 'generated')

      const frontmatterYaml = Object.entries(item)
        .filter(([key]) => !key.startsWith('_'))
        .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
        .join('\n')

      const content = `---\n${frontmatterYaml}\n---\n\n# ${item.title || item.name}\n\n${item._content || ''}`

      return { filename, content }
    } else {
      // Some fields are invalid or missing
      // Determine which fields to generate
      for (const [key, zodType] of Object.entries(schema.shape)) {
        try {
          zodType.parse(item[key])
          validFields[key] = item[key]
        } catch (err) {
          invalidFields.push(key)
        }
      }
    }

    // Only generate invalid/missing fields
    const partialSchema = z.object(
      Object.fromEntries(
        invalidFields.map(key => [key, schema.shape[key]])
      )
    )

    const result = await generateObject({
      model,
      schema: partialSchema,
      prompt: `${interpolatedPrompt}\n\nContext about the item: ${JSON.stringify(item, null, 2)}\n\nOnly generate the following fields: ${invalidFields.join(', ')}`,
    })

    // Merge valid fields with generated fields
    const mergedData = { ...validFields, ...result.object }

    // Convert structured output to MDX with frontmatter
    const slugger = new GithubSlugger()
    const filename = item._filename || slugger.slug(item.title || item.name || mergedData.title || 'generated')

    const frontmatterYaml = Object.entries(mergedData)
      .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
      .join('\n')

    const content = `---\n${frontmatterYaml}\n---\n\n# ${mergedData.title || item.title || item.name}\n\n${mergedData.content || item._content || ''}`

    return { filename, content }
  } else {
    // No frontmatter template, use generateText for markdown
    const result = await generateText({
      model,
      prompt: `${interpolatedPrompt}\n\nContext about the item: ${JSON.stringify(item, null, 2)}\n\nGenerate a complete MDX document with YAML frontmatter.`,
    })

    const slugger = new GithubSlugger()
    const filename = item._filename || slugger.slug(item.title || item.name || 'generated')

    return { filename, content: result.text }
  }
}

/**
 * Main simplified CLI logic
 */
async function runSimplifiedCLI(prompt: string, options: SimplifiedOptions) {
  console.log('🤖 MDX AI - Simplified Natural Language Generation')
  console.log(`Prompt: ${prompt}`)
  console.log(`Model: ${options.model}`)
  console.log(`Concurrency: ${options.concurrency}`)
  console.log(`Output: ${options.outputDir}`)
  console.log('')

  const cwd = process.cwd()

  // Parse the natural language prompt
  const parsed = await parseNaturalLanguage(prompt)
  console.log('Parsed:', parsed)
  console.log('')

  // Get instructions from README if available
  const instructions = await getInstructions(options.outputDir)
  if (instructions) {
    console.log('✅ Found README.md with generation instructions')
  }

  // Check for template file to extract frontmatter schema
  let templateFrontmatter: Record<string, any> | null = null
  const templatePath = path.join(options.outputDir, '_template.mdx')
  try {
    const templateContent = await fs.readFile(templatePath, 'utf-8')
    const { data } = matter(templateContent)
    templateFrontmatter = data
    console.log('✅ Found _template.mdx with frontmatter schema')
  } catch (err) {
    // No template found
  }

  console.log('')

  // If we have a collection, query it
  let items: any[] = []
  if (parsed.collection) {
    items = await queryCollection(parsed.collection, cwd)
    console.log(`Found ${items.length} items in collection "${parsed.collection}"`)
  } else {
    // Single generation
    items = [{ title: 'Generated Content' }]
  }

  if (items.length === 0) {
    console.log('No items to generate. Exiting.')
    return
  }

  if (options.dryRun) {
    console.log('\n🔍 Dry run - would generate:')
    items.forEach((item, i) => {
      console.log(`  ${i + 1}. ${item.title || item.name || item._filename || 'Untitled'}`)
    })
    return
  }

  // Create output directory if it doesn't exist
  await fs.mkdir(options.outputDir, { recursive: true })

  // Set up parallel generation queue
  const queue = new PQueue({ concurrency: options.concurrency })

  console.log(`\n🚀 Generating ${items.length} items with ${options.concurrency} concurrent workers...\n`)

  const startTime = Date.now()
  let completed = 0

  const tasks = items.map((item, index) =>
    queue.add(async () => {
      try {
        const { filename, content } = await generateContent(
          item,
          parsed.task,
          parsed.context,
          options,
          instructions,
          templateFrontmatter
        )

        const outputPath = path.join(options.outputDir, filename.endsWith('.mdx') ? filename : `${filename}.mdx`)
        await fs.writeFile(outputPath, content, 'utf-8')

        completed++
        const progress = Math.round((completed / items.length) * 100)
        console.log(`✅ [${progress}%] Generated: ${filename}`)
      } catch (error) {
        console.error(`❌ Failed to generate item ${index + 1}:`, error)
      }
    })
  )

  await Promise.all(tasks)

  const duration = ((Date.now() - startTime) / 1000).toFixed(2)
  console.log(`\n🎉 Generated ${completed}/${items.length} items in ${duration}s`)
}

if (import.meta.url === `file://${process.argv[1]}`) {
  program.parse(process.argv)
}

export { runSimplifiedCLI, parseNaturalLanguage, queryCollection }
