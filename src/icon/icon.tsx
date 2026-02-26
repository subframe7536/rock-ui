import type { JSX } from 'solid-js'
import { splitProps } from 'solid-js'

import { cn } from '../shared/utils'

export type IconName = string | JSX.Element | ((size?: string | number) => JSX.Element)

export interface IconBaseProps {
  /**
   * Icon source. Strings should be Uno icon classes such as `i-lucide-search`
   * or app-config aliases such as `icon-search`.
   * Non-string values can be JSX nodes or render functions.
   */
  name: IconName

  /**
   * Icon size. Numbers are interpreted as px.
   */
  size?: string | number
  style?: JSX.CSSProperties
}

export type IconProps = IconBaseProps &
  Omit<JSX.HTMLAttributes<HTMLSpanElement>, keyof IconBaseProps | 'children'>

export function Icon(props: IconProps): JSX.Element {
  const [local, rest] = splitProps(props, ['name', 'class', 'style', 'size'])

  return (
    <span
      data-slot="icon"
      {...rest}
      class={cn('inline-flex shrink-0', typeof local.name === 'string' && local.name, local.class)}
      style={{
        'font-size': typeof local.size === 'number' ? `${local.size}px` : local.size,
        // height: typeof local.size === 'number' ? `${local.size}px` : local.size,
        ...local.style,
      }}
      aria-hidden={rest['aria-label'] ? undefined : true}
    >
      {typeof local.name === 'function'
        ? (local.name as any)(local.size)
        : typeof local.name !== 'string'
          ? local.name
          : undefined}
    </span>
  )
}
