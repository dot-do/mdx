#!/usr/bin/env node
/**
 * mdxai agent CLI
 * Natural language interface to mdxdb with AI agent
 */

import { Command } from 'commander'
import { runAgent, streamAgent, MdxaiAgent } from './index.js'
import packageJson from '../../package.json' with { type: 'json' }
import * as readline from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'

const program = new Command()

program
  .name('mdxai-agent')
  .description('AI agent for MDX content generation and management')
  .version(packageJson.version)

/**
 * Run agent with a single prompt
 */
program
  .command('run <prompt>')
  .description('Run the agent with a natural language prompt')
  .option('-m, --model <model>', 'AI model to use', 'gpt-4o')
  .option('-b, --background', 'Use OpenAI background mode (50% discount)', false)
  .option('--max-steps <number>', 'Maximum tool call steps', '10')
  .option('--stream', 'Stream the response', false)
  .option('--cwd <directory>', 'Working directory', process.cwd())
  .action(async (prompt: string, options) => {
    try {
      console.log('🤖 mdxai agent\n')
      console.log(`Prompt: ${prompt}`)
      console.log(`Model: ${options.model}`)
      console.log(`Background: ${options.background ? 'YES (50% discount)' : 'no'}`)
      console.log(`Working directory: ${options.cwd}\n`)

      if (options.stream) {
        // Streaming mode
        process.stdout.write('Response: ')

        for await (const chunk of streamAgent(prompt, {
          model: options.model,
          background: options.background,
          maxSteps: parseInt(options.maxSteps, 10),
          cwd: options.cwd,
        })) {
          process.stdout.write(chunk)
        }

        process.stdout.write('\n\n')
      } else {
        // Non-streaming mode
        const result = await runAgent(prompt, {
          model: options.model,
          background: options.background,
          maxSteps: parseInt(options.maxSteps, 10),
          cwd: options.cwd,
        })

        console.log('Response:', result.text)
        console.log('\n---')
        console.log(`Tool calls: ${result.toolCalls}`)
        console.log(`Steps: ${result.steps.length}`)
        console.log(`Finish reason: ${result.finishReason}`)

        if (result.usage) {
          console.log(`Tokens: ${result.usage.totalTokens} (prompt: ${result.usage.promptTokens}, completion: ${result.usage.completionTokens})`)
        }
      }
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : String(error))
      process.exit(1)
    }
  })

/**
 * Interactive chat mode
 */
program
  .command('chat')
  .description('Start an interactive chat session with the agent')
  .option('-m, --model <model>', 'AI model to use', 'gpt-4o')
  .option('-b, --background', 'Use OpenAI background mode (50% discount)', false)
  .option('--max-steps <number>', 'Maximum tool call steps', '10')
  .option('--cwd <directory>', 'Working directory', process.cwd())
  .action(async (options) => {
    console.log('🤖 mdxai agent - Interactive Chat')
    console.log(`Model: ${options.model}`)
    console.log(`Background: ${options.background ? 'YES (50% discount)' : 'no'}`)
    console.log(`Working directory: ${options.cwd}`)
    console.log('\nType your message and press Enter. Type "exit" to quit.\n')

    const agent = new MdxaiAgent({
      model: options.model,
      background: options.background,
      maxSteps: parseInt(options.maxSteps, 10),
      cwd: options.cwd,
    })

    const rl = readline.createInterface({ input, output })

    while (true) {
      const message = await rl.question('You: ')

      if (message.toLowerCase() === 'exit') {
        console.log('\nGoodbye!')
        rl.close()
        break
      }

      if (!message.trim()) {
        continue
      }

      try {
        process.stdout.write('\nAgent: ')
        const result = await agent.send(message)
        console.log(result.text)

        if (result.toolCalls > 0) {
          console.log(`\n(Used ${result.toolCalls} tool calls)`)
        }

        console.log()
      } catch (error) {
        console.error('\nError:', error instanceof Error ? error.message : String(error))
        console.log()
      }
    }
  })

/**
 * Quick commands
 */
program
  .command('list <pattern>')
  .description('List MDX files matching a glob pattern')
  .option('--limit <number>', 'Maximum results', '20')
  .option('--cwd <directory>', 'Working directory', process.cwd())
  .action(async (pattern: string, options) => {
    const result = await runAgent(`List all files matching "${pattern}"`, {
      model: 'gpt-4o-mini', // Use cheaper model for simple operations
      cwd: options.cwd,
    })
    console.log(result.text)
  })

program
  .command('search <field> <value>')
  .description('Search MDX files by frontmatter field')
  .option('-p, --pattern <pattern>', 'Glob pattern', '**/*.mdx')
  .option('--cwd <directory>', 'Working directory', process.cwd())
  .action(async (field: string, value: string, options) => {
    const result = await runAgent(`Search for files where ${field} contains "${value}"`, {
      model: 'gpt-4o-mini',
      cwd: options.cwd,
    })
    console.log(result.text)
  })

program
  .command('generate')
  .description('Generate content for files matching a pattern')
  .requiredOption('-p, --pattern <pattern>', 'Glob pattern to match files')
  .requiredOption('--prompt <prompt>', 'Generation prompt')
  .requiredOption('-o, --output <directory>', 'Output directory')
  .option('-m, --model <model>', 'AI model to use', 'gpt-4o')
  .option('-c, --concurrency <number>', 'Concurrent generations', '25')
  .option('-b, --background', 'Use background mode (50% discount)', false)
  .option('--validate-only', 'Only validate, don\'t generate', false)
  .option('--cwd <directory>', 'Working directory', process.cwd())
  .action(async (options) => {
    const prompt = `Generate content for all files matching "${options.pattern}":
- Pattern: ${options.pattern}
- Prompt: ${options.prompt}
- Output: ${options.output}
- Model: ${options.model}
- Concurrency: ${options.concurrency}
- Background mode: ${options.background ? 'yes' : 'no'}
- Validate only: ${options.validateOnly ? 'yes' : 'no'}

Use the forEach tool to accomplish this.`

    console.log('🤖 mdxai agent - Batch Generation\n')

    const result = await runAgent(prompt, {
      model: options.model,
      background: options.background,
      maxSteps: 10,
      cwd: options.cwd,
    })

    console.log(result.text)
  })

/**
 * Examples command
 */
program
  .command('examples')
  .description('Show example commands')
  .action(() => {
    console.log(`
🤖 mdxai agent - Example Commands

1. List all MDX files:
   mdxai-agent list "**/*.mdx"

2. Search for files:
   mdxai-agent search category technology

3. Interactive chat:
   mdxai-agent chat

4. Run a single command:
   mdxai-agent run "List all occupations and generate a summary"

5. Batch generation (with 50% discount):
   mdxai-agent generate \\
     --pattern "occupations/*.mdx" \\
     --prompt "Write a blog post about {title}" \\
     --output "./blog-posts" \\
     --concurrency 25 \\
     --background

6. Natural language workflows:
   mdxai-agent run "For every occupation, generate a blog post about how AI will transform it"

7. Streaming response:
   mdxai-agent run "Generate a summary of all services" --stream

8. Validate existing files:
   mdxai-agent generate \\
     --pattern "blog-posts/*.mdx" \\
     --prompt "Validate frontmatter" \\
     --output "./validated" \\
     --validate-only

9. Complex workflow:
   mdxai-agent run "Search for all technology services, then generate API documentation for each one"

10. Background mode (50% cheaper):
    mdxai-agent run "Generate content for 1000 items" --background

Tip: Use --background flag for batch operations to get 50% cost reduction!
`)
  })

program.parse()
