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
