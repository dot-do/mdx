import type { HeroSectionProps } from '@mdxui/types'
import type { MDXNode } from '../utils/types.js'
import { isHeading, isParagraph, isImage, getHeadingDepth } from '../utils/types.js'
import { extractText } from './text.js'

/**
 * Extract hero section props from MDX nodes
 */
export function extractHeroProps(nodes: MDXNode[]): Partial<HeroSectionProps> {
  const props: Partial<HeroSectionProps> = {}

  // Find headline (first h1 or h2)
  const headlineNode = nodes.find(n => {
    const depth = getHeadingDepth(n)
    return depth === 1 || depth === 2
  })

  if (headlineNode) {
    props.headline = extractText(headlineNode)
  }

  // Find description (first paragraph after headline)
  const headlineIndex = headlineNode ? nodes.indexOf(headlineNode) : -1
  const descriptionNode = nodes.slice(headlineIndex + 1).find(isParagraph)

  if (descriptionNode) {
    props.description = extractText(descriptionNode)
  }

  // Find first image
  const imageNode = nodes.find(isImage)
  if (imageNode && imageNode.props) {
    props.media = {
      src: imageNode.props.src,
      alt: imageNode.props.alt || '',
      type: 'image',
    }
  }

  return props
}
