import { Show } from 'solid-js'
import type { JSX } from 'solid-js'

import { IconButton } from '../../src'

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
    await wait(COPY_SUCCESS_TIMEOUT_MS)
    return
  }

  await navigator.clipboard.writeText(plainText)
  await wait(COPY_SUCCESS_TIMEOUT_MS)
}

export interface DemoSectionProps {
  title: string
  description: string
  code?: string
  children: JSX.Element
}

export const DemoSection = (props: DemoSectionProps) => {
  return (
    <section class="relative space-y-4">
      <div class="space-y-1">
        <h2 class="text-xs text-muted-foreground tracking-[0.18em] font-semibold uppercase">
          {props.title}
        </h2>
        <p class="text-sm text-muted-foreground">{props.description}</p>
      </div>
      <div class="border border-border rounded-2xl bg-background shadow-sm overflow-hidden">
        <div class="p-6 flex items-center justify-center">{props.children}</div>
        <Show when={props.code}>
          <div class="border-t border-border bg-muted/70 relative">
            <IconButton
              name="i-lucide:copy"
              loadingIcon="i-lucide:check"
              size="md"
              classes={{
                root: 'absolute end-2 top-2 z-1 text-muted-foreground hover:(bg-muted text-foreground) p-1.5',
              }}
              loadingAuto
              onClick={() => copyCode(props.code!)}
            />

            {/* eslint-disable-next-line solid/no-innerhtml -- shiki HTML generated at build time */}
            <div
              class="text-xs leading-relaxed overflow-x-auto [&_code]:(font-mono) [&_pre]:(m-0 p-4 bg-transparent)"
              // oxlint-disable-next-line solid/no-innerhtml
              innerHTML={props.code}
            />
          </div>
        </Show>
      </div>
    </section>
  )
}
