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
    }
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

    // Install dependencies in the build directory
    console.log('📦 Installing dependencies in build environment...')
    await installDependencies(buildDir)

    await buildNextApp(buildDir)

    // Copy build output to user's .next directory
    const buildOutput = path.join(buildDir, '.next')
    const userBuildOutput = path.join(process.cwd(), '.next')

    await fse.copy(buildOutput, userBuildOutput)
    console.log(`📁 Build output copied to: ${userBuildOutput}`)

    // Copy content directory from build environment to user's project
    // so the production server can access it
    const buildContentDir = path.join(buildDir, 'content')
    const userContentDir = path.join(process.cwd(), 'content')

    try {
      await fs.access(buildContentDir)
      await fse.copy(buildContentDir, userContentDir)
      console.log(`📁 Content directory copied to: ${userContentDir}`)
    } catch (error) {
      // No content directory in build, that's fine
    }
  } catch (error) {
    console.error('Error building project:', error)
    process.exit(1)
  }
}

/**
 * Install dependencies in the temporary directory
 */
async function installDependencies(appPath: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const installProcess = spawn('pnpm', ['install'], {
      cwd: appPath,
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
}

/**
 * Build the Next.js application
 */
function buildNextApp(appPath: string) {
  return new Promise<void>((resolve, reject) => {
    const nextProcess = spawn('pnpm', ['exec', 'next', 'build'], {
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
