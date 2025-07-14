// Import components directly from source files instead of packages
import { Button as CoreButton } from '../core/components/button.js'
import { Card as CoreCard } from '../core/components/card.js'

// Ink components are not available in browser environments due to esbuild dependency
// Users should import @mdxui/ink directly for CLI applications
const InkComponents = {}

// Create namespace objects with the components
const CoreComponents = {
  Button: CoreButton,
  Card: CoreCard,
}

const ShadcnComponents = {}
const MagicuiComponents = {}
const BrowserComponents = {}

export { Slides, Slide } from './slides'
export { Button } from './button'
export { Card } from './card'

export const Core = CoreComponents
export const Shadcn = ShadcnComponents
export const Ink = InkComponents
export const Magicui = MagicuiComponents
export const Browser = BrowserComponents
