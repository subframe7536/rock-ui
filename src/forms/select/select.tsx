import type { JSX } from 'solid-js'
import { Show, createMemo } from 'solid-js'

import { Icon } from '../../elements/icon'
import type { IconT } from '../../elements/icon'
import type { BaseProps, SlotClasses, SlotStyles } from '../../shared/types'
import { useControllableValue } from '../../shared/use-controllable-value'
import { cn } from '../../shared/utils'
import type {
  FormDisableOption,
  FormIdentityOptions,
  FormRequiredOption,
  FormValueOptions,
} from '../form-field/form-options'

import { BaseSelect } from './base-select'
import type { BaseSelectT } from './base-select'
import type { SelectControlVariantProps } from './select.class'
import {
  selectControlVariants,
  selectInputVariants,
  selectLeadingIconVariants,
  selectTriggerIconVariants,
} from './select.class'
import { createFindOptionByValue, mapNormalizedToRawValue } from './shared'
import type { NormalizedOption } from './shared'

export namespace SelectT {
  export type Value = string | number

  export type OptionRenderState = BaseSelectT.OptionRenderState
  export type ControlSlot = 'control' | 'input' | 'leading' | 'trigger'
  export type OptionSlot = 'empty' | 'itemLabel' | 'itemDescription' | 'itemTrailing'

  export interface EmptyRenderContext<TItem extends Value = Value> {
    /** Current input/search text. */
    inputValue: string
    /** Whether the current filter has any matches. */
    hasMatches: boolean
    /** Currently selected value. */
    selectedValue: TItem | null
    /** Close the dropdown menu. */
    close: () => void
  }

  export type Slot = BaseSelectT.Slot | ControlSlot | OptionSlot
  export type Variant = SelectControlVariantProps
  export type Classes = SlotClasses<Slot>
  export type Styles = SlotStyles<Slot>
  export type Extend<TItem extends Value = Value> = Omit<
    BaseSelectT.Base<Item<TItem>>,
    | 'children'
    | 'closeOnSelect'
    | 'emptyRender'
    | 'initialValue'
    | 'onInputKeyDown'
    | 'onOptionSelect'
    | 'selectedValues'
    | 'tabSelectionBehavior'
  >

  export interface Item<Val extends Value = Value> extends BaseSelectT.Item<Val> {}

  export interface Base<TItem extends Value = Value>
    extends
      FormIdentityOptions,
      FormValueOptions<TItem | null>,
      FormRequiredOption,
      FormDisableOption {
    /** Called when the selection changes. */
    onChange?: (value: NoInfer<TItem | null>) => void
    /** Custom renderer for each option in the dropdown. Passes `null` for empty state. */
    optionRender?: (option: (SelectT.Item<TItem> & OptionRenderState) | null) => JSX.Element
    /** Custom renderer for the option label text. */
    labelRender?: (option: SelectT.Item<TItem>) => JSX.Element
    /** Custom renderer for the empty state when current filtered result has no matches. */
    emptyRender?: string | ((context: EmptyRenderContext<TItem>) => JSX.Element)
    /**
     * Placeholder text shown when no value is selected.
     * @default ''
     */
    placeholder?: string
    /** Whether the select is in a loading state. */
    loading?: boolean
    /**
     * Icon shown during loading state.
     * @default 'icon-loading'
     */
    loadingIcon?: IconT.Name
    /** Icon shown before the input/value area. */
    leadingIcon?: IconT.Name
    /**
     * Icon for the dropdown trigger.
     * @default 'icon-chevron-down'
     */
    trailingIcon?: IconT.Name
    /** Icon kept for API compatibility; Select has no clear action. */
    closeIcon?: IconT.Name
  }

  export interface Props<TItem extends Value = Value> extends BaseProps<
    Base<TItem>,
    Variant,
    Extend<TItem>,
    Slot
  > {}
}

export interface SelectProps<
  TItem extends SelectT.Value = SelectT.Value,
> extends SelectT.Props<TItem> {}

/** Dropdown select component with search and custom item rendering. */
export function Select<TItem extends SelectT.Value = SelectT.Value>(
  props: SelectProps<TItem>,
): JSX.Element {
  type Item = SelectT.Item<TItem>
  const [selectedValue, setSelectedValue] = useControllableValue<TItem | null>({
    value: () => props.value,
    defaultValue: () => props.defaultValue ?? null,
  })

  const selectedValueList = createMemo<SelectT.Value[]>(() => {
    const value = selectedValue()
    return value === null || value === undefined ? [] : [value]
  })

  function findSelectedOption(api: BaseSelectT.Api<Item>): NormalizedOption<Item> | null {
    const value = selectedValue()
    if (value === null || value === undefined) {
      return null
    }

    const finder = createFindOptionByValue<Item>(() => api?.allFlatOptions() ?? [])
    return finder(value) ?? null
  }

  function updateSelection(
    option: NormalizedOption<Item> | null,
    api: BaseSelectT.Api<Item>,
  ): void {
    const nextValue = option ? (mapNormalizedToRawValue(option) as TItem) : null
    setSelectedValue(nextValue)
    api.setInputValue(option?.key ?? '')
    api.field.setFormValue(nextValue ?? '')
    props.onChange?.(nextValue)
    api.field.emit('change')
    api.field.emit('input')
  }

  function displayValue(api: BaseSelectT.Api<Item>): string | JSX.Element {
    const selected = findSelectedOption(api)
    return selected ? (selected.label ?? selected.key) : props.placeholder
  }

  function renderEmpty(api: BaseSelectT.Api<Item>): JSX.Element | undefined {
    const emptyRender = props.emptyRender
    if (!emptyRender) {
      return undefined
    }

    if (typeof emptyRender === 'string') {
      return (
        <div
          data-slot="empty"
          style={props.styles?.empty}
          class={props.classes?.empty as string | undefined}
        >
          {emptyRender}
        </div>
      )
    }

    const selected = findSelectedOption(api)
    return emptyRender({
      inputValue: api.inputValue(),
      hasMatches: api.visibleFlatOptions().length > 0,
      selectedValue: selected ? (mapNormalizedToRawValue(selected) as TItem) : null,
      close: api.close,
    })
  }

  function renderDefaultOption(option: (Item & SelectT.OptionRenderState) | null): JSX.Element {
    if (!option) {
      return (
        <div
          data-slot="empty"
          class={cn('text-sm text-muted-foreground p-2 text-center', props.classes?.empty)}
          style={props.styles?.empty}
        >
          No options
        </div>
      )
    }

    const label = (): JSX.Element => (
      <span
        data-slot="itemLabel"
        style={props.styles?.itemLabel}
        class={cn('truncate', props.classes?.itemLabel)}
      >
        <Show when={props.labelRender} keyed fallback={option.label}>
          {(render) => render(option)}
        </Show>
      </span>
    )

    return (
      <>
        <span class="flex flex-1 gap-2 min-w-0 items-center">
          <Show when={option.icon}>{(icon) => <Icon name={icon()} class="shrink-0" />}</Show>
          <span class="flex-1 min-w-0">
            {label()}
            <Show when={option.description}>
              {(description) => (
                <span
                  data-slot="itemDescription"
                  style={props.styles?.itemDescription}
                  class={cn('text-xs text-muted-foreground block', props.classes?.itemDescription)}
                >
                  {description()}
                </span>
              )}
            </Show>
          </span>
        </span>

        <Show when={option.isSelected}>
          <span
            data-slot="itemTrailing"
            style={props.styles?.itemTrailing}
            class={cn(
              'text-sm inline-flex shrink-0 items-center justify-center',
              props.classes?.itemTrailing,
            )}
          >
            <Icon name="icon-check" />
          </span>
        </Show>
      </>
    )
  }

  return (
    <BaseSelect<Item>
      {...props}
      initialValue={
        props.defaultValue === null || props.defaultValue === undefined ? '' : props.defaultValue
      }
      selectedValues={selectedValueList()}
      onOptionSelect={(option, api) => updateSelection(option, api)}
      emptyRender={(api) => renderEmpty(api)}
      optionRender={(option) => props.optionRender?.(option) ?? renderDefaultOption(option)}
    >
      {(api) => {
        return (
          <div
            ref={(el) => api.registerControl(el)}
            data-slot="control"
            data-disabled={api.field.disabled() ? '' : undefined}
            data-invalid={api.field.invalid() ? '' : undefined}
            style={props.styles?.control}
            class={selectControlVariants(
              { variant: props.variant, search: api.isSearchable() },
              props.classes?.control,
            )}
            onPointerDown={api.controlPointerDown}
            onClick={api.controlClick}
            {...api.controlComboboxProps()}
          >
            <Show when={props.leadingIcon}>
              {(icon) => (
                <Icon
                  name={icon()}
                  size={api.field.size()}
                  slotName="leading"
                  style={props.styles?.leading}
                  class={selectLeadingIconVariants(
                    { size: api.field.size() },
                    props.classes?.leading,
                  )}
                />
              )}
            </Show>

            <Show
              when={api.isSearchable()}
              fallback={
                <span
                  data-slot="input"
                  style={props.styles?.input}
                  class={selectInputVariants(
                    {
                      mode: 'single',
                      size: api.field.size(),
                    },
                    'text-start truncate',
                    props.classes?.input,
                  )}
                >
                  {displayValue(api)}
                </span>
              }
            >
              <input
                ref={(el) => api.registerInput(el)}
                id={api.field.id()}
                role="combobox"
                aria-controls={api.listboxId()}
                aria-expanded={api.isOpen() ? 'true' : 'false'}
                aria-haspopup="listbox"
                aria-autocomplete="list"
                aria-activedescendant={api.activeDescendantId()}
                data-slot="input"
                style={props.styles?.input}
                class={selectInputVariants(
                  {
                    mode: 'single',
                    size: api.field.size(),
                  },
                  props.classes?.input,
                )}
                maxLength={props.searchMaxLength}
                placeholder={props.placeholder}
                value={api.inputValue()}
                disabled={api.field.disabled()}
                required={props.required}
                aria-invalid={api.field.invalid() ? 'true' : undefined}
                onInput={(event) => {
                  api.setInputValue(event.currentTarget.value)
                  api.inputHandlers.onInput(event)
                }}
                onKeyDown={api.inputHandlers.onKeyDown}
                onFocus={api.inputHandlers.onFocus}
                onBlur={api.inputHandlers.onBlur}
                {...api.field.ariaAttrs()}
              />
            </Show>

            <Icon
              name={
                props.loading
                  ? (props.loadingIcon ?? 'icon-loading')
                  : (props.trailingIcon ?? 'icon-chevron-down')
              }
              slotName="trigger"
              data-loading={props.loading ? '' : undefined}
              class={selectTriggerIconVariants(
                { size: api.field.size() },
                props.loading ? 'effect-loading' : undefined,
                props.classes?.trigger,
              )}
              style={props.styles?.trigger}
            />
          </div>
        )
      }}
    </BaseSelect>
  )
}
