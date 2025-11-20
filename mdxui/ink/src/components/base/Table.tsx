import React, { Children } from 'react'
import { Text } from 'ink'

// Dynamic import for optional dependency
let Table: any

try {
  Table = require('ink-table').default || require('ink-table')
} catch {
  Table = ({ data }: { data: any[] }) => <Text>Table: {data.length} rows</Text>
}

/**
 * Table components
 */
export function TableComponent({ children }: { children: React.ReactNode }) {
  const headers: string[] = []
  const rows: Record<string, any>[] = []

  Children.forEach(children, (child) => {
    if (React.isValidElement(child)) {
      if (child.type === 'thead') {
        const theadProps = child.props as { children: React.ReactNode }
        Children.forEach(theadProps.children, (tr) => {
          if (React.isValidElement(tr) && tr.type === 'tr') {
            const trProps = tr.props as { children: React.ReactNode }
            Children.forEach(trProps.children, (th) => {
              if (React.isValidElement(th) && (th.type === 'th' || th.type === 'td')) {
                const thProps = th.props as { children: React.ReactNode }
                headers.push(String(thProps.children))
              }
            })
          }
        })
      } else if (child.type === 'tbody') {
        const tbodyProps = child.props as { children: React.ReactNode }
        Children.forEach(tbodyProps.children, (tr) => {
          if (React.isValidElement(tr) && tr.type === 'tr') {
            const row: Record<string, any> = {}
            const trProps = tr.props as { children: React.ReactNode }
            Children.forEach(trProps.children, (td, index) => {
              if (React.isValidElement(td) && td.type === 'td') {
                const tdProps = td.props as { children: React.ReactNode }
                const key = headers[index] || `col${index + 1}`
                row[key] = tdProps.children
              }
            })
            rows.push(row)
          }
        })
      }
    }
  })

  // Use Table as a function component
  return <Table data={rows} />
}
