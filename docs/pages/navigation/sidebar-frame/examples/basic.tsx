import { SidebarFrame } from '@src'
import { For } from 'solid-js'

const PAGES = [
  'Introduction',
  'Installation',
  'Theming',
  'Button',
  'Input',
  'Dialog',
  'Dropdown Menu',
  'Tabs',
  'Table',
  'Form',
]

export function Basic() {
  return (
    <div class="b-1 b-border rounded-xl h-72 overflow-hidden">
      <SidebarFrame
        isMobile={false}
        renderSidebarHeader={() => <div class="text-sm font-semibold p-3">Documentation</div>}
        renderSidebarBody={() => (
          <div class="p-2 h-full overflow-y-auto">
            <div class="flex flex-col gap-1">
              <For each={PAGES}>
                {(item) => (
                  <button
                    type="button"
                    class="text-sm px-2.5 py-1.5 text-left rounded-md hover:bg-accent"
                  >
                    {item}
                  </button>
                )}
              </For>
            </div>
          </div>
        )}
        renderMain={() => (
          <div class="p-4 h-full">
            <h3 class="text-base font-semibold">Getting Started</h3>
            <p class="text-sm text-muted-foreground mt-2">
              Use SidebarFrame to compose sidebar and content in one place.
            </p>
          </div>
        )}
      />
    </div>
  )
}
