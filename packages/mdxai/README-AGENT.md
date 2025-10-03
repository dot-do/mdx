# mdxai-agent - AI SDK Agent with Tools

AI agent for MDX content generation and management using Vercel AI SDK with custom tools for mdxdb operations.

## Features

- **Natural Language Interface** - Talk to the agent in plain English
- **mdxdb Tools** - List, search, get, and put MDX files
- **Generation Tools** - Generate content with validation and parallel processing
- **OpenAI Background Mode** - 50% cost reduction for batch operations
- **Glob Pattern Support** - Work with files using flexible patterns
- **Interactive Chat** - Multi-turn conversations with the agent
- **Streaming Responses** - Real-time output for long operations

## Installation

```bash
pnpm add mdxai
```

## Quick Start

### Single Command

```bash
mdxai-agent run "List all occupations and generate a summary"
```

### Interactive Chat

```bash
mdxai-agent chat
```

```
You: List all MDX files in the occupations folder
Agent: I found 873 occupation files. Here's a summary...

You: Generate blog posts for the first 10
Agent: Starting generation for 10 files with concurrency 25...
```

### Batch Generation with 50% Discount

```bash
mdxai-agent generate \
  --pattern "occupations/*.mdx" \
  --prompt "Write a blog post about {title}" \
  --output "./blog-posts" \
  --concurrency 25 \
  --background
```

## Commands

### `run` - Single Command

Execute a natural language command:

```bash
mdxai-agent run <prompt> [options]

Options:
  -m, --model <model>        AI model (default: gpt-4o)
  -b, --background           Use background mode (50% discount)
  --max-steps <number>       Maximum tool calls (default: 10)
  --stream                   Stream the response
  --cwd <directory>          Working directory
```

**Examples:**

```bash
# Simple query
mdxai-agent run "How many MDX files are there?"

# Complex workflow
mdxai-agent run "Search for all technology services, then generate API docs for each"

# Streaming response
mdxai-agent run "Generate summaries for all occupations" --stream

# With background mode (50% cheaper)
mdxai-agent run "Generate 1000 blog posts" --background
```

### `chat` - Interactive Mode

Start an interactive conversation:

```bash
mdxai-agent chat [options]

Options:
  -m, --model <model>        AI model (default: gpt-4o)
  -b, --background           Use background mode
  --max-steps <number>       Maximum tool calls
  --cwd <directory>          Working directory
```

**Usage:**

```
🤖 mdxai agent - Interactive Chat
Type your message and press Enter. Type "exit" to quit.

You: list all files
Agent: I found 1,234 MDX files...

You: generate content for the first 10
Agent: Starting generation...
```

### `list` - Quick List Files

```bash
mdxai-agent list <pattern> [options]

Options:
  --limit <number>   Maximum results (default: 20)
  --cwd <directory>  Working directory
```

**Examples:**

```bash
mdxai-agent list "**/*.mdx"
mdxai-agent list "occupations/*.mdx" --limit 50
```

### `search` - Quick Search

```bash
mdxai-agent search <field> <value> [options]

Options:
  -p, --pattern <pattern>  Glob pattern (default: **/*.mdx)
  --cwd <directory>        Working directory
```

**Examples:**

```bash
mdxai-agent search category technology
mdxai-agent search tags ai --pattern "blog-posts/*.mdx"
```

### `generate` - Batch Generation

```bash
mdxai-agent generate [options]

Required:
  -p, --pattern <pattern>      Glob pattern
  --prompt <prompt>            Generation prompt
  -o, --output <directory>     Output directory

Options:
  -m, --model <model>          AI model (default: gpt-4o)
  -c, --concurrency <number>   Parallel generations (default: 25)
  -b, --background             Background mode (50% discount)
  --validate-only              Only validate, don't generate
  --cwd <directory>            Working directory
```

**Examples:**

```bash
# Generate with defaults
mdxai-agent generate \
  -p "occupations/*.mdx" \
  --prompt "Write a blog post about {title}" \
  -o "./blog-posts"

# High concurrency with background mode
mdxai-agent generate \
  -p "services/*.mdx" \
  --prompt "Create API documentation for {title}" \
  -o "./docs/api" \
  -c 50 \
  --background

# Validation only
mdxai-agent generate \
  -p "blog-posts/*.mdx" \
  --prompt "Validate frontmatter" \
  -o "./validated" \
  --validate-only
```

## Tools Available to Agent

### mdxdb Tools

**1. list** - List files matching glob pattern

```typescript
list({
  pattern: "**/*.mdx",
  cwd: process.cwd(),
  limit: 100
})
```

**2. search** - Search by frontmatter field

```typescript
search({
  pattern: "**/*.mdx",
  field: "category",
  value: "technology",
  cwd: process.cwd(),
  limit: 50
})
```

**3. get** - Get full file content

```typescript
get({
  path: "occupations/software-engineer.mdx",
  cwd: process.cwd()
})
```

**4. put** - Write/update file

```typescript
put({
  path: "new-file.mdx",
  frontmatter: { title: "Example", category: "tech" },
  content: "# Example\n\nContent here...",
  cwd: process.cwd(),
  createDirs: true
})
```

### Generation Tools

**5. generate** - Generate content for single item

```typescript
generate({
  prompt: "Write a blog post about {title}",
  context: { title: "Software Engineer", ... },
  schema: { title: "string", content: "string" },
  model: "gpt-4o",
  background: false
})
```

**6. forEach** - Batch generation with validation

```typescript
forEach({
  pattern: "occupations/*.mdx",
  prompt: "Write a blog post about {title}",
  schema: { title: "...", content: "..." },
  output: "./blog-posts",
  model: "gpt-4o",
  concurrency: 25,
  background: true,
  validateOnly: false,
  regenerateInvalid: false,
  cwd: process.cwd()
})
```

## OpenAI Background Mode & Flex Tier

### What is Background Mode?

Background mode uses OpenAI's batch processing API with `service_tier: flex` to get **50% cost reduction** on API calls.

### When to Use It

✅ **Good for:**
- Batch content generation (100+ items)
- Non-urgent workflows
- Cost-sensitive operations
- Large-scale data processing

❌ **Not good for:**
- Interactive chat (slow response)
- Real-time generation
- Small batches (< 10 items)

### How to Enable

**CLI:**
```bash
mdxai-agent run "..." --background
mdxai-agent generate ... --background
```

**Programmatic:**
```typescript
import { runAgent } from 'mdxai/agent'

await runAgent("Generate content...", {
  background: true // 50% cheaper!
})
```

### Cost Comparison

| Operation | Regular | Background | Savings |
|-----------|---------|------------|---------|
| 1M tokens | $15.00 | $7.50 | $7.50 (50%) |
| 10M tokens | $150.00 | $75.00 | $75.00 (50%) |

## Programmatic Usage

### Single Command

```typescript
import { runAgent } from 'mdxai/agent'

const result = await runAgent("List all occupations", {
  model: 'gpt-4o',
  background: false,
  maxSteps: 10,
  cwd: process.cwd()
})

console.log(result.text)
console.log(`Tool calls: ${result.toolCalls}`)
```

### Streaming

```typescript
import { streamAgent } from 'mdxai/agent'

for await (const chunk of streamAgent("Generate summaries...")) {
  process.stdout.write(chunk)
}
```

### Interactive Agent

```typescript
import { MdxaiAgent } from 'mdxai/agent'

const agent = new MdxaiAgent({
  model: 'gpt-4o',
  background: false,
  maxSteps: 10,
  cwd: process.cwd()
})

// Multi-turn conversation
await agent.send("List all files")
await agent.send("Generate content for the first 10")
await agent.send("How many were generated?")

// Get history
console.log(agent.getHistory())

// Enable background mode
agent.setBackgroundMode(true)
await agent.send("Generate 1000 items") // 50% cheaper!
```

### Direct Tool Usage

```typescript
import { mdxaiTools } from 'mdxai/agent'

// List files
const files = await mdxaiTools.list.execute({
  pattern: "**/*.mdx",
  cwd: process.cwd(),
  limit: 20
})

// Generate with forEach
const result = await mdxaiTools.forEach.execute({
  pattern: "occupations/*.mdx",
  prompt: "Write a blog post about {title}",
  output: "./blog-posts",
  model: "gpt-4o",
  concurrency: 25,
  background: true,
  cwd: process.cwd()
})
```

## Example Workflows

### 1. List and Summarize

```bash
mdxai-agent run "List all occupations and create a summary document"
```

### 2. Search and Generate

```bash
mdxai-agent run "Find all technology services and generate README files"
```

### 3. Batch Generation with Validation

```bash
# First, validate
mdxai-agent generate \
  -p "blog-posts/*.mdx" \
  --prompt "Validate frontmatter" \
  -o "./validated" \
  --validate-only

# Then, regenerate invalid ones
mdxai-agent run "Regenerate all invalid blog posts"
```

### 4. Multi-Step Workflow

```bash
mdxai-agent run "1. List all services
2. For each service, generate API documentation
3. Create an index file linking all docs
4. Validate all generated files"
```

### 5. Cost-Optimized Batch Processing

```bash
# Use background mode for 50% savings
mdxai-agent generate \
  -p "data/**/*.mdx" \
  --prompt "Generate comprehensive documentation" \
  -o "./docs" \
  -c 50 \
  --background \
  -m gpt-4o
```

## Advanced Features

### Glob Pattern Matching

The agent supports advanced glob patterns:

```bash
# All MDX files
"**/*.mdx"

# Specific directory
"occupations/*.mdx"

# Multiple extensions
"**/*.{mdx,md}"

# Exclude directories
"**/*.mdx" "!node_modules/**"

# Nested patterns
"blog-posts/**/202[3-5]/**/*.mdx"
```

### Frontmatter Schema Validation

Define expected frontmatter fields:

```typescript
const schema = {
  title: "Blog post title",
  description: "Brief description",
  author: "Author name",
  date: "Publication date (ISO 8601)",
  tags: "Comma-separated tags"
}

// Only invalid fields are regenerated
await forEach({
  pattern: "blog-posts/*.mdx",
  schema,
  regenerateInvalid: true
})
```

### Concurrent Generation Tuning

```bash
# Low concurrency (more stable)
mdxai-agent generate ... -c 10

# Medium concurrency (balanced)
mdxai-agent generate ... -c 25

# High concurrency (faster, may hit rate limits)
mdxai-agent generate ... -c 50
```

## Configuration

### Environment Variables

```bash
# Required
OPENAI_API_KEY=sk-...

# Optional
OPENAI_ORG_ID=org-...
OPENAI_PROJECT_ID=proj-...
```

### Model Selection

Available models:
- `gpt-4o` (default) - Best balance
- `gpt-4o-mini` - Faster, cheaper
- `gpt-4-turbo` - More capable
- `gpt-4` - Most capable

### Working Directory

All glob patterns are relative to `--cwd`:

```bash
# Work in specific directory
mdxai-agent run "..." --cwd ./my-project

# Default is current directory
mdxai-agent run "..."  # Uses process.cwd()
```

## Comparison with Other mdxai Tools

| Tool | Use Case | Interface |
|------|----------|-----------|
| `mdxai` | Simple generation | Natural language prompts |
| `mdxai-agent` | Complex workflows | Agent with tools |
| `mdxai-legacy` | Legacy features | Command-based |

**When to use mdxai-agent:**
- Complex multi-step workflows
- File search and filtering
- Batch operations with validation
- Cost-sensitive operations (background mode)
- Interactive exploration

**When to use mdxai (simple):**
- Quick single generations
- Straightforward prompts
- No file operations needed

## Troubleshooting

### Rate Limits

If you hit OpenAI rate limits:
1. Reduce concurrency: `-c 10`
2. Use background mode: `--background`
3. Use cheaper model: `-m gpt-4o-mini`

### File Not Found

Ensure glob patterns are correct:
```bash
# Check what files match
mdxai-agent list "your-pattern/**/*.mdx"
```

### Validation Failures

Check schema definition:
```bash
# Validate only to see errors
mdxai-agent generate ... --validate-only
```

### Cost Concerns

Always use background mode for batch operations:
```bash
# 50% cost reduction
mdxai-agent generate ... --background
```

## License

MIT
