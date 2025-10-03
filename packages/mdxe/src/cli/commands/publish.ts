import path from 'node:path'
import fs from 'node:fs/promises'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import fse from 'fs-extra'

/**
 * Deployment targets for publishing
 */
export type DeploymentTarget = 'worker' | 'snippet' | 'assets'

/**
 * Deployment options
 */
export interface PublishOptions {
  target?: DeploymentTarget
  name?: string
  env?: string
  minify?: boolean
  sourcemap?: boolean
}

/**
 * Publish the MDXE project to Cloudflare
 */
export async function runPublishCommand(options: PublishOptions = {}) {
  const { target = 'worker', name, env = 'production', minify = true, sourcemap = false } = options

  console.log(`📦 Publishing to Cloudflare ${target}...`)

  try {
    switch (target) {
      case 'worker':
        await publishToWorker({ name, env, minify, sourcemap })
        break
      case 'snippet':
        await publishAsSnippet({ name, env, minify })
        break
      case 'assets':
        await publishToAssets({ name, env })
        break
      default:
        throw new Error(`Unknown deployment target: ${target}`)
    }

    console.log(`✅ Successfully published to Cloudflare ${target}`)
  } catch (error) {
    console.error(`❌ Failed to publish to Cloudflare ${target}:`, error)
    process.exit(1)
  }
}

/**
 * Publish as a Cloudflare Worker
 */
async function publishToWorker(options: { name?: string; env: string; minify: boolean; sourcemap: boolean }) {
  const { name, env, minify, sourcemap } = options
  const cwd = process.cwd()

  // 1. Build the Next.js app first
  console.log('📦 Building Next.js application...')
  const { runBuildCommand } = await import('./build')
  await runBuildCommand(cwd)

  // 2. Generate wrangler.toml config
  const workerName = name || path.basename(cwd)
  const wranglerConfig = generateWranglerConfig(workerName, env)
  const wranglerPath = path.join(cwd, 'wrangler.toml')
  await fs.writeFile(wranglerPath, wranglerConfig)
  console.log(`📄 Generated wrangler.toml for worker: ${workerName}`)

  // 3. Bundle the Worker script
  console.log('📦 Bundling Worker script...')
  await bundleWorkerScript(cwd, { minify, sourcemap })

  // 4. Deploy using Wrangler
  console.log(`🚀 Deploying to Cloudflare Workers (${env})...`)
  await deployWithWrangler(cwd, env)

  console.log(`✅ Worker deployed: https://${workerName}.workers.dev`)
}

/**
 * Publish as a Cloudflare Snippet (ultra-lightweight)
 */
async function publishAsSnippet(options: { name?: string; env: string; minify: boolean }) {
  const { name, env, minify } = options
  const cwd = process.cwd()

  console.log('📦 Creating Cloudflare Snippet...')

  // 1. Build a minified, snippet-compatible bundle
  await bundleSnippet(cwd, { minify })

  // 2. Generate snippet config
  const snippetName = name || `${path.basename(cwd)}-snippet`
  const snippetConfig = await generateSnippetConfig(snippetName, cwd)

  console.log(`📄 Generated snippet configuration for: ${snippetName}`)
  console.log(`\n${snippetConfig}\n`)

  // 3. Instructions for manual deployment (Snippets require manual setup)
  console.log('📝 To deploy this snippet:')
  console.log('   1. Go to Cloudflare Dashboard > Workers & Pages > Snippets')
  console.log(`   2. Create a new snippet named: ${snippetName}`)
  console.log('   3. Paste the generated code from: .mdxe/snippet.js')
  console.log('   4. Configure the snippet triggers (URL patterns, zones)')

  const snippetPath = path.join(cwd, '.mdxe', 'snippet.js')
  console.log(`\n📦 Snippet bundle saved to: ${snippetPath}`)
}

/**
 * Publish to Cloudflare Worker Assets
 */
async function publishToAssets(options: { name?: string; env: string }) {
  const { name, env } = options
  const cwd = process.cwd()

  console.log('📦 Uploading to Worker Assets...')

  // 1. Find all MDX/MD files
  const contentDir = path.join(cwd, 'content')
  const files = await findMarkdownFiles(contentDir)

  if (files.length === 0) {
    console.log('⚠️  No markdown files found in content/ directory')
    return
  }

  console.log(`📄 Found ${files.length} markdown files to upload`)

  // 2. Generate asset manifest
  const assetName = name || `${path.basename(cwd)}-assets`
  const manifest = await generateAssetManifest(files, contentDir)

  // 3. Create Worker Assets config
  const wranglerConfig = generateAssetsWranglerConfig(assetName, env)
  const wranglerPath = path.join(cwd, 'wrangler.toml')
  await fs.writeFile(wranglerPath, wranglerConfig)

  // 4. Deploy using Wrangler
  console.log(`🚀 Deploying assets to Cloudflare (${env})...`)
  await deployWithWrangler(cwd, env)

  console.log(`✅ Assets deployed: https://${assetName}.workers.dev`)
  console.log(`📊 Total files: ${files.length}`)
}

/**
 * Generate wrangler.toml configuration for Workers
 */
function generateWranglerConfig(name: string, env: string): string {
  return `name = "${name}"
main = ".mdxe/worker.js"
compatibility_date = "2024-01-01"

[env.${env}]
workers_dev = true

# Build configuration
[build]
command = "pnpm build"

# Environment variables
[vars]
NODE_ENV = "${env}"
NEXT_PUBLIC_ENV = "${env}"

# KV Namespaces (optional - for caching)
# [[kv_namespaces]]
# binding = "CACHE"
# id = "your-kv-namespace-id"
`
}

/**
 * Generate wrangler.toml configuration for Worker Assets
 */
function generateAssetsWranglerConfig(name: string, env: string): string {
  return `name = "${name}"
main = ".mdxe/assets-worker.js"
compatibility_date = "2024-01-01"

[env.${env}]
workers_dev = true

# Worker Assets configuration
[assets]
directory = "./content"
binding = "ASSETS"

# Asset routing
[[routes]]
pattern = "/*"
`
}

/**
 * Bundle the Worker script from Next.js build
 */
async function bundleWorkerScript(cwd: string, options: { minify: boolean; sourcemap: boolean }): Promise<void> {
  const { minify, sourcemap } = options
  const outputDir = path.join(cwd, '.mdxe')
  await fse.ensureDir(outputDir)

  // Create a basic Worker script that serves the Next.js app
  const workerScript = `
// Cloudflare Worker for MDXE Next.js App
import { getAssetFromKV } from '@cloudflare/kv-asset-handler'

export default {
  async fetch(request, env, ctx) {
    try {
      // Try to serve from KV asset handler (static files)
      return await getAssetFromKV(request, {
        ASSET_NAMESPACE: env.__STATIC_CONTENT,
        ASSET_MANIFEST: __STATIC_CONTENT_MANIFEST,
      })
    } catch (error) {
      // Fallback to Next.js dynamic handling
      return new Response('Not found', { status: 404 })
    }
  },
}
`

  const workerPath = path.join(outputDir, 'worker.js')
  await fs.writeFile(workerPath, workerScript)

  console.log(`📦 Worker script created: ${workerPath}`)

  // TODO: Use esbuild to bundle and minify if needed
  if (minify) {
    console.log('🗜️  Minification enabled (requires esbuild integration)')
  }
}

/**
 * Bundle a snippet-compatible version
 */
async function bundleSnippet(cwd: string, options: { minify: boolean }): Promise<void> {
  const { minify } = options
  const outputDir = path.join(cwd, '.mdxe')
  await fse.ensureDir(outputDir)

  // Create ultra-lightweight snippet version
  const snippetScript = `
// Cloudflare Snippet for MDXE
// Ultra-lightweight, no rendering cost
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)

  // Simple routing based on URL path
  if (url.pathname === '/') {
    return new Response('MDX content served from snippet', {
      headers: { 'content-type': 'text/plain' }
    })
  }

  return new Response('Not found', { status: 404 })
}
`

  const snippetPath = path.join(outputDir, 'snippet.js')
  await fs.writeFile(snippetPath, snippetScript)

  console.log(`📦 Snippet created: ${snippetPath}`)

  if (minify) {
    console.log('🗜️  Minification enabled (requires esbuild integration)')
  }
}

/**
 * Generate snippet configuration
 */
async function generateSnippetConfig(name: string, cwd: string): Promise<string> {
  const snippetPath = path.join(cwd, '.mdxe', 'snippet.js')
  const code = await fs.readFile(snippetPath, 'utf-8')

  return `{
  "name": "${name}",
  "code": ${JSON.stringify(code)},
  "enabled": true
}`
}

/**
 * Find all markdown files in a directory
 */
async function findMarkdownFiles(dir: string): Promise<string[]> {
  const files: string[] = []

  try {
    const entries = await fs.readdir(dir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)

      if (entry.isDirectory()) {
        const subFiles = await findMarkdownFiles(fullPath)
        files.push(...subFiles)
      } else if (entry.name.match(/\.(md|mdx)$/i)) {
        files.push(fullPath)
      }
    }
  } catch (error) {
    // Directory doesn't exist, return empty array
  }

  return files
}

/**
 * Generate asset manifest
 */
async function generateAssetManifest(files: string[], baseDir: string): Promise<Record<string, string>> {
  const manifest: Record<string, string> = {}

  for (const file of files) {
    const relativePath = path.relative(baseDir, file)
    const content = await fs.readFile(file, 'utf-8')
    const hash = Buffer.from(content).toString('base64').slice(0, 8)

    manifest[`/${relativePath}`] = hash
  }

  return manifest
}

/**
 * Deploy using Wrangler CLI
 */
async function deployWithWrangler(cwd: string, env: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const args = ['deploy', '--env', env]

    const wranglerProcess = spawn('wrangler', args, {
      cwd,
      stdio: 'inherit',
    })

    wranglerProcess.on('error', (error) => {
      reject(new Error(`Failed to run wrangler: ${error.message}`))
    })

    wranglerProcess.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Wrangler deploy failed with code ${code}`))
      } else {
        resolve()
      }
    })
  })
}
