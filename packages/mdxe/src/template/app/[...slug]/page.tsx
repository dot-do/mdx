// @ts-nocheck
import { readFile } from 'fs/promises'
import type { EvaluateOptions } from 'next-mdx-remote-client/rsc'
import { evaluate } from 'next-mdx-remote-client/rsc'
import { notFound } from 'next/navigation'
import { join } from 'path'
import { renderContent } from '../../components/content-renderer'
import { getCommonMDXOptions } from '../../utils/mdx-utils'
import { useMDXComponents } from '../mdx-components'
import { MDXErrorComponent } from '../../components/mdx-error-component'

// Get all available MDX components
function getMDXComponents() {
  return useMDXComponents({})
}

interface PageProps {
  params: Promise<{
    slug: string[]
  }>
}

// This is a dynamic route that will handle MDX content
export default async function DynamicMDXPage({ params }: PageProps) {
  const { slug } = await params
  const slugPath = slug?.join('/') || ''

  // Try to find the MDX file
  const contentPath = join(process.cwd(), 'content', `${slugPath}.mdx`)

  try {
    // Use async readFile instead of sync to work better with Next.js hot reload
    const source = await readFile(contentPath, 'utf8')

    // Configure MDX options with all available plugins
    const options: EvaluateOptions = getCommonMDXOptions()

    // Use evaluate to get frontmatter and scope
    const { content, frontmatter, scope, error } = await evaluate({
      source,
      options,
      components: getMDXComponents(),
    })

    if (error) {
      return <MDXErrorComponent error={error} />
    }

    // Render content (handles both full-screen slides and regular content)
    return renderContent({ source, content, frontmatter, scope })
  } catch (error) {
    // File doesn't exist, show 404
    notFound()
  }
}

export async function generateStaticParams() {
  // In a full implementation, this would scan the content directory
  // and generate static params for all MDX files
  return []
}

// Force dynamic rendering to ensure file changes are detected
export const dynamic = 'force-dynamic'
