export interface ModelModifiers<T = unknown> {
  string?: string extends T ? boolean : never
  number?: number extends T ? boolean : never
  trim?: string extends T ? boolean : never
  lazy?: boolean
  nullable?: null extends T ? boolean : never
  optional?: boolean
}

export interface ApplyInputModifiersOptions {
  number?: boolean
}

export function looseToNumber(value: unknown): unknown {
  const nextValue = Number.parseFloat(String(value))

  if (Number.isNaN(nextValue)) {
    return value
  }

  return nextValue
}

export function applyInputModifiers<T>(
  value: string | null | undefined,
  modelModifiers?: ModelModifiers<T>,
  options?: ApplyInputModifiersOptions,
): T {
  let nextValue: unknown = value

  if (modelModifiers?.trim) {
    nextValue = String(nextValue ?? '').trim()
  }

  if (modelModifiers?.number || options?.number) {
    nextValue = looseToNumber(nextValue)
  }

  if (modelModifiers?.nullable && (nextValue === '' || nextValue === 0 || nextValue === false)) {
    nextValue = null
  }

  if (modelModifiers?.optional && (nextValue === '' || nextValue === 0 || nextValue === false)) {
    nextValue = undefined
  }

  return nextValue as T
}
