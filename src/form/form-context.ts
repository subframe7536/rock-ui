import { createContextProvider } from '../shared/create-context-provider'

export type FormInputEventType = 'blur' | 'change' | 'focus' | 'input'

export interface FormInputEvent {
  type: FormInputEventType
  name?: string
  eager?: boolean
}

export interface FormInputMeta {
  id?: string
  pattern?: RegExp
}

export interface FormValidationError {
  name?: string
  message: string
  id?: string
}

export interface FormContextValue {
  disabled: boolean
  loading: boolean
  errors: FormValidationError[]
  state: Record<string, unknown> | undefined
  validateOn: FormInputEventType[]
  validateOnInputDelay: number
  registerInput: (name: string, meta: FormInputMeta) => void
  unregisterInput: (name: string) => void
  getInputMeta: (name: string) => FormInputMeta | undefined
  emitInputEvent: (event: FormInputEvent) => void
  subscribeInputEvents: (listener: (event: FormInputEvent) => void) => () => void
  setErrors: (errors: FormValidationError[]) => void
}

export const [FormProvider, useFormContext] = createContextProvider<FormContextValue | null>(
  'Form',
  null,
)

export function getAtPath<T extends object>(data: T | undefined, path?: string): unknown {
  if (!data || !path) {
    return data
  }

  return path
    .split('.')
    .reduce<unknown>((value, key) => (value as Record<string, unknown> | undefined)?.[key], data)
}

export function setAtPath<T extends object>(data: T, path: string, value: unknown): T {
  if (!path) {
    return Object.assign(data, value)
  }

  const keys = path.split('.')
  let current = data as Record<string, unknown>

  for (let index = 0; index < keys.length - 1; index += 1) {
    const key = keys[index]!
    const nextKey = keys[index + 1]

    if (current[key] === undefined || current[key] === null) {
      current[key] = nextKey && !Number.isNaN(Number(nextKey)) ? [] : {}
    }

    current = current[key] as Record<string, unknown>
  }

  current[keys[keys.length - 1]!] = value
  return data
}
