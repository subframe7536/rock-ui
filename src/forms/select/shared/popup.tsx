import type { JSX } from 'solid-js'
import { Show, createSignal } from 'solid-js'
import type { Accessor } from 'solid-js'
import { Portal } from 'solid-js/web'

import { overlayMenuContentVariants, useOverlayMenuDismiss, useOverlayMenuFloatingPosition } from '../../../overlays/base/menu'
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
  scrollBottomThreshold?: number
  children: JSX.Element
}

export function SelectPopup(props: SelectPopupProps): JSX.Element {
  const [positionerElement, setPositionerElement] = createSignal<HTMLDivElement | undefined>(undefined)
  const [contentElement, setContentElement] = createSignal<HTMLDivElement | undefined>(undefined)
  let hasReachedScrollBottom = false

  useOverlayMenuFloatingPosition({
    contentElement,
    floatingElement: positionerElement,
    getReferenceElement: props.anchorElement,
    gutter: () => 0,
    onPositionedChange: () => undefined,
    onPlacementChange: () => undefined,
    open: () => props.open,
    overflowPadding: () => -2,
    placement: () => 'bottom-start',
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
    <Show when={props.open}>
      <Portal>
        <div ref={setPositionerElement} style={{ position: 'fixed', visibility: 'hidden', 'z-index': 50 }}>
          <div
            ref={setContentElement}
            data-slot="content"
            style={props.contentStyle}
            class={overlayMenuContentVariants({}, props.contentClass)}
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
