import * as KobalteCollapsible from '@kobalte/core/collapsible'
import type { JSX } from 'solid-js'
import { Show, splitProps } from 'solid-js'

import { cn } from '../shared/utils'

export interface CollapsibleClasses {
  root?: string
  trigger?: string
  content?: string
}

export interface CollapsibleTriggerSlotProps {
  open: boolean
}

export interface CollapsibleBaseProps {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  disabled?: boolean
  forceMount?: boolean
  classes?: CollapsibleClasses
  renderTrigger?: (props: CollapsibleTriggerSlotProps) => JSX.Element
  children?: JSX.Element
}

export type CollapsibleProps = CollapsibleBaseProps &
  Omit<KobalteCollapsible.CollapsibleRootProps, keyof CollapsibleBaseProps | 'children' | 'class'>

export function Collapsible(props: CollapsibleProps): JSX.Element {
  const [contentProps, rootProps] = splitProps(props as CollapsibleProps, [
    'classes',
    'children',
    'renderTrigger',
  ])

  return (
    <KobalteCollapsible.Root data-slot="root" class={contentProps.classes?.root} {...rootProps}>
      <Show when={contentProps.renderTrigger}>
        {(render) => {
          const context = KobalteCollapsible.useCollapsibleContext()
          return (
            <KobalteCollapsible.Trigger
              data-slot="trigger"
              class={cn('cursor-pointer', contentProps.classes?.trigger)}
            >
              {render()({ open: context.isOpen() })}
            </KobalteCollapsible.Trigger>
          )
        }}
      </Show>

      <KobalteCollapsible.Content
        data-slot="content"
        class={cn(
          'h-$kb-collapsible-content-height overflow-hidden transition-height duration-200 data-closed:h-0',
          contentProps.classes?.content,
        )}
      >
        {contentProps.children}
      </KobalteCollapsible.Content>
    </KobalteCollapsible.Root>
  )
}
