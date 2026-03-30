import { For, Show } from 'solid-js'
import { Dynamic } from 'solid-js/web'

import { Badge, cn } from '../../src'
import {
  DOCS_HEADING_ANCHOR_ARIA_LABEL,
  MARKDOWN_ANCHOR_HEADING_CLASS,
  MARKDOWN_ANCHOR_LINK_CLASS,
} from '../vite-plugin/markdown/const'

import { API_HEADING_PROSE_CLASS, PropsTable } from './props-table'
import type { PropsTableSection } from './props-table'

interface DocsApiReferenceProps {
  model?: DocsApiReferenceModel
}

interface AnchoredHeadingProps {
  id: string
  label: string
  class?: string
  level?: 2 | 3
}

function AnchoredHeading(props: AnchoredHeadingProps) {
  return (
    <Dynamic
      component={`h${props.level || 2}`}
      id={props.id}
      class={cn(MARKDOWN_ANCHOR_HEADING_CLASS, props.class)}
    >
      {props.label}
      <a
        href={`#${props.id}`}
        class={MARKDOWN_ANCHOR_LINK_CLASS}
        aria-label={DOCS_HEADING_ANCHOR_ARIA_LABEL}
      >
        #
      </a>
    </Dynamic>
  )
}

export const DocsApiReference = (props: DocsApiReferenceProps) => {
  return (
    <Show when={props.model}>
      <Show when={props.model?.showSlots}>
        <div class={API_HEADING_PROSE_CLASS}>
          <AnchoredHeading id="api-slots" label="Slots" level={3} />
        </div>
        <div class="flex flex-wrap gap-2">
          <For each={props.model?.slots ?? []}>{(slot) => <Badge>{slot}</Badge>}</For>
        </div>
      </Show>

      <Show when={props.model?.showSections}>
        <PropsTable sections={props.model?.sections ?? []} />
      </Show>
    </Show>
  )
}

export interface DocsApiReferenceModel {
  showSlots: boolean
  slots: string[]
  showSections: boolean
  sections: PropsTableSection[]
}
