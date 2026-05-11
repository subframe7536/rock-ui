import type { ClassValue } from 'cls-variant'
import type { JSX } from 'solid-js'
import { Show, createEffect, createMemo, onCleanup } from 'solid-js'
import { Portal } from 'solid-js/web'

import { useControllableValue } from '../../shared/use-controllable-value'
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

export interface ModalShellProps {
  id?: string
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  dismissible?: boolean
  onClosePrevent?: () => void
  preventScroll?: boolean
  overlay?: boolean
  overlayContainsContent?: boolean
  trigger?: JSX.Element
  content?: JSX.Element | ((context: ModalShellContentContext) => JSX.Element)
  triggerClass?: ClassValue
  overlayClass?: ClassValue
  contentClass?: ClassValue
  triggerStyle?: JSX.CSSProperties
  overlayStyle?: JSX.CSSProperties
  contentStyle?: JSX.CSSProperties
  contentAttributes?: Record<string, string | number | boolean | undefined>
  ariaLabelledBy?: string
  ariaDescribedBy?: string
}

export interface ModalShellContentContext {
  close: () => void
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

  createEffect(() => {
    if (!isOpen() || typeof document === 'undefined') {
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

  const close = () => {
    updateOpen(false)
  }

  const content = createMemo<JSX.Element | undefined>(() => {
    const resolvedContent =
      typeof props.content === 'function' ? props.content({ close }) : props.content

    if (resolvedContent === undefined || resolvedContent === null) {
      return undefined
    }

    return (
      <div
        {...props.contentAttributes}
        ref={(element) => {
          contentElement = element
        }}
        id={contentId()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={props.ariaLabelledBy}
        aria-describedby={props.ariaDescribedBy}
        tabIndex={-1}
        data-slot="content"
        data-expanded=""
        style={props.contentStyle}
        class={cn(props.contentClass)}
        onKeyDown={onContentKeyDown}
      >
        {resolvedContent}
      </div>
    )
  })

  const portalContent = createMemo<JSX.Element>(() => {
    const renderedContent = content()

    if (props.overlay && props.overlayContainsContent) {
      return (
        <div
          data-slot="overlay"
          data-expanded=""
          style={props.overlayStyle}
          class={cn(props.overlayClass)}
        >
          {renderedContent}
        </div>
      )
    }

    return (
      <>
        <Show when={props.overlay}>
          <div
            data-slot="overlay"
            data-expanded=""
            style={props.overlayStyle}
            class={cn(props.overlayClass)}
          />
        </Show>

        {renderedContent}
      </>
    )
  })

  return (
    <>
      <Show when={props.trigger !== undefined && props.trigger !== null}>
        <span
          ref={(element) => {
            triggerElement = element
          }}
          tabIndex={-1}
          data-slot="trigger"
          style={props.triggerStyle}
          class={cn('outline-none', props.triggerClass)}
          onClick={() => {
            updateOpen(true)
          }}
        >
          {props.trigger}
        </span>
      </Show>

      <Show when={isOpen()}>
        <Portal>{portalContent()}</Portal>
      </Show>
    </>
  )
}
