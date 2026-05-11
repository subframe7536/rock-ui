import type { JSX } from 'solid-js'
import { mergeProps } from 'solid-js'

import type { BaseProps, SlotClasses, SlotStyles } from '../../shared/types'
import { ModalShell } from '../shared/modal-shell'

import { popupContentVariants, popupOverlayVariants } from './popup.class'
import type { PopupVariantProps } from './popup.class'

export namespace PopupT {
  export type Slot = 'trigger' | 'overlay' | 'content'
  export type Variant = PopupVariantProps
  export type Classes = SlotClasses<Slot>
  export type Styles = SlotStyles<Slot>
  export type Extend = never

  export interface Item {}

  /**
   * Base props for the Popup component.
   */
  export interface Base {
    /**
     * Unique identifier for the popup.
     */
    id?: string

    /**
     * Controlled open state of the popup.
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
     * Whether to display a backdrop overlay.
     * @default true
     */
    overlay?: boolean

    /**
     * Whether to allow scrolling within the popup.
     * @default false
     */
    scrollable?: boolean

    /**
     * Whether the popup should cover the entire viewport.
     * @default false
     */
    fullscreen?: boolean

    /**
     * Whether the popup should close on outside interaction or Escape key.
     * @default true
     */
    dismissible?: boolean

    /**
     * Callback triggered when a dismissal is prevented.
     */
    onClosePrevent?: () => void

    /**
     * Main content to render inside the popup.
     */
    content?: JSX.Element

    /**
     * Element that triggers the popup or additional content.
     */
    children?: JSX.Element
  }

  /**
   * Props for the Popup component.
   */
  export interface Props extends BaseProps<Base, Variant, Extend, Slot> {}
}

/**
 * Props for the Popup component.
 */
export interface PopupProps extends PopupT.Props {}

/** Low-level overlay primitive providing portal, overlay backdrop, and content positioning. */
export function Popup(props: PopupProps): JSX.Element {
  const merged = mergeProps(
    {
      overlay: true,
      dismissible: true,
    },
    props,
  )

  const contentLayout = () => {
    if (merged.fullscreen) {
      return 'fullscreen'
    }

    if (merged.scrollable) {
      return 'scrollable'
    }

    return 'default'
  }

  return (
    <ModalShell
      id={merged.id}
      open={merged.open}
      defaultOpen={merged.defaultOpen}
      onOpenChange={merged.onOpenChange}
      overlay={merged.overlay}
      overlayContainsContent={Boolean(merged.overlay && merged.scrollable)}
      dismissible={merged.dismissible}
      onClosePrevent={merged.onClosePrevent}
      preventScroll={!merged.scrollable}
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
          layout: contentLayout(),
        },
        merged.classes?.content,
      )}
      content={merged.content}
    />
  )
}
