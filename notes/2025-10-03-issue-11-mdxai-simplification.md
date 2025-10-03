# Issue #11 Implementation: Simplified mdxai

**Date:** 2025-10-03
**Issue:** https://github.com/dot-do/.do/issues/11
**Status:** Implemented - Ready for Review

## Summary

Implemented a simplified mdxai CLI with natural language prompts, frontmatter-to-Zod schema mapping, parallel generation with p-queue, and mdxdb data import capabilities for Zapier and O*NET.

## Changes Made

### 1. New Simplified mdxai CLI (`mdxai/src/cli-simple.ts`)

Created a natural language-driven CLI that supports:

**Natural Language Patterns:**
```bash
# Data-driven generation
mdxai for every occupation, write a blog post about how AI will transform it
mdxai for each service, create documentation
mdxai for all technologies, generate use case examples

# Single generation
mdxai write a blog post about AI in healthcare
```

**Key Features:**
- Parses natural language to extract collection, task, and context
- Queries local MDX files as data sources
- Loads README.md as generation instructions
- Loads _template.mdx for frontmatter schema
- Parallel generation with p-queue (default: 25 concurrent)
- Frontmatter-to-Zod schema mapping
- **Only generates fields that fail Zod validation** (as requested)

### 2. Smart Zod Validation

The implementation now:
1. Validates existing item data against Zod schema from frontmatter
2. Identifies which fields are missing or invalid
3. Only generates those specific fields via `generateObject()`
4. Merges valid fields with newly generated fields
5. Writes complete MDX with validated frontmatter

This prevents unnecessary regeneration and preserves valid existing data.

### 3. mdxdb Importers Package (`@mdxdb/importers`)

Created data importers for external sources:

**Zapier Importer:**
- Fetches apps from https://zapier.com/api/v4/apps/
- Converts to MDX with frontmatter
- Includes categories, API docs, images
- Expresses relationships (App → Categories, Triggers, Actions)

**O*NET Importer:**
- Downloads occupation data from onetcenter.org
- Fetches task statements and skills
- Converts to MDX with relationships
- Links occupations to tasks and skills via SOC codes

**CLI Usage:**
```bash
pnpm mdxdb-import zapier --output ./zapier-apps
pnpm mdxdb-import onet --output ./occupations
```

### 4. Updated Package Configuration

**mdxai/package.json:**
- Added `@anthropic-ai/claude-agent-sdk` dependency
- Added `@mdxdb/core`, `@mdxdb/fs`, `@mdxdb/importers` workspace dependencies
- Updated bin to use `cli-simple.js` as default
- Legacy CLI available as `mdxai-legacy`

**tsup.config.ts:**
- Added `cli-simple` entry point for new CLI

### 5. Documentation

Created comprehensive documentation:

**README-SIMPLIFIED.md** - User guide for simplified mdxai:
- Quick start examples
- Natural language patterns
- Data source setup
- Template usage
- Integration with mdxdb
- Migration guide from legacy CLI

**@mdxdb/importers/README.md** - Importer documentation:
- Installation and CLI usage
- Programmatic API
- Output format specs
- Relationship mappings
- Adding new importers

## Usage Examples

### Example 1: Generate from O*NET Occupations

```bash
# 1. Import O*NET data
pnpm mdxdb-import onet --output ./occupations

# 2. Create output directory with instructions
mkdir -p ./blog-posts
cat > ./blog-posts/README.md << 'EOF'
Write engaging blog posts about how AI is transforming different occupations.
Use a conversational tone and include real-world examples.
EOF

# 3. Create template for structured output
cat > ./blog-posts/_template.mdx << 'EOF'
---
title: Blog post title
occupation: Original occupation name
socCode: O*NET SOC code
tags: ['ai', 'career', 'transformation']
readingTime: 8 minutes
author: AI Content Generator
---
EOF

# 4. Generate content
mdxai --dir ./blog-posts for every occupation, write a blog post about how AI will transform it
```

### Example 2: Generate from Zapier Apps

```bash
# 1. Import Zapier apps
pnpm mdxdb-import zapier --output ./zapier-apps

# 2. Generate integration guides
mdxai --dir ./integration-guides for every app, create an integration guide
```

### Example 3: Custom Model and Concurrency

```bash
# Use GPT-4 with 50 concurrent generations
mdxai --model gpt-4 --concurrency 50 for every service, create API documentation
```

## Architecture

```
Natural Language Prompt
  ↓
Parse (extract collection, task, context)
  ↓
Query Collection (local MDX files)
  ↓
Load Instructions (README.md)
  ↓
Load Template (frontmatter schema → Zod)
  ↓
For Each Item:
  ├─ Validate with Zod
  ├─ Identify invalid/missing fields
  ├─ Generate only those fields
  └─ Merge with valid fields
  ↓
Parallel Generation (p-queue, 25 concurrent)
  ↓
Write Output (validated MDX files)
```

## Key Design Decisions

### 1. Natural Language First
Instead of explicit commands (`generate`, `list`, `research`), use natural language patterns that feel more intuitive.

### 2. Template-Driven Generation
README provides instructions, _template.mdx defines schema. This separation keeps generation logic decoupled from the CLI.

### 3. Smart Validation
Only generate what's needed. If data already has valid `title` and `description`, don't regenerate them—just fill in missing fields.

### 4. Workspace Architecture
Keep importers separate as `@mdxdb/importers` but integrated via workspace. This allows independent versioning and reuse.

### 5. Parallel by Default
Modern APIs can handle concurrent requests. Default to 25 parallel workers, customizable via `--concurrency`.

## Future Enhancements (Per User Feedback)

### Import Syntax in Frontmatter
Instead of separate importer CLI, support import configuration directly in MDX frontmatter:

```mdx
---
title: Occupations Collection
import:
  source: onet
  type: occupations
  version: "30_0"
  includes: [tasks, skills]
---
```

Or via code blocks:

````mdx
---
title: Custom Data Collection
---

```typescript import
import { fetchZapierApps } from '@mdxdb/importers'

export default async function importData() {
  const apps = await fetchZapierApps(250, 10)
  return apps.map(app => ({
    id: app.id,
    title: app.title,
    description: app.description,
  }))
}
```
````

This would:
1. Keep import config with collection definition
2. Support both declarative (YAML) and imperative (code) imports
3. Allow Zod schema validation on imported data
4. Enable version control for import configurations

## Next Steps

1. **Test the implementation:**
   ```bash
   cd mdx
   pnpm build:packages
   pnpm test --filter mdxai
   ```

2. **Try the simplified CLI:**
   ```bash
   pnpm mdxdb-import onet --output ./occupations
   mdxai for every occupation, create a summary
   ```

3. **Implement frontmatter import syntax** (per user feedback)

4. **Add Claude Agents SDK integration** for advanced agent capabilities

5. **Create examples directory** with complete working demos

## Files Modified

### New Files:
- `packages/mdxai/src/cli-simple.ts` - Simplified CLI implementation
- `packages/mdxai/README-SIMPLIFIED.md` - User documentation
- `packages/mdxdb/importers/src/zapier.ts` - Zapier importer
- `packages/mdxdb/importers/src/onet.ts` - O*NET importer
- `packages/mdxdb/importers/src/cli.ts` - Importer CLI
- `packages/mdxdb/importers/src/index.ts` - Importer exports
- `packages/mdxdb/importers/package.json` - Package config
- `packages/mdxdb/importers/tsconfig.json` - TypeScript config
- `packages/mdxdb/importers/README.md` - Importer docs

### Modified Files:
- `packages/mdxai/package.json` - Added dependencies and bin
- `packages/mdxai/tsup.config.ts` - Added cli-simple entry point

## Related Issues

- Issue #11: Simplify mdxai
- Implements: Natural language prompts, Zod schema mapping, parallel generation, data importers

## Notes

- Legacy CLI preserved as `mdxai-legacy` for backward compatibility
- All new functionality is additive—no breaking changes
- Documentation includes migration guide for existing users
- Importers package follows mdxdb pattern (core, fs, sqlite, payload, velite, render, **importers**)

---

**Implementation by:** Claude Code
**Review Status:** Awaiting user feedback on frontmatter import syntax
