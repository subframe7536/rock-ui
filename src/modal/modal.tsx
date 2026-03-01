import * as KobalteDialog from '@kobalte/core/dialog'
import type { DialogContentProps as KobalteDialogContentProps } from '@kobalte/core/dialog'
import type { JSX } from 'solid-js'
import { Show, mergeProps, onCleanup, splitProps } from 'solid-js'

import { Icon } from '../icon'
import type { SlotClasses } from '../shared/slot-class'
import { cn } from '../shared/utils'

import { modalContentVariants, modalOverlayVariants } from './modal.class'

type ModalSlots =
  | 'trigger'
  | 'overlay'
  | 'dialog'
  | 'header'
  | 'wrapper'
  | 'title'
  | 'description'
  | 'actions'
  | 'close'
  | 'body'
  | 'footer'

export type ModalClasses = SlotClasses<ModalSlots>

export interface ModalBaseProps {
  id?: string
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  title?: JSX.Element
  description?: JSX.Element
  overlay?: boolean
  scrollable?: boolean
  transition?: boolean
  fullscreen?: boolean
  close?: boolean | JSX.Element
  dismissible?: boolean
  onClosePrevent?: () => void
  header?: JSX.Element
  body?: JSX.Element
  footer?: JSX.Element
  actions?: JSX.Element
  classes?: ModalClasses
}

export type ModalProps = ModalBaseProps &
  Omit<KobalteDialog.DialogRootProps, keyof ModalBaseProps | 'class'>

export function Modal(props: ModalProps): JSX.Element {
  const merged = mergeProps(
    {
      overlay: true,
      transition: true,
      close: true,
      dismissible: true,
    },
    props,
  ) as ModalProps
  const [rootStateProps, behaviorProps, contentProps, rootProps] = splitProps(
    merged,
    ['id', 'open', 'defaultOpen', 'onOpenChange'],
    ['overlay', 'scrollable', 'transition', 'fullscreen', 'close', 'dismissible', 'onClosePrevent'],
    ['title', 'description', 'header', 'body', 'footer', 'actions', 'classes', 'children'],
  )

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
    if (behaviorProps.dismissible || event.defaultPrevented) {
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
  const hasHeader = () => Boolean(contentProps.header || hasDefaultHeader())
  const hasBody = () => Boolean(contentProps.body)

  const contentLayout = () => {
    if (behaviorProps.fullscreen) {
      return 'fullscreen'
    }

    if (behaviorProps.scrollable) {
      return 'scrollable'
    }

    return 'default'
  }

  const dialog = () => (
    <KobalteDialog.Content
      data-slot="dialog"
      class={modalContentVariants(
        {
          layout: contentLayout(),
          transition: behaviorProps.transition,
        },
        contentProps.classes?.dialog,
      )}
      onPointerDownOutside={onPointerDownOutside}
      onInteractOutside={onInteractOutside}
      onEscapeKeyDown={onEscapeKeyDown}
    >
      <Show when={hasHeader()}>
        <div
          data-slot="header"
          class={cn(
            'flex items-start gap-2 p-4',
            hasBody() && 'border-border border-b',
            contentProps.classes?.header,
          )}
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
                      class={cn('text-sm leading-none font-medium', contentProps.classes?.title)}
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
                      'inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:(bg-accent text-accent-foreground) focus-visible:(border-ring ring-3 ring-ring/50)',
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
        <div data-slot="body" class={cn(hasHeader() ? 'p-3' : 'p-1', contentProps.classes?.body)}>
          {contentProps.body}
        </div>
      </Show>

      <Show when={contentProps.footer}>
        <div
          data-slot="footer"
          class={cn(
            'bg-muted/50 flex flex-col-reverse gap-2 p-4 sm:flex-row sm:justify-end',
            (hasHeader() || hasBody()) && 'border-border border-t',
            !behaviorProps.fullscreen && 'rounded-b-xl',
            contentProps.classes?.footer,
          )}
        >
          {contentProps.footer}
        </div>
      </Show>
    </KobalteDialog.Content>
  )

  return (
    <KobalteDialog.Root {...rootStateProps} modal {...rootProps}>
      <Show when={contentProps.children}>
        <KobalteDialog.Trigger
          as="span"
          data-slot="trigger"
          class={cn(contentProps.classes?.trigger)}
        >
          {contentProps.children}
        </KobalteDialog.Trigger>
      </Show>

      <KobalteDialog.Portal>
        <Show
          when={behaviorProps.scrollable && behaviorProps.overlay}
          fallback={
            <>
              <Show when={behaviorProps.overlay}>
                <KobalteDialog.Overlay
                  data-slot="overlay"
                  class={modalOverlayVariants(
                    {
                      scrollable: behaviorProps.scrollable,
                    },
                    contentProps.classes?.overlay,
                  )}
                />
              </Show>

              {dialog()}
            </>
          }
        >
          <KobalteDialog.Overlay
            data-slot="overlay"
            class={modalOverlayVariants(
              {
                scrollable: behaviorProps.scrollable,
              },
              contentProps.classes?.overlay,
            )}
          >
            {dialog()}
          </KobalteDialog.Overlay>
        </Show>
      </KobalteDialog.Portal>
    </KobalteDialog.Root>
  )
}
