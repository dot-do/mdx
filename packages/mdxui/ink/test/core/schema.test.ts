import test from 'ava'
import { createSchemaFromFrontmatter } from '../../src/core/schema.js'

test('should create a zod schema from frontmatter', (t) => {
  const frontmatter = {
    input: {
      name: 'string',
      os: 'enum[Ubuntu, Debian]',
      memory: 'number',
      region: 'enum[iad,sfo,lhr]',
    },
  }

  const schema = createSchemaFromFrontmatter(frontmatter)
  t.truthy(schema)
  t.truthy(schema.inputSchema)

  const validData = {
    name: 'test-project',
    os: 'Ubuntu',
    memory: 1024,
    region: 'sfo',
  }

  const result = schema.inputSchema!.safeParse(validData)
  t.is(result.success, true)

  const invalidData = {
    name: 'test-project',
    os: 'Windows', // Invalid enum value
    memory: 1024,
    region: 'sfo',
  }

  const invalidResult = schema.inputSchema!.safeParse(invalidData)
  t.is(invalidResult.success, false)
})
