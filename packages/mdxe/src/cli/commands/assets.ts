import path from 'node:path'
import fs from 'node:fs/promises'
import { spawn } from 'node:child_process'
import fse from 'fs-extra'
import crypto from 'node:crypto'

/**
 * Asset upload options
 */
export interface AssetOptions {
  name?: string
  env?: string
  bucket?: string
  public?: boolean
}

/**
 * Asset metadata
 */
interface AssetMetadata {
  path: string
  file: string
  hash: string
  size: number
  contentType: string
  lastModified: string
}

/**
 * Upload MDX files to Worker Assets
 */
export async function runAssetsCommand(options: AssetOptions = {}) {
  const { name, env = 'production', bucket, public: isPublic = true } = options
  const cwd = process.cwd()

  console.log('📦 Uploading to Cloudflare Worker Assets...')

  try {
    const assetName = name || `${path.basename(cwd)}-assets`

    // 1. Find and analyze all assets
    const contentDir = path.join(cwd, 'content')
    const assets = await collectAssets(contentDir)

    if (assets.length === 0) {
      console.log('⚠️  No assets found in content/ directory')
      return
    }

    console.log(`📄 Found ${assets.length} assets to upload`)

    // 2. Generate asset manifest
    const manifest = generateAssetManifest(assets)

    // 3. Create Worker Assets configuration
    const workerCode = generateAssetsWorkerCode(assetName, manifest)
    const workerPath = path.join(cwd, '.mdxe', 'assets-worker.js')
    await fse.ensureDir(path.dirname(workerPath))
    await fs.writeFile(workerPath, workerCode)

    console.log(`📦 Worker code generated: ${workerPath}`)

    // 4. Generate wrangler.toml for Worker Assets
    const wranglerConfig = generateAssetsWranglerConfig(assetName, env, isPublic)
    const wranglerPath = path.join(cwd, 'wrangler.toml')
    await fs.writeFile(wranglerPath, wranglerConfig)

    console.log(`📄 Wrangler config generated: ${wranglerPath}`)

    // 5. Copy assets to deployment directory
    const deployDir = path.join(cwd, '.mdxe', 'assets')
    await fse.ensureDir(deployDir)
    await copyAssetsToDeployDir(assets, contentDir, deployDir)

    console.log(`📁 Assets copied to: ${deployDir}`)

    // 6. Deploy using Wrangler
    console.log(`🚀 Deploying to Cloudflare Worker Assets (${env})...`)
    await deployAssetsWithWrangler(cwd, env)

    // 7. Save deployment metadata
    const metadata = {
      name: assetName,
      env,
      assets: assets.length,
      totalSize: assets.reduce((sum, a) => sum + a.size, 0),
      deployedAt: new Date().toISOString(),
      manifest,
    }

    const metadataPath = path.join(cwd, '.mdxe', 'assets-metadata.json')
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2))

    console.log(`✅ Successfully deployed ${assets.length} assets`)
    console.log(`📊 Total size: ${formatBytes(metadata.totalSize)}`)
    console.log(`🔗 URL: https://${assetName}.workers.dev`)
  } catch (error) {
    console.error('❌ Failed to upload assets:', error)
    process.exit(1)
  }
}

/**
 * Collect all assets from content directory
 */
async function collectAssets(contentDir: string): Promise<AssetMetadata[]> {
  const assets: AssetMetadata[] = []

  const files = await findAllFiles(contentDir)

  for (const file of files) {
    const stats = await fs.stat(file)
    const content = await fs.readFile(file)
    const hash = crypto.createHash('sha256').update(content).digest('hex').slice(0, 16)
    const relativePath = path.relative(contentDir, file)

    assets.push({
      path: '/' + relativePath.replace(/\\/g, '/'),
      file: relativePath,
      hash,
      size: stats.size,
      contentType: getContentType(file),
      lastModified: stats.mtime.toISOString(),
    })
  }

  return assets
}

/**
 * Find all files recursively
 */
async function findAllFiles(dir: string): Promise<string[]> {
  const files: string[] = []

  try {
    const entries = await fs.readdir(dir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)

      if (entry.isDirectory()) {
        const subFiles = await findAllFiles(fullPath)
        files.push(...subFiles)
      } else {
        files.push(fullPath)
      }
    }
  } catch (error) {
    // Directory doesn't exist
  }

  return files
}

/**
 * Get content type based on file extension
 */
function getContentType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase()

  const contentTypes: Record<string, string> = {
    '.md': 'text/markdown',
    '.mdx': 'text/mdx',
    '.txt': 'text/plain',
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
    '.pdf': 'application/pdf',
    '.xml': 'application/xml',
  }

  return contentTypes[ext] || 'application/octet-stream'
}

/**
 * Generate asset manifest
 */
function generateAssetManifest(assets: AssetMetadata[]): Record<string, AssetMetadata> {
  const manifest: Record<string, AssetMetadata> = {}

  for (const asset of assets) {
    manifest[asset.path] = asset
  }

  return manifest
}

/**
 * Generate Worker code for serving assets
 */
function generateAssetsWorkerCode(name: string, manifest: Record<string, AssetMetadata>): string {
  return `
// Cloudflare Worker Assets: ${name}
// Generated by mdxe
// Assets: ${Object.keys(manifest).length}

import { getAssetFromKV } from '@cloudflare/kv-asset-handler'

// Asset manifest
const MANIFEST = ${JSON.stringify(manifest, null, 2)}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    const pathname = url.pathname

    try {
      // Lookup asset in manifest
      const asset = MANIFEST[pathname]

      if (!asset) {
        return new Response('Asset not found', { status: 404 })
      }

      // Serve from Worker Assets
      const response = await env.ASSETS.fetch(request)

      // Add custom headers
      const headers = new Headers(response.headers)
      headers.set('x-asset-hash', asset.hash)
      headers.set('x-asset-worker', '${name}')
      headers.set('cache-control', 'public, max-age=3600')
      headers.set('content-type', asset.contentType)

      return new Response(response.body, {
        status: response.status,
        headers
      })
    } catch (error) {
      console.error('Error serving asset:', error)
      return new Response('Internal server error', { status: 500 })
    }
  },

  // List all assets endpoint
  async listAssets() {
    return new Response(JSON.stringify({
      name: '${name}',
      assets: Object.keys(MANIFEST),
      count: Object.keys(MANIFEST).length
    }), {
      headers: { 'content-type': 'application/json' }
    })
  }
}
`.trim()
}

/**
 * Generate wrangler.toml for Worker Assets
 */
function generateAssetsWranglerConfig(name: string, env: string, isPublic: boolean): string {
  return `name = "${name}"
main = ".mdxe/assets-worker.js"
compatibility_date = "2024-01-01"

[env.${env}]
workers_dev = true

# Worker Assets configuration
[assets]
directory = "./.mdxe/assets"
binding = "ASSETS"

# Asset serving configuration
[[assets.bindings]]
name = "ASSETS"

# Routing configuration
[[routes]]
pattern = "/*"
zone_name = ""

# R2 bucket (optional - for larger assets)
# [[r2_buckets]]
# binding = "BUCKET"
# bucket_name = "${name}-bucket"
# preview_bucket_name = "${name}-preview"

# KV namespace (optional - for asset metadata)
# [[kv_namespaces]]
# binding = "METADATA"
# id = "your-kv-namespace-id"
`
}

/**
 * Copy assets to deployment directory
 */
async function copyAssetsToDeployDir(assets: AssetMetadata[], sourceDir: string, deployDir: string): Promise<void> {
  await fse.emptyDir(deployDir)

  for (const asset of assets) {
    const sourcePath = path.join(sourceDir, asset.file)
    const destPath = path.join(deployDir, asset.file)

    await fse.ensureDir(path.dirname(destPath))
    await fse.copy(sourcePath, destPath)
  }

  console.log(`📁 Copied ${assets.length} assets to deployment directory`)
}

/**
 * Deploy using Wrangler CLI
 */
async function deployAssetsWithWrangler(cwd: string, env: string): Promise<void> {
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

/**
 * Format bytes to human-readable string
 */
function formatBytes(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`
}
