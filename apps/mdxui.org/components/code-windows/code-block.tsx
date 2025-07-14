'use client'

import { useState, useEffect } from 'react'
import { getHighlighter } from 'shiki'

const defaultCodeSnippet = `<Hero>

  # Welcome to the future of Autonomous Social Media

  Reply.md is a platform that allows you to create and manage your social media accounts. you to create and manage your social media accounts.

  [Get Started](https://reply.md/login)
  [Learn More](#Features)

</Hero>`

interface CodeBlockProps {
  className?: string;
  code?: string;
  language?: string;
}

export function CodeBlock({ 
  className = "", 
  code = defaultCodeSnippet, 
  language = 'markdown' 
}: CodeBlockProps) {
  const [highlightedCode, setHighlightedCode] = useState<string>('')

  useEffect(() => {
    const highlightCode = async () => {
      const highlighter = await getHighlighter({
        themes: ['github-dark-default'],
        langs: [language]
      })

      const html = highlighter.codeToHtml(code, {
        lang: language,
        theme: 'github-dark-default'
      })

      setHighlightedCode(html)
    }

    highlightCode()
  }, [code, language])

  // Enable text wrapping for markdown/mdx, maintain horizontal scroll for code languages
  const shouldWrapText = language === 'markdown' || language === 'mdx'

  return (
    <div className={`w-full ${className}`}>
      <div className="relative bg-[#0d1117] rounded-lg overflow-hidden border border-gray-750 h-full flex items-center">
        {/* Code Content */}
        <div className="p-4 overflow-auto w-full">
          {highlightedCode ? (
            <div
              dangerouslySetInnerHTML={{ __html: highlightedCode }}
              className={`text-[13px] leading-relaxed ${
                shouldWrapText 
                  ? // Force text wrapping on all elements (overrides Shiki's default CSS)
                    '[&_*]:!whitespace-pre-wrap [&_*]:!break-words [&_*]:![overflow-wrap:anywhere]' 
                  : // Maintain horizontal scrolling for code readability
                    'min-w-fit'
              }`}
            />
          ) : (
            <div className="text-gray-400 text-xs leading-relaxed">
              <pre 
                className={shouldWrapText ? 'whitespace-pre-wrap break-words' : 'min-w-fit'}
                style={shouldWrapText ? {
                  overflowWrap: 'anywhere'
                } : {}}
              >
                {code}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 