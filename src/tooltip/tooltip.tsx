import * as KobalteTooltip from '@kobalte/core/tooltip'
import type { JSX } from 'solid-js'
import { Show, mergeProps, splitProps } from 'solid-js'

import { Kbd } from '../kbd'
import { cn } from '../shared/utils'

import { tooltipContentVariants } from './tooltip.class'

type TooltipSide = 'top' | 'right' | 'bottom' | 'left'

export interface TooltipClasses {
  root?: string
  trigger?: string
  text?: string
  kbds?: string
  kbd?: string
}

export interface TooltipBaseProps {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  placement?: TooltipSide
  openDelay?: number
  closeDelay?: number
  disabled?: boolean
  text?: JSX.Element
  kbds?: string[]
  classes?: TooltipClasses
  children: JSX.Element
}

export type TooltipProps = TooltipBaseProps &
  Omit<KobalteTooltip.TooltipRootProps, keyof TooltipBaseProps | 'children' | 'class'>

export function Tooltip(props: TooltipProps): JSX.Element {
  const merged = mergeProps(
    {
      placement: 'top' as const,
      openDelay: 0,
      closeDelay: 0,
    },
    props,
  ) as TooltipProps
  const [contentProps, rootProps] = splitProps(merged, ['text', 'kbds', 'classes', 'children'])

  const isDisabled = () => Boolean(rootProps.disabled)

  return (
    <KobalteTooltip.Root disabled={isDisabled()} overflowPadding={4} {...rootProps}>
      <KobalteTooltip.Trigger as="span" data-slot="trigger" class={contentProps.classes?.trigger}>
        {contentProps.children}
      </KobalteTooltip.Trigger>

      <KobalteTooltip.Portal>
        <KobalteTooltip.Content
          data-slot="content"
          class={tooltipContentVariants({ side: rootProps.placement }, contentProps.classes?.root)}
        >
          <Show when={typeof contentProps.text === 'string'} fallback={contentProps.text}>
            <span data-slot="text" class={cn('text-pretty leading-4', contentProps.classes?.text)}>
              {contentProps.text}
            </span>
          </Show>

          <Kbd
            data-slot="kbd"
            variant="invert"
            size="sm"
            value={contentProps.kbds}
            classes={{
              root: cn('ms-1', contentProps.classes?.kbds),
              item: contentProps.classes?.kbd,
            }}
          />
        </KobalteTooltip.Content>
      </KobalteTooltip.Portal>
    </KobalteTooltip.Root>
  )
}
