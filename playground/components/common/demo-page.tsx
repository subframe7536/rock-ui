import type { JSX } from 'solid-js'

export interface DemoPageProps {
  eyebrow: string
  title: string
  description: string
  children: JSX.Element
}

export const DemoPage = (props: DemoPageProps) => (
  <main class="text-zinc-900 p-6 min-h-screen w-full from-stone-100 to-slate-100 via-zinc-50 bg-gradient-to-br sm:p-10">
    <div class="mx-auto flex flex-col gap-6 max-w-5xl">
      <header class="text-white p-6 border border-zinc-200/80 rounded-2xl bg-zinc-900 shadow-lg sm:p-8">
        <p class="text-sm text-zinc-300 tracking-[0.22em] uppercase">{props.eyebrow}</p>
        <h1 class="text-2xl font-semibold mt-2 sm:text-3xl">{props.title}</h1>
        <p class="text-sm text-zinc-300 mt-2 max-w-2xl sm:text-base">{props.description}</p>
      </header>
      {props.children}
    </div>
  </main>
)

export interface DemoSectionProps {
  title: string
  description: string
  children: JSX.Element
}

export const DemoSection = (props: DemoSectionProps) => (
  <section class="p-5 border border-zinc-200/80 rounded-2xl bg-white/80 shadow-sm backdrop-blur-sm">
    <div class="mb-4">
      <h2 class="text-sm text-zinc-600 tracking-[0.16em] font-semibold uppercase">{props.title}</h2>
      <p class="text-sm text-zinc-600 mt-1">{props.description}</p>
    </div>
    {props.children}
  </section>
)
