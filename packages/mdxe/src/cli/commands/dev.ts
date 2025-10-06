import path from 'node:path'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs/promises'
import tmp from 'tmp'
import fse from 'fs-extra'
import chokidar from 'chokidar'
import open from 'open'

export interface DevOptions {
  open?: boolean
}

/**
 * Gets the path to the embedded Next.js app template.
 */
async function getAppPath(): Promise<string> {
  const __dirname = path.dirname(fileURLToPath(import.meta.url))

  // In consolidated structure, template is copied to dist/template during build
  // The current script runs from dist/cli/index.js, so template is at dist/template
  const appTemplatePath = path.resolve(__dirname, '../template')

  try {
    await fs.access(appTemplatePath)
    return appTemplatePath
  } catch (error) {
    // Fallback for development environment
    // from src/cli/commands -> ../../template
    return path.resolve(__dirname, '../../template')
  }
}

/**
 * Creates a temporary, isolated Next.js project directory.
 * @param appTemplatePath The path to the source files for the app template.
 * @param cliPackagePath The path to the mdxe cli package root.
 * @returns The path to the temporary directory.
 */
async function createTempAppDir(appTemplatePath: string, cliPackagePath: string): Promise<string> {
  const tmpDir = tmp.dirSync({ unsafeCleanup: true })
  const tmpAppPath = tmpDir.name

  // 1. Copy all template files to temp directory
  await fse.copy(appTemplatePath, tmpAppPath)

  // 2. Copy user content if it exists
  const userContentDir = path.join(process.cwd(), 'content')
  const tempContentDir = path.join(tmpAppPath, 'content')

  try {
    await fs.access(userContentDir)
    await fse.copy(userContentDir, tempContentDir)
    console.log('📁 Copied user content from content/ directory')
  } catch (error) {
    // No user content directory, check for individual MDX/MD files in root
    await fse.ensureDir(tempContentDir)

    // Look for README.md, index.md, index.mdx, or other markdown files in root
    const rootFiles = await fs.readdir(process.cwd())
    const markdownFiles = rootFiles.filter((file) => file.match(/\.(md|mdx)$/i) && !file.startsWith('.'))

    if (markdownFiles.length > 0) {
      console.log(`📁 Found ${markdownFiles.length} markdown file(s) in root, copying to content/`)

      for (const file of markdownFiles) {
        const srcPath = path.join(process.cwd(), file)
        let destPath = path.join(tempContentDir, file)

        // If it's README.md, copy it as both README.md and index.mdx for the homepage
        if (file.toLowerCase() === 'readme.md') {
          await fse.copy(srcPath, path.join(tempContentDir, 'index.mdx'))
          console.log(`  📄 Copied ${file} -> content/index.mdx (homepage)`)
        }

        await fse.copy(srcPath, destPath)
        console.log(`  📄 Copied ${file} -> content/${path.basename(destPath)}`)
      }
    } else {
      // No user content found, create sample content
      const contentFiles = await fs.readdir(tempContentDir).catch(() => [])
      if (contentFiles.length === 0) {
        const sampleContent = `---
title: "Welcome to mdxe"
description: "Your first MDX page"
---

# Welcome to mdxe

This is your first MDX page! You can edit this file in the \`content/\` directory.

## Features

- ✅ Next.js 14+ with App Router
- ✅ MDX support with custom components
- ✅ Embedded Payload CMS
- ✅ Tailwind CSS styling
- ✅ Zero configuration

## Custom Components

You can use built-in components in your MDX:

<Alert type="info">
  This is an info alert component!
</Alert>

<Callout emoji="🚀">
  This is a callout with an emoji!
</Callout>

## Getting Started

1. Edit this file in \`content/index.mdx\`
2. Create new MDX files in the \`content/\` directory
3. Visit \`/admin\` to manage content with the CMS
4. Create custom components in \`mdx-components.js\`

Happy writing! 🎉
`
        await fs.writeFile(path.join(tempContentDir, 'index.mdx'), sampleContent)
      }
    }
  }

  // 4. Copy user's mdx-components.js if it exists
  const userMdxComponentsPath = path.join(process.cwd(), 'mdx-components.js')
  const tempMdxComponentsPath = path.join(tmpAppPath, 'mdx-components.js')

  try {
    await fs.access(userMdxComponentsPath)
    await fse.copy(userMdxComponentsPath, tempMdxComponentsPath)
    console.log('📄 Copied mdx-components.js for custom components')
  } catch (error) {
    // No user mdx-components.js file, that's fine - built-in components will be used
  }

  // 5. Rename package.json.template to package.json
  const packageJsonTemplatePath = path.join(tmpAppPath, 'package.json.template')
  const packageJsonPath = path.join(tmpAppPath, 'package.json')
  await fse.rename(packageJsonTemplatePath, packageJsonPath)

  return tmpAppPath
}

/**
 * Sets up file watching for user content and mdx-components.js using polling
 * @param tmpAppPath The path to the temporary Next.js project.
 */
function setupFileWatcher(tmpAppPath: string) {
  const userCwd = process.cwd()
  const tempContentDir = path.join(tmpAppPath, 'content')
  const tempMdxComponentsPath = path.join(tmpAppPath, 'mdx-components.js')

  // Track file modification times
  const fileStats = new Map<string, number>()

  // Files to watch
  const watchFiles = [path.join(userCwd, 'README.md'), path.join(userCwd, 'index.md'), path.join(userCwd, 'index.mdx'), path.join(userCwd, 'mdx-components.js')]

  // Add any files in content directory
  const contentDir = path.join(userCwd, 'content')

  console.log('🔍 Setting up polling file watcher for:')
  watchFiles.forEach((file) => console.log(`   - ${file}`))
  console.log(`📁 User CWD: ${userCwd}`)
  console.log(`📁 Temp content dir: ${tempContentDir}`)

  // Initialize file stats
  async function initializeStats() {
    for (const file of watchFiles) {
      try {
        const stat = await fs.stat(file)
        fileStats.set(file, stat.mtimeMs)
      } catch (error) {
        // File doesn't exist, that's fine
      }
    }
  }

  // Check for file changes
  async function checkForChanges() {
    for (const file of watchFiles) {
      try {
        const stat = await fs.stat(file)
        const lastModified = fileStats.get(file) || 0

        if (stat.mtimeMs > lastModified) {
          fileStats.set(file, stat.mtimeMs)

          if (lastModified > 0) {
            // Don't trigger on initial scan
            await handleFileChange(file)
          }
        }
      } catch (error) {
        // File was deleted or doesn't exist
        if (fileStats.has(file)) {
          fileStats.delete(file)
          console.log(`\n🗑️  File deleted: ${path.relative(userCwd, file)}`)
        }
      }
    }
  }

  // Handle file changes
  async function handleFileChange(filePath: string) {
    const relativePath = path.relative(userCwd, filePath)
    console.log(`\n📝 File changed: ${relativePath}`)
    console.log(`   Full path: ${filePath}`)

    try {
      if (filePath.endsWith('mdx-components.js')) {
        // Copy mdx-components.js
        await fse.copy(filePath, tempMdxComponentsPath)
        console.log('📄 Updated mdx-components.js')
      } else if (filePath.includes('/content/')) {
        // File is in content directory
        const relativeToContent = path.relative(path.join(userCwd, 'content'), filePath)
        const destPath = path.join(tempContentDir, relativeToContent)
        await fse.copy(filePath, destPath)
        console.log(`📄 Updated content/${relativeToContent}`)
      } else {
        // Root markdown file
        const fileName = path.basename(filePath)
        const destPath = path.join(tempContentDir, fileName)
        await fse.copy(filePath, destPath)

        // If it's README.md, also copy as index.mdx
        if (fileName.toLowerCase() === 'readme.md') {
          await fse.copy(filePath, path.join(tempContentDir, 'index.mdx'))
          console.log(`📄 Updated ${fileName} and index.mdx`)
        } else {
          console.log(`📄 Updated content/${fileName}`)
        }
      }

      // Touch a file to trigger Next.js hot reload
      const touchFile = path.join(tmpAppPath, '.next-reload-trigger')
      await fs.writeFile(touchFile, Date.now().toString())
      console.log('🔄 Triggered Next.js reload')
    } catch (error) {
      console.error(`❌ Error updating ${relativePath}:`, error)
    }
  }

  // Start polling
  initializeStats().then(() => {
    console.log('👀 File watcher is ready and monitoring for changes...')

    // Poll every 500ms
    const interval = setInterval(checkForChanges, 500)

    return {
      close: () => {
        clearInterval(interval)
      },
    }
  })

  return {
    close: () => {
      // Will be replaced by the actual close function once initialized
    },
  }
}

/**
 * Installs dependencies and starts the Next.js development server in the temp directory.
 * @param tmpAppPath The path to the temporary Next.js project.
 * @param options Development server options.
 */
async function startNextDevServer(tmpAppPath: string, options: DevOptions = {}) {
  // 1. Install dependencies in the temporary directory
  console.log('📦 Installing dependencies in temporary environment...')
  await new Promise<void>((resolve, reject) => {
    const installProcess = spawn('pnpm', ['install'], {
      cwd: tmpAppPath,
      stdio: 'inherit',
    })
    installProcess.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`pnpm install failed with code ${code}`))
      } else {
        resolve()
      }
    })
    installProcess.on('error', reject)
  })

  // 2. Set up file watching BEFORE starting Next.js
  console.log('👀 Setting up file watching...')
  const watcher = setupFileWatcher(tmpAppPath)

  // Wait a moment for the watcher to be ready
  await new Promise((resolve) => setTimeout(resolve, 500))

  // 3. Start the Next.js development server
  console.log('🚀 Starting Next.js development server...')
  console.log('📝 File changes will be logged above the Next.js output...\n')

  return new Promise<void>((resolve, reject) => {
    const devProcess = spawn('pnpm', ['exec', 'next', 'dev'], {
      cwd: tmpAppPath,
      stdio: ['inherit', 'pipe', 'pipe'], // Don't inherit stdout/stderr so we can see our logs
    })

    let browserOpened = false

    // Forward Next.js output but allow our logs to show
    devProcess.stdout?.on('data', (data) => {
      const output = data.toString()
      process.stdout.write(data)

      // Open browser when Next.js is ready
      if (!browserOpened && options.open && (output.includes('Ready in') || output.includes('Local:') || output.includes('http://localhost:3000'))) {
        browserOpened = true
        setTimeout(async () => {
          try {
            await open('http://localhost:3000')
            console.log('\n🌐 Opened browser at http://localhost:3000\n')
          } catch (error) {
            console.error('\n❌ Failed to open browser:', error)
          }
        }, 500) // Small delay to ensure server is fully ready
      }
    })

    devProcess.stderr?.on('data', (data) => {
      process.stderr.write(data)
    })

    devProcess.on('error', (error) => {
      console.error('Failed to start Next.js development server:', error)
      watcher.close()
      reject(error)
    })

    devProcess.on('close', (code) => {
      // 130 is the exit code when the user presses Ctrl+C
      if (code !== 0 && code !== 130) {
        console.error(`Next.js development server exited with code ${code}`)
      }
      watcher.close()
      resolve()
    })
  })
}

/**
 * Start a development server for the MDXE project.
 */
export async function runDevCommand(cwd: string = process.cwd(), options: DevOptions = {}) {
  try {
    const appTemplatePath = await getAppPath()
    const __dirname = path.dirname(fileURLToPath(import.meta.url))
    // The CLI package root is two levels up from the /dist/commands directory
    const cliPackagePath = path.resolve(__dirname, '../../')

    const tmpAppPath = await createTempAppDir(appTemplatePath, cliPackagePath)

    await startNextDevServer(tmpAppPath, options)
  } catch (error) {
    console.error('Error starting development server:', error)
    process.exit(1)
  }
}
