import type { JSX } from 'solid-js'
import { Show, createMemo, mergeProps } from 'solid-js'

import { Card } from '../../elements/card'
import { Icon } from '../../elements/icon'
import type { IconT } from '../../elements/icon'
import type { BaseProps, SlotClasses, SlotStyles } from '../../shared/types'
import { cn, useId } from '../../shared/utils'
import { popupContentVariants, popupOverlayVariants } from '../popup/popup.class'
import { ModalShell } from '../shared/modal-shell'

import { dialogCardVariants } from './dialog.class'
import type { DialogCardVariantProps } from './dialog.class'

export namespace DialogT {
  export type Slot =
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

  export type Variant = DialogCardVariantProps
  export type Classes = SlotClasses<Slot>
  export type Styles = SlotStyles<Slot>
  export type Extend = never

  export interface Item {}

  /**
   * Base props for the Dialog component.
   */
  export interface Base {
    /**
     * Unique identifier for the dialog.
     */
    id?: string

    /**
     * Controlled open state of the dialog.
     */
    open?: boolean

    /**
     * Initial open state when uncontrolled.
     * @default false
     */
    defaultOpen?: boolean

    /**
     * Callback triggered when the open state changes.
     */
    onOpenChange?: (open: boolean) => void

    /**
     * Primary title displayed in the dialog header.
     */
    title?: JSX.Element

    /**
     * Secondary description displayed below the title.
     */
    description?: JSX.Element

    /**
     * Whether to show a background overlay.
     * @default true
     */
    overlay?: boolean

    /**
     * Whether the dialog content body should be scrollable.
     * @default false
     */
    scrollable?: boolean

    /**
     * Whether the dialog should take up the full viewport.
     * @default false
     */
    fullscreen?: boolean

    /**
     * Whether to show a close button.
     * @default true
     */
    close?: boolean

    /**
     * Icon name or custom content for the close button.
     * @default 'icon-close'
     */
    closeIcon?: IconT.Name | JSX.Element

    /**
     * Whether the dialog can be dismissed by clicking outside or pressing Escape.
     * @default true
     */
    dismissible?: boolean

    /**
     * Callback triggered when a dismissal action is prevented.
     */
    onClosePrevent?: () => void

    /**
     * Custom element to render in the header slot.
     */
    header?: JSX.Element

    /**
     * Custom element to render in the body slot.
     */
    body?: JSX.Element

    /**
     * Custom element to render in the footer slot.
     */
    footer?: JSX.Element

    /**
     * Slot-based class overrides.
     */
    classes?: Classes

    /**
     * Slot-based style overrides.
     */
    styles?: Styles

    /**
     * Content to render inside the dialog trigger slot.
     */
    children?: JSX.Element
  }

  /**
   * Props for the Dialog component.
   */
  export interface Props extends BaseProps<Base, Variant, Extend, Slot> {}
}

/**
 * Props for the Dialog component.
 */
export interface DialogProps extends DialogT.Props {}

/** Modal dialog with header, body, and footer slots, backdrop overlay, and dismissal control. */
export function Dialog(props: DialogProps): JSX.Element {
  const merged = mergeProps(
    {
      overlay: true,
      close: true,
      closeIcon: 'icon-close' as IconT.Name,
      dismissible: true,
    },
    props,
  )
  const rootId = useId(() => merged.id, 'dialog')
  const titleId = createMemo(() => (merged.title ? `${rootId()}-title` : undefined))
  const descriptionId = createMemo(() =>
    merged.description ? `${rootId()}-description` : undefined,
  )

  const popupLayout = () => {
    if (merged.fullscreen) {
      return 'fullscreen'
    }

    if (merged.scrollable) {
      return 'scrollable'
    }

    return 'default'
  }

  const headerContent = (close: () => void) => {
    if (merged.header) {
      return merged.header
    }

    if (!merged.title && !merged.description && !merged.close) {
      return undefined
    }

    return (
      <>
        <Show when={merged.title || merged.description}>
          <div
            data-slot="wrapper"
            style={merged.styles?.wrapper}
            class={cn('flex-1 gap-1.5 grid min-w-0', merged.classes?.wrapper)}
          >
            <Show when={merged.title}>
              <h2
                id={titleId()}
                data-slot="title"
                style={merged.styles?.title}
                class={cn(
                  'text-lg leading-none tracking-tight font-semibold',
                  merged.classes?.title,
                )}
              >
                {merged.title}
              </h2>
            </Show>

            <Show when={merged.description}>
              <p
                id={descriptionId()}
                data-slot="description"
                style={merged.styles?.description}
                class={cn('text-sm text-muted-foreground', merged.classes?.description)}
              >
                {merged.description}
              </p>
            </Show>
          </div>
        </Show>

        <Show when={merged.close}>
          <button
            type="button"
            data-slot="close"
            aria-label="Close"
            style={merged.styles?.close}
            class={cn(
              'text-muted-foreground p-1 rounded-sm inline-flex shrink-0 size-7 transition-colors items-center right-4 top-4 justify-center absolute focus-visible:effect-fv hover:bg-accent',
              merged.classes?.close,
            )}
            onClick={() => {
              close()
            }}
          >
            <Icon name={merged.closeIcon} />
          </button>
        </Show>
      </>
    )
  }

  return (
    <ModalShell
      id={merged.id}
      open={merged.open}
      defaultOpen={merged.defaultOpen}
      onOpenChange={merged.onOpenChange}
      overlay={merged.overlay}
      dismissible={merged.dismissible}
      onClosePrevent={merged.onClosePrevent}
      preventScroll={!merged.scrollable}
      overlayContainsContent={Boolean(merged.overlay && merged.scrollable)}
      trigger={merged.children}
      triggerStyle={merged.styles?.trigger}
      triggerClass={merged.classes?.trigger}
      overlayStyle={merged.styles?.overlay}
      overlayClass={popupOverlayVariants(
        {
          scrollable: merged.scrollable,
        },
        merged.classes?.overlay,
      )}
      contentStyle={merged.styles?.content}
      contentClass={popupContentVariants(
        {
          layout: popupLayout(),
        },
        merged.classes?.content,
      )}
      ariaLabelledBy={titleId()}
      ariaDescribedBy={descriptionId()}
      content={({ close }) => (
        <Card
          header={headerContent(close)}
          footer={merged.footer}
          classes={{
            root: dialogCardVariants({ layout: popupLayout() }),
            header: cn('p-6 flex gap-1.5 items-start', merged.classes?.header),
            body: cn('text-sm pb-6', merged.classes?.body),
            footer: cn(
              'px-6 pb-6 pt-0 flex flex-col-reverse gap-2 sm:(flex-row justify-end)',
              merged.classes?.footer,
            ),
          }}
        >
          {merged.body}
        </Card>
      )}
    />
  )
}
