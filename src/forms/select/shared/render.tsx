import type { ClassValue } from 'cls-variant'
import type { JSX } from 'solid-js'
import { Show, createMemo } from 'solid-js'

import { Icon, IconButton } from '../../../elements/icon'
import type { IconT } from '../../../elements/icon'
import { cn } from '../../../shared/utils'
import { selectItemVariants } from '../select.class'

import type { NormalizedGroup, NormalizedOption } from './types'

export interface SelectItemComponentProps<TItems> {
  id?: string
  isHighlighted: boolean
  isSelected: boolean
  item: NormalizedOption<TItems>
  onClick?: JSX.EventHandlerUnion<HTMLDivElement, MouseEvent>
  onPointerDown?: JSX.EventHandlerUnion<HTMLDivElement, PointerEvent>
  onPointerMove?: JSX.EventHandlerUnion<HTMLDivElement, PointerEvent>
  posinset?: number
  setsize?: number
}

export interface SelectSectionComponentProps<TItems> {
  section: NormalizedGroup<TItems>
}

interface SelectClearButtonRenderProps {
  show: boolean
  size?: string
  iconName?: IconT.Name
  style?: JSX.CSSProperties
  rootClass?: ClassValue
  onClick: (event: MouseEvent) => void
}

interface SelectTriggerButtonRenderProps {
  style?: JSX.CSSProperties
  name?: IconT.Name
  size?: string
  rootClass?: ClassValue
  loading?: boolean
  loadingIcon?: IconT.Name
  onClick: (event: MouseEvent) => void
}

interface SelectEmptyRenderProps<TContext> {
  emptyRender?: string | ((context: TContext) => JSX.Element)
  context: () => TContext
  style?: JSX.CSSProperties
  class?: ClassValue
}

interface SelectComponentStyles {
  item?: JSX.CSSProperties
  itemLabel?: JSX.CSSProperties
  itemDescription?: JSX.CSSProperties
  itemTrailing?: JSX.CSSProperties
  group?: JSX.CSSProperties
  label?: JSX.CSSProperties
}

interface SelectComponentClasses {
  item?: ClassValue
  itemLabel?: ClassValue
  itemDescription?: ClassValue
  itemTrailing?: ClassValue
  group?: ClassValue
  label?: ClassValue
}

interface CreateSelectComponentsProps<
  TItems extends { icon?: IconT.Name; description?: string | JSX.Element },
  TState,
> {
  styles?: () => SelectComponentStyles | undefined
  size: () => string
  classes?: () => SelectComponentClasses | undefined
  optionRender?: () => ((option: TItems & TState) => JSX.Element) | undefined
  labelRender?: () => ((option: TItems) => JSX.Element) | undefined
}

interface BaseOptionRenderState {
  isSelected: boolean
  isHighlighted: boolean
  isDisabled: boolean
}

export function createSelectComponents<
  TItems extends { icon?: IconT.Name; description?: string | JSX.Element },
  TState = BaseOptionRenderState,
>(props: CreateSelectComponentsProps<TItems, TState>) {
  const ItemComponent = (itemProps: SelectItemComponentProps<TItems>): JSX.Element => {
    const raw = (): TItems => itemProps.item.raw
    const renderState = createMemo<TState>(() => {
      const state: BaseOptionRenderState = {
        isSelected: itemProps.isSelected,
        isHighlighted: itemProps.isHighlighted,
        isDisabled: itemProps.item.disabled,
      }

      return state as TState
    })

    const optionRender = createMemo(() => props.optionRender?.())
    const labelRender = createMemo(() => props.labelRender?.())
    const optionIcon = createMemo(() => raw().icon)
    const optionDescription = createMemo(() => raw().description)

    const renderLabel = (): JSX.Element => (
      <span
        data-slot="itemLabel"
        style={props.styles?.()?.itemLabel}
        class={cn('col-start-1 truncate', props.classes?.()?.itemLabel)}
      >
        <Show when={labelRender()} keyed fallback={itemProps.item.label}>
          {(render) => render(raw())}
        </Show>
      </span>
    )

    return (
      <div
        id={itemProps.id}
        role="option"
        tabIndex={-1}
        data-slot="item"
        data-disabled={itemProps.item.disabled ? '' : undefined}
        data-highlighted={itemProps.isHighlighted ? '' : undefined}
        aria-disabled={itemProps.item.disabled || undefined}
        aria-selected={itemProps.isSelected ? 'true' : 'false'}
        aria-posinset={itemProps.posinset}
        aria-setsize={itemProps.setsize}
        style={props.styles?.()?.item}
        onClick={itemProps.onClick}
        onPointerDown={itemProps.onPointerDown}
        onPointerMove={itemProps.onPointerMove}
        class={selectItemVariants(
          {
            size: props.size() as 'xs' | 'sm' | 'md' | 'lg' | 'xl' | undefined,
          },
          props.classes?.()?.item,
        )}
      >
        <Show
          when={optionRender()}
          keyed
          fallback={
            <>
              <Show when={optionIcon()} fallback={renderLabel()}>
                {(icon) => (
                  <span class="flex gap-2 col-start-1 items-center">
                    <Icon name={icon()} />
                    {renderLabel()}
                  </span>
                )}
              </Show>

              <Show when={optionDescription()}>
                {(desc) => (
                  <span
                    data-slot="itemDescription"
                    style={props.styles?.()?.itemDescription}
                    class={cn(
                      'text-xs text-muted-foreground col-start-1',
                      props.classes?.()?.itemDescription,
                    )}
                  >
                    {desc()}
                  </span>
                )}
              </Show>

              <Show when={itemProps.isSelected}>
                <span
                  data-slot="itemTrailing"
                  style={props.styles?.()?.itemTrailing}
                  class={cn(
                    'text-sm inline-flex col-start-2 items-center justify-center',
                    props.classes?.()?.itemTrailing,
                  )}
                >
                  <Icon name="icon-check" />
                </span>
              </Show>
            </>
          }
        >
          {(render) => render({ ...raw(), ...renderState() } as TItems & TState)}
        </Show>
      </div>
    )
  }

  const SectionComponent = (sectionProps: SelectSectionComponentProps<TItems>): JSX.Element => (
    <div
      data-slot="group"
      role="group"
      style={props.styles?.()?.group}
      class={cn('[&:not(:first-child)]:mt-1.5', props.classes?.()?.group)}
    >
      <span
        data-slot="label"
        style={props.styles?.()?.label}
        class={cn(
          'text-xs text-muted-foreground font-medium px-2 py-1.5 block',
          props.classes?.()?.label,
        )}
      >
        {sectionProps.section.label}
      </span>
    </div>
  )

  return {
    ItemComponent,
    SectionComponent,
  }
}

export function RenderSelectClearButton(props: SelectClearButtonRenderProps): JSX.Element {
  return (
    <Show when={props.show}>
      <IconButton
        name={props.iconName ?? 'icon-close'}
        size={props.size as 'xs' | 'sm' | 'md' | 'lg' | 'xl' | undefined}
        data-slot="clear"
        styles={{ root: props.style }}
        classes={{ root: props.rootClass }}
        tabIndex={-1}
        onClick={props.onClick}
      />
    </Show>
  )
}

export function RenderSelectTriggerButton(props: SelectTriggerButtonRenderProps): JSX.Element {
  return (
    <IconButton
      data-slot="trigger"
      styles={{ root: props.style }}
      name={props.name ?? 'icon-chevron-down'}
      size={props.size as 'xs' | 'sm' | 'md' | 'lg' | 'xl' | undefined}
      classes={{
        root: props.rootClass,
      }}
      loading={props.loading}
      loadingIcon={props.loadingIcon}
      tabIndex={-1}
      onClick={props.onClick}
    />
  )
}

export function RenderSelectEmptyNode<TContext>(
  props: SelectEmptyRenderProps<TContext>,
): JSX.Element {
  return (
    <Show
      when={typeof props.emptyRender === 'function' ? props.emptyRender : undefined}
      fallback={
        <div
          data-slot="empty"
          style={props.style}
          class={cn('text-sm text-muted-foreground p-2 text-center', props.class)}
        >
          {typeof props.emptyRender === 'string' ? props.emptyRender : 'No options'}
        </div>
      }
    >
      {(renderEmpty) => renderEmpty()(props.context())}
    </Show>
  )
}
