import * as KobalteRadioGroup from '@kobalte/core/radio-group'
import type { JSX } from 'solid-js'
import { For, Show, createMemo, mergeProps, splitProps } from 'solid-js'

import { useFormField } from '../form-field/form-field-context'
import { cn, useId } from '../shared/utils'

import type { RadioGroupVariantProps } from './radio-group.class'
import {
  radioGroupBaseVariants,
  radioGroupCardCheckedColorVariants,
  radioGroupCardPaddingVariants,
  radioGroupContainerVariants,
  radioGroupDescriptionVariants,
  radioGroupDotVariants,
  radioGroupFieldsetVariants,
  radioGroupIndicatorVariants,
  radioGroupItemVariants,
  radioGroupLabelVariants,
  radioGroupLegendVariants,
  radioGroupTableCheckedColorVariants,
  radioGroupTableOrientationVariants,
  radioGroupTablePaddingVariants,
  radioGroupWrapperVariants,
} from './radio-group.class'

type RadioGroupSize = NonNullable<RadioGroupVariantProps['size']>
type RadioGroupColor = NonNullable<RadioGroupVariantProps['color']>

export type RadioGroupValue = string

export interface RadioGroupClasses {
  root?: string
  fieldset?: string
  legend?: string
  item?: string
  container?: string
  base?: string
  indicator?: string
  dot?: string
  wrapper?: string
  label?: string
  description?: string
}

export interface RadioGroupItemClasses {
  root?: string
  container?: string
  base?: string
  indicator?: string
  dot?: string
  wrapper?: string
  label?: string
  description?: string
}

export interface RadioGroupItemObject {
  value?: unknown
  label?: JSX.Element
  description?: JSX.Element
  disabled?: boolean
  classes?: RadioGroupItemClasses
  [key: string]: unknown
}

export type RadioGroupItem = string | number | boolean | null | RadioGroupItemObject

interface NormalizedRadioGroupItem {
  id: string
  inputId: string
  value: RadioGroupValue
  label?: JSX.Element
  description?: JSX.Element
  disabled: boolean
  classes?: RadioGroupItemClasses
}

export interface RadioGroupBaseProps extends RadioGroupVariantProps {
  id?: string
  name?: string
  legend?: JSX.Element
  valueKey?: string
  labelKey?: string
  descriptionKey?: string
  items?: RadioGroupItem[]
  value?: RadioGroupValue
  defaultValue?: RadioGroupValue
  required?: boolean
  disabled?: boolean
  readOnly?: boolean
  onChange?: (value: RadioGroupValue) => void
  classes?: RadioGroupClasses
}

export type RadioGroupProps = RadioGroupBaseProps &
  Omit<
    KobalteRadioGroup.RadioGroupRootProps,
    keyof RadioGroupBaseProps | 'id' | 'children' | 'class'
  >

function getAtPath(data: Record<string, unknown>, path: string): unknown {
  return path
    .split('.')
    .reduce<unknown>((value, key) => (value as Record<string, unknown> | undefined)?.[key], data)
}

function toValueString(value: unknown, fallback: string): RadioGroupValue {
  if (value === null || value === undefined) {
    return fallback
  }

  return String(value)
}

export function RadioGroup(props: RadioGroupProps): JSX.Element {
  const merged = mergeProps(
    {
      valueKey: 'value',
      labelKey: 'label',
      descriptionKey: 'description',
      orientation: 'vertical' as const,
      variant: 'list' as const,
      indicator: 'start' as const,
      size: 'md' as const,
      color: 'primary' as const,
    },
    props,
  )

  const [formProps, rootStateProps, collectionProps, styleProps, rootProps] = splitProps(
    merged as RadioGroupProps,
    ['id', 'name', 'disabled', 'onChange'],
    ['value', 'defaultValue', 'required', 'readOnly'],
    ['legend', 'items', 'valueKey', 'labelKey', 'descriptionKey'],
    ['variant', 'indicator', 'orientation', 'size', 'color', 'classes'],
  )

  const field = useFormField(
    () => ({
      id: formProps.id,
      name: formProps.name,
      color: styleProps.color,
      size: styleProps.size,
      disabled: formProps.disabled,
    }),
    {
      bind: false,
    },
  )

  const groupId = useId(() => formProps.id, 'radio-group')
  const legendId = createMemo(() => `${groupId()}-legend`)
  const resolvedSize = createMemo(() => (field.size() ?? styleProps.size) as RadioGroupSize)
  const resolvedColor = createMemo(() => (field.color() ?? styleProps.color) as RadioGroupColor)
  const disabled = createMemo(() => field.disabled())
  const ariaAttrs = createMemo(() => field.ariaAttrs() ?? {})
  const invalid = createMemo(() => {
    const value = ariaAttrs()['aria-invalid']

    return value === true || value === 'true'
  })

  const normalizedItems = createMemo<NormalizedRadioGroupItem[]>(() => {
    const items = collectionProps.items ?? []
    const valueKey = collectionProps.valueKey ?? 'value'
    const labelKey = collectionProps.labelKey ?? 'label'
    const descriptionKey = collectionProps.descriptionKey ?? 'description'

    return items.map((item, index) => {
      if (typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean') {
        const value = toValueString(item, String(index))
        const baseId = `${groupId()}:${value}`

        return {
          id: baseId,
          inputId: `${baseId}-input`,
          value,
          label: value,
          disabled: false,
        }
      }

      if (item === null) {
        const value = String(index)
        const baseId = `${groupId()}:${value}`

        return {
          id: baseId,
          inputId: `${baseId}-input`,
          value,
          disabled: false,
        }
      }

      const objectItem = item as RadioGroupItemObject
      const value = toValueString(
        getAtPath(objectItem as Record<string, unknown>, valueKey),
        String(index),
      )
      const baseId = `${groupId()}:${value}`
      const label = getAtPath(objectItem as Record<string, unknown>, labelKey) as
        | JSX.Element
        | undefined
      const description = getAtPath(objectItem as Record<string, unknown>, descriptionKey) as
        | JSX.Element
        | undefined

      return {
        id: baseId,
        inputId: `${baseId}-input`,
        value,
        label,
        description,
        disabled: Boolean(objectItem.disabled),
        classes: objectItem.classes,
      }
    })
  })

  function onChange(nextValue: string): void {
    formProps.onChange?.(nextValue)
    field.emitFormChange()
    field.emitFormInput()
  }

  return (
    <KobalteRadioGroup.Root
      {...rootStateProps}
      id={groupId()}
      name={field.name()}
      disabled={disabled()}
      orientation={styleProps.orientation}
      onChange={onChange}
      data-slot="root"
      class={cn('relative', styleProps.classes?.root)}
      {...(ariaAttrs() as Record<string, string | boolean | undefined>)}
      {...rootProps}
    >
      <fieldset
        data-slot="fieldset"
        aria-labelledby={collectionProps.legend ? legendId() : undefined}
        class={radioGroupFieldsetVariants(
          {
            orientation: styleProps.orientation,
            size: resolvedSize(),
          },
          styleProps.classes?.fieldset,
        )}
      >
        <Show when={collectionProps.legend}>
          <legend
            id={legendId()}
            data-slot="legend"
            class={radioGroupLegendVariants(
              {
                size: resolvedSize(),
                required: rootStateProps.required,
              },
              styleProps.classes?.legend,
            )}
          >
            {collectionProps.legend}
          </legend>
        </Show>

        <For each={normalizedItems()}>
          {(item) => (
            <KobalteRadioGroup.Item
              id={item.id}
              value={item.value}
              disabled={item.disabled || disabled()}
              data-slot="item"
              class={radioGroupItemVariants(
                {
                  size: resolvedSize(),
                  variant: styleProps.variant === 'list' ? undefined : styleProps.variant,
                  indicator: styleProps.indicator === 'hidden' ? undefined : styleProps.indicator,
                  disabled: item.disabled || disabled(),
                },
                styleProps.variant === 'card' &&
                  radioGroupCardPaddingVariants({ size: resolvedSize() }),
                styleProps.variant === 'table' &&
                  radioGroupTablePaddingVariants({
                    size: resolvedSize(),
                  }),
                styleProps.variant === 'table' &&
                  radioGroupTableOrientationVariants({
                    orientation: styleProps.orientation,
                  }),
                styleProps.variant === 'card' &&
                  radioGroupCardCheckedColorVariants({
                    color: resolvedColor(),
                  }),
                styleProps.variant === 'table' &&
                  radioGroupTableCheckedColorVariants({
                    color: resolvedColor(),
                  }),
                styleProps.classes?.item,
                item.classes?.root,
              )}
            >
              <div
                data-slot="container"
                class={radioGroupContainerVariants(
                  {
                    size: resolvedSize(),
                  },
                  styleProps.classes?.container,
                  item.classes?.container,
                )}
              >
                <KobalteRadioGroup.ItemInput id={item.inputId} data-slot="input" />

                <KobalteRadioGroup.ItemControl
                  data-slot="base"
                  class={radioGroupBaseVariants(
                    {
                      size: resolvedSize(),
                      disabled: item.disabled || disabled(),
                      invalid: invalid(),
                    },
                    styleProps.indicator === 'hidden' && 'sr-only',
                    styleProps.classes?.base,
                    item.classes?.base,
                  )}
                >
                  <KobalteRadioGroup.ItemIndicator
                    data-slot="indicator"
                    class={radioGroupIndicatorVariants(
                      {
                        color: resolvedColor(),
                      },
                      styleProps.classes?.indicator,
                      item.classes?.indicator,
                    )}
                  >
                    <span
                      data-slot="dot"
                      class={radioGroupDotVariants(
                        {
                          size: resolvedSize(),
                        },
                        styleProps.classes?.dot,
                        item.classes?.dot,
                      )}
                    />
                  </KobalteRadioGroup.ItemIndicator>
                </KobalteRadioGroup.ItemControl>
              </div>

              <Show when={item.label || item.description}>
                <div
                  data-slot="wrapper"
                  class={radioGroupWrapperVariants(
                    {
                      indicator: styleProps.indicator,
                    },
                    styleProps.classes?.wrapper,
                    item.classes?.wrapper,
                  )}
                >
                  <Show when={item.label}>
                    <label
                      for={item.inputId}
                      data-slot="label"
                      class={radioGroupLabelVariants(
                        {
                          disabled: item.disabled || disabled(),
                        },
                        styleProps.classes?.label,
                        item.classes?.label,
                      )}
                    >
                      {item.label}
                    </label>
                  </Show>

                  <Show when={item.description}>
                    <p
                      data-slot="description"
                      class={radioGroupDescriptionVariants(
                        {
                          disabled: item.disabled || disabled(),
                        },
                        styleProps.classes?.description,
                        item.classes?.description,
                      )}
                    >
                      {item.description}
                    </p>
                  </Show>
                </div>
              </Show>
            </KobalteRadioGroup.Item>
          )}
        </For>
      </fieldset>
    </KobalteRadioGroup.Root>
  )
}
