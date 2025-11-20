import React, { createElement } from 'react'

export * from './Text.js'
export * from './Box.js'
export * from './Markdown.js'
export * from './Ascii.js'
export * from './Typography.js'
export * from './Lists.js'
export * from './Code.js'
export * from './Table.js'
export * from './Link.js'

// New components moved from react-ink
export { default as Spinner } from './Spinner.js'
export { default as Indicator } from './Indicator.js'
export { default as Item } from './Item.js'

import { Text } from './Text.js'
import { PastelBox } from './Box.js'
import { H1, H2, H3, H4, H5, H6, Strong, Em, Del, Blockquote, Hr } from './Typography.js'
import { Ul, Ol, Li } from './Lists.js'
import { Code, Pre } from './Code.js'
import { TableComponent } from './Table.js'
import { A } from './Link.js'

/**
 * Get default components for MDX rendering
 */
export function getDefaultComponents() {
  return {
    Text,
    Box: PastelBox,

    h1: H1,
    h2: H2,
    h3: H3,
    h4: H4,
    h5: H5,
    h6: H6,

    strong: Strong,
    em: Em,
    del: Del,
    s: Del, // Alias for del

    ul: Ul,
    ol: Ol,
    li: Li,

    code: Code,
    pre: Pre,

    table: TableComponent,

    a: A,

    blockquote: Blockquote,
    hr: Hr,
  }
}
