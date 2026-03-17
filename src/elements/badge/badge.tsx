import type { JSX } from 'solid-js'
import { Show, createMemo, mergeProps } from 'solid-js'

import type { SlotClasses, SlotStyles } from '../../shared/slot'
import type { RockUIProps } from '../../shared/types'
import { cn } from '../../shared/utils'
import { Icon, IconButton } from '../icon'
import type { IconButtonProps, IconName } from '../icon'

import type { BadgeVariantProps } from './badge.class'
import { badgeVariants } from './badge.class'

export namespace BadgeT {
  export type Slot = 'base' | 'leading' | 'label' | 'trailing'
  export type Variant = BadgeVariantProps
  export interface Items {}
  export interface Extend {}
  export interface Classes extends SlotClasses<Slot> {}
  export interface Styles extends SlotStyles<Slot> {}

  /**
   * Base props for the Badge component.
   */
  export interface Base {
    /**
     * Data slot for styling.
     * @default 'badge'
     */
    slotName?: string

    /**
     * Accessible title for the badge.
     */
    title?: string

    /**
     * Leading icon name.
     */
    leading?: IconName

    /**
     * Trailing icon name.
     */
    trailing?: IconName

    /**
     * Callback when the trailing icon/button is clicked.
     */
    onTrailingClick?: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent>

    /**
     * Slot-based class overrides.
     */
    classes?: Classes

    /**
     * Slot-based style overrides.
     */
    styles?: Styles

    /**
     * Children of the badge.
     */
    children?: JSX.Element
  }

  /**
   * Props for the Badge component.
   */
  export interface Props extends RockUIProps<Base, Variant, Extend> {}
}

export interface BadgeTrailingButtonProps extends Omit<
  IconButtonProps,
  'children' | 'name' | 'onClick' | 'size' | 'loading' | 'loadingIcon' | 'type'
> {}

/**
 * Props for the Badge component.
 */
export interface BadgeProps extends BadgeT.Props {}
/** Compact label component with leading/trailing icon slots and variant styles. */
export function Badge(props: BadgeProps): JSX.Element {
  const merged = mergeProps(
    {
      slotName: 'badge',
      size: 'md' as const,
      variant: 'default' as const,
    },
    props,
  )

  const hasLabel = createMemo(() => merged.children !== undefined && merged.children !== null)

  return (
    <span
      data-slot={merged.slotName}
      data-size={merged.size}
      data-variant={merged.variant}
      title={merged.title}
      style={merged.styles?.base}
      class={badgeVariants(
        {
          size: merged.size,
          variant: merged.variant,
        },
        merged.classes?.base,
      )}
      onPointerDown={(e) => {
        e.preventDefault()
        e.stopPropagation()
      }}
    >
      <Show when={merged.leading}>
        {(leading) => (
          <Icon
            name={leading()}
            slotName="leading"
            style={merged.styles?.leading}
            class={cn('me-.5', merged.classes?.leading)}
          />
        )}
      </Show>

      <Show when={hasLabel()}>
        <span
          data-slot="label"
          style={merged.styles?.label}
          class={cn('min-w-0 truncate', merged.classes?.label)}
        >
          {merged.children}
        </span>
      </Show>

      <Show when={merged.trailing}>
        {(trailing) => (
          <Show
            when={merged.onTrailingClick}
            fallback={
              <Icon
                name={trailing()}
                slotName="trailing"
                style={merged.styles?.trailing}
                class={cn('ms-.5', merged.classes?.trailing)}
              />
            }
          >
            <IconButton
              name={trailing()}
              size={merged.size}
              data-slot="trailing"
              style={merged.styles?.trailing}
              class={cn('ms-.5', merged.classes?.trailing)}
              onClick={merged.onTrailingClick}
            />
          </Show>
        )}
      </Show>
    </span>
  )
}
