// @ts-nocheck
import Link from 'next/link'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { evaluate } from 'next-mdx-remote-client/rsc'
import type { EvaluateOptions } from 'next-mdx-remote-client/rsc'
import { useMDXComponents } from './mdx-components'
import { getCommonMDXOptions } from '../utils/mdx-utils'
import { renderContent } from '../components/content-renderer'
import { MDXErrorComponent } from '../components/mdx-error-component'

// Get all available MDX components
function getMDXComponents() {
  return useMDXComponents({})
}

export default async function Home() {
  // Check if user has provided content - try multiple possible index files
  const possibleIndexFiles = ['index.mdx', 'index.md', 'README.mdx', 'README.md']

  for (const filename of possibleIndexFiles) {
    try {
      const indexPath = join(process.cwd(), 'content', filename)
      const source = await readFile(indexPath, 'utf8')

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
      // File doesn't exist, try next one
      continue
    }
  }

  // No user content found, show default template
  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='text-center'>
        <h1 className='text-6xl font-bold text-gray-900 mb-4'>
          Welcome to
          <span className='text-blue-600'> mdxe</span>
        </h1>
        <p className='text-xl text-gray-600 mb-8'>A modern MDX development environment with embedded CMS</p>

        <div className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto'>
            <div className='bg-white p-6 rounded-lg shadow-md border'>
              <h2 className='text-2xl font-semibold mb-2'>📝 Content Management</h2>
              <p className='text-gray-600 mb-4'>Create and manage your content with the built-in Payload CMS</p>
              <Link href='/admin' className='inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors'>
                Open Admin Panel
              </Link>
            </div>

            <div className='bg-white p-6 rounded-lg shadow-md border'>
              <h2 className='text-2xl font-semibold mb-2'>🚀 Getting Started</h2>
              <p className='text-gray-600 mb-4'>Learn how to create MDX content and customize components</p>
              <Link href='/docs' className='inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors'>
                View Documentation
              </Link>
            </div>
          </div>

          <div className='mt-8 text-sm text-gray-500'>
            <p>
              Powered by <strong>Next.js 14+</strong> • <strong>Payload CMS</strong> • <strong>MDX</strong> • <strong>next-mdx-remote-client</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Force dynamic rendering to ensure file changes are detected
export const dynamic = 'force-dynamic'
