import type { Accessor, JSX } from 'solid-js'
import { createMemo } from 'solid-js'

export interface UseComponentIconsProps {
  leading?: JSX.Element
  trailing?: JSX.Element
  loading?: boolean
  loadingIcon?: JSX.Element
}

interface UseComponentIconsReturn {
  isLeading: Accessor<boolean>
  isTrailing: Accessor<boolean>
  leadingIcon: Accessor<JSX.Element>
  trailingIcon: Accessor<JSX.Element>
}

export function useComponentIcons(
  componentProps: Accessor<UseComponentIconsProps>,
): UseComponentIconsReturn {
  const props = createMemo(componentProps)

  const leadingIcon = createMemo(() => {
    if (props().loading) {
      return props().loadingIcon ?? props().leading
    }

    return props().leading
  })

  const trailingIcon = createMemo(() => {
    if (props().loading) {
      return undefined
    }

    return props().trailing
  })

  const isLeading = createMemo(() => leadingIcon() !== undefined && leadingIcon() !== null)
  const isTrailing = createMemo(() => trailingIcon() !== undefined && trailingIcon() !== null)

  return {
    isLeading,
    isTrailing,
    leadingIcon,
    trailingIcon,
  }
}
