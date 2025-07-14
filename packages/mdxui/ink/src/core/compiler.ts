import { compile, evaluate, type UseMdxComponents } from '@mdx-js/mdx'
import { VFile } from 'vfile'
import * as runtime from 'react/jsx-runtime'
import React from 'react'
import { parseFrontmatter } from './frontmatter.js'
import { getPlugins } from './plugins.js'

export interface CompileOptions {
  remarkPlugins?: any[]
  rehypePlugins?: any[]
  components?: Record<string, React.ComponentType<any>>
  development?: boolean
}

/**
 * Compile MDX content to a React component
 */
export async function compileMdx(mdxContent: string, scope: Record<string, any> = {}, options: CompileOptions = {}): Promise<React.ComponentType<any>> {
  try {
    // Parse frontmatter first
    const { mdxContent: contentWithoutFrontmatter } = parseFrontmatter(mdxContent)

    const plugins = getPlugins(options)

    const result = await compile(new VFile(contentWithoutFrontmatter), {
      jsx: true,
      jsxImportSource: 'react',
      development: options.development ?? process.env.NODE_ENV !== 'production',
      ...plugins,
    })

    // Prepare components for MDX
    const useMDXComponents: UseMdxComponents = () => options.components || {}

    const { default: Component } = await evaluate(result, {
      ...runtime,
      ...scope,
      useMDXComponents,
    })

    return Component || (() => null)
  } catch (error) {
    console.error('Error compiling MDX:', error)

    // Return error component
    return ({ components }: { components?: any }) => {
      const Text = components?.Text || 'div'
      return React.createElement(Text, {}, 'Error rendering MDX content. See console for details.')
    }
  }
}
