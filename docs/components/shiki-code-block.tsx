import type { JSX } from 'solid-js'
import { Show } from 'solid-js'

import { IconButton, cn } from '../../src'

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

export interface ShikiCodeBlockProps {
  html?: string
  class?: string
  style?: JSX.CSSProperties
  children?: JSX.Element
}

export const ShikiCodeBlock = (props: ShikiCodeBlockProps) => {
  return (
    <div class={cn('relative', props.class)} style={props.style}>
      <Show
        when={props.html}
        fallback={
          <pre class="text-xs leading-relaxed m-0 p-4 bg-transparent overflow-x-auto">
            <code class="font-mono">{props.children}</code>
          </pre>
        }
      >
        {(html) => (
          <>
            <IconButton
              name="i-lucide:copy"
              loadingIcon="i-lucide:check"
              size="md"
              classes={{
                root: 'absolute end-2 top-2 z-1 text-muted-foreground hover:(bg-muted text-foreground) p-1.5',
              }}
              loadingAuto
              onClick={() => copyCode(html())}
            />

            {/* eslint-disable-next-line solid/no-innerhtml -- shiki HTML generated at build time */}
            <div
              class="text-xs leading-relaxed overflow-x-auto [&_code]:(font-mono) [&_pre]:(m-0 p-4 bg-transparent)"
              // oxlint-disable-next-line solid/no-innerhtml
              innerHTML={html()}
            />
          </>
        )}
      </Show>
    </div>
  )
}
