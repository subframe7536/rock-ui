import { createEffect, createMemo, createSignal, on } from 'solid-js'
import type { Accessor } from 'solid-js'

import { useId } from '../../../shared/utils'
import { useFormField } from '../../form-field/form-field-context'
import type { FormFieldSize, UseFormFieldReturn } from '../../form-field/form-field-context'

import type {
  BaseSelectItems,
  NormalizedGroup,
  NormalizedOption,
  SelectFilterMode,
  SelectFilterOption,
  SelectFilterableOption,
} from './types'

interface UseSelectFieldProps {
  id?: string
  name?: string
  size?: FormFieldSize
  disabled?: boolean
  initialValue: unknown
}

interface UseSelectFieldReturn extends UseFormFieldReturn {
  handleClear: (clearFn: VoidFunction | undefined, onClear?: VoidFunction) => void
}

interface UseSelectFilterProps<TOption extends SelectFilterableOption<TRaw>, TRaw> {
  isSearchable: () => boolean
  filterOption: () => SelectFilterOption<TRaw> | undefined
  allOptions: () => TOption[]
  inputValue: () => string
}

/**
 * Shared form-field bridge for select-like controls.
 */
export function useSelectField(props: () => UseSelectFieldProps): UseSelectFieldReturn {
  const generatedId = useId(() => props().id, 'select')

  const field = useFormField(
    () => {
      const current = props()

      return {
        id: current.id,
        name: current.name,
        size: current.size,
        disabled: current.disabled,
      }
    },
    () => ({
      bind: false,
      defaultId: generatedId(),
      defaultSize: 'md',
      initialValue: props().initialValue,
    }),
  )

  function handleClear(clearFn: VoidFunction | undefined, onClear?: VoidFunction): void {
    clearFn?.()
    field.setFormValue(props().initialValue)
    onClear?.()
    field.emit('change')
    field.emit('input')
  }

  return {
    ...field,
    handleClear,
  }
}

/**
 * Shared open/close control logic for select-like dropdown menus.
 */
export function useSelectMenuControl(options: {
  close: VoidFunction
  isOpen: Accessor<boolean>
  open: VoidFunction
}) {
  const [isDismissing, setIsDismissing] = createSignal(false)

  function markDismissing() {
    setIsDismissing(true)
    queueMicrotask(() => {
      setIsDismissing(false)
    })
  }

  function openMenu() {
    if (!options.isOpen()) {
      options.open()
    }
  }

  function toggleMenu() {
    if (options.isOpen()) {
      options.close()
      return
    }

    options.open()
  }

  function onContentInteractOutside() {
    markDismissing()
  }

  return {
    isDismissing,
    markDismissing,
    onContentInteractOutside,
    openMenu,
    toggleMenu,
  }
}

export function syncSelectSearchInputValue(
  props: { searchValue?: string },
  getInputRef: () => HTMLInputElement | undefined,
  setCurrentInputText: (value: string) => void,
): void {
  createEffect(
    on(
      () => props.searchValue,
      (searchValue) => {
        const inputRef = getInputRef()
        if (searchValue === undefined || !inputRef) {
          return
        }

        if (inputRef.value !== searchValue) {
          inputRef.value = searchValue
        }
        setCurrentInputText(searchValue)
      },
    ),
  )
}

/**
 * Shared option normalization helpers for select-like components.
 */
function normalizeLeafOption<TItems extends BaseSelectItems<TItems>>(
  option: TItems,
): NormalizedOption<TItems> {
  const value = option.value
  const label = option.label
  const normalizedValue = String(value ?? '')
  const key = option.key ?? (typeof label === 'string' ? label : normalizedValue)

  return {
    value: normalizedValue,
    label: label ?? normalizedValue,
    key,
    disabled: Boolean(option.disabled),
    raw: option,
  }
}

export function normalizeOptions<TItems extends BaseSelectItems<TItems>>(
  options: TItems[] | undefined,
): Array<NormalizedOption<TItems> | NormalizedGroup<TItems>> {
  return (options ?? []).map((option) => {
    if (Array.isArray(option.children) && option.children.length > 0) {
      return {
        label: option.label ?? '',
        options: option.children.map((child) => normalizeLeafOption(child)),
        isGroup: true as const,
      }
    }

    return normalizeLeafOption(option)
  })
}

export function flattenOptions<TItems>(
  items: Array<NormalizedOption<TItems> | NormalizedGroup<TItems>>,
): NormalizedOption<TItems>[] {
  const result: NormalizedOption<TItems>[] = []

  for (const item of items) {
    if (item.isGroup) {
      result.push(...item.options)
    } else {
      result.push(item)
    }
  }

  return result
}

export function createFindOptionByValue<TItems>(
  allFlatOptions: () => NormalizedOption<TItems>[],
): (val: string | number) => NormalizedOption<TItems> | undefined {
  return (val: string | number): NormalizedOption<TItems> | undefined =>
    allFlatOptions().find((option) => option.value === String(val))
}

const SELECT_FILTER_STRATEGIES: Record<SelectFilterMode, (text: string, input: string) => boolean> =
  {
    startsWith: (text, input) => text.startsWith(input),
    endsWith: (text, input) => text.endsWith(input),
    contains: (text, input) => text.includes(input),
  }

function matchesFilter<TOption extends SelectFilterableOption<unknown>>(
  option: TOption,
  inputValue: string,
  filter: SelectFilterMode | ((option: TOption, inputValue: string) => boolean),
): boolean {
  if (typeof filter === 'function') {
    return filter(option, inputValue)
  }

  const input = inputValue.toLowerCase()
  const text = option.key.toLowerCase()

  return (SELECT_FILTER_STRATEGIES[filter] ?? SELECT_FILTER_STRATEGIES.contains)(text, input)
}

export function filterNormalizedOptions<TRaw>(
  items: Array<NormalizedOption<TRaw> | NormalizedGroup<TRaw>>,
  inputValue: string,
  filter: SelectFilterMode | ((option: NormalizedOption<TRaw>, inputValue: string) => boolean),
): Array<NormalizedOption<TRaw> | NormalizedGroup<TRaw>> {
  if (inputValue.trim() === '') {
    return items
  }

  const result: Array<NormalizedOption<TRaw> | NormalizedGroup<TRaw>> = []

  for (const item of items) {
    if (item.isGroup) {
      const options = item.options.filter((option) => matchesFilter(option, inputValue, filter))
      if (options.length > 0) {
        result.push({ ...item, options })
      }
      continue
    }

    if (matchesFilter(item, inputValue, filter)) {
      result.push(item)
    }
  }

  return result
}

/**
 * Shared filtering logic for select-like components.
 */
export function useSelectFilter<TOption extends SelectFilterableOption<TRaw>, TRaw>(
  props: UseSelectFilterProps<TOption, TRaw>,
) {
  const kobalteFilter = createMemo<
    SelectFilterMode | ((option: TOption, inputValue: string) => boolean)
  >(() => {
    const filterOption = props.filterOption()

    if (!props.isSearchable() || filterOption === false) {
      return (): boolean => true
    }

    if (typeof filterOption === 'string') {
      return filterOption
    }

    if (typeof filterOption === 'function') {
      return (option: TOption, inputValue: string): boolean => filterOption(inputValue, option.raw)
    }

    return 'contains'
  })

  const hasMatches = createMemo(() => {
    const inputValue = props.inputValue()
    const filter = kobalteFilter()

    return props.allOptions().some((option) => matchesFilter(option, inputValue, filter))
  })

  return {
    kobalteFilter,
    hasMatches,
  }
}

export function emitSelectValueChange<TValue>(
  field: Pick<UseFormFieldReturn, 'setFormValue' | 'emit'>,
  value: TValue,
  onChange?: (value: TValue) => void,
): void {
  field.setFormValue(value)
  onChange?.(value)
  field.emit('change')
  field.emit('input')
}

export function mapNormalizedToRawValue<TRaw extends { value?: string | number }>(
  option: NormalizedOption<TRaw>,
): string | number {
  return option.raw.value ?? option.value
}

export function mapNormalizedListToRawValues<TRaw extends { value?: string | number }>(
  options: NormalizedOption<TRaw>[],
): Array<string | number> {
  return options.map((option) => mapNormalizedToRawValue(option))
}
