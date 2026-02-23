import type { JSX } from 'solid-js'
import { For, Show } from 'solid-js'

import { Icon } from '../icon'
import type { IconName } from '../icon'
import { Kbd } from '../kbd'

import {
  getOverlayMenuTextValue,
  normalizeOverlayMenuGroups,
  renderOverlayMenuContentSlot,
} from './overlay-menu'
import type { OverlayMenuContentSlot, OverlayMenuItems, OverlayMenuSide } from './overlay-menu'
import type {
  OverlayMenuPrimitives,
  OverlayMenuSharedClasses,
  OverlayMenuSharedItem,
  OverlayMenuSharedItemRenderContext,
} from './overlay-menu-base.types'
import { cn } from './utils'

export interface OverlayMenuBaseContentProps<
  TColor extends string,
  TItem extends OverlayMenuSharedItem<TColor, TItem>,
  TSize extends string,
> {
  primitives: OverlayMenuPrimitives
  items?: OverlayMenuItems<TItem>
  size?: TSize
  classes?: OverlayMenuSharedClasses
  checkedIcon?: IconName
  submenuIcon?: IconName
  itemRender?: (context: OverlayMenuSharedItemRenderContext<TItem>) => JSX.Element
  contentTop?: OverlayMenuContentSlot
  contentBottom?: OverlayMenuContentSlot
  itemClassName: (item: TItem) => string | undefined
  checkboxItemClassName: (item: TItem) => string | undefined
  subTriggerClassName: (item: TItem) => string | undefined
  rootContentClassName: (side: OverlayMenuSide) => string | undefined
  subContentClassName: (side: OverlayMenuSide) => string | undefined
  rootSide: OverlayMenuSide
  separatorClassName: string
  renderRootExtras?: () => JSX.Element
}

export function OverlayMenuBaseContent<
  TColor extends string,
  TItem extends OverlayMenuSharedItem<TColor, TItem>,
  TSize extends string,
>(props: OverlayMenuBaseContentProps<TColor, TItem, TSize>): JSX.Element {
  function renderItemNode(item: TItem, depth: number): JSX.Element {
    if (item.type === 'separator') {
      return (
        <props.primitives.Separator
          data-slot="separator"
          class={cn(props.separatorClassName, props.classes?.separator)}
        />
      )
    }

    if (item.type === 'label') {
      return (
        <props.primitives.GroupLabel
          data-slot="label"
          class={cn('px-1.5 py-1 font-medium text-muted-foreground text-xs', props.classes?.label)}
        >
          {item.label}
        </props.primitives.GroupLabel>
      )
    }

    const hasChildren = normalizeOverlayMenuGroups(item.children).length > 0

    const itemContent = (isCheckbox: boolean): JSX.Element => {
      const defaultItem = (
        <>
          <Show when={item.icon}>
            <span
              data-slot="item-leading"
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
              data-slot="item-wrapper"
              class={cn('col-start-2 grid gap-0.5', props.classes?.itemWrapper)}
            >
              <Show when={item.label}>
                <span data-slot="item-label" class={cn('truncate', props.classes?.itemLabel)}>
                  {item.label}
                </span>
              </Show>

              <Show when={item.description}>
                <span
                  data-slot="item-description"
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
            data-slot="item-trailing"
            class={cn(
              'col-start-3 inline-flex items-center justify-end gap-1.5',
              props.classes?.itemTrailing,
            )}
          >
            <Show when={hasChildren}>
              <Icon
                name={props.submenuIcon}
                classes={{
                  root: cn('text-muted-foreground text-sm', props.classes?.itemSubIcon),
                }}
              />
            </Show>

            <Show when={!hasChildren && (item.kbds?.length ?? 0) > 0}>
              <span
                data-slot="item-kbds"
                class={cn(
                  'inline-flex items-center gap-1 text-muted-foreground',
                  props.classes?.itemKbds,
                )}
              >
                <For each={item.kbds}>{(kbd) => <Kbd data-slot="item-kbd">{kbd}</Kbd>}</For>
              </span>
            </Show>

            <Show when={isCheckbox}>
              <props.primitives.ItemIndicator
                data-slot="item-indicator"
                class={cn(
                  'inline-flex items-center justify-center text-sm',
                  props.classes?.itemIndicator,
                )}
              >
                <Icon name={props.checkedIcon} />
              </props.primitives.ItemIndicator>
            </Show>
          </span>
        </>
      )

      if (!props.itemRender) {
        return defaultItem
      }

      return props.itemRender({
        item,
        depth,
        hasChildren,
        isCheckbox,
        defaultItem,
      })
    }

    if (hasChildren) {
      const subSide: OverlayMenuSide = 'right'

      return (
        <props.primitives.Sub open={item.open} defaultOpen={item.defaultOpen} overflowPadding={2}>
          <props.primitives.SubTrigger
            data-slot="item"
            disabled={item.disabled}
            textValue={getOverlayMenuTextValue(item)}
            class={props.subTriggerClassName(item)}
          >
            {itemContent(false)}
          </props.primitives.SubTrigger>

          <props.primitives.SubContent
            data-slot="content"
            class={props.subContentClassName(subSide)}
          >
            {renderOverlayMenuContentSlot(props.contentTop, true)}

            {renderGroups(item.children, depth + 1)}

            {renderOverlayMenuContentSlot(props.contentBottom, true)}
          </props.primitives.SubContent>
        </props.primitives.Sub>
      )
    }

    if (item.type === 'checkbox') {
      return (
        <props.primitives.CheckboxItem
          data-slot="item"
          textValue={getOverlayMenuTextValue(item)}
          disabled={item.disabled}
          checked={item.checked}
          defaultChecked={item.defaultChecked}
          onChange={item.onCheckedChange}
          onSelect={item.onSelect}
          class={props.checkboxItemClassName(item)}
        >
          {itemContent(true)}
        </props.primitives.CheckboxItem>
      )
    }

    return (
      <props.primitives.Item
        data-slot="item"
        textValue={getOverlayMenuTextValue(item)}
        disabled={item.disabled}
        onSelect={item.onSelect}
        class={props.itemClassName(item)}
      >
        {itemContent(false)}
      </props.primitives.Item>
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
          <props.primitives.Group data-slot="group" class={props.classes?.group}>
            <For each={group}>{(item) => renderItemNode(item, depth)}</For>
          </props.primitives.Group>
        )}
      </For>
    )
  }

  return (
    <props.primitives.Portal>
      <props.primitives.Content
        data-slot="content"
        class={props.rootContentClassName(props.rootSide)}
      >
        {renderOverlayMenuContentSlot(props.contentTop, false)}

        {renderGroups(props.items, 0)}

        {renderOverlayMenuContentSlot(props.contentBottom, false)}

        {props.renderRootExtras?.()}
      </props.primitives.Content>
    </props.primitives.Portal>
  )
}
