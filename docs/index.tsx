import 'uno.css'

import { Show, createMemo, createSignal } from 'solid-js'
import { Dynamic, render } from 'solid-js/web'
import { exampleMap, pages } from 'virtual:example-pages'

import { Button } from '../src'

import { ContentHeader } from './components/content-header'
import { DocsShell } from './components/docs-shell'
import { Sidebar, SidebarHeader } from './components/sidebar'
import { useRouting } from './hooks/use-routing'
import { useTheme } from './hooks/use-theme'

function App() {
  const pageKeys = pages.map((entry) => entry.key)
  const fallbackPage = pageKeys[0]

  const { theme, updateTheme } = useTheme()
  const { page, navigate } = useRouting(pageKeys, fallbackPage)
  const [sidebarSearch, setSidebarSearch] = createSignal('')

  const ActiveExample = createMemo(
    () => exampleMap[page()] ?? (fallbackPage ? exampleMap[fallbackPage] : undefined),
  )

  const pageTitle = createMemo(() => pages.find((p) => p.key === page())?.label ?? '')

  return (
    <DocsShell
      sidebar={(ctx) => (
        <div class="flex flex-col h-full min-h-0">
          <SidebarHeader
            search={sidebarSearch}
            setSearch={setSidebarSearch}
            onClose={ctx.isMobile() ? () => ctx.setSidebarOpen(false) : undefined}
          />
          <Sidebar
            pages={pages}
            activePage={page}
            search={sidebarSearch}
            setActivePage={(key) => {
              navigate(key)
              ctx.setSidebarOpen(false)
            }}
          />
        </div>
      )}
      main={(ctx) => (
        <>
          <ContentHeader
            leading={
              <Show when={ctx.isMobile()}>
                <Button
                  variant="ghost"
                  size="sm"
                  leading="i-lucide-menu"
                  aria-label="Toggle sidebar"
                  onClick={ctx.toggleSidebar}
                />
              </Show>
            }
            pageTitle={pageTitle}
            scrolled={ctx.scrolled}
            theme={theme}
            setTheme={updateTheme}
          />
          <Show
            when={ActiveExample()}
            fallback={<div class="text-sm text-muted-foreground p-6">Example not found.</div>}
          >
            <Dynamic component={ActiveExample()!} />
          </Show>
        </>
      )}
    />
  )
}

render(() => <App />, document.getElementById('app')!)
