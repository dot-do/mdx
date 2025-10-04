import { Command } from 'commander'
import { promises as fs } from 'fs'
import path from 'path'
import { MdxDbFs } from './lib/mdxdb-fs.js'
import { push, pull } from './lib/index.js'
import { createHttpClient } from './lib/http-client.js'

const packageJsonPath = new URL('../package.json', import.meta.url)
try {
  var packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'))
} catch (error) {
  const fallbackPath = new URL('./package.json', import.meta.url)
  packageJson = JSON.parse(await fs.readFile(fallbackPath, 'utf-8'))
}

const program = new Command()

program
  .version(packageJson.version)
  .description('A CLI tool for MDX Database')
  .option('--json', 'Emit JSON describing actions/results')
  .option('--concurrency <number>', 'Maximum number of concurrent operations for batch commands', '20')

program
  .command('build')
  .description('Build the MDX database')
  .action(async () => {
    const { json } = program.opts()
    try {
      console.log('mdxdb: Starting build process...')

      // Instantiate MdxDbFs with the current working directory as packageDir
      const mdxDb = new MdxDbFs({ packageDir: process.cwd() })

      await mdxDb.build()
      console.log('mdxdb: Content build complete.')

      const exportPath = '.db'
      await mdxDb.exportDb(exportPath)

      if (json) {
        console.log(
          JSON.stringify({
            status: 'success',
            message: `Build output successfully exported to ./${path.basename(exportPath)}`,
          }),
        )
      } else {
        console.log(`mdxdb: Build output successfully exported to ./${path.basename(exportPath)}`)
        console.log('mdxdb: Build process finished successfully.')
      }
    } catch (error) {
      if (json) {
        console.error(
          JSON.stringify({
            status: 'error',
            message: error instanceof Error ? error.message : String(error),
          }),
        )
      } else {
        console.error('mdxdb: Error during build process:')
        if (error instanceof Error) {
          console.error(error.message)
          if (error.stack) {
            console.error(error.stack)
          }
        } else {
          console.error(String(error))
        }
      }
      process.exit(1)
    }
  })

program
  .command('generate-database')
  .description('Generate a database with multiple collections')
  .option('-d, --description <description>', 'Description of the database to generate')
  .option('-c, --count <number>', 'Number of collections to generate', '3')
  .option('--ink', 'Use React Ink for interactive UI', false)
  .action(async (options) => {
    const { json } = program.opts()
    try {
      if (!process.env.OPENAI_API_KEY) {
        const msg = 'OPENAI_API_KEY environment variable is not set.'
        if (json) {
          console.error(JSON.stringify({ status: 'error', message: msg }))
        } else {
          console.error(msg)
        }
        process.exit(1)
      }

      if (options.ink) {
        const { renderApp } = await import('./src/ui/app.js')
        const unmount = renderApp('generate-database', {
          description: options.description,
          count: parseInt(options.count, 10),
        })

        return
      }

      console.log(`Generating database with ${options.count} collections based on: ${options.description}`)

      const mdxDb = new MdxDbFs({ packageDir: process.cwd() })

      if (json) {
        console.log(
          JSON.stringify({
            status: 'success',
            message: `Database generated with ${options.count} collections`,
          }),
        )
      } else {
        console.log(`Database generated with ${options.count} collections`)
      }
    } catch (error) {
      if (json) {
        console.error(
          JSON.stringify({
            status: 'error',
            message: error instanceof Error ? error.message : String(error),
          }),
        )
      } else {
        console.error('Error generating database:', error)
      }
      process.exit(1)
    }
  })

program
  .command('generate-collection')
  .description('Generate a collection with a schema')
  .option('-d, --description <description>', 'Description of the collection to generate')
  .option('-n, --name <name>', 'Name of the collection')
  .option('--ink', 'Use React Ink for interactive UI', false)
  .action(async (options) => {
    const { json } = program.opts()
    try {
      if (!process.env.OPENAI_API_KEY) {
        const msg = 'OPENAI_API_KEY environment variable is not set.'
        if (json) {
          console.error(JSON.stringify({ status: 'error', message: msg }))
        } else {
          console.error(msg)
        }
        process.exit(1)
      }

      if (options.ink) {
        const { renderApp } = await import('./src/ui/app.js')
        const unmount = renderApp('generate-collection', {
          description: options.description,
          name: options.name,
        })

        return
      }

      console.log(`Generating collection${options.name ? ` '${options.name}'` : ''} based on: ${options.description}`)

      const mdxDb = new MdxDbFs({ packageDir: process.cwd() })

      if (json) {
        console.log(
          JSON.stringify({
            status: 'success',
            message: `Collection${options.name ? ` '${options.name}'` : ''} generated successfully`,
          }),
        )
      } else {
        console.log(`Collection${options.name ? ` '${options.name}'` : ''} generated successfully`)
      }
    } catch (error) {
      if (json) {
        console.error(
          JSON.stringify({
            status: 'error',
            message: error instanceof Error ? error.message : String(error),
          }),
        )
      } else {
        console.error('Error generating collection:', error)
      }
      process.exit(1)
    }
  })

program
  .command('generate-documents')
  .description('Generate documents for a collection')
  .requiredOption('-c, --collection <collection>', 'Name of the collection')
  .option('-n, --count <number>', 'Number of documents to generate', '1')
  .option('-d, --description <description>', 'Description to guide document generation')
  .option('--ink', 'Use React Ink for interactive UI', false)
  .action(async (options) => {
    const { json } = program.opts()
    try {
      if (!process.env.OPENAI_API_KEY) {
        const msg = 'OPENAI_API_KEY environment variable is not set.'
        if (json) {
          console.error(JSON.stringify({ status: 'error', message: msg }))
        } else {
          console.error(msg)
        }
        process.exit(1)
      }

      if (options.ink) {
        const { renderApp } = await import('./src/ui/app.js')
        const unmount = renderApp('generate-documents', {
          collection: options.collection,
          count: parseInt(options.count, 10),
          description: options.description,
        })

        return
      }

      console.log(`Generating ${options.count} documents for collection '${options.collection}'`)

      const mdxDb = new MdxDbFs({ packageDir: process.cwd() })

      if (json) {
        console.log(
          JSON.stringify({
            status: 'success',
            message: `${options.count} documents generated for collection '${options.collection}'`,
          }),
        )
      } else {
        console.log(`${options.count} documents generated for collection '${options.collection}'`)
      }
    } catch (error) {
      if (json) {
        console.error(
          JSON.stringify({
            status: 'error',
            message: error instanceof Error ? error.message : String(error),
          }),
        )
      } else {
        console.error('Error generating documents:', error)
      }
      process.exit(1)
    }
  })

program
  .command('push')
  .description('Push entities from database to filesystem as MDX files')
  .requiredOption('-n, --namespace <namespace>', 'Namespace to export (e.g., "payload", "notes")')
  .requiredOption('-d, --directory <directory>', 'Output directory for MDX files')
  .option('-c, --collections <collections>', 'Collection types to export (comma-separated)', '')
  .option('-u, --db-url <url>', 'Database worker URL', process.env.DB_WORKER_URL || 'https://db.do')
  .option('-k, --api-key <key>', 'API key for authentication', process.env.DB_API_KEY)
  .option('-f, --force', 'Force overwrite existing files without conflict check', false)
  .option('--commit', 'Create git commit after push', false)
  .option('-m, --message <message>', 'Git commit message')
  .option('--dry-run', 'Show what would be pushed without writing files', false)
  .action(async (options) => {
    const { json } = program.opts()
    try {
      // Create HTTP client for db worker
      const dbWorker = createHttpClient({
        baseUrl: options.dbUrl,
        apiKey: options.apiKey,
      })

      // Parse collections if provided
      const collections = options.collections ? options.collections.split(',').map((c: string) => c.trim()) : undefined

      // Execute push command
      const result = await push({
        namespace: options.namespace,
        directory: path.resolve(options.directory),
        collections,
        force: options.force,
        commit: options.commit,
        commitMessage: options.message,
        dbWorker,
        dryRun: options.dryRun,
      })

      if (json) {
        console.log(JSON.stringify({ status: 'success', result }))
      }

      // Report conflicts if any
      if (result.conflicts.length > 0 && !json) {
        process.exit(1)
      }
    } catch (error) {
      if (json) {
        console.error(
          JSON.stringify({
            status: 'error',
            message: error instanceof Error ? error.message : String(error),
          }),
        )
      } else {
        console.error('Error during push:', error)
      }
      process.exit(1)
    }
  })

program
  .command('pull')
  .description('Pull MDX files from filesystem into database')
  .requiredOption('-n, --namespace <namespace>', 'Namespace to import into (e.g., "payload", "notes")')
  .requiredOption('-d, --directory <directory>', 'Directory containing MDX files')
  .option('-c, --collections <collections>', 'Collection types to import (comma-separated)', '')
  .option('-u, --db-url <url>', 'Database worker URL', process.env.DB_WORKER_URL || 'https://db.do')
  .option('-k, --api-key <key>', 'API key for authentication', process.env.DB_API_KEY)
  .option('-o, --overwrite', 'Overwrite existing database entries', false)
  .option('-p, --pattern <pattern>', 'File pattern to match', '**/*.mdx')
  .option('--dry-run', 'Show what would be pulled without writing to database', false)
  .action(async (options) => {
    const { json } = program.opts()
    try {
      // Create HTTP client for db worker
      const dbWorker = createHttpClient({
        baseUrl: options.dbUrl,
        apiKey: options.apiKey,
      })

      // Parse collections if provided
      const collections = options.collections ? options.collections.split(',').map((c: string) => c.trim()) : undefined

      // Execute pull command
      const result = await pull({
        namespace: options.namespace,
        directory: path.resolve(options.directory),
        collections,
        overwrite: options.overwrite,
        dbWorker,
        dryRun: options.dryRun,
        pattern: options.pattern,
      })

      if (json) {
        console.log(JSON.stringify({ status: 'success', result }))
      }

      // Exit with error if there were errors
      if (result.errors > 0 && !json) {
        process.exit(1)
      }
    } catch (error) {
      if (json) {
        console.error(
          JSON.stringify({
            status: 'error',
            message: error instanceof Error ? error.message : String(error),
          }),
        )
      } else {
        console.error('Error during pull:', error)
      }
      process.exit(1)
    }
  })

program.parse(process.argv)
