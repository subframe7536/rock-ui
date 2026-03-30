import type { JSX } from 'solid-js'
import { For, Show, createMemo, createSignal, mergeProps } from 'solid-js'

import type { BaseProps, SlotClasses, SlotStyles } from '../../shared/types'
import { cn, useId } from '../../shared/utils'
import { Checkbox } from '../checkbox'
import type { CheckboxProps } from '../checkbox/checkbox'
import { useFormField } from '../form-field/form-field-context'
import type {
  FormDisableOption,
  FormIdentityOptions,
  FormRequiredOption,
  FormValueOptions,
} from '../form-field/form-options'

import type { CheckboxGroupVariantProps } from './checkbox-group.class'
import {
  checkboxGroupFieldsetVariants,
  checkboxGroupItemVariants,
  checkboxGroupLegendVariants,
} from './checkbox-group.class'

export namespace CheckboxGroupT {
  export type Slot =
    | 'root'
    | 'fieldset'
    | 'legend'
    | 'item'
    | 'container'
    | 'control'
    | 'indicator'
    | 'icon'
    | 'wrapper'
    | 'label'
    | 'description'

  export type Variant = CheckboxGroupVariantProps
  export type Classes = SlotClasses<Slot>
  export type Styles = SlotStyles<Slot>
  export type Extend = never

  export interface Items<TTrue = boolean, TFalse = boolean> {
    /**
     * Value of the group item.
     */
    value?: string
    /**
     * Label for the group item.
     */
    label?: JSX.Element
    /**
     * Description for the group item.
     */
    description?: JSX.Element
    /**
     * Whether the item is disabled.
     */
    disabled?: boolean
    /**
     * Whether the item is indeterminate.
     */
    indeterminate?: CheckboxProps<TTrue, TFalse>['indeterminate']
    /**
     * Custom checked icon for this item.
     */
    checkedIcon?: CheckboxProps<TTrue, TFalse>['checkedIcon']
    /**
     * Custom indeterminate icon for this item.
     */
    indeterminateIcon?: CheckboxProps<TTrue, TFalse>['indeterminateIcon']
  }

  /**
   * Base props for the CheckboxGroup component.
   */
  export interface Base<TTrue = boolean, TFalse = boolean>
    extends FormIdentityOptions, FormValueOptions<string[]>, FormRequiredOption, FormDisableOption {
    /**
     * Legend for the checkbox group.
     */
    legend?: JSX.Element

    /**
     * Array of items to render in the group.
     */
    items?: (string | Items<TTrue, TFalse>)[]

    /**
     * Default indicator position for all items.
     */
    indicator?: CheckboxProps<TTrue, TFalse>['indicator']

    /**
     * Default checked icon for all items.
     */
    checkedIcon?: CheckboxProps<TTrue, TFalse>['checkedIcon']

    /**
     * Default indeterminate icon for all items.
     */
    indeterminateIcon?: CheckboxProps<TTrue, TFalse>['indeterminateIcon']

    /**
     * Callback when the selected values change.
     */
    onChange?: (value: string[]) => void
  }

  /**
   * Props for the CheckboxGroup component.
   */
  export interface Props<TTrue = boolean, TFalse = boolean> extends BaseProps<
    Base<TTrue, TFalse>,
    Variant,
    Extend,
    Slot
  > {}
}

/**
 * Props for the CheckboxGroup component.
 */
export interface CheckboxGroupProps<TTrue = boolean, TFalse = boolean> extends CheckboxGroupT.Props<
  TTrue,
  TFalse
> {}

interface NormalizedCheckboxGroupItem<TTrue = boolean, TFalse = boolean> {
  id: string
  value: string
  label?: JSX.Element
  description?: JSX.Element
  disabled: boolean
  indeterminate?: CheckboxProps<TTrue, TFalse>['indeterminate']
  checkedIcon?: CheckboxProps<TTrue, TFalse>['checkedIcon']
  indeterminateIcon?: CheckboxProps<TTrue, TFalse>['indeterminateIcon']
}

/** Multi-select checkbox group with card, list, and table layout variants. */
export function CheckboxGroup<TTrue = boolean, TFalse = boolean>(
  props: CheckboxGroupProps<TTrue, TFalse>,
): JSX.Element {
  const merged = mergeProps(
    {
      orientation: 'vertical' as const,
      variant: 'list' as const,
      size: 'md' as const,
      defaultValue: [] as string[],
    },
    props,
  )

  const groupId = useId(() => merged.id, 'checkbox-group')
  const field = useFormField(
    () => ({
      id: merged.id,
      name: merged.name,
      size: merged.size,
      disabled: merged.disabled,
    }),
    () => ({
      bind: false,
      defaultId: groupId(),
      defaultSize: 'md',
      initialValue: merged.defaultValue || [],
    }),
  )

  const [uncontrolledValue, setUncontrolledValue] = createSignal<string[]>(
    merged.defaultValue ?? [],
  )

  const selectedValues = createMemo(() => merged.value ?? uncontrolledValue())
  const legendId = createMemo(() => `${groupId()}-legend`)

  const normalizedItems = createMemo<NormalizedCheckboxGroupItem<TTrue, TFalse>[]>(() => {
    const items = merged.items ?? []

    return items.map((item, index) => {
      if (typeof item === 'string') {
        return {
          id: `${groupId()}:${item}`,
          value: item,
          label: item,
          disabled: false,
        }
      }

      const value = item.value ?? String(index)

      return {
        id: `${groupId()}:${value}`,
        value,
        label: item.label,
        description: item.description,
        disabled: Boolean(item.disabled),
        indeterminate: item.indeterminate,
        checkedIcon: item.checkedIcon,
        indeterminateIcon: item.indeterminateIcon,
      }
    })
  })

  function onItemCheckedChange(value: string, checked: boolean): void {
    const nextValues = checked
      ? selectedValues().includes(value)
        ? selectedValues()
        : [...selectedValues(), value]
      : selectedValues().filter((itemValue) => itemValue !== value)

    if (merged.value === undefined) {
      setUncontrolledValue(nextValues)
    }

    field.setFormValue(nextValues)
    merged.onChange?.(nextValues)
    field.emit('change')
    field.emit('input')
  }

  return (
    <div
      id={`${groupId()}-root`}
      data-slot="root"
      style={merged.styles?.root}
      class={cn('relative', merged.classes?.root)}
    >
      <fieldset
        id={groupId()}
        data-slot="fieldset"
        style={merged.styles?.fieldset}
        aria-labelledby={merged.legend ? legendId() : undefined}
        class={checkboxGroupFieldsetVariants(
          {
            orientation: merged.orientation,
          },
          merged.variant !== 'table' && 'gap-2',
          merged.classes?.fieldset,
        )}
        {...field.ariaAttrs()}
      >
        <Show when={merged.legend}>
          <legend
            id={legendId()}
            data-slot="legend"
            style={merged.styles?.legend}
            class={checkboxGroupLegendVariants(
              {
                size: field.size(),
                required: merged.required,
              },
              merged.classes?.legend,
            )}
          >
            {merged.legend}
          </legend>
        </Show>

        <For each={normalizedItems()}>
          {(item) => (
            <Checkbox
              id={item.id}
              name={field.name()}
              formFieldBind={false}
              checked={selectedValues().includes(item.value)}
              value={item.value}
              label={item.label}
              description={item.description}
              disabled={item.disabled || field.disabled()}
              indeterminate={item.indeterminate}
              required={merged.required}
              size={field.size()}
              variant={merged.variant === 'list' ? 'list' : 'card'}
              indicator={merged.indicator}
              checkedIcon={item.checkedIcon ?? merged.checkedIcon}
              indeterminateIcon={item.indeterminateIcon ?? merged.indeterminateIcon}
              classes={{
                root: checkboxGroupItemVariants(
                  {
                    tableSize: merged.variant === 'table' ? field.size() : undefined,
                    tableOrientation: merged.variant === 'table' ? merged.orientation : undefined,
                  },
                  merged.variant === 'table' &&
                    'relative rounded-none b-(1 muted) data-checked:(bg-primary/10 border-primary/50) data-checked:z-1',
                  merged.classes?.item,
                ),
                ...merged.classes,
              }}
              styles={merged.styles}
              onChange={(checked) => onItemCheckedChange(item.value, Boolean(checked))}
            />
          )}
        </For>
      </fieldset>
    </div>
  )
}
