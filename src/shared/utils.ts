import type { JSX } from 'solid-js'
import { createUniqueId } from 'solid-js'

/**
 * Generates a unique identifier for accessibility and form association.
 *
 * Priority:
 * 1. Returns `deterministicId` if provided
 * 2. Uses `useId` from ConfigProvider if available (for SSR)
 * 3. Falls back to auto-incrementing counter
 *
 * @param deterministicId - Optional explicit ID to use
 * @param prefix - Prefix for generated IDs (default: 'rock')
 * @returns A unique string identifier
 *
 * @example
 * ```tsx
 * // Auto-generated ID
 * const id = useId() // 'rock-1'
 *
 * // With custom prefix
 * const [local, rest] = splitProps(props, ['id'])
 * const id = useId(() => local.id, 'dialog') // 'dialog-cl-2'
 * ```
 */
export function useId(deterministicId?: () => string | null | undefined, prefix?: string): string {
  // Get the actual value if it's a function
  const id = typeof deterministicId === 'function' ? deterministicId() : deterministicId

  // Return deterministic ID if provided
  if (id) {
    return id
  }

  // Fallback to auto-incrementing counter
  return `${prefix}-${createUniqueId()}`
}

export { combineStyle } from '@solid-primitives/props'
export { cls as cn } from 'cls-variant'
export function callHandler<T, E extends Event>(
  event: E,
  handler: JSX.EventHandlerUnion<T, E> | undefined,
) {
  if (handler) {
    if (typeof handler === 'function') {
      handler(event as any)
    } else {
      handler[0](handler[1], event as any)
    }
  }

  return event?.defaultPrevented
}
