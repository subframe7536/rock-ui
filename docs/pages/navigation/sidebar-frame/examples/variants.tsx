import { SidebarFrame } from '@src'
import { For } from 'solid-js'

export function Variants() {
  return (
    <div class="flex flex-col gap-3">
      <For each={['default', 'floating', 'inset'] as const}>
        {(variant) => (
          <div class="b-1 b-border rounded-xl h-64 overflow-hidden">
            <SidebarFrame
              isMobile={false}
              variant={variant}
              renderSidebarHeader={() => <div class="text-xs p-3">{variant}</div>}
              renderSidebarBody={() => (
                <div class="text-sm text-muted-foreground p-2 h-full overflow-y-auto">
                  Sidebar content
                </div>
              )}
              renderMain={() => (
                <div class="text-sm text-foreground p-3 h-full">Main content area</div>
              )}
            />
          </div>
        )}
      </For>
    </div>
  )
}
