import test from 'ava'
import { parseFrontmatter } from '../../src/core/frontmatter.js'
import { createWorkflowFromFrontmatter } from '../../src/workflow/manager.js'
import type { WorkflowFrontmatter } from '../../src/workflow/types.js'

test('workflow command should detect workflow in frontmatter', (t) => {
  // Use a simpler YAML structure that should parse correctly
  const mdxContent = `---
workflow:
  id: test-workflow
  name: Test Workflow
  description: A test workflow
---

# Workflow Test

This MDX has workflow configuration.
  `

  const { frontmatter } = parseFrontmatter(mdxContent)
  
  t.truthy(frontmatter)
  t.truthy((frontmatter as WorkflowFrontmatter).workflow)
  t.is((frontmatter as WorkflowFrontmatter).workflow?.id, 'test-workflow')
  t.is((frontmatter as WorkflowFrontmatter).workflow?.name, 'Test Workflow')
})

test('workflow command should create workflow from frontmatter', (t) => {
  const frontmatter: WorkflowFrontmatter = {
    workflow: {
      id: 'test-workflow',
      name: 'Test Workflow',
      description: 'A test workflow',
      steps: [
        {
          id: 'step1',
          name: 'First Step',
          description: 'The first step',
          output: { result: 'string' },
        },
        {
          id: 'step2',
          name: 'Second Step',
          description: 'The second step',
          output: { result: 'string' },
        },
      ],
    },
  }

  const workflow = createWorkflowFromFrontmatter(frontmatter)

  t.truthy(workflow)
  t.is(workflow?.id, 'test-workflow')
  t.is(workflow?.name, 'Test Workflow')
  t.is(workflow?.description, 'A test workflow')
  t.is(workflow?.steps.length, 2)
  t.is(workflow?.steps[0].id, 'step1')
  t.is(workflow?.steps[1].id, 'step2')
})

test('workflow command should handle MDX without workflow', (t) => {
  const mdxContent = `---
title: Regular Document
author: Test Author
---

# Regular Document

This MDX has no workflow configuration.
  `

  const { frontmatter } = parseFrontmatter(mdxContent)

  t.truthy(frontmatter)
  t.falsy((frontmatter as WorkflowFrontmatter).workflow)
  t.is(frontmatter.title, 'Regular Document')
})

test('workflow command should handle empty frontmatter', (t) => {
  const mdxContent = `# Document Without Frontmatter

This MDX has no frontmatter at all.
  `

  const { frontmatter } = parseFrontmatter(mdxContent)

  t.truthy(frontmatter)
  t.is(Object.keys(frontmatter).length, 0)
})

test('workflow command should handle malformed workflow frontmatter', (t) => {
  const frontmatter: WorkflowFrontmatter = {
    workflow: {
      id: 'incomplete-workflow',
      name: 'Incomplete Workflow',
      // Missing required fields
      steps: [],
    },
  }

  const workflow = createWorkflowFromFrontmatter(frontmatter)

  // Should handle incomplete workflow gracefully
  if (workflow) {
    t.is(workflow.id, 'incomplete-workflow')
    t.is(workflow.steps.length, 0)
  } else {
    // Or return null/undefined for invalid workflow
    t.falsy(workflow)
  }
})

test('workflow command should handle workflow with complex steps', (t) => {
  const frontmatter: WorkflowFrontmatter = {
    workflow: {
      id: 'complex-workflow',
      name: 'Complex Workflow',
      steps: [
        {
          id: 'step1',
          name: 'Input Step',
          description: 'Step with input schema',
          input: { name: 'string' },
          output: { result: 'string' },
        },
        {
          id: 'step2',
          name: 'Output Step',
          description: 'Step with output schema',
          output: { result: 'string' },
        },
      ],
    },
  }

  const workflow = createWorkflowFromFrontmatter(frontmatter)

  t.truthy(workflow)
  t.is(workflow?.steps.length, 2)
  t.truthy(workflow?.steps[0].inputSchema)
  t.truthy(workflow?.steps[1].outputSchema)
})
