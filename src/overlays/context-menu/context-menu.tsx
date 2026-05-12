import type { JSX } from 'solid-js'
import { createMemo, createSignal, mergeProps, onCleanup, onMount, untrack } from 'solid-js'

import type { IconT } from '../../elements/icon'
import type { BaseProps, SlotClasses, SlotStyles } from '../../shared/types'
import { cn, useId } from '../../shared/utils'
import { OverlayMenu } from '../shared-overlay-menu/menu'
import type { OverlayMenuFocusStrategy, OverlayMenuRootProps } from '../shared-overlay-menu/menu'
import type { OverlayMenuItemVariantProps } from '../shared-overlay-menu/menu.class'
import type { OverlayMenuSharedItem, OverlayMenuSharedSlots } from '../shared-overlay-menu/types'

export namespace ContextMenuT {
  export type Slot = OverlayMenuSharedSlots
  export type Variant = Pick<OverlayMenuItemVariantProps, 'size'>
  export type Classes = SlotClasses<Slot>
  export type Styles = SlotStyles<Slot>
  export type Extend = OverlayMenuRootProps<Item>

  export interface Item extends OverlayMenuSharedItem<Item> {}

  /**
   * Base props for the ContextMenu component.
   */
  export interface Base {
    /**
     * Target area that opens the context menu on right-click or long press.
     */
    children: JSX.Element
  }

  /**
   * Props for the ContextMenu component.
   */
  export interface Props extends BaseProps<Base, Variant, Extend, Slot> {}
}

/**
 * Props for the ContextMenu component.
 */
export interface ContextMenuProps extends ContextMenuT.Props {}

const CONTEXT_MENU_LONG_PRESS_DELAY = 700

function isTouchOrPen(pointerType: string): boolean {
  return pointerType === 'touch' || pointerType === 'pen'
}

/**
 * Menu triggered by right-click or long press on its child content.
 */
export function ContextMenu(props: ContextMenuProps): JSX.Element {
  const merged = mergeProps(
    {
      size: 'md' as const,
      checkedIcon: 'icon-check' as IconT.Name,
      submenuIcon: 'icon-chevron-right' as IconT.Name,
      placement: 'right-start' as const,
      gutter: 0,
    },
    props,
  )
  const [uncontrolledOpen, setUncontrolledOpen] = createSignal(
    untrack(() => Boolean(merged.defaultOpen)),
  )
  const [autoFocusStrategy, setAutoFocusStrategy] =
    createSignal<OverlayMenuFocusStrategy>('content')
  const [anchorPoint, setAnchorPoint] = createSignal<{ x: number; y: number } | null>(null)
  const resolvedOpen = createMemo(() => merged.open ?? uncontrolledOpen())
  const resolvedId = useId(() => merged.id, 'contextmenu')
  const contentId = createMemo(() => `${resolvedId()}-content`)
  let longPressTimeoutId = 0
  let triggerElement: HTMLElement | undefined

  const commitOpen = (open: boolean): void => {
    if (!open) {
      setAutoFocusStrategy('none')
    }

    if (merged.open === undefined) {
      setUncontrolledOpen(open)
    }

    merged.onOpenChange?.(open)
  }

  const openFromPoint = (x: number, y: number): void => {
    if (merged.disabled) {
      return
    }

    setAutoFocusStrategy('content')
    setAnchorPoint({ x, y })
    commitOpen(true)
  }

  const clearLongPressTimeout = (): void => {
    if (typeof window === 'undefined') {
      return
    }

    window.clearTimeout(longPressTimeoutId)
  }

  onCleanup(() => {
    clearLongPressTimeout()
  })

  const isPointerInsideTrigger = (event: MouseEvent): boolean => {
    if (!triggerElement) {
      return false
    }

    const rect = triggerElement.getBoundingClientRect()

    return (
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom
    )
  }

  onMount(() => {
    const onDocumentContextMenuCapture = (event: MouseEvent): void => {
      if (merged.disabled) {
        return
      }

      const targetInsideTrigger =
        event.target instanceof Node && Boolean(triggerElement?.contains(event.target))
      const pointerInsideTrigger = isPointerInsideTrigger(event)

      if (!targetInsideTrigger && !pointerInsideTrigger) {
        return
      }

      event.preventDefault()
      event.stopPropagation()

      if (resolvedOpen()) {
        commitOpen(false)
        return
      }

      openFromPoint(event.clientX, event.clientY)
    }

    document.addEventListener('contextmenu', onDocumentContextMenuCapture, true)

    onCleanup(() => {
      document.removeEventListener('contextmenu', onDocumentContextMenuCapture, true)
    })
  })

  const onContextMenu = (event: MouseEvent): void => {
    if (event.defaultPrevented || merged.disabled) {
      return
    }

    clearLongPressTimeout()
    event.preventDefault()
    event.stopPropagation()
    openFromPoint(event.clientX, event.clientY)
  }

  const onContentContextMenu = (event: MouseEvent): void => {
    event.preventDefault()
    event.stopPropagation()

    if (resolvedOpen()) {
      commitOpen(false)
    }
  }

  const onPointerDown = (event: PointerEvent): void => {
    if (merged.disabled || !isTouchOrPen(event.pointerType)) {
      return
    }

    clearLongPressTimeout()
    setAnchorPoint({ x: event.clientX, y: event.clientY })

    const isUncontrolled = merged.open === undefined
    const onOpenChange = merged.onOpenChange

    longPressTimeoutId = window.setTimeout(() => {
      if (isUncontrolled) {
        setUncontrolledOpen(true)
      }

      onOpenChange?.(true)
    }, CONTEXT_MENU_LONG_PRESS_DELAY)
  }

  const onPointerMove = (event: PointerEvent): void => {
    if (merged.disabled || !isTouchOrPen(event.pointerType)) {
      return
    }

    clearLongPressTimeout()
  }

  const onPointerCancel = (event: PointerEvent): void => {
    if (merged.disabled || !isTouchOrPen(event.pointerType)) {
      return
    }

    clearLongPressTimeout()
  }

  const onPointerUp = (event: PointerEvent): void => {
    if (merged.disabled || !isTouchOrPen(event.pointerType)) {
      return
    }

    clearLongPressTimeout()
  }

  const getAnchorRect = (
    anchor?: HTMLElement,
  ): { x: number; y: number; width: number; height: number } => {
    const point = anchorPoint()

    if (point) {
      return { x: point.x, y: point.y, width: 0, height: 0 }
    }

    if (anchor) {
      const rect = anchor.getBoundingClientRect()

      return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        width: 0,
        height: 0,
      }
    }

    return { x: 0, y: 0, width: 0, height: 0 }
  }

  return (
    <>
      <span
        ref={(element) => {
          triggerElement = element
        }}
        data-slot="trigger"
        tabIndex={-1}
        aria-haspopup="menu"
        aria-controls={resolvedOpen() ? contentId() : undefined}
        aria-expanded={resolvedOpen() ? 'true' : 'false'}
        class={cn(merged.classes?.trigger)}
        style={{ '-webkit-touch-callout': 'none', ...merged.styles?.trigger }}
        onContextMenu={onContextMenu}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerCancel={onPointerCancel}
        onPointerUp={onPointerUp}
      >
        {merged.children}
      </span>

      <OverlayMenu<ContextMenuT.Item>
        id={resolvedId()}
        open={resolvedOpen()}
        onClose={() => {
          commitOpen(false)
        }}
        triggerElement={triggerElement}
        getAnchorRect={getAnchorRect}
        placement={merged.placement}
        gutter={merged.gutter}
        autoFocusStrategy={autoFocusStrategy()}
        onContentContextMenu={onContentContextMenu}
        classes={merged.classes}
        styles={merged.styles}
        size={merged.size}
        items={merged.items}
        checkedIcon={merged.checkedIcon}
        submenuIcon={merged.submenuIcon}
        itemRender={merged.itemRender}
        contentTop={merged.contentTop}
        contentBottom={merged.contentBottom}
      />
    </>
  )
}
