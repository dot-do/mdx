# tweakcn Example Configurations

This directory contains example YAML configurations for the tweakcn styling system.

## Available Examples

### 1. minimal.yaml
Minimal, clean configuration for simple websites and documentation.
- **Colors:** Black and white with subtle grays
- **Fonts:** System fonts
- **Best for:** Simple landing pages, minimal documentation

### 2. modern.yaml
Vibrant, modern design with smooth transitions and glassmorphism.
- **Colors:** Blue, purple, and pink accents
- **Fonts:** Inter (body), Poppins (headings)
- **Best for:** Modern web apps, marketing sites, portfolios

### 3. docs.yaml
Technical documentation optimized for API references and guides.
- **Colors:** Professional blues with semantic colors
- **Fonts:** Inter (body/headings), JetBrains Mono (code)
- **Best for:** Technical docs, API references, developer guides

### 4. blog.yaml
Elegant reading experience for long-form content.
- **Colors:** Sky blue with purple and pink accents
- **Fonts:** Georgia (body), Inter (headings)
- **Best for:** Blogs, articles, magazines, long-form content

### 5. dark-mode.yaml
Beautiful dark theme with high contrast and glow effects.
- **Colors:** Dark background with bright accents
- **Fonts:** Inter with JetBrains Mono
- **Best for:** Dark mode websites, developer tools, code editors

## Usage

### Basic Usage

```typescript
import { renderWithYAML } from '@mdxdb/render'
import { readFileSync } from 'fs'

// Load YAML config
const yamlConfig = readFileSync('./examples/modern.yaml', 'utf-8')

// Render MDX with config
const result = await renderWithYAML(content, yamlConfig)
console.log(result.html)
```

### Using Presets

```typescript
import { renderWithPreset } from '@mdxdb/render'

// Use built-in preset (same as YAML configs)
const result = await renderWithPreset(content, 'modern')
```

### Full Pipeline

```typescript
import { renderPipeline } from '@mdxdb/render'

const html = await renderPipeline({
  content: markdownContent,
  preset: 'docs',
  template: 'docs',
  templateOptions: {
    title: 'My Documentation',
    siteName: 'My Project',
    navigation: [
      { title: 'Getting Started', href: '/start' },
      { title: 'API Reference', href: '/api' }
    ]
  }
})
```

## Customization

You can extend or override any preset:

```yaml
# my-custom.yaml
extends: modern

theme:
  colors:
    primary: "#ff6b6b"  # Override primary color
    custom: "#4ecdc4"   # Add custom color

  components:
    heading:
      className: "font-black uppercase tracking-wider"  # Custom heading style
```

Then merge configs:

```typescript
import { parseTweakcnConfig, mergeTweakcnConfigs, loadPresetConfig } from '@mdxdb/render'

const baseConfig = loadPresetConfig('modern')
const customYaml = readFileSync('./my-custom.yaml', 'utf-8')
const customConfig = parseTweakcnConfig(customYaml)

const finalConfig = mergeTweakcnConfigs(baseConfig, customConfig)
```

## Component Variants

Many components support variants for different styles:

```yaml
components:
  button:
    className: "px-4 py-2 rounded"
    variants:
      primary: "bg-blue-500 text-white"
      secondary: "bg-gray-500 text-white"
      outline: "border-2 border-blue-500 text-blue-500"
```

```typescript
import { getComponentStyles } from '@mdxdb/render'

const styles = getComponentStyles(config, 'button', 'primary')
// Returns: "px-4 py-2 rounded bg-blue-500 text-white"
```

## Custom CSS

Add custom CSS to any configuration:

```yaml
theme:
  customCSS: |
    /* Your custom styles */
    .special-effect {
      background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
```

## Tailwind Integration

Generate Tailwind config from tweakcn config:

```typescript
import { generateTailwindConfig, exportTailwindConfigFile } from '@mdxdb/render'

const config = loadPresetConfig('modern')
const tailwindConfig = generateTailwindConfig(config)

// Export to file
const configFile = exportTailwindConfigFile(config)
writeFileSync('./tailwind.config.js', configFile)
```

## Templates

Each preset works great with specific templates:

- **minimal** → basic template
- **modern** → basic or docs template
- **docs** → docs template
- **blog** → blog template
- **dark-mode** → any template

## Tips

1. **Start with a preset** and customize incrementally
2. **Use semantic colors** (primary, secondary, muted) for consistency
3. **Test with real content** to ensure readability
4. **Combine with templates** for complete page layouts
5. **Use variants** for component-level customization

## More Examples

See the implementation plan for complete usage examples and integration patterns.
