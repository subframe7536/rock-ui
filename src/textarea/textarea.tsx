import type { JSX, ValidComponent } from 'solid-js'
import { createEffect, createMemo, mergeProps, on, onMount, splitProps } from 'solid-js'
import { Dynamic } from 'solid-js/web'

import { useFieldGroupContext } from '../field-group/field-group-context'
import { useFormField } from '../form-field/form-field-context'
import type { ModelModifiers } from '../shared/input-modifiers'
import { applyInputModifiers } from '../shared/input-modifiers'
import { callHandler, useId } from '../shared/utils'

import type { TextareaVariantProps } from './textarea.class'
import {
  textareaBaseVariants,
  textareaPaddingVariants,
  textareaRootVariants,
} from './textarea.class'

type TextareaStyleVariantProps = Pick<
  TextareaVariantProps,
  'color' | 'size' | 'variant' | 'highlight' | 'autoresize'
>
type TextareaColor = NonNullable<TextareaBaseProps['color']>
type TextareaSize = NonNullable<TextareaBaseProps['size']>
type TextareaVariant = NonNullable<TextareaBaseProps['variant']>

export type TextareaValue = string | number | null | undefined

export interface TextareaClasses {
  root?: string
  base?: string
}

export interface TextareaBaseProps extends TextareaStyleVariantProps {
  as?: ValidComponent
  id?: string
  name?: string
  value?: TextareaValue
  placeholder?: string
  required?: boolean
  readOnly?: boolean
  autofocus?: boolean
  autofocusDelay?: number
  autoresizeDelay?: number
  disabled?: boolean
  rows?: number
  maxrows?: number
  modelModifiers?: ModelModifiers<TextareaValue>
  onValueChange?: (value: TextareaValue) => void
  onInput?: JSX.EventHandlerUnion<HTMLTextAreaElement, InputEvent>
  onChange?: JSX.EventHandlerUnion<HTMLTextAreaElement, Event>
  onBlur?: JSX.FocusEventHandlerUnion<HTMLTextAreaElement, FocusEvent>
  onFocus?: JSX.FocusEventHandlerUnion<HTMLTextAreaElement, FocusEvent>
  classes?: TextareaClasses
  children?: JSX.Element
}

export type TextareaProps = TextareaBaseProps

export function Textarea(props: TextareaProps): JSX.Element {
  const merged = mergeProps(
    {
      as: 'div' as ValidComponent,
      rows: 3,
      maxrows: 0,
      autofocusDelay: 0,
      autoresizeDelay: 0,
      color: 'primary' as const,
      variant: 'outline' as const,
      autoresize: false,
    },
    props,
  )

  const [formProps, layoutProps, styleProps] = splitProps(
    merged as TextareaProps,
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
    [
      'as',
      'placeholder',
      'rows',
      'maxrows',
      'autoresize',
      'autoresizeDelay',
      'autofocus',
      'autofocusDelay',
      'children',
    ],
  )

  const field = useFormField(
    () => ({
      id: formProps.id,
      name: formProps.name,
      size: styleProps.size,
      color: styleProps.color,
      highlight: styleProps.highlight,
      disabled: formProps.disabled,
    }),
    { deferInputValidation: true },
  )
  const fieldGroup = useFieldGroupContext()
  const generatedId = useId(() => formProps.id, 'textarea')

  let textareaEl: HTMLTextAreaElement | undefined

  const textareaId = createMemo(() => field.id() ?? generatedId())
  const resolvedColor = createMemo(() => (field.color() ?? styleProps.color) as TextareaColor)
  const resolvedSize = createMemo(
    () => (styleProps.size ?? fieldGroup?.size ?? field.size() ?? 'md') as TextareaSize,
  )
  const resolvedVariant = createMemo(() => styleProps.variant as TextareaVariant)
  const resolvedHighlight = createMemo(() => field.highlight() ?? styleProps.highlight)
  const disabled = createMemo(() => field.disabled())
  const ariaAttrs = createMemo(() => field.ariaAttrs() ?? {})
  const isLazy = createMemo(() => Boolean(formProps.modelModifiers?.lazy))

  function updateInputValue(value: string | null | undefined): void {
    const nextValue = applyInputModifiers<TextareaValue>(value, formProps.modelModifiers)

    formProps.onValueChange?.(nextValue)
    field.emitFormInput()
  }

  function autoResize(): void {
    if (!layoutProps.autoresize || !textareaEl) {
      return
    }

    const rows = layoutProps.rows ?? 3
    textareaEl.rows = rows

    const previousOverflow = textareaEl.style.overflow
    textareaEl.style.overflow = 'hidden'

    const styles = window.getComputedStyle(textareaEl)
    const paddingTop = Number.parseInt(styles.paddingTop, 10) || 0
    const paddingBottom = Number.parseInt(styles.paddingBottom, 10) || 0
    const padding = paddingTop + paddingBottom

    let lineHeight = Number.parseInt(styles.lineHeight, 10) || 0
    if (lineHeight <= 0) {
      lineHeight = 16
    }

    const nextRows = Math.ceil((textareaEl.scrollHeight - padding) / lineHeight)
    if (nextRows > rows) {
      textareaEl.rows = layoutProps.maxrows ? Math.min(nextRows, layoutProps.maxrows) : nextRows
    }

    textareaEl.style.overflow = previousOverflow
  }

  const onInput: JSX.EventHandlerUnion<HTMLTextAreaElement, InputEvent> = (event) => {
    autoResize()
    callHandler(event, formProps.onInput as JSX.EventHandlerUnion<HTMLTextAreaElement, InputEvent>)

    if (!isLazy()) {
      updateInputValue(event.currentTarget.value)
    }
  }

  const onChange: JSX.EventHandlerUnion<HTMLTextAreaElement, Event> = (event) => {
    const value = event.currentTarget.value

    if (isLazy()) {
      updateInputValue(value)
    }

    if (formProps.modelModifiers?.trim) {
      event.currentTarget.value = value.trim()
    }

    field.emitFormChange()
    callHandler(event, formProps.onChange as JSX.EventHandlerUnion<HTMLTextAreaElement, Event>)
  }

  const onBlur: JSX.FocusEventHandlerUnion<HTMLTextAreaElement, FocusEvent> = (event) => {
    field.emitFormBlur()
    callHandler(event, formProps.onBlur as any)
  }

  const onFocus: JSX.FocusEventHandlerUnion<HTMLTextAreaElement, FocusEvent> = (event) => {
    field.emitFormFocus()
    callHandler(event, formProps.onFocus as any)
  }

  createEffect(
    on(
      () => formProps.value,
      () => {
        // oxlint-disable-next-line solid/reactivity
        queueMicrotask(() => {
          autoResize()
        })
      },
    ),
  )

  onMount(() => {
    setTimeout(() => {
      if (layoutProps.autofocus) {
        textareaEl?.focus()
      }
    }, layoutProps.autofocusDelay ?? 0)

    setTimeout(() => {
      autoResize()
    }, layoutProps.autoresizeDelay ?? 0)
  })

  return (
    <Dynamic
      component={layoutProps.as}
      data-slot="root"
      class={textareaRootVariants(
        {
          color: resolvedColor(),
          size: resolvedSize(),
          variant: resolvedVariant(),
          highlight: resolvedHighlight(),
          disabled: disabled(),
        },
        styleProps.classes?.root,
      )}
      onclick={() => textareaEl?.focus()}
    >
      <textarea
        id={textareaId()}
        ref={(element) => (textareaEl = element)}
        name={field.name()}
        value={formProps.value as string | number | string[] | undefined}
        rows={layoutProps.rows ?? 3}
        placeholder={layoutProps.placeholder}
        required={formProps.required}
        disabled={disabled()}
        readOnly={formProps.readOnly}
        data-slot="base"
        class={textareaBaseVariants(
          {
            size: resolvedSize(),
            autoresize: layoutProps.autoresize,
          },
          textareaPaddingVariants({
            size: resolvedSize(),
          }),
          styleProps.classes?.base,
        )}
        onInput={onInput}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
        {...(ariaAttrs() as Record<string, string | boolean | undefined>)}
      />

      {layoutProps.children}
    </Dynamic>
  )
}
