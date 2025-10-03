import type { BaseComponentProps, SpacingProps, ColorProps } from '../../shared/common.js'
import type { DualAPIProps } from '../../utils/mdx.js'

/**
 * Chart data series
 */
export interface ChartSeries {
  /** Series name */
  name: string
  /** Data points */
  data: number[]
  /** Series color */
  color?: string
}

/**
 * Chart component props (supporting Tremor-style charts)
 */
export interface ChartProps extends BaseComponentProps, SpacingProps, ColorProps {
  /** Chart title */
  title?: string
  /** Chart description */
  description?: string
  /** Chart type */
  type?: 'line' | 'bar' | 'area' | 'donut' | 'pie'
  /** Chart data */
  data?: any[]
  /** Data series */
  series?: ChartSeries[]
  /** X-axis data key */
  index?: string
  /** Y-axis data keys */
  categories?: string[]
  /** Y-axis label */
  yAxisLabel?: string
  /** X-axis label */
  xAxisLabel?: string
  /** Whether to show legend */
  showLegend?: boolean
  /** Whether to show grid */
  showGrid?: boolean
  /** Whether to show tooltip */
  showTooltip?: boolean
  /** Chart height */
  height?: string | number
}

/**
 * Chart with dual API support
 */
export type ChartDualProps = DualAPIProps<ChartProps>

/**
 * Table column definition
 */
export interface TableColumn {
  /** Column key */
  key: string
  /** Column header label */
  label: string
  /** Column width */
  width?: string | number
  /** Text alignment */
  align?: 'left' | 'center' | 'right'
  /** Whether column is sortable */
  sortable?: boolean
  /** Custom cell renderer */
  render?: (value: any, row: any) => React.ReactNode
}

/**
 * Table component props
 */
export interface TableProps extends BaseComponentProps, SpacingProps, ColorProps {
  /** Table title */
  title?: string
  /** Table description */
  description?: string
  /** Column definitions */
  columns?: TableColumn[]
  /** Table data */
  data?: any[]
  /** Whether table is striped */
  striped?: boolean
  /** Whether to show borders */
  bordered?: boolean
  /** Whether to highlight rows on hover */
  hoverable?: boolean
  /** Pagination settings */
  pagination?: {
    pageSize: number
    currentPage?: number
    total?: number
  }
  /** Sort state */
  sort?: {
    column: string
    direction: 'asc' | 'desc'
  }
}

/**
 * Table with dual API support
 */
export type TableDualProps = DualAPIProps<TableProps>
