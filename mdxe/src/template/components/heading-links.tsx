// @ts-nocheck
'use client'

import { useEffect } from 'react'

interface HeadingLinksProps {
  toc?: any[]
}

export function HeadingLinks({ toc }: HeadingLinksProps) {
  useEffect(() => {
    const handleHeadingClick = (e: Event) => {
      const target = e.currentTarget as HTMLElement
      const id = target.id
      if (id) {
        const url = `${window.location.origin}${window.location.pathname}#${id}`
        window.history.pushState(null, '', `#${id}`)

        // Optional: Copy to clipboard
        if (navigator.clipboard) {
          navigator.clipboard.writeText(url).then(() => {
            // Show a brief success indication
            const originalText = target.textContent
            target.style.opacity = '0.7'
            setTimeout(() => {
              target.style.opacity = '1'
            }, 200)
          })
        }
      }
    }

    // Get heading IDs that are in the TOC
    const tocHeadingIds = new Set(toc?.map((item) => item.href?.replace('#', '')).filter(Boolean) || [])

    // Add click handlers and special class only to headings that are in the TOC
    const headings = document.querySelectorAll('h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]')
    headings.forEach((heading) => {
      const id = heading.id
      if (tocHeadingIds.has(id)) {
        // Add a class to indicate this heading is in the TOC
        heading.classList.add('toc-heading')
        heading.addEventListener('click', handleHeadingClick)
      }
    })

    // Cleanup
    return () => {
      headings.forEach((heading) => {
        heading.removeEventListener('click', handleHeadingClick)
      })
    }
  }, [toc])

  return null
}
