# Monaco Editor - Literate Testing Integration Plan

## Overview

Integrate the literate testing capability (Phase 4) into the Monaco editor in `@mdxui/browser`, enabling users to run tests directly from the editor and see results inline.

## Current State

**Monaco Editor Components:**
- `EditMode.tsx` - Editor with syntax highlighting, save functionality (Cmd+S)
- `monacoIntegration.ts` - Monaco initialization and configuration
- `BrowserComponent.tsx` - Main component with mode switching

**Literate Testing CLI:**
- `test-doc.ts` - Document test runner
- `execution-engine.ts` - Code block execution
- `output-injector.ts` - Assertion injection

## Integration Plan

### 1. Add Test Runner Button and Keyboard Shortcut

**EditMode.tsx changes:**

```typescript
import { runDocumentTests } from 'mdxe/cli/commands/test-doc'

interface EditModeProps {
  // ... existing props
  onRunTests?: (results: TestResults) => void
  showTestButton?: boolean
}

export const EditMode: React.FC<EditModeProps> = ({
  // ... existing props
  onRunTests,
  showTestButton = true
}) => {
  // Add test runner keyboard shortcut (Cmd+Shift+T)
  editor.addCommand(
    monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyT,
    async () => {
      await runTests()
    }
  )

  const runTests = async () => {
    const content = editorRef.current?.getValue()
    if (!content) return

    // Run literate tests on current content
    const results = await runDocumentTests([{ content, filename: 'editor.mdx' }], {
      update: false,
      verbose: false,
      skipAuth: true
    })

    // Display results
    if (onRunTests) {
      onRunTests(results)
    }
  }

  // Add Test Runner button to toolbar
  return (
    <div className="mdxui-edit-mode">
      {showTestButton && (
        <div className="mdxui-toolbar">
          <button
            onClick={runTests}
            className="mdxui-test-button"
            title="Run Tests (Cmd+Shift+T)"
          >
            ▶ Run Tests
          </button>
        </div>
      )}
      {/* ... existing editor */}
    </div>
  )
}
```

### 2. Test Results Panel

Create new component `TestResultsPanel.tsx`:

```typescript
interface TestResult {
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
}

export const TestResultsPanel: React.FC<{ results: TestResult }> = ({ results }) => {
  const success = results.assertions.failed === 0

  return (
    <div className="test-results-panel" style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: '200px',
      backgroundColor: success ? '#0d4818' : '#6e1515',
      color: 'white',
      padding: '16px',
      fontFamily: 'monospace',
      fontSize: '12px',
      overflowY: 'auto',
      borderTop: `2px solid ${success ? '#2ea043' : '#f85149'}`
    }}>
      <div style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
        <div>
          <strong>Blocks:</strong> {results.blocks.passed}/{results.blocks.total}
        </div>
        <div>
          <strong>Assertions:</strong> {results.assertions.passed}/{results.assertions.total}
        </div>
      </div>

      {results.failures.length > 0 && (
        <div>
          <strong>Failures:</strong>
          {results.failures.map((failure, i) => (
            <div key={i} style={{ marginTop: '8px', padding: '8px', backgroundColor: 'rgba(0,0,0,0.2)' }}>
              <div>Line {failure.line}: {failure.message}</div>
              <div style={{ marginTop: '4px', fontSize: '11px' }}>
                <span style={{ color: '#f85149' }}>Expected: {JSON.stringify(failure.expected)}</span>
                <br />
                <span style={{ color: '#ffa657' }}>Actual: {JSON.stringify(failure.actual)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

### 3. Inline Test Decorations

Add Monaco decorations to show test results inline:

```typescript
function addTestDecorations(
  editor: monaco.editor.IStandaloneCodeEditor,
  results: TestResult
) {
  const decorations: monaco.editor.IModelDeltaDecoration[] = []

  // Add green checkmarks for passing assertions
  for (const success of results.successes) {
    decorations.push({
      range: new monaco.Range(success.line, 1, success.line, 1),
      options: {
        isWholeLine: false,
        glyphMarginClassName: 'test-success-glyph',
        glyphMarginHoverMessage: { value: '✅ Test passed' },
        inlineClassName: 'test-success-inline'
      }
    })
  }

  // Add red X for failing assertions
  for (const failure of results.failures) {
    decorations.push({
      range: new monaco.Range(failure.line, 1, failure.line, 1),
      options: {
        isWholeLine: false,
        glyphMarginClassName: 'test-failure-glyph',
        glyphMarginHoverMessage: { value: `❌ ${failure.message}` },
        inlineClassName: 'test-failure-inline'
      }
    })
  }

  editor.deltaDecorations([], decorations)
}
```

### 4. BrowserComponent Integration

Update `BrowserComponent.tsx` to support test mode:

```typescript
export const BrowserComponent: React.FC<BrowserComponentProps> = (props) => {
  const [testResults, setTestResults] = useState<TestResult | null>(null)
  const [showTestPanel, setShowTestPanel] = useState(false)

  return (
    <div className="mdxui-browser">
      {mode === 'edit' && (
        <>
          <EditMode
            {...editModeProps}
            onRunTests={(results) => {
              setTestResults(results)
              setShowTestPanel(true)
            }}
          />
          {showTestPanel && testResults && (
            <TestResultsPanel
              results={testResults}
              onClose={() => setShowTestPanel(false)}
            />
          )}
        </>
      )}
    </div>
  )
}
```

### 5. CSS Styles

Add styles for test decorations:

```css
.test-success-glyph {
  background: url('data:image/svg+xml,...') no-repeat center center;
  cursor: pointer;
}

.test-failure-glyph {
  background: url('data:image/svg+xml,...') no-repeat center center;
  cursor: pointer;
}

.test-success-inline {
  text-decoration: underline;
  text-decoration-color: #2ea043;
  text-decoration-style: wavy;
}

.test-failure-inline {
  text-decoration: underline;
  text-decoration-color: #f85149;
  text-decoration-style: wavy;
}

.mdxui-toolbar {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 100;
  display: flex;
  gap: 8px;
}

.mdxui-test-button {
  padding: 6px 12px;
  background: #238636;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.mdxui-test-button:hover {
  background: #2ea043;
}
```

## Implementation Steps

### Phase 1: Basic Test Runner (Week 1)
1. ✅ Add test runner function to EditMode
2. ✅ Add keyboard shortcut (Cmd+Shift+T)
3. ✅ Add Run Tests button
4. ✅ Create TestResultsPanel component
5. ✅ Wire up test execution

### Phase 2: Inline Decorations (Week 2)
1. Add Monaco decorations for test results
2. Show checkmarks/X marks in gutter
3. Add hover tooltips for failures
4. Highlight passing/failing lines

### Phase 3: Advanced Features (Week 3)
1. Add "Update Outputs" button (uses --update flag)
2. Show diff view for output changes
3. Add test coverage indicators
4. Enable watch mode (re-run on change)

### Phase 4: Polish (Week 4)
1. Add animations for test execution
2. Improve error messages
3. Add test statistics dashboard
4. Export test results (JSON, HTML)

## User Experience

### Running Tests

**Keyboard Shortcut:**
```
Cmd+Shift+T (Mac)
Ctrl+Shift+T (Windows/Linux)
```

**Button:**
- Floating "▶ Run Tests" button in top-right corner
- Shows loading spinner during execution
- Changes to "✅ Tests Passed" or "❌ Tests Failed" after

**Results Panel:**
- Slides up from bottom
- 200px height (resizable)
- Green background for success, red for failures
- Shows block/assertion counts
- Lists all failures with line numbers

### Inline Indicators

**Passing Tests:**
- ✅ Green checkmark in gutter
- Subtle green underline

**Failing Tests:**
- ❌ Red X in gutter
- Red wavy underline
- Hover shows expected vs actual values

### Auto-Update Mode

**Button:** "↻ Update Outputs"
- Runs tests with `--update` flag
- Shows diff view of changes
- Prompts user to accept/reject changes
- Updates file on accept

## API Changes

### New Props for BrowserComponent

```typescript
interface BrowserComponentProps {
  // ... existing props
  enableTesting?: boolean           // Enable test runner (default: true)
  testConfig?: TestConfig           // Test configuration
  onTestResults?: (results: TestResult) => void
}

interface TestConfig {
  autoRun?: boolean                 // Run tests on save
  showInlineResults?: boolean       // Show decorations
  updateMode?: boolean              // Enable --update flag
}
```

### Example Usage

```javascript
MdxuiBrowser.render('editor-container', {
  mode: 'edit',
  content: '# My Test\n\n```ts assert\nexpect(1+1).toBe(2)\n```',
  enableTesting: true,
  testConfig: {
    autoRun: false,
    showInlineResults: true,
    updateMode: false
  },
  onTestResults: (results) => {
    console.log('Test Results:', results)
  }
})
```

## Browser Compatibility

Test runner requires:
- Monaco Editor (already included)
- esbuild-wasm (for TypeScript transpilation)
- Web Workers (for isolated execution)

**Fallback:**
- If esbuild-wasm not available, use API endpoint
- Show "Tests run in browser" indicator

## Security Considerations

**Code Execution:**
- Run tests in isolated Web Worker
- No access to parent window
- Restricted console/network access
- Timeout after 30 seconds

**Content Security Policy:**
- Allow esbuild-wasm WASM module
- Allow Web Workers
- Restrict eval/Function (use esbuild only)

## Documentation

### User Guide

Add section to `@mdxui/browser` README:

```markdown
## Literate Testing

Run tests directly in the editor:

### Basic Testing

Add `ts assert` to code blocks:

\```ts assert
const sum = 10 + 20
expect(sum).toBe(30)
\```

### Running Tests

- Press **Cmd+Shift+T** (Mac) or **Ctrl+Shift+T** (Windows)
- Click **Run Tests** button
- Tests run automatically on save (if enabled)

### Test Results

- ✅ Green = Passed
- ❌ Red = Failed
- Hover over indicators for details

### Auto-Update

Click **Update Outputs** to inject assertion results as comments:

\```ts assert
const sum = 10 + 20
expect(sum).toBe(30)
// ✅ Expected 30 to be 30
\```
```

## Next Steps

1. **Implement Phase 1** (Basic test runner)
2. **Test with example MDX files**
3. **Add Phase 2** (Inline decorations)
4. **Document API and usage**
5. **Ship v1.0 with literate testing**

---

**Status:** 📋 Planning Complete
**Target:** Ship Phase 1 in 2 weeks
**Owner:** MDX Team
**Last Updated:** 2025-10-05
