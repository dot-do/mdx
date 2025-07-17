import { mkdir, readdir } from 'node:fs/promises'
import path from 'node:path'
import { serve } from 'bun'
import indexHtml from '../public/index.html'

const port = process.env.PORT ? Number(process.env.PORT) : 3000

const EXAMPLES_DIR = path.join(process.cwd(), 'examples')

export async function getFiles() {
  await ensureExamplesDir()
  const files = await listFilesRecursive(EXAMPLES_DIR)
  return files.map((file) => ({
    path: file.slice(EXAMPLES_DIR.length + 1),
    name: path.basename(file),
  }))
}

export async function getFile(filePath: string) {
  if (!filePath) {
    return null
  }
  try {
    const fullPath = path.join(EXAMPLES_DIR, filePath)
    const file = await Bun.file(fullPath)
    return await file.text()
  } catch {
    return null
  }
}

export async function saveFile(filePath: string, markdownContent: string) {
  if (!filePath || typeof markdownContent !== 'string') {
    throw new Error('Invalid request')
  }

  await ensureExamplesDir()
  const fullPath = path.join(EXAMPLES_DIR, filePath)
  await Bun.write(fullPath, markdownContent)
}

// Helper function to recursively list files
async function listFilesRecursive(dir: string): Promise<string[]> {
  const dirents = await readdir(dir, { withFileTypes: true })
  const files: string[] = []
  for (const it of dirents) {
    const full = path.join(dir, it.name)
    if (it.isDirectory()) {
      files.push(...(await listFilesRecursive(full)))
    } else if (it.isFile() && it.name.endsWith('.mdx')) {
      files.push(full)
    }
  }
  return files
}

// Helper function to ensure examples directory exists
async function ensureExamplesDir() {
  try {
    await mkdir(EXAMPLES_DIR, { recursive: true })
  } catch (error) {
    console.error('Error ensuring examples directory:', error)
    process.exit(1)
  }
}

serve({
  port,
  routes: {
    '/': indexHtml,
  },
  async fetch(req) {
    const url = new URL(req.url)

    if (url.pathname === '/api/ping') {
      return new Response(JSON.stringify({ ok: true }), {
        headers: { 'content-type': 'application/json' },
      })
    }

    if (url.pathname === '/api/files') {
      const files = await getFiles()
      return Response.json(files)
    }

    if (url.pathname === '/api/file') {
      const relPath = url.searchParams.get('path')
      if (!relPath) return new Response('Bad Request', { status: 400 })
      const fileContent = await getFile(relPath)
      if (fileContent === null) {
        return new Response('Not Found', { status: 404 })
      }
      return new Response(fileContent, {
        headers: { 'content-type': 'text/plain' },
      })
    }

    if (url.pathname === '/api/save' && req.method === 'POST') {
      try {
        const { markdownContent, filePath } = await req.json()
        if (!markdownContent || !filePath) {
          return new Response('Bad Request: Missing content or filePath', {
            status: 400,
          })
        }
        await saveFile(filePath, markdownContent)
        return Response.json({ ok: true, message: 'File saved' })
      } catch {
        return new Response('Error saving file', { status: 500 })
      }
    }

    // default 404
    return new Response('Not Found', { status: 404 })
  },
  development: process.env.NODE_ENV === 'development',
})

console.log(`🚀 basic-browser dev server running at http://localhost:${port}`)
