import * as KobalteButton from '@kobalte/core/button'
import type { ElementOf, PolymorphicProps } from '@kobalte/core/polymorphic'
import type { JSX, ValidComponent } from 'solid-js'
import { Show, createMemo, createSignal, splitProps } from 'solid-js'

import { useFieldGroupContext } from '../field-group/field-group-context'
import { callHandler, cn } from '../shared/utils'

import type { ButtonVariantProps } from './button.class'
import { buttonIconSizeVariants, buttonVariants } from './button.class'

/**
 * Class overrides for Button slots.
 */
export interface ButtonClasses {
  /**
   * Root slot classes.
   */
  root?: string

  /**
   * Leading slot classes.
   */
  leading?: string

  /**
   * Label slot classes.
   */
  label?: string

  /**
   * Trailing slot classes.
   */
  trailing?: string

  /**
   * Loading icon wrapper classes.
   */
  loading?: string
}

/**
 * Additional Rock UI button options on top of Kobalte's polymorphic button props.
 */
export interface ButtonBaseProps extends ButtonVariantProps {
  /**
   * Controlled loading state.
   */
  loading?: boolean

  /**
   * Auto toggles loading while async click handlers are pending.
   */
  loadingAuto?: boolean

  /**
   * Leading visual content, usually an icon.
   */
  leading?: JSX.Element

  /**
   * Trailing visual content, usually an icon.
   */
  trailing?: JSX.Element

  /**
   * Label content rendered before `children`.
   */
  label?: JSX.Element

  /**
   * Optional icon shown when `loading` is active.
   */
  loadingIcon?: JSX.Element

  /**
   * Slot-based class overrides, similar to Nuxt UI `ui` customization.
   */
  classes?: ButtonClasses
}

/**
 * Polymorphic button props composed from Kobalte button root props and Rock UI button options.
 */
export type ButtonProps<T extends ValidComponent = 'button'> = PolymorphicProps<
  T,
  ButtonBaseProps & Omit<KobalteButton.ButtonRootProps<ElementOf<T>>, 'class'>
>

type ButtonSize = NonNullable<ButtonVariantProps['size']>

type PromiseLikeWithFinally = PromiseLike<unknown> & {
  then: PromiseLike<unknown>['then']
}

function isPromiseLike(value: unknown): value is PromiseLikeWithFinally {
  return (
    (typeof value === 'object' || typeof value === 'function') &&
    value !== null &&
    typeof (value as PromiseLike<unknown>).then === 'function'
  )
}

function normalizeFieldGroupButtonSize(size?: string): ButtonSize | undefined {
  if (size === 'xs' || size === 'sm' || size === 'lg' || size === 'xl') {
    return size
  }

  if (size === 'md') {
    return 'default'
  }

  return undefined
}

/**
 * Rock UI Button built on top of Kobalte `Button.Root` with polymorphic `as` support.
 */
export function Button<T extends ValidComponent = 'button'>(props: ButtonProps<T>): JSX.Element {
  const [styleProps, stateProps, contentProps, rootProps] = splitProps(
    props as ButtonProps,
    ['class', 'variant', 'size', 'classes'],
    ['disabled', 'loading', 'loadingAuto', 'loadingIcon', 'onClick'],
    ['leading', 'trailing', 'label', 'children'],
  )

  const fieldGroup = useFieldGroupContext()
  const [loadingAutoState, setLoadingAutoState] = createSignal(false)
  const resolvedSize = createMemo<ButtonVariantProps['size']>(() => {
    if (styleProps.size !== undefined) {
      return styleProps.size
    }

    return normalizeFieldGroupButtonSize(fieldGroup?.size)
  })

  const isLoading = createMemo(() =>
    Boolean(stateProps.loading || (stateProps.loadingAuto && loadingAutoState())),
  )

  const resolvedLeading = createMemo(() => {
    if (isLoading()) {
      return stateProps.loadingIcon ?? contentProps.leading
    }

    return contentProps.leading
  })

  const resolvedTrailing = createMemo(() => {
    if (isLoading()) {
      return undefined
    }

    return contentProps.trailing
  })

  const hasLeading = createMemo(() => {
    return resolvedLeading() !== undefined && resolvedLeading() !== null
  })

  const content = createMemo(() => {
    if (contentProps.label !== undefined && contentProps.label !== null) {
      return contentProps.label
    }

    return contentProps.children
  })

  const onClick: JSX.EventHandlerUnion<any, MouseEvent> = (event) => {
    const { result: handlerResult, defaultPrevented } = callHandler(event, stateProps.onClick)

    if (!stateProps.loadingAuto || defaultPrevented || !isPromiseLike(handlerResult)) {
      return
    }

    setLoadingAutoState(true)
    Promise.resolve(handlerResult).finally(() => {
      setLoadingAutoState(false)
    })
  }

  return (
    <KobalteButton.Root
      data-slot="button"
      class={buttonVariants(
        {
          variant: styleProps.variant,
          size: resolvedSize(),
        },
        isLoading() && 'cursor-wait opacity-80',
        styleProps.classes?.root,
      )}
      aria-busy={isLoading() ? true : undefined}
      data-loading={isLoading() ? '' : undefined}
      disabled={isLoading() || stateProps.disabled}
      onClick={onClick}
      {...rootProps}
    >
      <Show when={hasLeading()}>
        <span
          data-slot="leading"
          class={buttonIconSizeVariants(
            {
              size: resolvedSize(),
            },
            'flex items-center',
            styleProps.classes?.leading,
            isLoading() && styleProps.classes?.loading,
          )}
          aria-hidden={isLoading() ? 'true' : undefined}
        >
          {resolvedLeading()}
        </span>
      </Show>

      <Show when={content() !== undefined && content() !== null}>
        <span data-slot="label" class={cn('truncate', styleProps.classes?.label)}>
          {content()}
        </span>
      </Show>

      <Show when={resolvedTrailing()}>
        {(trailingResolved) => (
          <span
            data-slot="trailing"
            class={buttonIconSizeVariants(
              {
                size: resolvedSize(),
              },
              'flex items-center',
              styleProps.classes?.trailing,
            )}
          >
            {trailingResolved()}
          </span>
        )}
      </Show>
    </KobalteButton.Root>
  )
}
