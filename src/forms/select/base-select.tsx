import type { Accessor, JSX } from 'solid-js'
import { For, Show, createEffect, createMemo, createSignal, mergeProps } from 'solid-js'
import { Portal } from 'solid-js/web'

import type { IconT } from '../../elements/icon'
import {
  overlayMenuContentVariants,
  useOverlayMenuDismiss,
  useOverlayMenuFloatingPosition,
} from '../../overlays/base/menu'
import type { BaseProps, SlotClasses, SlotStyles } from '../../shared/types'
import { useControllableValue } from '../../shared/use-controllable-value'
import { useTransitionPresence } from '../../shared/use-transition-presence'
import { cn, useId } from '../../shared/utils'
import type { UseFormFieldReturn } from '../form-field/form-field-context'
import type {
  FormDisableOption,
  FormIdentityOptions,
  FormRequiredOption,
} from '../form-field/form-options'

import type { SelectControlVariantProps } from './select.class'
import { selectItemVariants } from './select.class'
import {
  filterNormalizedOptions,
  flattenOptions,
  normalizeOptions,
  syncSelectSearchInputValue,
  useSelectField,
  useSelectFilter,
  useSelectMenuControl,
} from './shared'
import type { BaseSelectItems, NormalizedGroup, NormalizedOption } from './shared'

export namespace BaseSelectT {
  export type Value = string | number

  export interface OptionRenderState {
    /** Whether the option is currently selected. */
    isSelected: boolean
    /** Whether the option is currently highlighted/focused. */
    isHighlighted: boolean
    /** Whether the option is disabled. */
    isDisabled: boolean
  }

  export interface Item<Val extends Value = Value> extends BaseSelectItems<Item<Val>> {
    /** Label to display for the option, or the option group title. */
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
    children?: Omit<Item<Val>, 'children'>[]
  }

  export interface Api<TItem extends Item> {
    activeDescendantId: Accessor<string | undefined>
    allFlatOptions: Accessor<NormalizedOption<TItem>[]>
    close: () => void
    controlComboboxProps: Accessor<JSX.HTMLAttributes<HTMLDivElement>>
    controlClick: () => void
    controlPointerDown: (event: PointerEvent) => void
    field: UseFormFieldReturn
    focusBoundaryItem: (kind: 'first' | 'last') => void
    focusItemByOffset: (delta: number) => void
    focusCombobox: () => void
    highlightedKey: Accessor<string | undefined>
    inputHandlers: {
      onBlur: () => void
      onFocus: () => void
      onInput: (event: InputEvent) => void
      onKeyDown: (event: KeyboardEvent) => void
    }
    inputRef: Accessor<HTMLInputElement | undefined>
    inputValue: Accessor<string>
    isOpen: Accessor<boolean>
    isSearchable: Accessor<boolean>
    listboxId: Accessor<string>
    open: () => void
    registerCombobox: (element: HTMLElement | undefined) => void
    registerControl: (element: HTMLDivElement | undefined) => void
    registerInput: (element: HTMLInputElement | undefined) => void
    selectOption: (option: NormalizedOption<TItem>) => void
    selectedOptions: Accessor<NormalizedOption<TItem>[]>
    setHighlightedKey: (key: string | undefined) => void
    setInputValue: (value: string) => void
    toggle: () => void
    visibleFlatOptions: Accessor<NormalizedOption<TItem>[]>
    visibleOptions: Accessor<Array<NormalizedOption<TItem> | NormalizedGroup<TItem>>>
  }

  export type Slot = 'root' | 'content' | 'listbox' | 'item' | 'group' | 'label'

  export type Variant = SelectControlVariantProps
  export type Classes = SlotClasses<Slot>
  export type Styles = SlotStyles<Slot>
  export type Extend = never

  export interface Base<TItem extends Item>
    extends FormIdentityOptions, FormRequiredOption, FormDisableOption {
    /** Available options. */
    options?: TItem[]
    /** Controlled open state. */
    open?: boolean
    /** Initial open state. */
    defaultOpen?: boolean
    /** Called whenever the popup open state changes. */
    onOpenChange?: (open: boolean) => void
    /** Enables virtualized-like aria metadata on options. */
    virtualized?: boolean
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
      | ((inputValue: string, option: TItem) => boolean)
    /** Current selected values used only to derive selected option state. */
    selectedValues?: Value[]
    /** Form value used when the field initializes. */
    initialValue?: unknown
    /** Render the trigger/control surface. */
    children: (api: Api<TItem>) => JSX.Element
    /** Renderer for each option in the dropdown. Receives `null` when no option matches. */
    optionRender: (option: (TItem & OptionRenderState) | null) => JSX.Element
    /** Custom rendered empty state. */
    emptyRender?: (api: Api<TItem>) => JSX.Element | undefined
    /** Called when an option is selected by pointer or keyboard. */
    onOptionSelect: (option: NormalizedOption<TItem>, api: Api<TItem>) => void
    /** Allows wrappers to handle keys before BaseSelect default list navigation. */
    onInputKeyDown?: (event: KeyboardEvent, api: Api<TItem>) => void
    /** Called when the user scrolls near the bottom of the listbox. Use for infinite loading. */
    onScrollBottom?: () => void
    /** Distance (px) from the bottom at which onScrollBottom fires. Default: 20. */
    scrollBottomThreshold?: number
    /** Padding (px) used when calculating popup overflow and viewport collision. Default: 4. */
    overflowPadding?: number
    /** Gap (px) between the control and popup content. Default: 0. */
    gutter?: number
    /** Whether the select closes after selection. */
    closeOnSelect?: boolean
  }

  export interface Props<TItem extends Item> extends BaseProps<
    Base<TItem>,
    Variant,
    Extend,
    Slot
  > {}
}

export interface BaseSelectProps<TItem extends BaseSelectT.Item> extends BaseSelectT.Props<TItem> {}

/** Shared select foundation used by Select and MultiSelect wrappers. */
export function BaseSelect<TItem extends BaseSelectT.Item>(
  props: BaseSelectProps<TItem>,
): JSX.Element {
  const merged = mergeProps(
    {
      variant: 'outline',
      filterOption: true,
      overflowPadding: 4,
      closeOnSelect: true,
    },
    props,
  )
  const listboxId = useId(() => merged.id && `${merged.id}-listbox`, 'base-select-listbox')

  const field = useSelectField(() => ({
    id: merged.id,
    name: merged.name,
    size: merged.size,
    disabled: merged.disabled,
    initialValue: merged.initialValue,
  }))
  const isSearchable = createMemo(() => Boolean(merged.search))

  const normalizedOptions = createMemo<Array<NormalizedOption<TItem> | NormalizedGroup<TItem>>>(
    () =>
      normalizeOptions(merged.options as never) as Array<
        NormalizedOption<TItem> | NormalizedGroup<TItem>
      >,
  )
  const allFlatOptions = createMemo<NormalizedOption<TItem>[]>(() =>
    flattenOptions(normalizedOptions()),
  )
  const selectedValueSet = createMemo(
    () => new Set((merged.selectedValues ?? []).map((value) => String(value))),
  )
  const selectedOptions = createMemo(() =>
    allFlatOptions().filter((option) => selectedValueSet().has(option.value)),
  )

  const [openState, setOpenState] = useControllableValue<boolean>({
    value: () => merged.open,
    defaultValue: () => merged.defaultOpen ?? false,
  })
  const isOpen = createMemo(() => Boolean(openState()))

  let controlRef: HTMLDivElement | undefined
  let comboboxRef: HTMLElement | undefined
  let inputRef: HTMLInputElement | undefined
  let hasReachedScrollBottom = false

  const [currentInputText, setCurrentInputText] = createSignal(merged.defaultSearchValue ?? '')
  const [highlightedKey, setHighlightedKey] = createSignal<string | undefined>()
  const [positionerElement, setPositionerElement] = createSignal<HTMLDivElement | undefined>()
  const [contentElement, setContentElement] = createSignal<HTMLDivElement | undefined>()
  const contentPresence = useTransitionPresence({
    open: isOpen,
    mode: () => 'both',
  })

  syncSelectSearchInputValue(
    merged,
    () => inputRef,
    (searchValue) => setCurrentInputText(searchValue),
  )

  const { kobalteFilter, hasMatches } = useSelectFilter<NormalizedOption<TItem>, TItem>({
    isSearchable,
    filterOption: () => merged.filterOption,
    allOptions: allFlatOptions,
    inputValue: currentInputText,
  })

  const visibleOptions = createMemo<Array<NormalizedOption<TItem> | NormalizedGroup<TItem>>>(() =>
    filterNormalizedOptions(normalizedOptions(), currentInputText(), kobalteFilter()),
  )
  const visibleFlatOptions = createMemo<NormalizedOption<TItem>[]>(() =>
    flattenOptions(visibleOptions()),
  )

  function setMenuOpen(nextOpen: boolean): void {
    if (field.disabled()) {
      return
    }
    setOpenState(nextOpen)
    merged.onOpenChange?.(nextOpen)
  }

  function closeMenu(): void {
    if (isSearchable() && visibleFlatOptions().length === 0) {
      setCurrentInputText('')
      if (inputRef) {
        inputRef.value = ''
      }
      merged.onSearch?.('')
    }
    setMenuOpen(false)
  }

  function openMenu(): void {
    setMenuOpen(true)
  }

  const menuControl = useSelectMenuControl({
    close: closeMenu,
    isOpen,
    open: openMenu,
  })

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

  createEffect(() => {
    if (!isOpen()) {
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

  function setInputValue(inputValue: string): void {
    if (!menuControl.isDismissing()) {
      setCurrentInputText(inputValue)
    }
    merged.onSearch?.(inputValue)
  }

  let api: BaseSelectT.Api<TItem>

  function selectOption(option: NormalizedOption<TItem>): void {
    if (option.disabled) {
      return
    }

    merged.onOptionSelect(option, api)
    if (merged.closeOnSelect) {
      closeMenu()
      queueMicrotask(() => comboboxRef?.focus())
    }
  }

  function focusedKey(): string | undefined {
    const highlighted = highlightedKey()
    if (highlighted) {
      return highlighted
    }

    return visibleFlatOptions().find((option) => !option.disabled)?.key
  }

  function focusedOption(): NormalizedOption<TItem> | undefined {
    const key = focusedKey()
    if (!key) {
      return undefined
    }

    return visibleFlatOptions().find((item) => item.key === key)
  }

  const inputHandlers = {
    onInput: (event: InputEvent): void => {
      if (!isSearchable()) {
        return
      }

      const nextValue = (event.currentTarget as HTMLInputElement).value
      if (nextValue.trim() !== '') {
        menuControl.openMenu()
      }
    },
    onKeyDown: (event: KeyboardEvent): void => {
      if (event.key === 'Escape' || (event.key === 'Tab' && isOpen())) {
        menuControl.markDismissing()
      }

      if (event.key === 'Tab') {
        return
      }

      if ((event.key === ' ' || event.key === 'Spacebar') && isOpen()) {
        const option = focusedOption()
        event.preventDefault()
        if (option && !option.disabled) {
          selectOption(option)
        }
        return
      }

      merged.onInputKeyDown?.(event, api)
      if (event.defaultPrevented) {
        return
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault()
        if (!isOpen()) {
          openMenu()
        }
        focusItemByOffset(1)
        return
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault()
        if (!isOpen()) {
          openMenu()
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
        if (!isOpen()) {
          openMenu()
          return
        }

        const key = highlightedKey()
        if (!key) {
          return
        }

        const option = visibleFlatOptions().find((item) => item.key === key)
        if (!option || option.disabled) {
          return
        }

        event.preventDefault()
        selectOption(option)
        return
      }

      if (event.key === 'Escape' && isOpen()) {
        event.preventDefault()
        closeMenu()
      }
    },
    onFocus: (): void => field.emit('focus'),
    onBlur: (): void => field.emit('blur'),
  }

  const activeDescendantId = createMemo(() =>
    highlightedKey() ? `${listboxId()}-${highlightedKey()}` : undefined,
  )
  function registerControl(element: HTMLDivElement | undefined): void {
    controlRef = element
    if (!isSearchable()) {
      comboboxRef = element
    }
  }

  function registerCombobox(element: HTMLElement | undefined): void {
    comboboxRef = element
  }

  function registerInput(element: HTMLInputElement | undefined): void {
    inputRef = element
    if (element) {
      comboboxRef = element
    }
  }

  function controlPointerDown(event: PointerEvent): void {
    event.preventDefault()
    comboboxRef?.focus()
  }

  function controlClick(): void {
    menuControl.toggleMenu()
  }

  function focusCombobox(): void {
    comboboxRef?.focus()
  }

  const controlComboboxProps = createMemo<JSX.HTMLAttributes<HTMLDivElement>>(() => {
    if (isSearchable()) {
      return {}
    }

    return {
      id: field.id(),
      role: 'combobox',
      'aria-controls': listboxId(),
      'aria-expanded': isOpen() ? 'true' : 'false',
      'aria-haspopup': 'listbox',
      'aria-activedescendant': activeDescendantId(),
      'aria-invalid': field.invalid() ? 'true' : undefined,
      tabIndex: field.disabled() ? undefined : 0,
      onKeyDown: inputHandlers.onKeyDown,
      onFocus: inputHandlers.onFocus,
      onBlur: inputHandlers.onBlur,
      ...field.ariaAttrs(),
    }
  })

  useOverlayMenuFloatingPosition({
    contentElement,
    floatingElement: positionerElement,
    getReferenceElement: () => controlRef,
    gutter: () => merged.gutter ?? 0,
    onPositionedChange: () => undefined,
    onPlacementChange: () => undefined,
    open: isOpen,
    overflowPadding: () => merged.overflowPadding,
    placement: () => 'bottom-start',
  })

  createEffect(() => {
    if (!contentPresence.present()) {
      contentPresence.setElement(undefined)
    }
  })

  createEffect(() => {
    const positioner = positionerElement()
    const content = contentElement()
    if (!positioner || !content) {
      return
    }

    queueMicrotask(() => {
      positioner.style.zIndex = getComputedStyle(content).zIndex
    })
  })

  useOverlayMenuDismiss({
    containsTarget: (node) => {
      const positioner = positionerElement()
      return Boolean(controlRef?.contains(node as Node) || positioner?.contains(node as Node))
    },
    onClose: () => {
      menuControl.onContentInteractOutside()
      closeMenu()
    },
    open: isOpen,
  })

  function handleListboxScroll(event: Event): void {
    const target = event.currentTarget as HTMLElement | null
    if (!target) {
      return
    }

    const threshold = merged.scrollBottomThreshold ?? 20
    const isAtBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - threshold
    if (isAtBottom) {
      if (hasReachedScrollBottom) {
        return
      }
      hasReachedScrollBottom = true
      merged.onScrollBottom?.()
      return
    }

    hasReachedScrollBottom = false
  }

  api = {
    activeDescendantId,
    allFlatOptions,
    close: closeMenu,
    controlComboboxProps,
    controlClick,
    controlPointerDown,
    field,
    focusBoundaryItem,
    focusItemByOffset,
    focusCombobox,
    highlightedKey,
    inputHandlers,
    inputRef: () => inputRef,
    inputValue: currentInputText,
    isOpen,
    isSearchable,
    listboxId,
    open: openMenu,
    registerCombobox,
    registerControl,
    registerInput,
    selectOption,
    selectedOptions,
    setHighlightedKey,
    setInputValue,
    toggle: menuControl.toggleMenu,
    visibleFlatOptions,
    visibleOptions,
  }

  function renderOptionItem(
    item: NormalizedOption<TItem>,
    isSelected: boolean,
    isHighlighted: boolean,
    posinset?: number,
    setsize?: number,
  ): JSX.Element {
    const raw = item.raw

    return (
      <div
        id={`${listboxId()}-${item.key}`}
        role="option"
        tabIndex={-1}
        data-slot="item"
        data-disabled={item.disabled ? '' : undefined}
        data-highlighted={isHighlighted ? '' : undefined}
        aria-disabled={item.disabled || undefined}
        aria-selected={isSelected ? 'true' : 'false'}
        aria-posinset={posinset}
        aria-setsize={setsize}
        style={props.styles?.item}
        onClick={() => selectOption(item)}
        onPointerDown={(event) => event.preventDefault()}
        onPointerMove={() => {
          if (!item.disabled) {
            setHighlightedKey(item.key)
          }
        }}
        class={selectItemVariants(
          {
            size: merged.size as 'xs' | 'sm' | 'md' | 'lg' | 'xl' | undefined,
          },
          props.classes?.item,
        )}
      >
        {props.optionRender({
          ...raw,
          isSelected,
          isHighlighted,
          isDisabled: item.disabled,
        })}
      </div>
    )
  }

  function renderEmptyNode(): JSX.Element {
    const emptyRender = props.emptyRender?.(api)
    if (emptyRender) {
      return emptyRender
    }

    return props.optionRender(null)
  }

  return (
    <div
      style={merged.styles?.root}
      class={cn('inline-flex h-fit w-full relative', merged.classes?.root)}
    >
      {props.children(api)}

      <Show when={contentPresence.present()}>
        <Portal>
          <div
            ref={(element) => {
              setPositionerElement(element)
              if (element) {
                element.style.position = 'fixed'
                element.style.visibility = 'hidden'
              }
            }}
            data-slot="positioner"
            class="left-0 top-0 fixed"
          >
            <div
              {...contentPresence.dataAttrs()}
              ref={(element) => {
                setContentElement(element)
                contentPresence.setElement(element)
              }}
              data-slot="content"
              style={merged.styles?.content}
              class={overlayMenuContentVariants(
                { side: 'bottom' },
                'w-$mo-popper-anchor-width min-w-$mo-popper-anchor-width max-w-$mo-popper-content-available-width',
                merged.classes?.content,
              )}
            >
              <div
                id={listboxId()}
                role="listbox"
                data-slot="listbox"
                style={merged.styles?.listbox}
                class={cn(
                  'outline-none max-h-$mo-popper-content-available-height overflow-y-auto',
                  merged.classes?.listbox,
                )}
                onScroll={handleListboxScroll}
              >
                <Show when={hasMatches()} fallback={renderEmptyNode()}>
                  <For each={visibleOptions()}>
                    {(item) => (
                      <Show
                        when={item.isGroup}
                        fallback={renderOptionItem(
                          item as NormalizedOption<TItem>,
                          selectedValueSet().has((item as NormalizedOption<TItem>).value),
                          highlightedKey() === (item as NormalizedOption<TItem>).key,
                          merged.virtualized
                            ? visibleFlatOptions().findIndex(
                                (option) => option.key === (item as NormalizedOption<TItem>).key,
                              ) + 1
                            : undefined,
                          merged.virtualized ? visibleFlatOptions().length : undefined,
                        )}
                      >
                        <div>
                          <div
                            data-slot="group"
                            role="group"
                            style={props.styles?.group}
                            class={cn('[&:not(:first-child)]:mt-1.5', props.classes?.group)}
                          >
                            <span
                              data-slot="label"
                              style={props.styles?.label}
                              class={cn(
                                'text-xs text-muted-foreground font-medium px-2 py-1.5 block',
                                props.classes?.label,
                              )}
                            >
                              {(item as NormalizedGroup<TItem>).label}
                            </span>
                          </div>
                          <For each={(item as NormalizedGroup<TItem>).options}>
                            {(option) =>
                              renderOptionItem(
                                option,
                                selectedValueSet().has(option.value),
                                highlightedKey() === option.key,
                                merged.virtualized
                                  ? visibleFlatOptions().findIndex(
                                      (entry) => entry.key === option.key,
                                    ) + 1
                                  : undefined,
                                merged.virtualized ? visibleFlatOptions().length : undefined,
                              )
                            }
                          </For>
                        </div>
                      </Show>
                    )}
                  </For>
                </Show>
              </div>
            </div>
          </div>
        </Portal>
      </Show>
    </div>
  )
}
