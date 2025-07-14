import React from 'react'
import { Button as CoreButton } from '../core/components/button.js'

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'text'
}

export function Button(props: ButtonProps) {
  // Always use CoreButton - ink components should be imported directly from @mdxui/ink
  return <CoreButton {...props} />
}
