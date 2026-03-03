import {
  ItemIndicator,
  Portal,
  Group,
  Sub,
  Separator,
  SubTrigger,
  SubContent,
  CheckboxItem,
  Item,
  GroupLabel,
} from '@kobalte/core/dropdown-menu'
import type { ClassValueArray } from 'cls-variant'
import type { Component, JSX } from 'solid-js'
import { For, Match, Show, Switch } from 'solid-js'

import { Icon } from '../../icon'
import type { IconName } from '../../icon'
import { Kbd } from '../../kbd'
import { cn } from '../utils'

import { overlayMenuContentVariants, overlayMenuItemVariants } from './menu.class'
import type { OverlayMenuItemVariantProps } from './menu.class'
import type {
  OverlayMenuSharedClasses,
  OverlayMenuSharedItem,
  OverlayMenuSharedItemRenderContext,
} from './types'
import {
  getOverlayMenuTextValue,
  normalizeOverlayMenuGroups,
  renderOverlayMenuContentSlot,
} from './utils'
import type { OverlayMenuContentSlot, OverlayMenuItems, OverlayMenuSide } from './utils'

type OverlayMenuColor = NonNullable<OverlayMenuItemVariantProps['color']>
type OverlayMenuSize = NonNullable<OverlayMenuItemVariantProps['size']>

export interface OverlayMenuBaseContentProps<
  TItem extends OverlayMenuSharedItem<OverlayMenuColor, TItem>,
> {
  content: Component<any>
  items?: OverlayMenuItems<TItem>
  size?: OverlayMenuSize
  classes?: OverlayMenuSharedClasses
  checkedIcon?: IconName
  submenuIcon?: IconName
  itemRender?: (context: OverlayMenuSharedItemRenderContext<TItem>) => JSX.Element
  contentTop?: OverlayMenuContentSlot
  contentBottom?: OverlayMenuContentSlot
  rootSide: OverlayMenuSide
}

export function OverlayMenuBaseContent<
  TItem extends OverlayMenuSharedItem<OverlayMenuColor, TItem>,
>(props: OverlayMenuBaseContentProps<TItem>): JSX.Element {
  function getItemClass(item: TItem, ...cls: ClassValueArray): string {
    return overlayMenuItemVariants(
      {
        size: props.size,
        color: item.color,
      },
      ...cls,
    )
  }

  function renderItemNode(item: TItem, depth: number): JSX.Element {
    const hasChildren = normalizeOverlayMenuGroups(item.children).length > 0

    const itemContent = (isCheckbox: boolean): JSX.Element => {
      const defaultItem = (
        <>
          <Show when={item.icon}>
            <span
              data-slot="itemLeading"
              class={cn(
                'col-start-1 inline-flex size-4 shrink-0 items-center justify-center text-muted-foreground',
                props.classes?.itemLeading,
              )}
            >
              <Icon name={item.icon as IconName} />
            </span>
          </Show>

          <Show when={item.label || item.description}>
            <span
              data-slot="itemWrapper"
              class={cn('col-start-2 grid gap-0.5', props.classes?.itemWrapper)}
            >
              <Show when={item.label}>
                <span data-slot="itemLabel" class={cn('truncate', props.classes?.itemLabel)}>
                  {item.label}
                </span>
              </Show>

              <Show when={item.description}>
                <span
                  data-slot="itemDescription"
                  class={cn(
                    'truncate text-muted-foreground text-xs',
                    props.classes?.itemDescription,
                  )}
                >
                  {item.description}
                </span>
              </Show>
            </span>
          </Show>

          <span
            data-slot="itemTrailing"
            class={cn(
              'col-start-3 inline-flex items-center justify-end gap-1.5',
              props.classes?.itemTrailing,
            )}
          >
            <Show when={hasChildren}>
              <Icon
                name={props.submenuIcon}
                class={cn('text-muted-foreground text-sm', props.classes?.itemSub)}
              />
            </Show>

            <Show when={!hasChildren}>
              <Kbd
                size="sm"
                slotPrefix="item"
                value={item.kbds}
                classes={{
                  root: props.classes?.itemKbds,
                }}
              />
            </Show>

            <Show when={isCheckbox}>
              <ItemIndicator
                data-slot="itemIndicator"
                class={cn(
                  'inline-flex items-center justify-center text-sm',
                  props.classes?.itemIndicator,
                )}
              >
                <Icon name={props.checkedIcon} />
              </ItemIndicator>
            </Show>
          </span>
        </>
      )

      return (
        props.itemRender?.({
          item,
          depth,
          hasChildren,
          isCheckbox,
          defaultItem,
        }) ?? defaultItem
      )
    }

    if (hasChildren) {
      const subSide: OverlayMenuSide = props.rootSide === 'left' ? 'left' : 'right'

      return (
        <Sub open={item.open} defaultOpen={item.defaultOpen} overflowPadding={2}>
          <SubTrigger
            data-slot="item"
            disabled={item.disabled}
            textValue={getOverlayMenuTextValue(item)}
            class={getItemClass(
              item,
              'data-expanded:(bg-accent text-accent-foreground)',
              props.classes?.item,
            )}
          >
            {itemContent(false)}
          </SubTrigger>

          <SubContent
            data-slot="content"
            class={overlayMenuContentVariants({ side: subSide, sub: true }, props.classes?.content)}
          >
            {renderOverlayMenuContentSlot(props.contentTop, true)}

            {renderGroups(item.children, depth + 1)}

            {renderOverlayMenuContentSlot(props.contentBottom, true)}
          </SubContent>
        </Sub>
      )
    }

    return (
      <Switch
        fallback={
          <Item
            data-slot="item"
            textValue={getOverlayMenuTextValue(item)}
            disabled={item.disabled}
            onSelect={item.onSelect}
            class={getItemClass(item, props.classes?.item)}
          >
            {itemContent(false)}
          </Item>
        }
      >
        <Match when={item.type === 'separator'}>
          <Separator
            data-slot="separator"
            class={cn('-mx-1 my-1 h-px border-t-border', props.classes?.separator)}
          />
        </Match>

        <Match when={item.type === 'label'}>
          <GroupLabel
            data-slot="label"
            class={cn(
              'px-1.5 py-1 font-medium text-muted-foreground text-xs',
              props.classes?.label,
            )}
          >
            {item.label}
          </GroupLabel>
        </Match>

        <Match when={item.type === 'checkbox'}>
          <CheckboxItem
            data-slot="item"
            textValue={getOverlayMenuTextValue(item)}
            disabled={item.disabled}
            checked={item.checked}
            defaultChecked={item.defaultChecked}
            onChange={item.onCheckedChange}
            onSelect={item.onSelect}
            class={getItemClass(item, props.classes?.item)}
          >
            {itemContent(true)}
          </CheckboxItem>
        </Match>
      </Switch>
    )
  }

  function renderGroups(
    sourceItems: OverlayMenuItems<TItem> | undefined,
    depth: number,
  ): JSX.Element {
    const source = normalizeOverlayMenuGroups(sourceItems)

    return (
      <For each={source}>
        {(group) => (
          <Group data-slot="group" class={cn(props.classes?.group)}>
            <For each={group}>{(item) => renderItemNode(item, depth)}</For>
          </Group>
        )}
      </For>
    )
  }

  return (
    <Portal>
      <props.content
        data-slot="content"
        class={overlayMenuContentVariants(
          { side: props.rootSide, sub: false },
          props.classes?.content,
        )}
      >
        {renderOverlayMenuContentSlot(props.contentTop, false)}

        {renderGroups(props.items, 0)}

        {renderOverlayMenuContentSlot(props.contentBottom, false)}
      </props.content>
    </Portal>
  )
}
