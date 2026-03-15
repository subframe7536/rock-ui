import 'uno.css'

import type { Component } from 'solid-js'
import { createSignal, lazy, onMount } from 'solid-js'
import { Dynamic, render } from 'solid-js/web'

import registry from './.meta/index.json'
import { Sidebar } from './components/common/sidebar'

const DEMO_MAP: Record<string, Component> = {
  accordion: lazy(() => import('./demo/general/accordion-demos')),
  avatar: lazy(() => import('./demo/general/avatar-demos')),
  badge: lazy(() => import('./demo/general/badge-demos')),
  breadcrumb: lazy(() => import('./demo/navigation/breadcrumb-demos')),
  button: lazy(() => import('./demo/general/button-demos')),
  card: lazy(() => import('./demo/general/card-demos')),
  checkbox: lazy(() => import('./demo/form/checkbox-demos')),
  'checkbox-group': lazy(() => import('./demo/form/checkbox-group-demos')),
  collapsible: lazy(() => import('./demo/general/collapsible-demos')),
  'command-palette': lazy(() => import('./demo/navigation/command-palette-demos')),
  'context-menu': lazy(() => import('./demo/overlay/context-menu-demos')),
  dialog: lazy(() => import('./demo/overlay/dialog-demos')),
  'dropdown-menu': lazy(() => import('./demo/overlay/dropdown-menu-demos')),
  'dropdown-menu-reactivity': lazy(() => import('./demo/overlay/dialog-reactivity-demos')),
  'file-upload': lazy(() => import('./demo/form/file-upload-demos')),
  form: lazy(() => import('./demo/form/form-demos')),
  'form-field': lazy(() => import('./demo/form/form-field-demos')),
  icon: lazy(() => import('./demo/general/icon-demos')),
  input: lazy(() => import('./demo/form/input-demos')),
  'input-number': lazy(() => import('./demo/form/input-number-demos')),
  kbd: lazy(() => import('./demo/general/kbd-demos')),
  pagination: lazy(() => import('./demo/navigation/pagination-demos')),
  popover: lazy(() => import('./demo/overlay/popover-demos')),
  popup: lazy(() => import('./demo/overlay/popup-demos')),
  progress: lazy(() => import('./demo/general/progress-demos')),
  'radio-group': lazy(() => import('./demo/form/radio-group-demos')),
  resizable: lazy(() => import('./demo/general/resizable-demos')),
  select: lazy(() => import('./demo/form/select-demos')),
  separator: lazy(() => import('./demo/general/separator-demos')),
  sheet: lazy(() => import('./demo/overlay/sheet-demos')),
  slider: lazy(() => import('./demo/form/slider-demos')),
  stepper: lazy(() => import('./demo/navigation/stepper-demos')),
  switch: lazy(() => import('./demo/form/switch-demos')),
  tabs: lazy(() => import('./demo/navigation/tabs-demos')),
  textarea: lazy(() => import('./demo/form/textarea-demos')),
  tooltip: lazy(() => import('./demo/overlay/tooltip-demos')),
}

// Build PAGES from registry, plus special demo-only entries
const PAGES = [
  ...registry.map((entry) => ({ key: entry.key, label: entry.name, group: entry.category })),
  { key: 'dropdown-menu-reactivity', label: 'Dropdown Menu Reactivity', group: 'Overlay' },
]

function App() {
  const [page, setPage] = createSignal(location.hash.slice(1) || 'button')

  onMount(() => {
    window.addEventListener('hashchange', () => {
      setPage(location.hash.slice(1) || 'button')
    })
  })

  const navigate = (key: string) => {
    location.hash = key
    setPage(key)
  }

  return (
    <div class="flex h-screen overflow-hidden">
      <Sidebar pages={PAGES} activePage={page} setActivePage={navigate} />
      <div class="flex-1 overflow-y-auto">
        <Dynamic component={DEMO_MAP[page()]} />
      </div>
    </div>
  )
}

render(() => <App />, document.getElementById('app')!)
