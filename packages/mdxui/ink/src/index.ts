// Core functionality
export * from './core/index.js'

// Component system
export * from './component-system/index.js'

// Components organized by category
export * from './components/base/index.js'
export * from './components/layout/index.js'
export * from './components/interactive/index.js'
export * from './components/media/index.js'
export * from './components/specialized/index.js'

// Workflow system
export * from './workflow/index.js'

// CLI functionality
export * from './cli/commands/render.js'

// Utilities
export * from './utils/index.js'

// Backward compatibility exports
import { Text } from './components/base/Text.js'
import { PastelBox } from './components/base/Box.js'
import { Markdown } from './components/base/Markdown.js'
import { Ascii } from './components/base/Ascii.js'
import { Image } from './components/media/Image.js'
import { Icon } from './components/media/Icon.js'
import { Slides } from './components/layout/Slides.js'
import { Slide } from './components/layout/Slide.js'
import { Button } from './components/interactive/Button.js'
import { Card } from './components/layout/Card.js'
import { InkMDXRenderer } from './components/specialized/InkMDXRenderer.js'
import { renderMdxCli } from './cli/commands/render.js'

// Default export for backward compatibility
const Ink = {
  // Core components
  Text,
  Box: PastelBox,
  Markdown,
  Ascii,
  Image,
  Icon,

  // Layout components
  Slides,
  Slide,
  Card,

  // Interactive components
  Button,

  // Specialized components
  InkMDXRenderer,

  // Core functionality
  renderMdxCli,
}

export default Ink

// Named exports for common components (backward compatibility)
export { Text, PastelBox as Box, Markdown, Ascii, Image, Icon, Slides, Slide, Button, Card, InkMDXRenderer, renderMdxCli }
