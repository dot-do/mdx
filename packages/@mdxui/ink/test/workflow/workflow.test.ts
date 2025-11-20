import test from 'ava'
import { z } from 'zod'
import { createWorkflowFromFrontmatter, executeWorkflowStep } from '../../src/workflow/manager.js'
import type { WorkflowFrontmatter } from '../../src/workflow/types.js'

test('should create workflow from frontmatter', (t) => {
  const frontmatter: WorkflowFrontmatter = {
    workflow: {
      id: 'test-workflow',
      name: 'Test Workflow',
      description: 'A test workflow',
      steps: [
        {
          id: 'step1',
          name: 'First Step',
          input: { name: 'string' },
          output: { result: 'string' },
        },
      ],
    },
  }

  const workflow = createWorkflowFromFrontmatter(frontmatter)
  t.truthy(workflow)
  t.is(workflow!.id, 'test-workflow')
  t.is(workflow!.steps.length, 1)
  t.is(workflow!.steps[0].id, 'step1')
})

test('should execute workflow step with mock data', async (t) => {
  const step = {
    id: 'test-step',
    name: 'Test Step',
    outputSchema: z.object({ result: z.string() }),
  }

  const result = await executeWorkflowStep(step)
  t.truthy(result)
  t.is(typeof result.result, 'string')
})

test('should handle startup workflow frontmatter', (t) => {
  const startupFrontmatter: WorkflowFrontmatter = {
    workflow: {
      id: 'startup-launch',
      name: 'Startup Launch Workflow',
      steps: [
        {
          id: 'idea-input',
          name: 'Initial Idea',
          output: { idea: 'string', industry: 'string' },
        },
        {
          id: 'refine-icp',
          name: 'Define ICP',
          input: { idea: 'string', industry: 'string' },
          output: { icp_demographics: 'string', pain_points: 'array' },
        },
      ],
    },
  }

  const workflow = createWorkflowFromFrontmatter(startupFrontmatter)
  t.truthy(workflow)
  t.is(workflow!.steps.length, 2)
})
