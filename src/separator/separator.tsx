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
  Omit<
    KobalteSeparator.SeparatorRootProps<HTMLDivElement>,
    keyof SeparatorBaseProps | 'children' | 'class'
  >

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

  const [semanticProps, visualProps, rootProps] = splitProps(
    merged as SeparatorProps,
    ['decorative', 'orientation'],
    ['color', 'size', 'type', 'classes', 'children'],
  )

  return (
    <KobalteSeparator.Root
      as="div"
      orientation={semanticProps.orientation}
      aria-hidden={semanticProps.decorative ? true : undefined}
      data-slot="root"
      class={separatorRootVariants(
        {
          orientation: semanticProps.orientation,
        },
        visualProps.classes?.root,
      )}
      {...rootProps}
    >
      <div
        data-slot="border"
        class={separatorBorderVariants(
          {
            orientation: semanticProps.orientation,
            color: visualProps.color,
            size: visualProps.size,
            type: visualProps.type,
          },
          visualProps.classes?.border,
        )}
      />

      <Show when={visualProps.children}>
        <>
          <div
            data-slot="container"
            class={separatorContainerVariants(
              {
                orientation: semanticProps.orientation,
                color: visualProps.color,
              },
              visualProps.classes?.container,
            )}
          >
            {visualProps.children}
          </div>
          <div
            data-slot="border"
            class={separatorBorderVariants(
              {
                orientation: semanticProps.orientation,
                color: visualProps.color,
                size: visualProps.size,
                type: visualProps.type,
              },
              visualProps.classes?.border,
            )}
          />
        </>
      </Show>
    </KobalteSeparator.Root>
  )
}
