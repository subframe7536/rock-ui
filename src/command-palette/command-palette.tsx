import { Combobox } from '@kobalte/core/combobox'
import type {
  ComboboxRootItemComponentProps,
  ComboboxRootSectionComponentProps,
} from '@kobalte/core/combobox'
import type { JSX } from 'solid-js'
import { For, Show, createMemo, createSignal, mergeProps, splitProps } from 'solid-js'

import { Icon } from '../icon'
import { Kbd } from '../kbd'
import { cn } from '../shared/utils'

import type { CommandPaletteSize } from './command-palette.class'
import {
  commandPaletteEmptyVariants,
  commandPaletteGroupLabelVariants,
  commandPaletteInputVariants,
  commandPaletteInputWrapperVariants,
  commandPaletteItemTrailingIconVariants,
  commandPaletteItemVariants,
} from './command-palette.class'

// ─── Public types ─────────────────────────────────────────────────────────────

export interface CommandPaletteItem {
  label?: string
  prefix?: string
  suffix?: string
  description?: string
  /** UnoCSS icon class, e.g. `i-lucide-search` */
  icon?: string
  kbds?: string[]
  /** Force-active (highlighted) state */
  active?: boolean
  /** Show a spinning icon in the leading slot */
  loading?: boolean
  disabled?: boolean
  /** Selecting this item drills into a sub-group */
  children?: CommandPaletteItem[]
  onSelect?: (e: Event) => void
  class?: string
}

export interface CommandPaletteGroup {
  id: string
  label?: string
  items?: CommandPaletteItem[]
}

export interface CommandPaletteProps {
  groups?: CommandPaletteGroup[]
  /** @default 'md' */
  size?: CommandPaletteSize
  /** @default 'Search...' */
  placeholder?: string
  /** Controlled search term */
  searchTerm?: string
  onSearchTermChange?: (term: string) => void
  /** @default true */
  autofocus?: boolean
  /** Show a close button */
  close?: boolean
  onClose?: () => void
  class?: string
}

// ─── Internal normalized types ────────────────────────────────────────────────

interface NormalizedItem {
  _id: string
  label: string
  disabled: boolean
  _raw: CommandPaletteItem
}

interface NormalizedGroup {
  _label: string
  items: NormalizedItem[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

let _idCounter = 0

function _nextId(): string {
  return `cp-${++_idCounter}`
}

function _normalizeItem(item: CommandPaletteItem): NormalizedItem {
  return {
    _id: _nextId(),
    label: [item.prefix, item.label, item.suffix].filter(Boolean).join(' '),
    disabled: Boolean(item.disabled),
    _raw: item,
  }
}

function _normalizeGroup(group: CommandPaletteGroup): NormalizedGroup {
  return {
    _label: group.label ?? '',
    items: (group.items ?? []).map(_normalizeItem),
  }
}

// ─── Component ────────────────────────────────────────────────────────────────
// todo)) refactor to reuse `<Select>`
export function CommandPalette(props: CommandPaletteProps): JSX.Element {
  const merged = mergeProps(
    {
      size: 'md' as CommandPaletteSize,
      placeholder: 'Search...',
      autofocus: true,
      close: false,
    },
    props,
  )

  const [local] = splitProps(merged, [
    'groups',
    'size',
    'placeholder',
    'searchTerm',
    'onSearchTermChange',
    'autofocus',
    'close',
    'onClose',
    'class',
  ])

  // ── History stack for sub-navigation ──────────────────────────────────────
  const [history, setHistory] = createSignal<CommandPaletteGroup[]>([])

  // ── Key to force Combobox remount on navigation ────────────────────────────
  const [_comboKey, _setComboKey] = createSignal(1)

  // ── Search term ───────────────────────────────────────────────────────────
  const [_internalSearch, _setInternalSearch] = createSignal('')
  const currentSearchTerm = createMemo(() => local.searchTerm ?? _internalSearch())

  function _updateSearch(value: string): void {
    if (local.searchTerm === undefined) {
      _setInternalSearch(value)
    }
    local.onSearchTermChange?.(value)
  }

  // ── Current groups: last history entry or root ─────────────────────────────
  const currentGroups = createMemo<CommandPaletteGroup[]>(() => {
    const hist = history()
    return hist.length > 0 ? [hist[hist.length - 1]] : (local.groups ?? [])
  })

  const normalizedGroups = createMemo<NormalizedGroup[]>(() => currentGroups().map(_normalizeGroup))

  const hasItems = createMemo(() => normalizedGroups().some((g) => g.items.length > 0))

  // ── Navigation ────────────────────────────────────────────────────────────
  function navigateBack(): void {
    setHistory((h) => h.slice(0, -1))
    _updateSearch('')
    _setComboKey((k) => k + 1)
  }

  function handleChange(item: NormalizedItem | null): void {
    if (!item) {
      return
    }
    const raw = item._raw

    if ((raw.children?.length ?? 0) > 0) {
      setHistory((h) => [
        ...h,
        { id: `history-${h.length}`, label: raw.label, items: raw.children! },
      ])
      _updateSearch('')
      _setComboKey((k) => k + 1)
      return
    }

    raw.onSelect?.(new Event('select'))
  }

  function handleKeyDown(e: KeyboardEvent): void {
    if (e.key === 'Backspace' && !currentSearchTerm()) {
      navigateBack()
    }
  }

  // ── Item component (closure captures local.size reactively) ───────────────
  function ItemComponent(itemProps: ComboboxRootItemComponentProps<NormalizedItem>): JSX.Element {
    const raw = (): CommandPaletteItem => itemProps.item.rawValue._raw
    const hasChildren = (): boolean => (raw().children?.length ?? 0) > 0

    return (
      <Combobox.Item
        item={itemProps.item}
        data-slot="item"
        class={commandPaletteItemVariants({ size: local.size }, raw().class)}
        onPointerDown={(e: PointerEvent) => e.preventDefault()}
      >
        {/* Leading: loading spinner or icon */}
        <Show when={raw().loading}>
          <Icon
            name="i-lucide-loader-circle"
            data-slot="item-leading-icon"
            size={local.size}
            classes={{
              root: 'animate-spin',
            }}
          />
        </Show>
        <Show when={!raw().loading && raw().icon}>
          <Icon name={raw().icon!} data-slot="item-leading-icon" size={local.size} />
        </Show>

        {/* Content wrapper */}
        <span data-slot="item-wrapper" class="text-start flex flex-1 flex-col min-w-0">
          <Show when={raw().prefix || raw().label || raw().suffix}>
            <span data-slot="item-label" class="inline-flex gap-1 truncate items-baseline">
              <Show when={raw().prefix}>
                <span data-slot="item-prefix" class="text-muted-foreground shrink-0">
                  {raw().prefix}
                </span>
              </Show>
              <span data-slot="item-label-base" class="truncate">
                {raw().label}
              </span>
              <Show when={raw().suffix}>
                <span data-slot="item-suffix" class="text-muted-foreground shrink-0">
                  {raw().suffix}
                </span>
              </Show>
            </span>
          </Show>
          <Show when={raw().description}>
            <span data-slot="item-description" class="text-xs text-muted-foreground truncate">
              {raw().description}
            </span>
          </Show>
        </span>

        {/* Trailing: children indicator or kbds */}
        <span data-slot="item-trailing" class="ms-auto inline-flex shrink-0 gap-1.5 items-center">
          <Show when={hasChildren()}>
            <Icon
              name="i-lucide-chevron-right"
              data-slot="item-trailing-icon"
              classes={{ root: commandPaletteItemTrailingIconVariants({ size: local.size }) }}
            />
          </Show>
          <Show when={!hasChildren() && (raw().kbds?.length ?? 0) > 0}>
            <span data-slot="item-trailing-kbds" class="gap-0.5 hidden items-center lg:inline-flex">
              <For each={raw().kbds}>
                {(kbd) => (
                  <Kbd size="sm" data-slot="item-kbd">
                    {kbd}
                  </Kbd>
                )}
              </For>
            </span>
          </Show>
        </span>
      </Combobox.Item>
    )
  }

  // ── Section component ────────────────────────────────────────────────────
  function SectionComponent(
    sectionProps: ComboboxRootSectionComponentProps<NormalizedGroup>,
  ): JSX.Element {
    return (
      <Combobox.Section data-slot="group" class="p-1">
        <Show when={sectionProps.section.rawValue._label}>
          <span
            data-slot="group-label"
            class={commandPaletteGroupLabelVariants({ size: local.size })}
          >
            {sectionProps.section.rawValue._label}
          </span>
        </Show>
      </Combobox.Section>
    )
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Combobox<NormalizedItem, NormalizedGroup>
      options={normalizedGroups()}
      optionValue="_id"
      optionLabel="label"
      optionTextValue="label"
      optionDisabled="disabled"
      optionGroupChildren="items"
      defaultFilter="contains"
      triggerMode="manual"
      open={true}
      onOpenChange={() => {}}
      value={null}
      onChange={handleChange}
      onInputChange={_updateSearch}
      allowsEmptyCollection={true}
      closeOnSelection={false}
      shouldFocusWrap={true}
      itemComponent={ItemComponent}
      sectionComponent={SectionComponent}
      data-slot="root"
      class={cn('flex flex-col min-h-0 divide-y divide-border', local.class)}
    >
      {/* ── Input area ─────────────────────────────────────────────────── */}
      <Combobox.Control<NormalizedItem>
        data-slot="input-wrapper"
        class={commandPaletteInputWrapperVariants({ size: local.size })}
      >
        <Show when={history().length > 0}>
          <button
            type="button"
            data-slot="back"
            class="text-muted-foreground outline-none shrink-0 cursor-pointer hover:text-foreground"
            onClick={navigateBack}
            aria-label="Go back"
          >
            <Icon name="i-lucide-arrow-left" />
          </button>
        </Show>

        <Icon
          name="i-lucide-search"
          data-slot="search-icon"
          classes={{ root: 'shrink-0 text-muted-foreground' }}
        />

        <Combobox.Input
          data-slot="input"
          class={commandPaletteInputVariants({ size: local.size })}
          placeholder={local.placeholder}
          autofocus={local.autofocus}
          onKeyDown={handleKeyDown}
        />

        <Show when={local.close}>
          <button
            type="button"
            data-slot="close"
            class="text-muted-foreground outline-none shrink-0 cursor-pointer hover:text-foreground"
            onClick={() => local.onClose?.()}
            aria-label="Close"
          >
            <Icon name="i-lucide-x" />
          </button>
        </Show>
      </Combobox.Control>

      {/* ── List ───────────────────────────────────────────────────────── */}
      <Show
        when={hasItems()}
        fallback={
          <div data-slot="empty" class={commandPaletteEmptyVariants({ size: local.size })}>
            No results.
          </div>
        }
      >
        <Combobox.Listbox
          data-slot="listbox"
          class="p-1 overflow-x-hidden overflow-y-auto focus:outline-none"
        />
      </Show>
    </Combobox>
  )
}
