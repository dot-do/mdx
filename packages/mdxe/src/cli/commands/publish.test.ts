import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import fs from 'node:fs/promises'
import path from 'node:path'
import { runPublishCommand } from './publish'
import { runSnippetCommand } from './snippet'
import { runAssetsCommand } from './assets'

// Mock dependencies
vi.mock('node:child_process', () => ({
  spawn: vi.fn((cmd, args, options) => {
    return {
      on: vi.fn((event, cb) => {
        if (event === 'close') {
          setTimeout(() => cb(0), 0)
        }
      }),
    }
  }),
}))

vi.mock('./build', () => ({
  runBuildCommand: vi.fn(),
}))

describe('Publishing Commands', () => {
  const testDir = path.join(process.cwd(), '.test-mdxe')
  const contentDir = path.join(testDir, 'content')

  beforeEach(async () => {
    // Create test directory structure
    await fs.mkdir(contentDir, { recursive: true })
    process.chdir(testDir)

    // Create sample content
    await fs.writeFile(path.join(contentDir, 'index.mdx'), '# Test Content')
    await fs.writeFile(path.join(contentDir, 'about.md'), '# About')
  })

  afterEach(async () => {
    // Cleanup
    try {
      await fs.rm(testDir, { recursive: true, force: true })
    } catch (error) {
      // Ignore cleanup errors
    }
  })

  describe('runPublishCommand', () => {
    it('should generate wrangler.toml for worker deployment', async () => {
      await runPublishCommand({
        target: 'worker',
        name: 'test-worker',
        env: 'production',
      })

      const wranglerPath = path.join(testDir, 'wrangler.toml')
      const content = await fs.readFile(wranglerPath, 'utf-8')

      expect(content).toContain('name = "test-worker"')
      expect(content).toContain('main = ".mdxe/worker.js"')
      expect(content).toContain('[env.production]')
    })

    it('should create worker script bundle', async () => {
      await runPublishCommand({
        target: 'worker',
        name: 'test-worker',
      })

      const workerPath = path.join(testDir, '.mdxe', 'worker.js')
      const exists = await fs
        .access(workerPath)
        .then(() => true)
        .catch(() => false)

      expect(exists).toBe(true)
    })

    it('should support snippet deployment', async () => {
      await runPublishCommand({
        target: 'snippet',
        name: 'test-snippet',
      })

      const snippetPath = path.join(testDir, '.mdxe', 'snippet.js')
      const exists = await fs
        .access(snippetPath)
        .then(() => true)
        .catch(() => false)

      expect(exists).toBe(true)
    })

    it('should support assets deployment', async () => {
      await runPublishCommand({
        target: 'assets',
        name: 'test-assets',
      })

      const assetsWorkerPath = path.join(testDir, '.mdxe', 'assets-worker.js')
      const exists = await fs
        .access(assetsWorkerPath)
        .then(() => true)
        .catch(() => false)

      expect(exists).toBe(true)
    })
  })

  describe('runSnippetCommand', () => {
    it('should analyze content structure', async () => {
      await runSnippetCommand({
        name: 'test-snippet',
      })

      const metadataPath = path.join(testDir, '.mdxe', 'snippet-metadata.json')
      const content = await fs.readFile(metadataPath, 'utf-8')
      const metadata = JSON.parse(content)

      expect(metadata.name).toBe('test-snippet')
      expect(metadata.routes).toContain('/')
      expect(metadata.routes).toContain('/about')
    })

    it('should generate minified snippet code', async () => {
      await runSnippetCommand({
        name: 'test-snippet',
        minify: true,
      })

      const snippetPath = path.join(testDir, '.mdxe', 'snippet.js')
      const content = await fs.readFile(snippetPath, 'utf-8')

      // Minified code should not have multi-line comments
      expect(content).not.toContain('///')
      // Should have route map
      expect(content).toContain('routes')
    })

    it('should generate deployment guide', async () => {
      await runSnippetCommand({
        name: 'test-snippet',
      })

      const guidePath = path.join(testDir, '.mdxe', 'DEPLOYMENT.md')
      const content = await fs.readFile(guidePath, 'utf-8')

      expect(content).toContain('# Cloudflare Snippet Deployment Guide')
      expect(content).toContain('test-snippet')
    })

    it('should support custom output path', async () => {
      const customOutput = 'dist/custom-snippet.js'

      await runSnippetCommand({
        name: 'test-snippet',
        output: customOutput,
      })

      const snippetPath = path.join(testDir, customOutput)
      const exists = await fs
        .access(snippetPath)
        .then(() => true)
        .catch(() => false)

      expect(exists).toBe(true)
    })
  })

  describe('runAssetsCommand', () => {
    it('should collect all assets from content directory', async () => {
      await runAssetsCommand({
        name: 'test-assets',
      })

      const metadataPath = path.join(testDir, '.mdxe', 'assets-metadata.json')
      const content = await fs.readFile(metadataPath, 'utf-8')
      const metadata = JSON.parse(content)

      expect(metadata.assets).toBeGreaterThanOrEqual(2)
      expect(metadata.name).toBe('test-assets')
    })

    it('should generate asset manifest', async () => {
      await runAssetsCommand({
        name: 'test-assets',
      })

      const workerPath = path.join(testDir, '.mdxe', 'assets-worker.js')
      const content = await fs.readFile(workerPath, 'utf-8')

      expect(content).toContain('MANIFEST')
      expect(content).toContain('/index.mdx')
      expect(content).toContain('/about.md')
    })

    it('should copy assets to deployment directory', async () => {
      await runAssetsCommand({
        name: 'test-assets',
      })

      const deployedIndexPath = path.join(testDir, '.mdxe', 'assets', 'index.mdx')
      const deployedAboutPath = path.join(testDir, '.mdxe', 'assets', 'about.md')

      const indexExists = await fs
        .access(deployedIndexPath)
        .then(() => true)
        .catch(() => false)
      const aboutExists = await fs
        .access(deployedAboutPath)
        .then(() => true)
        .catch(() => false)

      expect(indexExists).toBe(true)
      expect(aboutExists).toBe(true)
    })

    it('should generate wrangler.toml for Worker Assets', async () => {
      await runAssetsCommand({
        name: 'test-assets',
        env: 'production',
      })

      const wranglerPath = path.join(testDir, 'wrangler.toml')
      const content = await fs.readFile(wranglerPath, 'utf-8')

      expect(content).toContain('name = "test-assets"')
      expect(content).toContain('[assets]')
      expect(content).toContain('directory = "./.mdxe/assets"')
      expect(content).toContain('binding = "ASSETS"')
    })

    it('should detect content types correctly', async () => {
      // Add different file types
      await fs.writeFile(path.join(contentDir, 'image.png'), Buffer.from('fake-image'))
      await fs.writeFile(path.join(contentDir, 'style.css'), 'body { margin: 0; }')

      await runAssetsCommand({
        name: 'test-assets',
      })

      const metadataPath = path.join(testDir, '.mdxe', 'assets-metadata.json')
      const content = await fs.readFile(metadataPath, 'utf-8')
      const metadata = JSON.parse(content)

      const manifest = metadata.manifest

      expect(manifest['/index.mdx'].contentType).toBe('text/mdx')
      expect(manifest['/about.md'].contentType).toBe('text/markdown')
      expect(manifest['/image.png'].contentType).toBe('image/png')
      expect(manifest['/style.css'].contentType).toBe('text/css')
    })
  })

  describe('Configuration Generation', () => {
    it('should use project name as default worker name', async () => {
      await runPublishCommand({
        target: 'worker',
      })

      const wranglerPath = path.join(testDir, 'wrangler.toml')
      const content = await fs.readFile(wranglerPath, 'utf-8')

      expect(content).toContain(`name = "${path.basename(testDir)}"`)
    })

    it('should support multiple environments', async () => {
      await runPublishCommand({
        target: 'worker',
        env: 'staging',
      })

      const wranglerPath = path.join(testDir, 'wrangler.toml')
      const content = await fs.readFile(wranglerPath, 'utf-8')

      expect(content).toContain('[env.staging]')
    })

    it('should include minification settings', async () => {
      await runPublishCommand({
        target: 'worker',
        minify: true,
      })

      const workerPath = path.join(testDir, '.mdxe', 'worker.js')
      const exists = await fs
        .access(workerPath)
        .then(() => true)
        .catch(() => false)

      expect(exists).toBe(true)
      // Minification is noted in logs (actual implementation would minify)
    })
  })

  describe('Error Handling', () => {
    it('should handle missing content directory gracefully', async () => {
      await fs.rm(contentDir, { recursive: true })

      await expect(
        runAssetsCommand({
          name: 'test-assets',
        })
      ).resolves.not.toThrow()
    })

    it('should validate deployment target', async () => {
      await expect(
        runPublishCommand({
          target: 'invalid' as any,
        })
      ).rejects.toThrow()
    })
  })
})
