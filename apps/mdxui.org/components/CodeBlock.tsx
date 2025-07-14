'use client'

import { useEffect, useState } from 'react'
import { codeToHtml } from 'shiki'

interface CodeBlockProps {
  code?: string;
  language?: string;
  theme?: string;
  className?: string;
  showLineNumbers?: boolean;
  maxHeight?: string;
}

const defaultCode = `function hello() {
  console.log("Hello, World!");
  return "Welcome to the code block!";
}

hello();`;

export default function CodeBlock({ 
  code = defaultCode, 
  language = 'javascript', 
  theme = 'github-dark',
  className = '',
  showLineNumbers = false,
  maxHeight
}: CodeBlockProps) {
  const [html, setHtml] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const highlightCode = async () => {
      try {
        setIsLoading(true)
        const highlightedCode = await codeToHtml(code, {
          lang: language,
          theme: theme,
        })
        setHtml(highlightedCode)
      } catch (error) {
        console.error('Error highlighting code:', error)
        // Fallback to plain text if highlighting fails
        setHtml(`<pre><code>${code}</code></pre>`)
      } finally {
        setIsLoading(false)
      }
    }

    highlightCode()
  }, [code, language, theme])

  if (isLoading) {
    return (
      <div className={`rounded-lg bg-gray-900 p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-700 rounded w-5/6"></div>
        </div>
      </div>
    )
  }

  const containerStyle = maxHeight ? { maxHeight } : {};

  return (
    <div 
      className={`rounded-lg overflow-hidden ${className}`}
      style={containerStyle}
    >
      <div 
        className={`${showLineNumbers ? 'code-with-line-numbers' : ''} overflow-auto`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}

export { CodeBlock, type CodeBlockProps }; 