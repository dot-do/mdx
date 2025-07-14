// @ts-nocheck
import Link from 'next/link'

export default function DocsPage() {
  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='max-w-4xl mx-auto'>
        <h1 className='text-4xl font-bold mb-8'>Documentation</h1>

        <div className='space-y-8'>
          <section>
            <h2 className='text-2xl font-semibold mb-4'>Getting Started</h2>
            <p className='text-gray-700 mb-4'>Welcome to mdxe! This is a zero-config CLI for MDX development with an embedded CMS.</p>

            <div className='bg-gray-50 rounded-lg p-4 mb-4'>
              <h3 className='font-semibold mb-2'>Installation</h3>
              <code className='bg-gray-900 text-white px-2 py-1 rounded'>npm install mdxe</code>
            </div>

            <div className='bg-gray-50 rounded-lg p-4'>
              <h3 className='font-semibold mb-2'>Usage</h3>
              <div className='space-y-2 text-sm'>
                <div>
                  <code className='bg-gray-900 text-white px-2 py-1 rounded'>mdxe dev</code> - Start development server
                </div>
                <div>
                  <code className='bg-gray-900 text-white px-2 py-1 rounded'>mdxe build</code> - Build for production
                </div>
                <div>
                  <code className='bg-gray-900 text-white px-2 py-1 rounded'>mdxe start</code> - Start production server
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className='text-2xl font-semibold mb-4'>MDX Components</h2>
            <p className='text-gray-700 mb-4'>mdxe comes with built-in components that you can use in your MDX content.</p>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='bg-white border rounded-lg p-4'>
                <h3 className='font-semibold mb-2'>Alert</h3>
                <p className='text-sm text-gray-600'>Display alerts with different types</p>
              </div>

              <div className='bg-white border rounded-lg p-4'>
                <h3 className='font-semibold mb-2'>YouTube</h3>
                <p className='text-sm text-gray-600'>Embed YouTube videos</p>
              </div>

              <div className='bg-white border rounded-lg p-4'>
                <h3 className='font-semibold mb-2'>Callout</h3>
                <p className='text-sm text-gray-600'>Create callout boxes</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className='text-2xl font-semibold mb-4'>Custom Components</h2>
            <p className='text-gray-700 mb-4'>
              You can extend mdxe with your own components by creating an <code>mdx-components.js</code> file:
            </p>

            <pre className='bg-gray-900 text-white rounded-lg p-4 overflow-x-auto'>
              <code>{`// mdx-components.js
export function useMDXComponents(components) {
  return {
    ...components,
    MyCustomComponent: ({ children }) => (
      <div className="my-custom-style">{children}</div>
    ),
  }
}`}</code>
            </pre>
          </section>
        </div>

        <div className='mt-8 pt-8 border-t'>
          <Link href='/' className='text-blue-600 hover:text-blue-800'>
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
