'use client'

import React, { useEffect, useRef } from 'react'
import 'reveal.js/dist/reveal.css'
import 'reveal.js/dist/theme/black.css'

declare global {
  interface Window {}
}

interface RevealOptions {
  plugins?: any[]
  hash?: boolean
  slideNumber?: boolean
  embedded?: boolean
  [key: string]: any
}

interface RevealApi {
  initialize: () => void
  destroy: () => void
}

interface SlidesProps {
  children: React.ReactNode
  options?: RevealOptions
  embedded?: boolean
  className?: string
}

export function Slides({ children, options, embedded = false, className = '' }: SlidesProps) {
  const deckRef = useRef<RevealApi | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isFullscreen, setIsFullscreen] = React.useState(false)

  useEffect(() => {
    if (!containerRef.current) return

    const initReveal = async () => {
      try {
        if (typeof window !== 'undefined' && !deckRef.current) {
          // CSS is already loaded via imports at the top of the file

          const RevealModule = await import('reveal.js')
          const Reveal = RevealModule.default

          const MarkdownModule = await import('reveal.js/plugin/markdown/markdown.esm.js')
          const Markdown = MarkdownModule.default

          const HighlightModule = await import('reveal.js/plugin/highlight/highlight.esm.js')
          const Highlight = HighlightModule.default

          const NotesModule = await import('reveal.js/plugin/notes/notes.esm.js')
          const Notes = NotesModule.default

          const revealOptions = {
            plugins: [Markdown, Highlight, Notes],
            hash: !embedded, // Disable hash for embedded mode
            slideNumber: !embedded, // Disable slide numbers for embedded mode
            embedded: embedded, // Tell Reveal.js this is embedded mode
            // Keep controls and progress enabled for embedded mode
            ...(options || {}),
          }

          deckRef.current = new Reveal(containerRef.current!, revealOptions)
          deckRef.current.initialize()

          // Remove reveal-full-page class from html element in embedded mode
          if (embedded) {
            document.documentElement.classList.remove('reveal-full-page')
          }

          // No cleanup needed for CSS imports
        }
      } catch (error) {
        console.error('Error initializing Reveal.js:', error)
      }
    }

    initReveal()

    return () => {
      if (deckRef.current) {
        deckRef.current.destroy()
        deckRef.current = null
      }
    }
  }, [options, embedded])

  console.log('Slides rendering with children:', children)

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  // Build CSS classes for reveal
  const revealClasses = ['reveal', embedded && !isFullscreen && 'embedded', isFullscreen && 'fullscreen', className].filter(Boolean).join(' ')

  const containerStyle = embedded
    ? {
        '--slide-width': '960px',
        '--slide-height': '700px',
        '--slide-scale': '0.94125',
        '--viewport-width': '1004px',
        '--viewport-height': '811px',
        cursor: 'none',
      }
    : {
        // Full-screen mode should take the full viewport
        width: '100vw',
        height: '100vh',
        position: 'fixed' as const,
        top: 0,
        left: 0,
        zIndex: 1000,
      }

  // Outer wrapper style for embedded mode (like reveal.js website)
  const wrapperStyle = embedded
    ? {
        height: '500px',
        maxHeight: '500px',
        position: 'relative' as const,
      }
    : {}

  const revealContent = (
    <div
      className={revealClasses}
      ref={containerRef}
      style={containerStyle}
      role={embedded ? 'application' : undefined}
      data-transition-speed={embedded ? 'default' : undefined}
      data-background-transition={embedded ? 'fade' : undefined}
    >
      <div
        className='slides'
        style={
          embedded
            ? {
                width: '960px',
                height: '700px',
                inset: '50% auto auto 50%',
                transform: 'translate(-50%, -50%) scale(0.94125)',
              }
            : {
                width: '100%',
                height: '100%',
              }
        }
      >
        {children}
      </div>
    </div>
  )

  // Wrap in reveal-demo container for embedded mode
  if (embedded) {
    return (
      <div className='reveal-demo' style={wrapperStyle}>
        {revealContent}
      </div>
    )
  }

  return revealContent
}

export function Slide({ children, ...props }: React.HTMLAttributes<HTMLElement>) {
  console.log('Slide rendering with children:', children)
  return <section {...props}>{children}</section>
}

const Reveal = {
  Slides,
  Slide,
}

export default Reveal
