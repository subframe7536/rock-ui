import { createEffect, createMemo, createSignal, on } from 'solid-js'
import type { Accessor } from 'solid-js'

import { useId } from '../../../shared/utils'
import { useFormField } from '../../form-field/form-field-context'
import type { FormFieldSize, UseFormFieldReturn } from '../../form-field/form-field-context'
import type { FormInputEventType } from '../../form/form-context'

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
  handleClear: (clearFn: () => void, onClear?: () => void) => void
}

interface UseSelectFilterProps<TOption extends SelectFilterableOption<TRaw>, TRaw> {
  isSearchable: () => boolean
  filterOption: () => SelectFilterOption<TRaw> | undefined
  allOptions: () => TOption[]
  inputValue: () => string
}

export interface SelectSelectionManager {
  focusedKey: () => string | undefined
  isDisabled: (key: string) => boolean
  select: (key: string) => void
  toggleSelection: (key: string) => void
}

export interface SelectMenuContext {
  close: () => void
  isOpen: () => boolean
  listState: () => {
    selectionManager: () => SelectSelectionManager
  }
  open: () => void
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

  function handleClear(clearFn: () => void, onClear?: () => void): void {
    clearFn()
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
export function useSelectMenuControl(mode: Accessor<'control' | 'trigger'>) {
  const [isDismissing, setIsDismissing] = createSignal(false)

  const opensFromControlClick = createMemo(() => mode() !== 'trigger')

  function markDismissing() {
    setIsDismissing(true)
    queueMicrotask(() => {
      setIsDismissing(false)
    })
  }

  function openMenu(context: Pick<SelectMenuContext, 'isOpen' | 'open'>, fail?: () => void) {
    if (!context.isOpen()) {
      context.open()
    } else {
      fail?.()
    }
  }

  function onTriggerClickFallback(event: MouseEvent, context: SelectMenuContext) {
    if (!(event.currentTarget as HTMLElement).dataset.pointerType) {
      openMenu(context, () => context.close())
    }
  }

  function onContentInteractOutside() {
    markDismissing()
  }

  function onContentCloseAutoFocus(_event: Event) {}

  return {
    isDismissing,
    markDismissing,
    onContentCloseAutoFocus,
    onContentInteractOutside,
    onTriggerClickFallback,
    openMenu,
    opensFromControlClick,
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

const SELECT_FILTER_STRATEGIES: Record<SelectFilterMode, (text: string, input: string) => boolean> = {
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

interface ComboboxInputHandlerDeps {
  isSearchable: () => boolean
  menuControl: ReturnType<typeof useSelectMenuControl>
  field: { emit: (event: FormInputEventType) => void }
  context: SelectMenuContext
  onTabSelection: (focusedKey: string) => void
  onExtraKeyDown?: (e: KeyboardEvent) => void
}

/**
 * Returns the shared input handlers used by both Select and MultiSelect.
 */
export function createComboboxInputHandlers(deps: ComboboxInputHandlerDeps) {
  return {
    onInput: (event: InputEvent): void => {
      if (!deps.isSearchable()) {
        return
      }

      const nextValue = (event.currentTarget as HTMLInputElement).value
      if (nextValue.trim() !== '') {
        deps.menuControl.openMenu(deps.context)
      }
    },
    onClick: (): void => {
      if (deps.menuControl.opensFromControlClick()) {
        deps.menuControl.openMenu(deps.context, () => deps.context.close())
      }
    },
    onKeyDown: (e: KeyboardEvent): void => {
      if (e.key === 'Escape' || (e.key === 'Tab' && deps.context.isOpen())) {
        deps.menuControl.markDismissing()
      }

      if (e.key === 'Tab') {
        if (deps.context.isOpen()) {
          const selectionManager = deps.context.listState().selectionManager()
          const focusedKey = selectionManager.focusedKey()

          if (focusedKey && !selectionManager.isDisabled(focusedKey)) {
            deps.onTabSelection(focusedKey)
          }

          e.preventDefault()
        }
        return
      }

      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault()
      }

      deps.onExtraKeyDown?.(e)
    },
    onFocus: (): void => deps.field.emit('focus'),
    onBlur: (): void => deps.field.emit('blur'),
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
