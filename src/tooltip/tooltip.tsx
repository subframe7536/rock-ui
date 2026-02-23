import * as KobalteTooltip from '@kobalte/core/tooltip'
import type { JSX } from 'solid-js'
import { For, Show, children, mergeProps, splitProps } from 'solid-js'

import { Kbd } from '../kbd'
import { cn } from '../shared/utils'

import { tooltipContentVariants } from './tooltip.class'

type TooltipSide = 'top' | 'right' | 'bottom' | 'left'
type TooltipPlacement =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'right'
  | 'right-start'
  | 'right-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end'

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
  placement?: TooltipPlacement
  openDelay?: number
  closeDelay?: number
  disabled?: boolean
  text?: JSX.Element
  kbds?: string[]
  classes?: TooltipClasses
  children?: JSX.Element
}

export type TooltipProps = TooltipBaseProps &
  Omit<KobalteTooltip.TooltipRootProps, keyof TooltipBaseProps | 'children' | 'class'>

function resolveTooltipSide(placement?: TooltipPlacement): TooltipSide {
  if (placement?.startsWith('right')) {
    return 'right'
  }

  if (placement?.startsWith('bottom')) {
    return 'bottom'
  }

  if (placement?.startsWith('left')) {
    return 'left'
  }

  return 'top'
}

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

  const triggerChildren = children(() => contentProps.children)
  const hasTrigger = () => triggerChildren.toArray().length > 0
  const hasTooltipContent = () => Boolean(contentProps.text) || (contentProps.kbds?.length ?? 0) > 0
  const isDisabled = () => Boolean(rootProps.disabled || !hasTooltipContent())

  return (
    <KobalteTooltip.Root disabled={isDisabled()} overflowPadding={4} {...rootProps}>
      <Show when={hasTrigger()}>
        <KobalteTooltip.Trigger as="span" data-slot="trigger" class={contentProps.classes?.trigger}>
          {triggerChildren()}
        </KobalteTooltip.Trigger>
      </Show>

      <Show when={hasTooltipContent()}>
        <KobalteTooltip.Portal>
          <KobalteTooltip.Content
            data-slot="content"
            class={tooltipContentVariants(
              {
                side: resolveTooltipSide(rootProps.placement),
              },
              contentProps.classes?.root,
            )}
          >
            <Show when={contentProps.text}>
              <span
                data-slot="text"
                class={cn('text-pretty leading-4', contentProps.classes?.text)}
              >
                {contentProps.text}
              </span>
            </Show>

            <Show when={(contentProps.kbds?.length || 0) > 0}>
              <span
                data-slot="kbds"
                class={cn('ms-1 inline-flex items-center gap-1', contentProps.classes?.kbds)}
              >
                <For each={contentProps.kbds}>
                  {(kbd) => (
                    <Kbd
                      data-slot="kbd"
                      classes={{
                        root: cn(
                          'border-none bg-muted-foreground !text-muted',
                          contentProps.classes?.kbd,
                        ),
                      }}
                    >
                      {kbd}
                    </Kbd>
                  )}
                </For>
              </span>
            </Show>
          </KobalteTooltip.Content>
        </KobalteTooltip.Portal>
      </Show>
    </KobalteTooltip.Root>
  )
}
