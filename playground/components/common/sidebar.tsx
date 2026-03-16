import type { Accessor } from 'solid-js'
import { For, Show, createMemo, createSignal } from 'solid-js'

export interface SidebarPage {
  key: string
  label: string
  group: string
}

export interface SidebarProps {
  pages: SidebarPage[]
  activePage: Accessor<string>
  setActivePage: (key: string) => void
}

export const Sidebar = (props: SidebarProps) => {
  const [search, setSearch] = createSignal('')

  const filtered = createMemo(() => {
    const q = search().toLowerCase().trim()
    if (!q) {
      return props.pages
    }
    return props.pages.filter((p) => p.label.toLowerCase().includes(q))
  })

  const grouped = createMemo(() => {
    const map = new Map<string, SidebarPage[]>()

    for (const page of filtered()) {
      const list = map.get(page.group) ?? []
      list.push(page)
      map.set(page.group, list)
    }

    return [...map.entries()]
  })

  return (
    <aside class="text-zinc-800 p-4 bg-zinc-100 flex shrink-0 flex-col gap-4 w-56 overflow-y-auto">
      <div class="text-xs text-zinc-400 tracking-widest font-semibold px-2 uppercase">Rock UI</div>

      <div class="px-1">
        <input
          type="text"
          placeholder="Search..."
          value={search()}
          onInput={(e) => setSearch(e.currentTarget.value)}
          class="text-xs px-2.5 py-1.5 outline-none b-1 b-zinc-300/50 rounded-md bg-zinc-200 w-full transition-colors placeholder:text-zinc-500 focus:b-zinc-400"
        />
      </div>

      <nav class="flex flex-col gap-4">
        <For each={grouped()}>
          {([group, pages]) => (
            <div>
              <div class="text-[11px] text-zinc-500 tracking-wider font-medium mb-1.5 px-2 flex uppercase items-center justify-between">
                <span>{group}</span>
                <span class="text-zinc-600 font-normal">{pages.length}</span>
              </div>
              <div class="flex flex-col gap-0.5">
                <For each={pages}>
                  {(page) => (
                    <button
                      type="button"
                      class={`text-sm text-zinc-600 px-2.5 py-1.5 text-left rounded-md ${
                        props.activePage() === page.key
                          ? 'bg-zinc-300/80 font-medium'
                          : 'hover:bg-zinc-200 hover:text-zinc-800'
                      }`}
                      onClick={() => props.setActivePage(page.key)}
                    >
                      {page.label}
                    </button>
                  )}
                </For>
              </div>
            </div>
          )}
        </For>

        <Show when={grouped().length === 0}>
          <p class="text-xs text-zinc-500 px-2">No results</p>
        </Show>
      </nav>
    </aside>
  )
}
