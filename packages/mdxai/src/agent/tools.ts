/**
 * Tools for mdxai AI SDK agent
 * Provides mdxdb operations and generation capabilities
 */

import { tool } from 'ai'
import { z } from 'zod'
import fs from 'node:fs/promises'
import path from 'node:path'
import matter from 'gray-matter'
import { glob } from 'fast-glob'
import GithubSlugger from 'github-slugger'

/**
 * List MDX files matching a glob pattern
 */
export const listTool = tool({
  description: 'List MDX files matching a glob pattern. Returns file paths and frontmatter.',
  parameters: z.object({
    pattern: z.string().describe('Glob pattern to match files (e.g., "**/*.mdx", "occupations/*.mdx")'),
    cwd: z.string().default(process.cwd()).describe('Working directory for glob search'),
    limit: z.number().optional().describe('Maximum number of results to return'),
  }),
  execute: async ({ pattern, cwd, limit }) => {
    const files = await glob(pattern, { cwd, absolute: true })
    const limitedFiles = limit ? files.slice(0, limit) : files

    const results = await Promise.all(
      limitedFiles.map(async (file) => {
        const content = await fs.readFile(file, 'utf-8')
        const { data } = matter(content)
        return {
          path: file,
          relativePath: path.relative(cwd, file),
          frontmatter: data,
        }
      })
    )

    return {
      count: results.length,
      total: files.length,
      files: results,
    }
  },
})

/**
 * Search MDX files by frontmatter fields
 */
export const searchTool = tool({
  description: 'Search MDX files by frontmatter field values. Supports filtering by any field.',
  parameters: z.object({
    pattern: z.string().describe('Glob pattern to search within (e.g., "**/*.mdx")'),
    field: z.string().describe('Frontmatter field to search (e.g., "title", "tags", "category")'),
    value: z.string().describe('Value to match (supports partial matches)'),
    cwd: z.string().default(process.cwd()).describe('Working directory'),
    limit: z.number().optional().describe('Maximum results'),
  }),
  execute: async ({ pattern, field, value, cwd, limit }) => {
    const files = await glob(pattern, { cwd, absolute: true })

    const matches = []
    for (const file of files) {
      const content = await fs.readFile(file, 'utf-8')
      const { data } = matter(content)

      const fieldValue = data[field]
      let isMatch = false

      if (typeof fieldValue === 'string') {
        isMatch = fieldValue.toLowerCase().includes(value.toLowerCase())
      } else if (Array.isArray(fieldValue)) {
        isMatch = fieldValue.some((v) => String(v).toLowerCase().includes(value.toLowerCase()))
      } else if (fieldValue !== undefined) {
        isMatch = String(fieldValue).toLowerCase().includes(value.toLowerCase())
      }

      if (isMatch) {
        matches.push({
          path: file,
          relativePath: path.relative(cwd, file),
          frontmatter: data,
        })

        if (limit && matches.length >= limit) break
      }
    }

    return {
      count: matches.length,
      query: { field, value },
      matches,
    }
  },
})

/**
 * Get a specific MDX file by path
 */
export const getTool = tool({
  description: 'Get the full content and frontmatter of a specific MDX file.',
  parameters: z.object({
    path: z.string().describe('File path (relative or absolute)'),
    cwd: z.string().default(process.cwd()).describe('Working directory'),
  }),
  execute: async ({ path: filePath, cwd }) => {
    const absolutePath = path.isAbsolute(filePath) ? filePath : path.join(cwd, filePath)

    try {
      const content = await fs.readFile(absolutePath, 'utf-8')
      const { data, content: body } = matter(content)

      return {
        path: absolutePath,
        relativePath: path.relative(cwd, absolutePath),
        frontmatter: data,
        content: body,
        raw: content,
      }
    } catch (error) {
      throw new Error(`Failed to read file ${filePath}: ${error instanceof Error ? error.message : String(error)}`)
    }
  },
})

/**
 * Put (write/update) an MDX file
 */
export const putTool = tool({
  description: 'Write or update an MDX file with frontmatter and content.',
  parameters: z.object({
    path: z.string().describe('File path to write (relative or absolute)'),
    frontmatter: z.record(z.any()).describe('Frontmatter data as key-value pairs'),
    content: z.string().describe('Markdown/MDX content body'),
    cwd: z.string().default(process.cwd()).describe('Working directory'),
    createDirs: z.boolean().default(true).describe('Create parent directories if they don\'t exist'),
  }),
  execute: async ({ path: filePath, frontmatter, content, cwd, createDirs }) => {
    const absolutePath = path.isAbsolute(filePath) ? filePath : path.join(cwd, filePath)

    // Create parent directories
    if (createDirs) {
      const dir = path.dirname(absolutePath)
      await fs.mkdir(dir, { recursive: true })
    }

    // Generate MDX content
    const mdx = matter.stringify(content, frontmatter)

    // Write file
    await fs.writeFile(absolutePath, mdx, 'utf-8')

    return {
      path: absolutePath,
      relativePath: path.relative(cwd, absolutePath),
      success: true,
    }
  },
})

/**
 * Generate content using AI for a specific item
 */
export const generateTool = tool({
  description: 'Generate AI content for a specific item with frontmatter context. Returns generated frontmatter fields and content.',
  parameters: z.object({
    prompt: z.string().describe('Generation prompt (can use {field} placeholders)'),
    context: z.record(z.any()).describe('Context data (frontmatter from source file)'),
    schema: z.record(z.string()).optional().describe('Expected frontmatter schema (field: description)'),
    model: z.string().default('gpt-4').describe('AI model to use'),
    background: z.boolean().default(false).describe('Use OpenAI background mode for 50% discount'),
  }),
  execute: async ({ prompt, context, schema, model, background }) => {
    // Import AI SDK dynamically to avoid circular dependencies
    const { generateText, generateObject } = await import('ai')
    const { openai } = await import('@ai-sdk/openai')

    // Interpolate prompt with context
    const interpolatedPrompt = prompt.replace(/\{([^}]+)\}/g, (match, key) => {
      return context[key] || match
    })

    // Configure model with background mode and flex tier
    const modelConfig = openai(model, {
      ...(background && {
        // OpenAI background mode
        modalities: ['text'],
        reasoningEffort: 'low',
      }),
    })

    const baseParams = {
      ...(background && {
        // service_tier: flex for 50% discount
        providerOptions: {
          openai: {
            service_tier: 'flex',
          },
        },
      }),
    }

    // If schema provided, use generateObject for structured output
    if (schema && Object.keys(schema).length > 0) {
      const zodSchema = z.object(
        Object.fromEntries(Object.entries(schema).map(([key, desc]) => [key, z.string().describe(desc)]))
      )

      const result = await generateObject({
        model: modelConfig,
        schema: zodSchema,
        prompt: `${interpolatedPrompt}\n\nContext: ${JSON.stringify(context, null, 2)}`,
        ...baseParams,
      })

      return {
        type: 'object',
        frontmatter: result.object,
        usage: result.usage,
        model,
        background,
      }
    } else {
      // Otherwise use generateText for markdown
      const result = await generateText({
        model: modelConfig,
        prompt: `${interpolatedPrompt}\n\nContext: ${JSON.stringify(context, null, 2)}\n\nGenerate MDX content with YAML frontmatter.`,
        ...baseParams,
      })

      // Parse generated content
      const { data, content } = matter(result.text)

      return {
        type: 'text',
        frontmatter: data,
        content,
        raw: result.text,
        usage: result.usage,
        model,
        background,
      }
    }
  },
})

/**
 * forEach - Generate content for multiple items matching a pattern
 */
export const forEachTool = tool({
  description: 'Generate AI content for each file matching a glob pattern. Supports recursive generation with validation.',
  parameters: z.object({
    pattern: z.string().describe('Glob pattern to match files (e.g., "occupations/*.mdx")'),
    prompt: z.string().describe('Generation prompt (can use {field} placeholders from frontmatter)'),
    schema: z.record(z.string()).optional().describe('Expected frontmatter schema for validation'),
    output: z.string().describe('Output directory for generated files'),
    model: z.string().default('gpt-4').describe('AI model to use'),
    concurrency: z.number().default(25).describe('Number of concurrent generations'),
    background: z.boolean().default(false).describe('Use OpenAI background mode for 50% discount'),
    validateOnly: z.boolean().default(false).describe('Only validate existing files, don\'t generate'),
    regenerateInvalid: z.boolean().default(false).describe('Regenerate files that fail validation'),
    cwd: z.string().default(process.cwd()).describe('Working directory'),
  }),
  execute: async ({ pattern, prompt, schema, output, model, concurrency, background, validateOnly, regenerateInvalid, cwd }) => {
    // Import dependencies
    const PQueue = (await import('p-queue')).default
    const { generateText, generateObject } = await import('ai')
    const { openai } = await import('@ai-sdk/openai')

    // Find matching files
    const files = await glob(pattern, { cwd, absolute: true })
    console.log(`Found ${files.length} files matching pattern: ${pattern}`)

    // Create output directory
    await fs.mkdir(output, { recursive: true })

    // Build Zod schema if provided
    let zodSchema: z.ZodObject<any> | null = null
    if (schema && Object.keys(schema).length > 0) {
      zodSchema = z.object(Object.fromEntries(Object.entries(schema).map(([key, desc]) => [key, z.string().describe(desc)])))
    }

    // Set up queue for parallel processing
    const queue = new PQueue({ concurrency })

    const results = {
      total: files.length,
      processed: 0,
      validated: 0,
      generated: 0,
      skipped: 0,
      errors: [] as any[],
    }

    const tasks = files.map((file, index) =>
      queue.add(async () => {
        try {
          // Read source file
          const content = await fs.readFile(file, 'utf-8')
          const { data: frontmatter, content: body } = matter(content)

          // Validate against schema if provided
          let isValid = true
          let invalidFields: string[] = []

          if (zodSchema) {
            const validation = zodSchema.safeParse(frontmatter)
            isValid = validation.success

            if (!isValid && validation.error) {
              invalidFields = validation.error.issues.map((issue) => issue.path.join('.'))
            }
          }

          results.processed++

          // If validate only mode
          if (validateOnly) {
            if (isValid) {
              results.validated++
            }
            return
          }

          // Skip if valid and not regenerating invalid
          if (isValid && !regenerateInvalid) {
            results.skipped++
            return
          }

          // Generate content
          const modelConfig = openai(model, {
            ...(background && {
              modalities: ['text'],
              reasoningEffort: 'low',
            }),
          })

          const baseParams = {
            ...(background && {
              providerOptions: {
                openai: {
                  service_tier: 'flex',
                },
              },
            }),
          }

          // Interpolate prompt
          const interpolatedPrompt = prompt.replace(/\{([^}]+)\}/g, (match, key) => {
            return frontmatter[key] || match
          })

          let generatedFrontmatter = frontmatter
          let generatedContent = body

          if (zodSchema && !isValid) {
            // Only generate invalid fields
            const partialSchema = z.object(
              Object.fromEntries(invalidFields.map((field) => [field, zodSchema.shape[field]]))
            )

            const result = await generateObject({
              model: modelConfig,
              schema: partialSchema,
              prompt: `${interpolatedPrompt}\n\nContext: ${JSON.stringify(frontmatter, null, 2)}\n\nOnly generate these fields: ${invalidFields.join(', ')}`,
              ...baseParams,
            })

            generatedFrontmatter = { ...frontmatter, ...result.object }
          } else {
            // Generate full content
            const result = await generateText({
              model: modelConfig,
              prompt: `${interpolatedPrompt}\n\nContext: ${JSON.stringify(frontmatter, null, 2)}\n\nGenerate complete MDX content.`,
              ...baseParams,
            })

            const parsed = matter(result.text)
            generatedFrontmatter = parsed.data
            generatedContent = parsed.content
          }

          // Write output file
          const slugger = new GithubSlugger()
          const filename = frontmatter._filename || slugger.slug(frontmatter.title || frontmatter.name || `generated-${index}`)
          const outputPath = path.join(output, filename.endsWith('.mdx') ? filename : `${filename}.mdx`)

          const outputMdx = matter.stringify(generatedContent, generatedFrontmatter)
          await fs.writeFile(outputPath, outputMdx, 'utf-8')

          results.generated++

          if ((results.processed % 10 === 0 || results.processed === files.length)) {
            console.log(`Progress: ${results.processed}/${files.length} (${Math.round((results.processed / files.length) * 100)}%)`)
          }
        } catch (error) {
          results.errors.push({
            file: path.relative(cwd, file),
            error: error instanceof Error ? error.message : String(error),
          })
        }
      })
    )

    await Promise.all(tasks)

    return {
      ...results,
      pattern,
      output,
      model,
      concurrency,
      background,
    }
  },
})

/**
 * All tools for the agent
 */
export const mdxaiTools = {
  list: listTool,
  search: searchTool,
  get: getTool,
  put: putTool,
  generate: generateTool,
  forEach: forEachTool,
}
