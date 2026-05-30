import type { JSX } from 'solid-js'
import { createMemo, For, Show } from 'solid-js'
import { Dynamic } from 'solid-js/web'

import { Badge, Tabs, cn } from '../../src'
import type { PropDoc } from '../vite-plugin/api-doc/types'
import {
  MARKDOWN_ANCHOR_HEADING_CLASS,
  DOCS_HEADING_ANCHOR_ARIA_LABEL,
  MARKDOWN_ANCHOR_LINK_CLASS,
} from '../vite-plugin/markdown/shared'

export interface PropsTableProps {
  sections: PropsTableSection[]
}

export interface InheritedGroupDoc {
  from: string
  props: PropDoc[]
}

export interface ComponentPropsDoc {
  own: PropDoc[]
  inherited: InheritedGroupDoc[]
}

export interface PropsTableSection {
  id: string
  heading: string
  description?: string
  nameColumn?: string
  badges?: string[]
  props: PropDoc[]
  slots?: SlotReferenceDoc[]
  groups?: {
    description: string
    props: PropDoc[]
  }[]
}

export interface SlotReferenceDoc {
  name: string
  cssVariables: PropDoc[]
  dataAttributes: PropDoc[]
  ariaAttributes: PropDoc[]
}

function normalizeType(type: string): string {
  let result = type
  result = result.replaceAll('cls_variant0.', '').replaceAll('_$', '')
  return result
}

function PropRows(tableProps: {
  props: PropDoc[]
  nameColumn?: string
  nameColumnClass?: string
  minimal?: boolean
  class?: string
}): JSX.Element {
  return (
    <div class={cn('mb-6 mt-4 b-1 b-border rounded-lg overflow-x-auto', tableProps.class)}>
      <table class="text-sm m-0 w-full border-collapse">
        <thead>
          <tr class="text-xs text-muted-foreground tracking-wider text-left bg-muted uppercase">
            <th class={cn('font-medium px-3 py-2', tableProps.nameColumnClass)}>
              {tableProps.nameColumn ?? 'Prop'}
            </th>
            <Show when={!tableProps.minimal}>
              <th class="font-medium px-3 py-2">Type</th>
            </Show>
            <Show when={!tableProps.minimal}>
              <th class="font-medium px-3 py-2">Default</th>
            </Show>
            <th class="font-medium px-3 py-2">Description</th>
          </tr>
        </thead>
        <tbody>
          <For each={tableProps.props}>
            {(prop) => (
              <tr class="b-t b-border hover:bg-muted/50">
                <td class="text-xs text-primary font-mono px-3 py-2 whitespace-nowrap">
                  {prop.name}
                  {prop.required ? '*' : ''}
                </td>
                <Show when={!tableProps.minimal}>
                  <td class="px-3 py-2">
                    <code class="text-xs text-muted-foreground px-1.5 py-0.5 rounded bg-muted">
                      {normalizeType(prop.type)}
                    </code>
                  </td>
                </Show>
                <Show when={!tableProps.minimal}>
                  <td class="text-xs text-muted-foreground px-3 py-2">
                    <Show
                      when={prop.defaultValue}
                      fallback={<span class="text-muted-foreground/80">—</span>}
                    >
                      <code class="px-1.5 py-0.5 rounded bg-muted">{prop.defaultValue}</code>
                    </Show>
                  </td>
                </Show>
                <td class="text-muted-foreground px-3 py-2">
                  <Show
                    when={prop.description}
                    fallback={<span class="text-muted-foreground/80">—</span>}
                  >
                    {(description) => (
                      <div
                        // oxlint-disable-next-line subf/solid-no-innerhtml
                        innerHTML={description()}
                      />
                    )}
                  </Show>
                </td>
              </tr>
            )}
          </For>
        </tbody>
      </table>
    </div>
  )
}

function SlotReferencePanel(props: { sectionId: string; slot: SlotReferenceDoc }): JSX.Element {
  const hasMetadata = createMemo(
    () =>
      props.slot.cssVariables.length > 0 ||
      props.slot.dataAttributes.length > 0 ||
      props.slot.ariaAttributes.length > 0,
  )

  return (
    <section>
      <Show
        when={hasMetadata()}
        fallback={
          <p class="text-sm text-muted-foreground mt-3">No attribute metadata for this slot.</p>
        }
      >
        <Show when={props.slot.cssVariables.length > 0}>
          <PropRows
            props={props.slot.cssVariables}
            nameColumn="CSS Variable"
            nameColumnClass="font-bold"
            class="mt-0"
            minimal
          />
        </Show>

        <Show when={props.slot.dataAttributes.length > 0}>
          <PropRows
            props={props.slot.dataAttributes}
            nameColumn="Data Attribute"
            nameColumnClass="font-bold"
            class="mt-0"
            minimal
          />
        </Show>

        <Show when={props.slot.ariaAttributes.length > 0}>
          <PropRows
            props={props.slot.ariaAttributes}
            nameColumn="ARIA Attribute"
            nameColumnClass="font-bold"
            class="mt-0"
            minimal
          />
        </Show>
      </Show>
    </section>
  )
}

export function HeadingWithAnchor(props: {
  id: string
  children: JSX.Element
  level: number
  class?: string
}): JSX.Element {
  const comp = createMemo(() => `h${props.level}`)
  return (
    <Dynamic
      component={comp()}
      id={props.id}
      class={cn(MARKDOWN_ANCHOR_HEADING_CLASS, `docs-${comp()}`, props.class)}
    >
      {props.children}
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

function SectionTableBlock(sectionProps: { section: PropsTableSection }): JSX.Element {
  return (
    <>
      <HeadingWithAnchor id={sectionProps.section.id} level={3}>
        {sectionProps.section.heading}
      </HeadingWithAnchor>

      <Show when={sectionProps.section.description}>
        {(description) => (
          <div
            class="text-sm text-muted-foreground"
            // oxlint-disable-next-line subf/solid-no-innerhtml
            innerHTML={description()}
          />
        )}
      </Show>

      <Show
        when={!sectionProps.section.slots?.length}
        fallback={
          <Tabs
            defaultValue={sectionProps.section.slots?.[0]?.name}
            orientation="vertical"
            variant="pill"
            size="md"
            classes={{
              root: 'mt-6 flex-col gap-4 md:flex-row md:items-start md:gap-8',
              list: 'w-full max-w-none shrink-0 self-start rounded-xl bg-muted/35 p-1.5 md:max-w-52',
              indicator: 'rounded-lg',
              trigger: 'min-h-10 rounded-lg px-3 py-2.5 font-mono text-xs sm:text-sm',
              content: 'min-w-0 flex-1 self-start pt-0',
            }}
            items={(sectionProps.section.slots ?? []).map((slot) => ({
              label: slot.name,
              value: slot.name,
              content: <SlotReferencePanel sectionId={sectionProps.section.id} slot={slot} />,
            }))}
          />
        }
      >
        <Show
          when={!sectionProps.section.badges?.length}
          fallback={
            <div class="mb-6 mt-4 flex flex-wrap gap-2">
              <For each={sectionProps.section.badges ?? []}>
                {(badge) => <Badge>{badge}</Badge>}
              </For>
            </div>
          }
        >
          <Show
            when={sectionProps.section.groups?.length}
            fallback={
              <PropRows
                props={sectionProps.section.props}
                nameColumn={sectionProps.section.nameColumn}
              />
            }
          >
            <For each={sectionProps.section.groups}>
              {(group) => (
                <>
                  <div
                    class="text-sm text-muted-foreground"
                    // oxlint-disable-next-line subf/solid-no-innerhtml
                    innerHTML={group.description}
                  />
                  <PropRows props={group.props} nameColumn={sectionProps.section.nameColumn} />
                </>
              )}
            </For>
          </Show>
        </Show>
      </Show>
    </>
  )
}

interface DocsApiReferenceProps {
  model?: DocsApiReferenceModel
}

export const DocsApiReference = (props: DocsApiReferenceProps) => {
  return (
    <>
      <HeadingWithAnchor id="api-ref" level={2}>
        API Reference
      </HeadingWithAnchor>
      <Show when={(props.model?.sections?.length ?? 0) > 0}>
        <For each={props.model?.sections ?? []}>
          {(section) => <SectionTableBlock section={section} />}
        </For>
      </Show>
    </>
  )
}

export interface DocsApiReferenceModel {
  sections: PropsTableSection[]
}
