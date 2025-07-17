'use client'

import { useState, useEffect } from 'react'
import { getHighlighter } from 'shiki'
import { Copy, Check } from 'lucide-react'
import { useTheme } from 'next-themes'

const defaultCodeSnippet = `import { Agent } from 'agents.do'
 
const amy = Agent({
  name: 'Amy',
  url: 'https://amy.do',
  role: 'Customer Support Agent',
  objective: 'Handles customer inquiries and resolves common issues',
  keyResults: ['ticketResponseTime', 'ticketResolutionTime', 'customerSatisfaction'],
  integrations: ['chat', 'slack', 'email', 'zendesk', 'shopify'],
  triggers: ['onTicketCreated', 'onMessageReceived'],
  searches: ['FAQs', 'Tickets', 'Orders', 'Products', 'Customers'],
  actions: ['sendMessage', 'updateOrder', 'refundOrder', 'resolveTicket', 'escalateTicket'],
})`

interface Code11Props {
  code?: string;
  language?: string;
}

export function Code11({ 
  code = defaultCodeSnippet, 
  language = 'typescript' 
}: Code11Props) {
  const [highlightedCode, setHighlightedCode] = useState<Record<string, string>>({})
  const [copied, setCopied] = useState(false)
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const highlightCode = async () => {
      const highlighter = await getHighlighter({
        themes: ['github-dark-default', 'github-light-high-contrast'],
        langs: [language]
      })

      const darkHtml = highlighter.codeToHtml(code, {
        lang: language,
        theme: 'github-dark-default'
      })

      const lightHtml = highlighter.codeToHtml(code, {
        lang: language,
        theme: 'github-light-high-contrast'
      })

      setHighlightedCode({
        dark: darkHtml,
        light: lightHtml
      })
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

  if (!mounted) {
    return null
  }

  const isDark = resolvedTheme === 'dark'
  const currentHighlightedCode = highlightedCode[isDark ? 'dark' : 'light']

  return (
    <div className="w-full max-w-xl mx-auto rounded-lg">
      {/* Glass Effect Outer Border */}
      <div className={`relative rounded-lg overflow-hidden p-1 backdrop-blur-md ${
        isDark 
          ? 'bg-white/5 border border-white/5' 
          : 'bg-linear-to-r from-white/5 to-gray-700/5 border border-black/5'
      }`}>
        <div className={`relative rounded-md overflow-hidden border ${
          isDark 
            ? 'bg-[#0d1117] border-gray-750' 
            : 'bg-white border-gray-200'
        }`}>
          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className={`absolute top-3 right-3 p-2 rounded-sm transition-colors duration-200 z-10 ${
              isDark
                ? 'hover:bg-gray-800'
                : 'hover:bg-gray-100'
            }`}
            title="Copy code"
          >
            {copied ? (
              <Check className={`w-3 h-3 ${isDark ? 'text-gray-200' : 'text-gray-600'}`} />
            ) : (
              <Copy className={`w-3 h-3 ${
                isDark 
                  ? 'text-gray-500 hover:text-gray-400' 
                  : 'text-gray-400 hover:text-gray-600'
              }`} />
            )}
          </button>

          {/* Code Content */}
          <div className="p-4 overflow-auto max-h-96">
            {currentHighlightedCode ? (
              <div
                dangerouslySetInnerHTML={{ __html: currentHighlightedCode }}
                className="text-[13px] leading-relaxed min-w-fit"
              />
            ) : (
              <div className={`text-xs leading-relaxed ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                <pre className="min-w-fit">{code}</pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
