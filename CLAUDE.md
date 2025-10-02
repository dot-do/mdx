# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **monorepo for MDX ecosystem tooling** that treats Markdown/MDX files as structured data with AI, database, and linked data capabilities. Uses **pnpm workspaces** and **Turborepo** for efficient development.

## Repository Scope

### ✅ What Belongs in This Repo

**MDX-Specific Functionality:**
- Code that **directly processes, generates, or manipulates MDX files**
- Integrations that connect MDX with other tools/frameworks
- MDX-specific developer experience improvements

**MDX Standards Implementation:**
- **mdxld.org** - Linked data for MDX
- **mdx.org.ai** - AI-native MDX capabilities
- **schema.org.ai** - Semantic web vocabulary for MDX

**Core Packages (2.1MB):**
- `mdxai` - AI-powered MDX generation (uses AI for MDX-specific tasks)
- `mdxdb` - MDX files as a database (MDX-specific storage)
- `mdxe` - MDX development environment (zero-config Next.js + React + Vitest)
- `mdxld` - MDX linked data (Schema.org integration)
- `mdxui` - MDX UI components (React components for MDX)
- `mdxtra` - MDX integrations (framework-specific MDX tools)
- `schema.org.ai` - Schema.org vocabulary package

**Research & Documentation:**
- MDX-related research and architecture decisions in `/notes/research/`
- MDX-focused examples in `/examples/`

### ❌ What Does NOT Belong

**Generic AI Utilities** → Use [@dot-do/ai](https://github.com/dot-do/ai) instead
- `@dot-do/ai-functions` - Generic text generation, lists, research
- `@dot-do/ai-workflows` - Generic workflow orchestration with Ink CLI

**Project-Specific Code** → Use `projects/` repository
- One-off applications and experiments
- Customer-specific implementations

**Experimental/Research Code** → Use `experiments/` repository or `/notes/`
- Early-stage prototypes
- Research implementations

### Decision Criteria

When adding new code, ask:
1. **Does it process MDX files?** If yes → belongs here
2. **Is it MDX-agnostic AI?** If yes → belongs in @dot-do/ai
3. **Is it project-specific?** If yes → belongs in projects/
4. **Is it experimental?** If yes → belongs in experiments/ or /notes/

## Essential Commands

### Development Workflow

```bash
# Install dependencies
pnpm install

# Build entire monorepo (required after install)
pnpm build
pnpm build:packages  # Build only packages

# Development mode for all apps
pnpm dev

# Quality assurance
pnpm lint           # ESLint across all packages
pnpm test           # Vitest tests
pnpm check-types    # TypeScript type checking
pnpm format         # Prettier formatting

# Release workflow
pnpm version        # Changeset version bumping
pnpm release        # Build and publish packages
```

### Individual Package Development

Most packages support these standard scripts:

- `pnpm --filter <package> build` - Build specific package
- `pnpm --filter <package> test` - Run tests for specific package
- `pnpm --filter <package> dev` - Development mode (apps only)

### CLI Tools Available in Development

After building packages, these CLIs are available:

- `mdxai` - AI content generation and editing
- `mdxdb` - Database operations on MDX files
- `mdxe` - Full-stack MDX development environment
- `mdxld` - Linked data processing for MDX

## Architecture

### Core Package Structure

- **`packages/mdxai`** - AI-powered content generation using OpenAI
- **`packages/mdxdb`** - Database abstraction for MDX files
  - `@mdxdb/core` - Base types and utilities
  - `@mdxdb/fs` - File system implementation with Git integration
  - `@mdxdb/sqlite` - SQLite backend with embeddings
- **`packages/mdxe`** - Zero-config CLI for MDX development (Next.js + React + Vitest)
- **`packages/mdxld`** - Schema.org linked data integration
- **`packages/mdxui`** - React component library for MDX

### Apps (Next.js with Nextra)

- `apps/mdx.org.ai` (port 3001) - Main documentation
- `apps/mdxld.org` (port 3002) - Linked data docs
- `apps/io.mw` (port 3003) - Hosted mdxe with dynamic subdomains
- All use Pagefind for search functionality

### Generated Schema

- `schema/` contains 800+ auto-generated Schema.org MDX files
- Regenerate with: `pnpm generate:schema`
- Includes both classes and properties as structured MDX

## Development Patterns

### Workspace Dependencies

Internal packages use `workspace:*` for cross-references. Always use workspace versions for internal dependencies.

### Build System

- **Bundler**: tsup (TypeScript + esbuild) for packages
- **Task Runner**: Turborepo with dependency-aware execution
- **Type Checking**: Strict TypeScript with shared configs in `config/`

### MDX Integration Patterns

- **Frontmatter**: YAML-LD with Schema.org types
- **Components**: Auto-available via `mdxui` in `mdxe` environments
- **Executable Code**: Support for `typescript test` code blocks
- **File-as-Database**: MDX files treated as structured data sources

### Testing

- **Framework**: Vitest with global setup
- **Pattern**: Tests co-located with source files
- **MDX Testing**: Special support for executable code blocks in markdown

### Configuration Sharing

Shared configurations in `config/` workspace:

- `@repo/eslint-config` - ESLint rules
- `@repo/typescript-config` - TypeScript settings
- `@repo/tsup-config` - Build configuration
- `@repo/tailwind-config` - Tailwind setup

## Important Notes

### Build Dependencies

- Always run `pnpm build:packages` after installing dependencies
- Turborepo handles build order automatically via `dependsOn` configuration
- Type checking depends on successful builds

### Port Allocation

When running multiple apps simultaneously:

- mdx.org.ai: 3001
- mdxld.org: 3002
- io.mw: 3003

### AI Integration

The `mdxai` package provides template literal syntax for AI operations:

```ts
const titles = await list`100 blog post titles about ${topic}`
const content = await ai`Write a blog post about ${title}`
```
