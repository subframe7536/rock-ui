import type { Accessor, JSX } from 'solid-js'
import { createMemo, createSignal, onCleanup } from 'solid-js'

import { useFormContext } from '../form/form-context'
import { createContextProvider } from '../shared/create-context-provider'

export interface FormFieldInjectedOptions {
  error?: boolean | string | JSX.Element
  name?: string
  size?: string
  eagerValidation?: boolean
  validateOnInputDelay?: number
  errorPattern?: RegExp
  hint?: JSX.Element
  description?: JSX.Element
  help?: JSX.Element
  ariaId: string
}

export interface InputIdContextValue {
  id?: string
  setId: (next: string | null | undefined) => void
}

export interface UseFormFieldProps {
  id?: string
  name?: string
  size?: string
  color?: string
  highlight?: boolean
  disabled?: boolean
}

export interface UseFormFieldOptions {
  bind?: boolean
  deferInputValidation?: boolean
}

export interface UseFormFieldReturn {
  id: Accessor<string | undefined>
  name: Accessor<string | undefined>
  size: Accessor<string | undefined>
  color: Accessor<string | undefined>
  highlight: Accessor<boolean | undefined>
  disabled: Accessor<boolean>
  emitFormBlur: () => void
  emitFormFocus: () => void
  emitFormChange: () => void
  emitFormInput: () => void
  ariaAttrs: Accessor<Record<string, string | boolean | undefined> | undefined>
}

export const [FormFieldProvider, useFormFieldContext] =
  createContextProvider<FormFieldInjectedOptions | null>('FormField', null)
export const [InputIdProvider, useInputIdContext] =
  createContextProvider<InputIdContextValue | null>('InputId', null)

function createInputIdContextFallback(): InputIdContextValue {
  const [id, setId] = createSignal<string | null | undefined>(undefined)

  return {
    get id() {
      return id() ?? undefined
    },
    setId,
  }
}

function resolveOptions(
  opts?: UseFormFieldOptions | Accessor<UseFormFieldOptions>,
): UseFormFieldOptions {
  if (typeof opts === 'function') {
    return opts() ?? {}
  }

  return opts ?? {}
}

export function useFormField(
  props?: Accessor<UseFormFieldProps>,
  opts?: UseFormFieldOptions | Accessor<UseFormFieldOptions>,
): UseFormFieldReturn {
  const formContext = useFormContext()
  const formField = useFormFieldContext()
  const inputId = useInputIdContext() ?? createInputIdContextFallback()

  const options = createMemo(() => {
    const value = resolveOptions(opts)

    return {
      bind: value.bind ?? true,
      deferInputValidation: value.deferInputValidation ?? false,
    }
  })

  const fieldProps = createMemo(() => props?.() ?? {})

  const id = createMemo(() => fieldProps().id ?? inputId.id)
  const name = createMemo(() => fieldProps().name ?? formField?.name)
  const size = createMemo(() => fieldProps().size ?? formField?.size)
  const color = createMemo(() => {
    if (formField?.error) {
      return 'error'
    }

    return fieldProps().color
  })
  const highlight = createMemo(() => {
    if (formField?.error) {
      return true
    }

    return fieldProps().highlight
  })
  const disabled = createMemo(() => Boolean(formContext?.disabled || fieldProps().disabled))

  let inputTimer: ReturnType<typeof setTimeout> | undefined
  onCleanup(() => {
    if (inputTimer) {
      clearTimeout(inputTimer)
      inputTimer = undefined
    }
  })

  if (formField) {
    if (!options().bind) {
      inputId.setId(null)
    } else if (fieldProps().id !== undefined) {
      inputId.setId(fieldProps().id)
    } else {
      inputId.setId(undefined)
    }
  }

  function emitFormEvent(type: 'blur' | 'change' | 'focus' | 'input', eager?: boolean): void {
    if (!formContext) {
      return
    }

    formContext.emitInputEvent({
      type,
      name: name(),
      eager,
    })
  }

  function emitFormBlur(): void {
    emitFormEvent('blur')
  }

  function emitFormFocus(): void {
    emitFormEvent('focus')
  }

  function emitFormChange(): void {
    emitFormEvent('change')
  }

  function emitFormInput(): void {
    const delay = formField?.validateOnInputDelay ?? formContext?.validateOnInputDelay ?? 300
    const eagerValidation = Boolean(!options().deferInputValidation || formField?.eagerValidation)

    if (inputTimer) {
      clearTimeout(inputTimer)
    }

    inputTimer = setTimeout(() => {
      emitFormEvent('input', eagerValidation)
    }, delay)
  }

  const ariaAttrs = createMemo<Record<string, string | boolean | undefined> | undefined>(() => {
    if (!formField) {
      return undefined
    }

    const describedBy: string[] = []

    if (formField.error) {
      describedBy.push(`${formField.ariaId}-error`)
    }
    if (formField.hint) {
      describedBy.push(`${formField.ariaId}-hint`)
    }
    if (formField.description) {
      describedBy.push(`${formField.ariaId}-description`)
    }
    if (formField.help) {
      describedBy.push(`${formField.ariaId}-help`)
    }

    const attrs: Record<string, string | boolean | undefined> = {
      'aria-invalid': Boolean(formField.error) || undefined,
    }

    if (describedBy.length > 0) {
      attrs['aria-describedby'] = describedBy.join(' ')
    }

    return attrs
  })

  return {
    id,
    name,
    size,
    color,
    highlight,
    disabled,
    emitFormBlur,
    emitFormFocus,
    emitFormChange,
    emitFormInput,
    ariaAttrs,
  } satisfies UseFormFieldReturn
}
