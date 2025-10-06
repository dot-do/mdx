import React from 'react'

export interface TestResult {
  blocks: {
    passed: number
    failed: number
    total: number
  }
  assertions: {
    passed: number
    failed: number
    total: number
  }
  failures: Array<{
    line: number
    message: string
    expected: any
    actual: any
  }>
  successes: Array<{
    line: number
    message: string
  }>
}

interface TestResultsPanelProps {
  results: TestResult
  onClose: () => void
}

export const TestResultsPanel: React.FC<TestResultsPanelProps> = ({ results, onClose }) => {
  const success = results.assertions.failed === 0
  const backgroundColor = success ? '#0d4818' : '#6e1515'
  const borderColor = success ? '#2ea043' : '#f85149'

  return (
    <div
      className="mdxui-test-results-panel"
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '200px',
        backgroundColor,
        color: 'white',
        padding: '16px',
        fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
        fontSize: '12px',
        overflowY: 'auto',
        borderTop: `2px solid ${borderColor}`,
        zIndex: 100,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
          {success ? '✅ All tests passed!' : '❌ Tests failed'}
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            fontSize: '16px',
            padding: '4px 8px',
          }}
          title="Close test results"
        >
          ×
        </button>
      </div>

      <div style={{ display: 'flex', gap: '24px', marginBottom: '16px' }}>
        <div>
          <strong>Blocks:</strong>{' '}
          <span style={{ color: success ? '#2ea043' : '#ffa657' }}>
            {results.blocks.passed}/{results.blocks.total}
          </span>
          {results.blocks.failed > 0 && <span style={{ color: '#f85149' }}> ({results.blocks.failed} failed)</span>}
        </div>
        <div>
          <strong>Assertions:</strong>{' '}
          <span style={{ color: success ? '#2ea043' : '#ffa657' }}>
            {results.assertions.passed}/{results.assertions.total}
          </span>
          {results.assertions.failed > 0 && <span style={{ color: '#f85149' }}> ({results.assertions.failed} failed)</span>}
        </div>
      </div>

      {results.failures.length > 0 && (
        <div>
          <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#f85149' }}>Failures:</div>
          {results.failures.map((failure, i) => (
            <div
              key={i}
              style={{
                marginBottom: '12px',
                padding: '8px',
                backgroundColor: 'rgba(0,0,0,0.3)',
                borderRadius: '4px',
                borderLeft: '3px solid #f85149',
              }}
            >
              <div style={{ marginBottom: '4px' }}>
                <strong>Line {failure.line}:</strong> {failure.message}
              </div>
              <div style={{ marginTop: '6px', fontSize: '11px', paddingLeft: '8px' }}>
                <div style={{ color: '#f85149', marginBottom: '2px' }}>
                  Expected: <code style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '2px 4px', borderRadius: '2px' }}>{JSON.stringify(failure.expected)}</code>
                </div>
                <div style={{ color: '#ffa657' }}>
                  Actual: <code style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '2px 4px', borderRadius: '2px' }}>{JSON.stringify(failure.actual)}</code>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {success && results.successes.length > 0 && (
        <div>
          <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#2ea043' }}>
            {results.successes.length} assertion{results.successes.length !== 1 ? 's' : ''} passed
          </div>
          <div style={{ fontSize: '11px', color: '#8b949e' }}>All tests completed successfully</div>
        </div>
      )}
    </div>
  )
}
