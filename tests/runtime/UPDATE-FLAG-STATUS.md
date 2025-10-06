# --update Flag Status

## Current Implementation (Phase 4)

The `--update` flag currently injects **assertion results** into MDX files, but not individual statement outputs.

### What Works ✅

**Assertion Injection:**
```typescript
const sum = 10 + 20

expect(sum).toBe(30)
// After --update:
// ✅ Expected 30 to be 30
```

The system:
1. ✅ Executes code blocks with `assert` or `doc` meta tags
2. ✅ Captures assertion results (pass/fail)
3. ✅ Injects assertion comments after expect() calls
4. ✅ Writes updated MDX back to disk

### What Doesn't Work Yet ⚠️

**Statement-Level Outputs:**
```typescript
const x = 5
// We want: // => 5
// Currently: Not captured

const sum = x + 10
// We want: // => 15
// Currently: Not captured
```

### Why?

Statement-level output capture requires **code instrumentation**:

1. Parse code with AST (TypeScript parser)
2. Identify each expression statement
3. Transform code to wrap values:
   ```typescript
   // Original:
   const x = 5

   // Transformed:
   const x = __captureOutput(1, 5)
   ```
4. Execute instrumented code
5. Collect captured outputs
6. Inject as comments

This is **Phase 5 work** - more complex than Phase 4's assertion tracking.

## Test Results

### Assertion Injection Test

File: `tests/runtime/update-test.mdx`

**Command:**
```bash
npx tsx test-literate.js tests/runtime/update-test.mdx --skip-auth --update --verbose
```

**Result:**
```
📊 Document Test Results

📄 update-test.mdx
   Blocks: 3/3 passed (100%)
   Assertions: 6/6 passed (100%)

✅ Outputs injected
```

**Captured:**
- ✅ 6 assertion results
- ⚠️ 0 statement outputs (not implemented yet)

### Debug Output

Running `test-update-debug.js` shows:

```
Captures:
  - Line 0: assertion = "Expected 15 to be 15"
  - Line 0: assertion = "Expected 50 to be 50"
```

Notice:
- Only assertions are captured
- Line numbers are 0 (assertions don't map to specific lines yet)
- Statement outputs (`const x = 5`, `const sum = x + y`) are not captured

## Phase 5 Requirements

To enable full statement output injection:

### 1. Code Instrumentation

Create `packages/mdxe/src/cli/utils/code-instrumenter.ts`:

```typescript
import * as ts from 'typescript'

export function instrumentCode(code: string): string {
  // Parse code to AST
  const sourceFile = ts.createSourceFile('temp.ts', code, ts.ScriptTarget.Latest, true)

  // Transform AST to add __captureOutput calls
  const printer = ts.createPrinter()
  const transformer = (context: ts.TransformationContext) => {
    return (rootNode: ts.Node) => {
      function visit(node: ts.Node): ts.Node {
        // For each variable declaration, wrap the initializer
        if (ts.isVariableDeclaration(node) && node.initializer) {
          const lineNumber = sourceFile.getLineAndCharacterOfPosition(node.getStart()).line

          // Wrap: const x = 5
          // Into: const x = __captureOutput(lineNumber, 5)
          const captureCall = ts.factory.createCallExpression(
            ts.factory.createIdentifier('__captureOutput'),
            undefined,
            [
              ts.factory.createNumericLiteral(lineNumber),
              node.initializer
            ]
          )

          return ts.factory.updateVariableDeclaration(
            node,
            node.name,
            node.exclamationToken,
            node.type,
            captureCall
          )
        }

        return ts.visitEachChild(node, visit, context)
      }

      return ts.visitNode(rootNode, visit)
    }
  }

  // Apply transformation
  const result = ts.transform(sourceFile, [transformer])
  return printer.printFile(result.transformed[0])
}
```

### 2. Integration with Execution Engine

Update `execution-engine.ts` to use instrumentation:

```typescript
// BEFORE transpilation, instrument the code
if (captureStatements) {
  codeBlock.value = instrumentCode(codeBlock.value)
}

// THEN transpile as usual
const result = await esbuild.transform(codeBlock.value, {
  loader: 'ts',
  target: 'es2022',
  format: 'esm',
})
```

### 3. Line Number Mapping

Map line numbers from instrumented code back to original:

```typescript
interface LineMap {
  instrumentedLine: number
  originalLine: number
}

const lineMap = createLineMap(originalCode, instrumentedCode)

// When injecting outputs, use original line numbers
for (const capture of statementCaptures) {
  const originalLine = lineMap.find(m => m.instrumentedLine === capture.line)?.originalLine
  // Inject at originalLine
}
```

### 4. Smart Injection

Only instrument expressions we care about:

```typescript
- Variable declarations: `const x = 5`
- Assignments: `x = 10`
- Function calls: `doSomething()`
- Return statements: `return x + y`

Skip:
- Comments
- Type annotations
- Import/export statements
- Function/class declarations
```

## Current Workaround

For now, users can:

1. ✅ Use assertions to document expected behavior:
   ```typescript
   const sum = 10 + 20
   expect(sum).toBe(30) // ✅ Gets injected as comment
   ```

2. ✅ Use console.log to show outputs:
   ```typescript
   const sum = 10 + 20
   console.log('Sum:', sum) // Shows in terminal
   ```

3. ⚠️ Manually add output comments:
   ```typescript
   const sum = 10 + 20
   // => 30 (manually added)
   ```

## Conclusion

**Phase 4 Status:** ✅ Complete for **assertions**

- Assertion results are captured and can be injected
- `--update` flag works but only for assertions
- Test reports show assertion pass/fail

**Phase 5 Needed:** Statement-level output capture

- Requires code instrumentation with AST transformation
- More complex than Phase 4
- Not blocking for production use

**Recommendation:** Ship Phase 4 as-is

- Assertion injection is valuable on its own
- Users can document expected behavior
- Phase 5 can be added later without breaking changes

---

**Status:** 🟡 Partial - Assertions work, statements don't
**Phase 4:** ✅ Assertion injection complete
**Phase 5:** 📋 Statement injection (future work)
**Last Updated:** 2025-10-05 18:30 PDT
