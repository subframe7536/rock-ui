import * as KobalteContextMenu from '@kobalte/core/context-menu'
import type { JSX } from 'solid-js'
import { Show, children, mergeProps, splitProps } from 'solid-js'

import type { IconName } from '../icon'
import { resolveOverlayMenuSide } from '../shared/overlay-menu'
import type { OverlayMenuContentSlot, OverlayMenuItems } from '../shared/overlay-menu'
import { OverlayMenuBaseContent } from '../shared/overlay-menu-base'
import type {
  OverlayMenuPrimitives,
  OverlayMenuSharedClasses,
  OverlayMenuSharedItem,
  OverlayMenuSharedItemRenderContext,
} from '../shared/overlay-menu-base.types'

import type { ContextMenuItemVariantProps } from './context-menu.class'
import { contextMenuContentVariants, contextMenuItemVariants } from './context-menu.class'

const CONTEXT_MENU_PRIMITIVES: OverlayMenuPrimitives = {
  Portal: KobalteContextMenu.Portal as unknown as OverlayMenuPrimitives['Portal'],
  Content: KobalteContextMenu.Content as unknown as OverlayMenuPrimitives['Content'],
  Group: KobalteContextMenu.Group as unknown as OverlayMenuPrimitives['Group'],
  GroupLabel: KobalteContextMenu.GroupLabel as unknown as OverlayMenuPrimitives['GroupLabel'],
  Separator: KobalteContextMenu.Separator as unknown as OverlayMenuPrimitives['Separator'],
  Item: KobalteContextMenu.Item as unknown as OverlayMenuPrimitives['Item'],
  CheckboxItem: KobalteContextMenu.CheckboxItem as unknown as OverlayMenuPrimitives['CheckboxItem'],
  ItemIndicator:
    KobalteContextMenu.ItemIndicator as unknown as OverlayMenuPrimitives['ItemIndicator'],
  Sub: KobalteContextMenu.Sub as unknown as OverlayMenuPrimitives['Sub'],
  SubTrigger: KobalteContextMenu.SubTrigger as unknown as OverlayMenuPrimitives['SubTrigger'],
  SubContent: KobalteContextMenu.SubContent as unknown as OverlayMenuPrimitives['SubContent'],
}

type ContextMenuColor = NonNullable<ContextMenuItemVariantProps['color']>
type ContextMenuSize = NonNullable<ContextMenuItemVariantProps['size']>
type ContextMenuPlacement =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'right'
  | 'right-start'
  | 'right-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end'

export interface ContextMenuItem extends OverlayMenuSharedItem<ContextMenuColor, ContextMenuItem> {}

export type ContextMenuItems = OverlayMenuItems<ContextMenuItem>

export interface ContextMenuClasses extends OverlayMenuSharedClasses {}

export interface ContextMenuItemRenderContext extends OverlayMenuSharedItemRenderContext<ContextMenuItem> {}

export interface ContextMenuBaseProps {
  id?: string
  onOpenChange?: (open: boolean) => void
  placement?: ContextMenuPlacement
  gutter?: number
  size?: ContextMenuSize
  disabled?: boolean
  items?: ContextMenuItems
  checkedIcon?: IconName
  submenuIcon?: IconName
  itemRender?: (context: ContextMenuItemRenderContext) => JSX.Element
  contentTop?: OverlayMenuContentSlot
  contentBottom?: OverlayMenuContentSlot
  classes?: ContextMenuClasses
  children?: JSX.Element
}

export type ContextMenuProps = ContextMenuBaseProps &
  Omit<KobalteContextMenu.ContextMenuRootProps, keyof ContextMenuBaseProps | 'children' | 'class'>

export function ContextMenu(props: ContextMenuProps): JSX.Element {
  const merged = mergeProps(
    {
      size: 'md' as const,
      checkedIcon: 'icon-check' as IconName,
      submenuIcon: 'icon-chevron-right' as IconName,
    },
    props,
  ) as ContextMenuProps
  const [rootStateProps, menuProps, triggerProps, rootProps] = splitProps(
    merged,
    ['id', 'onOpenChange', 'placement', 'gutter'],
    [
      'size',
      'disabled',
      'items',
      'checkedIcon',
      'submenuIcon',
      'itemRender',
      'contentTop',
      'contentBottom',
      'classes',
    ],
    ['children'],
  )

  const triggerChildren = children(() => triggerProps.children)
  const hasTrigger = () => triggerChildren.toArray().length > 0

  const rootSide = () => resolveOverlayMenuSide(rootStateProps.placement ?? 'right-start')

  return (
    <KobalteContextMenu.Root
      id={rootStateProps.id}
      onOpenChange={rootStateProps.onOpenChange}
      modal
      placement={rootStateProps.placement}
      gutter={rootStateProps.gutter}
      overflowPadding={4}
      {...rootProps}
    >
      <Show when={hasTrigger()}>
        <KobalteContextMenu.Trigger
          data-slot="trigger"
          class={menuProps.classes?.trigger}
          disabled={menuProps.disabled}
        >
          {triggerChildren()}
        </KobalteContextMenu.Trigger>
      </Show>

      <OverlayMenuBaseContent<ContextMenuColor, ContextMenuItem, ContextMenuSize>
        primitives={CONTEXT_MENU_PRIMITIVES}
        {...menuProps}
        itemClassName={(item) =>
          contextMenuItemVariants(
            {
              size: menuProps.size,
              color: item.color,
            },
            menuProps.classes?.item,
          )
        }
        checkboxItemClassName={(item) =>
          contextMenuItemVariants(
            {
              size: menuProps.size,
              color: item.color,
            },
            menuProps.classes?.item,
          )
        }
        subTriggerClassName={(item) =>
          contextMenuItemVariants(
            {
              size: menuProps.size,
              color: item.color,
            },
            'data-expanded:(bg-accent text-accent-foreground)',
            menuProps.classes?.item,
          )
        }
        rootContentClassName={(side) =>
          contextMenuContentVariants({ side, sub: false }, menuProps.classes?.content)
        }
        subContentClassName={(side) =>
          contextMenuContentVariants({ side, sub: true }, menuProps.classes?.content)
        }
        rootSide={rootSide()}
        separatorClassName="-mx-1 my-1 h-px border-t-border"
      />
    </KobalteContextMenu.Root>
  )
}
