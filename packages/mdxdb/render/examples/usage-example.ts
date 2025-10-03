/**
 * Complete usage example for @mdxdb/render
 *
 * This file demonstrates all major features and usage patterns
 */

import {
  // Core rendering functions
  renderMdx,
  renderWithPreset,
  renderWithYAML,
  renderPipeline,

  // Config functions
  parseTweakcnConfig,
  mergeTweakcnConfigs,
  loadPresetConfig,
  getComponentStyles,

  // Template functions
  renderBasicTemplate,
  renderDocsTemplate,
  renderBlogTemplate,

  // Tailwind functions
  generateTailwindConfig,
  exportTailwindConfigFile,

  // Utility functions
  extractMdxMetadata,
  renderMdxToText,

  // Types
  type TweakcnConfig,
  type MdxRenderOptions,
  type MdxRenderResult,
} from '@mdxdb/render'

// ============================================================
// 1. BASIC RENDERING
// ============================================================

async function basicRendering() {
  const content = `
# Hello World

This is a **markdown** document with [links](https://example.com).

\`\`\`javascript
const greeting = "Hello!"
\`\`\`
  `

  // Simple render without styling
  const result = await renderMdx(content)
  console.log(result.html)

  return result
}

// ============================================================
// 2. USING PRESETS
// ============================================================

async function renderWithPresets() {
  const content = '# Documentation\n\nThis is technical content.'

  // Render with docs preset
  const result = await renderWithPreset(content, 'docs', {
    prose: true,
    includeCSS: true
  })

  console.log(result.html)
  console.log(result.css)

  return result
}

// ============================================================
// 3. YAML CONFIGURATION
// ============================================================

async function renderWithYAMLConfig() {
  const yamlConfig = `
theme:
  colors:
    primary: "#ff6b6b"
    secondary: "#4ecdc4"
    background: "#f7f7f7"
    foreground: "#2c3e50"

  fonts:
    body: "Open Sans"
    heading: "Montserrat"

  components:
    heading:
      className: "font-bold tracking-wide uppercase"

    link:
      className: "text-primary hover:opacity-80 transition-opacity"
  `

  const content = '# Custom Styled\n\nCheck out [this link](#)'

  const result = await renderWithYAML(content, yamlConfig)

  return result
}

// ============================================================
// 4. FULL PIPELINE (COMPLETE HTML PAGE)
// ============================================================

async function fullPipelineExample() {
  const content = `
---
title: Getting Started
author: John Doe
date: 2024-10-03
---

# Getting Started

Welcome to our documentation!

## Installation

Install using npm:

\`\`\`bash
npm install @mdxdb/render
\`\`\`

## Quick Start

Here's a quick example...
  `

  // Generate complete HTML page with docs template
  const html = await renderPipeline({
    content,
    preset: 'docs',
    template: 'docs',
    templateOptions: {
      siteName: 'My Project',
      navigation: [
        {
          title: 'Getting Started',
          href: '/start',
          children: [
            { title: 'Installation', href: '/start/install' },
            { title: 'Quick Start', href: '/start/quick' }
          ]
        },
        { title: 'API Reference', href: '/api' }
      ],
      tableOfContents: [
        { level: 1, text: 'Getting Started', id: 'getting-started' },
        { level: 2, text: 'Installation', id: 'installation' },
        { level: 2, text: 'Quick Start', id: 'quick-start' }
      ],
      editUrl: 'https://github.com/username/repo/edit/main/docs/start.md'
    }
  })

  // Write to file
  // writeFileSync('./output.html', html)

  return html
}

// ============================================================
// 5. BLOG TEMPLATE
// ============================================================

async function blogExample() {
  const content = `
---
title: Building Modern Web Apps
description: A deep dive into modern web development
author: Jane Smith
date: 2024-10-03
tags: javascript, web, react
coverImage: /images/cover.jpg
---

# Building Modern Web Apps

The web development landscape has evolved dramatically...
  `

  const html = await renderPipeline({
    content,
    preset: 'blog',
    template: 'blog',
    templateOptions: {
      author: {
        name: 'Jane Smith',
        avatar: '/avatars/jane.jpg',
        bio: 'Senior Developer and Technical Writer',
        url: 'https://janesmith.com'
      },
      readingTime: 8,
      relatedPosts: [
        {
          title: 'Introduction to React',
          href: '/blog/intro-react',
          excerpt: 'Learn the basics of React...'
        },
        {
          title: 'Modern JavaScript Features',
          href: '/blog/modern-js',
          excerpt: 'Explore ES2024 features...'
        }
      ]
    }
  })

  return html
}

// ============================================================
// 6. MERGING CONFIGS
// ============================================================

async function configMerging() {
  // Start with a preset
  const baseConfig = loadPresetConfig('modern')

  // Define custom overrides
  const customConfig: TweakcnConfig = {
    theme: {
      colors: {
        primary: '#ff0000', // Override primary color
        custom: '#00ff00'   // Add new color
      },
      components: {
        heading: {
          className: 'font-black uppercase tracking-widest'
        }
      }
    }
  }

  // Merge configs
  const finalConfig = mergeTweakcnConfigs(baseConfig, customConfig)

  // Use merged config
  const content = '# Custom Heading'
  const result = await renderMdx(content, { config: finalConfig })

  return result
}

// ============================================================
// 7. EXTRACTING METADATA
// ============================================================

async function metadataExtraction() {
  const content = `
---
title: My Article
author: John Doe
tags: tech, programming
---

# Introduction

This is the introduction paragraph with about 50 words of content
to demonstrate the word count and reading time calculation features
that are built into the metadata extraction system.

## Section 1

More content here...

### Subsection

Even more content...
  `

  const metadata = await extractMdxMetadata(content)

  console.log('Frontmatter:', metadata.frontmatter)
  console.log('Headings:', metadata.headings)
  console.log('Word count:', metadata.wordCount)
  console.log('Reading time:', metadata.readingTime, 'minutes')

  return metadata
}

// ============================================================
// 8. PLAIN TEXT EXTRACTION
// ============================================================

async function plainTextExtraction() {
  const content = `
# Hello World

This is **bold** and *italic* text with [links](https://example.com).

\`\`\`javascript
const code = "ignored"
\`\`\`
  `

  const text = await renderMdxToText(content)
  console.log('Plain text:', text)
  // Output: "Hello World This is bold and italic text with links."

  return text
}

// ============================================================
// 9. COMPONENT STYLES
// ============================================================

function componentStyling() {
  const config = loadPresetConfig('modern')

  // Get heading styles
  const h1Styles = getComponentStyles(config, 'heading', 'h1')
  console.log('H1 styles:', h1Styles)

  // Get button styles with variant
  const primaryButton = getComponentStyles(config, 'button', 'default')
  const outlineButton = getComponentStyles(config, 'button', 'outline')

  console.log('Primary button:', primaryButton)
  console.log('Outline button:', outlineButton)

  return { h1Styles, primaryButton, outlineButton }
}

// ============================================================
// 10. TAILWIND INTEGRATION
// ============================================================

function tailwindIntegration() {
  const config = loadPresetConfig('modern')

  // Generate Tailwind config object
  const tailwindConfig = generateTailwindConfig(config)
  console.log('Tailwind config:', tailwindConfig)

  // Export to file content
  const configFileContent = exportTailwindConfigFile(config)
  console.log('Config file:', configFileContent)

  // Write to tailwind.config.js
  // writeFileSync('./tailwind.config.js', configFileContent)

  return { tailwindConfig, configFileContent }
}

// ============================================================
// 11. CUSTOM PRESET
// ============================================================

async function customPreset() {
  // Define a completely custom config
  const customConfig: TweakcnConfig = {
    theme: {
      colors: {
        primary: '#8b5cf6',
        secondary: '#ec4899',
        background: '#0f0f0f',
        foreground: '#ffffff',
        muted: '#1f1f1f',
        border: '#2f2f2f'
      },
      fonts: {
        body: 'JetBrains Mono',
        heading: 'Space Grotesk',
        mono: 'Fira Code'
      },
      spacing: {
        xs: '0.25rem',
        sm: '0.75rem',
        md: '1.25rem',
        lg: '2rem'
      },
      components: {
        heading: {
          className: 'font-extrabold uppercase tracking-wider text-primary',
          variants: {
            h1: 'text-6xl mb-8',
            h2: 'text-5xl mb-6',
            h3: 'text-4xl mb-4'
          }
        },
        link: {
          className: 'text-secondary underline-offset-4 hover:underline'
        },
        code: {
          className: 'px-2 py-1 rounded bg-muted text-primary font-bold'
        }
      },
      customCSS: `
        /* Cyberpunk glow effect */
        .glow {
          text-shadow: 0 0 10px #8b5cf6,
                       0 0 20px #8b5cf6,
                       0 0 30px #8b5cf6;
        }
      `
    }
  }

  const content = '# Cyberpunk Styled\n\nThis uses custom configuration.'

  const result = await renderMdx(content, { config: customConfig })

  return result
}

// ============================================================
// 12. USING ALL PRESETS
// ============================================================

async function comparePresets() {
  const content = `
# Heading

This is a paragraph with **bold** text.

- List item 1
- List item 2

[Link text](https://example.com)
  `

  const presets = ['minimal', 'modern', 'docs', 'blog'] as const
  const results: Record<string, MdxRenderResult> = {}

  for (const preset of presets) {
    results[preset] = await renderWithPreset(content, preset)
  }

  return results
}

// ============================================================
// MAIN EXAMPLE RUNNER
// ============================================================

async function main() {
  console.log('=== @mdxdb/render Examples ===\n')

  // Run all examples
  console.log('1. Basic Rendering')
  await basicRendering()

  console.log('\n2. Using Presets')
  await renderWithPresets()

  console.log('\n3. YAML Configuration')
  await renderWithYAMLConfig()

  console.log('\n4. Full Pipeline')
  await fullPipelineExample()

  console.log('\n5. Blog Template')
  await blogExample()

  console.log('\n6. Config Merging')
  await configMerging()

  console.log('\n7. Metadata Extraction')
  await metadataExtraction()

  console.log('\n8. Plain Text Extraction')
  await plainTextExtraction()

  console.log('\n9. Component Styling')
  componentStyling()

  console.log('\n10. Tailwind Integration')
  tailwindIntegration()

  console.log('\n11. Custom Preset')
  await customPreset()

  console.log('\n12. Compare Presets')
  await comparePresets()

  console.log('\n=== All Examples Complete ===')
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error)
}

// Export all examples for individual use
export {
  basicRendering,
  renderWithPresets,
  renderWithYAMLConfig,
  fullPipelineExample,
  blogExample,
  configMerging,
  metadataExtraction,
  plainTextExtraction,
  componentStyling,
  tailwindIntegration,
  customPreset,
  comparePresets
}
