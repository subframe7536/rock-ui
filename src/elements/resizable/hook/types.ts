import type { JSX } from 'solid-js'

export type ResizableOrientation = 'vertical' | 'horizontal'

export type ResizableSize = number | `${number}%`
export interface ResizablePanelItem {
  panelId?: string
  size?: ResizableSize
  initialSize?: ResizableSize
  minSize?: ResizableSize
  maxSize?: ResizableSize
  collapsible?: boolean
  collapsedSize?: ResizableSize
  collapseThreshold?: ResizableSize
  onResize?: (size: number) => void
  onCollapse?: (size: number) => void
  onExpand?: (size: number) => void
  class?: string
  style?: JSX.CSSProperties
  content?: JSX.Element
}

export const PRECISION = 6
export const EPSILON = 10 ** -PRECISION

export interface ResizableResolvedPanel extends Omit<
  ResizablePanelItem,
  | 'size'
  | 'initialSize'
  | 'minSize'
  | 'maxSize'
  | 'collapsible'
  | 'collapsedSize'
  | 'collapseThreshold'
> {
  panelId: string
  initialSize?: ResizableSize
  minSize: number
  maxSize: number
  collapsible: boolean
  collapsedSize: number
  collapseThreshold: number
}

export interface ResizableHandleAria {
  controls?: string
  valueNow: number
  valueMin: number
  valueMax: number
}
