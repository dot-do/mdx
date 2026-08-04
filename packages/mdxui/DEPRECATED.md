# `mdxui` in this repo is DEPRECATED — and it is a name collision, not just dead code

**The published `mdxui` on npm is not this package.** It is
[`dot-do/ui` → `packages/mdxui`](https://github.com/dot-do/ui/tree/main/packages/mdxui).

| | this repo (`dot-do/mdx`) | the published package (`dot-do/ui`) |
|---|---|---|
| version | `0.1.0` | `6.1.0` in-repo, `7.0.0-alpha.1` on npm (`latest`) |
| npm identity | **none** — never published from here | every published version of `mdxui`, `0.0.0` → `7.0.0-alpha.1`, records `repository: dot-do/ui` |
| what it exports | `Button`, `Card`, `Slides`, `Slide`, and the namespace objects `Core` / `Shadcn` / `Ink` / `Magicui` / `Browser` | Business-as-Code higher-order abstractions — `./site`, `./app`, `./admin`, `./zod`, `./templates` |

## The two APIs are disjoint

This is the part that makes the collision dangerous rather than merely untidy. The two packages share
a name and share **nothing else**. Anything that resolves `mdxui` to the wrong one does not get a
version mismatch — it gets a module with none of the expected exports.

## What changed here, and what did not

**Changed:** every package under `packages/mdxui` and `packages/@mdxui/*` in this repo is now
`"private": true`, so `changeset publish` cannot push any of them to npm. Two pending changesets
(`unified-mdx-components.md`, and the `mdxui` half of `workflow-step-interface.md`) declared a
`mdxui` release from this repo; they have been removed. Had a release run before this change, this
repo would have published `mdxui@0.2.0` and **moved the npm `latest` tag off `dot-do/ui`'s
`7.0.0-alpha.1`**.

**Not changed:** the workspace name is still `mdxui`, so in-repo consumers still resolve and build.
Renaming it is the *next* step, not this one — see below.

## Do not import `mdxui` from this repo

New code in this repo should import the underlying `@mdxui/*` workspace packages directly
(`@mdxui/core`, `@mdxui/shadcn`, `@mdxui/magicui`, `@mdxui/browser`, `@mdxui/ink`, …) rather than the
`mdxui` barrel. New code **outside** this repo that wants `mdxui` wants `dot-do/ui`.

## Remaining in-repo consumers — these block the delete

| consumer | how it couples |
|---|---|
| `packages/mdxe` | `dependencies: { "mdxui": "workspace:*" }`, and `src/template/components/mdx-components.tsx` imports `{ Button, Card, Core, Shadcn, Magicui, Browser } from 'mdxui'` |
| `packages/@mdxui/mcp` | declares `mdxui` as a dependency |
| `examples/deck`, `examples/payload-blog` | declare `mdxui` as a dependency |
| `README.md`, `examples/blog/getting-started-with-mdxe.mdx` | document `import … from 'mdxui'` |

`mdxe` is the one that matters: it is a live, published package whose scaffolding template emits an
`import … from 'mdxui'` into user projects. **In a user's project that import resolves to npm — i.e.
to `dot-do/ui`'s `mdxui`, which has none of those exports.** Migrating `mdxe` off the barrel and onto
explicit `@mdxui/*` imports is the prerequisite for deleting this directory.

## Why this exists

Recorded for the next agent so the reasoning is not re-derived: the owner ruled on 2026-08-03 that
"the mdxui in the mdx repo is old and needs mostly deprecated … the new mdxui packages are in the ui
repo … and mdxui needs to be removed from the mdx repo and refer to the ui repo." Tracked as
`dot-do/vis#166` (which upgrades `dot-do/vis#145` from "dead code" to "name collision").
