'use client'

import { useState, useEffect } from 'react'
import { getHighlighter } from 'shiki'
import { Copy, Check, File } from 'lucide-react'

const defaultCodeSnippet = `import { every, on } from 'workflows.do'

// run hourly to enrich new ideas in the database
every('hour during business hours', async (_, { ai, db }) => {
  const drafts = await db.ideas.search('status:draft')
  for (const idea of drafts) {
    const leanCanvas = await ai.defineLeanCanvas({ idea })
    const research = await ai.research({ idea, leanCanvas })
    await db.ideas.update({ ...idea, leanCanvas, research })
  }
})

// react to external events from other systems
on('CreditApp.Submitted', async ({ creditApp }, { ai, db }) => {
  const score = await ai.call('riskScore', { creditReport: creditApp.creditReport, income: creditApp.income })
  const terms = await ai.call('priceLoan', { score, amount: creditApp.amount, term: creditApp.term })
  await db.creditApps.update({ ...creditApp, score, terms })
})`

interface Code2Props {
  code?: string;
  language?: string;
  filename?: string;
}

export function Code2({ 
  code = defaultCodeSnippet, 
  language = 'typescript',
  filename = 'workflows.do'
}: Code2Props) {
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
      <div className="relative bg-[#0a0c10] rounded-lg overflow-hidden border border-gray-850 p-1">
        {/* Nav Bar */}
        <div className="flex items-center justify-between px-2 py-1 text-gray-400">
          <div className="flex items-center gap-2">
            <File className="w-3 h-3" />
            <div className="text-[13px] text-gray-400 font-medium truncate">
              {filename}
            </div>
          </div>
          <button
            onClick={handleCopy}
            className="p-1.5 hover:bg-gray-800 rounded-sm transition-colors duration-200"
            title="Copy code"
          >
            {copied ? (
              <Check className="w-3 h-3 text-gray-200" />
            ) : (
              <Copy className="w-3 h-3 text-gray-500 hover:text-gray-400" />
            )}
          </button>
        </div>

        {/* Code Content with Inner Border */}
        <div className="rounded-md border border-gray-700 dark:border-gray-800 text-[13px] py-3.5 overflow-auto max-h-96 bg-[#0d1117]">
          {highlightedCode ? (
            <div
              dangerouslySetInnerHTML={{ __html: highlightedCode }}
              className="leading-relaxed min-w-fit px-4"
            />
          ) : (
            <div className="text-gray-400 leading-relaxed px-4">
              <pre className="min-w-fit">{code}</pre>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
