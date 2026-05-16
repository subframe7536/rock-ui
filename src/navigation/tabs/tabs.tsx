import type { JSX } from 'solid-js'
import {
  For,
  Show,
  createEffect,
  createMemo,
  createSignal,
  mergeProps,
  onCleanup,
  onMount,
  untrack,
} from 'solid-js'

import { Icon } from '../../elements/icon'
import type { IconT } from '../../elements/icon'
import type { BaseProps, SlotClasses, SlotStyles } from '../../shared/types'
import { useControllableValue } from '../../shared/use-controllable-value'
import { useSelectableCollectionNavigation } from '../../shared/use-selectable-collection-navigation'
import { cn, useId } from '../../shared/utils'

import {
  tabsIndicatorVariants,
  tabsLeadingVariants,
  tabsListVariants,
  tabsRootVariants,
  tabsTriggerVariants,
} from './tabs.class'
import type { TabsVariantProps } from './tabs.class'

export namespace TabsT {
  export type Slot =
    | 'root'
    | 'list'
    | 'indicator'
    | 'trigger'
    | 'leading'
    | 'label'
    | 'trailing'
    | 'content'
  export type Variant = TabsVariantProps
  export type Classes = SlotClasses<Slot>
  export type Styles = SlotStyles<Slot>
  export type Extend = never

  /**
   * An individual tab in the tabs component.
   */
  export interface Item {
    /**
     * Label to display on the tab trigger.
     */
    label?: JSX.Element

    /**
     * Icon to display next to the label.
     */
    icon?: IconT.Name

    /**
     * Unique value for the tab.
     * @default index of the item
     */
    value?: string

    /**
     * Content to display when the tab is active.
     */
    content?: JSX.Element

    /**
     * Whether the tab is disabled.
     * @default false
     */
    disabled?: boolean

    /**
     * Custom class for the tab content panel.
     */
    class?: string
  }

  /**
   * Base props for the Tabs component.
   */
  export interface Base {
    /**
     * Unique identifier for the tabs root element.
     */
    id?: string

    /**
     * Controlled active tab value.
     */
    value?: string

    /**
     * Default active tab value for uncontrolled usage.
     */
    defaultValue?: string

    /**
     * The orientation of the tab list.
     * @default 'horizontal'
     */
    orientation?: 'horizontal' | 'vertical'

    /**
     * Whether keyboard navigation activates the tab immediately or waits for confirmation.
     * @default 'automatic'
     */
    activationMode?: 'automatic' | 'manual'

    /**
     * Whether the tab list is disabled.
     * @default false
     */
    disabled?: boolean

    /**
     * Whether arrow-key navigation wraps from the ends.
     * @default true
     */
    keyboardLoop?: boolean

    /**
     * Callback when the active tab changes.
     */
    onChange?: (value: string) => void

    /**
     * Array of tabs to display.
     */
    items?: Item[]
  }

  /**
   * Props for the Tabs component.
   */
  export interface Props extends BaseProps<Base, Variant, Extend, Slot> {}
}

/**
 * Props for the Tabs component.
 */
export interface TabsProps extends TabsT.Props {}

interface NormalizedTabItem extends TabsT.Item {
  value: string
}

function normalizeItemValue(item: TabsT.Item, index: number): string {
  if (item.value === undefined || item.value === null) {
    return String(index)
  }

  return String(item.value)
}

/**
 * Tabbed navigation component with configurable orientation and variant styles.
 */
export function Tabs(props: TabsProps): JSX.Element {
  const merged = mergeProps(
    {
      orientation: 'horizontal' as const,
      variant: 'pill' as const,
      size: 'md' as const,
    },
    props,
  )

  const rootId = useId(() => merged.id, 'tabs')
  const [requestedValue, setRequestedValue] = useControllableValue<string>({
    value: () => merged.value,
    defaultValue: () => merged.defaultValue,
  })
  const normalizedItems = createMemo<NormalizedTabItem[]>(() =>
    (merged.items ?? []).map((item, index) =>
      Object.assign({}, item, {
        value: normalizeItemValue(item, index),
      }),
    ),
  )
  const firstEnabledValue = createMemo(
    () => normalizedItems().find((item) => !item.disabled)?.value,
  )
  const selectedValue = createMemo(() => {
    const candidate = requestedValue()

    if (candidate && normalizedItems().some((item) => item.value === candidate && !item.disabled)) {
      return candidate
    }

    const result = firstEnabledValue()
    untrack(computeIndicatorStyle)
    return result
  })
  const triggerRefs = new Map<string, HTMLButtonElement>()
  const [indicatorStyle, setIndicatorStyle] = createSignal<JSX.CSSProperties>({
    transform: undefined,
    width: undefined,
    height: undefined,
  })
  let listRef: HTMLDivElement | undefined
  const { onNavigationKeyDown } = useSelectableCollectionNavigation<NormalizedTabItem, string>({
    items: normalizedItems,
    getValue: (item) => item.value,
    isDisabled: (item) => Boolean(merged.disabled || item.disabled),
    loop: () => merged.keyboardLoop ?? true,
    activationMode: () => merged.activationMode ?? 'automatic',
    focusValue: (value) => triggerRefs.get(value)?.focus(),
    onSelect: (value) => selectValue(value),
  })

  function getTriggerId(value: string): string {
    return `${rootId()}-${value}-trigger`
  }

  function getContentId(value: string): string {
    return `${rootId()}-${value}-content`
  }

  function selectValue(nextValue: string): void {
    if (merged.disabled || nextValue === selectedValue()) {
      return
    }

    setRequestedValue(nextValue)

    merged.onChange?.(nextValue)
  }

  function computeIndicatorStyle(): void {
    const currentValue = selectedValue()

    if (!currentValue) {
      setIndicatorStyle({
        transform: undefined,
        width: undefined,
        height: undefined,
      })
      return
    }

    const selectedTrigger = triggerRefs.get(currentValue)

    if (!selectedTrigger) {
      return
    }

    const nextStyle: JSX.CSSProperties = {
      transform: undefined,
      width: undefined,
      height: undefined,
    }

    if (merged.orientation === 'vertical') {
      nextStyle.transform = `translateY(${selectedTrigger.offsetTop}px)`
      nextStyle.height = `${selectedTrigger.offsetHeight}px`
    } else {
      const direction = listRef ? getComputedStyle(listRef).direction : 'ltr'
      const offset =
        direction === 'rtl'
          ? -1 *
            (((selectedTrigger.offsetParent as HTMLElement | null)?.offsetWidth ?? 0) -
              selectedTrigger.offsetWidth -
              selectedTrigger.offsetLeft)
          : selectedTrigger.offsetLeft

      nextStyle.transform = `translateX(${offset}px)`
      nextStyle.width = `${selectedTrigger.offsetWidth}px`
    }

    setIndicatorStyle(nextStyle)
  }

  onMount(() => {
    computeIndicatorStyle()
  })

  createEffect(() => {
    const currentValue = selectedValue()
    const selectedTrigger = currentValue ? triggerRefs.get(currentValue) : undefined

    if (!selectedTrigger) {
      return
    }

    const resizeObserver = new ResizeObserver(() => {
      computeIndicatorStyle()
    })

    resizeObserver.observe(selectedTrigger)

    if (listRef) {
      resizeObserver.observe(listRef)
    }

    onCleanup(() => {
      resizeObserver.disconnect()
    })
  })

  return (
    <div
      id={rootId()}
      data-slot="root"
      data-orientation={merged.orientation}
      style={merged.styles?.root}
      class={tabsRootVariants({ orientation: merged.orientation }, merged.classes?.root)}
    >
      <div
        ref={(e) => (listRef = e)}
        role="tablist"
        aria-orientation={merged.orientation}
        data-slot="list"
        style={merged.styles?.list}
        class={tabsListVariants(
          {
            orientation: merged.orientation,
            variant: merged.variant,
          },
          merged.classes?.list,
        )}
      >
        <div
          aria-hidden="true"
          data-slot="indicator"
          style={{ ...merged.styles?.indicator, ...indicatorStyle() }}
          class={tabsIndicatorVariants(
            {
              orientation: merged.orientation,
              variant: merged.variant,
            },
            merged.classes?.indicator,
          )}
        />

        <For each={normalizedItems()}>
          {(item) => {
            const selected = createMemo(() => selectedValue() === item.value)

            return (
              <button
                id={getTriggerId(item.value)}
                ref={(element) => {
                  triggerRefs.set(item.value, element)
                }}
                type="button"
                role="tab"
                tabIndex={selected() ? 0 : -1}
                aria-controls={getContentId(item.value)}
                aria-selected={selected()}
                data-selected={selected() ? '' : undefined}
                disabled={Boolean(merged.disabled || item.disabled)}
                data-slot="trigger"
                style={merged.styles?.trigger}
                class={tabsTriggerVariants(
                  {
                    orientation: merged.orientation,
                    variant: merged.variant,
                    size: merged.size,
                  },
                  merged.classes?.trigger,
                )}
                onClick={() => selectValue(item.value)}
                onKeyDown={(event) => {
                  onNavigationKeyDown(event, item.value, merged.orientation)
                }}
              >
                <Show when={item.icon}>
                  <span
                    data-slot="leading"
                    style={merged.styles?.leading}
                    class={tabsLeadingVariants({ size: merged.size }, merged.classes?.leading)}
                  >
                    <Icon name={item.icon} />
                  </span>
                </Show>

                <Show when={typeof item.label === 'string'} fallback={item.label}>
                  <span
                    data-slot="label"
                    style={merged.styles?.label}
                    class={cn('truncate', merged.classes?.label)}
                  >
                    {item.label}
                  </span>
                </Show>
              </button>
            )
          }}
        </For>
      </div>

      <For each={normalizedItems()}>
        {(item) => {
          const selected = createMemo(() => selectedValue() === item.value)

          return (
            <Show when={selected()}>
              <div
                id={getContentId(item.value)}
                role="tabpanel"
                tabIndex={0}
                aria-labelledby={getTriggerId(item.value)}
                data-selected=""
                data-slot="content"
                style={merged.styles?.content}
                class={cn('outline-none w-full', merged.classes?.content, item.class)}
              >
                {item.content}
              </div>
            </Show>
          )
        }}
      </For>
    </div>
  )
}
