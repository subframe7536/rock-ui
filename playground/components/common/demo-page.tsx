import type { JSX } from 'solid-js'
import { For, Show, createSignal } from 'solid-js'

import { PropsTable } from './props-table'

// ── Legacy DemoPage (kept for compatibility) ───────────────────────────

export interface DemoPageProps {
  eyebrow: string
  title: string
  description: string
  children: JSX.Element
}

export const DemoPage = (props: DemoPageProps) => (
  <main class="text-zinc-900 p-6 min-h-screen w-full from-stone-100 to-slate-100 via-zinc-50 bg-gradient-to-br sm:p-10">
    <div class="mx-auto flex flex-col gap-6 max-w-5xl">
      <header class="text-white p-6 b-1 b-border border-zinc-200/80 rounded-2xl bg-zinc-900 shadow-lg sm:p-8">
        <p class="text-sm text-zinc-300 tracking-[0.22em] uppercase">{props.eyebrow}</p>
        <h1 class="text-2xl font-semibold mt-2 sm:text-3xl">{props.title}</h1>
        <p class="text-sm text-zinc-300 mt-2 max-w-2xl sm:text-base">{props.description}</p>
      </header>
      {props.children}
    </div>
  </main>
)

// ── DemoSection with source code preview ───────────────────────────────

export interface DemoSectionProps {
  title: string
  description: string
  code?: string
  children: JSX.Element
}

export const DemoSection = (props: DemoSectionProps) => {
  const [showCode, setShowCode] = createSignal(false)

  return (
    <section class="border border-zinc-200/80 rounded-2xl bg-white/80 shadow-sm overflow-hidden backdrop-blur-sm">
      <div class="p-5">
        <div class="mb-4">
          <h2 class="text-sm text-zinc-600 tracking-[0.16em] font-semibold uppercase">
            {props.title}
          </h2>
          <p class="text-sm text-zinc-600 mt-1">{props.description}</p>
        </div>
        {props.children}
      </div>

      <Show when={props.code}>
        <div class="py-1.5 b-t border-zinc-200/80 flex justify-center">
          <button
            type="button"
            class={`text-xs px-3 py-1 rounded-md flex gap-1.5 cursor-pointer transition-colors items-center ${showCode() ? 'bg-zinc-100 text-zinc-700' : 'text-zinc-400 hover:text-zinc-600'}`}
            onClick={() => setShowCode((v) => !v)}
          >
            <span class="text-[10px] font-mono">&lt;/&gt;</span>
            Source
          </button>
        </div>

        <Show when={showCode()}>
          {/* eslint-disable-next-line solid/no-innerhtml -- shiki HTML generated at build time */}
          <div
            class="text-xs leading-relaxed b-t border-zinc-100 overflow-x-auto [&_pre]:(m-0 p-4 bg-transparent)"
            // oxlint-disable-next-line solid/no-innerhtml
            innerHTML={props.code}
          />
        </Show>
      </Show>
    </section>
  )
}

// ── ComponentDocPage ───────────────────────────────────────────────────

interface ComponentMeta {
  name: string
  key: string
  sourcePath: string
  category: string
  description: string
  props: any[]
  variants: any[]
  slots: string[]
  polymorphic: boolean
}

export interface ComponentDocPageProps {
  meta: ComponentMeta
  children: JSX.Element
}

export const ComponentDocPage = (props: ComponentDocPageProps) => (
  <main class="text-zinc-900 p-6 min-h-screen w-full from-stone-100 to-slate-100 via-zinc-50 bg-gradient-to-br sm:p-10">
    <div class="mx-auto flex flex-col gap-6 max-w-5xl">
      <header class="text-white p-6 b-1 b-border border-zinc-200/80 rounded-2xl bg-zinc-900 shadow-lg sm:p-8">
        <div class="flex flex-wrap gap-2 items-center">
          <p class="text-sm text-zinc-300 tracking-[0.22em] uppercase">{props.meta.category}</p>
          <Show when={props.meta.polymorphic}>
            <span class="text-[10px] text-zinc-300 tracking-wider px-1.5 py-0.5 rounded bg-zinc-700 uppercase">
              polymorphic
            </span>
          </Show>
        </div>
        <h1 class="text-2xl font-semibold mt-2 sm:text-3xl">{props.meta.name}</h1>
        <Show when={props.meta.description}>
          <p class="text-sm text-zinc-300 mt-2 max-w-2xl sm:text-base">{props.meta.description}</p>
        </Show>
        <p class="text-xs text-zinc-500 font-mono mt-3">{props.meta.sourcePath}</p>
      </header>

      {props.children}

      <Show when={props.meta.props.length > 0}>
        <section class="p-5 border border-zinc-200/80 rounded-2xl bg-white/80 shadow-sm backdrop-blur-sm">
          <h2 class="text-sm text-zinc-600 tracking-[0.16em] font-semibold mb-4 uppercase">
            Props
          </h2>
          <PropsTable props={props.meta.props} />
        </section>
      </Show>

      <Show when={props.meta.slots.length > 0}>
        <section class="p-5 border border-zinc-200/80 rounded-2xl bg-white/80 shadow-sm backdrop-blur-sm">
          <h2 class="text-sm text-zinc-600 tracking-[0.16em] font-semibold mb-3 uppercase">
            Slots
          </h2>
          <div class="flex flex-wrap gap-1.5">
            <For each={props.meta.slots}>
              {(slot) => (
                <span class="text-xs text-zinc-600 font-mono px-2 py-1 rounded-md bg-zinc-100">
                  {slot}
                </span>
              )}
            </For>
          </div>
        </section>
      </Show>
    </div>
  </main>
)
