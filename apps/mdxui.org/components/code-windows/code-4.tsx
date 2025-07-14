'use client'

import { useState } from 'react'
import Editor from '@monaco-editor/react'
import { Copy, Check } from 'lucide-react'

const defaultCodeSnippet = `import { DB } from 'workflows.do'

const db = DB({
  loans: {
    applicantId: String,
    amount: Number,
    term: Number,
    riskScore: Number,
    offerTerms: String,
    status: String,
  },
  docs: {
    applicantId: String,
    verified: Boolean,
    missing: [String],
  },
})

// Create new loan application`

interface Code4Props {
  code?: string;
  language?: string;
}

export function Code4({ 
  code: initialCode = defaultCodeSnippet, 
  language = 'typescript'
}: Code4Props) {
  const [code, setCode] = useState(initialCode)
  const [copied, setCopied] = useState(false)

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
    <div className="w-full max-w-xl mx-auto relative">
      <div className="relative bg-[#0d1117] rounded-lg border border-gray-750 overflow-hidden">
        {/* Copy Button */}
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 p-2 hover:bg-gray-800 rounded-sm transition-colors duration-200 z-20"
          title="Copy code"
        >
          {copied ? (
            <Check className="w-3 h-3 text-gray-200" />
          ) : (
            <Copy className="w-3 h-3 text-gray-400" />
          )}
        </button>

        {/* Monaco Editor */}
        <div className="h-80 relative">
          <Editor
            value={code}
            onChange={(value) => setCode(value || '')}
            language={language}
            theme="vs-dark"
            path={`code-4.${language === 'typescript' ? 'ts' : language === 'javascript' ? 'js' : language}`}
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              lineHeight: 20,
              padding: { top: 16, bottom: 16 },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              wordWrap: 'on',
              contextmenu: false,
              lineNumbers: 'off',
              renderLineHighlight: 'none',
              overviewRulerBorder: false,
              hideCursorInOverviewRuler: true,
              overviewRulerLanes: 0,
              hover: {
                enabled: true,
                delay: 300,
                sticky: true
              },
              suggest: {
                showIcons: true,
                showSnippets: true,
                showWords: true,
                showColors: true,
                showFiles: true,
                showReferences: true,
                showFolders: true,
                showTypeParameters: true,
                showIssues: true,
                showUsers: true,
                showValues: true,
                showMethods: true,
                showFunctions: true,
                showConstructors: true,
                showFields: true,
                showVariables: true,
                showClasses: true,
                showStructs: true,
                showInterfaces: true,
                showModules: true,
                showProperties: true,
                showEvents: true,
                showOperators: true,
                showUnits: true,
                showKeywords: true
              }
            }}
          />
        </div>
      </div>
    </div>
  )
} 