import type { JSX, ValidComponent } from 'solid-js'
import { Show, createMemo, mergeProps, onMount, splitProps } from 'solid-js'
import { Dynamic } from 'solid-js/web'

import { useFieldGroupContext } from '../field-group/field-group-context'
import { useFormField } from '../form-field/form-field-context'
import type { IconName } from '../icon'
import { Icon } from '../icon'
import type { ModelModifiers } from '../shared/input-modifiers'
import { applyInputModifiers } from '../shared/input-modifiers'
import { callHandler, useId } from '../shared/utils'

import type { InputVariantProps } from './input.class'
import {
  inputBaseVariants,
  inputEndPaddingNoSlotVariants,
  inputEndPaddingWithSlotVariants,
  inputLeadingIconVariants,
  inputLeadingVariants,
  inputRootVariants,
  inputStartPaddingNoSlotVariants,
  inputStartPaddingWithSlotVariants,
  inputTrailingIconVariants,
  inputTrailingVariants,
} from './input.class'

type InputStyleVariantProps = Pick<InputVariantProps, 'color' | 'size' | 'variant' | 'highlight'>
type InputColor = NonNullable<InputBaseProps['color']>
type InputSize = NonNullable<InputBaseProps['size']>
type InputVariant = NonNullable<InputBaseProps['variant']>

export type InputValue = string | number | boolean | null | undefined

export interface InputClasses {
  root?: string
  input?: string
  leading?: string
  leadingIcon?: string
  trailing?: string
  trailingIcon?: string
}

export interface InputBaseProps extends InputStyleVariantProps {
  as?: ValidComponent
  id?: string
  name?: string
  type?: JSX.InputHTMLAttributes<HTMLInputElement>['type']
  value?: InputValue
  placeholder?: string
  required?: boolean
  readOnly?: boolean
  autocomplete?: JSX.InputHTMLAttributes<HTMLInputElement>['autocomplete']
  autofocus?: boolean
  autofocusDelay?: number
  disabled?: boolean
  icon?: IconName
  leading?: boolean | JSX.Element
  leadingIcon?: IconName
  trailing?: boolean | JSX.Element
  trailingIcon?: IconName
  loading?: boolean
  loadingIcon?: IconName
  modelModifiers?: ModelModifiers<InputValue>
  onValueChange?: (value: InputValue) => void
  onInput?: JSX.EventHandlerUnion<HTMLInputElement, InputEvent>
  onChange?: JSX.EventHandlerUnion<HTMLInputElement, Event>
  onBlur?: JSX.FocusEventHandlerUnion<HTMLInputElement, FocusEvent>
  onFocus?: JSX.FocusEventHandlerUnion<HTMLInputElement, FocusEvent>
  classes?: InputClasses
  children?: JSX.Element
}

export type InputProps = InputBaseProps

function isRenderableContent(value: unknown): value is JSX.Element {
  return value !== undefined && value !== null && typeof value !== 'boolean'
}

export function Input(props: InputProps): JSX.Element {
  const merged = mergeProps(
    {
      as: 'div' as ValidComponent,
      type: 'text' as NonNullable<JSX.InputHTMLAttributes<HTMLInputElement>['type']>,
      autocomplete: 'off' as const,
      autofocusDelay: 0,
      color: 'primary' as const,
      variant: 'outline' as const,
      loading: false,
      loadingIcon: 'icon-loading' as IconName,
    },
    props,
  )

  const [formProps, baseProps, adornmentStyleProps] = splitProps(
    merged as InputProps,
    [
      'id',
      'name',
      'value',
      'required',
      'disabled',
      'readOnly',
      'modelModifiers',
      'onValueChange',
      'onInput',
      'onChange',
      'onBlur',
      'onFocus',
    ],
    ['as', 'type', 'placeholder', 'autocomplete', 'autofocus', 'autofocusDelay', 'children'],
  )

  const field = useFormField(
    () => ({
      id: formProps.id,
      name: formProps.name,
      size: adornmentStyleProps.size,
      color: adornmentStyleProps.color,
      highlight: adornmentStyleProps.highlight,
      disabled: formProps.disabled,
    }),
    { deferInputValidation: true },
  )
  const fieldGroup = useFieldGroupContext()
  const generatedId = useId(() => formProps.id, 'input')

  let inputEl: HTMLInputElement | undefined

  const inputId = createMemo(() => field.id() ?? generatedId())
  const resolvedColor = createMemo(() => (field.color() ?? adornmentStyleProps.color) as InputColor)
  const resolvedSize = createMemo(
    () => (adornmentStyleProps.size ?? fieldGroup?.size ?? field.size() ?? 'md') as InputSize,
  )
  const resolvedVariant = createMemo(() => adornmentStyleProps.variant as InputVariant)
  const resolvedHighlight = createMemo(() => field.highlight() ?? adornmentStyleProps.highlight)
  const disabled = createMemo(() => field.disabled())
  const ariaAttrs = createMemo(() => field.ariaAttrs() ?? {})
  const isLazy = createMemo(() => Boolean(formProps.modelModifiers?.lazy))

  const customLeading = createMemo(() =>
    isRenderableContent(adornmentStyleProps.leading)
      ? (adornmentStyleProps.leading as JSX.Element)
      : undefined,
  )
  const customTrailing = createMemo(() =>
    isRenderableContent(adornmentStyleProps.trailing)
      ? (adornmentStyleProps.trailing as JSX.Element)
      : undefined,
  )

  const isLeadingIcon = createMemo(() => {
    const hasIcon = Boolean(adornmentStyleProps.icon)
    const leading = adornmentStyleProps.leading === true
    const trailing = adornmentStyleProps.trailing === true

    return Boolean(
      (hasIcon && leading) ||
      (hasIcon && !trailing) ||
      (adornmentStyleProps.loading && !trailing) ||
      adornmentStyleProps.leadingIcon,
    )
  })
  const isTrailingIcon = createMemo(() => {
    const hasIcon = Boolean(adornmentStyleProps.icon)
    const trailing = adornmentStyleProps.trailing === true

    return Boolean(
      (hasIcon && trailing) ||
      (adornmentStyleProps.loading && trailing) ||
      adornmentStyleProps.trailingIcon,
    )
  })

  const leadingIconName = createMemo<IconName | undefined>(() => {
    if (adornmentStyleProps.loading) {
      return adornmentStyleProps.loadingIcon
    }

    return adornmentStyleProps.leadingIcon ?? adornmentStyleProps.icon
  })
  const trailingIconName = createMemo<IconName | undefined>(() => {
    if (adornmentStyleProps.loading && !isLeadingIcon()) {
      return adornmentStyleProps.loadingIcon
    }

    return adornmentStyleProps.trailingIcon ?? adornmentStyleProps.icon
  })

  const hasLeading = createMemo(() => Boolean(customLeading() || isLeadingIcon()))
  const hasTrailing = createMemo(() => Boolean(customTrailing() || isTrailingIcon()))

  function updateInputValue(value: string | null | undefined): void {
    const nextValue = applyInputModifiers<InputValue>(value, formProps.modelModifiers, {
      number: baseProps.type === 'number',
    })

    formProps.onValueChange?.(nextValue)
    field.emitFormInput()
  }

  const onInput: JSX.EventHandlerUnion<HTMLInputElement, InputEvent> = (event) => {
    callHandler(event, formProps.onInput as JSX.EventHandlerUnion<HTMLInputElement, InputEvent>)

    if (!isLazy()) {
      updateInputValue(event.currentTarget.value)
    }
  }

  const onChange: JSX.EventHandlerUnion<HTMLInputElement, Event> = (event) => {
    const value = event.currentTarget.value

    if (isLazy()) {
      updateInputValue(value)
    }

    if (formProps.modelModifiers?.trim) {
      event.currentTarget.value = value.trim()
    }

    field.emitFormChange()
    callHandler(event, formProps.onChange as JSX.EventHandlerUnion<HTMLInputElement, Event>)
  }

  const onBlur: JSX.FocusEventHandlerUnion<HTMLInputElement, FocusEvent> = (event) => {
    field.emitFormBlur()
    callHandler(event, formProps.onBlur as any)
  }

  const onFocus: JSX.FocusEventHandlerUnion<HTMLInputElement, FocusEvent> = (event) => {
    field.emitFormFocus()
    callHandler(event, formProps.onFocus as any)
  }

  onMount(() => {
    if (!baseProps.autofocus) {
      return
    }

    setTimeout(() => {
      inputEl?.focus()
    }, baseProps.autofocusDelay ?? 0)
  })

  return (
    <Dynamic
      component={baseProps.as}
      data-slot="root"
      class={inputRootVariants(
        {
          color: resolvedColor(),
          size: resolvedSize(),
          variant: resolvedVariant(),
          highlight: resolvedHighlight(),
          disabled: disabled(),
        },
        adornmentStyleProps.classes?.root,
      )}
      onclick={() => inputEl?.focus()}
    >
      <Show when={hasLeading()}>
        <span
          data-slot="leading"
          class={inputLeadingVariants(
            {
              size: resolvedSize(),
            },
            adornmentStyleProps.classes?.leading,
          )}
        >
          <Show
            when={customLeading()}
            fallback={
              <Show when={isLeadingIcon() && leadingIconName()}>
                {(iconName) => (
                  <Icon
                    name={iconName()}
                    data-slot="leadingIcon"
                    classes={{
                      root: inputLeadingIconVariants(
                        {
                          size: resolvedSize(),
                          loading: adornmentStyleProps.loading,
                        },
                        adornmentStyleProps.classes?.leadingIcon,
                      ),
                    }}
                  />
                )}
              </Show>
            }
          >
            {(content) => content()}
          </Show>
        </span>
      </Show>

      <input
        id={inputId()}
        ref={(element) => (inputEl = element)}
        type={baseProps.type}
        value={formProps.value as string | number | string[] | undefined}
        name={field.name()}
        placeholder={baseProps.placeholder}
        required={formProps.required}
        disabled={disabled()}
        readOnly={formProps.readOnly}
        autocomplete={baseProps.autocomplete}
        data-slot="base"
        class={inputBaseVariants(
          {
            type: baseProps.type === 'file' ? 'file' : undefined,
          },
          hasLeading()
            ? inputStartPaddingWithSlotVariants({
                size: resolvedSize(),
              })
            : inputStartPaddingNoSlotVariants({
                size: resolvedSize(),
              }),
          hasTrailing()
            ? inputEndPaddingWithSlotVariants({
                size: resolvedSize(),
              })
            : inputEndPaddingNoSlotVariants({
                size: resolvedSize(),
              }),
          adornmentStyleProps.classes?.input,
        )}
        onInput={onInput}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
        {...ariaAttrs()}
      />

      {baseProps.children}

      <Show when={hasTrailing()}>
        <span
          data-slot="trailing"
          class={inputTrailingVariants(
            {
              size: resolvedSize(),
            },
            adornmentStyleProps.classes?.trailing,
          )}
        >
          <Show
            when={customTrailing()}
            fallback={
              <Show when={isTrailingIcon() && trailingIconName()}>
                {(iconName) => (
                  <Icon
                    name={iconName()}
                    data-slot="trailingIcon"
                    classes={{
                      root: inputTrailingIconVariants(
                        {
                          size: resolvedSize(),
                          loading: adornmentStyleProps.loading,
                        },
                        adornmentStyleProps.classes?.trailingIcon,
                      ),
                    }}
                  />
                )}
              </Show>
            }
          >
            {(content) => content()}
          </Show>
        </span>
      </Show>
    </Dynamic>
  )
}
