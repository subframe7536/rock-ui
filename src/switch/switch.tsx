import * as KobalteSwitch from '@kobalte/core/switch'
import type { JSX } from 'solid-js'
import { Show, createMemo, mergeProps, splitProps } from 'solid-js'

import { useFormField } from '../form-field/form-field-context'
import type { IconName } from '../icon'
import { Icon } from '../icon'
import { useId } from '../shared/utils'

import type { SwitchVariantProps } from './switch.class'
import {
  switchBaseVariants,
  switchContainerVariants,
  switchDescriptionVariants,
  switchIconVariants,
  switchLabelVariants,
  switchRootVariants,
  switchThumbVariants,
  switchWrapperVariants,
} from './switch.class'

type SwitchColor = NonNullable<SwitchVariantProps['color']>
type SwitchSize = NonNullable<SwitchVariantProps['size']>

export interface SwitchClasses {
  root?: string
  container?: string
  base?: string
  thumb?: string
  icon?: string
  wrapper?: string
  label?: string
  description?: string
}

export interface SwitchBaseProps extends SwitchVariantProps {
  id?: string
  name?: string
  loading?: boolean
  loadingIcon?: IconName
  checkedIcon?: IconName
  uncheckedIcon?: IconName
  label?: JSX.Element
  description?: JSX.Element
  classes?: SwitchClasses
}

export type SwitchProps = SwitchBaseProps &
  Omit<KobalteSwitch.SwitchRootProps, keyof SwitchBaseProps | 'children' | 'class'>

export function Switch(props: SwitchProps): JSX.Element {
  const merged = mergeProps(
    {
      size: 'md' as const,
      color: 'primary' as const,
      loading: false,
      loadingIcon: 'icon-loading' as IconName,
    },
    props,
  )

  const [formProps, rootStateProps, displayProps, styleProps, rootProps] = splitProps(
    merged as SwitchProps,
    ['id', 'name', 'disabled', 'onChange'],
    ['value', 'checked', 'defaultChecked', 'required', 'readOnly'],
    ['loading', 'loadingIcon', 'checkedIcon', 'uncheckedIcon', 'label', 'description'],
    ['size', 'color', 'classes'],
  )

  const field = useFormField(() => ({
    id: formProps.id,
    name: formProps.name,
    size: styleProps.size,
    color: styleProps.color,
    disabled: formProps.disabled || displayProps.loading,
  }))
  const generatedId = useId(() => formProps.id, 'switch')

  const inputId = createMemo(() => field.id() ?? generatedId())
  const rootId = createMemo(() => `${inputId()}-root`)
  const resolvedColor = createMemo(() => (field.color() ?? styleProps.color) as SwitchColor)
  const resolvedSize = createMemo(() => (field.size() ?? styleProps.size) as SwitchSize)
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
    <KobalteSwitch.Root
      {...rootStateProps}
      id={rootId()}
      name={field.name()}
      disabled={disabled()}
      onChange={onChange}
      data-slot="root"
      class={switchRootVariants(
        {
          disabled: disabled(),
        },
        styleProps.classes?.root,
      )}
      {...rootProps}
    >
      {(state) => {
        const checked = createMemo(() => state.checked())
        const iconName = createMemo<IconName | undefined>(() => {
          if (displayProps.loading) {
            return displayProps.loadingIcon
          }

          if (checked()) {
            return displayProps.checkedIcon
          }

          return displayProps.uncheckedIcon
        })

        return (
          <>
            <div
              data-slot="container"
              class={switchContainerVariants(
                {
                  size: resolvedSize(),
                },
                styleProps.classes?.container,
              )}
            >
              <KobalteSwitch.Input id={inputId()} data-slot="input" {...ariaAttrs()} />

              <KobalteSwitch.Control
                data-slot="base"
                class={switchBaseVariants(
                  {
                    color: resolvedColor(),
                    size: resolvedSize(),
                    disabled: disabled(),
                    invalid: invalid(),
                  },
                  styleProps.classes?.base,
                )}
              >
                <KobalteSwitch.Thumb
                  data-slot="thumb"
                  class={switchThumbVariants(
                    {
                      size: resolvedSize(),
                    },
                    styleProps.classes?.thumb,
                  )}
                >
                  <Show when={iconName()}>
                    {(resolvedIconName) => (
                      <Icon
                        name={resolvedIconName()}
                        classes={{
                          root: switchIconVariants(
                            {
                              color: resolvedColor(),
                              checked: !displayProps.loading && checked(),
                              unchecked: !displayProps.loading && !checked(),
                              loading: displayProps.loading,
                            },
                            styleProps.classes?.icon,
                          ),
                        }}
                      />
                    )}
                  </Show>
                </KobalteSwitch.Thumb>
              </KobalteSwitch.Control>
            </div>

            <Show when={displayProps.label || displayProps.description}>
              <div
                data-slot="wrapper"
                class={switchWrapperVariants(
                  {
                    size: resolvedSize(),
                  },
                  styleProps.classes?.wrapper,
                )}
              >
                <Show when={displayProps.label}>
                  <label
                    for={inputId()}
                    data-slot="label"
                    class={switchLabelVariants(
                      {
                        required: rootStateProps.required,
                        disabled: disabled(),
                      },
                      styleProps.classes?.label,
                    )}
                  >
                    {displayProps.label}
                  </label>
                </Show>

                <Show when={displayProps.description}>
                  <p
                    data-slot="description"
                    class={switchDescriptionVariants(
                      {
                        disabled: disabled(),
                      },
                      styleProps.classes?.description,
                    )}
                  >
                    {displayProps.description}
                  </p>
                </Show>
              </div>
            </Show>
          </>
        )
      }}
    </KobalteSwitch.Root>
  )
}
