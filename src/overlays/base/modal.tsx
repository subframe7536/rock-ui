import type { JSX } from 'solid-js'
import { Show, createEffect, createMemo, onCleanup } from 'solid-js'
import { Portal } from 'solid-js/web'

import type { SlotClasses, SlotStyles } from '../../shared/types'
import { useControllableValue } from '../../shared/use-controllable-value'
import { useTransitionPresence } from '../../shared/use-transition-presence'
import { cn, useId } from '../../shared/utils'

import { acquireBodyScrollLock, focusContent, focusTrigger, trapFocusInContainer } from './utils'

type ModalSlot = 'trigger' | 'overlay' | 'content'

export interface ModalContentContext {
  close: () => void
}

export interface ModalProps {
  /** Unique identifier used to derive the content id. */
  id?: string
  /** Controlled open state. */
  open?: boolean
  /** Initial open state when uncontrolled. */
  defaultOpen?: boolean
  /** Called whenever the open state changes. */
  onOpenChange?: (open: boolean) => void
  /** Whether outside interaction and Escape should dismiss the shell. */
  dismissible?: boolean
  /** Called when a dismissal attempt is blocked. */
  onClosePrevent?: () => void
  /** Whether body scroll should be locked while the shell is present. */
  preventScroll?: boolean
  /** Whether to render the overlay element. */
  overlay?: boolean
  /** Trigger content rendered inside the opener wrapper. */
  trigger?: JSX.Element
  /** Modal content rendered inside the content surface. */
  content?: JSX.Element | ((context: ModalContentContext) => JSX.Element)
  /** Slot-based class overrides for the trigger, overlay, and content elements. */
  classes?: SlotClasses<ModalSlot>
  /** Slot-based style overrides for the trigger, overlay, and content elements. */
  styles?: SlotStyles<ModalSlot>
  /** Additional attributes applied to the content element. */
  contentAttributes?: Record<string, string | number | boolean | undefined>
  /** Id of the label element for the content. */
  ariaLabelledBy?: string
  /** Id of the description element for the content. */
  ariaDescribedBy?: string
}

export function Modal(props: ModalProps): JSX.Element {
  const rootId = useId(() => props.id, 'modal')
  const contentId = createMemo(() => `${rootId()}-content`)
  const [open, setOpen] = useControllableValue<boolean>({
    value: () => props.open,
    defaultValue: () => props.defaultOpen ?? false,
  })

  let triggerElement: HTMLSpanElement | undefined
  let contentElement: HTMLDivElement | undefined

  function updateOpen(nextOpen: boolean): void {
    if (nextOpen === !!open()) {
      return
    }

    setOpen(nextOpen)
    props.onOpenChange?.(nextOpen)
  }

  function requestClose(event?: Event): void {
    if (props.dismissible ?? true) {
      updateOpen(false)
      return
    }

    event?.preventDefault()
    props.onClosePrevent?.()
  }

  function onContentKeyDown(event: KeyboardEvent): void {
    trapFocusInContainer(event, contentElement)
  }

  const resolvedContent = createMemo(() =>
    typeof props.content === 'function'
      ? props.content({
          close: () => {
            updateOpen(false)
          },
        })
      : props.content,
  )

  const overlayPresence = useTransitionPresence({
    open: () => Boolean(open() && props.overlay),
    mode: () => 'both',
  })
  const contentPresence = useTransitionPresence({
    open: () => Boolean(open() && resolvedContent()),
    mode: () => 'both',
  })
  const isPresent = createMemo(() => overlayPresence.present() || contentPresence.present())

  createEffect(() => {
    if (contentPresence.present()) {
      return
    }

    contentElement = undefined
    contentPresence.setElement(undefined)
  })

  createEffect(() => {
    if (!isPresent() || typeof document === 'undefined') {
      return
    }

    queueMicrotask(() => {
      focusContent(contentElement)
    })

    const releaseScrollLock = props.preventScroll === false ? undefined : acquireBodyScrollLock()
    const onDocumentPointerDown = (event: PointerEvent) => {
      const target = event.target

      if (!(target instanceof Node)) {
        return
      }

      if (contentElement?.contains(target) || triggerElement?.contains(target)) {
        return
      }

      event.preventDefault()
      requestClose(event)
    }
    const onDocumentFocusIn = (event: FocusEvent) => {
      const target = event.target

      if (!(target instanceof Node) || !contentElement || contentElement.contains(target)) {
        return
      }

      queueMicrotask(() => {
        focusContent(contentElement)
      })
    }
    const onDocumentKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return
      }

      requestClose(event)
    }

    document.addEventListener('pointerdown', onDocumentPointerDown, true)
    document.addEventListener('focusin', onDocumentFocusIn, true)
    document.addEventListener('keydown', onDocumentKeyDown, true)

    onCleanup(() => {
      document.removeEventListener('pointerdown', onDocumentPointerDown, true)
      document.removeEventListener('focusin', onDocumentFocusIn, true)
      document.removeEventListener('keydown', onDocumentKeyDown, true)
      releaseScrollLock?.()
      focusTrigger(triggerElement)
    })
  })

  function renderContent(content: () => JSX.Element): JSX.Element {
    return (
      <Show when={contentPresence.present()}>
        <div
          {...props.contentAttributes}
          {...contentPresence.dataAttrs()}
          ref={(element) => {
            contentElement = element
            contentPresence.setElement(element)
          }}
          id={contentId()}
          role="dialog"
          aria-modal="true"
          aria-labelledby={props.ariaLabelledBy}
          aria-describedby={props.ariaDescribedBy}
          tabIndex={-1}
          data-slot="content"
          style={props.styles?.content}
          class={cn(props.classes?.content)}
          onKeyDown={onContentKeyDown}
        >
          {content()}
        </div>
      </Show>
    )
  }

  return (
    <>
      <Show when={props.trigger}>
        <span
          ref={(element) => {
            triggerElement = element
          }}
          tabIndex={-1}
          data-slot="trigger"
          style={props.styles?.trigger}
          class={cn('outline-none', props.classes?.trigger)}
          onClick={() => {
            updateOpen(true)
          }}
        >
          {props.trigger}
        </span>
      </Show>

      <Show when={isPresent()}>
        <Portal>
          <Show
            when={props.overlay}
            fallback={<Show when={resolvedContent()}>{(content) => renderContent(content)}</Show>}
          >
            <Show when={overlayPresence.present() || contentPresence.present()}>
              <div
                data-slot="overlay"
                {...overlayPresence.dataAttrs()}
                ref={(element) => {
                  overlayPresence.setElement(element)
                }}
                style={props.styles?.overlay}
                class={cn(props.classes?.overlay)}
              >
                <Show when={resolvedContent()}>{(content) => renderContent(content)}</Show>
              </div>
            </Show>
          </Show>
        </Portal>
      </Show>
    </>
  )
}
