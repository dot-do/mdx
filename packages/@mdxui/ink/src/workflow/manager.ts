import { z } from 'zod'
import { createZodType } from '../core/schema.js'
import type { WorkflowFrontmatter, Step, Workflow } from './types.js'

/**
 * Creates a Workflow object from MDX frontmatter
 */
export function createWorkflowFromFrontmatter(frontmatter: WorkflowFrontmatter): Workflow | null {
  if (!frontmatter.workflow) return null

  const steps: Step[] = frontmatter.workflow.steps.map((stepDef) => ({
    id: stepDef.id,
    name: stepDef.name,
    description: stepDef.description,
    inputSchema: stepDef.input ? createSchemaFromDefinition(stepDef.input) : undefined,
    outputSchema: createSchemaFromDefinition(stepDef.output),
  }))

  const inputSchema = steps[0]?.inputSchema || z.any()
  const outputSchema = steps[steps.length - 1]?.outputSchema || z.any()

  return {
    id: frontmatter.workflow.id,
    name: frontmatter.workflow.name,
    description: frontmatter.workflow.description,
    inputSchema,
    outputSchema,
    steps,
  }
}

/**
 * Creates a Zod schema from a string-based type definition
 */
function createSchemaFromDefinition(definition: Record<string, string>) {
  const schemaObj: Record<string, z.ZodTypeAny> = {}
  Object.entries(definition).forEach(([key, type]) => {
    schemaObj[key] = createZodType(type)
  })
  return z.object(schemaObj)
}

/**
 * Executes a single workflow step
 */
export async function executeWorkflowStep(step: Step, input?: any, previousResults?: Record<string, any>): Promise<any> {
  if (step.inputSchema && input !== undefined) {
    step.inputSchema.parse(input)
  }

  if (!step.execute) {
    return generateMockOutput(step.outputSchema)
  }

  const result = await step.execute(input)
  step.outputSchema.parse(result)
  return result
}

/**
 * Generates mock output data based on a Zod schema
 */
function generateMockOutput(schema: z.ZodSchema): any {
  if (schema instanceof z.ZodObject) {
    const shape = schema.shape
    const mock: Record<string, any> = {}
    Object.entries(shape).forEach(([key, fieldSchema]) => {
      if (fieldSchema instanceof z.ZodString) {
        mock[key] = `mock-${key}`
      } else if (fieldSchema instanceof z.ZodNumber) {
        mock[key] = 42
      } else if (fieldSchema instanceof z.ZodArray) {
        mock[key] = [`mock-${key}-item-1`, `mock-${key}-item-2`]
      } else {
        mock[key] = `mock-${key}`
      }
    })
    return mock
  }
  return 'mock-output'
}
