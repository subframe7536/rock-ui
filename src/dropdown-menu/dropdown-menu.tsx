import * as KobalteDropdownMenu from '@kobalte/core/dropdown-menu'
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

import type { DropdownMenuItemVariantProps } from './dropdown-menu.class'
import { dropdownMenuContentVariants, dropdownMenuItemVariants } from './dropdown-menu.class'

const DROPDOWN_MENU_PRIMITIVES: OverlayMenuPrimitives = {
  Portal: KobalteDropdownMenu.Portal as unknown as OverlayMenuPrimitives['Portal'],
  Content: KobalteDropdownMenu.Content as unknown as OverlayMenuPrimitives['Content'],
  Group: KobalteDropdownMenu.Group as unknown as OverlayMenuPrimitives['Group'],
  GroupLabel: KobalteDropdownMenu.GroupLabel as unknown as OverlayMenuPrimitives['GroupLabel'],
  Separator: KobalteDropdownMenu.Separator as unknown as OverlayMenuPrimitives['Separator'],
  Item: KobalteDropdownMenu.Item as unknown as OverlayMenuPrimitives['Item'],
  CheckboxItem:
    KobalteDropdownMenu.CheckboxItem as unknown as OverlayMenuPrimitives['CheckboxItem'],
  ItemIndicator:
    KobalteDropdownMenu.ItemIndicator as unknown as OverlayMenuPrimitives['ItemIndicator'],
  Sub: KobalteDropdownMenu.Sub as unknown as OverlayMenuPrimitives['Sub'],
  SubTrigger: KobalteDropdownMenu.SubTrigger as unknown as OverlayMenuPrimitives['SubTrigger'],
  SubContent: KobalteDropdownMenu.SubContent as unknown as OverlayMenuPrimitives['SubContent'],
}

type DropdownMenuColor = NonNullable<DropdownMenuItemVariantProps['color']>
type DropdownMenuSize = NonNullable<DropdownMenuItemVariantProps['size']>
type DropdownMenuPlacement =
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

export interface DropdownMenuItem extends OverlayMenuSharedItem<
  DropdownMenuColor,
  DropdownMenuItem
> {}

export type DropdownMenuItems = OverlayMenuItems<DropdownMenuItem>

export interface DropdownMenuClasses extends OverlayMenuSharedClasses {}

export interface DropdownMenuItemRenderContext extends OverlayMenuSharedItemRenderContext<DropdownMenuItem> {}

export interface DropdownMenuBaseProps {
  id?: string
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  placement?: DropdownMenuPlacement
  gutter?: number
  size?: DropdownMenuSize
  disabled?: boolean
  items?: DropdownMenuItems
  checkedIcon?: IconName
  submenuIcon?: IconName
  itemRender?: (context: DropdownMenuItemRenderContext) => JSX.Element
  contentTop?: OverlayMenuContentSlot
  contentBottom?: OverlayMenuContentSlot
  classes?: DropdownMenuClasses
  children?: JSX.Element
}

export type DropdownMenuProps = DropdownMenuBaseProps &
  Omit<
    KobalteDropdownMenu.DropdownMenuRootProps,
    keyof DropdownMenuBaseProps | 'children' | 'class'
  >

export function DropdownMenu(props: DropdownMenuProps): JSX.Element {
  const merged = mergeProps(
    {
      size: 'md' as const,
      placement: 'bottom-start' as const,
      gutter: 8,
      checkedIcon: 'icon-check' as IconName,
      submenuIcon: 'icon-chevron-right' as IconName,
    },
    props,
  ) as DropdownMenuProps
  const [rootStateProps, menuProps, triggerProps, rootProps] = splitProps(
    merged,
    ['defaultOpen', 'placement', 'disabled'],
    [
      'size',
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

  const rootSide = () => resolveOverlayMenuSide(rootStateProps.placement)

  return (
    <KobalteDropdownMenu.Root
      defaultOpen={rootStateProps.defaultOpen}
      modal
      placement={rootStateProps.placement}
      overflowPadding={0}
      {...rootProps}
    >
      <Show when={hasTrigger()}>
        <KobalteDropdownMenu.Trigger
          as="span"
          data-slot="trigger"
          class={menuProps.classes?.trigger}
          disabled={rootStateProps.disabled}
        >
          {triggerChildren()}
        </KobalteDropdownMenu.Trigger>
      </Show>

      <OverlayMenuBaseContent<DropdownMenuColor, DropdownMenuItem, DropdownMenuSize>
        primitives={DROPDOWN_MENU_PRIMITIVES}
        {...menuProps}
        itemClassName={(item) =>
          dropdownMenuItemVariants(
            {
              size: menuProps.size,
              color: item.color,
            },
            menuProps.classes?.item,
          )
        }
        checkboxItemClassName={(item) =>
          dropdownMenuItemVariants(
            {
              size: menuProps.size,
              color: item.color,
            },
            menuProps.classes?.item,
          )
        }
        subTriggerClassName={(item) =>
          dropdownMenuItemVariants(
            {
              size: menuProps.size,
              color: item.color,
            },
            'data-expanded:(bg-accent text-accent-foreground)',
            menuProps.classes?.item,
          )
        }
        rootContentClassName={(side) =>
          dropdownMenuContentVariants({ side, sub: false }, menuProps.classes?.content)
        }
        subContentClassName={(side) =>
          dropdownMenuContentVariants({ side, sub: true }, menuProps.classes?.content)
        }
        rootSide={rootSide()}
        separatorClassName="-mx-1 my-1 h-px bg-border"
      />
    </KobalteDropdownMenu.Root>
  )
}
