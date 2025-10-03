# mdxai - Simplified Natural Language Content Generation

Simplified mdxai enables natural language-driven content generation using AI, with support for:
- Natural language prompts (e.g., "for every occupation, write a blog post...")
- Frontmatter-to-Zod schema mapping for structured generation
- Parallel generation with p-queue (default: 25 concurrent)
- Integration with mdxdb for data-driven content
- Claude Agents SDK support

## Installation

```bash
pnpm add mdxai
```

## Quick Start

### Basic Usage

```bash
# Single generation
mdxai write a blog post about AI in healthcare

# Data-driven generation from local MDX files
mdxai for every occupation, write a blog post about how AI will transform it

# Custom model and concurrency
mdxai --model gpt-4 --concurrency 10 for every service, create documentation
```

### Natural Language Patterns

mdxai recognizes these patterns:

1. **Data-driven generation:**
   ```bash
   mdxai for every <collection>, <task>
   mdxai for each <collection>, <task>
   mdxai for all <collection>, <task>
   ```

2. **Single generation:**
   ```bash
   mdxai <task>
   ```

## Data Sources

### Local Collections

mdxai looks for MDX files in directories matching the collection name:

```
project/
├── occupations/           # Collection: occupations
│   ├── software-engineer.mdx
│   ├── data-scientist.mdx
│   └── ...
├── services/              # Collection: services
│   ├── authentication.mdx
│   ├── database.mdx
│   └── ...
└── content/               # Output directory (default)
    ├── README.md          # Generation instructions
    ├── _template.mdx      # Frontmatter schema
    └── generated-*.mdx    # Generated files
```

### Import External Data

Use `@mdxdb/importers` to fetch data from external sources:

```bash
# Import Zapier apps
pnpm mdxdb-import zapier --output ./zapier-apps

# Import O*NET occupations
pnpm mdxdb-import onet --output ./occupations

# Then generate content
mdxai for every occupation, write a blog post about career opportunities
```

## Generation Instructions

Create a `README.md` in your output directory to provide generation instructions:

```markdown
# AI Transformation Blog Posts

Write engaging blog posts about how AI is transforming different occupations.

## Style Guide

- Use a conversational tone
- Include real-world examples
- Highlight both opportunities and challenges
- Target audience: professionals in the field
- Length: 800-1200 words

## Structure

1. Introduction: Current state of the occupation
2. AI's Impact: How AI is changing things
3. Opportunities: New possibilities
4. Challenges: What to watch out for
5. Conclusion: Future outlook
```

mdxai will include these instructions in generation prompts.

## Structured Output with Frontmatter

Create a `_template.mdx` file to define the frontmatter schema:

```mdx
---
title: Blog post title
description: Brief description of the blog post
author: Content Generator
date: 2025-10-03
tags: ['ai', 'transformation', 'career']
category: Technology
readingTime: 5 minutes
featured: false
---

# {title}

Blog post content goes here...
```

mdxai will:
1. Extract frontmatter fields
2. Convert to Zod schema
3. Use `generateObject()` for structured output
4. Generate complete MDX with validated frontmatter

## Options

```bash
mdxai [prompt] [options]

Options:
  -c, --concurrency <number>  Max concurrent generations (default: 25)
  -m, --model <model>         AI model to use (default: gpt-5)
  -d, --dir <directory>       Output directory (default: content)
  --dry-run                   Show what would be generated
  -h, --help                  Display help
  -V, --version               Display version
```

## Examples

### Example 1: Generate from O*NET Occupations

```bash
# 1. Import O*NET data
pnpm mdxdb-import onet --output ./occupations

# 2. Create instructions
mkdir -p ./blog-posts
echo "Write engaging blog posts..." > ./blog-posts/README.md

# 3. Create template
cat > ./blog-posts/_template.mdx << 'EOF'
---
title: Blog post title
occupation: Original occupation name
socCode: O*NET SOC code
tags: ['ai', 'career']
readingTime: 8 minutes
---
EOF

# 4. Generate
mdxai for every occupation, write a blog post about how AI will transform it
```

### Example 2: Generate from Zapier Apps

```bash
# 1. Import Zapier apps
pnpm mdxdb-import zapier --output ./zapier-apps

# 2. Generate integration guides
mdxai --dir ./integration-guides for every app, create an integration guide

# 3. View results
ls ./integration-guides/
```

### Example 3: Custom Model and Concurrency

```bash
# Use GPT-4 with 50 concurrent generations
mdxai --model gpt-4 --concurrency 50 for every service, create API documentation
```

## Configuration

### Model Selection

Specify model in:
1. Command line: `--model gpt-4`
2. Frontmatter: `$model: claude-opus-4`
3. Environment: `OPENAI_API_KEY` or `ANTHROPIC_API_KEY`

### Environment Variables

```bash
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-...
```

## Architecture

mdxai follows a simple pipeline:

```
Natural Language Prompt
  ↓
Parse (extract collection, task, context)
  ↓
Query Collection (local MDX files)
  ↓
Load Instructions (README.md)
  ↓
Load Template (frontmatter schema)
  ↓
Parallel Generation (p-queue)
  ↓
Write Output (MDX files)
```

## Integration with mdxdb

mdxai integrates with `@mdxdb` packages:

- `@mdxdb/core` - Core data types and utilities
- `@mdxdb/fs` - File system operations and Git integration
- `@mdxdb/importers` - Import external data (Zapier, O*NET, etc.)

## Claude Agents SDK

mdxai uses the Claude Agents SDK for advanced capabilities:

```typescript
import { query } from '@anthropic-ai/claude-agent-sdk'

// mdxai can leverage Claude's agent capabilities
const result = await query({
  prompt: "Analyze and generate content...",
  options: {
    allowedTools: ['Read', 'Write', 'Grep'],
  },
})
```

## Migration from Legacy mdxai

The legacy CLI is still available as `mdxai-legacy`:

```bash
# Legacy commands
mdxai-legacy generate "prompt"
mdxai-legacy list "prompt"
mdxai-legacy research "prompt"
mdxai-legacy deepwiki "query"

# New simplified syntax
mdxai generate a blog post about AI
mdxai for every topic, research and summarize
```

## Contributing

See the main [README.md](./README.md) for development setup.

## License

MIT
