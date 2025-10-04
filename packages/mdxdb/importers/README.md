# @mdxdb/importers

Data importers for converting external API data into MDX format.

## Supported Sources

- **Zapier** - Import apps, triggers, actions from Zapier public API
- **O*NET** - Import occupation data from O*NET database

## Installation

```bash
pnpm add @mdxdb/importers
```

## CLI Usage

### Import Zapier Apps

```bash
pnpm mdxdb-import zapier [options]

Options:
  -o, --output <dir>       Output directory (default: ./zapier-apps)
  -l, --limit <number>     Results per page (default: 250)
  -p, --pages <number>     Max pages to fetch (default: 10)

Example:
  pnpm mdxdb-import zapier --output ./data/zapier-apps
```

This will:
1. Fetch apps from `https://zapier.com/api/v4/apps/`
2. Convert each app to MDX with frontmatter
3. Save to output directory
4. Create README with metadata

### Import O*NET Occupations

```bash
pnpm mdxdb-import onet [options]

Options:
  -o, --output <dir>       Output directory (default: ./occupations)
  -v, --version <version>  O*NET version (default: 30_0)
  --no-details             Skip tasks and skills (faster)

Example:
  pnpm mdxdb-import onet --output ./data/occupations
```

This will:
1. Download occupation data from onetcenter.org
2. Optionally fetch task statements and skills
3. Convert to MDX with relationships
4. Save to output directory

## Programmatic Usage

### Zapier Importer

```typescript
import { importZapierApps, fetchZapierApps } from '@mdxdb/importers'

// Import all apps to directory
await importZapierApps('./zapier-apps', {
  limit: 250,
  maxPages: 10,
})

// Or fetch and process manually
const apps = await fetchZapierApps(250, 10)
for (const app of apps) {
  console.log(app.title, app.key)
}
```

### O*NET Importer

```typescript
import { importONetOccupations, fetchONetFile } from '@mdxdb/importers'

// Import all occupations with tasks and skills
await importONetOccupations('./occupations', {
  version: '30_0',
  includeDetails: true,
})

// Or fetch raw data
const occupationsCSV = await fetchONetFile('Occupation Data.txt', '30_0')
```

## Output Format

### Zapier Apps

Each app is saved as `{slug}.mdx`:

```mdx
---
id: 12345
key: slack
title: Slack
description: Slack is a platform for team communication...
image: https://...
hexColor: "#4A154B"
categories: ['team-chat', 'productivity']
api: https://api.slack.com/
images:
  url_16x16: https://...
  url_128x128: https://...
type: ZapierApp
source: zapier.com
---

# Slack

Slack is a platform for team communication...

## Categories

- Team Chat
- Productivity

## Resources

- [API Documentation](https://api.slack.com/)
- [Install](https://zapier.com/apps/slack/integrations)

## Images

![Slack Icon](https://...)
```

### O*NET Occupations

Each occupation is saved as `{slug}.mdx`:

```mdx
---
socCode: "15-1252.00"
title: Software Developers, Applications
description: Develop, create, and modify general computer applications...
taskCount: 42
skillCount: 35
type: Occupation
source: onetcenter.org
---

# Software Developers, Applications

**O*NET-SOC Code:** 15-1252.00

Develop, create, and modify general computer applications...

## Tasks (42)

1. Analyze user needs and develop software solutions
2. Design and conduct software testing
...

## Top Skills (35)

1. **Programming** - 4.5
2. **Complex Problem Solving** - 4.2
...

## Relationships

- **Has Tasks:** 42 tasks defined
- **Requires Skills:** 35 skills identified
```

## Relationships

### Zapier

- **App → Categories** (many-to-many)
- **App → Triggers** (one-to-many)
- **App → Actions** (one-to-many)

### O*NET

- **Occupation → Tasks** (one-to-many via SOC code)
- **Occupation → Skills** (one-to-many via SOC code)
- **Occupation → Industries** (many-to-many via NAICS)

## Data Sources

### Zapier API

- **URL:** https://zapier.com/api/v4/apps/
- **Rate Limits:** None specified (public API)
- **Pagination:** Automatic

### O*NET Database

- **URL:** https://www.onetcenter.org/database.html
- **Files:** https://www.onetcenter.org/dl_files/database/db_30_0_text/
- **License:** Public domain (U.S. Department of Labor)

## Adding New Importers

Create a new importer file:

```typescript
// src/my-source.ts
export async function importMySource(outputDir: string, options: {}) {
  // 1. Fetch data from API
  const data = await fetchFromAPI()

  // 2. Convert to MDX
  const mdx = dataToMDX(data)

  // 3. Write to files
  await fs.writeFile(path.join(outputDir, 'item.mdx'), mdx)
}
```

Add CLI command:

```typescript
// src/cli.ts
program
  .command('my-source')
  .description('Import from my source')
  .action(async (options) => {
    await importMySource(options.output, options)
  })
```

## License

MIT

---

## New Import Pipeline (v2)

The package now includes a comprehensive import pipeline that generates complete MDX collections from multiple sources with cross-references and relationships.

### Quick Start

```bash
# Import all collections
pnpm --filter @mdxdb/importers import

# Dry run (no files written)
pnpm --filter @mdxdb/importers import:dry

# Verbose output
pnpm --filter @mdxdb/importers import:verbose
```

### Features

- ✅ Three-layer architecture (Sources → Mappings → Collections)
- ✅ Type-safe with full TypeScript + Zod validation
- ✅ Multiple source formats (TSV, CSV, JSON, MDX)
- ✅ Automatic wiki-link cross-references
- ✅ Progress tracking and error handling
- ✅ Dry run and skip existing modes

### Available Collections

**O*NET (5 collections):**
- Occupations (~900 files)
- Tasks (~20,000 files)
- Skills (~35 files)
- Abilities (~52 files)
- Knowledge (~33 files)

**NAICS (1 collection):**
- Industries (~1,000 files)

**Schema.org (2 collections):**
- Types (~800 files)
- Properties (~1,400 files)

### CLI Options

```bash
tsx scripts/import-all.ts [options]

Options:
  --dry-run           Don't write files, just simulate
  --skip-existing     Skip files that already exist
  --verbose, -v       Verbose logging
  --mapping=<id>      Import only specific mapping

Environment Variables:
  OUTPUT_DIR          Custom output directory (default: ../../../db)
```

### Import Specific Mapping

```bash
# Only O*NET occupations
tsx scripts/import-all.ts --mapping=onet-occupations

# Only NAICS industries
tsx scripts/import-all.ts --mapping=naics-industries

# Only Schema.org types
tsx scripts/import-all.ts --mapping=schema-org-types
```

### Output Structure

```
db/collections/
├── Occupations/
│   ├── readme.mdx (collection index)
│   ├── software-developers/
│   │   └── readme.mdx
│   └── ... (899 more)
├── Tasks/
│   ├── readme.mdx
│   ├── analyze-user-needs/
│   │   └── readme.mdx
│   └── ... (19,999 more)
└── ... (more collections)
```

### Programmatic Usage

```typescript
import { createPipelineConfig, runImportPipeline } from '@mdxdb/importers'

const config = createPipelineConfig('./output')
config.options = {
  dryRun: false,
  skipExisting: true,
  verbose: true,
}

const result = await runImportPipeline(config)
console.log(`Created ${result.totalCreated} files`)
```

### Documentation

See `notes/2025-10-04-mdxdb-migration-architecture.md` for complete architecture documentation.

