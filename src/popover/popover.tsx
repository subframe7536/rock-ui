import * as KobalteHoverCard from '@kobalte/core/hover-card'
import * as KobaltePopover from '@kobalte/core/popover'
import type { PopoverContentProps as KobaltePopoverContentProps } from '@kobalte/core/popover'
import type { JSX } from 'solid-js'
import { Show, children, mergeProps, onCleanup, splitProps } from 'solid-js'

import { cn } from '../shared/utils'

import { popoverContentVariants } from './popover.class'

type PopoverMode = 'click' | 'hover'
type PopoverSide = 'top' | 'right' | 'bottom' | 'left'
type PopoverPlacement =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'right'
  | 'right-start'
  | 'right-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end'

export interface PopoverClasses {
  trigger?: string
  content?: string
  body?: string
}

export interface PopoverBaseProps {
  id?: string
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  mode?: PopoverMode
  placement?: PopoverPlacement
  gutter?: number
  openDelay?: number
  closeDelay?: number
  content?: JSX.Element
  dismissible?: boolean
  classes?: PopoverClasses
  onClosePrevent?: () => void
  children?: JSX.Element
}

type PopoverRootProps = Omit<KobaltePopover.PopoverRootProps, 'children' | 'class'> &
  Omit<KobalteHoverCard.HoverCardRootProps, 'children' | 'class'>

export type PopoverProps = PopoverBaseProps & Omit<PopoverRootProps, keyof PopoverBaseProps>

function resolvePopoverSide(placement?: PopoverPlacement): PopoverSide {
  if (placement?.startsWith('right')) {
    return 'right'
  }

  if (placement?.startsWith('bottom')) {
    return 'bottom'
  }

  if (placement?.startsWith('left')) {
    return 'left'
  }

  return 'top'
}

export function Popover(props: PopoverProps): JSX.Element {
  const merged = mergeProps(
    {
      mode: 'click' as const,
      placement: 'bottom' as const,
      gutter: 8,
      openDelay: 0,
      closeDelay: 0,
      dismissible: true,
    },
    props,
  ) as PopoverProps
  const [behaviorProps, contentProps, rootProps] = splitProps(
    merged,
    ['mode', 'placement', 'dismissible', 'onClosePrevent'],
    ['content', 'classes', 'children'],
  )

  const triggerChildren = children(() => contentProps.children)
  const hasTrigger = () => triggerChildren.toArray().length > 0

  const preventDismiss = () => {
    behaviorProps.onClosePrevent?.()
  }

  let hasPreventedPointerAttempt = false
  let resetPreventedPointerAttemptTimeout: ReturnType<typeof setTimeout> | undefined

  const schedulePreventedPointerAttemptReset = () => {
    if (resetPreventedPointerAttemptTimeout !== undefined) {
      clearTimeout(resetPreventedPointerAttemptTimeout)
    }

    resetPreventedPointerAttemptTimeout = setTimeout(() => {
      hasPreventedPointerAttempt = false
      resetPreventedPointerAttemptTimeout = undefined
    }, 0)
  }

  onCleanup(() => {
    if (resetPreventedPointerAttemptTimeout !== undefined) {
      clearTimeout(resetPreventedPointerAttemptTimeout)
    }
  })

  const onPointerDownOutside = (
    event: Parameters<NonNullable<KobaltePopoverContentProps['onPointerDownOutside']>>[0],
  ) => {
    if (behaviorProps.dismissible) {
      return
    }

    event.preventDefault()
    hasPreventedPointerAttempt = true
    schedulePreventedPointerAttemptReset()
    preventDismiss()
  }

  const onInteractOutside = (
    event: Parameters<NonNullable<KobaltePopoverContentProps['onInteractOutside']>>[0],
  ) => {
    if (behaviorProps.dismissible) {
      return
    }

    if (event.defaultPrevented) {
      return
    }

    if (hasPreventedPointerAttempt) {
      event.preventDefault()
      return
    }

    event.preventDefault()
    preventDismiss()
  }

  const onEscapeKeyDown = (
    event: Parameters<NonNullable<KobaltePopoverContentProps['onEscapeKeyDown']>>[0],
  ) => {
    if (behaviorProps.dismissible) {
      return
    }

    event.preventDefault()
    preventDismiss()
  }

  const side = () => resolvePopoverSide(behaviorProps.placement)

  const content = () => {
    if (contentProps.content === undefined || contentProps.content === null) {
      return undefined
    }

    return (
      <div
        data-slot="body"
        class={cn(
          'max-h-$kb-popper-content-available-height overflow-auto',
          contentProps.classes?.body,
        )}
      >
        {contentProps.content}
      </div>
    )
  }

  const clickContent = () => (
    <KobaltePopover.Content
      data-slot="content"
      class={popoverContentVariants({ side: side() }, contentProps.classes?.content)}
      onPointerDownOutside={onPointerDownOutside}
      onInteractOutside={onInteractOutside}
      onEscapeKeyDown={onEscapeKeyDown}
    >
      {content()}
    </KobaltePopover.Content>
  )

  const hoverContent = () => (
    <KobalteHoverCard.Content
      data-slot="content"
      class={popoverContentVariants({ side: side() }, contentProps.classes?.content)}
    >
      {content()}
    </KobalteHoverCard.Content>
  )

  const hoverRoot = () => (
    <KobalteHoverCard.Root placement={behaviorProps.placement} overflowPadding={-4} {...rootProps}>
      <Show when={hasTrigger()}>
        <KobalteHoverCard.Trigger
          as="span"
          data-slot="trigger"
          class={contentProps.classes?.trigger}
        >
          {triggerChildren()}
        </KobalteHoverCard.Trigger>
      </Show>

      <KobalteHoverCard.Portal>{hoverContent()}</KobalteHoverCard.Portal>
    </KobalteHoverCard.Root>
  )

  const clickRoot = () => (
    <KobaltePopover.Root placement={behaviorProps.placement} overflowPadding={-4} {...rootProps}>
      <Show when={hasTrigger()}>
        <KobaltePopover.Trigger as="span" data-slot="trigger" class={contentProps.classes?.trigger}>
          {triggerChildren()}
        </KobaltePopover.Trigger>
      </Show>

      <KobaltePopover.Portal>{clickContent()}</KobaltePopover.Portal>
    </KobaltePopover.Root>
  )

  return (
    <Show when={behaviorProps.mode === 'hover'} fallback={clickRoot()}>
      {hoverRoot()}
    </Show>
  )
}
