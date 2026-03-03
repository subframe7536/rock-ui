import * as KobalteDialog from '@kobalte/core/dialog'
import type { DialogContentProps as KobalteDialogContentProps } from '@kobalte/core/dialog'
import type { JSX } from 'solid-js'
import { Show, mergeProps, onCleanup, splitProps } from 'solid-js'

import { IconButton } from '../icon'
import type { IconName } from '../icon'
import type { SlotClasses } from '../shared/slot-class'
import { cn } from '../shared/utils'

import { modalContentVariants, modalOverlayVariants } from './dialog.class'

type ModalSlots =
  | 'trigger'
  | 'overlay'
  | 'content'
  | 'header'
  | 'wrapper'
  | 'title'
  | 'description'
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
  close?: boolean
  closeIcon?: IconName
  dismissible?: boolean
  onClosePrevent?: () => void
  header?: JSX.Element
  body?: JSX.Element
  footer?: JSX.Element
  classes?: ModalClasses
}

export type ModalProps = ModalBaseProps &
  Omit<KobalteDialog.DialogRootProps, keyof ModalBaseProps | 'class'>

export function Dialog(props: ModalProps): JSX.Element {
  const merged = mergeProps(
    {
      overlay: true,
      transition: true,
      close: true,
      closeIcon: 'icon-close',
      dismissible: true,
    },
    props,
  ) as ModalProps
  const [rootStateProps, behaviorProps, contentProps, rootProps] = splitProps(
    merged,
    ['id', 'open', 'defaultOpen', 'onOpenChange'],
    [
      'overlay',
      'scrollable',
      'transition',
      'fullscreen',
      'close',
      'closeIcon',
      'dismissible',
      'onClosePrevent',
    ],
    ['title', 'description', 'header', 'body', 'footer', 'classes', 'children'],
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
      data-slot="content"
      class={modalContentVariants(
        {
          layout: contentLayout(),
          transition: behaviorProps.transition,
        },
        contentProps.classes?.content,
      )}
      onPointerDownOutside={onPointerDownOutside}
      onInteractOutside={onInteractOutside}
      onEscapeKeyDown={onEscapeKeyDown}
    >
      {/* Close button: absolute like shadcn, not inline in the header flow */}
      <Show when={behaviorProps.close && !contentProps.header}>
        <KobalteDialog.CloseButton
          as={IconButton}
          name={behaviorProps.closeIcon}
          data-slot="close"
          aria-label="Close"
          class={cn(
            'absolute right-4 top-4 size-7 p-1 rounded-sm hover:bg-accent focus-visible:effect-fv transition-opacity',
            contentProps.classes?.close,
          )}
        />
      </Show>

      <Show when={contentProps.header || contentProps.title || contentProps.description}>
        <div
          data-slot="header"
          class={cn('flex flex-col gap-1.5 p-6', contentProps.classes?.header)}
        >
          <Show when={!contentProps.header} fallback={contentProps.header}>
            <Show when={contentProps.title}>
              <KobalteDialog.Title
                data-slot="title"
                class={cn(
                  'text-lg font-semibold leading-none tracking-tight',
                  contentProps.classes?.title,
                )}
              >
                {contentProps.title}
              </KobalteDialog.Title>
            </Show>

            <Show when={contentProps.description}>
              <KobalteDialog.Description
                data-slot="description"
                class={cn('text-sm text-muted-foreground', contentProps.classes?.description)}
              >
                {contentProps.description}
              </KobalteDialog.Description>
            </Show>
          </Show>
        </div>
      </Show>

      <Show when={contentProps.body}>
        <div data-slot="body" class={cn('px-6 pb-6 text-sm', contentProps.classes?.body)}>
          {contentProps.body}
        </div>
      </Show>

      <Show when={contentProps.footer}>
        <div
          data-slot="footer"
          class={cn(
            'flex flex-col-reverse gap-2 px-6 pb-6 pt-0 sm:(flex-row justify-end)',
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
