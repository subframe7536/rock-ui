import * as KobalteCheckbox from '@kobalte/core/checkbox'
import type { JSX } from 'solid-js'
import { Show, mergeProps, splitProps } from 'solid-js'

import { useFormField } from '../form-field/form-field-context'
import type { FormDisableOption, FormIdentityOptions } from '../form-field/form-options'
import { FORM_ID_NAME_DISABLED_ON_CHANGE_KEYS } from '../form-field/form-options'
import type { IconName } from '../icon'
import { Icon } from '../icon'
import type { SlotClasses } from '../shared/slot-class'
import { cn, useId } from '../shared/utils'

import type { CheckboxVariantProps } from './checkbox.class'
import {
  checkboxBaseVariants,
  checkboxCardPaddingVariants,
  checkboxContainerVariants,
  checkboxDescriptionVariants,
  checkboxIconVariants,
  checkboxLabelVariants,
  checkboxRootVariants,
  checkboxWrapperVariants,
} from './checkbox.class'

type CheckboxSlots =
  | 'root'
  | 'container'
  | 'base'
  | 'indicator'
  | 'icon'
  | 'wrapper'
  | 'label'
  | 'description'

export type CheckboxClasses = SlotClasses<CheckboxSlots>

export interface CheckboxBaseProps
  extends CheckboxVariantProps, FormIdentityOptions, FormDisableOption {
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
      variant: 'list' as const,
      indicator: 'start' as const,
      checkedIcon: 'icon-check' as IconName,
      indeterminateIcon: 'icon-minus' as IconName,
      formFieldBind: true,
    },
    props,
  )

  const [formProps, visualProps, rootProps] = splitProps(
    merged as CheckboxProps,
    [...FORM_ID_NAME_DISABLED_ON_CHANGE_KEYS, 'formFieldBind'],
    [
      'label',
      'description',
      'size',
      'variant',
      'indicator',
      'checkedIcon',
      'indeterminateIcon',
      'classes',
    ],
  )

  const generatedId = useId(() => formProps.id, 'checkbox')
  const field = useFormField(
    () => ({
      id: formProps.id,
      name: formProps.name,
      size: visualProps.size,
      disabled: formProps.disabled,
    }),
    () => ({
      bind: formProps.formFieldBind,
      defaultId: generatedId,
      defaultSize: 'md',
    }),
  )

  function onChange(nextChecked: boolean): void {
    formProps.onChange?.(nextChecked)
    field.emitFormChange()
    field.emitFormInput()
  }

  return (
    <KobalteCheckbox.Root
      id={`${field.id()}-root`}
      name={field.name()}
      disabled={field.disabled()}
      onChange={onChange}
      data-slot="root"
      class={checkboxRootVariants(
        {
          variant: visualProps.variant === 'card' ? 'card' : undefined,
          indicator: visualProps.indicator === 'hidden' ? undefined : visualProps.indicator,
          disabled: field.disabled(),
        },
        visualProps.variant === 'card' &&
          checkboxCardPaddingVariants({
            size: field.size(),
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
                size: field.size(),
              },
              visualProps.classes?.container,
            )}
          >
            <KobalteCheckbox.Input id={field.id()} data-slot="input" {...field.ariaAttrs()} />

            <KobalteCheckbox.Control
              data-slot="base"
              class={checkboxBaseVariants(
                {
                  size: field.size(),
                  disabled: field.disabled(),
                  invalid: field.invalid(),
                },
                visualProps.indicator === 'hidden' && 'sr-only',
                visualProps.classes?.base,
              )}
            >
              <KobalteCheckbox.Indicator
                data-slot="indicator"
                class={cn(
                  'flex size-full items-center justify-center bg-primary text-primary-foreground',
                  visualProps.classes?.indicator,
                )}
              >
                <Show
                  when={state.indeterminate()}
                  fallback={
                    <Icon
                      name={visualProps.checkedIcon}
                      class={checkboxIconVariants(
                        {
                          size: field.size(),
                        },
                        visualProps.classes?.icon,
                      )}
                    />
                  }
                >
                  <Icon
                    name={visualProps.indeterminateIcon}
                    class={checkboxIconVariants(
                      {
                        size: field.size(),
                      },
                      visualProps.classes?.icon,
                    )}
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
                  size: field.size(),
                },
                visualProps.classes?.wrapper,
              )}
            >
              <Show when={visualProps.label}>
                <label
                  for={field.id()}
                  data-slot="label"
                  class={checkboxLabelVariants(
                    {
                      required: rootProps.required,
                      disabled: field.disabled(),
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
                      disabled: field.disabled(),
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
