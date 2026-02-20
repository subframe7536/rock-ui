import type { JSX } from 'solid-js'
import { splitProps } from 'solid-js'

import type { KbdVariantProps } from './kbd.class'
import { kbdVariants } from './kbd.class'

export interface KbdClasses {
  root?: string
}

export interface KbdBaseProps extends KbdVariantProps {
  classes?: KbdClasses
  children?: JSX.Element
}

export type KbdProps = KbdBaseProps &
  Omit<JSX.HTMLAttributes<HTMLElement>, keyof KbdBaseProps | 'children' | 'class' | 'color'>

export function Kbd(props: KbdProps): JSX.Element {
  const [local, rest] = splitProps(props as KbdProps, ['size', 'classes', 'children'])

  return (
    <kbd
      data-slot="root"
      class={kbdVariants(
        {
          size: local.size,
        },
        local.classes?.root,
      )}
      {...rest}
    >
      {local.children}
    </kbd>
  )
}
