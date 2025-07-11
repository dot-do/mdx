import path from 'node:path'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs/promises'
import tmp from 'tmp'
import fse from 'fs-extra'

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
 * Creates a temporary build directory with template and user content
 */
async function createBuildDir(appTemplatePath: string): Promise<string> {
  const tmpDir = tmp.dirSync({ unsafeCleanup: true })
  const tmpAppPath = tmpDir.name

  // Copy template to temp directory
  await fse.copy(appTemplatePath, tmpAppPath)

  // Copy user content if it exists
  const userContentDir = path.join(process.cwd(), 'content')
  const tempContentDir = path.join(tmpAppPath, 'content')

  try {
    await fs.access(userContentDir)
    await fse.copy(userContentDir, tempContentDir)
  } catch (error) {
    // No user content, use template default
  }

  // Copy user mdx-components.js if it exists
  const userMdxComponents = path.join(process.cwd(), 'mdx-components.js')
  try {
    await fs.access(userMdxComponents)
    await fse.copy(userMdxComponents, path.join(tmpAppPath, 'mdx-components.js'))
  } catch (error) {
    // No user components, that's fine - built-in components will be used
  }

  // Rename package.json.template to package.json
  const packageJsonTemplatePath = path.join(tmpAppPath, 'package.json.template')
  const packageJsonPath = path.join(tmpAppPath, 'package.json')
  await fse.rename(packageJsonTemplatePath, packageJsonPath)

  return tmpAppPath
}

/**
 * Build the MDXE project for production
 */
export async function runBuildCommand(cwd: string = process.cwd()) {
  try {
    const appTemplatePath = await getAppPath()
    console.log(`📦 Building Next.js application from: ${appTemplatePath}`)

    const buildDir = await createBuildDir(appTemplatePath)
    console.log(`📁 Created build directory: ${buildDir}`)

    await buildNextApp(buildDir)

    // Copy build output to user's .next directory
    const buildOutput = path.join(buildDir, '.next')
    const userBuildOutput = path.join(process.cwd(), '.next')

    await fse.copy(buildOutput, userBuildOutput)
    console.log(`📁 Build output copied to: ${userBuildOutput}`)
  } catch (error) {
    console.error('Error building project:', error)
    process.exit(1)
  }
}

/**
 * Build the Next.js application
 */
function buildNextApp(appPath: string) {
  return new Promise<void>((resolve, reject) => {
    const nextProcess = spawn('next', ['build'], {
      cwd: appPath,
      stdio: 'inherit',
      shell: true,
    })

    nextProcess.on('error', (error) => {
      console.error('Failed to build Next.js application:', error)
      reject(error)
    })

    nextProcess.on('close', (code) => {
      if (code !== 0) {
        console.error(`Next.js build exited with code ${code}`)
        reject(new Error(`Next.js build exited with code ${code}`))
      } else {
        console.log('✅ Next.js build completed successfully')
        resolve()
      }
    })
  })
}
