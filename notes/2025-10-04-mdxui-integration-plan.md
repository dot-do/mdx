# MDXUI Integration Plan - projects/ and site/ Integration

**Date:** 2025-10-04
**Status:** Planning Phase
**Goal:** Integrate cleaned-up mdxui from `/mdx` with `projects/` and `site/` repositories

---

## Current State Analysis

### mdx/packages/mdxui (Source - Production Ready ✅)

**Location:** `/Users/nathanclevenger/Projects/.do/mdx/packages/mdxui`

**Status:** Phase 2 Complete - Production Ready
- 16 comprehensive subpackages
- All critical dependencies standardized (React 19.1.0, Motion 12.23.3, etc.)
- Zero TypeScript errors
- 100% build success
- Full integration with mdxe verified
- 450+ lines of API documentation

**Package Structure:**
```
mdxui/
├── core/          # Basic components (Button, Card, Gradient), Tremor charts
├── shadcn/        # shadcn/ui components
├── magicui/       # 18 animation components
├── browser/       # Browser-specific utilities
├── chrome/        # Chrome extension
├── safari/        # Safari extension
├── ink/           # Terminal UI (Ink components)
├── reveal/        # Reveal.js presentation components
├── tailwind/      # Tailwind utilities
├── editor/        # Monaco editor integration
├── mdx-types/     # MDX type definitions
├── mcp/           # Model Context Protocol integration
├── types/         # TypeScript types
├── vscode/        # VS Code extension
├── workflows/     # Workflow components (Zod schemas)
└── mdxui (meta)/  # Convenience package
```

**Key Dependencies:**
- React: 19.1.0
- Motion: 12.23.3
- Ink: 6.0.1
- Vitest: 3.1.4
- Zod: 3.22.4-3.24.1
- Tremor: 4.0.0-beta

### projects/packages/mdxui (Target 1 - Needs Update ⚠️)

**Location:** `/Users/nathanclevenger/Projects/.do/projects/packages/mdxui`

**Status:** Older/Simplified Version - Has Restructure Plan
- Package name: `@projects/mdxui`
- Only 4 subpackages (core, ink, magicui, reveal, types)
- Outdated Motion version (10.18.0)
- Has RESTRUCTURE_PLAN.md but not executed

**Current Usage:**
- **projects/directory** depends on `@projects/mdxui` (workspace:*)
- Only minimal usage found: one comment in `mdx-components.tsx`
- Directory primarily uses shadcn/ui components directly

**Key Issue:** Outdated dependencies and incomplete implementation

### site/packages/ui (Separate - Independent 🔄)

**Location:** `/Users/nathanclevenger/Projects/.do/site/packages/ui`

**Status:** Active UI Library for Site Apps
- Package name: `@dot-do/ui`
- Contains shadcn/ui components
- Motion: 12.15.0 (slightly older)
- React: 19.0.0 (slightly older)
- No mdxui dependencies

**Usage:**
- Shared across all site apps (careers.do, do.industries, documentation.do, gpt.do, studio)
- Exports shadcn/ui components, hooks, utilities

**Key Insight:** This is a separate concern from mdxui

---

## Integration Strategy

### Option A: Replace projects/mdxui (Recommended ✅)

**Approach:** Replace the outdated projects/packages/mdxui with a link/reference to the cleaned-up mdx/packages/mdxui

**Pros:**
- Single source of truth for mdxui
- Automatic updates when mdx/mdxui is updated
- Access to all 16 packages instead of just 4
- No duplication or version drift

**Cons:**
- projects/ repo becomes dependent on mdx/ repo
- Need to adjust import paths if package names differ

**Implementation Steps:**

1. **Create pnpm workspace link between repos**
   ```bash
   # In projects/pnpm-workspace.yaml
   packages:
     - 'app'
     - 'directory'
     - 'site'
     - '../mdx/packages/mdxui/*'  # Link to mdx repo
   ```

2. **Update directory/package.json dependencies**
   ```json
   {
     "dependencies": {
       "@mdxui/core": "workspace:*",
       "@mdxui/magicui": "workspace:*",
       "@mdxui/reveal": "workspace:*"
     }
   }
   ```

3. **Remove old projects/packages/mdxui**
   ```bash
   rm -rf /Users/nathanclevenger/Projects/.do/projects/packages/mdxui
   ```

4. **Update imports in directory project**
   ```typescript
   // From:
   import { AnimatedText } from '@projects/mdxui/magicui'

   // To:
   import { AnimatedText } from '@mdxui/magicui'
   ```

### Option B: Sync/Copy (Alternative)

**Approach:** Copy the cleaned-up mdxui into projects/packages/mdxui and maintain separately

**Pros:**
- projects/ repo remains self-contained
- No cross-repo dependencies

**Cons:**
- Duplication of code
- Manual syncing required for updates
- Version drift risk
- More maintenance overhead

**Implementation Steps:**

1. **Backup old projects/mdxui**
   ```bash
   mv projects/packages/mdxui projects/packages/mdxui-old
   ```

2. **Copy cleaned mdxui**
   ```bash
   cp -r mdx/packages/mdxui/* projects/packages/mdxui/
   ```

3. **Update package names to @projects scope**
   ```bash
   # Update all package.json files to use @projects/mdxui-*
   ```

4. **Update dependencies**
   ```bash
   cd projects/directory && pnpm install
   ```

---

## Integration with site/ Repository

### Option 1: Add mdxui as Shared Package (Recommended ✅)

**Approach:** Add mdxui subpackages to site monorepo for use across all apps

**Why:** The site/ apps may want to use mdxui components for MDX-based content, animations, or terminal UI

**Implementation Steps:**

1. **Link mdxui in site/pnpm-workspace.yaml**
   ```yaml
   packages:
     - 'apps/*'
     - 'packages/*'
     - '../mdx/packages/mdxui/*'  # Link to mdxui packages
   ```

2. **Add mdxui to Next.js transpile packages** (site/apps/*/next.config.ts)
   ```typescript
   const nextConfig = {
     transpilePackages: [
       '@dot-do/ui',
       '@mdxui/core',
       '@mdxui/magicui',
       '@mdxui/reveal'
     ]
   }
   ```

3. **Install mdxui in specific apps as needed**
   ```json
   // site/apps/do.industries/package.json
   {
     "dependencies": {
       "@dot-do/ui": "workspace:*",
       "@mdxui/core": "workspace:*",
       "@mdxui/reveal": "workspace:*"
     }
   }
   ```

4. **Use in MDX files or components**
   ```tsx
   import { Button } from '@mdxui/core'
   import { AnimatedText } from '@mdxui/magicui'

   export default function Page() {
     return (
       <div>
         <AnimatedText text="Welcome to .do" />
         <Button variant="primary">Get Started</Button>
       </div>
     )
   }
   ```

### Option 2: Keep Separate (Status Quo)

**Approach:** site/ continues using only @dot-do/ui, no mdxui integration

**Why:** If site/ apps don't need mdxui-specific features

---

## Recommended Implementation Plan

### Phase 1: Projects Integration (High Priority)

**Goal:** Replace outdated projects/mdxui with cleaned-up mdx/mdxui

**Steps:**

1. ✅ Create pnpm workspace link in projects/ to mdx/packages/mdxui
2. ✅ Update directory/package.json dependencies (@projects/mdxui → @mdxui/*)
3. ✅ Remove old projects/packages/mdxui
4. ✅ Update all imports in directory project
5. ✅ Test directory project builds and runs
6. ✅ Verify Velite content processing works

**Estimated Time:** 30-45 minutes

**Risk Level:** Low (minimal usage in directory)

### Phase 2: Site Integration (Medium Priority)

**Goal:** Make mdxui available to site/ apps for optional use

**Steps:**

1. ✅ Add pnpm workspace link in site/ to mdx/packages/mdxui
2. ✅ Add @mdxui/* to transpile packages in Next.js configs
3. ✅ Document usage patterns for site/ developers
4. ✅ Create example MDX page using mdxui components
5. ✅ Test in one site app (e.g., do.industries)

**Estimated Time:** 30-45 minutes

**Risk Level:** Very Low (optional integration, doesn't affect existing code)

### Phase 3: Documentation and Testing (Low Priority)

**Goal:** Document integration and verify everything works

**Steps:**

1. ✅ Update projects/CLAUDE.md to reference @mdxui packages
2. ✅ Update site/CLAUDE.md to document mdxui availability
3. ✅ Create migration guide for projects/mdxui → @mdxui/*
4. ✅ Add mdxui examples to site/ apps (optional)
5. ✅ Test all build pipelines
6. ✅ Create integration notes

**Estimated Time:** 30 minutes

**Risk Level:** None (documentation only)

---

## Dependency Reconciliation

### React Version Alignment

**Current:**
- mdx/mdxui: React 19.1.0
- projects/directory: React 19.1.0 ✅ (already aligned!)
- site/: React 19.0.0 → **needs upgrade to 19.1.0**

**Action:**
```bash
# In site/ monorepo
pnpm add react@19.1.0 react-dom@19.1.0 -w
```

### Motion Version Alignment

**Current:**
- mdx/mdxui: Motion 12.23.3
- projects/mdxui (old): Motion 10.18.0
- site/ui: Motion 12.15.0 → **should upgrade to 12.23.3**

**Action:**
```bash
# In site/packages/ui
pnpm add motion@^12.23.3
```

---

## Testing Checklist

### Projects/Directory Testing

- [ ] `pnpm install` succeeds in projects/ root
- [ ] `pnpm install` succeeds in projects/directory
- [ ] `pnpm build` succeeds in projects/directory
- [ ] `pnpm dev` starts successfully
- [ ] Velite content processing works (`#site/content` imports)
- [ ] No TypeScript errors
- [ ] All shadcn/ui components still work
- [ ] No runtime errors

### Site/ Testing

- [ ] `pnpm install` succeeds in site/ root
- [ ] All site apps install successfully
- [ ] `pnpm build` succeeds for all apps
- [ ] `pnpm dev` starts all apps
- [ ] @dot-do/ui components still work in all apps
- [ ] MDX content renders correctly
- [ ] No TypeScript errors
- [ ] No breaking changes

---

## Rollback Plan

If integration causes issues:

1. **Projects:** Restore projects/packages/mdxui from backup
   ```bash
   mv projects/packages/mdxui-backup projects/packages/mdxui
   pnpm install --force
   ```

2. **Site:** Remove mdxui workspace link
   ```yaml
   # Remove from site/pnpm-workspace.yaml
   - '../mdx/packages/mdxui/*'
   ```
   ```bash
   pnpm install --force
   ```

---

## Benefits of Integration

### For Projects/Directory

✅ **Up-to-date Dependencies** - Latest React, Motion, Vitest
✅ **Full MDXUI Library** - Access to all 16 packages instead of 4
✅ **Zero Maintenance** - No need to sync or update separately
✅ **Better Components** - Cleaned-up, production-ready implementations
✅ **TypeScript Safety** - Zero errors, full type checking

### For Site/

✅ **MDX Enhancements** - Rich components for MDX content
✅ **Animation Library** - MagicUI animations for marketing pages
✅ **Presentation Mode** - Reveal.js for interactive presentations
✅ **Optional Integration** - Use only what you need
✅ **No Breaking Changes** - @dot-do/ui remains unchanged

---

## Next Steps

1. **Get User Approval** - Confirm approach (Option A: Replace recommended)
2. **Execute Phase 1** - Integrate with projects/directory
3. **Test Phase 1** - Verify directory works correctly
4. **Execute Phase 2** - Integrate with site/ (optional)
5. **Update Documentation** - Update CLAUDE.md files
6. **Close Task** - Mark integration complete

---

## Decision Required

**Question for User:** Which integration approach do you prefer?

**Option A (Recommended):**
- Replace projects/mdxui with pnpm workspace link to mdx/mdxui
- Make mdxui optionally available to site/ apps
- Single source of truth, automatic updates

**Option B (Alternative):**
- Copy cleaned mdxui to projects/packages/mdxui
- Keep site/ separate
- Self-contained but requires manual syncing

**My Recommendation:** Option A - Cross-repo pnpm workspace links provide the best developer experience with minimal maintenance overhead.

---

**Author:** Claude Code
**Last Updated:** 2025-10-04
**Status:** ✅ Planning Complete - Awaiting User Approval
**Next:** Execute Phase 1 integration with projects/directory
