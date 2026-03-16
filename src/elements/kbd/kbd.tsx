import type { JSX } from 'solid-js'
import { For, Match, Show, Switch } from 'solid-js'

import type { SlotClasses, SlotStyles } from '../../shared/slot'
import { cn } from '../../shared/utils'

import type { KbdVariantProps } from './kbd.class'
import { kbdItemVariants } from './kbd.class'

type KbdSlots = 'root' | 'item'

export type KbdClasses = SlotClasses<KbdSlots>

export type KbdStyles = SlotStyles<KbdSlots>

/**
 * Base props for the Kbd component.
 */
export interface KbdBaseProps {
  /**
   * Slot-based class overrides.
   */
  classes?: KbdClasses

  /**
   * Slot-based style overrides.
   */
  styles?: KbdStyles

  /**
   * Slot between kbds
   */
  between?: JSX.Element

  /**
   * Prefix for data-slot attributes.
   */
  slotPrefix?: string

  /**
   * Array of keys to display.
   */
  value?: string[]
}

/**
 * Props for the Kbd component.
 */
export type KbdProps = KbdBaseProps & KbdVariantProps

/** Keyboard shortcut display component with configurable size and variant. */
export function Kbd(props: KbdProps): JSX.Element {
  const Inner = (innerProps: { val: string; append?: boolean }) => (
    <>
      <kbd
        data-slot={props.slotPrefix ? `${props.slotPrefix}-kbd` : 'kbd'}
        class={kbdItemVariants(
          {
            size: props.size,
            variant: props.variant,
          },
          props.classes?.item,
        )}
        style={props.styles?.item}
      >
        {innerProps.val}
      </kbd>
      <Show when={innerProps.append}>{props.between}</Show>
    </>
  )
  return (
    <Show when={props.value}>
      <Switch>
        <Match when={props.value!.length === 1}>{<Inner val={props.value![0]} />}</Match>
        <Match when={props.value!.length > 1}>
          <span
            data-slot={props.slotPrefix ? `${props.slotPrefix}-kbds` : 'kbds'}
            class={cn('inline-flex gap-1 items-center', props.classes?.root)}
            style={props.styles?.root}
          >
            <For each={props.value}>
              {(value, idx) => <Inner val={value} append={idx() < props.value!.length - 1} />}
            </For>
          </span>
        </Match>
      </Switch>
    </Show>
  )
}
