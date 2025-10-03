#!/usr/bin/env node
import { Command } from 'commander'
import { importZapierApps } from './zapier.js'
import { importONetOccupations } from './onet.js'

const program = new Command()

program
  .name('mdxdb-import')
  .description('Import data from external sources into MDX format')
  .version('0.1.0')

program
  .command('zapier')
  .description('Import Zapier apps from public API')
  .option('-o, --output <dir>', 'Output directory', './zapier-apps')
  .option('-l, --limit <number>', 'Results per page', '250')
  .option('-p, --pages <number>', 'Max pages to fetch', '10')
  .action(async (options) => {
    try {
      await importZapierApps(options.output, {
        limit: parseInt(options.limit, 10),
        maxPages: parseInt(options.pages, 10),
      })
    } catch (error) {
      console.error('❌ Import failed:', error)
      process.exit(1)
    }
  })

program
  .command('onet')
  .description('Import O*NET occupation data')
  .option('-o, --output <dir>', 'Output directory', './occupations')
  .option('-v, --version <version>', 'O*NET database version', '30_0')
  .option('--no-details', 'Skip tasks and skills (faster)')
  .action(async (options) => {
    try {
      await importONetOccupations(options.output, {
        version: options.version,
        includeDetails: options.details !== false,
      })
    } catch (error) {
      console.error('❌ Import failed:', error)
      process.exit(1)
    }
  })

program.parse()
