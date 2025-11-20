import path from 'node:path'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs/promises'

/**
 * Start the production server for the MDXE project
 */
export async function runStartCommand(cwd: string = process.cwd()) {
  try {
    // Check if .next directory exists (user needs to build first)
    const nextDir = path.join(process.cwd(), '.next')
    try {
      await fs.access(nextDir)
    } catch (error) {
      console.error('❌ No build found. Please run `mdxe build` first.')
      process.exit(1)
    }

    console.log(`🚀 Starting Next.js production server from: ${nextDir}`)

    // Get the template path to use for server environment
    const appTemplatePath = await getAppPath()
    await startNextServer(process.cwd(), appTemplatePath)
  } catch (error) {
    console.error('Error starting production server:', error)
    process.exit(1)
  }
}

/**
 * Gets the path to the embedded Next.js app template.
 */
async function getAppPath(): Promise<string> {
  const __dirname = path.dirname(fileURLToPath(import.meta.url))

  // In consolidated structure, template is copied to dist/template during build
  const appTemplatePath = path.resolve(__dirname, '../template')

  try {
    await fs.access(appTemplatePath)
    return appTemplatePath
  } catch (error) {
    // Fallback for development environment
    return path.resolve(__dirname, '../../template')
  }
}

/**
 * Start the Next.js production server using mdxe's bundled Next.js
 */
function startNextServer(appPath: string, templatePath: string) {
  return new Promise<void>((resolve, reject) => {
    // Create a server script that uses mdxe's bundled Next.js
    const __dirname = path.dirname(fileURLToPath(import.meta.url))
    const serverScript = `
const { createServer } = require('http');
const next = require('next');

// Change working directory to user's project
process.chdir('${appPath}');

const app = next({ 
  dev: false, 
  dir: '${appPath}',
  conf: {
    distDir: '.next'
  }
});

const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    handle(req, res);
  }).listen(3000, (err) => {
    if (err) throw err;
    console.log('🚀 Ready on http://localhost:3000');
  });
}).catch((ex) => {
  console.error(ex.stack);
  process.exit(1);
});
`

    // Run the server script with Node.js from template context (where dependencies exist)
    const nextProcess = spawn('node', ['-e', serverScript], {
      cwd: templatePath, // Run from template context to access dependencies
      stdio: 'inherit',
      env: {
        ...process.env,
        // Add template's node_modules to NODE_PATH so dependencies are available
        NODE_PATH: `${templatePath}/node_modules:${process.env.NODE_PATH || ''}`,
      },
    })

    nextProcess.on('error', (error) => {
      console.error('Failed to start Next.js production server:', error)
      reject(error)
    })

    nextProcess.on('close', (code) => {
      if (code !== 0) {
        console.error(`Next.js production server exited with code ${code}`)
        reject(new Error(`Next.js production server exited with code ${code}`))
      } else {
        resolve()
      }
    })
  })
}
