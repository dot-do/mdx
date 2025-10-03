/**
 * O*NET Data Importer
 * Imports occupation data from O*NET database
 * Source: https://www.onetcenter.org/database.html
 * Files: https://www.onetcenter.org/dl_files/database/db_30_0_text/
 */

import fs from 'node:fs/promises'
import path from 'node:path'
import matter from 'gray-matter'
import GithubSlugger from 'github-slugger'
import { parse } from 'csv-parse/sync'

export interface ONetOccupation {
  'O*NET-SOC Code': string
  Title: string
  Description: string
}

export interface ONetTask {
  'O*NET-SOC Code': string
  'Task ID': string
  Task: string
  'Task Type': string
  'Incumbents Responding': string
}

export interface ONetSkill {
  'O*NET-SOC Code': string
  'Element ID': string
  'Element Name': string
  'Scale ID': string
  'Data Value': string
  'N': string
  'Standard Error': string
  'Lower CI Bound': string
  'Upper CI Bound': string
  'Recommend Suppress': string
  'Not Relevant': string
  Date: string
  'Domain Source': string
}

/**
 * Fetch O*NET data file from official source
 */
export async function fetchONetFile(filename: string, version: string = '30_0'): Promise<string> {
  const url = `https://www.onetcenter.org/dl_files/database/db_${version}_text/${filename}`

  console.log(`Fetching O*NET file: ${filename}...`)

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`O*NET download error: ${response.statusText}`)
  }

  return await response.text()
}

/**
 * Parse O*NET occupation reference file
 */
export function parseOccupationReference(csvContent: string): ONetOccupation[] {
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  })
  return records
}

/**
 * Parse O*NET task statements file
 */
export function parseTaskStatements(csvContent: string): ONetTask[] {
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  })
  return records
}

/**
 * Parse O*NET skills file
 */
export function parseSkills(csvContent: string): ONetSkill[] {
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  })
  return records
}

/**
 * Convert O*NET occupation to MDX
 */
export function occupationToMDX(
  occupation: ONetOccupation,
  tasks: ONetTask[],
  skills: ONetSkill[]
): string {
  const socCode = occupation['O*NET-SOC Code']
  const relatedTasks = tasks.filter(t => t['O*NET-SOC Code'] === socCode)
  const relatedSkills = skills.filter(s => s['O*NET-SOC Code'] === socCode)

  const frontmatter = {
    socCode,
    title: occupation.Title,
    description: occupation.Description,
    taskCount: relatedTasks.length,
    skillCount: relatedSkills.length,
    type: 'Occupation',
    source: 'onetcenter.org',
  }

  const body = `
# ${occupation.Title}

**O*NET-SOC Code:** ${socCode}

${occupation.Description}

## Tasks (${relatedTasks.length})

${relatedTasks.slice(0, 10).map((task, i) => `${i + 1}. ${task.Task}`).join('\n')}

${relatedTasks.length > 10 ? `\n_...and ${relatedTasks.length - 10} more tasks_` : ''}

## Top Skills (${relatedSkills.length})

${relatedSkills
  .slice(0, 10)
  .map((skill, i) => `${i + 1}. **${skill['Element Name']}** - ${skill['Data Value']}`)
  .join('\n')}

${relatedSkills.length > 10 ? `\n_...and ${relatedSkills.length - 10} more skills_` : ''}

## Relationships

- **Has Tasks:** ${relatedTasks.length} tasks defined
- **Requires Skills:** ${relatedSkills.length} skills identified
`.trim()

  return matter.stringify(body, frontmatter)
}

/**
 * Import O*NET occupations to directory as MDX files
 */
export async function importONetOccupations(
  outputDir: string,
  options: { version?: string; includeDetails?: boolean } = {}
) {
  const { version = '30_0', includeDetails = true } = options

  console.log('💼 Importing O*NET occupation data...')

  // Download required files
  const occupationsCSV = await fetchONetFile('Occupation Data.txt', version)
  const occupations = parseOccupationReference(occupationsCSV)
  console.log(`Found ${occupations.length} occupations`)

  let tasks: ONetTask[] = []
  let skills: ONetSkill[] = []

  if (includeDetails) {
    try {
      const tasksCSV = await fetchONetFile('Task Statements.txt', version)
      tasks = parseTaskStatements(tasksCSV)
      console.log(`Found ${tasks.length} task statements`)
    } catch (err) {
      console.warn('Could not fetch task statements:', err)
    }

    try {
      const skillsCSV = await fetchONetFile('Skills.txt', version)
      skills = parseSkills(skillsCSV)
      console.log(`Found ${skills.length} skill associations`)
    } catch (err) {
      console.warn('Could not fetch skills:', err)
    }
  }

  // Create output directory
  await fs.mkdir(outputDir, { recursive: true })

  // Create README
  const readme = `# O*NET Occupations

This directory contains ${occupations.length} occupation definitions from the O*NET database.

## Data Source

- **Source:** O*NET Online (onetcenter.org)
- **Version:** ${version.replace('_', '.')}
- **Imported:** ${new Date().toISOString()}
- **Count:** ${occupations.length} occupations

## Schema

Each occupation includes:
- \`socCode\`: O*NET-SOC Code (unique identifier)
- \`title\`: Occupation title
- \`description\`: Occupation description
- \`taskCount\`: Number of related tasks
- \`skillCount\`: Number of required skills

## Relationships

Occupations are related to:
- **Tasks:** Each occupation has multiple task statements
- **Skills:** Each occupation requires multiple skills
- **Industries:** Occupations can be grouped by industry (NAICS codes)

## Example Relationships

\`\`\`typescript
// O*NET-SOC Code → Occupations (one-to-one)
const occupation = occupations.find(o => o.socCode === '15-1252.00')

// Occupation → Tasks (one-to-many)
const tasks = allTasks.filter(t => t.socCode === occupation.socCode)

// Occupation → Skills (one-to-many)
const skills = allSkills.filter(s => s.socCode === occupation.socCode)
\`\`\`
`

  await fs.writeFile(path.join(outputDir, 'README.md'), readme, 'utf-8')

  // Write each occupation as MDX file
  const slugger = new GithubSlugger()
  let written = 0

  for (const occupation of occupations) {
    const slug = slugger.slug(occupation.Title)
    const filename = `${slug}.mdx`
    const filepath = path.join(outputDir, filename)
    const mdx = occupationToMDX(occupation, tasks, skills)

    await fs.writeFile(filepath, mdx, 'utf-8')
    written++

    if (written % 100 === 0) {
      console.log(`  Written ${written}/${occupations.length} occupations...`)
    }
  }

  console.log(`✅ Imported ${written} O*NET occupations to ${outputDir}`)
}
