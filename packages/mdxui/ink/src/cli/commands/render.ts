#!/usr/bin/env node
import React from 'react'
import { compileMdx } from '../../core/compiler.js'
import { loadMdxContent, parseMdxFile, getInputValues, renderWithInk } from '../../core/renderer.js'
import { parseFrontmatter } from '../../core/frontmatter.js'
import { createWorkflowFromFrontmatter } from '../../workflow/manager.js'
import { loadMdxComponents } from '../../component-system/loader.js'
import { getDefaultComponents } from '../../components/base/index.js'
import { wrapSvgComponent } from '../../components/media/Image.js'
import { landingPageComponents } from '../../components/specialized/LandingPage.js'
import type { WorkflowFrontmatter } from '../../workflow/types.js'
import type { MdxPastelInkOptions } from '../../utils/types.js'

/**
 * Render MDX content in a CLI app
 * @param mdxContentOrPath - Either MDX content as a string or a path to an MDX file
 * @param options - Options for rendering
 * @returns Object containing Component, frontmatter, and optional workflow
 */
export async function renderMdxCli(
  mdxContentOrPath: string,
  options: Partial<MdxPastelInkOptions & { executeCode?: boolean }> = {},
): Promise<{
  Component: React.ComponentType<any>
  frontmatter: Record<string, any>
  workflow?: ReturnType<typeof createWorkflowFromFrontmatter>
}> {
  try {
    const mdxContent = loadMdxContent(mdxContentOrPath)

    // Parse frontmatter
    const { frontmatter, mdxContent: contentWithoutFrontmatter } = parseFrontmatter(mdxContent)

    // Load and merge components
    const loadedComponents = await loadMdxComponents()
    const defaultComponents = getDefaultComponents()

    const allComponents = {
      ...defaultComponents,
      ...landingPageComponents,
      ...loadedComponents,
      ...(options.components || {}),
    }

    // Process SVG components
    const processedComponents = Object.entries(allComponents).reduce(
      (acc, [key, component]) => {
        const isSvgComponent =
          typeof component === 'function' &&
          key.match(/^[A-Z]/) && // Component names start with capital letter
          !defaultComponents.hasOwnProperty(key) // Not one of our built-in components

        if (isSvgComponent) {
          acc[key] = wrapSvgComponent(component as React.ComponentType<any>)
        } else {
          acc[key] = component
        }

        return acc
      },
      {} as Record<string, any>,
    )

    const Component = await compileMdx(contentWithoutFrontmatter, options.scope, {
      remarkPlugins: [],
      rehypePlugins: [],
      components: processedComponents,
    })

    // Check for workflow in frontmatter
    if ((frontmatter as WorkflowFrontmatter).workflow || (frontmatter as WorkflowFrontmatter).steps || (frontmatter as WorkflowFrontmatter).screens) {
      const workflow = createWorkflowFromFrontmatter(frontmatter as WorkflowFrontmatter)
      return { Component, frontmatter, workflow }
    }

    return { Component, frontmatter }
  } catch (error) {
    console.error('Error processing MDX:', error)
    throw error
  }
}

/**
 * Render MDX file with full CLI app behavior (including Ink rendering)
 */
export async function renderMdxCliWithInk(mdxPath: string, options: Partial<MdxPastelInkOptions> = {}): Promise<Record<string, any>> {
  const resolvedPath = require('path').resolve(mdxPath)
  const parsed = await parseMdxFile(resolvedPath)
  const inputValues = await getInputValues(parsed, options.scope || {})

  if (parsed.inputSchema) {
    parsed.inputSchema.parse(inputValues)
  }

  const defaultComponents = getDefaultComponents()
  const combinedScope = {
    ...inputValues,
    ...options.scope,
    ...defaultComponents,
    ...(options.components || {}),
  }

  const Component = await compileMdx(parsed.content, combinedScope)

  // Merge default components with user-provided components
  const mergedComponents = {
    ...defaultComponents,
    ...(options.components || {}),
  }

  const processedComponents = Object.entries(mergedComponents).reduce(
    (acc, [key, component]) => {
      const isSvgComponent =
        typeof component === 'function' &&
        key.match(/^[A-Z]/) && // Component names start with capital letter
        !defaultComponents.hasOwnProperty(key) // Not one of our built-in components

      if (isSvgComponent) {
        acc[key] = wrapSvgComponent(component as React.ComponentType<any>)
      } else {
        acc[key] = component
      }

      return acc
    },
    {} as Record<string, any>,
  )

  // Render the component with input values and processed components
  await renderWithInk(Component, { components: processedComponents, ...inputValues })

  return inputValues
}

async function main() {
  const args = process.argv.slice(2)
  if (args.length === 0) {
    console.error('Usage: node render.js <mdx-file>')
    process.exit(1)
  }

  try {
    await renderMdxCliWithInk(args[0])
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  main().catch(console.error)
}
