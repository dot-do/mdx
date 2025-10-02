# MDX Repository - Scope Refactoring Recommendations

**Date:** 2025-10-02
**Context:** Refocusing the mdx repository on core MDX functionality and extracting out-of-scope packages
**Key Standards:** mdxld.org, mdx.org.ai, schema.org.ai

---

## Executive Summary

The mdx repository has grown to include generic AI functionality (ai-functions, ai-workflows, ai-experiments) that creates cross-dependencies and dilutes the core MDX focus. This document provides comprehensive recommendations for refactoring the repository to:

1. **Stay purely focused on MDX** - Markdown + JSX + Linked Data + AI capabilities
2. **Extract out-of-scope packages** - Generic AI functions that aren't MDX-specific
3. **Clarify scope criteria** - Define what belongs in this repo vs elsewhere
4. **Simplify dependencies** - Reduce cross-dependencies and complexity
5. **Align with standards** - mdxld.org, mdx.org.ai, schema.org.ai

---

## Current Repository Analysis

### Package Inventory

#### ✅ Core MDX Packages (Keep & Focus) - 2.1MB

**mdxai** (460KB)
- **Purpose:** AI-powered MDX content generation and editing
- **Status:** IN SCOPE - MDX-specific AI functionality
- **Dependencies:** @ai-sdk/openai, ai, mdxe, mdxld
- **Scope:** Template literal functions for MDX generation (`ai\`Write a blog post\``)

**mdxdb** (444KB) - 3 sub-packages
- **Purpose:** MDX files as a database with multiple backends
- **Status:** IN SCOPE - Core MDX infrastructure
- **Sub-packages:**
  - @mdxdb/core - Base types and utilities
  - @mdxdb/fs - File system implementation with Git integration
  - @mdxdb/sqlite - SQLite backend with embeddings
- **Scope:** Treat MDX files as structured data sources

**mdxe** (556KB)
- **Purpose:** Zero-config CLI for MDX development (Next.js + React + Vitest)
- **Status:** IN SCOPE - Core MDX developer experience
- **Dependencies:** @mdx-js/mdx, Next.js, Payload CMS, Tailwind, mdxui
- **Scope:** Build, execute, test, and deploy code in MDX files

**mdxld** (228KB)
- **Purpose:** Linked data for MDX (implements mdxld.org standard)
- **Status:** IN SCOPE - Core MDX standard
- **Dependencies:** @mdx-js/esbuild, velite, schema-dts, yaml
- **Scope:** Schema.org integration, YAML-LD frontmatter, JSON-LD support

**mdxui** (3.1MB) - 12 sub-packages
- **Purpose:** UI component library for MDX
- **Status:** IN SCOPE - MDX UI components
- **Sub-packages:** @mdxui/core, @mdxui/shadcn, @mdxui/magicui, @mdxui/tailwind, @mdxui/ink, @mdxui/browser, @mdxui/chrome, @mdxui/safari, @mdxui/reveal, @mdxui/remotion, @mdxui/mcp
- **Note:** Has its own RESTRUCTURE_PLAN.md with comprehensive refactoring strategy
- **Scope:** React components optimized for MDX usage

**mdxtra** (52KB)
- **Purpose:** Nextra integration for MDX
- **Status:** IN SCOPE - MDX ecosystem integration
- **Dependencies:** Next.js, Nextra
- **Scope:** Nextra theme and MDX integration

**schema.org.ai** (104KB)
- **Purpose:** TypeScript types for schema.org.ai standard
- **Status:** IN SCOPE - AI-native vocabulary for semantic web
- **Scope:** TypeScript definitions for schema.org.ai ontology

#### ❌ Out of Scope Packages (Extract) - 452KB

**ai-functions** (284KB)
- **Purpose:** Generic AI-powered functions (not MDX-specific)
- **Status:** OUT OF SCOPE - Should be extracted
- **Dependencies:** @ai-sdk/openai, ai, @google/genai, @mendable/firecrawl-js
- **Functions:** ai, list, research, extract, is, say, image, markdown, video, code, deepwiki, mdx, plan, scrape, scope, ui, workflow
- **Issue:** Only the `mdx` function is MDX-specific; the rest are generic AI utilities
- **Recommendation:** Extract to separate `@dot-do/ai-functions` package in ai/ repo

**ai-workflows** (100KB)
- **Purpose:** Generic AI workflow management (not MDX-specific)
- **Status:** OUT OF SCOPE - Should be extracted
- **Dependencies:** ai-functions (workspace), react, ink, esbuild
- **Issue:** Generic workflow orchestration, no MDX-specific functionality
- **Recommendation:** Extract to `@dot-do/ai-workflows` package in ai/ repo

**ai-experiments** (68KB)
- **Purpose:** Experimental AI features (not MDX-specific)
- **Status:** OUT OF SCOPE - Should be extracted
- **Dependencies:** mdxai (workspace)
- **Issue:** Temporary experiments that don't belong in production MDX repo
- **Recommendation:** Extract to ai/ repo or archive if no longer needed

### Apps (1.3MB) - Keep as Showcase

All 5 apps are MDX-focused and serve as documentation/showcase:

- **mdx.org.ai** (port 3001) - Main documentation site
- **mdxld.org** (port 3002) - MDXLD standard documentation
- **schema.org.ai** (port 3003) - Schema.org.ai documentation
- **io.mw** (port 3004) - Hosted mdxe with dynamic subdomains
- **mdxui.org** (port 3005) - MDXUI component documentation

**Recommendation:** Keep all apps - they demonstrate core mdx capabilities

### Generated Content & Documentation

**schema.org/** (9.5MB, 924 files)
- **Purpose:** 800+ auto-generated Schema.org MDX files
- **Status:** Should be separate package or build artifact
- **Issue:** 9.5MB of generated content inflates repo size
- **Recommendation:**
  - Move to @mdxld/schema package as a sub-package of mdxld
  - Or generate on-demand via `pnpm generate:schema` and .gitignore
  - Document regeneration process in README

**research/** (920KB, 24 files)
- **Purpose:** Research markdown files on various MDX topics
- **Status:** Should move to /notes or documentation
- **Files:** agentic-cli.md, ai-success-philosophy.md, atomic-habits.md, etc.
- **Issue:** Research notes mixed with production code
- **Recommendation:** Move to /notes directory per CLAUDE.md convention

**examples/** (1.1MB, 26 directories)
- **Purpose:** Example MDX projects and use cases
- **Status:** Audit and consolidate
- **Directories:** .do, agents, blog, books, cli, content, deck, icons, ideas, images, industries, minimal, occupations, pitch, roles, services, signups, slides, startups, tests, waitlist, website, workflow
- **Issue:** Too many examples, unclear organization
- **Recommendation:**
  - Keep only MDX-relevant examples (blog, content, deck, slides, minimal)
  - Move project-specific examples (.do, agents, pitch, startups) to separate repo
  - Consolidate remaining examples with clear README documentation

### Dependencies & Cross-References

**Current Cross-Dependencies:**
```
mdxai
  ├─> mdxe (workspace)
  └─> mdxld (workspace)

ai-workflows
  └─> ai-functions (workspace)

ai-experiments
  └─> mdxai (workspace)
```

**After Extraction:**
```
mdxai
  ├─> mdxe (workspace)
  ├─> mdxld (workspace)
  └─> @dot-do/ai-functions (npm package)
```

---

## Scope Criteria

### ✅ Belongs in mdx/ Repository

1. **MDX-Specific Functionality**
   - Directly processes, generates, or manipulates MDX files
   - Integrates MDX with other tools/frameworks
   - Provides MDX-specific developer experience

2. **MDX Standards Implementation**
   - mdxld.org - Linked data for MDX
   - mdx.org.ai - AI-native MDX capabilities
   - schema.org.ai - Semantic web vocabulary

3. **Core MDX Packages**
   - mdxai - AI-powered MDX generation
   - mdxdb - MDX as a database
   - mdxe - MDX development environment
   - mdxld - MDX linked data
   - mdxui - MDX UI components
   - mdxtra - MDX integrations

4. **MDX Documentation & Showcase**
   - Apps demonstrating MDX capabilities
   - Examples showing MDX best practices
   - Documentation sites for MDX standards

### ❌ Does NOT Belong in mdx/ Repository

1. **Generic AI Functions**
   - Not specific to MDX format
   - Could be used with any content type
   - Better suited for ai/ repo in dot-do organization

2. **Experimental Code**
   - Unstable or temporary experiments
   - Not production-ready
   - Better suited for separate experiments repo

3. **Project-Specific Examples**
   - Examples tied to specific .do projects
   - Startup pitch decks, waitlist pages, etc.
   - Better suited for projects/ repo

4. **Research & Notes**
   - Research markdown files
   - Planning documents
   - Better suited for /notes directory

---

## Recommended Actions

### Phase 1: Extract Out-of-Scope Packages (Week 1)

#### 1. Create ai/ Repository in dot-do Organization

```bash
# In .do/ root
mkdir -p ai/packages
cd ai

# Initialize new repo
git init
pnpm init
```

**Package Structure:**
```
ai/
├── package.json (monorepo root)
├── pnpm-workspace.yaml
├── turbo.json
├── packages/
│   ├── ai-functions/      # Extracted from mdx/
│   ├── ai-workflows/      # Extracted from mdx/
│   └── ai-experiments/    # Extracted from mdx/
├── CLAUDE.md
└── README.md
```

#### 2. Migrate ai-functions Package

**Steps:**
1. Copy `mdx/packages/ai-functions/` → `ai/packages/ai-functions/`
2. Update package.json:
   - Change name to `@dot-do/ai-functions`
   - Remove workspace dependencies (mdxai dependency)
   - Publish to npm or private registry
3. Update mdxai in mdx repo:
   - Replace `ai-functions` workspace dependency with `@dot-do/ai-functions` npm package
   - Update imports in mdxai
4. Test mdxai still works with external package
5. Remove `mdx/packages/ai-functions/` directory
6. Commit both repos

#### 3. Migrate ai-workflows Package

**Steps:**
1. Copy `mdx/packages/ai-workflows/` → `ai/packages/ai-workflows/`
2. Update package.json:
   - Change name to `@dot-do/ai-workflows`
   - Replace workspace ai-functions with `@dot-do/ai-functions` npm package
3. Test build and functionality
4. Remove `mdx/packages/ai-workflows/` directory
5. Commit both repos

#### 4. Migrate ai-experiments Package

**Steps:**
1. Evaluate if ai-experiments is still needed
2. If yes: Copy to `ai/packages/ai-experiments/` and rename to `@dot-do/ai-experiments`
3. If no: Archive or delete
4. Remove `mdx/packages/ai-experiments/` directory
5. Commit

### Phase 2: Reorganize Content (Week 2)

#### 1. Move Research to /notes

```bash
cd /Users/nathanclevenger/Projects/.do/mdx
mkdir -p notes/research
mv research/* notes/research/
rmdir research
git add notes/ research/
git commit -m "Move research files to /notes per CLAUDE.md convention"
```

#### 2. Consolidate Examples

**Keep (MDX-focused):**
- examples/blog
- examples/content
- examples/deck
- examples/slides
- examples/minimal

**Move to projects/ repo:**
- examples/.do
- examples/agents
- examples/pitch
- examples/startups
- examples/signups
- examples/waitlist

**Archive/Delete:**
- examples/books
- examples/icons
- examples/images
- examples/roles
- examples/services
- examples/website
- examples/workflow

**Steps:**
1. Create examples/README.md documenting each example
2. Move project-specific examples to projects/ repo
3. Archive unused examples
4. Update apps to reference correct example locations
5. Commit changes

#### 3. Handle schema.org/ Generated Files

**Option A: Separate Package (Recommended)**
```bash
# Create @mdxld/schema sub-package
mkdir -p packages/mdxld/schema
mv schema.org/* packages/mdxld/schema/
```

**Option B: Generated Artifact**
```bash
# Add to .gitignore
echo "schema.org/" >> .gitignore
# Document in README how to regenerate
```

**Recommendation:** Use Option A - create @mdxld/schema package
- Properly versioned and published
- Can be imported by other packages
- Keeps generated files organized

### Phase 3: Update Documentation (Week 3)

#### 1. Update README.md

Add clear scope statement:

```markdown
## What is MDX?

MDX is a superset of Markdown that allows you to:
- Write content in Markdown
- Add structured data via YAML frontmatter (YAML-LD)
- Include executable code in fenced code blocks
- Use React components inline via JSX
- Integrate linked data via JSON-LD

This repository provides the foundational MDX ecosystem for the dot-do platform.

## Scope

This repository contains:
- **mdxai** - AI-powered MDX content generation
- **mdxdb** - MDX files as a database
- **mdxe** - Zero-config CLI for MDX development
- **mdxld** - Linked data for MDX (mdxld.org standard)
- **mdxui** - UI component library for MDX
- **mdxtra** - Nextra integration
- **schema.org.ai** - TypeScript types for schema.org.ai

For generic AI functions, see [@dot-do/ai](https://github.com/dot-do/ai).
```

#### 2. Update CLAUDE.md

Add scope criteria section:

```markdown
## Scope Criteria

### What Belongs in This Repo

- MDX-specific functionality (processing, generating, manipulating MDX)
- MDX standards implementation (mdxld.org, mdx.org.ai, schema.org.ai)
- MDX developer tools and infrastructure
- MDX UI components and integrations

### What Does NOT Belong

- Generic AI functions (use @dot-do/ai instead)
- Project-specific code (use projects/ repo)
- Experimental/unstable code (use experiments/ repo)
- Research notes (use /notes directory)
```

#### 3. Create Migration Guide

Document how to migrate from old ai-functions to new @dot-do/ai-functions:

```markdown
# Migration Guide: ai-functions → @dot-do/ai-functions

## Changes

The `ai-functions` package has been extracted to a separate repository and published as `@dot-do/ai-functions`.

## Before

```typescript
import { ai, list, research } from 'ai-functions'
```

## After

```typescript
import { ai, list, research } from '@dot-do/ai-functions'
```

## Installation

```bash
pnpm add @dot-do/ai-functions
```

## Breaking Changes

None - the API remains identical.
```

### Phase 4: Cleanup & Optimization (Week 4)

#### 1. Update Dependencies

```bash
# In mdx/ repo
pnpm remove ai-functions ai-workflows ai-experiments
pnpm add @dot-do/ai-functions
pnpm install
```

#### 2. Update Turbo Configuration

Remove references to deleted packages:

```json
// turbo.json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"]
    }
  }
}
```

#### 3. Update Workspace Configuration

```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'config/*'
  - 'examples/blog'
  - 'examples/content'
  - 'examples/deck'
  - 'examples/slides'
  - 'examples/minimal'
  - 'packages/**'
  - '!**/node_modules'
  - 'tests'
```

#### 4. Run Full Test Suite

```bash
pnpm install
pnpm build
pnpm test
pnpm check-types
pnpm lint
```

#### 5. Update Package Versions

If there are breaking changes, bump major versions:

```bash
pnpm changeset
# Select packages with breaking changes
# Select major version bump
pnpm version
```

---

## Implementation Checklist

### Week 1: Extract Packages
- [ ] Create ai/ repository in dot-do organization
- [ ] Extract ai-functions → @dot-do/ai-functions
- [ ] Extract ai-workflows → @dot-do/ai-workflows
- [ ] Extract/archive ai-experiments
- [ ] Update mdxai dependencies
- [ ] Test all packages build and work
- [ ] Commit changes to both repos

### Week 2: Reorganize Content
- [ ] Move research/ → notes/research/
- [ ] Audit examples/ directory
- [ ] Move project-specific examples to projects/ repo
- [ ] Archive unused examples
- [ ] Create @mdxld/schema package or gitignore schema.org/
- [ ] Update apps to reference new locations
- [ ] Commit changes

### Week 3: Update Documentation
- [ ] Update README.md with scope statement
- [ ] Update CLAUDE.md with scope criteria
- [ ] Create migration guide
- [ ] Update package READMEs
- [ ] Update app documentation
- [ ] Commit changes

### Week 4: Cleanup & Test
- [ ] Update all dependencies
- [ ] Update turbo.json
- [ ] Update pnpm-workspace.yaml
- [ ] Run full test suite
- [ ] Fix any broken tests
- [ ] Update package versions if needed
- [ ] Create git tags for new versions
- [ ] Publish packages (if public)
- [ ] Commit final changes

---

## Success Metrics

### Repository Focus
- ✅ All packages are MDX-specific
- ✅ No generic AI utilities in mdx repo
- ✅ Clear scope criteria documented
- ✅ Simplified dependency graph

### Code Quality
- ✅ All tests passing
- ✅ Zero TypeScript errors
- ✅ Zero linting warnings
- ✅ Build succeeds for all packages

### Documentation
- ✅ README clearly states scope
- ✅ CLAUDE.md has scope criteria
- ✅ Migration guide available
- ✅ All packages documented

### Organization
- ✅ Research moved to /notes
- ✅ Examples consolidated
- ✅ schema.org/ properly organized
- ✅ Clean directory structure

---

## Long-term Maintenance

### Adding New Packages

**Before adding a package, ask:**

1. Is this MDX-specific functionality?
2. Does it process, generate, or manipulate MDX files?
3. Does it implement an MDX standard (mdxld.org, mdx.org.ai, schema.org.ai)?
4. Could it be used without MDX?

**If yes to 1-3 and no to 4:** Add to mdx/ repo
**If no to 1-3 or yes to 4:** Add to appropriate dot-do repo (ai/, projects/, etc.)

### Dependency Management

- Keep mdx packages focused on MDX functionality
- Use @dot-do/* packages from other repos for generic utilities
- Avoid circular dependencies between repos
- Document inter-repo dependencies clearly

### Standards Alignment

Continue to align with key standards:
- **mdxld.org** - Linked data for MDX
- **mdx.org.ai** - AI-native MDX capabilities
- **schema.org.ai** - Semantic web vocabulary

---

## Conclusion

By extracting generic AI packages, consolidating examples, and clarifying scope criteria, the mdx repository will become:

- **Focused** - Purely MDX-specific functionality
- **Maintainable** - Clear organization and dependencies
- **Scalable** - Well-defined scope for future growth
- **Aligned** - Implements key MDX standards

This refactoring supports the broader dot-do platform architecture while keeping the mdx repo clean and focused on its core mission: making MDX the best format for AI-native content with linked data capabilities.

---

**Last Updated:** 2025-10-02
**Author:** Claude Code (AI Project Manager)
**Status:** Approved and Ready for Implementation
