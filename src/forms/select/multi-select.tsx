import type { JSX } from 'solid-js'
import { For, Show, createEffect, createMemo, createSignal, mergeProps, splitProps } from 'solid-js'

import { Badge } from '../../elements/badge'
import type { BadgeProps } from '../../elements/badge'
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
  createSelectComponents,
  emitSelectValueChange,
  filterNormalizedOptions,
  flattenOptions,
  mapNormalizedListToRawValues,
  mapNormalizedToRawValue,
  MULTI_SELECT_SPLIT_KEYS,
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

export namespace MultiSelectT {
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
    /** Currently selected values. */
    selectedValues: TItem[]
    /** Whether the maximum selection count has been reached. */
    isAtMaxCount: boolean
    /** Create a new tag (requires `allowCreate`). Returns true if successfully created. */
    create: (value?: string) => boolean
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
    | 'tagsContainer'
    | 'tag'
    | 'tagRemove'
    | 'tagOverflow'
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
    extends FormIdentityOptions, FormValueOptions<TItem[]>, FormRequiredOption, FormDisableOption {
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
    onChange?: (value: NoInfer<TItem[]>) => void
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
      | ((inputValue: string, option: MultiSelectT.Item<TItem>) => boolean)
    /**
     * Controls whether clicking the control opens the menu.
     * @default 'control'
     */
    openOnClick?: 'control' | 'trigger'
    /**
     * Show a clear button when a value is selected.
     * @default false
     */
    allowClear?: boolean
    /** Called when clear is triggered. */
    onClear?: () => void
    /** Variant for the selected tags. */
    tagVariant?: BadgeProps['variant']
    /** Characters that split input into tokens and immediately select them. */
    tokenSeparators?: string[]
    /** Allow creating new tags on Enter when no match is found. */
    allowCreate?: boolean
    /** Maximum number of selected values (multiple/tags). */
    maxCount?: number
    /** Maximum visible tags before showing +N (visual only). */
    maxTagCount?: number
    /** Custom renderer for each option in the dropdown. */
    optionRender?: (option: MultiSelectT.Item<TItem> & OptionRenderState) => JSX.Element
    /** Custom renderer for each selected tag (multiple/tags). */
    tagRender?: (option: MultiSelectT.Item<TItem> & { onClose: () => void }) => JSX.Element
    /** Custom renderer for the option label text. */
    labelRender?: (option: MultiSelectT.Item<TItem>) => JSX.Element
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
  }

  export interface Props<TItem extends Value = Value>
    extends BaseProps<Base<TItem>, Variant, Extend, Slot> {}
}

export interface MultiSelectProps<TItem extends MultiSelectT.Value = MultiSelectT.Value>
  extends MultiSelectT.Props<TItem> {}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** Dropdown select component with search, multi-select, and custom item rendering. */
export function MultiSelect<TItem extends MultiSelectT.Value = MultiSelectT.Value>(
  props: MultiSelectProps<TItem>,
): JSX.Element {
  type NormalizedOption = SharedNormalizedOption<MultiSelectT.Item<TItem>>
  type NormalizedGroup = SharedNormalizedGroup<MultiSelectT.Item<TItem>>

  const merged = mergeProps(SELECT_COMMON_DEFAULT_PROPS, props)
  const [local] = splitProps(merged, MULTI_SELECT_SPLIT_KEYS)
  const listboxId = useId(() => local.id ? `${local.id}-listbox` : undefined, 'multi-select-listbox')

  const field = useSelectField(() => ({
    id: local.id,
    name: local.name,
    size: local.size,
    disabled: local.disabled,
    initialValue: local.defaultValue ?? [],
  }))
  const menuControl = useSelectMenuControl(() => local.openOnClick)
  const isSearchable = () => Boolean(local.search)

  const [createdTags, setCreatedTags] = createSignal<NormalizedOption[]>([])
  const normalizedOptions = createMemo(() => {
    const base = normalizeOptions(local.options as unknown as MultiSelectT.Item<TItem>[])

    if (local.allowCreate || Boolean(local.tokenSeparators?.length)) {
      const existingValues = new Set(flattenOptions(base).map((option) => option.value))
      const newTags = createdTags().filter((tag) => !existingValues.has(tag.value))
      return [...newTags, ...base]
    }

    return base
  })
  const allFlatOptions = createMemo(() => flattenOptions(normalizedOptions()))
  const [selectedValues, setSelectedValues] = useControllableValue<TItem[]>({
    value: () => local.value,
    defaultValue: () => local.defaultValue ?? [],
  })
  const [open, setOpen] = useControllableValue<boolean>({
    value: () => local.open,
    defaultValue: () => local.defaultOpen ?? false,
  })

  let controlRef: HTMLDivElement | undefined
  let inputRef: HTMLInputElement | undefined

  const [currentInputText, setCurrentInputText] = createSignal(local.defaultSearchValue ?? '')
  const [highlightedKey, setHighlightedKey] = createSignal<string | undefined>(undefined)
  syncSelectSearchInputValue(local, () => inputRef, (searchValue) => setCurrentInputText(searchValue))

  const selectedValueSet = createMemo(() => new Set((selectedValues() ?? []).map((value) => String(value))))
  const selectedOptions = createMemo(() =>
    allFlatOptions().filter((option) => selectedValueSet().has(option.value)),
  )

  const effectiveOptions = createMemo(() => {
    const base = normalizedOptions()
    if (local.maxCount === undefined || selectedValueSet().size < local.maxCount) {
      return base
    }

    return base.map((item) => {
      if (item.isGroup) {
        return {
          ...item,
          options: item.options.map((option) => ({
            ...option,
            disabled: selectedValueSet().has(option.value) ? option.disabled : true,
          })),
        }
      }

      return {
        ...item,
        disabled: selectedValueSet().has(item.value) ? item.disabled : true,
      }
    })
  })

  const { kobalteFilter, hasMatches } = useSelectFilter<NormalizedOption, MultiSelectT.Item<TItem>>({
    isSearchable,
    filterOption: () => local.filterOption,
    allOptions: allFlatOptions,
    inputValue: currentInputText,
  })

  const visibleOptions = createMemo(() =>
    filterNormalizedOptions(effectiveOptions(), currentInputText(), kobalteFilter()),
  )
  const visibleFlatOptions = createMemo(() => flattenOptions(visibleOptions()))

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
    local.onOpenChange?.(nextOpen)
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

  function handleMultipleChange(options: NormalizedOption[]): void {
    const nextValue = mapNormalizedListToRawValues(options) as TItem[]
    setSelectedValues(nextValue)
    emitSelectValueChange(field, nextValue, local.onChange)
  }

  function appendOptionIfAllowed(
    current: NormalizedOption[],
    option: NormalizedOption,
  ): {
    next: NormalizedOption[]
    appended: boolean
    blockedByMaxCount: boolean
    blockedByDisabled: boolean
  } {
    if (current.some((item) => item.value === option.value)) {
      return { next: current, appended: false, blockedByMaxCount: false, blockedByDisabled: false }
    }

    if (option.disabled) {
      return { next: current, appended: false, blockedByMaxCount: false, blockedByDisabled: true }
    }

    if (local.maxCount !== undefined && current.length >= local.maxCount) {
      return { next: current, appended: false, blockedByMaxCount: true, blockedByDisabled: false }
    }

    return {
      next: [...current, option],
      appended: true,
      blockedByMaxCount: false,
      blockedByDisabled: false,
    }
  }

  function addTag(text: string): NormalizedOption | undefined {
    const normalized = text.trim()
    if (!normalized) {
      return undefined
    }

    const lower = normalized.toLowerCase()
    const exists = allFlatOptions().find(
      (option) => option.value.toLowerCase() === lower || option.key.toLowerCase() === lower,
    )
    if (exists) {
      return exists
    }

    const option: NormalizedOption = {
      value: normalized,
      label: normalized,
      key: normalized,
      disabled: false,
      raw: { label: normalized, value: normalized as unknown as TItem },
    }

    setCreatedTags((prev) => [...prev, option])
    return option
  }

  function findOptionByText(text: string): NormalizedOption | undefined {
    const lower = text.toLowerCase()
    return allFlatOptions().find(
      (option) => option.key.toLowerCase() === lower || option.value.toLowerCase() === lower,
    )
  }

  function resolveOptionForInput(
    text: string,
    current: NormalizedOption[],
  ): { option?: NormalizedOption; blockedByMaxCount: boolean } {
    const existing = findOptionByText(text)
    if (existing) {
      return { option: existing, blockedByMaxCount: false }
    }

    if (local.maxCount !== undefined && current.length >= local.maxCount) {
      return { blockedByMaxCount: true }
    }

    return { option: addTag(text), blockedByMaxCount: false }
  }

  function createTag(value?: string): boolean {
    if (!local.allowCreate) {
      return false
    }

    const text = String(value ?? currentInputText()).trim()
    if (!text) {
      return false
    }

    const current = selectedOptions()
    const resolved = resolveOptionForInput(text, current)
    if (resolved.blockedByMaxCount || !resolved.option) {
      return false
    }

    const appendResult = appendOptionIfAllowed(current, resolved.option)
    if (!appendResult.appended) {
      return false
    }

    handleMultipleChange(appendResult.next)
    setCurrentInputText('')
    local.onSearch?.('')
    if (inputRef) {
      inputRef.value = ''
    }
    return true
  }

  function toggleOption(option: NormalizedOption): void {
    if (option.disabled) {
      return
    }

    const current = selectedOptions()
    if (current.some((item) => item.value === option.value)) {
      handleMultipleChange(current.filter((item) => item.value !== option.value))
      return
    }

    const appendResult = appendOptionIfAllowed(current, option)
    if (appendResult.appended) {
      handleMultipleChange(appendResult.next)
    }
  }

  function clearSelection(): void {
    const resetValue = (local.defaultValue ?? []) as TItem[]
    setSelectedValues(resetValue)
    local.onChange?.(resetValue)
    setCurrentInputText('')
    closeMenu()
  }

  function handleInputChange(inputValue: string): void {
    if (local.tokenSeparators?.length) {
      const separatorRegex = new RegExp(`[${escapeRegex(local.tokenSeparators.join(''))}]`)
      if (separatorRegex.test(inputValue)) {
        const trailingInput = inputValue.split(separatorRegex).at(-1) ?? ''
        const isTrailingTokenCompleted = separatorRegex.test(inputValue.at(-1) ?? '')
        const remainder = isTrailingTokenCompleted ? '' : trailingInput
        const tokens = (
          isTrailingTokenCompleted
            ? inputValue.split(separatorRegex)
            : inputValue.split(separatorRegex).slice(0, -1)
        ).filter((token) => token.trim())

        let nextSelected = [...selectedOptions()]
        for (const token of tokens) {
          const resolved = resolveOptionForInput(token.trim(), nextSelected)
          if (resolved.blockedByMaxCount || !resolved.option) {
            break
          }

          const appendResult = appendOptionIfAllowed(nextSelected, resolved.option)
          if (appendResult.blockedByMaxCount) {
            break
          }
          if (appendResult.appended) {
            nextSelected = appendResult.next
          }
        }

        if (nextSelected.length !== selectedOptions().length) {
          handleMultipleChange(nextSelected)
        }

        queueMicrotask(() => {
          if (inputRef) {
            inputRef.value = remainder
          }
        })

        if (!menuControl.isDismissing()) {
          setCurrentInputText(remainder)
        }
        local.onSearch?.(remainder)
        return
      }
    }

    if (!menuControl.isDismissing()) {
      setCurrentInputText(inputValue)
    }
    local.onSearch?.(inputValue)
  }

  const selectionManager = {
    focusedKey: highlightedKey,
    isDisabled: (key: string) => Boolean(visibleFlatOptions().find((option) => option.key === key)?.disabled),
    select: (key: string) => {
      const option = visibleFlatOptions().find((item) => item.key === key)
      if (option) {
        toggleOption(option)
      }
    },
    toggleSelection: (key: string) => {
      const option = visibleFlatOptions().find((item) => item.key === key)
      if (option) {
        toggleOption(option)
      }
    },
  }

  const context = {
    close: closeMenu,
    isOpen: () => Boolean(open()),
    listState: () => ({
      selectionManager: () => selectionManager,
    }),
    open: () => setMenuOpen(true),
  }

  const inputHandlers = createComboboxInputHandlers({
    isSearchable,
    menuControl,
    field,
    context,
    onTabSelection: (key) => selectionManager.toggleSelection(key),
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
        const input = event.currentTarget as HTMLInputElement
        const text = input.value.trim()
        if (text) {
          const match = findOptionByText(text)
          if (match) {
            const current = selectedOptions()
            const isSelected = current.some((option) => option.value === match.value)

            if (isSelected) {
              handleMultipleChange(current.filter((option) => option.value !== match.value))
              input.value = ''
              setCurrentInputText('')
              handleInputChange('')
              event.preventDefault()
              return
            }

            const appendResult = appendOptionIfAllowed(current, match)
            if (appendResult.appended) {
              handleMultipleChange(appendResult.next)
              input.value = ''
              setCurrentInputText('')
              handleInputChange('')
            }
            event.preventDefault()
            return
          }

          if (local.allowCreate) {
            createTag(text)
            event.preventDefault()
            return
          }
        }

        const focused = highlightedKey()
        if (focused) {
          const option = visibleFlatOptions().find((item) => item.key === focused)
          if (option && !option.disabled) {
            toggleOption(option)
            event.preventDefault()
          }
        }
        return
      }

      if (event.key === 'Escape' && open()) {
        event.preventDefault()
        closeMenu()
      }
    },
  })

  const { ItemComponent, SectionComponent } = createSelectComponents<
    MultiSelectT.Item<TItem>,
    MultiSelectT.OptionRenderState
  >({
    styles: () => merged.styles,
    size: field.size,
    classes: () => local.classes,
    optionRender: () => local.optionRender,
    labelRender: () => local.labelRender,
  })

  const visibleTags = createMemo(() => {
    if (local.maxTagCount === undefined) {
      return selectedOptions()
    }
    return selectedOptions().slice(0, local.maxTagCount)
  })
  const overflowCount = createMemo(() =>
    local.maxTagCount === undefined ? 0 : Math.max(0, selectedOptions().length - local.maxTagCount),
  )
  const isAtMaxCount = createMemo(() =>
    local.maxCount === undefined ? false : selectedValueSet().size >= local.maxCount,
  )

  return (
    <div
      style={merged.styles?.root}
      class={cn('inline-flex h-fit w-full relative', local.classes?.root)}
    >
      <div
        ref={controlRef}
        data-slot="control"
        style={merged.styles?.control}
        data-invalid={field.invalid() ? '' : undefined}
        data-disabled={field.disabled() ? '' : undefined}
        class={cn(
          selectControlVariants(
            {
              size: field.size(),
              variant: local.variant,
            },
            local.classes?.control,
          ),
          menuControl.opensFromControlClick() ? 'cursor-pointer' : 'cursor-default',
        )}
      >
        <Show when={local.leadingIcon}>
          {(icon) => (
            <Icon
              name={icon()}
              size={field.size()}
              slotName="leading"
              style={merged.styles?.leading}
              class={selectLeadingIconVariants({ size: field.size() }, local.classes?.leading)}
            />
          )}
        </Show>

        <div
          data-slot="tagsContainer"
          style={merged.styles?.tagsContainer}
          class={cn(
            'p-1.5 flex flex-1 flex-wrap gap-1 max-w-full select-none items-center',
            menuControl.opensFromControlClick() ? 'cursor-pointer' : 'cursor-default',
            local.classes?.tagsContainer,
          )}
          onPointerDown={(event) => {
            event.preventDefault()
            inputRef?.focus()
            if (menuControl.opensFromControlClick()) {
              menuControl.openMenu(context, () => context.close())
            }
          }}
        >
          <For each={visibleTags()}>
            {(option) => {
              const onClose = () => toggleOption(option)
              return (
                <Show
                  when={!local.tagRender}
                  fallback={local.tagRender?.({ ...option.raw, onClose })}
                >
                  <Badge
                    slotName="tag"
                    size={field.size()}
                    title={option.key}
                    variant={local.tagVariant}
                    styles={{ root: merged.styles?.tag }}
                    classes={{
                      root: ['max-w-50% pe-0', local.classes?.tag],
                      trailing: ['rounded hover:bg-accent scale-85', local.classes?.tagRemove],
                    }}
                    trailing={local.closeIcon ?? 'icon-close'}
                    onTrailingClick={(event) => {
                      event.stopPropagation()
                      onClose()
                    }}
                  >
                    {option.label}
                  </Badge>
                </Show>
              )
            }}
          </For>

          <Show when={overflowCount() > 0}>
            <span
              data-slot="tagOverflow"
              style={merged.styles?.tagOverflow}
              class="text-xs text-muted-foreground px-1 flex items-center"
            >
              +{overflowCount()}
            </span>
          </Show>

          <input
            ref={(el) => {
              inputRef = el
            }}
            id={field.id()}
            role="combobox"
            aria-controls={listboxId()}
            aria-expanded={open() ? 'true' : 'false'}
            aria-haspopup="listbox"
            aria-autocomplete="list"
            aria-activedescendant={highlightedKey() ? `${listboxId()}-${highlightedKey()}` : undefined}
            data-slot="input"
            style={merged.styles?.input}
            data-readonly={!isSearchable()}
            class={selectInputVariants(
              {
                mode: 'multiSearch',
                size: field.size(),
              },
              menuControl.opensFromControlClick()
                ? 'data-readonly:cursor-pointer'
                : 'data-readonly:cursor-default',
              local.classes?.input,
            )}
            readOnly={!isSearchable()}
            maxLength={local.searchMaxLength}
            value={currentInputText()}
            placeholder={selectedOptions().length > 0 ? '' : local.placeholder}
            disabled={field.disabled()}
            required={local.required}
            aria-invalid={field.invalid() ? 'true' : undefined}
            onPointerDown={(event) => {
              event.stopPropagation()
            }}
            onInput={(event) => {
              handleInputChange(event.currentTarget.value)
              inputHandlers.onInput(event)
            }}
            onClick={inputHandlers.onClick}
            onKeyDown={inputHandlers.onKeyDown}
            onFocus={inputHandlers.onFocus}
            onBlur={inputHandlers.onBlur}
            {...field.ariaAttrs()}
          />
        </div>

        <RenderSelectClearButton
          show={Boolean(local.allowClear && selectedOptions().length > 0)}
          size={field.size()}
          style={merged.styles?.clear}
          rootClass={selectClearVariants({ size: field.size() }, local.classes?.clear)}
          onClick={(event) => {
            event.stopPropagation()
            field.handleClear(clearSelection, local.onClear)
          }}
        />

        <RenderSelectTriggerButton
          style={merged.styles?.trigger}
          name={local.triggerIcon}
          size={field.size()}
          rootClass={selectTriggerIconVariants({ size: field.size() }, local.classes?.trigger)}
          loading={local.loading}
          loadingIcon={local.loadingIcon}
          onClick={(event) => menuControl.onTriggerClickFallback(event, context)}
        />
      </div>

      <SelectPopup
        open={Boolean(open())}
        anchorElement={() => controlRef}
        listboxId={listboxId()}
        contentStyle={merged.styles?.content}
        contentClass={local.classes?.content as string | undefined}
        listboxStyle={merged.styles?.listbox}
        listboxClass={local.classes?.listbox as string | undefined}
        onClose={closeMenu}
        onInteractOutside={menuControl.onContentInteractOutside}
        onListboxScrollBottom={local.onScrollBottom}
        scrollBottomThreshold={local.scrollBottomThreshold}
      >
        <Show
          when={hasMatches()}
          fallback={
            <RenderSelectEmptyNode<MultiSelectT.EmptyRenderContext<TItem>>
              emptyRender={local.emptyRender}
              style={merged.styles?.empty}
              class={local.classes?.empty}
              context={() => ({
                inputValue: currentInputText(),
                hasMatches: hasMatches(),
                selectedValues: selectedOptions().map((option) => mapNormalizedToRawValue(option) as TItem),
                isAtMaxCount: isAtMaxCount(),
                create: (value?: string) => createTag(value),
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
                    isSelected={selectedValueSet().has((item as NormalizedOption).value)}
                    isHighlighted={highlightedKey() === (item as NormalizedOption).key}
                    posinset={local.virtualized ? visibleFlatOptions().findIndex((option) => option.key === (item as NormalizedOption).key) + 1 : undefined}
                    setsize={local.virtualized ? visibleFlatOptions().length : undefined}
                    onPointerDown={(event) => event.preventDefault()}
                    onPointerMove={() => {
                      if (!(item as NormalizedOption).disabled) {
                        setHighlightedKey((item as NormalizedOption).key)
                      }
                    }}
                    onClick={() => toggleOption(item as NormalizedOption)}
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
                        isSelected={selectedValueSet().has(option.value)}
                        isHighlighted={highlightedKey() === option.key}
                        posinset={local.virtualized ? visibleFlatOptions().findIndex((entry) => entry.key === option.key) + 1 : undefined}
                        setsize={local.virtualized ? visibleFlatOptions().length : undefined}
                        onPointerDown={(event) => event.preventDefault()}
                        onPointerMove={() => {
                          if (!option.disabled) {
                            setHighlightedKey(option.key)
                          }
                        }}
                        onClick={() => toggleOption(option)}
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
