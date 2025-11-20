import fs from 'fs/promises'
import { readFileSync } from 'fs'
import path from 'path'
import React from 'react'
import { render } from 'ink'
import { compileMdx } from './compiler.js'
import { parseFrontmatter } from './frontmatter.js'
import { createSchemaFromFrontmatter } from './schema.js'
import type { ParsedMdxDocument } from '../utils/types.js'

/**
 * Parse an MDX file and extract frontmatter, content, and schemas
 */
export async function parseMdxFile(mdxPath: string): Promise<ParsedMdxDocument> {
  const content = await fs.readFile(mdxPath, 'utf-8')
  const { frontmatter, mdxContent } = parseFrontmatter(content)
  const { inputSchema, outputSchema } = createSchemaFromFrontmatter(frontmatter)

  return {
    frontmatter,
    content: mdxContent,
    inputSchema,
    outputSchema,
  }
}

/**
 * Parse MDX content (string or file path) and return the content
 */
export function loadMdxContent(mdxContentOrPath: string): string {
  if (mdxContentOrPath.includes('/') && !mdxContentOrPath.includes('\n')) {
    // Treat as file path
    const resolvedPath = path.resolve(process.cwd(), mdxContentOrPath)
    return readFileSync(resolvedPath, 'utf8')
  } else {
    // Treat as content
    return mdxContentOrPath
  }
}

/**
 * Get input values from provided values or generate defaults based on schema
 */
export async function getInputValues(
  parsed: ParsedMdxDocument, 
  providedValues: Record<string, any> = {}
): Promise<Record<string, any>> {
  const inputValues: Record<string, any> = { ...providedValues }

  if (parsed.frontmatter.input) {
    Object.entries(parsed.frontmatter.input).forEach(([key, type]) => {
      if (inputValues[key] === undefined) {
        if (type === 'string') {
          inputValues[key] = `mock-${key}`
        } else if (type === 'number') {
          if (typeof providedValues[key] === 'string' && /^-?\d+(\.\d+)?$/.test(providedValues[key])) {
            inputValues[key] = parseFloat(providedValues[key])
          } else {
            inputValues[key] = 42
          }
        } else if (typeof type === 'string' && type.startsWith('enum[')) {
          const options = type
            .replace('enum[', '')
            .replace(']', '')
            .split(',')
            .map((o) => o.trim())
          inputValues[key] = options[0]
        } else {
          inputValues[key] = `mock-${key}`
        }
      }
    })
  }

  if (parsed.inputSchema) {
    return parsed.inputSchema.parse(inputValues)
  }

  return inputValues
}

/**
 * Render MDX content with Ink
 */
export async function renderWithInk(
  Component: React.ComponentType<any>,
  props: Record<string, any> = {}
): Promise<void> {
  const { waitUntilExit } = render(React.createElement(Component, props))
  await waitUntilExit()
} 
