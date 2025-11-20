import React, { Children } from 'react'
import { Text, Box } from 'ink'

/**
 * List components
 */
export function Ul({ children }: { children: React.ReactNode }) {
  return (
    <Box flexDirection='column' paddingLeft={2}>
      {children}
    </Box>
  )
}

export function Ol({ children }: { children: React.ReactNode }) {
  return (
    <Box flexDirection='column' paddingLeft={2}>
      {Children.toArray(children).map((child, index) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            ...(child.props as any),
            index: index + 1,
          })
        }
        return child
      })}
    </Box>
  )
}

export function Li({ children, index }: { children: React.ReactNode; index?: number }) {
  const childArray = Children.toArray(children)
  if (childArray[0] && React.isValidElement(childArray[0]) && childArray[0].props) {
    const childProps = childArray[0].props as any
    if (childProps.type === 'checkbox') {
      const checked = childProps.checked || childProps.defaultChecked
      const label = childArray.slice(1)
      return (
        <Text>
          {checked ? '[x]' : '[ ]'} {label}
        </Text>
      )
    }
  }

  if (index) {
    return (
      <Text>
        {index}. {children}
      </Text>
    )
  }

  return <Text>• {children}</Text>
}
