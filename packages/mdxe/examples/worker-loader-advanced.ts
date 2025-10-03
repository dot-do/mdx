/**
 * Advanced Worker Loader Examples
 *
 * Demonstrates real-world use cases for Worker Loader with MDX evaluation:
 * - Dynamic MDX rendering with data
 * - Plugin system with isolated execution
 * - User-generated content evaluation
 * - Multi-tenant code execution
 */

import { MdxEvaluator, createDbContext, createReadOnlyDbContext } from '../src/core/index.js'

/**
 * Example 1: Dynamic MDX rendering with data injection
 */
export async function example1_dynamicMdxRendering(loaderBinding: any) {
  console.log('Example 1: Dynamic MDX Rendering with Data Injection')
  console.log('=' .repeat(60))

  const evaluator = new MdxEvaluator(loaderBinding)

  // MDX template with data placeholders
  const mdxTemplate = `
# User Profile: {user.name}

**Email:** {user.email}
**Role:** {user.role}
**Member Since:** {new Date(user.joinedAt).toLocaleDateString()}

## Recent Activity

{user.activities.map(activity => \`- \${activity}\`).join('\\n')}
  `

  const userData = {
    name: 'Alice Johnson',
    email: 'alice@example.com',
    role: 'Senior Developer',
    joinedAt: '2023-01-15',
    activities: ['Reviewed 5 pull requests', 'Committed 12 changes', 'Created 3 issues'],
  }

  const code = `
    const user = ${JSON.stringify(userData)};

    // Process MDX template
    const template = ${JSON.stringify(mdxTemplate)};
    const rendered = template.replace(/\\{([^}]+)\\}/g, (match, expr) => {
      try {
        return eval(expr);
      } catch {
        return match;
      }
    });

    console.log('Rendered MDX:', rendered);
    return rendered;
  `

  const result = await evaluator.evaluateJavaScript(code)

  console.log('Success:', result.success)
  console.log('Rendered Output:')
  console.log(result.result)
  console.log()
}

/**
 * Example 2: Plugin system with isolated execution
 */
export async function example2_pluginSystem(loaderBinding: any) {
  console.log('Example 2: Plugin System with Isolated Execution')
  console.log('=' .repeat(60))

  const evaluator = new MdxEvaluator(loaderBinding)

  // Plugin code (from untrusted source)
  const pluginCode = `
    export function transform(content) {
      // Add syntax highlighting classes
      return content.replace(
        /<code>(.*?)<\\/code>/g,
        '<code class="highlight">$1</code>'
      );
    }

    export function validate(content) {
      // Check for required sections
      const hasTitle = content.includes('# ');
      const hasDescription = content.includes('## Description');
      return { valid: hasTitle && hasDescription, hasTitle, hasDescription };
    }
  `

  const wrappedCode = `
    ${pluginCode}

    const content = \`
# My Document

## Description

This is a sample document with <code>inline code</code>.
    \`;

    const transformed = transform(content);
    const validation = validate(content);

    console.log('Validation:', validation);
    return { transformed, validation };
  `

  const result = await evaluator.evaluateJavaScript(wrappedCode, {
    security: {
      cpuLimit: 500, // Limit plugin execution time
      memoryLimit: 64, // Limit memory usage
    },
  })

  console.log('Success:', result.success)
  console.log('Plugin Result:', result.result)
  console.log('Duration:', result.duration, 'ms')
  console.log()
}

/**
 * Example 3: User-generated content evaluation (safe sandbox)
 */
export async function example3_userGeneratedContent(loaderBinding: any) {
  console.log('Example 3: User-Generated Content Evaluation')
  console.log('=' .repeat(60))

  const evaluator = new MdxEvaluator(loaderBinding)

  // User-submitted code (untrusted)
  const userCode = `
    // Calculate Fibonacci sequence
    function fibonacci(n) {
      if (n <= 1) return n;
      return fibonacci(n - 1) + fibonacci(n - 2);
    }

    const result = [];
    for (let i = 0; i < 10; i++) {
      result.push(fibonacci(i));
    }

    console.log('Fibonacci sequence:', result);
    return result;
  `

  const result = await evaluator.evaluateJavaScript(userCode, {
    timeout: 3000, // 3 second timeout
    security: {
      cpuLimit: 2000, // 2 second CPU limit
      blockNetwork: true, // Block all network access
    },
  })

  console.log('Success:', result.success)
  console.log('Result:', result.result)
  console.log('Console Outputs:', result.outputs?.length)
  console.log()
}

/**
 * Example 4: Multi-tenant code execution with database isolation
 */
export async function example4_multiTenantExecution(loaderBinding: any) {
  console.log('Example 4: Multi-Tenant Code Execution')
  console.log('=' .repeat(60))

  const evaluator = new MdxEvaluator(loaderBinding)

  // Tenant-specific database contexts
  const tenant1Db = await createReadOnlyDbContext({
    implementation: 'fs',
    root: '/path/to/tenant1/data',
  })

  const tenant2Db = await createReadOnlyDbContext({
    implementation: 'fs',
    root: '/path/to/tenant2/data',
  })

  // Shared code executed for both tenants
  const sharedCode = `
    // This code runs in isolated context per tenant
    const posts = db.list('posts');
    const authors = db.list('authors');

    const stats = {
      totalPosts: posts.length,
      totalAuthors: authors.length,
      tenant: tenantId
    };

    console.log('Stats for tenant:', tenantId, stats);
    return stats;
  `

  // Execute for Tenant 1
  const result1 = await evaluator.evaluateJavaScript(sharedCode, {
    db: tenant1Db,
    bindings: { tenantId: 'tenant-1' },
    workerId: 'tenant-1-worker', // Separate worker per tenant
  })

  // Execute for Tenant 2
  const result2 = await evaluator.evaluateJavaScript(sharedCode, {
    db: tenant2Db,
    bindings: { tenantId: 'tenant-2' },
    workerId: 'tenant-2-worker', // Separate worker per tenant
  })

  console.log('Tenant 1 Stats:', result1.result)
  console.log('Tenant 2 Stats:', result2.result)
  console.log()
}

/**
 * Example 5: Real-time MDX compilation with caching
 */
export async function example5_realtimeMdxCompilation(loaderBinding: any) {
  console.log('Example 5: Real-time MDX Compilation with Caching')
  console.log('=' .repeat(60))

  const evaluator = new MdxEvaluator(loaderBinding)

  const mdxContent = `
---
title: Dynamic Blog Post
author: Alice
tags: [mdx, cloudflare, workers]
---

# {frontmatter.title}

by **{frontmatter.author}**

This is a blog post compiled in real-time using MDX and Worker Loader.

## Features

- Real-time compilation
- Secure execution
- Database integration
- Fast performance

\`\`\`typescript
console.log('Code executed in MDX!');
\`\`\`
  `

  const result = await evaluator.evaluateMdx(mdxContent, {
    compileMdx: true,
    workerId: 'mdx-compiler-cached', // Reuse worker for subsequent compilations
  })

  console.log('Success:', result.success)
  console.log('Compilation Duration:', result.duration, 'ms')
  console.log()
}

/**
 * Example 6: Dynamic imports with security controls
 */
export async function example6_dynamicImports(loaderBinding: any) {
  console.log('Example 6: Dynamic Imports with Security Controls')
  console.log('=' .repeat(60))

  const evaluator = new MdxEvaluator(loaderBinding)

  // Code with dynamic imports
  const code = `
    // Allowed: Import from trusted modules
    const utils = await import('./utils.js');

    // Process data using imported utilities
    const data = [1, 2, 3, 4, 5];
    const result = data.map(x => x * 2);

    console.log('Processed data:', result);
    return result;
  `

  const result = await evaluator.evaluateJavaScript(code, {
    security: {
      // In production, you would configure allowed imports
      allowedDomains: ['trusted-cdn.example.com'],
    },
  })

  console.log('Success:', result.success)
  console.log('Result:', result.result)
  console.log()
}

/**
 * Example 7: Batch evaluation with resource pooling
 */
export async function example7_batchEvaluation(loaderBinding: any) {
  console.log('Example 7: Batch Evaluation with Resource Pooling')
  console.log('=' .repeat(60))

  const evaluator = new MdxEvaluator(loaderBinding)

  const tasks = [
    { id: 'task-1', code: 'return 1 + 1;' },
    { id: 'task-2', code: 'return 2 * 2;' },
    { id: 'task-3', code: 'return 3 ** 3;' },
    { id: 'task-4', code: 'return Math.sqrt(16);' },
    { id: 'task-5', code: 'return [1, 2, 3].reduce((a, b) => a + b, 0);' },
  ]

  console.log(`Evaluating ${tasks.length} tasks in parallel...`)

  const results = await Promise.all(
    tasks.map(async (task) => {
      const result = await evaluator.evaluateJavaScript(task.code, {
        workerId: `batch-worker-${task.id}`,
      })
      return { ...task, result: result.result, duration: result.duration }
    }),
  )

  console.log('Batch Results:')
  results.forEach((r) => {
    console.log(`  ${r.id}: ${r.result} (${r.duration}ms)`)
  })
  console.log()
}

/**
 * Main example runner
 */
export default async function runAdvancedExamples(loaderBinding: any) {
  console.log('Advanced Worker Loader Examples for mdxe')
  console.log('='.repeat(60))
  console.log()

  await example1_dynamicMdxRendering(loaderBinding)
  await example2_pluginSystem(loaderBinding)
  await example3_userGeneratedContent(loaderBinding)
  await example4_multiTenantExecution(loaderBinding)
  await example5_realtimeMdxCompilation(loaderBinding)
  await example6_dynamicImports(loaderBinding)
  await example7_batchEvaluation(loaderBinding)

  console.log('All advanced examples completed!')
}
