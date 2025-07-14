// @ts-nocheck
import { Suspense } from 'react'
import { HeadingLinks } from './heading-links'
import { LoadingComponent } from './loading-component'
import { TableOfContents } from './table-of-contents'

interface ContentRenderProps {
  source: string
  content: React.ReactElement
  frontmatter?: any
  scope?: any
}

export function renderContent({ source, content, frontmatter, scope }: ContentRenderProps) {
  // Check if this is full-screen slides (no embedded prop)
  const isFullScreenSlides =
    (source.includes('<Slides>') || source.includes('<slides>')) && !(source.includes('<Slides embedded') || source.includes('<slides embedded'))

  if (isFullScreenSlides) {
    // Full-screen layout for slides
    return (
      <div className='mdx-content prose max-w-none'>
        <Suspense fallback={<LoadingComponent />}>{content}</Suspense>
        <HeadingLinks toc={scope?.toc} />
      </div>
    )
  }

  // Regular content layout (includes embedded slides, regular content, etc.)
  return (
    <div className='container mx-auto px-4 py-8'>
      <article className='max-w-4xl mx-auto'>
        {/* Render frontmatter if available */}
        {frontmatter?.title && (
          <header className='mb-8'>
            <h1 className='text-4xl font-bold text-gray-900 mb-2'>{frontmatter.title}</h1>
            {frontmatter.description && <p className='text-xl text-gray-600 mb-4'>{frontmatter.description}</p>}
            {frontmatter.date && <p className='text-sm text-gray-500'>{new Date(frontmatter.date).toLocaleDateString()}</p>}
          </header>
        )}

        {/* Table of Contents */}
        {scope?.toc && <TableOfContents toc={scope.toc} />}

        {/* MDX Content */}
        <div className='mdx-content prose max-w-none'>
          <Suspense fallback={<LoadingComponent />}>{content}</Suspense>
          <HeadingLinks toc={scope?.toc} />
        </div>
      </article>
    </div>
  )
}
