# Migration Guide: AI Packages to @dot-do/ai

This guide helps you migrate from the workspace-based `ai-functions` and `ai-workflows` packages to the new standalone [@dot-do/ai](https://github.com/dot-do/ai) repository.

## What Changed?

**Effective:** October 2025 (v1.0.0 release)

Generic AI functionality has been extracted from the mdx monorepo into a dedicated [@dot-do/ai](https://github.com/dot-do/ai) repository. This separation clarifies scope:

- **mdx repo** → MDX-specific tooling only (mdxai, mdxdb, mdxe, mdxld, mdxui, mdxtra)
- **@dot-do/ai repo** → Generic AI utilities usable across any project

### Moved Packages

| Old Package (workspace) | New Package (npm) | Status |
|-------------------------|-------------------|--------|
| `ai-functions` | `@dot-do/ai-functions` | Published to npm |
| `ai-workflows` | `@dot-do/ai-workflows` | Published to npm |
| `ai-experiments` | _(archived)_ | Too minimal, use mdxai directly |

## Migration Steps

### 1. Update package.json Dependencies

**Before:**
```json
{
  "dependencies": {
    "ai-functions": "workspace:*",
    "ai-workflows": "workspace:*"
  }
}
```

**After:**
```json
{
  "dependencies": {
    "@dot-do/ai-functions": "^0.1.0",
    "@dot-do/ai-workflows": "^0.1.0"
  }
}
```

### 2. Update Import Statements

**Before:**
```typescript
import { ai, list, write, research } from 'ai-functions'
import { Workflow, TaskRunner } from 'ai-workflows'
```

**After:**
```typescript
import { ai, list, write, research } from '@dot-do/ai-functions'
import { Workflow, TaskRunner } from '@dot-do/ai-workflows'
```

### 3. Install New Packages

```bash
# Remove old workspace references
pnpm remove ai-functions ai-workflows

# Install new scoped packages
pnpm add @dot-do/ai-functions @dot-do/ai-workflows
```

### 4. Verify Build

```bash
# Type check
pnpm check-types

# Build
pnpm build

# Test
pnpm test
```

## What Stayed in mdx?

The following **MDX-specific** packages remain in the mdx monorepo:

- **`mdxai`** - AI-powered MDX generation (uses `@dot-do/ai-functions` internally)
- **`mdxdb`** - MDX files as a database
- **`mdxe`** - MDX development environment
- **`mdxld`** - MDX linked data
- **`mdxui`** - MDX UI components
- **`mdxtra`** - MDX integrations

These packages may depend on `@dot-do/ai-functions` but provide MDX-specific functionality.

## Breaking Changes

### Package Naming

- All packages now use `@dot-do` scope
- Import paths have changed (see "Update Import Statements" above)

### Workspace Dependencies

- No longer uses `workspace:*` protocol
- Uses standard npm versioning (`^0.1.0`)
- Published to npm registry (or private registry)

### No Functional Changes

The internal APIs remain **100% compatible**:

- ✅ Same function signatures
- ✅ Same TypeScript types
- ✅ Same behavior
- ✅ Same test coverage

## Timeline

| Date | Milestone |
|------|-----------|
| **Oct 1, 2025** | Packages extracted to @dot-do/ai repo |
| **Oct 1, 2025** | Published to npm as v0.1.0 |
| **Oct 15, 2025** | Deprecation warning in mdx repo |
| **Nov 1, 2025** | Old workspace packages removed |

## Support

### New Repository

All future development happens at: https://github.com/dot-do/ai

- Issues: https://github.com/dot-do/ai/issues
- Discussions: https://github.com/dot-do/ai/discussions
- Changelog: https://github.com/dot-do/ai/blob/main/CHANGELOG.md

### MDX Repository

The mdx repo focuses exclusively on MDX tooling: https://github.com/dot-do/mdx

- Issues: https://github.com/dot-do/mdx/issues
- Documentation: https://mdx.org.ai

## Examples

### Before: Workspace Package

```typescript
// In mdx monorepo workspace
import { ai } from 'ai-functions'

const titles = await ai.list`100 blog post titles about ${topic}`
```

### After: NPM Package

```typescript
// Using published @dot-do/ai-functions
import { ai } from '@dot-do/ai-functions'

const titles = await ai.list`100 blog post titles about ${topic}`
```

### Using mdxai (Recommended for MDX)

If you're working with MDX files, use `mdxai` instead:

```typescript
// mdxai provides MDX-specific AI features
import { ai } from 'mdxai'
import { db } from '@mdxdb/fs'

// Generate MDX content directly to database
const post = await ai`Write a blog post about ${title}`
await db.set(`blog/${slug}.mdx`, post)
```

## FAQ

### Q: Why the split?

**A:** The mdx repo was accumulating generic AI utilities that weren't MDX-specific. By moving them to @dot-do/ai, we:

1. Clarify scope: mdx = MDX-specific, ai = generic AI
2. Enable reuse: Other projects can use @dot-do/ai without MDX
3. Reduce coupling: Cleaner dependency graph
4. Improve focus: Each repo has a clear purpose

### Q: Do I need to migrate immediately?

**A:** You have until **November 1, 2025** before the old packages are removed. We recommend migrating during your next development cycle.

### Q: Will mdxai still work?

**A:** Yes! `mdxai` is MDX-specific and stays in the mdx repo. It depends on `@dot-do/ai-functions` internally but provides a simpler MDX-focused API.

### Q: Can I use both @dot-do/ai and mdxai?

**A:** Yes, they serve different purposes:

- Use `@dot-do/ai-functions` for generic AI tasks (any text, any format)
- Use `mdxai` for MDX-specific tasks (generating MDX content with frontmatter)

### Q: What about embedding models?

**A:** Embedding models moved to `@dot-do/ai-functions`. If you need embeddings in MDX, `mdxdb` provides MDX-specific embedding support via SQLite.

### Q: Where do I report issues?

**A:**
- For `@dot-do/ai-*` packages → https://github.com/dot-do/ai/issues
- For `mdx*` packages → https://github.com/dot-do/mdx/issues

## Need Help?

If you encounter issues during migration:

1. Check the [@dot-do/ai README](https://github.com/dot-do/ai/blob/main/README.md)
2. Review the [CLAUDE.md](./CLAUDE.md) for scope criteria
3. Open an issue in the appropriate repository
4. Ask in GitHub Discussions

---

**Last Updated:** October 1, 2025
**Migration Status:** Active
**Support:** https://github.com/dot-do/ai/issues
