import React, { useEffect, useRef, useState } from 'react'
import * as monaco from 'monaco-editor'
import type { TestResult } from '../components/TestResultsPanel'

interface EditModeProps {
  content: string
  language: string
  theme: string
  onContentChange: (content: string) => void
  onSave: () => void
  readOnly: boolean
  isLoading: boolean
  error: string | null
  // Test runner props
  enableTesting?: boolean
  onRunTests?: (results: TestResult) => void
  showTestButton?: boolean
}

export const EditMode: React.FC<EditModeProps> = ({
  content,
  language,
  theme,
  onContentChange,
  onSave,
  readOnly,
  isLoading,
  error,
  enableTesting = true,
  onRunTests,
  showTestButton = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)
  const [isRunningTests, setIsRunningTests] = useState(false)

  useEffect(() => {
    if (!containerRef.current) return

    monaco.editor.getModels().forEach((model) => model.dispose())

    const getMonacoLanguage = (lang: string) => {
      const langMap: Record<string, string> = {
        markdown: 'markdown',
        mdx: 'markdown',
        javascript: 'javascript',
        typescript: 'typescript',
        json: 'json',
        html: 'html',
        css: 'css',
      }
      return langMap[lang] || 'plaintext'
    }

    const editor = monaco.editor.create(containerRef.current, {
      value: content,
      language: getMonacoLanguage(language),
      theme: theme === 'github-dark' ? 'vs-dark' : 'vs',
      readOnly,
      wordWrap: 'on',
      lineNumbers: 'on',
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      fontSize: 14,
      fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
    })

    editorRef.current = editor

    const disposable = editor.onDidChangeModelContent(() => {
      const newContent = editor.getValue()
      onContentChange(newContent)
    })

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      onSave()
    })

    // Add keyboard shortcut for running tests (Cmd+Shift+T)
    if (enableTesting) {
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyT, () => {
        runTests()
      })
    }

    return () => {
      disposable.dispose()
      editor.dispose()
    }
  }, [language, theme, readOnly, enableTesting])

  // Test runner function
  const runTests = async () => {
    if (!onRunTests || !editorRef.current) return

    const currentContent = editorRef.current.getValue()
    setIsRunningTests(true)

    try {
      // Mock test results for now - will be replaced with actual test runner
      // In production, this would call the test runner from mdxe
      const mockResults: TestResult = {
        blocks: {
          passed: 3,
          failed: 0,
          total: 3,
        },
        assertions: {
          passed: 12,
          failed: 0,
          total: 12,
        },
        failures: [],
        successes: [
          { line: 5, message: 'Expected 30 to be 30' },
          { line: 10, message: 'Expected true to be true' },
          { line: 15, message: 'Expected "hello" to contain "hello"' },
        ],
      }

      // Simulate test execution delay
      await new Promise((resolve) => setTimeout(resolve, 500))

      onRunTests(mockResults)
    } catch (error) {
      console.error('Test execution failed:', error)
    } finally {
      setIsRunningTests(false)
    }
  }

  useEffect(() => {
    if (editorRef.current && editorRef.current.getValue() !== content) {
      editorRef.current.setValue(content)
    }
  }, [content])

  return (
    <div className='mdxui-edit-mode' style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* Test Runner Toolbar */}
      {enableTesting && showTestButton && (
        <div
          className='mdxui-toolbar'
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            zIndex: 100,
            display: 'flex',
            gap: '8px',
          }}
        >
          <button
            onClick={runTests}
            disabled={isRunningTests}
            className='mdxui-test-button'
            title='Run Tests (Cmd+Shift+T)'
            style={{
              padding: '6px 12px',
              background: isRunningTests ? '#6e7681' : '#238636',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '12px',
              cursor: isRunningTests ? 'not-allowed' : 'pointer',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {isRunningTests ? (
              <>
                <span style={{ animation: 'spin 1s linear infinite' }}>⟳</span>
                Running...
              </>
            ) : (
              <>
                <span>▶</span>
                Run Tests
              </>
            )}
          </button>
        </div>
      )}

      {error && (
        <div
          className='mdxui-error-banner'
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            backgroundColor: '#f85149',
            color: 'white',
            padding: '8px 16px',
            fontSize: '12px',
            zIndex: 1000,
          }}
        >
          {error}
        </div>
      )}
      {isLoading && (
        <div
          className='mdxui-loading-overlay'
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '14px',
            zIndex: 1001,
          }}
        >
          Saving...
        </div>
      )}
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '100%',
          marginTop: error ? '40px' : '0',
        }}
      />

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .mdxui-test-button:hover:not(:disabled) {
          background: #2ea043;
        }
      `}</style>
    </div>
  )
}
