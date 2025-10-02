# schema.org.ai

**AI-native vocabulary for the semantic web**

This is the official documentation site for **schema.org.ai** - an extension of Schema.org that provides structured vocabulary for AI agents, models, tools, workflows, and knowledge systems.

## Overview

schema.org.ai defines 38+ entity types and 60+ properties specifically designed for:

- **AI Agents** - Autonomous entities with goals, tools, and policies
- **Models** - LLMs, embeddings, and fine-tuned models
- **Tools** - Functions and APIs agents can invoke
- **Knowledge** - Prompts, knowledge bases, and RAG systems
- **Memory** - Conversations, messages, and context
- **Workflows** - Tasks and plans for orchestration

## Development

```bash
# Install dependencies (from monorepo root)
pnpm install

# Run development server
pnpm --filter schema.org.ai dev

# Build site
pnpm --filter schema.org.ai build

# Generate llms.txt
pnpm --filter schema.org.ai generate:llms
```

## Structure

```
schema.org.ai/
├── app/              # Next.js app with Nextra
├── content/          # MDX documentation
│   ├── index.mdx     # Homepage
│   ├── spec/         # Specification docs
│   ├── types/        # Type definitions
│   ├── properties/   # Property reference
│   └── examples/     # Usage examples
├── public/           # Static assets
└── scripts/          # Build scripts
```

## Port

Runs on port **3004** in development.

## Links

- **Website**: https://schema.org.ai
- **Context**: http://schema.org.ai/context/ai-context.jsonld
- **GitHub**: https://github.com/mdxld/mdxld
