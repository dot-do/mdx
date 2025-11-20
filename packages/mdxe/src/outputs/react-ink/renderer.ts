import React from 'react'
import { render, RenderOptions } from 'ink'
import { compile } from '@mdx-js/mdx'
import { VFile } from 'vfile'
import remarkGfm from 'remark-gfm'
import remarkFrontmatter from 'remark-frontmatter'
import * as runtime from 'react/jsx-runtime'
import { $, ai, db, on, send, list, research, extract } from '../../cli/utils/globals'

export interface InkRendererOptions {
  /**
   * React components to make available in MDX
   */
  components?: Record<string, React.ComponentType<any>>

  /**
   * Data/functions to make available in MDX scope
   * Automatically includes globals: $, ai, db, on, send, list, research, extract
   */
  scope?: Record<string, any>

  /**
   * Remark plugins to apply
   */
  remarkPlugins?: any[]

  /**
   * Rehype plugins to apply
   */
  rehypePlugins?: any[]

  /**
   * Ink render options
   */
  inkOptions?: RenderOptions

  /**
   * Enable ANSI color support
   */
  colorize?: boolean

  /**
   * Enable streaming output
   */
  stream?: boolean
}

export interface RenderResult {
  /**
   * Wait for the Ink app to exit
   */
  waitUntilExit: () => Promise<void>

  /**
   * Unmount the Ink app
   */
  unmount: () => void

  /**
   * Re-render with new props
   */
  rerender: (tree: React.ReactElement) => void

  /**
   * Clear the output
   */
  clear: () => void
}

/**
 * Compile MDX content to a React component
 */
export async function compileMdxForInk(
  content: string,
  options: InkRendererOptions = {}
): Promise<React.ComponentType<any>> {
  const vfile = new VFile({ value: content })

  const compiled = await compile(vfile, {
    outputFormat: 'function-body',
    development: false,
    remarkPlugins: [
      remarkGfm,
      remarkFrontmatter,
      ...(options.remarkPlugins || [])
    ],
    rehypePlugins: options.rehypePlugins || [],
  })

  // Create the component function
  const componentCode = String(compiled)

  // Merge globals with user-provided scope
  const fullScope = {
    $,
    ai,
    db,
    on,
    send,
    list,
    research,
    extract,
    ...options.scope,
  }

  // eslint-disable-next-line no-new-func
  const fn = new Function(
    'React',
    'runtime',
    ...Object.keys(fullScope),
    ...Object.keys(options.components || {}),
    componentCode
  )

  // Execute with runtime and scope
  const { default: Component } = fn(
    React,
    runtime,
    ...Object.values(fullScope),
    ...Object.values(options.components || {})
  )

  return Component
}

/**
 * Render MDX content to CLI using React-ink
 */
export async function renderMdxToInk(
  content: string,
  options: InkRendererOptions = {}
): Promise<RenderResult> {
  const Component = await compileMdxForInk(content, options)

  // Wrap component with provided components
  const wrappedComponent = React.createElement(Component, {
    components: options.components || {},
    ...options.scope
  })

  // Render with Ink
  const result = render(wrappedComponent, options.inkOptions)

  return {
    waitUntilExit: result.waitUntilExit,
    unmount: result.unmount,
    rerender: result.rerender,
    clear: result.clear,
  }
}

/**
 * Render MDX file to CLI
 */
export async function renderMdxFileToInk(
  filePath: string,
  options: InkRendererOptions = {}
): Promise<RenderResult> {
  const fs = await import('fs/promises')
  const content = await fs.readFile(filePath, 'utf-8')
  return renderMdxToInk(content, options)
}

/**
 * Stream MDX rendering updates
 */
export async function* streamMdxToInk(
  contentStream: AsyncIterable<string>,
  options: InkRendererOptions = {}
): AsyncGenerator<RenderResult, void, unknown> {
  let currentRender: RenderResult | null = null

  for await (const content of contentStream) {
    if (currentRender) {
      currentRender.unmount()
    }

    currentRender = await renderMdxToInk(content, options)
    yield currentRender
  }
}

/**
 * Render static MDX to ANSI string (no interactive elements)
 */
export async function renderMdxToAnsi(
  content: string,
  options: InkRendererOptions = {}
): Promise<string> {
  const Component = await compileMdxForInk(content, options)
  const { renderToString } = await import('ink')

  const wrappedComponent = React.createElement(Component, {
    components: options.components || {},
    ...options.scope
  })

  return renderToString(wrappedComponent)
}
