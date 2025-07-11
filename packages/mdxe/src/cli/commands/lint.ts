import path from 'node:path'
import { spawn } from 'node:child_process'
import { findMdxFiles } from '../utils/mdx-parser'
import { fileExists } from '../utils/file-utils'

/**
 * Run lint for MDX files and TypeScript files in the project
 */
export async function runLintCommand(cwd: string = process.cwd()): Promise<void> {
  try {
    console.log('🔍 MDXE Lint Runner')
    console.log(`📁 Current directory: ${cwd}`)
    console.log('')

    // Check if ESLint is available
    const hasEslint = await checkEslintAvailable(cwd)
    if (!hasEslint) {
      console.log('⚠️ ESLint not found. Skipping lint.')
      console.log('To enable linting, install ESLint: npm install --save-dev eslint')
      return
    }

    // Find files to lint
    const mdxFiles = await findMdxFiles(cwd)
    const tsFiles = await findTypeScriptFiles(cwd)
    const allFiles = [...mdxFiles, ...tsFiles]

    if (allFiles.length === 0) {
      console.log('⚠️ No files found to lint.')
      return
    }

    console.log(`📄 Found ${allFiles.length} files to lint:`)
    console.log(`  - ${mdxFiles.length} MDX files`)
    console.log(`  - ${tsFiles.length} TypeScript files`)
    console.log('')

    // Run ESLint
    const success = await runEslint(cwd, allFiles)

    if (success) {
      console.log('✅ All files passed linting')
    } else {
      console.log('❌ Linting failed')
      process.exit(1)
    }
  } catch (error) {
    console.error('Error running lint:', error)
    process.exit(1)
  }
}

/**
 * Check if ESLint is available in the project
 */
async function checkEslintAvailable(cwd: string): Promise<boolean> {
  try {
    // Check if eslint is in node_modules
    const eslintPath = path.join(cwd, 'node_modules', '.bin', 'eslint')
    if (await fileExists(eslintPath)) {
      return true
    }

    // Check if eslint is globally available
    return new Promise((resolve) => {
      const eslintProcess = spawn('eslint', ['--version'], { stdio: 'ignore' })
      eslintProcess.on('close', (code) => {
        resolve(code === 0)
      })
      eslintProcess.on('error', () => {
        resolve(false)
      })
    })
  } catch {
    return false
  }
}

/**
 * Find TypeScript files in the project
 */
async function findTypeScriptFiles(cwd: string): Promise<string[]> {
  const { glob } = await import('fast-glob')

  const patterns = ['**/*.ts', '**/*.tsx', '!node_modules/**', '!dist/**', '!build/**', '!.next/**', '!coverage/**']

  return await glob(patterns, { cwd, absolute: true })
}

/**
 * Run ESLint on the specified files
 */
async function runEslint(cwd: string, files: string[]): Promise<boolean> {
  return new Promise((resolve) => {
    const eslintArgs = ['--ext', '.ts,.tsx,.md,.mdx', '--no-error-on-unmatched-pattern', ...files.map((f) => path.relative(cwd, f))]

    console.log('🔧 Running ESLint...')

    const eslintProcess = spawn('eslint', eslintArgs, {
      cwd,
      stdio: 'inherit',
    })

    eslintProcess.on('close', (code) => {
      resolve(code === 0)
    })

    eslintProcess.on('error', (error) => {
      console.error('Failed to run ESLint:', error)
      resolve(false)
    })
  })
}
