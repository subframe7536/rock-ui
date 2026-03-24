import 'uno.css'

import type { Component } from 'solid-js'
import { Show, createEffect, createMemo, createSignal, lazy, onMount } from 'solid-js'
import { Dynamic, render } from 'solid-js/web'
import apiIndex from 'virtual:api-doc'

import { Resizable } from '../src/elements/resizable'

import { Sidebar } from './components/sidebar'

type ThemeMode = 'light' | 'dark'

function getInitialTheme(): ThemeMode {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(theme: ThemeMode): void {
  const isDark = theme === 'dark'
  const root = document.documentElement
  root.classList.toggle('dark', isDark)
  root.style.colorScheme = isDark ? 'dark' : 'light'
}

const DEMO_MAP: Record<string, Component> = {
  intro: lazy(() => import('./pages/intro')),
  accordion: lazy(() => import('./pages/general/accordion-demos')),
  avatar: lazy(() => import('./pages/general/avatar-demos')),
  badge: lazy(() => import('./pages/general/badge-demos')),
  breadcrumb: lazy(() => import('./pages/navigation/breadcrumb-demos')),
  button: lazy(() => import('./pages/general/button-demos')),
  card: lazy(() => import('./pages/general/card-demos')),
  checkbox: lazy(() => import('./pages/form/checkbox-demos')),
  'checkbox-group': lazy(() => import('./pages/form/checkbox-group-demos')),
  collapsible: lazy(() => import('./pages/general/collapsible-demos')),
  'command-palette': lazy(() => import('./pages/navigation/command-palette-demos')),
  'context-menu': lazy(() => import('./pages/overlay/context-menu-demos')),
  dialog: lazy(() => import('./pages/overlay/dialog-demos')),
  'dropdown-menu': lazy(() => import('./pages/overlay/dropdown-menu-demos')),
  'file-upload': lazy(() => import('./pages/form/file-upload-demos')),
  form: lazy(() => import('./pages/form/form-demos')),
  icon: lazy(() => import('./pages/general/icon-demos')),
  input: lazy(() => import('./pages/form/input-demos')),
  'input-number': lazy(() => import('./pages/form/input-number-demos')),
  kbd: lazy(() => import('./pages/general/kbd-demos')),
  pagination: lazy(() => import('./pages/navigation/pagination-demos')),
  popover: lazy(() => import('./pages/overlay/popover-demos')),
  popup: lazy(() => import('./pages/overlay/popup-demos')),
  progress: lazy(() => import('./pages/general/progress-demos')),
  'radio-group': lazy(() => import('./pages/form/radio-group-demos')),
  resizable: lazy(() => import('./pages/general/resizable-demos')),
  select: lazy(() => import('./pages/form/select-demos')),
  separator: lazy(() => import('./pages/general/separator-demos')),
  sheet: lazy(() => import('./pages/overlay/sheet-demos')),
  slider: lazy(() => import('./pages/form/slider-demos')),
  stepper: lazy(() => import('./pages/navigation/stepper-demos')),
  switch: lazy(() => import('./pages/form/switch-demos')),
  tabs: lazy(() => import('./pages/navigation/tabs-demos')),
  textarea: lazy(() => import('./pages/form/textarea-demos')),
  tooltip: lazy(() => import('./pages/overlay/tooltip-demos')),
  toast: lazy(() => import('./pages/overlay/toaster-demos')),
}

function App() {
  const [theme, setTheme] = createSignal<ThemeMode>('light')

  const pages = createMemo(() => {
    const componentPages = apiIndex.components
      .filter((entry) => entry.key in DEMO_MAP)
      .map((entry) =>
        Object.assign(
          { key: entry.key, label: entry.name },
          entry.category ? { group: entry.category } : {},
        ),
      )

    return [
      { key: 'intro', label: 'Introduction', group: 'Guide' },
      ...componentPages,
      { key: 'toast', label: 'Toast', group: 'overlays' },
    ]
  })

  const [page, setPage] = createSignal(location.hash.slice(1) || 'intro')

  onMount(() => {
    const initialTheme = getInitialTheme()
    setTheme(initialTheme)
    applyTheme(initialTheme)

    window.addEventListener('hashchange', () => {
      setPage(location.hash.slice(1) || 'button')
    })
  })

  createEffect(() => {
    const current = page()
    const hasDemo = Boolean(DEMO_MAP[current])
    if (hasDemo) {
      return
    }
    const first = pages()[0]?.key
    if (first) {
      setPage(first)
      location.hash = first
    }
  })

  const navigate = (key: string) => {
    location.hash = key
    setPage(key)
  }

  const updateTheme = (nextTheme: ThemeMode) => {
    const run = () => {
      setTheme(nextTheme)
      applyTheme(nextTheme)
    }

    if (typeof document.startViewTransition === 'function') {
      document.startViewTransition(run)
      return
    }
    run()
  }

  const ActiveDemo = createMemo(() => DEMO_MAP[page()])

  return (
    <Resizable
      panels={[
        {
          content: (
            <Sidebar
              pages={pages()}
              activePage={page}
              setActivePage={navigate}
              theme={theme}
              setTheme={updateTheme}
            />
          ),
          defaultSize: '15%',
          min: 200,
          max: 400,
        },
        {
          content: (
            <div class="overflow-y-auto">
              <Show
                when={ActiveDemo()}
                fallback={<div class="text-sm text-muted-foreground p-6">Demo not found.</div>}
              >
                <Dynamic component={ActiveDemo()!} />
              </Show>
            </div>
          ),
        },
      ]}
      orientation="horizontal"
      classes={{
        root: 'h-screen',
        divider: 'after:(transition duration-200 ease-out) hover:after:(bg-accent w-1.5)',
      }}
    />
  )
}

render(() => <App />, document.getElementById('app')!)
