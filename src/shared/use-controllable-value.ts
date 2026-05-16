import type { Accessor } from 'solid-js'
import { createMemo, createSignal, untrack } from 'solid-js'

export interface UseControllableValueOptions<T> {
  value: Accessor<T | undefined>
  defaultValue?: Accessor<T | undefined>
}

export function useControllableValue<T>(options: UseControllableValueOptions<T>) {
  const [uncontrolledValue, setUncontrolledValue] = createSignal<T | undefined>(undefined)

  const value = createMemo<T | undefined>(() => {
    const controlledValue = options.value()

    if (controlledValue !== undefined) {
      return controlledValue
    }

    const localValue = uncontrolledValue()

    if (localValue !== undefined) {
      return localValue
    }

    return untrack(() => options.defaultValue?.())
  })

  function setValue(nextValue: T): void {
    if (options.value() !== undefined) {
      return
    }

    setUncontrolledValue(() => nextValue)
  }

  return [value, setValue] as const
}
