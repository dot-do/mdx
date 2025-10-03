#!/usr/bin/env node
import { renderMdxToInk, defaultInkComponents, Spinner, Status, ProgressBar } from '../../src/outputs/react-ink/index.js'

/**
 * Example 1: Simple MDX rendering
 */
async function example1() {
  const mdx = `
# Hello from MDX!

This is a **simple example** of rendering MDX to the CLI using React-ink.

## Features

- ANSI color support
- Component-based rendering
- Streaming support
- Real-time updates

> This is a blockquote with *italic* text

\`\`\`typescript
const greeting = "Hello, World!"
console.log(greeting)
\`\`\`
  `

  console.log('Example 1: Simple MDX Rendering')
  console.log('================================\n')

  const result = await renderMdxToInk(mdx, {
    components: defaultInkComponents,
  })

  await result.waitUntilExit()
}

/**
 * Example 2: MDX with custom components
 */
async function example2() {
  const mdx = `
# MDX with Custom Components

<Spinner label="Loading data..." />

<Status type="success">Build completed successfully!</Status>

<Status type="warning">Warning: Deprecated API usage detected</Status>

<Status type="error">Error: File not found</Status>

<ProgressBar value={75} total={100} label="Upload progress" />
  `

  console.log('\nExample 2: Custom Components')
  console.log('============================\n')

  const result = await renderMdxToInk(mdx, {
    components: {
      ...defaultInkComponents,
      Spinner,
      Status,
      ProgressBar,
    },
  })

  await result.waitUntilExit()
}

/**
 * Example 3: MDX with scope/data
 */
async function example3() {
  const mdx = `
# Data-Driven MDX

Current user: **{username}**

Build number: {buildNumber}

Status: {status}

## Recent Activity

{activity.map(item => (
  <li key={item}>{item}</li>
))}
  `

  console.log('\nExample 3: Data-Driven MDX')
  console.log('==========================\n')

  const result = await renderMdxToInk(mdx, {
    components: defaultInkComponents,
    scope: {
      username: 'Alice',
      buildNumber: 42,
      status: 'Online',
      activity: [
        'Committed 3 files',
        'Pushed to main branch',
        'Build #42 succeeded',
      ],
    },
  })

  await result.waitUntilExit()
}

/**
 * Example 4: Streaming updates
 */
async function example4() {
  console.log('\nExample 4: Streaming Updates')
  console.log('============================\n')

  async function* generateMdxUpdates() {
    const stages = [
      '# Build Started\n\n<Spinner label="Initializing..." />',
      '# Build Progress\n\n<ProgressBar value={25} total={100} label="Compiling..." />',
      '# Build Progress\n\n<ProgressBar value={50} total={100} label="Bundling..." />',
      '# Build Progress\n\n<ProgressBar value={75} total={100} label="Optimizing..." />',
      '# Build Complete\n\n<Status type="success">Build succeeded!</Status>',
    ]

    for (const stage of stages) {
      yield stage
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  }

  const { streamMdxToInk } = await import('../../src/outputs/react-ink/index.js')

  for await (const result of streamMdxToInk(generateMdxUpdates(), {
    components: {
      ...defaultInkComponents,
      Spinner,
      Status,
      ProgressBar,
    },
  })) {
    // Each iteration renders the new content
    // Wait briefly to show the update
    await new Promise((resolve) => setTimeout(resolve, 10))
  }
}

/**
 * Example 5: File rendering
 */
async function example5() {
  const fs = await import('fs/promises')
  const path = await import('path')
  const { renderMdxFileToInk } = await import('../../src/outputs/react-ink/index.js')

  // Create a sample MDX file
  const sampleMdx = `
# Sample MDX Document

This document was loaded from a file!

## Table of Contents

1. Introduction
2. Features
3. Examples

## Introduction

This demonstrates loading and rendering MDX files from disk.

## Features

- File system support
- Frontmatter parsing
- Component resolution

\`\`\`javascript
console.log("Code blocks work too!")
\`\`\`
  `

  const tmpFile = path.join('/tmp', 'sample.mdx')
  await fs.writeFile(tmpFile, sampleMdx)

  console.log('\nExample 5: File Rendering')
  console.log('=========================\n')

  const result = await renderMdxFileToInk(tmpFile, {
    components: defaultInkComponents,
  })

  await result.waitUntilExit()

  // Cleanup
  await fs.unlink(tmpFile)
}

/**
 * Main function - run all examples
 */
async function main() {
  const args = process.argv.slice(2)
  const exampleNum = args[0] ? parseInt(args[0]) : null

  if (exampleNum !== null) {
    switch (exampleNum) {
      case 1:
        await example1()
        break
      case 2:
        await example2()
        break
      case 3:
        await example3()
        break
      case 4:
        await example4()
        break
      case 5:
        await example5()
        break
      default:
        console.error(`Unknown example: ${exampleNum}`)
        process.exit(1)
    }
  } else {
    // Run all examples
    await example1()
    await new Promise((resolve) => setTimeout(resolve, 1000))
    await example2()
    await new Promise((resolve) => setTimeout(resolve, 1000))
    await example3()
    await new Promise((resolve) => setTimeout(resolve, 1000))
    await example4()
    await new Promise((resolve) => setTimeout(resolve, 1000))
    await example5()
  }

  console.log('\n\nAll examples completed!')
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error)
}
