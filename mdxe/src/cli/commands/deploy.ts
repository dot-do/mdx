import path from 'node:path'
import fs from 'node:fs/promises'
import { spawn } from 'node:child_process'

/**
 * Unified deployment command for mdxe
 *
 * Supports three deployment modes:
 * 1. Worker: Full Cloudflare Worker (via wrangler)
 * 2. Namespace: Deploy to Workers for Platforms namespace (via Deploy API)
 * 3. Snippet: Ultra-lightweight snippet (<32KB)
 */

export type DeploymentMode = 'worker' | 'namespace' | 'snippet'
export type Tier = 'internal' | 'public' | 'tenant'
export type Environment = 'production' | 'staging' | 'development'

export interface DeployOptions {
  mode?: DeploymentMode
  name?: string
  tier?: Tier
  environment?: Environment
  version?: string
  minify?: boolean
  sourcemap?: boolean
  deployApiKey?: string
}

export interface DeploymentResult {
  success: boolean
  mode: DeploymentMode
  url?: string
  error?: string
  metadata?: Record<string, any>
}

/**
 * Main deploy command
 */
export async function runDeployCommand(options: DeployOptions = {}): Promise<DeploymentResult> {
  const cwd = process.cwd()

  console.log('🚀 mdxe Deploy\n')

  // Auto-detect deployment mode from project structure
  const mode = options.mode || await detectDeploymentMode(cwd)

  console.log(`📦 Deployment mode: ${mode}`)
  console.log(`📁 Working directory: ${cwd}\n`)

  try {
    switch (mode) {
      case 'worker':
        return await deployAsWorker(cwd, options)
      case 'namespace':
        return await deployToNamespace(cwd, options)
      case 'snippet':
        return await deployAsSnippet(cwd, options)
      default:
        throw new Error(`Unknown deployment mode: ${mode}`)
    }
  } catch (error: any) {
    console.error(`\n❌ Deployment failed: ${error.message}`)
    return {
      success: false,
      mode,
      error: error.message,
    }
  }
}

/**
 * Auto-detect deployment mode from project metadata
 */
async function detectDeploymentMode(cwd: string): Promise<DeploymentMode> {
  // Check for .mdx-metadata.json
  const metadataPath = path.join(cwd, '.mdx-metadata.json')

  try {
    const metadataContent = await fs.readFile(metadataPath, 'utf-8')
    const metadata = JSON.parse(metadataContent)

    if (metadata.type === 'Snippet') {
      return 'snippet'
    }

    // Check if tier or namespace deployment is specified
    if (metadata.tier || metadata.namespace) {
      return 'namespace'
    }
  } catch {
    // Metadata file doesn't exist, continue with other detection
  }

  // Check for wrangler.jsonc with dispatch_namespaces
  const wranglerPath = path.join(cwd, 'wrangler.jsonc')
  try {
    const wranglerContent = await fs.readFile(wranglerPath, 'utf-8')
    if (wranglerContent.includes('dispatch_namespaces')) {
      return 'namespace'
    }
  } catch {
    // Wrangler config doesn't exist
  }

  // Default to worker deployment
  return 'worker'
}

/**
 * Deploy as a full Cloudflare Worker via wrangler
 */
async function deployAsWorker(cwd: string, options: DeployOptions): Promise<DeploymentResult> {
  console.log('🔨 Building worker...\n')

  // 1. Check for wrangler.jsonc
  const wranglerPath = path.join(cwd, 'wrangler.jsonc')
  try {
    await fs.access(wranglerPath)
  } catch {
    throw new Error('No wrangler.jsonc found. Run build first or use --mode to specify deployment mode.')
  }

  // 2. Deploy using wrangler
  const env = options.environment || 'production'
  const args = ['deploy', '--env', env]

  if (options.minify) {
    args.push('--minify')
  }

  console.log(`📦 Deploying worker to Cloudflare (${env})...\n`)

  await runCommand('wrangler', args, cwd)

  // 3. Get worker name from wrangler.jsonc
  const wranglerContent = await fs.readFile(wranglerPath, 'utf-8')
  const nameMatch = wranglerContent.match(/"name":\s*"([^"]+)"/)
  const workerName = nameMatch ? nameMatch[1] : options.name || path.basename(cwd)

  const url = env === 'production'
    ? `https://${workerName}.workers.dev`
    : `https://${workerName}.${env}.workers.dev`

  console.log(`\n✅ Worker deployed successfully!`)
  console.log(`🔗 URL: ${url}\n`)

  return {
    success: true,
    mode: 'worker',
    url,
    metadata: {
      name: workerName,
      environment: env,
    },
  }
}

/**
 * Deploy to Workers for Platforms namespace via Deploy API
 */
async function deployToNamespace(cwd: string, options: DeployOptions): Promise<DeploymentResult> {
  console.log('🔨 Building worker for namespace deployment...\n')

  // 1. Check for Deploy API key
  const deployApiKey = options.deployApiKey || process.env.DEPLOY_API_KEY

  if (!deployApiKey) {
    throw new Error('DEPLOY_API_KEY environment variable or --deployApiKey option required for namespace deployment')
  }

  // 2. Build the worker
  const distPath = path.join(cwd, 'dist', 'index.js')
  try {
    await fs.access(distPath)
  } catch {
    // Build if dist doesn't exist
    console.log('📦 Building worker...')
    await runCommand('pnpm', ['build'], cwd)
  }

  // 3. Read and encode the bundle
  const bundleContent = await fs.readFile(distPath, 'utf-8')
  const scriptB64 = Buffer.from(bundleContent).toString('base64')

  console.log(`📦 Bundle size: ${(bundleContent.length / 1024).toFixed(2)}KB`)

  // 4. Get git metadata
  const commit = await runCommand('git', ['rev-parse', 'HEAD'], cwd, true)
  const branch = await runCommand('git', ['rev-parse', '--abbrev-ref', 'HEAD'], cwd, true)
  const author = await runCommand('git', ['config', 'user.email'], cwd, true)

  // 5. Determine service name
  const serviceName = options.name || path.basename(cwd)

  // 6. Prepare deployment request
  const tier = options.tier
  const environment = options.environment
  const version = options.version

  const payload: any = {
    service: serviceName,
    script: scriptB64,
    metadata: {
      commit: commit.trim(),
      branch: branch.trim(),
      author: author.trim(),
      version: version || Date.now().toString(),
    },
  }

  if (tier) {
    payload.tier = tier
  } else if (environment) {
    payload.environment = environment
  } else {
    payload.environment = 'production'
  }

  console.log(`\n🚀 Deploying to namespace...`)
  console.log(`   Service: ${serviceName}`)
  if (tier) console.log(`   Tier: ${tier}`)
  if (environment) console.log(`   Environment: ${environment}`)
  if (version) console.log(`   Version: ${version}`)
  console.log()

  // 7. Call Deploy API
  const response = await fetch('https://deploy.do/deploy', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${deployApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Deploy API error: ${response.status} ${errorText}`)
  }

  const result = await response.json()

  console.log(`✅ Deployed successfully!`)
  console.log(`🔗 URL: ${result.url}`)
  console.log(`📊 Deployment ID: ${result.id}\n`)

  return {
    success: true,
    mode: 'namespace',
    url: result.url,
    metadata: {
      id: result.id,
      service: serviceName,
      tier,
      environment,
      version,
    },
  }
}

/**
 * Deploy as an ultra-lightweight Cloudflare Snippet
 */
async function deployAsSnippet(cwd: string, options: DeployOptions): Promise<DeploymentResult> {
  console.log('📦 Preparing Cloudflare Snippet...\n')

  // 1. Check for snippet.js
  const snippetPath = path.join(cwd, 'snippet.js')

  try {
    await fs.access(snippetPath)
  } catch {
    throw new Error('No snippet.js found. Build the snippet first with: mdxe build')
  }

  // 2. Read snippet code
  const snippetCode = await fs.readFile(snippetPath, 'utf-8')
  const sizeKB = (snippetCode.length / 1024).toFixed(2)
  const maxSizeKB = 32

  console.log(`📊 Snippet size: ${sizeKB}KB / ${maxSizeKB}KB limit`)

  if (snippetCode.length > 32768) {
    console.log(`\n⚠️  WARNING: Snippet exceeds 32KB limit!`)
    console.log(`   Consider using a full Worker instead.\n`)
  }

  // 3. Read metadata
  const metadataPath = path.join(cwd, '.mdx-metadata.json')
  let snippetName = options.name || path.basename(cwd)

  try {
    const metadataContent = await fs.readFile(metadataPath, 'utf-8')
    const metadata = JSON.parse(metadataContent)
    snippetName = metadata.name || snippetName
  } catch {
    // No metadata file
  }

  // 4. Display manual deployment instructions
  console.log(`\n📋 Cloudflare Snippet Deployment Instructions\n`)
  console.log(`Snippets must be deployed manually via the Cloudflare Dashboard:\n`)
  console.log(`1. Go to: Cloudflare Dashboard > Workers & Pages > Snippets`)
  console.log(`2. Click "Create Snippet"`)
  console.log(`3. Name: ${snippetName}`)
  console.log(`4. Code: Paste contents from snippet.js`)
  console.log(`5. Configure URL patterns and triggers`)
  console.log(`6. Click "Save and Deploy"\n`)

  console.log(`📂 Snippet code location: ${snippetPath}\n`)

  return {
    success: true,
    mode: 'snippet',
    metadata: {
      name: snippetName,
      size: snippetCode.length,
      path: snippetPath,
    },
  }
}

/**
 * Run a shell command
 */
async function runCommand(
  command: string,
  args: string[],
  cwd: string,
  captureOutput = false
): Promise<string> {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, {
      cwd,
      stdio: captureOutput ? 'pipe' : 'inherit',
      shell: true,
    })

    let output = ''

    if (captureOutput && proc.stdout) {
      proc.stdout.on('data', (data) => {
        output += data.toString()
      })
    }

    proc.on('error', (error) => {
      reject(new Error(`Failed to run ${command}: ${error.message}`))
    })

    proc.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`${command} exited with code ${code}`))
      } else {
        resolve(output)
      }
    })
  })
}
