import type { JSX } from 'solid-js'
import { For, Match, Show, Switch } from 'solid-js'

import { cn } from '../shared/utils'

import type { KbdVariantProps } from './kbd.class'
import { kbdItemVariants } from './kbd.class'

export interface KbdClasses {
  root?: string
  item?: string
}

export interface KbdBaseProps extends KbdVariantProps {
  classes?: KbdClasses
  slotPrefix?: string
  value?: string[]
}

export type KbdProps = KbdBaseProps

export function Kbd(props: KbdProps): JSX.Element {
  const inner = (val: string) => (
    <kbd
      data-slot={props.slotPrefix ? `${props.slotPrefix}-kbd` : 'kbd'}
      class={kbdItemVariants(
        {
          size: props.size,
          variant: props.variant,
        },
        props.classes?.item,
      )}
    >
      {val}
    </kbd>
  )
  return (
    <Show when={props.value}>
      <Switch>
        <Match when={props.value!.length === 1}>{inner(props.value![0])}</Match>
        <Match when={props.value!.length > 1}>
          <span
            data-slot={props.slotPrefix ? `${props.slotPrefix}-kbds` : 'kbds'}
            class={cn('inline-flex items-center gap-1', props.classes?.root)}
          >
            <For each={props.value}>{(value) => inner(value)}</For>
          </span>
        </Match>
      </Switch>
    </Show>
  )
}
