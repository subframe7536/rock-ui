import type { JSX } from 'solid-js'
import { Show, createEffect, createMemo, onCleanup } from 'solid-js'
import { Portal } from 'solid-js/web'

import type { SlotClasses, SlotStyles } from '../../shared/types'
import { useControllableValue } from '../../shared/use-controllable-value'
import { useTransitionPresence } from '../../shared/use-transition-presence'
import { cn, useId } from '../../shared/utils'

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'area[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'iframe',
  'object',
  'embed',
  '[contenteditable]',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

let scrollLockDepth = 0
let previousBodyOverflow = ''

function acquireBodyScrollLock(): () => void {
  if (typeof document === 'undefined') {
    return () => undefined
  }

  if (scrollLockDepth === 0) {
    previousBodyOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
  }

  scrollLockDepth += 1

  let released = false

  return () => {
    if (released) {
      return
    }

    released = true
    scrollLockDepth = Math.max(0, scrollLockDepth - 1)

    if (scrollLockDepth === 0) {
      document.body.style.overflow = previousBodyOverflow
      previousBodyOverflow = ''
    }
  }
}

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (element) => {
      if (element.tabIndex < 0) {
        return false
      }

      if (element.hasAttribute('disabled') || element.getAttribute('aria-hidden') === 'true') {
        return false
      }

      return (element as HTMLElement & { inert?: boolean }).inert !== true
    },
  )
}

function focusContent(container: HTMLElement | undefined): void {
  if (!container) {
    return
  }

  const [firstFocusable] = getFocusableElements(container)
  ;(firstFocusable ?? container).focus()
}

function focusTrigger(triggerElement: HTMLElement | undefined): void {
  if (!triggerElement) {
    return
  }

  const [firstFocusable] = getFocusableElements(triggerElement)
  ;(firstFocusable ?? triggerElement).focus()
}

type ModalShellSlot = 'trigger' | 'overlay' | 'content'

export interface ModalShellContentContext {
  close: () => void
}

export interface ModalShellProps {
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
  content?: JSX.Element | ((context: ModalShellContentContext) => JSX.Element)
  /** Slot-based class overrides for the trigger, overlay, and content elements. */
  classes?: SlotClasses<ModalShellSlot>
  /** Slot-based style overrides for the trigger, overlay, and content elements. */
  styles?: SlotStyles<ModalShellSlot>
  /** Additional attributes applied to the content element. */
  contentAttributes?: Record<string, string | number | boolean | undefined>
  /** Id of the label element for the content. */
  ariaLabelledBy?: string
  /** Id of the description element for the content. */
  ariaDescribedBy?: string
}

export function ModalShell(props: ModalShellProps): JSX.Element {
  const rootId = useId(() => props.id, 'modal')
  const contentId = createMemo(() => `${rootId()}-content`)
  const [open, setOpen] = useControllableValue<boolean>({
    value: () => props.open,
    defaultValue: () => props.defaultOpen ?? false,
  })
  const isOpen = createMemo(() => Boolean(open()))

  let triggerElement: HTMLSpanElement | undefined
  let contentElement: HTMLDivElement | undefined
  let previousFocusedElement: HTMLElement | null = null

  function updateOpen(nextOpen: boolean): void {
    if (nextOpen === isOpen()) {
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
    if (event.key !== 'Tab' || !contentElement) {
      return
    }

    const focusableElements = getFocusableElements(contentElement)

    if (focusableElements.length === 0) {
      event.preventDefault()
      contentElement.focus()
      return
    }

    const firstFocusable = focusableElements[0]
    const lastFocusable = focusableElements[focusableElements.length - 1]

    if (!firstFocusable || !lastFocusable) {
      event.preventDefault()
      contentElement.focus()
      return
    }

    const activeElement = document.activeElement

    if (event.shiftKey) {
      if (activeElement === contentElement || activeElement === firstFocusable) {
        event.preventDefault()
        lastFocusable.focus()
      }

      return
    }

    if (activeElement === lastFocusable) {
      event.preventDefault()
      firstFocusable.focus()
    }
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
    open: () => Boolean(isOpen() && props.overlay),
    mode: () => 'both',
  })
  const contentPresence = useTransitionPresence({
    open: () => Boolean(isOpen() && resolvedContent()),
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

    previousFocusedElement =
      document.activeElement instanceof HTMLElement ? document.activeElement : null

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

      if (previousFocusedElement?.isConnected) {
        previousFocusedElement.focus()
      } else {
        focusTrigger(triggerElement)
      }

      previousFocusedElement = null
    })
  })

  function ContentSlot(): JSX.Element {
    return (
      <Show when={resolvedContent()}>
        {(content) => (
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
        )}
      </Show>
    )
  }

  return (
    <>
      <Show when={props.trigger !== undefined && props.trigger !== null}>
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
          <Show when={props.overlay} fallback={<ContentSlot />}>
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
                <ContentSlot />
              </div>
            </Show>
          </Show>
        </Portal>
      </Show>
    </>
  )
}
