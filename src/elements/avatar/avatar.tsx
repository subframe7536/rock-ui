import type { JSX } from 'solid-js'
import {
  For,
  Show,
  createEffect,
  createMemo,
  createSignal,
  mergeProps,
  onCleanup,
  splitProps,
} from 'solid-js'

import type { RockUIProps, SlotClasses, SlotStyles } from '../../shared/types'
import { cn } from '../../shared/utils'
import type { IconName } from '../icon'
import { Icon } from '../icon'

import type { AvatarVariantProps } from './avatar.class'
import {
  avatarBadgeVariants,
  avatarFallbackIconVariants,
  avatarFallbackVariants,
  avatarGroupCountVariants,
  avatarGroupItemVariants,
  avatarImageVariants,
  avatarRootVariants,
} from './avatar.class'

export type AvatarStatus = 'idle' | 'loading' | 'loaded' | 'error'

export namespace AvatarT {
  export type Slot =
    | 'root'
    | 'image'
    | 'fallback'
    | 'fallbackIcon'
    | 'badge'
    | 'group'
    | 'groupItem'
    | 'groupCount'
  export type Variant = AvatarVariantProps
  export type BadgePosition = Exclude<AvatarVariantProps['badgePosition'], undefined>
  export interface Items {
    /**
     * Source URL for the avatar image.
     */
    src?: string

    /**
     * Accessible alt text for the avatar.
     */
    alt?: string

    /**
     * Icon name for the badge.
     */
    badge?: IconName

    /**
     * Position of the badge.
     * @default 'bottom-right'
     */
    badgePosition?: BadgePosition

    /**
     * Initial text to show if image fails or is missing.
     */
    text?: string

    /**
     * Icon name to show as fallback.
     */
    fallback?: IconName

    /**
     * Callback when the loading status of the avatar changes.
     */
    onStatusChange?: (status: AvatarStatus) => void
  }
  export interface Extend {}
  export interface Classes extends SlotClasses<Slot> {}
  export interface Styles extends SlotStyles<Slot> {}

  /**
   * Base props for the Avatar component.
   */
  export interface Base extends Items {
    /**
     * Array of items to render in a group.
     */
    items?: Items[]

    /**
     * Maximum number of avatars to show when in a group.
     */
    max?: number | string
  }

  /**
   * Props for the Avatar component.
   */
  export interface Props extends RockUIProps<Base, Variant, Extend, Slot> {}
}

/**
 * Props for the Avatar component.
 */
export interface AvatarProps extends AvatarT.Props {}

function resolveMax(max: AvatarProps['max']): number | undefined {
  if (typeof max === 'string') {
    const parsed = Number.parseInt(max, 10)

    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed
    }

    return undefined
  }

  if (typeof max === 'number' && Number.isFinite(max) && max > 0) {
    return max
  }

  return undefined
}

function resolveFallbackText(text: string | undefined, alt: string | undefined): string {
  const preferredText = text?.trim()
  if (preferredText) {
    return preferredText
  }

  const initials = (alt ?? '')
    .split(' ')
    .map((word) => word.trim())
    .filter(Boolean)
    .map((word) => word.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return initials || '\u00A0'
}

/** Circular user or entity avatar with fallback initials and optional indicator. */
export function Avatar(props: AvatarProps): JSX.Element {
  const merged = mergeProps(
    {
      size: 'md' as const,
      transition: 'normal' as const,
      items: undefined as AvatarT.Items[] | undefined,
      max: undefined as number | string | undefined,
      badgePosition: 'bottom-right' as const,
    },
    props,
  )

  const [faceProps, restProps] = splitProps(merged, [
    'src',
    'alt',
    'badge',
    'badgePosition',
    'text',
    'fallback',
    'onStatusChange',
  ])

  const visibleItems = createMemo(() => {
    const allItems = restProps.items ?? []
    if (allItems.length === 0) {
      return []
    }

    const max = resolveMax(restProps.max)
    if (!max) {
      return [...allItems].reverse()
    }

    return [...allItems].slice(0, max).reverse()
  })

  const hiddenCount = createMemo(() => {
    return (restProps.items?.length ?? 0) - visibleItems().length
  })

  function AvatarFace(props: AvatarT.Items & { slot: 'root' | 'groupItem' }): JSX.Element {
    const [status, setStatusSignal] = createSignal<AvatarStatus>('idle')
    const [resolvedSrc, setResolvedSrc] = createSignal<string | undefined>(undefined)

    let currentStatus: AvatarStatus = 'idle'

    function setStatus(nextStatus: AvatarStatus): void {
      if (currentStatus === nextStatus) {
        return
      }

      currentStatus = nextStatus
      setStatusSignal(nextStatus)
      props.onStatusChange?.(nextStatus)
    }

    createEffect(() => {
      const source = props.src?.trim() || undefined
      let cancelled = false

      onCleanup(() => {
        cancelled = true
      })

      setResolvedSrc(undefined)

      if (!source || typeof window === 'undefined' || typeof window.Image !== 'function') {
        setStatus('error')
        return
      }

      setStatus('loading')
      const loader = new window.Image()

      loader.onload = () => {
        if (cancelled) {
          return
        }
        setResolvedSrc(source)
        setStatus('loaded')
      }

      loader.onerror = () => {
        if (cancelled) {
          return
        }
        setResolvedSrc(undefined)
        setStatus('error')
      }

      loader.src = source
    })

    const size = () => restProps.size
    const transition = () => restProps.transition
    const badgePosition = () => faceProps.badgePosition

    return (
      <span
        data-slot={props.slot}
        data-status={status()}
        style={props.slot === 'groupItem' ? merged.styles?.groupItem : merged.styles?.root}
        class={avatarRootVariants(
          {
            size: size(),
          },
          props.slot === 'groupItem'
            ? avatarGroupItemVariants(
                {
                  size: size(),
                },
                restProps.classes?.root,
                restProps.classes?.groupItem,
              )
            : restProps.classes?.root,
        )}
      >
        <img
          data-slot="image"
          style={merged.styles?.image}
          src={resolvedSrc()}
          alt={props.alt ?? ''}
          class={avatarImageVariants(
            {
              status: status(),
              transition: transition(),
            },
            restProps.classes?.image,
          )}
        />

        <span
          data-slot="fallback"
          style={merged.styles?.fallback}
          class={avatarFallbackVariants(
            {
              size: size(),
              status: status(),
              transition: transition(),
            },
            restProps.classes?.fallback,
          )}
        >
          <Show when={props.fallback} fallback={resolveFallbackText(props.text, props.alt)}>
            {(fallbackIcon) => (
              <Icon
                name={fallbackIcon()}
                slotName="fallbackIcon"
                style={merged.styles?.fallbackIcon}
                class={avatarFallbackIconVariants(
                  {
                    size: size(),
                  },
                  restProps.classes?.fallbackIcon,
                )}
              />
            )}
          </Show>
        </span>

        <Show when={props.badge}>
          {(badge) => (
            <span
              data-slot="badge"
              style={merged.styles?.badge}
              class={avatarBadgeVariants(
                {
                  size: size(),
                  badgePosition: badgePosition(),
                },
                restProps.classes?.badge,
              )}
            >
              <Icon name={badge()} class="text-[0.75em]" />
            </span>
          )}
        </Show>
      </span>
    )
  }

  return (
    <Show
      when={(restProps.items?.length ?? 0) > 0}
      fallback={<AvatarFace {...faceProps} slot="root" />}
    >
      <div
        data-slot="group"
        style={merged.styles?.group}
        class={cn('inline-flex flex-row-reverse justify-end', restProps.classes?.group)}
      >
        <Show when={hiddenCount() > 0}>
          <span
            data-slot="groupCount"
            style={merged.styles?.groupCount}
            class={avatarGroupCountVariants(
              {
                size: restProps.size,
              },
              restProps.classes?.groupCount,
            )}
          >
            +{hiddenCount()}
          </span>
        </Show>

        <For each={visibleItems()}>{(item) => <AvatarFace {...item} slot="groupItem" />}</For>
      </div>
    </Show>
  )
}
