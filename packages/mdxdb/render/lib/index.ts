/**
 * @mdxdb/render - Website rendering with tweakcn styling
 *
 * Provides MDX rendering with custom styling defined in YAML config
 */

// Export core functionality
export {
  type TweakcnConfig,
  type TweakcnTheme,
  type TweakcnColors,
  type TweakcnFonts,
  type TweakcnSpacing,
  type TweakcnComponent,
  parseTweakcnConfig,
  mergeTweakcnConfigs,
  generateTailwindCSSVariables,
  generateTailwindConfig,
  getComponentStyles,
  getComponentInlineStyles,
  DEFAULT_CONFIGS,
  loadPresetConfig,
} from './tweakcn.js'

// Export MDX rendering
export {
  type MdxRenderOptions,
  type MdxRenderResult,
  type ComponentMapping,
  renderMdx,
  renderMdxToText,
  extractMdxMetadata,
  renderMdxWithComponents,
} from './mdx.js'

// Export templates
export {
  renderBasicTemplate,
  renderDocsTemplate,
  renderBlogTemplate,
  type BasicTemplateOptions,
  type DocsTemplateOptions,
  type BlogTemplateOptions,
} from './templates/index.js'

// Convenience function for full rendering pipeline
import { renderMdx, type MdxRenderOptions, type MdxRenderResult } from './mdx.js'
import { parseTweakcnConfig, loadPresetConfig, type TweakcnConfig } from './tweakcn.js'
import { renderBasicTemplate, type BasicTemplateOptions } from './templates/basic.js'
import { renderDocsTemplate, type DocsTemplateOptions } from './templates/docs.js'
import { renderBlogTemplate, type BlogTemplateOptions } from './templates/blog.js'

/**
 * Render MDX content with a preset configuration
 */
export async function renderWithPreset(
  content: string,
  preset: 'minimal' | 'modern' | 'docs' | 'blog',
  options?: MdxRenderOptions
): Promise<MdxRenderResult> {
  const config = loadPresetConfig(preset)
  return renderMdx(content, { ...options, config })
}

/**
 * Render MDX content with YAML config
 */
export async function renderWithYAML(content: string, yamlConfig: string, options?: MdxRenderOptions): Promise<MdxRenderResult> {
  const config = parseTweakcnConfig(yamlConfig)
  return renderMdx(content, { ...options, config })
}

/**
 * Full rendering pipeline options
 */
export interface RenderPipelineOptions {
  content: string
  config?: TweakcnConfig | string // Config object or YAML string
  preset?: 'minimal' | 'modern' | 'docs' | 'blog'
  template?: 'basic' | 'docs' | 'blog'
  templateOptions?: BasicTemplateOptions | DocsTemplateOptions | BlogTemplateOptions
  renderOptions?: MdxRenderOptions
}

/**
 * Full rendering pipeline - from MDX to complete HTML
 */
export async function renderPipeline(options: RenderPipelineOptions): Promise<string> {
  const { content, config, preset, template = 'basic', templateOptions = {}, renderOptions = {} } = options

  // Determine config
  let tweakcnConfig: TweakcnConfig | undefined

  if (typeof config === 'string') {
    tweakcnConfig = parseTweakcnConfig(config)
  } else if (config) {
    tweakcnConfig = config
  } else if (preset) {
    tweakcnConfig = loadPresetConfig(preset)
  }

  // Render MDX
  const renderResult = await renderMdx(content, {
    ...renderOptions,
    config: tweakcnConfig,
  })

  // Apply template
  if (!tweakcnConfig) {
    tweakcnConfig = loadPresetConfig('minimal')
  }

  switch (template) {
    case 'docs':
      return renderDocsTemplate(renderResult, tweakcnConfig, templateOptions as DocsTemplateOptions)
    case 'blog':
      return renderBlogTemplate(renderResult, tweakcnConfig, templateOptions as BlogTemplateOptions)
    case 'basic':
    default:
      return renderBasicTemplate(renderResult, tweakcnConfig, templateOptions as BasicTemplateOptions)
  }
}
