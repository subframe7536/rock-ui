import * as KobalteCheckbox from '@kobalte/core/checkbox'
import type { JSX } from 'solid-js'
import { Show, createMemo, mergeProps, splitProps } from 'solid-js'

import { useFormField } from '../form-field/form-field-context'
import type { IconName } from '../icon'
import { Icon } from '../icon'
import { useId } from '../shared/utils'

import type { CheckboxVariantProps } from './checkbox.class'
import {
  checkboxBaseVariants,
  checkboxCardPaddingVariants,
  checkboxContainerVariants,
  checkboxDescriptionVariants,
  checkboxIconVariants,
  checkboxIndicatorVariants,
  checkboxLabelVariants,
  checkboxRootVariants,
  checkboxWrapperVariants,
} from './checkbox.class'

type CheckboxColor = NonNullable<CheckboxVariantProps['color']>
type CheckboxSize = NonNullable<CheckboxVariantProps['size']>

export interface CheckboxClasses {
  root?: string
  container?: string
  base?: string
  indicator?: string
  icon?: string
  wrapper?: string
  label?: string
  description?: string
}

export interface CheckboxBaseProps extends CheckboxVariantProps {
  id?: string
  name?: string
  label?: JSX.Element
  description?: JSX.Element
  formFieldBind?: boolean
  checkedIcon?: IconName
  indeterminateIcon?: IconName
  classes?: CheckboxClasses
}

export type CheckboxProps = CheckboxBaseProps &
  Omit<KobalteCheckbox.CheckboxRootProps, keyof CheckboxBaseProps | 'children' | 'class'>

export function Checkbox(props: CheckboxProps): JSX.Element {
  const merged = mergeProps(
    {
      size: 'md' as const,
      color: 'primary' as const,
      variant: 'list' as const,
      indicator: 'start' as const,
      checkedIcon: 'icon-check' as IconName,
      indeterminateIcon: 'icon-minus' as IconName,
      formFieldBind: true,
    },
    props,
  )

  const [formProps, rootStateProps, visualProps, rootProps] = splitProps(
    merged as CheckboxProps,
    ['id', 'name', 'formFieldBind', 'disabled', 'onChange'],
    ['value', 'checked', 'defaultChecked', 'indeterminate', 'required', 'readOnly'],
    [
      'label',
      'description',
      'size',
      'color',
      'variant',
      'indicator',
      'checkedIcon',
      'indeterminateIcon',
      'classes',
    ],
  )

  const field = useFormField(
    () => ({
      id: formProps.id,
      name: formProps.name,
      size: visualProps.size,
      color: visualProps.color,
      disabled: formProps.disabled,
    }),
    () => ({
      bind: formProps.formFieldBind,
    }),
  )
  const generatedId = useId(() => formProps.id, 'checkbox')

  const inputId = createMemo(() => field.id() ?? generatedId())
  const rootId = createMemo(() => `${inputId()}-root`)
  const resolvedColor = createMemo(() => (field.color() ?? visualProps.color) as CheckboxColor)
  const resolvedSize = createMemo(() => (field.size() ?? visualProps.size) as CheckboxSize)
  const disabled = createMemo(() => field.disabled())
  const ariaAttrs = createMemo(() => field.ariaAttrs() ?? {})
  const invalid = createMemo(() => {
    const value = ariaAttrs()['aria-invalid']

    return value === true || value === 'true'
  })

  function onChange(nextChecked: boolean): void {
    formProps.onChange?.(nextChecked)
    field.emitFormChange()
    field.emitFormInput()
  }

  return (
    <KobalteCheckbox.Root
      {...rootStateProps}
      id={rootId()}
      name={field.name()}
      disabled={disabled()}
      onChange={onChange}
      data-slot="root"
      class={checkboxRootVariants(
        {
          variant: visualProps.variant === 'card' ? 'card' : undefined,
          indicator: visualProps.indicator === 'hidden' ? undefined : visualProps.indicator,
          disabled: disabled(),
        },
        visualProps.variant === 'card' &&
          checkboxCardPaddingVariants({
            size: resolvedSize(),
          }),
        visualProps.classes?.root,
      )}
      {...rootProps}
    >
      {(state) => (
        <>
          <div
            data-slot="container"
            class={checkboxContainerVariants(
              {
                size: resolvedSize(),
              },
              visualProps.classes?.container,
            )}
          >
            <KobalteCheckbox.Input
              id={inputId()}
              data-slot="input"
              {...(ariaAttrs() as Record<string, string | boolean | undefined>)}
            />

            <KobalteCheckbox.Control
              data-slot="base"
              class={checkboxBaseVariants(
                {
                  color: resolvedColor(),
                  size: resolvedSize(),
                  disabled: disabled(),
                  invalid: invalid(),
                },
                visualProps.indicator === 'hidden' && 'sr-only',
                visualProps.classes?.base,
              )}
            >
              <KobalteCheckbox.Indicator
                data-slot="indicator"
                class={checkboxIndicatorVariants(
                  {
                    color: resolvedColor(),
                  },
                  visualProps.classes?.indicator,
                )}
              >
                <Show
                  when={state.indeterminate()}
                  fallback={
                    <Icon
                      name={visualProps.checkedIcon}
                      classes={{
                        root: checkboxIconVariants(
                          {
                            size: resolvedSize(),
                          },
                          visualProps.classes?.icon,
                        ),
                      }}
                    />
                  }
                >
                  <Icon
                    name={visualProps.indeterminateIcon}
                    classes={{
                      root: checkboxIconVariants(
                        {
                          size: resolvedSize(),
                        },
                        visualProps.classes?.icon,
                      ),
                    }}
                  />
                </Show>
              </KobalteCheckbox.Indicator>
            </KobalteCheckbox.Control>
          </div>

          <Show when={visualProps.label || visualProps.description}>
            <div
              data-slot="wrapper"
              class={checkboxWrapperVariants(
                {
                  indicator: visualProps.indicator,
                  size: resolvedSize(),
                },
                visualProps.classes?.wrapper,
              )}
            >
              <Show when={visualProps.label}>
                <label
                  for={inputId()}
                  data-slot="label"
                  class={checkboxLabelVariants(
                    {
                      required: rootStateProps.required,
                      disabled: disabled(),
                    },
                    visualProps.classes?.label,
                  )}
                >
                  {visualProps.label}
                </label>
              </Show>

              <Show when={visualProps.description}>
                <p
                  data-slot="description"
                  class={checkboxDescriptionVariants(
                    {
                      disabled: disabled(),
                    },
                    visualProps.classes?.description,
                  )}
                >
                  {visualProps.description}
                </p>
              </Show>
            </div>
          </Show>
        </>
      )}
    </KobalteCheckbox.Root>
  )
}
