# React-ink Output Examples

This directory contains examples of using the React-ink output format for MDXE.

## What is React-ink Output?

React-ink output renders MDX content to the command-line interface using the Ink library. This enables:

- **CLI Rendering**: Display MDX content in terminal applications
- **ANSI Colors**: Rich formatting with colors and styles
- **Interactive Components**: Spinners, progress bars, and more
- **Streaming Support**: Real-time updates to rendered content
- **AI Agent Friendly**: Output optimized for AI agent consumption

## Running the Examples

```bash
# Build the package first
cd /path/to/mdx
pnpm build

# Run all examples
node packages/mdxe/examples/react-ink/example.ts

# Run specific example
node packages/mdxe/examples/react-ink/example.ts 1
node packages/mdxe/examples/react-ink/example.ts 2
# etc.
```

## Example Overview

### Example 1: Simple MDX Rendering

Demonstrates basic MDX to CLI rendering with default components:
- Headings (H1-H6)
- Paragraphs
- Lists (ul, ol)
- Code blocks
- Blockquotes
- Emphasis (bold, italic)

### Example 2: Custom Components

Shows how to use specialized CLI components:
- `<Spinner>` - Loading indicators
- `<Status>` - Success/error/warning/info badges
- `<ProgressBar>` - Progress indicators
- `<Alert>` - Styled alert boxes

### Example 3: Data-Driven MDX

Demonstrates using scope/data in MDX:
- Pass variables to MDX templates
- Dynamic content rendering
- JavaScript expressions in MDX

### Example 4: Streaming Updates

Shows real-time content updates:
- Async generators
- Progressive rendering
- Live updates to CLI output

### Example 5: File Rendering

Demonstrates loading MDX from files:
- File system support
- Frontmatter parsing
- Component resolution

## API Reference

### renderMdxToInk

```typescript
import { renderMdxToInk, defaultInkComponents } from 'mdxe/outputs/react-ink'

const result = await renderMdxToInk(mdxContent, {
  components: defaultInkComponents,
  scope: { username: 'Alice' },
  colorize: true,
  stream: false,
})

await result.waitUntilExit()
```

### Available Components

**Typography:**
- `H1`, `H2`, `H3`, `H4`, `H5`, `H6` - Headings
- `P` - Paragraph
- `Strong`, `Em`, `Del` - Text emphasis
- `Blockquote` - Quoted text
- `Hr` - Horizontal rule

**Code:**
- `Pre` - Preformatted block
- `Code` - Inline or block code

**Lists:**
- `Ul` - Unordered list
- `Ol` - Ordered list
- `Li` - List item

**Tables:**
- `Table`, `Thead`, `Tbody`, `Tr`, `Th`, `Td`

**Links & Media:**
- `A` - Link (shows URL)
- `Img` - Image (shows alt text)

**Specialized:**
- `Spinner` - Loading indicator
- `ProgressBar` - Progress display
- `Status` - Status badges
- `Alert` - Alert boxes
- `Badge` - Inline badges

## Use Cases

### 1. CLI Documentation Viewer

```typescript
import { renderMdxFileToInk, defaultInkComponents } from 'mdxe/outputs/react-ink'

await renderMdxFileToInk('./docs/README.mdx', {
  components: defaultInkComponents
})
```

### 2. Build Tool Output

```typescript
const buildOutput = `
# Build Started

<Spinner label="Compiling TypeScript..." />

<ProgressBar value={progress} total={100} label="Building..." />

<Status type="success">Build completed!</Status>
`

await renderMdxToInk(buildOutput, {
  components: { ...defaultInkComponents, Spinner, ProgressBar, Status }
})
```

### 3. AI Agent Output

```typescript
// AI generates MDX with structured data
const aiOutput = `
# Analysis Results

Found **{issueCount}** issues:

{issues.map(issue => (
  <Status type={issue.severity}>{issue.message}</Status>
))}
`

await renderMdxToInk(aiOutput, {
  components: defaultInkComponents,
  scope: {
    issueCount: 3,
    issues: [
      { severity: 'error', message: 'Type error in file.ts' },
      { severity: 'warning', message: 'Unused variable' },
    ]
  }
})
```

### 4. Interactive Prompts

```typescript
import { Text, useInput } from 'ink'

const InteractiveDoc: React.FC = () => {
  useInput((input, key) => {
    if (key.return) {
      // Handle selection
    }
  })

  return <Text>Press Enter to continue...</Text>
}

const mdx = `
# Interactive Documentation

<InteractiveDoc />
`

await renderMdxToInk(mdx, {
  components: { ...defaultInkComponents, InteractiveDoc }
})
```

## Best Practices

1. **Use Default Components**: Start with `defaultInkComponents` for standard MDX elements
2. **Colorize Wisely**: Use colors to highlight important information, not overwhelm
3. **Stream Long Operations**: Use streaming for operations that take time
4. **Handle Errors**: Wrap rendering in try/catch for graceful error handling
5. **Test in Different Terminals**: ANSI support varies by terminal emulator

## Limitations

- **No Images**: Only displays alt text and path
- **Limited Tables**: Basic table rendering, complex tables may not display well
- **Terminal Width**: Long lines may wrap or be truncated
- **No Hyperlinks**: Links show as text with URL in parentheses

## Advanced Usage

### Custom Components

```typescript
import { Box, Text } from 'ink'

const CustomAlert: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Box borderStyle="double" borderColor="red" padding={1}>
    <Text color="red" bold>{children}</Text>
  </Box>
)

await renderMdxToInk(mdx, {
  components: {
    ...defaultInkComponents,
    CustomAlert
  }
})
```

### Streaming from AI

```typescript
async function* streamFromAI(prompt: string) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    stream: true,
  })

  let accumulated = ''
  for await (const chunk of response) {
    accumulated += chunk.choices[0]?.delta?.content || ''
    yield accumulated
  }
}

for await (const result of streamMdxToInk(streamFromAI('Explain MDX'), {
  components: defaultInkComponents
})) {
  // Renders each update
}
```

## Related

- [MCP Output Examples](../mcp/README.md) - Model Context Protocol integration
- [Hono Output Examples](../hono/README.md) - HTTP server rendering
- [MDXE Documentation](../../README.md) - Main MDXE package
