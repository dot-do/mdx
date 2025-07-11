import React from 'react'
import { Card as ShadcnCard, CardHeader, CardTitle, CardContent } from '../shadcn/src/card.js'

export interface CardProps {
  title?: string
  children: React.ReactNode
  className?: string
}

export function Card({ title, children, className, ...props }: CardProps) {
  return (
    <ShadcnCard className={className} {...props}>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>{children}</CardContent>
    </ShadcnCard>
  )
}
