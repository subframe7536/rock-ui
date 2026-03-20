import { Show } from 'solid-js'
import type { JSX } from 'solid-js'

import { Button, Icon } from '../../src'

// ── DemoSection with source code preview ───────────────────────────────

const COPY_SUCCESS_TIMEOUT_MS = 3000

const wait = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms)
  })

function extractCodeText(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const text = doc.querySelector('pre code')?.textContent ?? doc.body.textContent ?? ''
  return text
}

async function copyCode(html: string): Promise<void> {
  const plainText = extractCodeText(html)

  if (typeof ClipboardItem !== 'undefined') {
    const item = new ClipboardItem({
      'text/plain': new Blob([plainText], { type: 'text/plain' }),
      'text/html': new Blob([html], { type: 'text/html' }),
    })
    await navigator.clipboard.write([item])
    return
  }

  await navigator.clipboard.writeText(plainText).then(() => wait(COPY_SUCCESS_TIMEOUT_MS))
}

export interface DemoSectionProps {
  title: string
  description: string
  code?: string
  children: JSX.Element
}

export const DemoSection = (props: DemoSectionProps) => {
  return (
    <section class="relative">
      <div class="mb-4">
        <h2 class="text-sm text-zinc-600 tracking-[0.16em] font-semibold uppercase">
          {props.title}
        </h2>
        <p class="text-sm text-zinc-600 mt-1">{props.description}</p>
      </div>
      <div class="border border-zinc-200/80 rounded-xl overflow-hidden backdrop-blur-sm">
        <div class="p-6">{props.children}</div>
        <Show when={props.code}>
          <div class="relative">
            <Button
              size="icon-md"
              variant="ghost"
              classes={{ root: 'absolute end-2 top-2' }}
              loadingIcon={false}
              loadingAuto
              onClick={() => copyCode(props.code!)}
            >
              {(state) => <Icon name={state.loading ? 'i-lucide:check' : 'i-lucide:copy'} />}
            </Button>

            {/* eslint-disable-next-line solid/no-innerhtml -- shiki HTML generated at build time */}
            <div
              class="text-xs leading-relaxed b-t border-zinc-100 overflow-x-auto [&_pre]:(m-0 p-4 bg-transparent)"
              // oxlint-disable-next-line solid/no-innerhtml
              innerHTML={props.code}
            />
          </div>
        </Show>
      </div>
    </section>
  )
}
