# MDX Repository Dependency Audit Report

Generated: 2025-10-04T18:44:51.102Z

## Package Inventory

Total packages: 58

### MDX DB Subpackages (7):

- **@mdxdb/velite** (0.1.0) - `packages/mdxdb/velite/package.json`
- **@mdxdb/sqlite** (0.1.1) - `packages/mdxdb/sqlite/package.json`
- **@mdxdb/render** (0.1.0) - `packages/mdxdb/render/package.json`
- **@mdxdb/payload** (0.1.0) - `packages/mdxdb/payload/package.json`
- **@mdxdb/importers** (0.1.0) - `packages/mdxdb/importers/package.json`
- **@mdxdb/fs** (0.1.0) - `packages/mdxdb/fs/package.json`
- **@mdxdb/core** (0.1.2) - `packages/mdxdb/core/package.json`

### MDX UI Subpackages (16):

- **mdxui** (0.1.0) - `packages/mdxui/package.json`
- **@mdxui/types** (0.0.0) - `packages/mdxui/types/package.json`
- **@mdxui/tailwind** (0.1.0) - `packages/mdxui/tailwind/package.json`
- **@mdxui/shadcn** (0.0.0) - `packages/mdxui/shadcn/package.json`
- **@mdxui/semantic-mapping** (0.0.0) - `packages/mdxui/semantic-mapping/package.json`
- **@mdxui/safari** (0.0.0) - `packages/mdxui/safari/package.json`
- **@mdxui/reveal** (0.0.0) - `packages/mdxui/reveal/package.json`
- **@mdxui/remotion** (0.1.0) - `packages/mdxui/remotion/package.json`
- **@mdxui/react** (0.0.0) - `packages/mdxui/react/package.json`
- **@mdxui/mcp** (0.1.0) - `packages/mdxui/mcp/package.json`
- **@mdxui/magicui** (0.0.0) - `packages/mdxui/magicui/package.json`
- **@mdxui/ink** (0.1.0) - `packages/mdxui/ink/package.json`
- **@mdxui/core** (0.0.0) - `packages/mdxui/core/package.json`
- **@mdxui/chrome** (0.2.0) - `packages/mdxui/chrome/package.json`
- **@mdxui/browser** (0.1.0) - `packages/mdxui/browser/package.json`
- **@mdxui/basic-browser** (0.1.0) - `packages/mdxui/basic-browser/package.json`

### Config Packages (5):

- **@repo/typescript-config** (0.0.0) - `config/typescript-config/package.json`
- **@repo/tsup-config** (0.1.0) - `config/tsup-config/package.json`
- **@repo/tailwind-config** (0.0.0) - `config/tailwind-config/package.json`
- **@repo/eslint-config** (0.0.0) - `config/eslint-config/package.json`
- **datasets** (0.0.1) - `config/datasets/package.json`

### Apps (5):

- **schema.org.ai** (0.1.0) - `apps/schema.org.ai/package.json`
- **mdxui-next** (0.1.0) - `apps/mdxui.org/package.json`
- **mdxld.org** (0.1.0) - `apps/mdxld.org/package.json`
- **mdx.org.ai** (0.1.0) - `apps/mdx.org.ai/package.json`
- **io.mw** (0.1.0) - `apps/io.mw/package.json`

### Examples (6):

- **slides-example** (0.0.0) - `examples/slides/package.json`
- **payload-blog-example** (0.1.0) - `examples/payload-blog/package.json`
- **minimal-example** (0.0.0) - `examples/minimal/package.json`
- **deck-example** (0.0.0) - `examples/deck/package.json`
- **mdxdb-build-example** (0.1.0) - `examples/content/package.json`
- **blog-example** (0.0.0) - `examples/blog/package.json`

### Examples Archive (7):

- **startups-example** (0.0.0) - `examples-archive/startups/package.json`
- **occupations** (0.0.1) - `examples-archive/occupations/package.json`
- **pitch** (0.0.0) - `examples-archive/pitch/package.json`
- **industries** (0.0.1) - `examples-archive/industries/package.json`
- **ideas-example** (0.0.0) - `examples-archive/ideas/package.json`
- **mdx-agents-chat-cli** (0.1.0) - `examples-archive/agents/package.json`
- **ts-app** (0.0.0) - `examples-archive/cli/package.json`

### Other (5):

- **mdx** (0.0.0) - `package.json`
- **tests** (0.0.0) - `tests/package.json`
- **@mdxld/schema.org** (0.1.0) - `schema.org/package.json`
- **@mdxld/ai** (0.1.0) - `schema/package.json`
- **voice** (0.0.1) - `demo/voice/package.json`

## Workspace Dependencies

Internal packages that depend on other workspace packages:

- **@mdxdb/core** used by: mdx, tests, mdxe, mdxai, payload-blog-example, @mdxdb/velite, @mdxdb/sqlite, @mdxdb/render, @mdxdb/payload, @mdxdb/importers, @mdxdb/fs
- **@mdxdb/fs** used by: mdx, tests, mdxe, mdxai, payload-blog-example, mdxdb-build-example, @mdxdb/importers
- **@mdxdb/sqlite** used by: mdx, tests, mdxe
- **mdxai** used by: tests, deck-example, @mdxui/mcp
- **mdxe** used by: tests, mdxai, startups-example, occupations, industries, slides-example, payload-blog-example, minimal-example, deck-example, blog-example, datasets, mdxe-hono-worker-markdown, mdxe-hono-worker-html
- **mdxld** used by: tests, @mdxld/schema.org, @mdxld/ai, mdxai, ideas-example, @mdxui/mcp, @mdxdb/core
- **mdxui** used by: tests, mdxe, payload-blog-example, deck-example, schema.org.ai, mdxld.org, mdx.org.ai, io.mw, @mdxui/mcp
- **@repo/tsup-config** used by: @mdxld/schema.org.ai, mdxui, mdxld, mdxe, mdxai, @mdxui/types, @mdxui/shadcn, @mdxui/semantic-mapping, @mdxui/safari, @mdxui/reveal, @mdxui/react, @mdxui/mcp, @mdxui/magicui, @mdxui/core, @mdxui/chrome, @mdxui/browser, @mdxdb/velite, @mdxdb/fs
- **@repo/typescript-config** used by: @mdxld/schema.org.ai, mdxui, mdxe, schema.org.ai, mdxld.org, mdx.org.ai, io.mw, @mdxui/types, @mdxui/shadcn, @mdxui/semantic-mapping, @mdxui/safari, @mdxui/reveal, @mdxui/react, @mdxui/mcp, @mdxui/magicui, @mdxui/core, @mdxui/chrome, @mdxui/browser, @mdxdb/velite
- **@mdxui/browser** used by: mdxui, @mdxui/safari, @mdxui/chrome
- **@mdxui/chrome** used by: mdxui
- **@mdxui/core** used by: mdxui, @mdxui/tailwind, @mdxui/shadcn, @mdxui/reveal, @mdxui/magicui
- **@mdxui/ink** used by: mdxui, mdxe
- **@mdxui/magicui** used by: mdxui
- **@mdxui/reveal** used by: mdxui, mdxe, deck-example
- **@mdxui/safari** used by: mdxui
- **@mdxui/shadcn** used by: mdxui
- **@mdxui/tailwind** used by: mdxui
- **@repo/eslint-config** used by: mdxui, schema.org.ai, mdxld.org, mdx.org.ai, io.mw, @mdxui/shadcn, @mdxui/safari, @mdxui/reveal, @mdxui/mcp, @mdxui/magicui, @mdxui/core, @mdxui/chrome, @mdxui/browser
- **@mdxdb/importers** used by: mdxai
- **datasets** used by: industries
- **@mdxui/types** used by: @mdxui/semantic-mapping, @mdxui/react
- **@mdxui/semantic-mapping** used by: @mdxui/react
- **@repo/tailwind-config** used by: @mdxui/core

## Duplicate Dependencies (Different Versions)

- **ink-big-text**: ^1.2.0, ^2.0.0
- **micromatch**: ^4.0.5, ^4.0.8
- **dotenv**: ^16.5.0, ^16.4.5
- **prettier**: ^3.5.3, ^2.8.7, 3.3.3
- **remark-mdx**: ^3.1.0, ^3.0.0
- **ts-node**: ^10.9.2, ^10.9.1
- **tsx**: ^4.19.4, ^4.6.2
- **typescript**: ^5.8.3, ^5.8, ^5, ^5.7.2, ^5.0.0
- **unified**: ^11.0.5, ^11.0.4
- **vitest**: ^3.1.4, ^2.1.8, ^2.0.5, ^3.2.4
- **react**: ^18.2.0, ^19.1.0, ^19, ^19.0.0, 19.1.0, >=19.0.0, >=18.0.0
- **react-dom**: ^18.2.0, ^19.1.0, ^19, ^19.0.0, 19.1.0, >=19.0.0, >=18.0.0
- **tsup**: ^8.0.0, ^8.0.2, ^8.3.5, ^8.0.1, ^8.2.4
- **next**: ^15.3.0, ^15.3.5, 15.3.5
- **motion**: ^10.18.0, ^12.23.3
- **eslint**: ^9.27.0, ^9.26.0, 9.19.0, ^9.9.1, ^9.0.0
- **commander**: ^11.1.0, ^12.1.0, ^14.0.0
- **esbuild**: ^0.20.1, ^0.24.0, ^0.25.6, ^0.19.11
- **next-mdx-remote-client**: ^2.1.2, ^1.0.4
- **remark-gfm**: ^4.0.1, ^4.0.0, ^3.0.1
- **velite**: ^0.2.4, ^0.1.1
- **yaml**: ^2.4.0, ^2.8.0, ^2.6.1, ^2.3.4
- **zod**: ^3.22.4, ^3.21.4, 3.22.3, ^3.23.8, ^3.24.1
- **hono**: ^4.6.14, ^4.0.0
- **chalk**: ^5.3.0, ^5.2.0
- **ink**: ^6.0.1, ^5.2.1, ^4.4.1, ^4.1.0
- **payload**: ^3.46.0, ^3.38.0
- **tailwindcss**: ^4.1.11, ^4.1.5, ^4, 4
- **wrangler**: ^3.100.0, ^3.80.0
- **ai**: ^4.3.16, latest, ^2.2.37
- **pastel**: ^2.0.0, ^3.0.0
- **eslint-plugin-react**: ^7.32.2, ^7.37.4
- **eslint-plugin-react-hooks**: ^4.6.0, ^5.2.0
- **class-variance-authority**: ^0.7.1, ^0.7.0
- **clsx**: ^2.1.1, ^2.1.0
- **framer-motion**: ^12.23.3, ^11.15.0
- **lucide-react**: ^0.525.0, ^0.330.0
- **shiki**: ^1.25.0, ^3.8.0
- **tailwind-merge**: ^3.3.1, ^2.2.1
- **tw-animate-css**: ^1.3.5, ^1.3.0
- **codehike**: 1.0.4, ^1.0.0

## MDX UI Package Analysis

Total MDX UI subpackages: 16

### Dependency on @mdxui/core:

- mdxui (prod)
- @mdxui/tailwind (prod)
- @mdxui/shadcn (prod)
- @mdxui/reveal (prod)
- @mdxui/magicui (prod)

### Dependency on @mdxui/browser:

- mdxui (prod)
- @mdxui/safari (prod)
- @mdxui/chrome (prod)

## React Version Analysis

- **^18.2.0**: tests, tests, mdxld, mdxai, mdx-agents-chat-cli, ts-app, voice, @mdxdb/fs, @mdxui/basic-browser
- **^19.1.0**: mdxtra, mdxe, payload-blog-example, schema.org.ai, mdxld.org, mdx.org.ai, io.mw, @mdxui/tailwind, @mdxui/ink, @mdxui/browser
- **^19**: mdxui, mdxe, @mdxui/types, @mdxui/shadcn, @mdxui/semantic-mapping, @mdxui/reveal, @mdxui/react, @mdxui/magicui, @mdxui/core
- **^19.0.0**: slides-example, deck-example, mdxui-next, @mdxui/ink
- **19.1.0**: @mdxui/remotion
- **>=19.0.0**: @mdxui/browser
- **>=18.0.0**: @mdxui/basic-browser

## Top 20 External Dependencies

- **typescript**: used in 38 packages
- **vitest**: used in 28 packages
- **@types/react**: used in 27 packages
- **@types/node**: used in 22 packages
- **react**: used in 22 packages
- **tsup**: used in 22 packages
- **@types/react-dom**: used in 18 packages
- **react-dom**: used in 18 packages
- **eslint**: used in 16 packages
- **mdxe**: used in 13 packages
- **zod**: used in 11 packages
- **mdxui**: used in 9 packages
- **next**: used in 8 packages
- **velite**: used in 8 packages
- **mdxld**: used in 7 packages
- **commander**: used in 7 packages
- **gray-matter**: used in 7 packages
- **ink**: used in 7 packages
- **tsx**: used in 6 packages
- **nextra**: used in 6 packages

## Recommendations

1. **Workspace Dependencies**: All internal dependencies use workspace:* ✅
2. **React Version**: Most packages use React 19 ✅
3. **Duplicate Dependencies**: ⚠️  41 duplicates found
4. **MDX UI Structure**: Clear dependency hierarchy with @mdxui/core as foundation ✅
