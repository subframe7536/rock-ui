import type { JSX } from 'solid-js'
import { Show, createMemo, createResource } from 'solid-js'

import { Badge } from '../../src'

import { PropsTable } from './props-table'
import type { ComponentPropsDoc } from './props-table'

// ── ComponentDocPage ───────────────────────────────────────────────────

interface ComponentDoc {
  component: ComponentIndexEntry
  props: ComponentPropsDoc
}

interface ComponentIndexEntry {
  name: string
  key: string
  category: string
  description?: string
  sourcePath?: string
  polymorphic: boolean
}

export interface DemoPageProps {
  componentKey: string
  children: JSX.Element
}

async function fetchComponentDoc(key: string): Promise<ComponentDoc> {
  const res = await fetch(`/component-api/components/${key}.json`)
  if (!res.ok) {
    throw new Error(`Failed to load component doc: ${key}`)
  }
  return (await res.json()) as ComponentDoc
}

export const DemoPage = (props: DemoPageProps) => {
  const [doc] = createResource(() => props.componentKey, fetchComponentDoc)

  const component = createMemo(() => doc()?.component)
  const propsDoc = createMemo(() => {
    const data = doc()?.props
    if (!data) {
      return { own: [], inherited: [] }
    }
    return data
  })

  const hasProps = createMemo(() => {
    const data = propsDoc()
    return data.own.length > 0 || data.inherited.length > 0
  })

  return (
    <main class="text-zinc-900 p-6 min-h-screen w-full from-stone-100 to-slate-100 via-zinc-50 bg-gradient-to-br sm:p-10">
      <div class="mx-auto flex flex-col gap-6 max-w-5xl">
        <header class="text-foreground p-6 sm:p-8">
          <div class="flex flex-wrap gap-2 items-center">
            <Show when={component()?.category}>
              <p class="text-sm text-zinc-700 tracking-[0.22em] uppercase">
                {component()!.category}
              </p>
            </Show>
            <Show when={component()?.polymorphic}>
              <Badge>Polymorphic</Badge>
            </Show>
          </div>
          <h1 class="text-2xl font-semibold mt-2 sm:text-3xl">
            <Show when={component()?.name} fallback={props.componentKey}>
              {component()!.name}
            </Show>
          </h1>
          <Show when={component()?.description}>
            <p class="text-sm text-zinc-600 mt-2 max-w-2xl sm:text-base">
              {component()!.description}
            </p>
          </Show>
          <Show when={component()?.sourcePath}>
            <p class="text-xs text-zinc-500 font-mono mt-3">{component()!.sourcePath}</p>
          </Show>
        </header>

        {props.children}

        <Show when={hasProps()}>
          <section>
            <h2 class="text-sm text-zinc-600 tracking-[0.16em] font-semibold mb-4 uppercase">
              Props
            </h2>
            <PropsTable props={propsDoc()} />
          </section>
        </Show>
      </div>
    </main>
  )
}
