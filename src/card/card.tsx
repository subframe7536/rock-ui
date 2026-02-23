import type { JSX } from 'solid-js'
import { Show, mergeProps, splitProps } from 'solid-js'

import { cn } from '../shared/utils'

import type { CardVariantProps } from './card.class'
import { cardRootVariants } from './card.class'

export interface CardClasses {
  root?: string
  header?: string
  body?: string
  footer?: string
}

export interface CardBaseProps extends CardVariantProps {
  header?: JSX.Element
  footer?: JSX.Element
  classes?: CardClasses
  children?: JSX.Element
}

export type CardProps = CardBaseProps

export function Card(props: CardProps): JSX.Element {
  const merged = mergeProps(
    {
      variant: 'outline' as const,
    },
    props,
  ) as CardProps

  const [styleProps, contentProps] = splitProps(merged, ['variant', 'classes'])

  return (
    <div
      data-slot="root"
      class={cardRootVariants(
        {
          variant: styleProps.variant,
        },
        styleProps.classes?.root,
      )}
    >
      <Show when={contentProps.header}>
        <div
          data-slot="header"
          class={cn(
            'grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 p-6',
            styleProps.classes?.header,
          )}
        >
          {contentProps.header}
        </div>
      </Show>

      <Show when={contentProps.children}>
        <div data-slot="body" class={cn('flex-1 p-6', styleProps.classes?.body)}>
          {contentProps.children}
        </div>
      </Show>

      <Show when={contentProps.footer}>
        <div data-slot="footer" class={cn('flex items-center p-6', styleProps.classes?.footer)}>
          {contentProps.footer}
        </div>
      </Show>
    </div>
  )
}
