import type { JSX } from 'solid-js'
import { For, Show, createMemo, createSignal, mergeProps, splitProps } from 'solid-js'

import { Checkbox } from '../checkbox'
import type { CheckboxProps } from '../checkbox/checkbox'
import { useFormField } from '../form-field/form-field-context'
import { cn, useId } from '../shared/utils'

import type { CheckboxGroupVariantProps } from './checkbox-group.class'
import {
  checkboxGroupFieldsetVariants,
  checkboxGroupLegendVariants,
  checkboxGroupTableOrientationVariants,
  checkboxGroupTablePaddingVariants,
} from './checkbox-group.class'

export type CheckboxGroupValue = string

export interface CheckboxGroupItemObject {
  value?: unknown
  label?: JSX.Element
  description?: JSX.Element
  disabled?: boolean
  classes?: {
    root?: string
    checkbox?: CheckboxProps['classes']
  }
  checkedIcon?: CheckboxProps['checkedIcon']
  indeterminateIcon?: CheckboxProps['indeterminateIcon']
  [key: string]: unknown
}

export type CheckboxGroupItem = string | number | boolean | null | CheckboxGroupItemObject

export interface CheckboxGroupClasses {
  root?: string
  fieldset?: string
  legend?: string
  item?: string
  checkbox?: CheckboxProps['classes']
}

type CheckboxGroupSize = NonNullable<CheckboxProps['size']>
type CheckboxGroupColor = NonNullable<CheckboxProps['color']>

export interface CheckboxGroupBaseProps extends CheckboxGroupVariantProps {
  id?: string
  name?: string
  legend?: JSX.Element
  valueKey?: string
  labelKey?: string
  descriptionKey?: string
  items?: CheckboxGroupItem[]
  color?: CheckboxProps['color']
  indicator?: CheckboxProps['indicator']
  checkedIcon?: CheckboxProps['checkedIcon']
  indeterminateIcon?: CheckboxProps['indeterminateIcon']
  value?: CheckboxGroupValue[]
  defaultValue?: CheckboxGroupValue[]
  required?: boolean
  disabled?: boolean
  onChange?: (value: CheckboxGroupValue[]) => void
  classes?: CheckboxGroupClasses
}

export type CheckboxGroupProps = CheckboxGroupBaseProps

interface NormalizedCheckboxGroupItem {
  id: string
  value: CheckboxGroupValue
  label?: JSX.Element
  description?: JSX.Element
  disabled: boolean
  classes?: {
    root?: string
    checkbox?: CheckboxProps['classes']
  }
  checkedIcon?: CheckboxProps['checkedIcon']
  indeterminateIcon?: CheckboxProps['indeterminateIcon']
}

function getAtPath(data: Record<string, unknown>, path: string): unknown {
  return path
    .split('.')
    .reduce<unknown>((value, key) => (value as Record<string, unknown> | undefined)?.[key], data)
}

function toValueString(value: unknown, fallback: string): CheckboxGroupValue {
  if (value === null || value === undefined) {
    return fallback
  }

  return String(value)
}

export function CheckboxGroup(props: CheckboxGroupProps): JSX.Element {
  const merged = mergeProps(
    {
      valueKey: 'value',
      labelKey: 'label',
      descriptionKey: 'description',
      orientation: 'vertical' as const,
      variant: 'list' as const,
      size: 'md' as const,
      color: 'primary' as const,
      defaultValue: [] as CheckboxGroupValue[],
    },
    props,
  )

  const [formProps, collectionProps, styleBehaviorProps] = splitProps(
    merged as CheckboxGroupProps,
    ['id', 'name', 'value', 'defaultValue', 'required', 'disabled', 'onChange'],
    ['legend', 'items', 'valueKey', 'labelKey', 'descriptionKey'],
  )

  const field = useFormField(
    () => ({
      id: formProps.id,
      name: formProps.name,
      color: styleBehaviorProps.color,
      size: styleBehaviorProps.size,
      disabled: formProps.disabled,
    }),
    {
      bind: false,
    },
  )

  const groupId = useId(() => formProps.id, 'checkbox-group')
  const [uncontrolledValue, setUncontrolledValue] = createSignal<CheckboxGroupValue[]>(
    formProps.defaultValue ?? [],
  )

  const resolvedSize = createMemo(
    () => (field.size() ?? styleBehaviorProps.size) as CheckboxGroupSize,
  )
  const resolvedColor = createMemo(
    () => (field.color() ?? styleBehaviorProps.color) as CheckboxGroupColor,
  )
  const disabled = createMemo(() => field.disabled())
  const selectedValues = createMemo(() => formProps.value ?? uncontrolledValue())
  const ariaAttrs = createMemo(() => field.ariaAttrs() ?? {})
  const legendId = createMemo(() => `${groupId()}-legend`)

  const normalizedItems = createMemo<NormalizedCheckboxGroupItem[]>(() => {
    const items = collectionProps.items ?? []
    const valueKey = collectionProps.valueKey ?? 'value'
    const labelKey = collectionProps.labelKey ?? 'label'
    const descriptionKey = collectionProps.descriptionKey ?? 'description'

    return items.map((item, index) => {
      if (typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean') {
        const value = toValueString(item, String(index))

        return {
          id: `${groupId()}:${value}`,
          value,
          label: value,
          disabled: false,
        }
      }

      if (item === null) {
        const value = String(index)

        return {
          id: `${groupId()}:${value}`,
          value,
          label: undefined,
          description: undefined,
          disabled: false,
        }
      }

      const objectItem = item as CheckboxGroupItemObject
      const value = toValueString(
        getAtPath(objectItem as Record<string, unknown>, valueKey),
        String(index),
      )
      const label = getAtPath(objectItem as Record<string, unknown>, labelKey) as
        | JSX.Element
        | undefined
      const description = getAtPath(objectItem as Record<string, unknown>, descriptionKey) as
        | JSX.Element
        | undefined

      return {
        id: `${groupId()}:${value}`,
        value,
        label,
        description,
        disabled: Boolean(objectItem.disabled),
        classes: objectItem.classes,
        checkedIcon: objectItem.checkedIcon,
        indeterminateIcon: objectItem.indeterminateIcon,
      }
    })
  })

  function setValue(nextValue: CheckboxGroupValue[]): void {
    if (formProps.value === undefined) {
      setUncontrolledValue(nextValue)
    }

    formProps.onChange?.(nextValue)
    field.emitFormChange()
    field.emitFormInput()
  }

  function onItemCheckedChange(value: CheckboxGroupValue, checked: boolean): void {
    const nextValues = checked
      ? selectedValues().includes(value)
        ? selectedValues()
        : [...selectedValues(), value]
      : selectedValues().filter((itemValue) => itemValue !== value)

    setValue(nextValues)
  }

  return (
    <div
      id={`${groupId()}-root`}
      data-slot="root"
      class={cn('relative', styleBehaviorProps.classes?.root)}
    >
      <fieldset
        id={groupId()}
        data-slot="fieldset"
        aria-labelledby={collectionProps.legend ? legendId() : undefined}
        class={checkboxGroupFieldsetVariants(
          {
            orientation: styleBehaviorProps.orientation,
            size: resolvedSize(),
          },
          styleBehaviorProps.classes?.fieldset,
        )}
        {...(ariaAttrs() as Record<string, string | boolean | undefined>)}
      >
        <Show when={collectionProps.legend}>
          <legend
            id={legendId()}
            data-slot="legend"
            class={checkboxGroupLegendVariants(
              {
                size: resolvedSize(),
                required: formProps.required,
              },
              styleBehaviorProps.classes?.legend,
            )}
          >
            {collectionProps.legend}
          </legend>
        </Show>

        <For each={normalizedItems()}>
          {(item) => (
            <div
              data-slot="item"
              class={
                styleBehaviorProps.variant === 'table'
                  ? checkboxGroupTablePaddingVariants(
                      {
                        size: resolvedSize(),
                      },
                      'border border-border',
                      checkboxGroupTableOrientationVariants({
                        orientation: styleBehaviorProps.orientation,
                      }),
                      item.disabled || disabled() ? 'cursor-not-allowed' : undefined,
                      styleBehaviorProps.classes?.item,
                      item.classes?.root,
                    )
                  : cn(
                      item.disabled || disabled() ? 'cursor-not-allowed' : undefined,
                      styleBehaviorProps.classes?.item,
                      item.classes?.root,
                    )
              }
            >
              <Checkbox
                id={item.id}
                name={field.name()}
                formFieldBind={false}
                checked={selectedValues().includes(item.value)}
                value={item.value}
                label={item.label}
                description={item.description}
                disabled={item.disabled || disabled()}
                required={formProps.required}
                size={resolvedSize()}
                color={resolvedColor()}
                variant={
                  styleBehaviorProps.variant === 'table' || styleBehaviorProps.variant === 'card'
                    ? 'card'
                    : 'list'
                }
                indicator={styleBehaviorProps.indicator}
                checkedIcon={item.checkedIcon ?? styleBehaviorProps.checkedIcon}
                indeterminateIcon={item.indeterminateIcon ?? styleBehaviorProps.indeterminateIcon}
                classes={{ ...styleBehaviorProps.classes?.checkbox, ...item.classes?.checkbox }}
                onChange={(checked) => onItemCheckedChange(item.value, checked)}
              />
            </div>
          )}
        </For>
      </fieldset>
    </div>
  )
}
