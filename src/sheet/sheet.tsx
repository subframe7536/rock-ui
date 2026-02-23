import * as KobalteDialog from '@kobalte/core/dialog'
import type { DialogContentProps as KobalteDialogContentProps } from '@kobalte/core/dialog'
import type { JSX } from 'solid-js'
import { Show, children, mergeProps, onCleanup, splitProps } from 'solid-js'

import { Icon } from '../icon'
import { cn } from '../shared/utils'

import { sheetContentVariants } from './sheet.class'

type SheetSide = 'left' | 'right' | 'top' | 'bottom'

export interface SheetClasses {
  trigger?: string
  overlay?: string
  content?: string
  header?: string
  wrapper?: string
  title?: string
  description?: string
  actions?: string
  close?: string
  body?: string
  footer?: string
}

export interface SheetBaseProps {
  id?: string
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  title?: JSX.Element
  description?: JSX.Element
  overlay?: boolean
  transition?: boolean
  side?: SheetSide
  inset?: boolean
  close?: boolean | JSX.Element
  dismissible?: boolean
  onClosePrevent?: () => void
  header?: JSX.Element
  body?: JSX.Element
  footer?: JSX.Element
  actions?: JSX.Element
  classes?: SheetClasses
  children?: JSX.Element
}

export type SheetProps = SheetBaseProps &
  Omit<KobalteDialog.DialogRootProps, keyof SheetBaseProps | 'children' | 'class'>

export function Sheet(props: SheetProps): JSX.Element {
  const merged = mergeProps(
    {
      overlay: true,
      transition: true,
      side: 'right' as const,
      inset: false,
      close: true,
      dismissible: true,
    },
    props,
  ) as SheetProps
  const [behaviorProps, contentProps, rootProps] = splitProps(
    merged,
    ['overlay', 'transition', 'side', 'inset', 'close', 'dismissible', 'onClosePrevent'],
    ['title', 'description', 'header', 'body', 'footer', 'actions', 'classes', 'children'],
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
    event: Parameters<NonNullable<KobalteDialogContentProps['onPointerDownOutside']>>[0],
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
    event: Parameters<NonNullable<KobalteDialogContentProps['onInteractOutside']>>[0],
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
    event: Parameters<NonNullable<KobalteDialogContentProps['onEscapeKeyDown']>>[0],
  ) => {
    if (behaviorProps.dismissible) {
      return
    }

    event.preventDefault()
    preventDismiss()
  }

  const hasDefaultHeader = () =>
    Boolean(
      contentProps.title || contentProps.description || contentProps.actions || behaviorProps.close,
    )

  const computedContentClass = () => {
    const transitionClass = behaviorProps.transition
      ? ''
      : 'transition-none data-expanded:animate-none data-closed:animate-none'

    return sheetContentVariants(
      {
        side: behaviorProps.side,
        inset: behaviorProps.inset,
      },
      transitionClass,
      contentProps.classes?.content,
    )
  }

  const content = () => (
    <KobalteDialog.Content
      data-slot="content"
      data-side={behaviorProps.side}
      class={computedContentClass()}
      onPointerDownOutside={onPointerDownOutside}
      onInteractOutside={onInteractOutside}
      onEscapeKeyDown={onEscapeKeyDown}
    >
      <Show when={contentProps.header || hasDefaultHeader()}>
        <div
          data-slot="header"
          class={cn('flex items-start gap-2 p-4', contentProps.classes?.header)}
        >
          <Show
            when={contentProps.header}
            fallback={
              <>
                <div
                  data-slot="wrapper"
                  class={cn('min-w-0 flex-1 grid gap-0.5', contentProps.classes?.wrapper)}
                >
                  <Show when={contentProps.title}>
                    <KobalteDialog.Title
                      data-slot="title"
                      class={cn(
                        'text-foreground text-base font-medium',
                        contentProps.classes?.title,
                      )}
                    >
                      {contentProps.title}
                    </KobalteDialog.Title>
                  </Show>

                  <Show when={contentProps.description}>
                    <KobalteDialog.Description
                      data-slot="description"
                      class={cn('text-muted-foreground text-sm', contentProps.classes?.description)}
                    >
                      {contentProps.description}
                    </KobalteDialog.Description>
                  </Show>
                </div>

                <Show when={contentProps.actions}>
                  <div
                    data-slot="actions"
                    class={cn(
                      'ms-auto inline-flex shrink-0 items-center gap-2',
                      contentProps.classes?.actions,
                    )}
                  >
                    {contentProps.actions}
                  </div>
                </Show>

                <Show when={behaviorProps.close !== false}>
                  <KobalteDialog.CloseButton
                    data-slot="close"
                    class={cn(
                      'inline-flex size-8 shrink-0 items-center justify-center rounded-md border border-transparent text-muted-foreground transition-colors hover:(bg-accent text-accent-foreground) focus-visible:(border-ring ring-3 ring-ring/50)',
                      contentProps.classes?.close,
                    )}
                    aria-label="Close"
                  >
                    <Show when={behaviorProps.close !== true} fallback={<Icon name="icon-close" />}>
                      {behaviorProps.close as JSX.Element}
                    </Show>
                  </KobalteDialog.CloseButton>
                </Show>
              </>
            }
          >
            {contentProps.header}
          </Show>
        </div>
      </Show>

      <Show when={contentProps.body}>
        <div
          data-slot="body"
          class={cn(
            'flex-1 overflow-auto',
            contentProps.header || hasDefaultHeader() ? 'px-4 pb-4 pt-0' : 'p-4',
            contentProps.classes?.body,
          )}
        >
          {contentProps.body}
        </div>
      </Show>

      <Show when={contentProps.footer}>
        <div
          data-slot="footer"
          class={cn('mt-auto flex flex-col gap-2 p-4', contentProps.classes?.footer)}
        >
          {contentProps.footer}
        </div>
      </Show>
    </KobalteDialog.Content>
  )

  const layer = () => (
    <>
      <Show when={behaviorProps.overlay}>
        <KobalteDialog.Overlay
          data-slot="overlay"
          class={cn(
            'fixed inset-0 z-50 bg-black/10 supports-backdrop-filter:backdrop-blur-xs data-expanded:(animate-in fade-in-0) data-closed:(animate-out fade-out-0) data-ending-style:opacity-0 data-starting-style:opacity-0 duration-100',
            contentProps.classes?.overlay,
          )}
        />
      </Show>

      {content()}
    </>
  )

  return (
    <KobalteDialog.Root modal {...rootProps}>
      <Show when={hasTrigger()}>
        <KobalteDialog.Trigger as="span" data-slot="trigger" class={contentProps.classes?.trigger}>
          {triggerChildren()}
        </KobalteDialog.Trigger>
      </Show>

      <KobalteDialog.Portal>{layer()}</KobalteDialog.Portal>
    </KobalteDialog.Root>
  )
}
