import fs from 'node:fs/promises'
import path from 'node:path'
import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import * as esbuild from 'esbuild'
import type { CodeBlock } from './mdx-parser'
import { createExecutionContext } from './execution-context'

const execAsync = promisify(exec)

/**
 * Bundle code blocks and test blocks for testing
 */
export async function bundleCodeForTesting(codeBlocks: CodeBlock[], testBlocks: CodeBlock[]): Promise<string> {
  const globalDeclarations = `
const on = async (event, callback) => {
  console.log('Event handler registered for:', event);
  if (typeof callback === 'function') {
    return callback();
  }
};

const send = (event, data) => {
  console.log('Event sent:', event, data);
  return { success: true };
};

const emit = (event, data) => {
  console.log('Event emitted:', event, data);
  return { success: true };
};

const ai = function(strings, ...values) {
  const prompt = String.raw({ raw: strings }, ...values);
  console.log('AI called with prompt:', prompt);
  return 'AI response for: ' + prompt;
};

ai.leanCanvas = function(params) { return { title: 'Lean Canvas', ...params }; };
ai.storyBrand = function(params) { return { title: 'Story Brand', ...params }; };
ai.landingPage = function(params) { return { title: 'Landing Page', ...params }; };

const db = {
  blog: {
    create: (title, content) => ({ id: 'test-id', title, content }),
    get: (id) => ({ id, title: 'Test Post', content: 'Test Content' }),
    list: () => [{ id: 'test-id', title: 'Test Post' }],
    update: (id, data) => ({ id, ...data }),
    delete: (id) => true
  }
};

const list = function*(strings, ...values) { 
  yield "Test item 1"; 
  yield "Test item 2";
};

const research = function(strings, ...values) {
  return "Research result";
};

const extract = function(strings, ...values) {
  return ["Extracted item 1", "Extracted item 2"];
};
`

  const combinedSource = [globalDeclarations, ...codeBlocks.map((block) => block.value), ...testBlocks.map((block) => block.value)].join('\n\n')

  const result = await esbuild.transform(combinedSource, {
    loader: 'ts',
    target: 'es2020',
    format: 'esm',
  })

  return result.code
}

/**
 * Create a temporary test file from bundled code
 */
export async function createTempTestFile(bundledCode: string, fileName: string): Promise<string> {
  const tempDir = path.join(process.cwd(), '.mdxe')
  await fs.mkdir(tempDir, { recursive: true })

  const testFileName = path.basename(fileName, path.extname(fileName)) + '.test.ts'
  const testFilePath = path.join(tempDir, testFileName)

  const testFileContent = `
import { describe, it, expect, vi } from 'vitest'

${bundledCode}
`

  await fs.writeFile(testFilePath, testFileContent, 'utf-8')
  return testFilePath
}

/**
 * Create a vitest config file in the temp directory
 */
export async function createVitestConfig(tempDir: string): Promise<string> {
  const configPath = path.join(tempDir, 'vitest.config.ts')

  const configContent = `
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['**/*.test.ts'],
    reporter: 'verbose'
  }
})
`

  await fs.writeFile(configPath, configContent, 'utf-8')
  return configPath
}

/**
 * Run tests using Vitest
 */
export async function runTestsWithVitest(
  bundledCode: string,
  filePath: string,
  watch = false,
): Promise<{
  success: boolean
  output: string
  skipped?: number
}> {
  try {
    const testFilePath = await createTempTestFile(bundledCode, filePath)
    const tempDir = path.dirname(testFilePath)

    // Create a vitest config for this test run
    const configPath = await createVitestConfig(tempDir)

    const watchFlag = watch ? '--watch' : ''
    // Run vitest with the config file
    const command = `npx vitest run --config="${configPath}" ${watchFlag}`

    const { stdout, stderr } = await execAsync(command, { cwd: tempDir })
    const output = stdout + stderr

    if (!watch) {
      await cleanupTempFiles()
    }

    const skippedMatch = output.match(/(\d+) skipped/i)
    const skipped = skippedMatch ? parseInt(skippedMatch[1], 10) : 0

    const success = !output.includes('FAIL') && !output.includes('ERR_') && !output.includes('failed to load config')

    return { success, output, skipped }
  } catch (error: any) {
    await cleanupTempFiles()

    return {
      success: false,
      output: error.stdout + error.stderr || String(error),
      skipped: 0,
    }
  }
}

/**
 * Clean up temporary test files
 */
export async function cleanupTempFiles(): Promise<void> {
  const tempDir = path.join(process.cwd(), '.mdxe')
  try {
    await fs.rm(tempDir, { recursive: true, force: true })
  } catch (error) {
    console.error('Error cleaning up temporary files:', error)
  }
}
