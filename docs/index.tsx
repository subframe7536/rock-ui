import 'uno.css'

import { Show, createMemo, createSignal } from 'solid-js'
import { Dynamic, render } from 'solid-js/web'
import { exampleMap, pages } from 'virtual:example-pages'

import { Button, SidebarFrame, SidebarFrameSheetResizableRender } from '../src'

import { ContentHeader } from './components/content-header'
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
    <div class="h-screen overflow-hidden">
      <SidebarFrame
        renderFrame={(ctx) => (
          <SidebarFrameSheetResizableRender
            {...ctx}
            resizableOptions={{
              classes: {
                divider:
                  'after:(transition duration-200 ease-out z-20) hover:after:(bg-accent w-1.5)',
              },
            }}
            resizablePanelOptions={{
              defaultSize: '18%',
              min: 240,
              max: 400,
            }}
          />
        )}
        renderSidebarHeader={(ctx) => (
          <SidebarHeader
            search={sidebarSearch}
            setSearch={setSidebarSearch}
            onClose={ctx.isMobile() ? () => ctx.setOpen(false) : undefined}
          />
        )}
        renderSidebarBody={(ctx) => (
          <Sidebar
            pages={pages}
            activePage={page}
            search={sidebarSearch}
            setActivePage={(key) => {
              navigate(key)
              ctx.setOpen(false)
            }}
          />
        )}
        renderMain={(ctx) => (
          <>
            <ContentHeader
              leading={
                <Show when={ctx.isMobile()}>
                  <Button
                    variant="ghost"
                    size="sm"
                    leading="i-lucide-menu"
                    aria-label="Toggle sidebar"
                    onClick={ctx.toggle}
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
    </div>
  )
}

render(() => <App />, document.getElementById('app')!)
