import type { Accessor, JSX } from 'solid-js'
import { Show, createEffect, createSignal } from 'solid-js'

import { cn } from '../../src'
import { useIsMobile } from '../hooks/use-mobile'

export interface DocsShellRenderContext {
  isMobile: Accessor<boolean>
  sidebarOpen: Accessor<boolean>
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  scrolled: Accessor<boolean>
}

export interface DocsShellProps {
  sidebar: (context: DocsShellRenderContext) => JSX.Element
  main: (context: DocsShellRenderContext) => JSX.Element
}

export function DocsShell(props: DocsShellProps) {
  const isMobile = useIsMobile()
  const [sidebarOpen, setSidebarOpen] = createSignal(false)
  const [scrolled, setScrolled] = createSignal(false)
  let scrollRoot: HTMLDivElement | undefined

  const context: DocsShellRenderContext = {
    isMobile,
    sidebarOpen,
    setSidebarOpen,
    toggleSidebar: () => setSidebarOpen(!sidebarOpen()),
    scrolled,
  }

  createEffect(() => {
    if (!isMobile()) {
      setSidebarOpen(false)
    }
  })

  const syncScrolled = () => {
    setScrolled((scrollRoot?.scrollTop ?? 0) > 4)
  }

  return (
    <div class="text-foreground bg-background h-screen overflow-hidden">
      <aside class="b-(r border) shrink-0 h-full w-72 hidden overflow-hidden md:block md:inset-y-0 md:left-0 md:fixed">
        {props.sidebar(context)}
      </aside>

      <Show when={isMobile() && sidebarOpen()}>
        <div class="inset-0 fixed z-40 md:hidden">
          <button
            type="button"
            aria-label="Close sidebar"
            class="bg-foreground/25 inset-0 absolute"
            onClick={() => setSidebarOpen(false)}
          />
          <aside class="b-(r border) h-full w-[min(20rem,calc(100vw-3rem))] shadow-xl relative z-10 overflow-hidden">
            {props.sidebar(context)}
          </aside>
        </div>
      </Show>

      <div
        ref={(element) => {
          scrollRoot = element
          syncScrolled()
        }}
        class={cn('scroll-smooth bg-background h-full overflow-y-auto', 'md:ml-72')}
        onScroll={syncScrolled}
      >
        {props.main(context)}
      </div>
    </div>
  )
}
