import * as KobalteNumberField from '@kobalte/core/number-field'
import type { JSX } from 'solid-js'
import { createMemo, mergeProps, onCleanup, onMount, Show, splitProps } from 'solid-js'

import { Button } from '../../elements/button'
import type { IconT } from '../../elements/icon'
import { Icon } from '../../elements/icon'
import type { RockUIProps, SlotClasses, SlotStyles } from '../../shared/types'
import { callHandler, useId } from '../../shared/utils'
import { useFormField } from '../form-field/form-field-context'
import type { FormDisableOption, FormIdentityOptions } from '../form-field/form-options'
import { FORM_ID_NAME_DISABLED_KEYS, FORM_INPUT_INTERACTION_KEYS } from '../form-field/form-options'

import type { InputNumberOrientation, InputNumberVariantProps } from './input-number.class'
import {
  inputNumberBaseVariants,
  inputNumberControlButtonVariants,
  inputNumberControlColumnVariants,
  inputNumberRootVariants,
  resolveInputNumberAlign,
} from './input-number.class'

const INPUT_NUMBER_HOLD_REPEAT_DELAY = 400
const INPUT_NUMBER_HOLD_REPEAT_INTERVAL = 60

export namespace InputNumberT {
  export type Slot = 'root' | 'base' | 'increment' | 'decrement'

  export type Variant = InputNumberVariantProps

  export interface Items {}

  export type Extend = KobalteNumberField.NumberFieldRootProps
  export interface Classes extends SlotClasses<Slot> {}
  export interface Styles extends SlotStyles<Slot> {}

  /**
   * Base props for the InputNumber component.
   */
  export interface Base extends FormIdentityOptions, FormDisableOption {
    /**
     * The orientation of the control buttons.
     * @default 'horizontal'
     */
    orientation?: InputNumberOrientation

    /**
     * Placeholder text for the input.
     */
    placeholder?: string

    /**
     * Whether to show the increment button.
     * @default true
     */
    increment?: boolean

    /**
     * Icon for the increment button.
     * @default orientation === 'vertical' ? 'icon-chevron-up' : 'icon-plus'
     */
    incrementIcon?: IconT.Name

    /**
     * Whether the increment button is disabled.
     */
    incrementDisabled?: boolean

    /**
     * Whether to show the decrement button.
     * @default true
     */
    decrement?: boolean

    /**
     * Icon for the decrement button.
     * @default orientation === 'vertical' ? 'icon-chevron-down' : 'icon-minus'
     */
    decrementIcon?: IconT.Name

    /**
     * Whether the decrement button is disabled.
     */
    decrementDisabled?: boolean

    /**
     * Whether to automatically focus the input on mount.
     * @default false
     */
    autofocus?: boolean

    /**
     * Delay in milliseconds before focusing the input.
     * @default 0
     */
    autofocusDelay?: number

    /**
     * Callback when the input loses focus.
     */
    onBlur?: JSX.FocusEventHandlerUnion<HTMLInputElement, FocusEvent>

    /**
     * Callback when the input gains focus.
     */
    onFocus?: JSX.FocusEventHandlerUnion<HTMLInputElement, FocusEvent>

    /**
     * Callback when the increment button is clicked.
     */
    onIncrementClick?: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent>

    /**
     * Callback when the decrement button is clicked.
     */
    onDecrementClick?: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent>
  }

  /**
   * Props for the InputNumber component.
   */
  export interface Props extends RockUIProps<Base, Variant, Extend, Slot> {}
}

/**
 * Props for the InputNumber component.
 */
export interface InputNumberProps extends InputNumberT.Props {}

/** Numeric input with increment/decrement controls, step, and min/max constraints. */
export function InputNumber(props: InputNumberProps): JSX.Element {
  const merged = mergeProps(
    {
      variant: 'outline' as const,
      orientation: 'horizontal' as const,
      increment: true,
      decrement: true,
      autofocusDelay: 0,
    },
    props,
  )

  const [formProps, controlProps, styleProps, restProps] = splitProps(
    merged as InputNumberProps,
    [...FORM_ID_NAME_DISABLED_KEYS, 'onRawValueChange', ...FORM_INPUT_INTERACTION_KEYS],
    [
      'placeholder',
      'orientation',
      'increment',
      'incrementIcon',
      'incrementDisabled',
      'decrement',
      'decrementIcon',
      'decrementDisabled',
      'onIncrementClick',
      'onDecrementClick',
      'autofocus',
      'autofocusDelay',
    ],
    ['size', 'variant', 'highlight', 'classes', 'styles'],
  )

  const generatedId = useId(() => formProps.id, 'input-number')
  const field = useFormField(
    () => ({
      id: formProps.id,
      name: formProps.name,
      size: styleProps.size,
      highlight: styleProps.highlight,
      disabled: formProps.disabled,
    }),
    () => ({
      defaultId: generatedId(),
      defaultSize: 'md',
      initialValue: restProps.rawValue ?? restProps.defaultValue ?? 0,
    }),
  )

  let inputEl: HTMLInputElement | undefined
  let activeRepeatButton: HTMLButtonElement | undefined
  let holdRepeatTimeoutId: ReturnType<typeof setTimeout> | undefined
  let holdRepeatIntervalId: ReturnType<typeof setInterval> | undefined
  let clearSuppressTrustedClickTimeoutId: ReturnType<typeof setTimeout> | undefined
  let suppressTrustedClick = false
  let repeatedDuringPress = false

  const resolvedIncrement = createMemo(() => Boolean(controlProps.increment))

  const resolvedDecrement = createMemo(() => Boolean(controlProps.decrement))

  const resolvedOrientation = createMemo<InputNumberOrientation>(
    () => controlProps.orientation ?? 'horizontal',
  )

  const incrementIcon = createMemo<IconT.Name>(() => {
    if (controlProps.incrementIcon) {
      return controlProps.incrementIcon
    }

    return resolvedOrientation() === 'vertical' ? 'icon-chevron-up' : 'icon-plus'
  })

  const decrementIcon = createMemo<IconT.Name>(() => {
    if (controlProps.decrementIcon) {
      return controlProps.decrementIcon
    }

    return resolvedOrientation() === 'vertical' ? 'icon-chevron-down' : 'icon-minus'
  })

  const isVertical = createMemo(() => resolvedOrientation() === 'vertical')

  function clearHoldRepeatTimers(): void {
    if (holdRepeatTimeoutId) {
      clearTimeout(holdRepeatTimeoutId)
      holdRepeatTimeoutId = undefined
    }

    if (holdRepeatIntervalId) {
      clearInterval(holdRepeatIntervalId)
      holdRepeatIntervalId = undefined
    }
  }

  function clearSuppressTrustedClickTimeout(): void {
    if (clearSuppressTrustedClickTimeoutId) {
      clearTimeout(clearSuppressTrustedClickTimeoutId)
      clearSuppressTrustedClickTimeoutId = undefined
    }
  }

  function clickActiveRepeatButton(): void {
    if (!activeRepeatButton || activeRepeatButton.disabled || !activeRepeatButton.isConnected) {
      stopHoldRepeat()
      return
    }

    repeatedDuringPress = true
    activeRepeatButton.click()
  }

  function startHoldRepeat(button: HTMLButtonElement): void {
    if (button.disabled) {
      return
    }

    clearSuppressTrustedClickTimeout()
    suppressTrustedClick = false
    stopHoldRepeat()

    activeRepeatButton = button
    repeatedDuringPress = false
    holdRepeatTimeoutId = setTimeout(() => {
      clickActiveRepeatButton()
      holdRepeatIntervalId = setInterval(clickActiveRepeatButton, INPUT_NUMBER_HOLD_REPEAT_INTERVAL)
    }, INPUT_NUMBER_HOLD_REPEAT_DELAY)
  }

  function stopHoldRepeat(): void {
    const shouldSuppressTrustedClick = repeatedDuringPress

    clearHoldRepeatTimers()
    activeRepeatButton = undefined
    repeatedDuringPress = false

    if (!shouldSuppressTrustedClick) {
      return
    }

    suppressTrustedClick = true
    clearSuppressTrustedClickTimeout()
    clearSuppressTrustedClickTimeoutId = setTimeout(() => {
      suppressTrustedClick = false
      clearSuppressTrustedClickTimeoutId = undefined
    }, 0)
  }

  function onControlPointerDown(
    event: PointerEvent,
    handler: JSX.EventHandlerUnion<HTMLButtonElement, PointerEvent> | undefined,
  ): void {
    const { defaultPrevented } = callHandler(event, handler)

    if (defaultPrevented || (event.pointerType === 'mouse' && event.button !== 0)) {
      return
    }

    startHoldRepeat(event.currentTarget as HTMLButtonElement)
  }

  function onControlPointerStop(
    event: PointerEvent,
    handler: JSX.EventHandlerUnion<HTMLButtonElement, PointerEvent> | undefined,
  ): void {
    callHandler(event, handler)
    stopHoldRepeat()
  }

  function onControlClickCapture(
    event: MouseEvent,
    handler: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent> | undefined,
  ): void {
    callHandler(event, handler)

    if (!suppressTrustedClick || !event.isTrusted) {
      return
    }

    suppressTrustedClick = false
    clearSuppressTrustedClickTimeout()
    event.preventDefault()
    event.stopPropagation()
    event.stopImmediatePropagation()
  }

  onCleanup(() => {
    clearHoldRepeatTimers()
    clearSuppressTrustedClickTimeout()
  })

  const isBorderless = createMemo(
    () => styleProps.variant === 'ghost' || styleProps.variant === 'none',
  )

  function resolveControlProps(isIncrement: boolean) {
    const slot = isIncrement ? 'increment' : 'decrement'
    const userOnClick = isIncrement ? controlProps.onIncrementClick : controlProps.onDecrementClick

    return {
      'data-slot': slot,
      styles: { base: styleProps.styles?.[slot] },
      disabled:
        field.disabled() ||
        (isIncrement ? controlProps.incrementDisabled : controlProps.decrementDisabled),
      variant: 'ghost',
      size: `icon-${field.size()}`,
      'aria-label': isIncrement ? 'Increment' : 'Decrement',
      leading: <Icon name={isIncrement ? incrementIcon() : decrementIcon()} />,
      onClick: userOnClick,
      onPointerDown: (event: PointerEvent) => onControlPointerDown(event, undefined),
      onPointerUp: (event: PointerEvent) => onControlPointerStop(event, undefined),
      onPointerLeave: (event: PointerEvent) => onControlPointerStop(event, undefined),
      onPointerCancel: (event: PointerEvent) => onControlPointerStop(event, undefined),
      onClickCapture: (event: MouseEvent) => onControlClickCapture(event, undefined),
      classes: {
        base: inputNumberControlButtonVariants(
          {
            control: slot,
            divided: !isIncrement && isVertical() && resolvedIncrement(),
            orientation: resolvedOrientation(),
          },
          isBorderless() && 'b-transparent',
          styleProps.variant === 'none' && 'hover:bg-transparent',
          isIncrement ? styleProps.classes?.increment : styleProps.classes?.decrement,
        ),
      },
    } as const
  }

  function IncrementControl(): JSX.Element {
    return <KobalteNumberField.IncrementTrigger as={Button} {...resolveControlProps(true)} />
  }

  function DecrementControl(): JSX.Element {
    return <KobalteNumberField.DecrementTrigger as={Button} {...resolveControlProps(false)} />
  }

  function onRawValueChange(value: number): void {
    field.setFormValue(value)
    formProps.onRawValueChange?.(value)
    field.emit('change')
    field.emit('input')
  }

  const onBlur: JSX.FocusEventHandlerUnion<HTMLInputElement, FocusEvent> = (event) => {
    callHandler(event, formProps.onBlur as any)
    field.emit('blur')
  }

  const onFocus: JSX.FocusEventHandlerUnion<HTMLInputElement, FocusEvent> = (event) => {
    callHandler(event, formProps.onFocus as any)
    field.emit('focus')
  }

  onMount(() => {
    if (!controlProps.autofocus) {
      return
    }

    setTimeout(() => {
      inputEl?.focus()
    }, controlProps.autofocusDelay ?? 0)
  })

  return (
    <KobalteNumberField.Root
      id={`${field.id()}-root`}
      name={field.name()}
      disabled={field.disabled()}
      onRawValueChange={onRawValueChange}
      data-slot="root"
      style={merged.styles?.root}
      data-invalid={field.invalid() ? '' : undefined}
      data-highlight={field.highlight() ? '' : undefined}
      data-disabled={field.disabled() ? '' : undefined}
      class={inputNumberRootVariants(
        {
          size: field.size(),
          variant: styleProps.variant,
        },
        styleProps.classes?.root,
      )}
      {...restProps}
    >
      <Show when={!isVertical() && resolvedDecrement()}>
        <DecrementControl />
      </Show>

      <KobalteNumberField.Input
        id={field.id()}
        ref={(e) => (inputEl = e)}
        placeholder={controlProps.placeholder}
        data-slot="base"
        style={merged.styles?.base}
        class={inputNumberBaseVariants(
          {
            size: field.size(),
            align: resolveInputNumberAlign(resolvedOrientation(), resolvedDecrement()),
          },
          styleProps.classes?.base,
        )}
        onBlur={onBlur}
        onFocus={onFocus}
        {...field.ariaAttrs()}
      />

      <KobalteNumberField.HiddenInput />

      <Show when={isVertical() && (resolvedIncrement() || resolvedDecrement())}>
        <div
          data-slot="controls"
          class={inputNumberControlColumnVariants({
            size: field.size(),
            borderless: isBorderless(),
          })}
        >
          <Show when={resolvedIncrement()}>
            <IncrementControl />
          </Show>
          <Show when={resolvedDecrement()}>
            <DecrementControl />
          </Show>
        </div>
      </Show>

      <Show when={!isVertical() && resolvedIncrement()}>
        <IncrementControl />
      </Show>
    </KobalteNumberField.Root>
  )
}
