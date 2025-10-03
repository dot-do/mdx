/**
 * Basic Worker Loader Example
 *
 * Demonstrates how to use Worker Loader for safe MDX/JS/TS evaluation
 * in Cloudflare Workers environment.
 */

import { MdxEvaluator, createDbContext } from '../src/core/index.js'

/**
 * Example 1: Basic JavaScript evaluation
 */
export async function example1_basicJavaScript(loaderBinding: any) {
  console.log('Example 1: Basic JavaScript Evaluation')
  console.log('=' .repeat(50))

  const evaluator = new MdxEvaluator(loaderBinding)

  const code = `
    const x = 10;
    const y = 20;
    console.log('Calculating sum...');
    return x + y;
  `

  const result = await evaluator.evaluateJavaScript(code)

  console.log('Success:', result.success)
  console.log('Result:', result.result)
  console.log('Duration:', result.duration, 'ms')
  console.log('Outputs:', result.outputs)
  console.log()
}

/**
 * Example 2: TypeScript evaluation
 */
export async function example2_typeScript(loaderBinding: any) {
  console.log('Example 2: TypeScript Evaluation')
  console.log('=' .repeat(50))

  const evaluator = new MdxEvaluator(loaderBinding)

  const code = `
    interface Person {
      name: string;
      age: number;
    }

    const person: Person = {
      name: 'Alice',
      age: 30
    };

    console.log('Person:', person.name);
    return person;
  `

  const result = await evaluator.evaluateTypeScript(code)

  console.log('Success:', result.success)
  console.log('Result:', result.result)
  console.log('Duration:', result.duration, 'ms')
  console.log()
}

/**
 * Example 3: MDX evaluation
 */
export async function example3_mdx(loaderBinding: any) {
  console.log('Example 3: MDX Evaluation')
  console.log('=' .repeat(50))

  const evaluator = new MdxEvaluator(loaderBinding)

  const mdx = `
# Hello MDX

This is a **markdown** document with _formatting_.

\`\`\`typescript
console.log('Code block in MDX');
\`\`\`
  `

  const result = await evaluator.evaluateMdx(mdx)

  console.log('Success:', result.success)
  console.log('Duration:', result.duration, 'ms')
  console.log()
}

/**
 * Example 4: Evaluation with database context
 */
export async function example4_withDatabase(loaderBinding: any) {
  console.log('Example 4: Evaluation with Database Context')
  console.log('=' .repeat(50))

  const evaluator = new MdxEvaluator(loaderBinding)

  // Create database context
  const dbContext = await createDbContext({
    implementation: 'fs',
    root: process.cwd(),
  })

  const code = `
    // Access database in evaluated code
    const docs = db.list('posts');
    console.log('Found documents:', docs.length);

    const firstDoc = db.get('welcome');
    console.log('First doc:', firstDoc?.title);

    return { docsCount: docs.length, firstDoc };
  `

  const result = await evaluator.evaluateJavaScript(code, {
    db: dbContext,
  })

  console.log('Success:', result.success)
  console.log('Result:', result.result)
  console.log('Duration:', result.duration, 'ms')
  console.log()
}

/**
 * Example 5: Secure evaluation with timeouts
 */
export async function example5_secureEvaluation(loaderBinding: any) {
  console.log('Example 5: Secure Evaluation with Timeout')
  console.log('=' .repeat(50))

  const evaluator = new MdxEvaluator(loaderBinding)

  // Intentionally slow code
  const code = `
    let sum = 0;
    for (let i = 0; i < 1000000; i++) {
      sum += i;
    }
    return sum;
  `

  const result = await evaluator.evaluateJavaScript(code, {
    timeout: 2000, // 2 second timeout
    security: {
      cpuLimit: 1000, // 1 second CPU limit
      memoryLimit: 128, // 128MB memory limit
    },
  })

  console.log('Success:', result.success)
  if (result.success) {
    console.log('Result:', result.result)
  } else {
    console.log('Error:', result.error)
  }
  console.log('Duration:', result.duration, 'ms')
  console.log()
}

/**
 * Example 6: Error handling
 */
export async function example6_errorHandling(loaderBinding: any) {
  console.log('Example 6: Error Handling')
  console.log('=' .repeat(50))

  const evaluator = new MdxEvaluator(loaderBinding)

  // Code with intentional error
  const code = `
    const x = 10;
    throw new Error('Intentional error for testing');
    return x;
  `

  const result = await evaluator.evaluateJavaScript(code)

  console.log('Success:', result.success)
  console.log('Error:', result.error)
  console.log('Duration:', result.duration, 'ms')
  console.log()
}

/**
 * Example 7: Custom bindings
 */
export async function example7_customBindings(loaderBinding: any) {
  console.log('Example 7: Custom Bindings')
  console.log('=' .repeat(50))

  const evaluator = new MdxEvaluator(loaderBinding)

  const code = `
    console.log('API Key:', apiKey);
    console.log('User:', user.name);

    return {
      message: 'Hello ' + user.name,
      timestamp: Date.now()
    };
  `

  const result = await evaluator.evaluateJavaScript(code, {
    bindings: {
      apiKey: 'secret-key-123',
      user: { name: 'Alice', role: 'admin' },
    },
  })

  console.log('Success:', result.success)
  console.log('Result:', result.result)
  console.log('Duration:', result.duration, 'ms')
  console.log()
}

/**
 * Main example runner
 */
export default async function runExamples(loaderBinding: any) {
  console.log('Worker Loader Examples for mdxe')
  console.log('='.repeat(50))
  console.log()

  await example1_basicJavaScript(loaderBinding)
  await example2_typeScript(loaderBinding)
  await example3_mdx(loaderBinding)
  await example4_withDatabase(loaderBinding)
  await example5_secureEvaluation(loaderBinding)
  await example6_errorHandling(loaderBinding)
  await example7_customBindings(loaderBinding)

  console.log('All examples completed!')
}
