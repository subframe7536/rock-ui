import type { Accessor } from 'solid-js'

type ActivationMode = 'automatic' | 'manual'
type Orientation = 'horizontal' | 'vertical'

export interface UseSelectableCollectionNavigationOptions<TItem, TValue extends string> {
  items: Accessor<TItem[]>
  getValue: (item: TItem) => TValue
  isDisabled?: (item: TItem) => boolean
  loop?: Accessor<boolean>
  activationMode?: Accessor<ActivationMode>
  focusValue?: (value: TValue) => void
  onSelect: (value: TValue) => void
}

export function useSelectableCollectionNavigation<TItem, TValue extends string>(
  options: UseSelectableCollectionNavigationOptions<TItem, TValue>,
) {
  function getEnabledItems(): TItem[] {
    return options.items().filter((item) => !options.isDisabled?.(item))
  }

  function applySelection(nextValue: TValue): void {
    if (options.activationMode?.() === 'manual') {
      options.focusValue?.(nextValue)
      return
    }

    options.onSelect(nextValue)
    options.focusValue?.(nextValue)
  }

  function moveSelection(currentValue: TValue, offset: number): void {
    const enabledItems = getEnabledItems()
    const currentIndex = enabledItems.findIndex((item) => options.getValue(item) === currentValue)

    if (currentIndex < 0 || enabledItems.length === 0) {
      return
    }

    const nextIndex = currentIndex + offset
    const boundedIndex = options.loop?.()
      ? (nextIndex + enabledItems.length) % enabledItems.length
      : Math.min(enabledItems.length - 1, Math.max(0, nextIndex))
    const nextItem = enabledItems[boundedIndex]

    if (!nextItem) {
      return
    }

    const nextValue = options.getValue(nextItem)

    if (nextValue === currentValue) {
      return
    }

    applySelection(nextValue)
  }

  function moveToBoundary(kind: 'first' | 'last'): void {
    const enabledItems = getEnabledItems()
    const nextItem = kind === 'first' ? enabledItems[0] : enabledItems[enabledItems.length - 1]

    if (!nextItem) {
      return
    }

    applySelection(options.getValue(nextItem))
  }

  function onNavigationKeyDown(
    event: KeyboardEvent,
    currentValue: TValue,
    orientation: Orientation,
  ): void {
    const nextKey = orientation === 'vertical' ? 'ArrowDown' : 'ArrowRight'
    const previousKey = orientation === 'vertical' ? 'ArrowUp' : 'ArrowLeft'
    const normalizedKey = event.key === 'Spacebar' ? ' ' : event.key

    if (normalizedKey === nextKey) {
      event.preventDefault()
      moveSelection(currentValue, 1)
      return
    }

    if (normalizedKey === previousKey) {
      event.preventDefault()
      moveSelection(currentValue, -1)
      return
    }

    if (normalizedKey === 'Home') {
      event.preventDefault()
      moveToBoundary('first')
      return
    }

    if (normalizedKey === 'End') {
      event.preventDefault()
      moveToBoundary('last')
      return
    }

    if (normalizedKey === 'Enter' || normalizedKey === ' ') {
      event.preventDefault()
      options.onSelect(currentValue)
    }
  }

  return {
    moveSelection,
    onNavigationKeyDown,
  }
}
