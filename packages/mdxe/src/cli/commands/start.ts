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
    await startNextServer(process.cwd())
  } catch (error) {
    console.error('Error starting production server:', error)
    process.exit(1)
  }
}

/**
 * Start the Next.js production server
 */
function startNextServer(appPath: string) {
  return new Promise<void>((resolve, reject) => {
    const nextProcess = spawn('next', ['start'], {
      cwd: appPath,
      stdio: 'inherit',
      shell: true,
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
