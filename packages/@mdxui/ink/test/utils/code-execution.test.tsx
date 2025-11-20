import test from 'ava'
import { extractCodeBlocks, executeCodeBlocks } from '../../src/utils/code-execution.js'

test('extractCodeBlocks should extract TypeScript code blocks from MDX content', (t) => {
  const mdxContent = `
# Test MDX

Some content here.

\`\`\`typescript
console.log('Hello');
\`\`\`

More content.

\`\`\`typescript
const x = 1 + 1;
console.log(x);
\`\`\`
  `

  const blocks = extractCodeBlocks(mdxContent)
  t.is(blocks.length, 2)
  t.is(blocks[0], "console.log('Hello');")
  t.is(blocks[1], 'const x = 1 + 1;\nconsole.log(x);')
})

test('extractCodeBlocks should return empty array when no code blocks are found', (t) => {
  const mdxContent = `
# Test MDX

Just regular content, no code blocks.
  `

  const blocks = extractCodeBlocks(mdxContent)
  t.is(blocks.length, 0)
})

test('executeCodeBlocks should execute TypeScript code blocks and capture output', async (t) => {
  const mdxContent = `
# Test MDX

\`\`\`typescript
console.log('Hello from test');
\`\`\`
  `

  const results = await executeCodeBlocks(mdxContent)
  t.is(results.length, 1)
  t.is(results[0].success, true)
  t.true(results[0].output?.includes('Hello from test'))
})

test('executeCodeBlocks should handle errors in code execution', async (t) => {
  const mdxContent = `
# Test MDX

\`\`\`typescript
throw new Error('Test error');
\`\`\`
  `

  const results = await executeCodeBlocks(mdxContent)
  t.is(results.length, 1)
  t.is(results[0].success, false)
  t.true(results[0].error?.includes('Test error'))
})
