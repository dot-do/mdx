'use client'

import { useState, useEffect } from 'react'
import { getHighlighter } from 'shiki'
import { Copy, Check } from 'lucide-react'

const defaultCodeSnippet = `import { ai } from 'workflows.do'
import { db } from 'database.do'

await db.ideas.create({ concept: 'Digital AI Workers' })
await db.ideas.create({ concept: 'Agentic Workflow Platform' })

const ideas = await db.ideas.search('AI Agents')

ideas.forEach(async (idea) => {
  idea.status = 'Evaluating market potential'
  const leanCanvas = await ai.defineLeanCanvas({ idea })
  const marketResearch = await ai.research({ idea, leanCanvas })
  await db.ideas.update({ ...idea, leanCanvas, marketResearch })
})`

interface Code1Props {
  code?: string;
  language?: string;
}

export function Code1({ 
  code = defaultCodeSnippet, 
  language = 'typescript' 
}: Code1Props) {
  const [highlightedCode, setHighlightedCode] = useState<string>('')
  const [copied, setCopied] = useState(false)

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

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy code:', err)
    }
  }

  return (
    <div className="w-full max-w-xl mx-auto shadow-xl rounded-lg">
      <div className="relative bg-[#0d1117] rounded-lg overflow-hidden border border-gray-750">
        {/* Copy Button */}
        <button
          onClick={handleCopy}
          className="absolute top-3 right-3 p-2 hover:bg-gray-800 rounded-sm transition-colors duration-200 z-10"
          title="Copy code"
        >
          {copied ? (
            <Check className="w-3 h-3 text-gray-200" />
          ) : (
            <Copy className="w-3 h-3 text-gray-500 hover:text-gray-400" />
          )}
        </button>

        {/* Code Content */}
        <div className="p-4 overflow-auto max-h-96">
          {highlightedCode ? (
            <div
              dangerouslySetInnerHTML={{ __html: highlightedCode }}
              className="text-[13px] leading-relaxed min-w-fit"
            />
          ) : (
            <div className="text-gray-400 text-xs leading-relaxed">
              <pre className="min-w-fit">{code}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
