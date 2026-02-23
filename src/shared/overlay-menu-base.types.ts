import type { JSX } from 'solid-js'

import type { IconName } from '../icon'

import type { OverlayMenuItems } from './overlay-menu'

export type OverlayMenuItemType = 'item' | 'label' | 'separator' | 'checkbox'

export interface OverlayMenuSharedItem<TColor extends string, TItem> {
  type?: OverlayMenuItemType
  label?: JSX.Element
  description?: JSX.Element
  icon?: IconName | JSX.Element
  kbds?: string[]
  color?: TColor
  disabled?: boolean
  checked?: boolean
  defaultChecked?: boolean
  open?: boolean
  defaultOpen?: boolean
  children?: OverlayMenuItems<TItem>
  onSelect?: () => void
  onCheckedChange?: (checked: boolean) => void
}

export interface OverlayMenuSharedClasses {
  trigger?: string
  content?: string
  group?: string
  label?: string
  separator?: string
  item?: string
  itemLeading?: string
  itemWrapper?: string
  itemLabel?: string
  itemDescription?: string
  itemTrailing?: string
  itemKbds?: string
  itemIndicator?: string
  itemSubIcon?: string
}

export interface OverlayMenuSharedItemRenderContext<TItem> {
  item: TItem
  depth: number
  isCheckbox: boolean
  hasChildren: boolean
  defaultItem: JSX.Element
}

export type OverlayMenuPrimitive = (props: Record<string, unknown>) => JSX.Element

export interface OverlayMenuPrimitives {
  Portal: OverlayMenuPrimitive
  Content: OverlayMenuPrimitive
  Group: OverlayMenuPrimitive
  GroupLabel: OverlayMenuPrimitive
  Separator: OverlayMenuPrimitive
  Item: OverlayMenuPrimitive
  CheckboxItem: OverlayMenuPrimitive
  ItemIndicator: OverlayMenuPrimitive
  Sub: OverlayMenuPrimitive
  SubTrigger: OverlayMenuPrimitive
  SubContent: OverlayMenuPrimitive
}
