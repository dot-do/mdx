'use client'

import { useState } from 'react'
import Editor from '@monaco-editor/react'
import { Play } from 'lucide-react'

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

// Create new loan application
await db.loans.create({ 
  applicantId: 'turbo123', 
  amount: 25000, 
  term: 60, 
  status: 'submitted' 
})

// Update document verification status
await db.docs.update('turbo123', { 
  verified: false, 
  missing: ['paystubs'] 
})

// Query loan applications
const loans = await db.loans.search('status:submitted')
console.log('Submitted loans:', loans.length)`

interface Code5Props {
  code?: string;
  language?: string;
}

export function Code5({ 
  code: initialCode = defaultCodeSnippet, 
  language = 'typescript'
}: Code5Props) {
  const [code, setCode] = useState(initialCode)
  const [output, setOutput] = useState<string[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [showOutput, setShowOutput] = useState(false)

  const mockExecution = async (code: string) => {
    const logs: string[] = []
    
    // Simulate database operations
    if (code.includes('db.loans.create')) {
      logs.push('✓ Created loan application for turbo123')
      logs.push('  Amount: $25,000 | Term: 60 months | Status: submitted')
    }
    
    if (code.includes('db.docs.update')) {
      logs.push('✓ Updated document verification status')
      logs.push('  Applicant: turbo123 | Verified: false | Missing: paystubs')
    }
    
    if (code.includes('db.loans.search')) {
      logs.push('✓ Querying submitted loan applications...')
      logs.push('Submitted loans: 3')
    }
    
    if (code.includes('console.log')) {
      const matches = code.match(/console\.log\(['"`]([^'"`]+)['"`],?\s*([^)]*)\)/g)
      if (matches) {
        matches.forEach(match => {
          if (match.includes('Submitted loans:')) {
            logs.push('Submitted loans: 3')
          }
        })
      }
    }
    
    return logs
  }

  const handleRun = async () => {
    setIsRunning(true)
    setOutput([])
    setShowOutput(true)
    
    try {
      // Simulate execution delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const result = await mockExecution(code)
      setOutput(result)
    } catch (error) {
      setOutput([`Error: ${error}`])
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="w-full max-w-xl mx-auto relative">
      <div className="relative bg-[#0a0c10] rounded-lg border border-gray-850 p-1 overflow-hidden">
        {/* Monaco Editor */}
        <div className={`border border-gray-700 dark:border-gray-800 text-[13px] relative overflow-hidden ${showOutput ? 'rounded-t-md border-b-0' : 'rounded-md'}`}>
          {/* Play Button */}
          <button
            onClick={handleRun}
            disabled={isRunning}
            className="absolute top-2 right-2 p-2 hover:bg-gray-800 rounded-sm transition-colors duration-200 z-20 disabled:opacity-50"
            title="Run code"
          >
            <Play className="w-3 h-3 text-gray-400 hover:text-gray-200" fill="currentColor" />
          </button>

          <div className="h-60 relative">
            <Editor
              value={code}
              onChange={(value) => setCode(value || '')}
              language={language}
              theme="vs-dark"
              path={`code-5.${language === 'typescript' ? 'ts' : language === 'javascript' ? 'js' : language}`}
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

        {/* Output Section */}
        {showOutput && (
          <div className="border-l border-r border-b border-gray-700 dark:border-gray-800 bg-[#0d1117] rounded-b-md">
            <div className="border-t border-gray-800"></div>
            <div className="p-3">
              <div className="space-y-1">
                {isRunning ? (
                  <div className="text-yellow-400 text-[13px] animate-pulse">
                    Running...
                  </div>
                ) : output.length > 0 ? (
                  output.map((line, index) => (
                    <div key={index} className="text-[12px] text-gray-300 font-mono px-1.5">
                      {line}
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 text-[13px]">
                    Click the play button to run the code
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 