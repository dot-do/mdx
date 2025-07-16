# Basic MDX Browser

A **Bun + React** playground for browsing, editing, and previewing `.mdx` files with live-reload, Monaco editor, and Shiki syntax highlighting.

## Features

- **Browse** directory tree of MDX documents
- **Edit** with Monaco (VS Code) editor – TypeScript & MDX aware
- **Preview** rendered MDX w/ `react-markdown`, `remark-gfm`, and Shiki for code blocks
- **Hot reload** via Bun’s full-stack dev server
- **Save / load** via simple REST API (`/api/files`)
- Built-in unit & e2e tests (Vitest + Playwright)

## Tech Stack

- **Bun** runtime & bundler (`Bun.serve`, `bun test`)
- **React 18** + TypeScript
- **Monaco-editor** for code editing
- **Shiki** for syntax highlighting
- **@mdx-js/react** / `react-markdown` / `remark-gfm` for MDX → React
- **Vitest** & **@testing-library/react** for unit tests
- **Playwright** for browser integration tests

## Getting Started

```bash
cd basic-browser
bun install          # install deps
bun run dev          # start dev server (reload + HMR)
```

Open <http://localhost:3000> – you’ll see the browser UI.

### Scripts

| Script           | What it does                        |
|------------------|-------------------------------------|
| `bun run dev`    | Start Bun dev server w/ HMR         |
| `bun run build`  | Produce production bundle           |
| `bun test`       | Run unit tests (Vitest)             |
| `bun run e2e`    | Run Playwright end-to-end tests     |

## Project Structure

```
basic-browser/
  public/            # static assets (index.html)
  src/
    backend.ts       # Bun.serve backend + API
    frontend.tsx     # React entrypoint
    components/      # Browse, Edit, Preview, etc.
  tests/
    unit/            # Vitest tests
    e2e/             # Playwright specs
  bunfig.toml        # Bun config
  tsconfig.json
```

## Development Notes

- **Monaco workers** – configured via `import.meta.glob` in `backend.ts`.
- **Shiki** is loaded once and passed down via React context to avoid init cost.
- The file API is intentionally simple (no auth) – replace with your own backend as needed.

## Roadmap

See [`TODO.md`](./TODO.md) for the implementation plan.

---

Made with ☕ + ⚡ by the mdxui team. 
