import type { Accessor, JSX } from 'solid-js'
import { createMemo, createSignal } from 'solid-js'

import { callHandler } from './utils'

type PromiseLikeWithThen = PromiseLike<unknown> & {
  then: PromiseLike<unknown>['then']
}

function isPromiseLike(value: unknown): value is PromiseLikeWithThen {
  return (
    (typeof value === 'object' || typeof value === 'function') &&
    value !== null &&
    typeof (value as PromiseLike<unknown>).then === 'function'
  )
}

interface UseLoadingAutoClickOptions<T, E extends Event> {
  loading?: Accessor<boolean | undefined>
  loadingAuto?: Accessor<boolean | undefined>
  onClick?: Accessor<JSX.EventHandlerUnion<T, E> | undefined>
}

export function useLoadingAutoClick<T, E extends Event = MouseEvent>(
  options: UseLoadingAutoClickOptions<T, E>,
): {
  isLoading: Accessor<boolean>
  onClick: JSX.EventHandlerUnion<T, E>
} {
  const [loadingAutoState, setLoadingAutoState] = createSignal(false)

  const isLoading = createMemo(() =>
    Boolean(options.loading?.() || (options.loadingAuto?.() && loadingAutoState())),
  )

  const onClick: JSX.EventHandlerUnion<T, E> = (event) => {
    const { result: handlerResult, defaultPrevented } = callHandler(
      event,
      options.onClick?.(),
    )

    if (!options.loadingAuto?.() || defaultPrevented || !isPromiseLike(handlerResult)) {
      return
    }

    setLoadingAutoState(true)
    Promise.resolve(handlerResult).finally(() => {
      setLoadingAutoState(false)
    })
  }

  return {
    isLoading,
    onClick,
  }
}
