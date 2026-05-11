import type { Accessor } from 'solid-js'
import { createEffect, createMemo, createSignal, onCleanup } from 'solid-js'

export type TransitionPresenceMotion = 'animation' | 'transition' | 'both' | 'none'

export interface UseTransitionPresenceOptions {
  open: Accessor<boolean>
  mode?: Accessor<TransitionPresenceMotion>
}

export interface TransitionPresenceState {
  dataAttrs: Accessor<{
    'data-closed'?: string
    'data-expanded'?: string
  }>
  present: Accessor<boolean>
  setElement: (element: HTMLElement | undefined) => void
}

/**
 * Keeps a disclosure element mounted until its exit motion fully settles.
 */
export function useTransitionPresence(
  options: UseTransitionPresenceOptions,
): TransitionPresenceState {
  const [present, setPresent] = createSignal(Boolean(options.open()))
  const dataAttrs = createMemo(() => {
    if (options.open()) {
      return { 'data-expanded': '' }
    }

    return { 'data-closed': '' }
  })

  let element: HTMLElement | undefined

  createEffect(() => {
    if (options.open()) {
      setPresent(true)
      return
    }

    if (!present()) {
      return
    }

    if (!element) {
      setPresent(false)
      return
    }

    const mode = options.mode?.() ?? 'animation'

    if (mode === 'none') {
      setPresent(false)
      return
    }

    const waitForAnimation = mode === 'animation' || mode === 'both'
    const waitForTransition = mode === 'transition' || mode === 'both'

    let cancelled = false
    let animationEnded = !waitForAnimation
    let transitionEnded = !waitForTransition

    const finish = () => {
      if (!cancelled && animationEnded && transitionEnded && !options.open()) {
        setPresent(false)
      }
    }

    const onAnimationEnd = (event: Event) => {
      if (cancelled || options.open() || event.target !== event.currentTarget) {
        return
      }

      animationEnded = true
      finish()
    }

    const onTransitionEnd = (event: Event) => {
      if (cancelled || options.open() || event.target !== event.currentTarget) {
        return
      }

      transitionEnded = true
      finish()
    }

    if (typeof element.getAnimations === 'function') {
      const animations = element.getAnimations({ subtree: false })

      if (animations.length > 0) {
        Promise.allSettled(animations.map((animation) => animation.finished)).then(() => {
          if (!cancelled && !options.open()) {
            setPresent(false)
          }
        })

        onCleanup(() => {
          cancelled = true
        })

        return
      }
    }

    if (waitForAnimation) {
      element.addEventListener('animationend', onAnimationEnd)
    }

    if (waitForTransition) {
      element.addEventListener('transitionend', onTransitionEnd)
    }

    onCleanup(() => {
      cancelled = true

      if (waitForAnimation) {
        element?.removeEventListener('animationend', onAnimationEnd)
      }

      if (waitForTransition) {
        element?.removeEventListener('transitionend', onTransitionEnd)
      }
    })
  })

  createEffect(() => {
    if (present()) {
      return
    }

    element = undefined
  })

  return {
    dataAttrs,
    present,
    setElement(nextElement) {
      element = nextElement
    },
  }
}
