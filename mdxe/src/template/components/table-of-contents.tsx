// @ts-nocheck
// Table of Contents component
export function TableOfContents({ toc }: { toc?: any[] }) {
  if (!toc || toc.length === 0) return null

  return (
    <div className='bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6'>
      <h3 className='text-lg font-semibold mb-3 text-gray-900'>Table of Contents</h3>
      <nav className='space-y-1'>
        {toc.map((item, index) => (
          <a
            key={index}
            href={item.href}
            className='block text-sm text-gray-600 hover:text-blue-600 transition-colors'
            style={{ paddingLeft: `${(item.depth - 1) * 12}px` }}
          >
            {item.value}
          </a>
        ))}
      </nav>
    </div>
  )
}
