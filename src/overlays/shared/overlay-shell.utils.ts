const FOCUSABLE_SELECTOR_PARTS = [
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
] as const

export const FOCUSABLE_SELECTOR = FOCUSABLE_SELECTOR_PARTS.join(',')

let scrollLockDepth = 0
let previousBodyOverflow = ''

export function acquireBodyScrollLock(): () => void {
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

export function getFocusableElements(container: HTMLElement): HTMLElement[] {
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

export function focusWithoutScrolling(element: HTMLElement | undefined): void {
  if (!element) {
    return
  }

  try {
    element.focus({ preventScroll: true })
  } catch {
    element.focus()
  }
}

export function focusContent(container: HTMLElement | undefined): void {
  if (!container) {
    return
  }

  const [firstFocusable] = getFocusableElements(container)
  focusWithoutScrolling(firstFocusable ?? container)
}

export function focusTrigger(triggerElement: HTMLElement | undefined): void {
  if (!triggerElement) {
    return
  }

  const [firstFocusable] = getFocusableElements(triggerElement)
  focusWithoutScrolling(firstFocusable ?? triggerElement)
}
