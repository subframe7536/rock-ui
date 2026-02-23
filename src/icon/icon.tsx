import type { JSX } from 'solid-js'
import { Show, createMemo, splitProps } from 'solid-js'

import { cn, combineStyle } from '../shared/utils'

export type IconName = string | JSX.Element | (() => JSX.Element)

export interface IconClasses {
  root?: string
}

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

  /**
   * Optional icon name customizer for string-based icons.
   */
  customize?: (content: string, name?: string, prefix?: string, provider?: string) => string

  /**
   * Slot-based class overrides.
   */
  classes?: IconClasses
  style?: JSX.CSSProperties | string
  'aria-label'?: string
  'data-slot'?: string
}

export type IconProps = IconBaseProps

function parseIconName(value: string): { name: string; prefix?: string } {
  const cleaned = value.startsWith('i-') ? value.slice(2) : value
  const [prefix] = cleaned.split('-')

  return {
    name: cleaned,
    prefix,
  }
}

export function Icon(props: IconProps): JSX.Element {
  const [sourceProps, a11ySlotProps, styleProps] = splitProps(
    props as IconProps,
    ['name', 'size', 'customize'],
    ['style', 'aria-label', 'data-slot'],
  )

  const sizeStyle = createMemo<JSX.CSSProperties | undefined>(() => {
    if (sourceProps.size === undefined || sourceProps.size === null) {
      return undefined
    }

    if (typeof sourceProps.size === 'number') {
      return {
        'font-size': `${sourceProps.size}px`,
      }
    }

    return {
      'font-size': sourceProps.size,
    }
  })

  const resolveIconClass = (): string | undefined => {
    if (typeof sourceProps.name !== 'string') {
      return undefined
    }

    const parsed = parseIconName(sourceProps.name)
    const customized = sourceProps.customize?.(parsed.name, parsed.name, parsed.prefix, undefined)

    return customized ?? sourceProps.name
  }

  const renderedContent = createMemo<JSX.Element>(() => {
    if (typeof sourceProps.name === 'function') {
      return sourceProps.name()
    }

    if (typeof sourceProps.name === 'string') {
      return ''
    }

    return sourceProps.name
  })

  return (
    <span
      data-slot={a11ySlotProps['data-slot'] ?? 'icon'}
      class={cn(
        'inline-flex shrink-0 items-center justify-center align-middle',
        resolveIconClass(),
        styleProps.classes?.root,
      )}
      style={combineStyle(a11ySlotProps.style, sizeStyle())}
      aria-hidden={a11ySlotProps['aria-label'] ? undefined : true}
    >
      <Show when={typeof sourceProps.name !== 'string'}>{renderedContent()}</Show>
    </span>
  )
}
