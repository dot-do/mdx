import type { FeaturesSectionProps, Feature } from '@mdxui/types'
import type { MDXNode } from '../utils/types.js'
import { isHeading, isParagraph, getHeadingDepth } from '../utils/types.js'
import { extractText } from './text.js'

/**
 * Extract features section props from MDX nodes
 */
export function extractFeaturesProps(nodes: MDXNode[]): Partial<FeaturesSectionProps> {
  const props: Partial<FeaturesSectionProps> = {
    features: [],
  }

  // Find section title (first h2)
  const titleNode = nodes.find(n => getHeadingDepth(n) === 2)
  if (titleNode) {
    props.title = extractText(titleNode)
  }

  // Find features (h3 headings with following paragraphs)
  const features: Feature[] = []

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    if (!node) continue

    // Look for h3 as feature title
    if (getHeadingDepth(node) === 3) {
      const title = extractText(node)

      // Find description (next paragraph)
      let description = ''
      if (i + 1 < nodes.length) {
        const nextNode = nodes[i + 1]
        if (nextNode && isParagraph(nextNode)) {
          description = extractText(nextNode)
        }
      }

      if (title) {
        features.push({
          title,
          description,
        })
      }
    }
  }

  if (features.length > 0) {
    props.features = features
  }

  return props
}
