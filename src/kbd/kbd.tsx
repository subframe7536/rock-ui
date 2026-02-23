import type { JSX } from 'solid-js'
import { splitProps } from 'solid-js'

import type { KbdVariantProps } from './kbd.class'
import { kbdVariants } from './kbd.class'

export interface KbdClasses {
  root?: string
}

export interface KbdBaseProps extends KbdVariantProps {
  classes?: KbdClasses
  'data-slot'?: string
  children?: JSX.Element
}

export type KbdProps = KbdBaseProps

export function Kbd(props: KbdProps): JSX.Element {
  const [styleProps, contentProps] = splitProps(props as KbdProps, ['size', 'classes'])

  return (
    <kbd
      data-slot={contentProps['data-slot'] ?? 'root'}
      class={kbdVariants(
        {
          size: styleProps.size,
        },
        styleProps.classes?.root,
      )}
    >
      {contentProps.children}
    </kbd>
  )
}
