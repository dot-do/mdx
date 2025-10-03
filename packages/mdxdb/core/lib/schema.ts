import { parse } from 'yaml'
import { promises as fs } from 'fs'
import path from 'path'

/**
 * Payload CMS field type definitions
 * Based on https://payloadcms.com/docs/fields/overview
 */
export type PayloadFieldType =
  | 'text'
  | 'textarea'
  | 'email'
  | 'number'
  | 'checkbox'
  | 'date'
  | 'richText'
  | 'relationship'
  | 'upload'
  | 'select'
  | 'array'
  | 'blocks'
  | 'group'
  | 'row'
  | 'collapsible'
  | 'tabs'
  | 'point'
  | 'radio'
  | 'code'
  | 'json'

/**
 * Base field configuration shared by all field types
 */
export interface BaseField {
  name: string
  type: PayloadFieldType
  label?: string
  required?: boolean
  admin?: {
    description?: string
    condition?: any
    components?: any
  }
  access?: any
  hooks?: any
  defaultValue?: any
}

/**
 * Text field configuration
 */
export interface TextField extends BaseField {
  type: 'text' | 'textarea' | 'email'
  minLength?: number
  maxLength?: number
  hasMany?: boolean
}

/**
 * Number field configuration
 */
export interface NumberField extends BaseField {
  type: 'number'
  min?: number
  max?: number
  hasMany?: boolean
}

/**
 * Checkbox field configuration
 */
export interface CheckboxField extends BaseField {
  type: 'checkbox'
}

/**
 * Date field configuration
 */
export interface DateField extends BaseField {
  type: 'date'
  admin?: {
    date?: {
      displayFormat?: string
      pickerAppearance?: 'default' | 'dayAndTime' | 'timeOnly' | 'monthOnly'
    }
  } & BaseField['admin']
}

/**
 * Rich text field configuration
 */
export interface RichTextField extends BaseField {
  type: 'richText'
  editor?: any
}

/**
 * Relationship field configuration
 */
export interface RelationshipField extends BaseField {
  type: 'relationship'
  relationTo: string | string[]
  hasMany?: boolean
  max?: number
}

/**
 * Select field configuration
 */
export interface SelectField extends BaseField {
  type: 'select'
  options: Array<{ label: string; value: string }>
  hasMany?: boolean
}

/**
 * Array field configuration
 */
export interface ArrayField extends BaseField {
  type: 'array'
  fields: PayloadField[]
  minRows?: number
  maxRows?: number
}

/**
 * Group field configuration
 */
export interface GroupField extends BaseField {
  type: 'group'
  fields: PayloadField[]
}

/**
 * Union type for all Payload field types
 */
export type PayloadField =
  | TextField
  | NumberField
  | CheckboxField
  | DateField
  | RichTextField
  | RelationshipField
  | SelectField
  | ArrayField
  | GroupField
  | BaseField

/**
 * Collection schema definition
 */
export interface CollectionSchema {
  name: string
  fields: PayloadField[]
  slug?: string
  labels?: {
    singular?: string
    plural?: string
  }
  admin?: {
    useAsTitle?: string
    defaultColumns?: string[]
    description?: string
  }
  access?: any
  hooks?: any
  timestamps?: boolean
}

/**
 * YAML schema format (simplified version for mdxdb)
 */
export interface YamlSchemaDefinition {
  name: string
  slug?: string
  fields: Record<string, string | YamlFieldDefinition>
  labels?: {
    singular?: string
    plural?: string
  }
  admin?: {
    useAsTitle?: string
    defaultColumns?: string[]
    description?: string
  }
}

/**
 * YAML field definition (simplified)
 */
export interface YamlFieldDefinition {
  type: PayloadFieldType
  label?: string
  required?: boolean
  description?: string
  options?: Array<{ label: string; value: string }> | string[]
  relationTo?: string | string[]
  hasMany?: boolean
  min?: number
  max?: number
  minLength?: number
  maxLength?: number
  fields?: Record<string, string | YamlFieldDefinition>
  defaultValue?: any
}

/**
 * Parse a YAML schema definition into a Payload-compatible schema
 * @param yamlContent YAML content to parse
 * @returns Payload collection schema
 */
export function parseYamlSchema(yamlContent: string): CollectionSchema {
  const yamlData = parse(yamlContent) as YamlSchemaDefinition

  if (!yamlData || typeof yamlData !== 'object') {
    throw new Error('Invalid YAML schema: must be an object')
  }

  if (!yamlData.name) {
    throw new Error('Invalid YAML schema: missing required field "name"')
  }

  if (!yamlData.fields || typeof yamlData.fields !== 'object') {
    throw new Error('Invalid YAML schema: missing required field "fields"')
  }

  const fields = parseFields(yamlData.fields)

  return {
    name: yamlData.name,
    slug: yamlData.slug || yamlData.name.toLowerCase().replace(/\s+/g, '-'),
    fields,
    labels: yamlData.labels,
    admin: yamlData.admin,
    timestamps: true,
  }
}

/**
 * Parse field definitions from YAML format
 * @param fieldsObj YAML fields object
 * @returns Array of Payload fields
 */
function parseFields(fieldsObj: Record<string, string | YamlFieldDefinition>): PayloadField[] {
  const fields: PayloadField[] = []

  for (const [fieldName, fieldDef] of Object.entries(fieldsObj)) {
    if (typeof fieldDef === 'string') {
      // Simple string description, infer type
      fields.push(parseSimpleField(fieldName, fieldDef))
    } else if (typeof fieldDef === 'object') {
      // Full field definition
      fields.push(parseComplexField(fieldName, fieldDef))
    }
  }

  return fields
}

/**
 * Parse a simple field from a string description
 * Format: "Description (type)" or "Description" (defaults to text)
 * @param name Field name
 * @param description Field description string
 * @returns Payload field
 */
function parseSimpleField(name: string, description: string): PayloadField {
  // Check for type annotation: "Description (type)"
  const typeMatch = description.match(/\(([^)]+)\)$/)
  let type: PayloadFieldType = 'text'
  let label = description

  if (typeMatch) {
    const typeAnnotation = typeMatch[1].toLowerCase()
    label = description.replace(/\([^)]+\)$/, '').trim()

    // Check for enum values (e.g., "Status (draft|published|archived)")
    if (typeAnnotation.includes('|')) {
      const options = typeAnnotation.split('|').map((v) => v.trim())
      return {
        name,
        type: 'select',
        label,
        options: options.map((opt) => ({ label: opt, value: opt })),
        admin: {
          description: label,
        },
      } as SelectField
    }

    // Map type annotations to Payload field types
    switch (typeAnnotation) {
      case 'text':
      case 'string':
        type = 'text'
        break
      case 'textarea':
        type = 'textarea'
        break
      case 'email':
        type = 'email'
        break
      case 'number':
      case 'num':
        type = 'number'
        break
      case 'checkbox':
      case 'bool':
      case 'boolean':
        type = 'checkbox'
        break
      case 'date':
      case 'datetime':
        type = 'date'
        break
      case 'richtext':
      case 'rich-text':
        type = 'richText'
        break
      case 'relationship':
      case 'relation':
        type = 'relationship'
        break
      case 'select':
        type = 'select'
        break
      case 'array':
        type = 'array'
        break
      case 'group':
        type = 'group'
        break
      case 'code':
        type = 'code'
        break
      case 'json':
        type = 'json'
        break
      default:
        console.warn(`Unknown field type "${typeAnnotation}" for field "${name}", defaulting to text`)
        type = 'text'
    }
  }

  return {
    name,
    type,
    label,
    admin: {
      description: label,
    },
  } as PayloadField
}

/**
 * Parse a complex field from a full definition
 * @param name Field name
 * @param def Field definition object
 * @returns Payload field
 */
function parseComplexField(name: string, def: YamlFieldDefinition): PayloadField {
  const baseField: BaseField = {
    name,
    type: def.type || 'text',
    label: def.label,
    required: def.required,
    defaultValue: def.defaultValue,
    admin: def.description
      ? {
          description: def.description,
        }
      : undefined,
  }

  // Handle specific field types
  switch (def.type) {
    case 'text':
    case 'textarea':
    case 'email':
      return {
        ...baseField,
        minLength: def.minLength,
        maxLength: def.maxLength,
        hasMany: def.hasMany,
      } as TextField

    case 'number':
      return {
        ...baseField,
        min: def.min,
        max: def.max,
        hasMany: def.hasMany,
      } as NumberField

    case 'checkbox':
      return baseField as CheckboxField

    case 'date':
      return baseField as DateField

    case 'richText':
      return baseField as RichTextField

    case 'relationship':
      return {
        ...baseField,
        relationTo: def.relationTo || '',
        hasMany: def.hasMany,
        max: def.max,
      } as RelationshipField

    case 'select':
      let options: Array<{ label: string; value: string }> = []
      if (def.options) {
        if (Array.isArray(def.options)) {
          if (typeof def.options[0] === 'string') {
            // Simple string array
            options = (def.options as string[]).map((opt) => ({ label: opt, value: opt }))
          } else {
            // Already in the right format
            options = def.options as Array<{ label: string; value: string }>
          }
        }
      }
      return {
        ...baseField,
        options,
        hasMany: def.hasMany,
      } as SelectField

    case 'array':
      return {
        ...baseField,
        fields: def.fields ? parseFields(def.fields) : [],
        minRows: def.min,
        maxRows: def.max,
      } as ArrayField

    case 'group':
      return {
        ...baseField,
        fields: def.fields ? parseFields(def.fields) : [],
      } as GroupField

    default:
      return baseField
  }
}

/**
 * Load and parse a YAML schema file
 * @param filePath Path to YAML schema file
 * @returns Payload collection schema
 */
export async function loadYamlSchema(filePath: string): Promise<CollectionSchema> {
  const content = await fs.readFile(filePath, 'utf-8')
  return parseYamlSchema(content)
}

/**
 * Load all YAML schemas from a directory
 * @param dirPath Directory containing YAML schema files
 * @returns Array of Payload collection schemas
 */
export async function loadYamlSchemas(dirPath: string): Promise<CollectionSchema[]> {
  const schemas: CollectionSchema[] = []

  try {
    const files = await fs.readdir(dirPath)
    const yamlFiles = files.filter((file) => file.endsWith('.yaml') || file.endsWith('.yml'))

    for (const file of yamlFiles) {
      const filePath = path.join(dirPath, file)
      try {
        const schema = await loadYamlSchema(filePath)
        schemas.push(schema)
      } catch (error) {
        console.warn(`Failed to load schema from ${file}:`, error)
      }
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      console.error('Error loading YAML schemas:', error)
    }
  }

  return schemas
}

/**
 * Convert a Payload schema to Velite schema format
 * This is a simplified conversion that creates basic Velite schemas
 * @param schema Payload collection schema
 * @returns Velite-compatible schema object
 */
export function payloadToVeliteSchema(schema: CollectionSchema): any {
  // For now, return a simple object that Velite can work with
  // In a full implementation, this would use Velite's schema builder (s.object, s.string, etc.)
  const veliteFields: Record<string, any> = {}

  for (const field of schema.fields) {
    veliteFields[field.name] = {
      type: field.type,
      required: field.required || false,
      description: field.admin?.description,
    }
  }

  return veliteFields
}

/**
 * Validate data against a Payload schema
 * @param data Data to validate
 * @param schema Schema to validate against
 * @returns Validation result with errors if any
 */
export function validateAgainstSchema(
  data: Record<string, any>,
  schema: CollectionSchema,
): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  for (const field of schema.fields) {
    const value = data[field.name]

    // Check required fields
    if (field.required && (value === undefined || value === null || value === '')) {
      errors.push(`Field "${field.name}" is required`)
      continue
    }

    // Skip validation if field is not present and not required
    if (value === undefined || value === null) {
      continue
    }

    // Type-specific validation
    switch (field.type) {
      case 'text':
      case 'textarea':
      case 'email':
        if (typeof value !== 'string') {
          errors.push(`Field "${field.name}" must be a string`)
        } else {
          const textField = field as TextField
          if (textField.minLength !== undefined && value.length < textField.minLength) {
            errors.push(`Field "${field.name}" must be at least ${textField.minLength} characters`)
          }
          if (textField.maxLength !== undefined && value.length > textField.maxLength) {
            errors.push(`Field "${field.name}" must be at most ${textField.maxLength} characters`)
          }
          if (field.type === 'email' && !isValidEmail(value)) {
            errors.push(`Field "${field.name}" must be a valid email address`)
          }
        }
        break

      case 'number':
        if (typeof value !== 'number') {
          errors.push(`Field "${field.name}" must be a number`)
        } else {
          const numberField = field as NumberField
          if (numberField.min !== undefined && value < numberField.min) {
            errors.push(`Field "${field.name}" must be at least ${numberField.min}`)
          }
          if (numberField.max !== undefined && value > numberField.max) {
            errors.push(`Field "${field.name}" must be at most ${numberField.max}`)
          }
        }
        break

      case 'checkbox':
        if (typeof value !== 'boolean') {
          errors.push(`Field "${field.name}" must be a boolean`)
        }
        break

      case 'date':
        if (!(value instanceof Date) && !isValidDateString(value)) {
          errors.push(`Field "${field.name}" must be a valid date`)
        }
        break

      case 'select':
        const selectField = field as SelectField
        if (selectField.hasMany) {
          if (!Array.isArray(value)) {
            errors.push(`Field "${field.name}" must be an array`)
          } else {
            const validValues = selectField.options.map((opt) => opt.value)
            for (const val of value) {
              if (!validValues.includes(val)) {
                errors.push(`Field "${field.name}" contains invalid value "${val}"`)
              }
            }
          }
        } else {
          const validValues = selectField.options.map((opt) => opt.value)
          if (!validValues.includes(value)) {
            errors.push(`Field "${field.name}" must be one of: ${validValues.join(', ')}`)
          }
        }
        break

      case 'relationship':
        const relationField = field as RelationshipField
        if (relationField.hasMany) {
          if (!Array.isArray(value)) {
            errors.push(`Field "${field.name}" must be an array`)
          } else if (relationField.max !== undefined && value.length > relationField.max) {
            errors.push(`Field "${field.name}" cannot have more than ${relationField.max} items`)
          }
        }
        break

      case 'array':
        if (!Array.isArray(value)) {
          errors.push(`Field "${field.name}" must be an array`)
        } else {
          const arrayField = field as ArrayField
          if (arrayField.minRows !== undefined && value.length < arrayField.minRows) {
            errors.push(`Field "${field.name}" must have at least ${arrayField.minRows} items`)
          }
          if (arrayField.maxRows !== undefined && value.length > arrayField.maxRows) {
            errors.push(`Field "${field.name}" must have at most ${arrayField.maxRows} items`)
          }
        }
        break

      case 'group':
        if (typeof value !== 'object' || Array.isArray(value)) {
          errors.push(`Field "${field.name}" must be an object`)
        }
        break
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Simple email validation
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Check if a string is a valid date
 */
function isValidDateString(dateStr: string): boolean {
  const date = new Date(dateStr)
  return !isNaN(date.getTime())
}
