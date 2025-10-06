# MDX Repository Dependency Graph

Generated: 2025-10-04

## Package Structure Overview

```
mdx/ (root)
├── packages/
│   ├── mdxai           # AI-powered MDX generation
│   ├── mdxdb/          # MDX as database (7 subpackages)
│   ├── mdxe            # MDX development environment
│   ├── mdxld           # Linked data for MDX
│   ├── mdxui/          # UI components (16 subpackages)
│   ├── mdxtra          # Nextra integration
│   └── schema.org.ai   # Schema.org types
├── config/             # Shared configs (5 packages)
├── apps/               # Documentation sites (5 apps)
├── examples/           # Example projects (6)
└── examples-archive/   # Archived examples (7)
```

## Core Package Dependencies

### High-Level Architecture

```mermaid
graph TB
    subgraph "Core Packages"
        mdxdb[mdxdb]
        mdxai[mdxai]
        mdxe[mdxe]
        mdxld[mdxld]
        mdxui[mdxui]
        mdxtra[mdxtra]
        schema[schema.org.ai]
    end

    subgraph "Config Packages"
        tsconfig[@repo/typescript-config]
        tsup[@repo/tsup-config]
        eslint[@repo/eslint-config]
        tailwind[@repo/tailwind-config]
    end

    mdxai --> mdxdb
    mdxai --> mdxe
    mdxai --> mdxld

    mdxe --> mdxdb
    mdxe --> mdxui

    mdxld --> mdxdb

    mdxui --> tsup
    mdxui --> tsconfig
    mdxui --> eslint

    mdxe --> tsup
    mdxe --> tsconfig

    mdxai --> tsup
    mdxai --> tsconfig
```

## MDXDB Package Structure

```mermaid
graph LR
    subgraph "MDXDB Packages"
        core[@mdxdb/core]
        fs[@mdxdb/fs]
        sqlite[@mdxdb/sqlite]
        velite[@mdxdb/velite]
        payload[@mdxdb/payload]
        render[@mdxdb/render]
        importers[@mdxdb/importers]
    end

    fs --> core
    sqlite --> core
    velite --> core
    payload --> core
    render --> core
    importers --> core
    importers --> fs
```

**Dependency Summary:**
- **@mdxdb/core** - Foundation package (no internal deps)
- **@mdxdb/fs** - File system backend (depends on core)
- **@mdxdb/sqlite** - SQLite backend (depends on core)
- **@mdxdb/velite** - Velite integration (depends on core)
- **@mdxdb/payload** - Payload CMS integration (depends on core)
- **@mdxdb/render** - Rendering utilities (depends on core)
- **@mdxdb/importers** - Import tools (depends on core + fs)

**Status:** ✅ Clean hierarchy, no circular dependencies

## MDXUI Package Structure

```mermaid
graph TB
    subgraph "Foundation"
        core[@mdxui/core]
        types[@mdxui/types]
    end

    subgraph "Web Components"
        shadcn[@mdxui/shadcn]
        magicui[@mdxui/magicui]
        tailwind[@mdxui/tailwind]
        reveal[@mdxui/reveal]
    end

    subgraph "Browser Extensions"
        browser[@mdxui/browser]
        chrome[@mdxui/chrome]
        safari[@mdxui/safari]
        basic[@mdxui/basic-browser]
    end

    subgraph "Terminal UI"
        ink[@mdxui/ink]
    end

    subgraph "Utilities"
        semantic[@mdxui/semantic-mapping]
        react[@mdxui/react]
        mcp[@mdxui/mcp]
        remotion[@mdxui/remotion]
    end

    subgraph "Meta Package"
        mdxui[mdxui]
    end

    shadcn --> core
    magicui --> core
    tailwind --> core
    reveal --> core

    chrome --> browser
    safari --> browser

    semantic --> types
    react --> types
    react --> semantic

    mdxui --> core
    mdxui --> browser
    mdxui --> chrome
    mdxui --> ink
    mdxui --> magicui
    mdxui --> reveal
    mdxui --> safari
    mdxui --> shadcn
    mdxui --> tailwind
```

### MDXUI Package Classification

**Foundation Packages (2):**
- `@mdxui/core` - Base components, design tokens, Tremor charts, Motion animations
- `@mdxui/types` - Shared TypeScript types

**Web Component Packages (4):**
- `@mdxui/shadcn` - Shadcn UI integration (depends on core)
- `@mdxui/magicui` - Magic UI animations (depends on core)
- `@mdxui/tailwind` - Tailwind utilities (depends on core)
- `@mdxui/reveal` - Reveal.js presentation integration (depends on core)

**Browser Extension Packages (4):**
- `@mdxui/browser` - Base browser extension with Monaco editor
- `@mdxui/chrome` - Chrome-specific extension (depends on browser)
- `@mdxui/safari` - Safari-specific extension (depends on browser)
- `@mdxui/basic-browser` - Minimal browser support

**Terminal UI Package (1):**
- `@mdxui/ink` - Ink-based CLI components

**Utility Packages (4):**
- `@mdxui/semantic-mapping` - Schema.org semantic mapping (depends on types)
- `@mdxui/react` - React-specific utilities (depends on types + semantic-mapping)
- `@mdxui/mcp` - Model Context Protocol integration
- `@mdxui/remotion` - Remotion video components

**Meta Package (1):**
- `mdxui` - Convenience package that re-exports from subpackages

**Status:** ✅ Clean hierarchy, clear separation of concerns, no circular dependencies

## External Dependencies by Category

### Build Tools (Used Everywhere)
- TypeScript (38 packages)
- tsup (22 packages)
- Vitest (28 packages)
- ESLint (16 packages)

### React Ecosystem
- React 19 (22 packages)
- React DOM (18 packages)
- Next.js (8 packages)

### MDX Tooling
- @mdx-js/mdx
- @mdx-js/react
- remark-mdx
- unified

### UI Components
- Tremor React (charts)
- Radix UI (primitives)
- Motion / Framer Motion (animations)
- Tailwind CSS

### Terminal UI
- Ink
- Commander
- Chalk
- Figlet

### Data/Schema
- Zod (11 packages)
- Velite (8 packages)
- Gray Matter (7 packages)

## Duplicate Dependency Issues

### Critical Duplicates (Different Major Versions)

**React:**
- React 18 vs React 19 (mixed across packages)
- **Impact:** Potential runtime conflicts
- **Action:** Migrate all to React 19

**Motion:**
- motion@^10.18.0 vs motion@^12.23.3
- **Impact:** API differences
- **Action:** Standardize on v12

**Ink:**
- ink@^4, ^5, ^6 (three major versions!)
- **Impact:** Breaking API changes
- **Action:** Migrate all to v6

**Vitest:**
- vitest@^2, ^3 (different major versions)
- **Impact:** Different test APIs
- **Action:** Standardize on v3

**Pastel:**
- pastel@^2.0.0 vs pastel@^3.0.0
- **Impact:** CLI rendering differences
- **Action:** Migrate to v3

### Medium-Priority Duplicates

**TypeScript:** ^5, ^5.0.0, ^5.7.2, ^5.8, ^5.8.3
- **Impact:** Minor - mostly compatible
- **Action:** Standardize on ^5.8.3

**ESLint:** ^9.0.0, ^9.9.1, 9.19.0, ^9.26.0, ^9.27.0
- **Impact:** Different linting rules
- **Action:** Standardize on ^9.27.0

**AI:** ^2.2.37, ^4.3.16, latest
- **Impact:** Major API differences
- **Action:** Standardize on latest stable

### Low-Priority Duplicates

Minor version differences that are likely compatible:
- next-mdx-remote-client
- remark-gfm
- yaml
- zod
- chalk
- hono
- wrangler

## Circular Dependency Check

**Analysis:** ✅ No circular dependencies detected

The dependency graph is a proper DAG (Directed Acyclic Graph):
- All workspace dependencies flow in one direction
- Foundation packages (core, types) have no internal dependencies
- Higher-level packages depend on foundation packages
- No packages create circular references

## Recommendations

### Immediate Actions (Week 1)

1. **Resolve React Version Conflicts**
   - Migrate all packages to React 19
   - Update peerDependencies consistently
   - Test all components with React 19

2. **Standardize Motion Library**
   - Choose motion@^12 or framer-motion@^12
   - Update all animation components
   - Ensure consistent API usage

3. **Consolidate Ink Versions**
   - Migrate all CLI packages to ink@^6
   - Update ink-related dependencies
   - Test terminal UI components

4. **Unify Vitest Versions**
   - Standardize on vitest@^3.1.4
   - Update all test configurations
   - Verify all tests pass

### Medium-Priority Actions (Week 2)

5. **Standardize Build Tools**
   - Align TypeScript to ^5.8.3
   - Align ESLint to ^9.27.0
   - Align tsup to ^8.0.2

6. **Clean Up AI Dependencies**
   - Decide on Vercel AI SDK version
   - Update all AI-using packages
   - Document AI integration patterns

7. **Optimize Package Versions**
   - Use exact versions for critical dependencies
   - Use ^ for tooling dependencies
   - Document version strategy in CLAUDE.md

### Long-Term Actions (Week 3+)

8. **Add Dependency Constraints**
   - Add pnpm overrides for critical packages
   - Implement version range policies
   - Set up automated dependency checks

9. **Monitor Dependency Updates**
   - Set up Renovate or Dependabot
   - Group updates by category
   - Test updates in CI before merging

10. **Document Dependency Strategy**
    - Add DEPENDENCIES.md
    - Explain version choices
    - Provide upgrade guides

## Next Steps

1. ✅ Complete dependency audit (Done)
2. ✅ Create dependency graph (Done)
3. ⏳ Fix critical duplicate dependencies
4. ⏳ Classify MDXUI subpackages
5. ⏳ Optimize MDXUI dependencies
6. ⏳ Test full build pipeline

---

**Last Updated:** 2025-10-04
**Author:** Claude Code
**Status:** Phase 1 Complete - Ready for Cleanup
