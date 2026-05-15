import type { JSX } from 'solid-js'
import { For, Show, createEffect, createMemo, createSignal, mergeProps } from 'solid-js'

import { Icon } from '../../elements/icon'
import type { IconT } from '../../elements/icon'
import type { BaseProps, SlotClasses, SlotStyles } from '../../shared/types'
import { useControllableValue } from '../../shared/use-controllable-value'
import { cn, useId } from '../../shared/utils'
import type {
  FormDisableOption,
  FormIdentityOptions,
  FormRequiredOption,
  FormValueOptions,
} from '../form-field/form-options'

import type { SelectControlVariantProps } from './select.class'
import {
  selectClearVariants,
  selectControlVariants,
  selectInputVariants,
  selectLeadingIconVariants,
  selectTriggerIconVariants,
} from './select.class'
import {
  createComboboxInputHandlers,
  createFindOptionByValue,
  createSelectComponents,
  filterNormalizedOptions,
  flattenOptions,
  mapNormalizedToRawValue,
  normalizeOptions,
  RenderSelectClearButton,
  RenderSelectEmptyNode,
  RenderSelectTriggerButton,
  SELECT_COMMON_DEFAULT_PROPS,
  SelectPopup,
  syncSelectSearchInputValue,
  useSelectField,
  useSelectFilter,
  useSelectMenuControl,
} from './shared'
import type {
  NormalizedGroup as SharedNormalizedGroup,
  NormalizedOption as SharedNormalizedOption,
} from './shared'

export namespace SelectT {
  export type Value = string | number

  export interface OptionRenderState {
    /** Whether the option is currently selected. */
    isSelected: boolean
    /** Whether the option is currently highlighted/focused. */
    isHighlighted: boolean
    /** Whether the option is disabled. */
    isDisabled: boolean
  }

  export interface EmptyRenderContext<TItem extends Value = Value> {
    /** Current input/search text. */
    inputValue: string
    /** Whether the current filter has any matches. */
    hasMatches: boolean
    /** Currently selected value. */
    selectedValue: TItem | null
    /** Close the dropdown menu. */
    close: () => void
  }

  export type Slot =
    | 'root'
    | 'control'
    | 'input'
    | 'leading'
    | 'trigger'
    | 'clear'
    | 'content'
    | 'listbox'
    | 'item'
    | 'itemTrailing'
    | 'itemLabel'
    | 'itemDescription'
    | 'group'
    | 'label'
    | 'empty'

  export type Variant = SelectControlVariantProps
  export type Classes = SlotClasses<Slot>
  export type Styles = SlotStyles<Slot>
  export type Extend = never

  export interface Item<Val extends Value = Value> {
    /** Label to display for the option. */
    label?: string | JSX.Element
    /** Text key used for filtering and matching; set this when `label` is not a string. */
    key?: string
    /** Value of the option. */
    value?: Val
    /** Whether the option is disabled. */
    disabled?: boolean
    /** Description shown below the label. */
    description?: string | JSX.Element
    /** Icon shown next to the label. */
    icon?: IconT.Name
    /** One-layer child options for grouped select. */
    children?: Item<Val>[]
  }

  export interface Base<TItem extends Value = Value>
    extends
      FormIdentityOptions,
      FormValueOptions<TItem | null>,
      FormRequiredOption,
      FormDisableOption {
    /** Available options. */
    options?: Item<TItem>[]
    /** Controlled open state. */
    open?: boolean
    /** Initial open state. */
    defaultOpen?: boolean
    /** Called whenever the popup open state changes. */
    onOpenChange?: (open: boolean) => void
    /** Enables virtualized-like aria metadata on options. */
    virtualized?: boolean
    /** Called when the selection changes. */
    onChange?: (value: NoInfer<TItem | null>) => void
    /** Enable search input. Defaults to `false`. */
    search?: boolean
    /** Controlled search value. */
    searchValue?: string
    /** Default search value. */
    defaultSearchValue?: string
    /** Called when the search input changes. */
    onSearch?: (value: string) => void
    /** Maximum search text length applied on final commit. */
    searchMaxLength?: number
    /**
     * Filter function or boolean. `false` disables filtering.
     * @default true
     */
    filterOption?:
      | boolean
      | 'startsWith'
      | 'endsWith'
      | 'contains'
      | ((inputValue: string, option: SelectT.Item<TItem>) => boolean)
    /**
     * Controls whether clicking the control opens the menu.
     * @default 'control'
     */
    openOnClick?: 'control' | 'trigger'
    /** Show a clear button when a value is selected.
     * @default false
     */
    allowClear?: boolean
    /** Called when clear is triggered. */
    onClear?: () => void
    /** Custom renderer for each option in the dropdown. */
    optionRender?: (option: SelectT.Item<TItem> & OptionRenderState) => JSX.Element
    /** Custom renderer for the option label text. */
    labelRender?: (option: SelectT.Item<TItem>) => JSX.Element
    /** Custom renderer for the empty state when current filtered result has no matches. */
    emptyRender?: string | ((context: EmptyRenderContext<TItem>) => JSX.Element)
    /**
     * Placeholder text shown when no value is selected.
     * @default ''
     */
    placeholder?: string
    /** Whether the select is in a loading state. */
    loading?: boolean
    /**
     * Icon shown during loading state.
     * @default 'icon-loading'
     */
    loadingIcon?: IconT.Name
    /** Icon shown before the input/value area. */
    leadingIcon?: IconT.Name
    /**
     * Icon for the dropdown trigger.
     * @default 'icon-chevron-down'
     */
    triggerIcon?: IconT.Name
    /** Icon shown on the clear button. */
    closeIcon?: IconT.Name
    /** Called when the user scrolls near the bottom of the listbox. Use for infinite loading. */
    onScrollBottom?: () => void
    /** Distance (px) from the bottom at which onScrollBottom fires. Default: 20. */
    scrollBottomThreshold?: number
    /** Padding (px) used when calculating popup overflow and viewport collision. Default: 4. */
    overflowPadding?: number
  }

  export interface Props<TItem extends Value = Value> extends BaseProps<
    Base<TItem>,
    Variant,
    Extend,
    Slot
  > {}
}

export interface SelectProps<
  TItem extends SelectT.Value = SelectT.Value,
> extends SelectT.Props<TItem> {}

/** Dropdown select component with search and custom item rendering. */
export function Select<TItem extends SelectT.Value = SelectT.Value>(
  props: SelectProps<TItem>,
): JSX.Element {
  type NormalizedOption = SharedNormalizedOption<SelectT.Item<TItem>>
  type NormalizedGroup = SharedNormalizedGroup<SelectT.Item<TItem>>

  const merged = mergeProps(SELECT_COMMON_DEFAULT_PROPS, props)
  const listboxId = useId(() => merged.id && `${merged.id}-listbox`, 'select-listbox')

  const field = useSelectField(() => ({
    id: merged.id,
    name: merged.name,
    size: merged.size,
    disabled: merged.disabled,
    initialValue:
      merged.defaultValue === null || merged.defaultValue === undefined ? '' : merged.defaultValue,
  }))
  const isSearchable = createMemo(() => Boolean(merged.search))

  const normalizedOptions = createMemo(() =>
    normalizeOptions(merged.options as SelectT.Item<TItem>[]),
  )
  const allFlatOptions = createMemo(() => flattenOptions(normalizedOptions()))
  const findOptionByValue = createFindOptionByValue<SelectT.Item<TItem>>(() => allFlatOptions())

  const [selectedValue, setSelectedValue] = useControllableValue<TItem | null>({
    value: () => merged.value,
    defaultValue: () => merged.defaultValue ?? null,
  })
  const [open, setOpen] = useControllableValue<boolean>({
    value: () => merged.open,
    defaultValue: () => merged.defaultOpen ?? false,
  })
  const menuControl = useSelectMenuControl({
    close: closeMenu,
    isOpen: () => Boolean(open()),
    mode: () => merged.openOnClick,
    open: () => setMenuOpen(true),
  })

  let controlRef: HTMLDivElement | undefined
  let comboboxRef: HTMLInputElement | HTMLButtonElement | undefined
  let inputRef: HTMLInputElement | undefined

  const [currentInputText, setCurrentInputText] = createSignal(merged.defaultSearchValue ?? '')
  const [highlightedKey, setHighlightedKey] = createSignal<string | undefined>(undefined)

  syncSelectSearchInputValue(
    merged,
    () => inputRef,
    (searchValue) => setCurrentInputText(searchValue),
  )

  const { kobalteFilter, hasMatches } = useSelectFilter<NormalizedOption, SelectT.Item<TItem>>({
    isSearchable,
    filterOption: () => merged.filterOption,
    allOptions: allFlatOptions,
    inputValue: currentInputText,
  })

  const visibleOptions = createMemo(() =>
    filterNormalizedOptions(normalizedOptions(), currentInputText(), kobalteFilter()),
  )
  const visibleFlatOptions = createMemo(() => flattenOptions(visibleOptions()))

  const selectedOption = createMemo(() => {
    const value = selectedValue()
    if (value === undefined || value === null) {
      return null
    }
    return findOptionByValue(value as SelectT.Value) ?? null
  })

  createEffect(() => {
    if (!open()) {
      setHighlightedKey(undefined)
      return
    }

    const highlighted = highlightedKey()
    if (
      highlighted &&
      visibleFlatOptions().some((option) => option.key === highlighted && !option.disabled)
    ) {
      return
    }

    setHighlightedKey(undefined)
  })

  function setMenuOpen(nextOpen: boolean): void {
    if (field.disabled()) {
      return
    }
    setOpen(nextOpen)
    merged.onOpenChange?.(nextOpen)
  }

  function closeMenu(): void {
    setMenuOpen(false)
  }

  function focusItemByOffset(delta: number): void {
    const options = visibleFlatOptions().filter((option) => !option.disabled)
    if (options.length === 0) {
      return
    }

    const currentIndex = options.findIndex((option) => option.key === highlightedKey())
    const nextIndex =
      currentIndex === -1
        ? delta > 0
          ? 0
          : options.length - 1
        : (currentIndex + delta + options.length) % options.length
    setHighlightedKey(options[nextIndex]?.key)
  }

  function focusBoundaryItem(kind: 'first' | 'last'): void {
    const options = visibleFlatOptions().filter((option) => !option.disabled)
    if (options.length === 0) {
      return
    }
    setHighlightedKey(kind === 'first' ? options[0]?.key : options[options.length - 1]?.key)
  }

  function handleSingleChange(option: NormalizedOption | null): void {
    const nextValue = option ? (mapNormalizedToRawValue(option) as TItem) : null
    setSelectedValue(nextValue)
    field.setFormValue(nextValue ?? '')
    merged.onChange?.(nextValue)
    field.emit('change')
    field.emit('input')
    setCurrentInputText(option?.key ?? '')
  }

  function selectOption(option: NormalizedOption): void {
    if (option.disabled) {
      return
    }
    handleSingleChange(option)
    closeMenu()
    queueMicrotask(() => comboboxRef?.focus())
  }

  function clearSelection(): void {
    const resetValue = (merged.defaultValue ?? null) as TItem | null
    setSelectedValue(resetValue)
    merged.onChange?.(resetValue)
    setCurrentInputText('')
    closeMenu()
  }

  function handleInputChange(inputValue: string): void {
    if (!menuControl.isDismissing()) {
      setCurrentInputText(inputValue)
    }
    merged.onSearch?.(inputValue)
  }

  const selectionManager = {
    focusedKey: highlightedKey,
    isDisabled: (key: string) =>
      Boolean(visibleFlatOptions().find((option) => option.key === key)?.disabled),
    select: (key: string) => {
      const option = visibleFlatOptions().find((item) => item.key === key)
      if (option) {
        selectOption(option)
      }
    },
    toggleSelection: (key: string) => {
      const option = visibleFlatOptions().find((item) => item.key === key)
      if (option) {
        selectOption(option)
      }
    },
  }

  const inputHandlers = createComboboxInputHandlers({
    isSearchable,
    menuControl,
    field,
    isOpen: () => Boolean(open()),
    selectionManager: () => selectionManager,
    onTabSelection: (key) => selectionManager.select(key),
    onExtraKeyDown: (event) => {
      if (event.key === 'ArrowDown') {
        if (!open()) {
          setMenuOpen(true)
        }
        focusItemByOffset(1)
        return
      }

      if (event.key === 'ArrowUp') {
        if (!open()) {
          setMenuOpen(true)
        }
        focusItemByOffset(-1)
        return
      }

      if (event.key === 'Home') {
        event.preventDefault()
        focusBoundaryItem('first')
        return
      }

      if (event.key === 'End') {
        event.preventDefault()
        focusBoundaryItem('last')
        return
      }

      if (event.key === 'Enter') {
        if (!open()) {
          setMenuOpen(true)
          return
        }

        const focused = highlightedKey()
        if (!focused) {
          return
        }

        const option = visibleFlatOptions().find((item) => item.key === focused)
        if (!option || option.disabled) {
          return
        }

        event.preventDefault()
        selectOption(option)
        return
      }

      if (event.key === 'Escape' && open()) {
        event.preventDefault()
        closeMenu()
      }
    },
  })

  const { ItemComponent, SectionComponent } = createSelectComponents<
    SelectT.Item<TItem>,
    SelectT.OptionRenderState
  >({
    styles: () => merged.styles,
    size: field.size,
    classes: () => merged.classes,
    optionRender: () => merged.optionRender,
    labelRender: () => merged.labelRender,
  })

  const displayInputValue = createMemo(() => {
    if (isSearchable()) {
      return currentInputText()
    }

    const selected = selectedOption()
    return typeof selected?.label === 'string' ? selected.label : (selected?.key ?? '')
  })

  function handleControlPointerDown(event: PointerEvent): void {
    if (!menuControl.opensFromControlClick()) {
      return
    }

    event.preventDefault()
    comboboxRef?.focus()
  }

  function handleControlClick(): void {
    if (!menuControl.opensFromControlClick()) {
      return
    }

    menuControl.toggleMenu()
  }

  return (
    <div
      style={merged.styles?.root}
      class={cn('inline-flex h-fit w-full relative', merged.classes?.root)}
    >
      <div
        ref={(el) => {
          controlRef = el
        }}
        data-slot="control"
        style={merged.styles?.control}
        data-invalid={field.invalid() ? '' : undefined}
        data-disabled={field.disabled() ? '' : undefined}
        onPointerDown={handleControlPointerDown}
        onClick={handleControlClick}
        class={selectControlVariants(
          {
            size: field.size(),
            variant: merged.variant,
          },
          menuControl.opensFromControlClick() ? 'cursor-pointer' : 'cursor-default',
          merged.classes?.control,
        )}
      >
        <Show when={merged.leadingIcon}>
          {(icon) => (
            <Icon
              name={icon()}
              size={field.size()}
              slotName="leading"
              style={merged.styles?.leading}
              class={selectLeadingIconVariants({ size: field.size() }, merged.classes?.leading)}
            />
          )}
        </Show>

        <Show
          when={isSearchable()}
          fallback={
            <button
              ref={(el) => {
                comboboxRef = el
              }}
              id={field.id()}
              type="button"
              role="combobox"
              aria-controls={listboxId()}
              aria-expanded={open() ? 'true' : 'false'}
              aria-haspopup="listbox"
              aria-activedescendant={
                highlightedKey() ? `${listboxId()}-${highlightedKey()}` : undefined
              }
              data-slot="input"
              style={merged.styles?.input}
              class={selectInputVariants(
                {
                  mode: 'single',
                  size: field.size(),
                },
                'text-start truncate',
                menuControl.opensFromControlClick() ? 'cursor-pointer' : 'cursor-default',
                merged.classes?.input,
              )}
              disabled={field.disabled()}
              aria-invalid={field.invalid() ? 'true' : undefined}
              onKeyDown={inputHandlers.onKeyDown}
              onFocus={inputHandlers.onFocus}
              onBlur={inputHandlers.onBlur}
              {...field.ariaAttrs()}
            >
              {displayInputValue() || merged.placeholder}
            </button>
          }
        >
          <input
            ref={(el) => {
              comboboxRef = el
              inputRef = el
            }}
            id={field.id()}
            role="combobox"
            aria-controls={listboxId()}
            aria-expanded={open() ? 'true' : 'false'}
            aria-haspopup="listbox"
            aria-autocomplete="list"
            aria-activedescendant={
              highlightedKey() ? `${listboxId()}-${highlightedKey()}` : undefined
            }
            data-slot="input"
            style={merged.styles?.input}
            class={selectInputVariants(
              {
                mode: 'single',
                size: field.size(),
              },
              menuControl.opensFromControlClick() ? 'cursor-pointer' : 'cursor-default',
              merged.classes?.input,
            )}
            maxLength={merged.searchMaxLength}
            placeholder={merged.placeholder}
            value={displayInputValue()}
            disabled={field.disabled()}
            required={merged.required}
            aria-invalid={field.invalid() ? 'true' : undefined}
            onInput={(event) => {
              handleInputChange(event.currentTarget.value)
              inputHandlers.onInput(event)
            }}
            onKeyDown={inputHandlers.onKeyDown}
            onFocus={inputHandlers.onFocus}
            onBlur={inputHandlers.onBlur}
            {...field.ariaAttrs()}
          />
        </Show>

        <RenderSelectClearButton
          show={Boolean(merged.allowClear && selectedOption())}
          size={field.size()}
          style={merged.styles?.clear}
          rootClass={selectClearVariants({ size: field.size() }, merged.classes?.clear)}
          onClick={(event) => {
            event.stopPropagation()
            field.handleClear(clearSelection, merged.onClear)
          }}
        />

        <RenderSelectTriggerButton
          style={merged.styles?.trigger}
          name={merged.triggerIcon}
          size={field.size()}
          rootClass={selectTriggerIconVariants({ size: field.size() }, merged.classes?.trigger)}
          loading={merged.loading}
          loadingIcon={merged.loadingIcon}
          onClick={(event) => menuControl.onTriggerClickFallback(event)}
        />
      </div>

      <SelectPopup
        open={Boolean(open())}
        anchorElement={() => controlRef}
        listboxId={listboxId()}
        contentStyle={merged.styles?.content}
        contentClass={merged.classes?.content as string | undefined}
        listboxStyle={merged.styles?.listbox}
        listboxClass={merged.classes?.listbox as string | undefined}
        onClose={closeMenu}
        onInteractOutside={menuControl.onContentInteractOutside}
        onListboxScrollBottom={merged.onScrollBottom}
        overflowPadding={merged.overflowPadding}
        scrollBottomThreshold={merged.scrollBottomThreshold}
      >
        <Show
          when={hasMatches()}
          fallback={
            <RenderSelectEmptyNode<SelectT.EmptyRenderContext<TItem>>
              emptyRender={merged.emptyRender}
              style={merged.styles?.empty}
              class={merged.classes?.empty}
              context={() => ({
                inputValue: currentInputText(),
                hasMatches: hasMatches(),
                selectedValue: (() => {
                  const selected = selectedOption()
                  return selected ? (mapNormalizedToRawValue(selected) as TItem) : null
                })(),
                close: closeMenu,
              })}
            />
          }
        >
          <For each={visibleOptions()}>
            {(item) => (
              <Show
                when={item.isGroup}
                fallback={
                  <ItemComponent
                    id={`${listboxId()}-${(item as NormalizedOption).key}`}
                    item={item as NormalizedOption}
                    isSelected={selectedOption()?.key === (item as NormalizedOption).key}
                    isHighlighted={highlightedKey() === (item as NormalizedOption).key}
                    posinset={
                      merged.virtualized
                        ? visibleFlatOptions().findIndex(
                            (option) => option.key === (item as NormalizedOption).key,
                          ) + 1
                        : undefined
                    }
                    setsize={merged.virtualized ? visibleFlatOptions().length : undefined}
                    onPointerDown={(event) => event.preventDefault()}
                    onPointerMove={() => {
                      if (!(item as NormalizedOption).disabled) {
                        setHighlightedKey((item as NormalizedOption).key)
                      }
                    }}
                    onClick={() => selectOption(item as NormalizedOption)}
                  />
                }
              >
                <div>
                  <SectionComponent section={item as NormalizedGroup} />
                  <For each={(item as NormalizedGroup).options}>
                    {(option) => (
                      <ItemComponent
                        id={`${listboxId()}-${option.key}`}
                        item={option}
                        isSelected={selectedOption()?.key === option.key}
                        isHighlighted={highlightedKey() === option.key}
                        posinset={
                          merged.virtualized
                            ? visibleFlatOptions().findIndex((entry) => entry.key === option.key) +
                              1
                            : undefined
                        }
                        setsize={merged.virtualized ? visibleFlatOptions().length : undefined}
                        onPointerDown={(event) => event.preventDefault()}
                        onPointerMove={() => {
                          if (!option.disabled) {
                            setHighlightedKey(option.key)
                          }
                        }}
                        onClick={() => selectOption(option)}
                      />
                    )}
                  </For>
                </div>
              </Show>
            )}
          </For>
        </Show>
      </SelectPopup>
    </div>
  )
}
