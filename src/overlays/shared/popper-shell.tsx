import {
  autoUpdate,
  computePosition,
  flip,
  hide,
  offset,
  platform,
  shift,
  size,
} from '@floating-ui/dom'
import type { Middleware, Placement } from '@floating-ui/dom'
import type { Accessor, JSX } from 'solid-js'
import { Show, createEffect, createMemo, createSignal, mergeProps, onCleanup } from 'solid-js'
import { Portal } from 'solid-js/web'

import { useControllableValue } from '../../shared/use-controllable-value'
import { useTransitionPresence } from '../../shared/use-transition-presence'
import { cn, useId } from '../../shared/utils'

import {
  acquireBodyScrollLock,
  focusContent,
  focusTrigger,
  getFocusableElements,
} from './overlay-shell.utils'

type FloatingSide = 'top' | 'right' | 'bottom' | 'left'

export type PopperPlacement = Placement

let popperTestPlacementAccessor: Accessor<string> | undefined

interface PopperShellControls {
  close: () => void
  isOpen: boolean
  open: () => void
  toggle: () => void
}

interface PopperShellInteractOutsideEvent {
  defaultPrevented: boolean
  originalEvent: FocusEvent
  preventDefault: () => void
}

interface PopperShellContentProps {
  'aria-describedby'?: string
  'aria-labelledby'?: string
  'aria-modal'?: true

  'data-closed'?: string
  'data-expanded'?: string

  id: string
  onBlur?: () => void
  onFocus?: () => void
  onKeyDown: (event: KeyboardEvent) => void
  onPointerEnter?: () => void
  onPointerLeave?: () => void
  ref: (element: HTMLDivElement) => void
  role?: JSX.HTMLAttributes<HTMLDivElement>['role']
  tabIndex: number
}

export interface PopperShellProps {
  ariaDescribedBy?: string
  ariaLabelledBy?: string
  closeOnOutsideFocus?: boolean
  content: (context: PopperShellContentContext) => JSX.Element
  defaultOpen?: boolean
  describeTrigger?: boolean
  detachedPadding?: number
  disabled?: boolean
  dismissible?: boolean
  fitViewport?: boolean
  flip?: boolean | string
  forceMount?: boolean
  gutter?: number
  hideWhenDetached?: boolean
  id?: string
  modal?: boolean
  onClosePrevent?: () => void
  onEscapeKeyDown?: (event: KeyboardEvent) => void
  onInteractOutside?: (event: PopperShellInteractOutsideEvent) => void
  onOpenChange?: (open: boolean) => void
  onPointerDownOutside?: (event: PointerEvent) => void
  onTriggerBlur?: (controls: PopperShellControls) => void
  onTriggerFocus?: (controls: PopperShellControls) => void
  onTriggerPointerEnter?: (controls: PopperShellControls) => void
  onTriggerPointerLeave?: (controls: PopperShellControls) => void
  onContentBlur?: (controls: PopperShellControls) => void
  onContentFocus?: (controls: PopperShellControls) => void
  onContentPointerEnter?: (controls: PopperShellControls) => void
  onContentPointerLeave?: (controls: PopperShellControls) => void
  open?: boolean
  overlap?: boolean
  overflowPadding?: number
  placement?: PopperPlacement
  positionerClass?: string
  positionerStyle?: JSX.CSSProperties
  preventScroll?: boolean
  role?: JSX.HTMLAttributes<HTMLDivElement>['role']
  sameWidth?: boolean
  shift?: number
  slide?: boolean
  toggleOnClick?: boolean
  trigger: JSX.Element
  triggerClass?: string
  triggerStyle?: JSX.CSSProperties
}

export interface PopperShellContentContext {
  close: () => void
  contentProps: PopperShellContentProps
  currentPlacement: Accessor<string>
}

const REVERSE_BASE_PLACEMENT: Record<FloatingSide, FloatingSide> = {
  top: 'bottom',
  right: 'left',
  bottom: 'top',
  left: 'right',
}

function resolveDirection(): 'ltr' | 'rtl' {
  if (typeof document === 'undefined') {
    return 'ltr'
  }

  return (document.dir || document.documentElement.dir || 'ltr') === 'rtl' ? 'rtl' : 'ltr'
}

function getTransformOrigin(placement: PopperPlacement, direction: 'ltr' | 'rtl'): string {
  const [basePlacement, alignment] = placement.split('-') as [
    FloatingSide,
    'start' | 'end' | undefined,
  ]
  const reversePlacement = REVERSE_BASE_PLACEMENT[basePlacement]

  if (!alignment) {
    return `${reversePlacement} center`
  }

  if (basePlacement === 'left' || basePlacement === 'right') {
    return `${reversePlacement} ${alignment === 'start' ? 'top' : 'bottom'}`
  }

  if (alignment === 'start') {
    return `${reversePlacement} ${direction === 'rtl' ? 'right' : 'left'}`
  }

  return `${reversePlacement} ${direction === 'rtl' ? 'left' : 'right'}`
}

export function setPopperTestPlacementAccessor(accessor: Accessor<string> | undefined): void {
  popperTestPlacementAccessor = accessor
}

export function PopperShell(props: PopperShellProps): JSX.Element {
  const merged = mergeProps(
    {
      closeOnOutsideFocus: true,
      detachedPadding: 0,
      dismissible: true,
      disabled: false,
      fitViewport: false,
      flip: true,
      forceMount: false,
      gutter: 0,
      hideWhenDetached: false,
      modal: false,
      overlap: false,
      overflowPadding: 4,
      placement: 'bottom' as PopperPlacement,
      sameWidth: false,
      shift: 0,
      slide: true,
      toggleOnClick: true,
    },
    props,
  )
  const rootId = useId(() => merged.id, 'popper')
  const contentId = createMemo(() => `${rootId()}-content`)
  const [open, setControlledOpen] = useControllableValue<boolean>({
    value: () => merged.open,
    defaultValue: () => merged.defaultOpen ?? false,
  })
  const isOpen = createMemo(() => Boolean(open()) && !merged.disabled)
  const [contentElement, setContentElement] = createSignal<HTMLDivElement | undefined>()
  const [positionerElement, setPositionerElement] = createSignal<HTMLDivElement | undefined>()
  const [triggerElement, setTriggerElement] = createSignal<HTMLSpanElement | undefined>()
  const [internalCurrentPlacement, setInternalCurrentPlacement] = createSignal<string>('bottom')
  const currentPlacement = createMemo(
    () => popperTestPlacementAccessor?.() ?? internalCurrentPlacement(),
  )
  const contentPresence = useTransitionPresence({
    open: () => Boolean((isOpen() || merged.forceMount) && !merged.disabled),
    mode: () => 'both',
  })

  let cleanupAutoUpdate: (() => void) | undefined

  function setOpen(nextOpen: boolean): void {
    if (merged.disabled || nextOpen === isOpen()) {
      return
    }

    setControlledOpen(nextOpen)
    merged.onOpenChange?.(nextOpen)
  }

  function getControls(): PopperShellControls {
    return {
      close: () => {
        setOpen(false)
      },
      isOpen: isOpen(),
      open: () => {
        setOpen(true)
      },
      toggle: () => {
        setOpen(!isOpen())
      },
    }
  }

  createEffect(() => {
    setInternalCurrentPlacement(merged.placement)
  })

  createEffect(() => {
    if (!contentPresence.present()) {
      cleanupAutoUpdate?.()
      cleanupAutoUpdate = undefined
      setContentElement(undefined)
      setPositionerElement(undefined)
      contentPresence.setElement(undefined)
    }
  })

  createEffect(() => {
    const trigger = triggerElement()
    const positioner = positionerElement()

    if (!contentPresence.present() || !trigger || !positioner) {
      return
    }

    const detachedPadding = merged.detachedPadding
    const direction = resolveDirection()
    const fitViewport = merged.fitViewport
    const flipValue = merged.flip
    const gutter = merged.gutter
    const hideWhenDetached = merged.hideWhenDetached
    const overflowPadding = merged.overflowPadding
    const overlap = merged.overlap
    const placement = merged.placement
    const sameWidth = merged.sameWidth
    const shiftAmount = merged.shift
    const slide = merged.slide

    const updatePosition = async () => {
      if (!triggerElement() || !positionerElement()) {
        return
      }

      const nextTrigger = triggerElement()
      const nextPositioner = positionerElement()

      if (!nextTrigger || !nextPositioner) {
        return
      }

      const middleware: Middleware[] = [
        offset(({ placement }) => {
          const hasAlignment = Boolean(placement.split('-')[1])

          return {
            mainAxis: gutter,
            crossAxis: !hasAlignment ? shiftAmount : undefined,
            alignmentAxis: shiftAmount,
          }
        }),
      ]

      if (flipValue !== false) {
        middleware.push(
          flip({
            padding: overflowPadding,
            fallbackPlacements:
              typeof flipValue === 'string'
                ? (flipValue.split(' ') as PopperPlacement[])
                : undefined,
          }),
        )
      }

      if (slide || overlap) {
        middleware.push(
          shift({
            mainAxis: slide,
            crossAxis: overlap,
            padding: overflowPadding,
          }),
        )
      }

      middleware.push(
        size({
          padding: overflowPadding,
          apply({ availableHeight, availableWidth, rects }) {
            const referenceWidth = Math.round(rects.reference.width)

            nextPositioner.style.setProperty('--mo-popper-anchor-width', `${referenceWidth}px`)
            nextPositioner.style.setProperty(
              '--mo-popper-content-available-width',
              `${Math.floor(availableWidth)}px`,
            )
            nextPositioner.style.setProperty(
              '--mo-popper-content-available-height',
              `${Math.floor(availableHeight)}px`,
            )
            nextPositioner.style.setProperty(
              '--mo-popper-content-overflow-padding',
              `${overflowPadding}px`,
            )

            if (sameWidth) {
              nextPositioner.style.width = `${referenceWidth}px`
            }

            if (fitViewport) {
              nextPositioner.style.maxWidth = `${Math.floor(availableWidth)}px`
              nextPositioner.style.maxHeight = `${Math.floor(availableHeight)}px`
            }
          },
        }),
      )

      if (hideWhenDetached) {
        middleware.push(hide({ padding: detachedPadding }))
      }

      const position = await computePosition(nextTrigger, nextPositioner, {
        placement,
        strategy: 'absolute',
        middleware,
        platform: {
          ...platform,
          isRTL: () => direction === 'rtl',
        },
      })

      setInternalCurrentPlacement(position.placement)
      nextPositioner.style.setProperty(
        '--mo-popper-content-transform-origin',
        getTransformOrigin(position.placement, direction),
      )

      Object.assign(nextPositioner.style, {
        left: '0',
        top: '0',
        transform: `translate3d(${Math.round(position.x)}px, ${Math.round(position.y)}px, 0)`,
        visibility:
          hideWhenDetached && position.middlewareData.hide?.referenceHidden ? 'hidden' : 'visible',
      })
    }

    cleanupAutoUpdate = autoUpdate(trigger, positioner, updatePosition)
    void updatePosition()

    onCleanup(() => {
      cleanupAutoUpdate?.()
      cleanupAutoUpdate = undefined
    })
  })

  createEffect(() => {
    if (!contentPresence.present() || typeof document === 'undefined') {
      return
    }

    const releaseScrollLock =
      merged.modal || merged.preventScroll ? acquireBodyScrollLock() : undefined

    if (merged.modal) {
      const currentContent = contentElement()

      queueMicrotask(() => {
        focusContent(currentContent)
      })
    }

    const onDocumentPointerDown = (event: PointerEvent) => {
      const target = event.target

      if (!(target instanceof Node)) {
        return
      }

      if (contentElement()?.contains(target) || triggerElement()?.contains(target)) {
        return
      }

      merged.onPointerDownOutside?.(event)

      if (event.defaultPrevented) {
        return
      }

      if (merged.dismissible) {
        setOpen(false)
        return
      }

      event.preventDefault()
      merged.onClosePrevent?.()
    }
    const onDocumentFocusIn = (event: FocusEvent) => {
      const target = event.target

      if (!(target instanceof Node)) {
        return
      }

      if (contentElement()?.contains(target) || triggerElement()?.contains(target)) {
        return
      }

      const interactEvent: PopperShellInteractOutsideEvent = {
        defaultPrevented: false,
        originalEvent: event,
        preventDefault() {
          this.defaultPrevented = true
        },
      }

      merged.onInteractOutside?.(interactEvent)

      if (interactEvent.defaultPrevented) {
        return
      }

      if (merged.closeOnOutsideFocus && merged.dismissible) {
        setOpen(false)
        return
      }

      if (!merged.dismissible) {
        event.preventDefault()
        merged.onClosePrevent?.()

        if (merged.modal) {
          const currentContent = contentElement()

          queueMicrotask(() => {
            focusContent(currentContent)
          })
        }
      }
    }
    const onDocumentKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return
      }

      merged.onEscapeKeyDown?.(event)

      if (event.defaultPrevented) {
        return
      }

      if (merged.dismissible) {
        setOpen(false)
        return
      }

      event.preventDefault()
      merged.onClosePrevent?.()
    }

    document.addEventListener('pointerdown', onDocumentPointerDown, true)
    document.addEventListener('focusin', onDocumentFocusIn, true)
    document.addEventListener('keydown', onDocumentKeyDown, true)

    onCleanup(() => {
      document.removeEventListener('pointerdown', onDocumentPointerDown, true)
      document.removeEventListener('focusin', onDocumentFocusIn, true)
      document.removeEventListener('keydown', onDocumentKeyDown, true)
      releaseScrollLock?.()
      focusTrigger(triggerElement())
    })
  })

  function onContentKeyDown(event: KeyboardEvent): void {
    const currentContent = contentElement()

    if (event.key !== 'Tab' || !currentContent || !merged.modal) {
      return
    }

    const focusableElements = getFocusableElements(currentContent)

    if (focusableElements.length === 0) {
      event.preventDefault()
      currentContent.focus()
      return
    }

    const firstFocusable = focusableElements[0]
    const lastFocusable = focusableElements[focusableElements.length - 1]

    if (!firstFocusable || !lastFocusable) {
      event.preventDefault()
      currentContent.focus()
      return
    }

    const activeElement = document.activeElement

    if (event.shiftKey) {
      if (activeElement === currentContent || activeElement === firstFocusable) {
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

  return (
    <>
      <span
        ref={setTriggerElement}
        tabIndex={-1}
        data-slot="trigger"
        aria-controls={contentPresence.present() ? contentId() : undefined}
        aria-describedby={
          merged.describeTrigger && contentPresence.present() ? contentId() : undefined
        }
        aria-expanded={isOpen()}
        style={merged.triggerStyle}
        class={cn('outline-none', merged.triggerClass)}
        onBlur={() => {
          merged.onTriggerBlur?.(getControls())
        }}
        onClick={() => {
          if (merged.toggleOnClick) {
            getControls().toggle()
          }
        }}
        onFocus={() => {
          merged.onTriggerFocus?.(getControls())
        }}
        onPointerEnter={() => {
          merged.onTriggerPointerEnter?.(getControls())
        }}
        onPointerLeave={() => {
          merged.onTriggerPointerLeave?.(getControls())
        }}
      >
        {merged.trigger}
      </span>

      <Show when={contentPresence.present()}>
        <Portal>
          <div
            ref={setPositionerElement}
            data-slot="positioner"
            style={merged.positionerStyle}
            class={cn('left-0 top-0 fixed z-50', merged.positionerClass)}
          >
            {merged.content({
              close: () => {
                setOpen(false)
              },
              contentProps: {
                'aria-describedby': merged.ariaDescribedBy,
                'aria-labelledby': merged.ariaLabelledBy,
                'aria-modal': merged.modal ? true : undefined,
                ...contentPresence.dataAttrs(),
                id: contentId(),
                onBlur: () => {
                  merged.onContentBlur?.(getControls())
                },
                onFocus: () => {
                  merged.onContentFocus?.(getControls())
                },
                onKeyDown: onContentKeyDown,
                onPointerEnter: () => {
                  merged.onContentPointerEnter?.(getControls())
                },
                onPointerLeave: () => {
                  merged.onContentPointerLeave?.(getControls())
                },
                ref: (element) => {
                  setContentElement(element)
                  contentPresence.setElement(element)
                },
                role: merged.role,
                tabIndex: -1,
              },
              currentPlacement,
            })}
          </div>
        </Portal>
      </Show>
    </>
  )
}
