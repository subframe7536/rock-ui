import type { Accessor } from 'solid-js'
import { createEffect, createMemo, createSignal } from 'solid-js'

export interface UseDisclosureStateOptions {
  disabled?: Accessor<boolean>
  open: Accessor<boolean>
}

export function useDisclosureState(options: UseDisclosureStateOptions) {
  const disabled = createMemo(() => Boolean(options.disabled?.()))
  const dataAttrs = createMemo(() => ({
    'data-closed': options.open() ? undefined : '',
    'data-disabled': disabled() ? '' : undefined,
    'data-expanded': options.open() ? '' : undefined,
  }))
  const [contentHeight, setContentHeight] = createSignal(0)
  let contentEl: HTMLDivElement | undefined

  createEffect(() => {
    options.open()

    if (contentEl) {
      setContentHeight(contentEl.scrollHeight)
    }
  })

  function setContentElement(element: HTMLDivElement): void {
    contentEl = element
    setContentHeight(element.scrollHeight)
  }

  return {
    contentHeight,
    dataAttrs,
    disabled,
    setContentElement,
  }
}
