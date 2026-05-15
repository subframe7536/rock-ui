import { Show, createEffect, createSignal } from 'solid-js'
import type { Accessor, JSX } from 'solid-js'
import { Portal } from 'solid-js/web'

import {
  overlayMenuContentVariants,
  useOverlayMenuDismiss,
  useOverlayMenuFloatingPosition,
} from '../../../overlays/base/menu'
import { useTransitionPresence } from '../../../shared/use-transition-presence'
import { cn } from '../../../shared/utils'

export interface SelectPopupProps {
  anchorElement: Accessor<HTMLElement | undefined>
  contentClass?: string
  contentStyle?: JSX.CSSProperties
  listboxClass?: string
  listboxId: string
  listboxStyle?: JSX.CSSProperties
  onClose: () => void
  onInteractOutside?: () => void
  onListboxScrollBottom?: () => void
  open: boolean
  overflowPadding?: number
  scrollBottomThreshold?: number
  children: JSX.Element
}

export function SelectPopup(props: SelectPopupProps): JSX.Element {
  const [positionerElement, setPositionerElement] = createSignal<HTMLDivElement | undefined>(
    undefined,
  )
  const [contentElement, setContentElement] = createSignal<HTMLDivElement | undefined>(undefined)
  const contentPresence = useTransitionPresence({
    open: () => props.open,
    mode: () => 'both',
  })
  let hasReachedScrollBottom = false

  useOverlayMenuFloatingPosition({
    contentElement,
    floatingElement: positionerElement,
    getReferenceElement: () => props.anchorElement(),
    gutter: () => 0,
    onPositionedChange: () => undefined,
    onPlacementChange: () => undefined,
    open: () => props.open,
    overflowPadding: () => props.overflowPadding ?? 4,
    placement: () => 'bottom-start',
  })

  createEffect(() => {
    if (contentPresence.present()) {
      return
    }

    contentPresence.setElement(undefined)
  })

  createEffect(() => {
    const positioner = positionerElement()
    const content = contentElement()

    if (!positioner || !content) {
      return
    }

    queueMicrotask(() => {
      positioner.style.zIndex = getComputedStyle(content).zIndex
    })
  })

  useOverlayMenuDismiss({
    containsTarget: (node) => {
      const anchor = props.anchorElement()
      const positioner = positionerElement()
      return Boolean(anchor?.contains(node as Node) || positioner?.contains(node as Node))
    },
    onClose: () => {
      props.onInteractOutside?.()
      props.onClose()
    },
    open: () => props.open,
  })

  function handleListboxScroll(event: Event): void {
    const target = event.currentTarget as HTMLElement | null
    if (!target) {
      return
    }

    const threshold = props.scrollBottomThreshold ?? 20
    const isAtBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - threshold
    if (isAtBottom) {
      if (hasReachedScrollBottom) {
        return
      }
      hasReachedScrollBottom = true
      props.onListboxScrollBottom?.()
      return
    }

    hasReachedScrollBottom = false
  }

  return (
    <Show when={contentPresence.present()}>
      <Portal>
        <div
          ref={(element) => {
            setPositionerElement(element)

            if (!element) {
              return
            }

            element.style.position = 'fixed'
            element.style.visibility = 'hidden'
          }}
          data-slot="positioner"
          class="left-0 top-0 fixed"
        >
          <div
            {...contentPresence.dataAttrs()}
            ref={(element) => {
              setContentElement(element)
              contentPresence.setElement(element)
            }}
            data-slot="content"
            style={props.contentStyle}
            class={overlayMenuContentVariants(
              { side: 'bottom' },
              'w-$mo-popper-anchor-width min-w-$mo-popper-anchor-width max-w-$mo-popper-content-available-width',
              props.contentClass,
            )}
          >
            <div
              id={props.listboxId}
              role="listbox"
              data-slot="listbox"
              style={props.listboxStyle}
              class={cn(
                'outline-none max-h-$mo-popper-content-available-height overflow-y-auto',
                props.listboxClass,
              )}
              onScroll={handleListboxScroll}
            >
              {props.children}
            </div>
          </div>
        </div>
      </Portal>
    </Show>
  )
}
