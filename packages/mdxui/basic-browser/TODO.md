# TODO

> High-level implementation roadmap.  See our automated task list in `.cursor-todo.yaml` for authoritative state.

## Foundation

- [x] Initialize Bun project (`bun init`)
- [x] Write project README & roadmap
- [ ] Install dependencies (React, monaco-editor, @mdx-js/react, shiki, remark-gfm, react-markdown, etc.)
- [ ] Public `index.html` entrypoint
- [ ] `src/backend.ts` – Bun.serve + REST API
- [ ] `src/frontend.tsx` – React root, context providers

## Core Components

- [ ] `BrowseMode` – directory tree & file picker
- [ ] `EditMode` – Monaco editor with MDX/TS support
- [ ] `PreviewMode` – MDX render w/ Shiki highlighting
- [ ] State management (Zustand or React context) for current file, unsaved changes, etc.

## Editor Integration

- [ ] Monaco worker configuration for Bun bundler
- [ ] MDX language support via `monaco-editor/esm/vs/language`

## Highlighting

- [ ] Load Shiki theme & highlighter once; expose via React context
- [ ] Custom renderer to feed Shiki tokens into `react-markdown`

## API & Persistence

- [ ] `GET /api/files` – list MDX files
- [ ] `GET /api/file/:path` – fetch file contents
- [ ] `PUT /api/file/:path` – save edits

## Testing

- [ ] **Unit** – Vitest + @testing-library/react for components & utils
- [ ] **E2E** – Playwright; scenarios: browse → edit → preview → save
- [ ] GitHub CI workflow running `bun test` & Playwright headless

## DX / Scripts

- [ ] `bun run dev` – dev server with HMR
- [ ] `bun run build` – production build (Bun.build)
- [ ] `bun run e2e` – playwright tests

## Stretch Goals

- [ ] Drag-and-drop file uploads
- [ ] Theme switcher (light/dark)
- [ ] Collaborative editing via WebSockets 
