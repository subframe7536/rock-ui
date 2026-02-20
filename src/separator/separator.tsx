import * as KobalteSeparator from '@kobalte/core/separator'
import type { JSX } from 'solid-js'
import { Show, mergeProps, splitProps } from 'solid-js'

import type { SeparatorVariantProps } from './separator.class'
import {
  separatorBorderVariants,
  separatorContainerVariants,
  separatorRootVariants,
} from './separator.class'

export interface SeparatorClasses {
  root?: string
  border?: string
  container?: string
}

export interface SeparatorBaseProps extends Pick<
  SeparatorVariantProps,
  'color' | 'orientation' | 'size' | 'type'
> {
  decorative?: boolean
  classes?: SeparatorClasses
  children?: JSX.Element
}

export type SeparatorProps = SeparatorBaseProps &
  Omit<JSX.HTMLAttributes<HTMLDivElement>, keyof SeparatorBaseProps | 'children' | 'class'>

export function Separator(props: SeparatorProps): JSX.Element {
  const merged = mergeProps(
    {
      decorative: false,
      orientation: 'horizontal' as const,
      color: 'neutral' as const,
      size: 'xs' as const,
      type: 'solid' as const,
    },
    props,
  )

  const [local, rest] = splitProps(merged as SeparatorProps, [
    'decorative',
    'orientation',
    'color',
    'size',
    'type',
    'classes',
    'children',
  ])

  return (
    <KobalteSeparator.Root
      as="div"
      orientation={local.orientation}
      aria-hidden={local.decorative ? true : undefined}
      data-slot="root"
      class={separatorRootVariants(
        {
          orientation: local.orientation,
        },
        local.classes?.root,
      )}
      {...rest}
    >
      <div
        data-slot="border"
        class={separatorBorderVariants(
          {
            orientation: local.orientation,
            color: local.color,
            size: local.size,
            type: local.type,
          },
          local.classes?.border,
        )}
      />

      <Show when={local.children}>
        <>
          <div
            data-slot="container"
            class={separatorContainerVariants(
              {
                orientation: local.orientation,
                color: local.color,
              },
              local.classes?.container,
            )}
          >
            {local.children}
          </div>
          <div
            data-slot="border"
            class={separatorBorderVariants(
              {
                orientation: local.orientation,
                color: local.color,
                size: local.size,
                type: local.type,
              },
              local.classes?.border,
            )}
          />
        </>
      </Show>
    </KobalteSeparator.Root>
  )
}
