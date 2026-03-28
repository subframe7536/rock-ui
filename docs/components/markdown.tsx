import type { Component } from 'solid-js'
import { For, Show, createSignal, onCleanup, onMount } from 'solid-js'
import { Dynamic } from 'solid-js/web'

import { Badge, Button, Tabs, cn } from '../../src'
import type { ItemsDoc } from '../vite-plugin/api-doc/types'
import {
  MARKDOWN_ANCHOR_HEADING_CLASS,
  MARKDOWN_ANCHOR_LINK_CLASS,
} from '../vite-plugin/markdown/const'
import { docsWidgetMap } from '../widgets'

import { API_HEADING_PROSE_CLASS, PropsTable } from './props-table'
import type { ComponentPropsDoc, PropsTableSection } from './props-table'
import { ShikiCodeBlock } from './shiki-code-block'

interface ComponentIndexEntry {
  name: string
  key: string
  category: string
  description?: string
  sourcePath?: string
  polymorphic: boolean
}

export interface ExamplePageApiDoc {
  component: ComponentIndexEntry
  slots: string[]
  props: ComponentPropsDoc
  items?: ItemsDoc
}

interface MarkdownRenderSegment {
  type: 'markdown'
  html: string
}

interface ExampleRenderSegment {
  type: 'example'
  component: Component
  code?: string
}

interface WidgetRenderSegment {
  type: 'widget'
  widgetName: string
  props?: Record<string, unknown>
}

interface CodeTabsRenderSegment {
  type: 'code-tabs'
  items: {
    label: string
    value: string
    html: string
  }[]
}

type RenderSegment =
  | MarkdownRenderSegment
  | ExampleRenderSegment
  | WidgetRenderSegment
  | CodeTabsRenderSegment

export interface RenderExampleMarkdownPageInput {
  componentKey?: string
  apiDoc?: ExamplePageApiDoc
  kobalteHref?: string
  extraApiDocs?: ExamplePageApiDoc[]
  onThisPageEntries?: OnThisPageEntry[]
  segments: RenderSegment[]
}

const GITHUB_SOURCE_BASE_URL = 'https://github.com/subframe7536/moraine/blob/main'

function toAnchorSlug(value: string): string {
  return (
    value
      .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
      .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase() || 'section'
  )
}

interface AnchoredHeadingProps {
  id: string
  label: string
  class: string
  level?: 1 | 2
}

interface OnThisPageEntry {
  id: string
  label: string
  level: number
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
        aria-label={`Link to ${props.label}`}
      >
        #
      </a>
    </Dynamic>
  )
}

function getOnThisPageIndentStyle(level: number) {
  const indentLevel = Math.max(0, level - 1)
  return { 'padding-inline-start': `${indentLevel * 0.75}rem` }
}

function decodeHashAnchor(hash: string): string {
  if (!hash) {
    return ''
  }
  try {
    return decodeURIComponent(hash)
  } catch {
    return hash
  }
}

function createInheritedSections(
  inheritedGroups: ComponentPropsDoc['inherited'],
  idPrefix: string,
): PropsTableSection[] {
  const slugCounter = new Map<string, number>()
  const sections: PropsTableSection[] = []

  for (const group of inheritedGroups) {
    const baseSlug = toAnchorSlug(group.from)
    const nextCount = (slugCounter.get(baseSlug) ?? 0) + 1
    slugCounter.set(baseSlug, nextCount)

    sections.push({
      id: `${idPrefix}${baseSlug}${nextCount === 1 ? '' : `-${nextCount}`}`,
      heading: `Inherited from ${group.from}`,
      props: group.props,
    })
  }

  return sections
}

export function Markdown(input: RenderExampleMarkdownPageInput) {
  const component = () => input.apiDoc?.component
  const propsDoc = () => input.apiDoc?.props ?? { own: [], inherited: [] }
  const itemsDoc = () => input.apiDoc?.items
  const slots = () => input.apiDoc?.slots ?? []
  const extraApiDocs = () => input.extraApiDocs ?? []
  const onThisPageEntries = () => input.onThisPageEntries ?? []
  const [activeOnThisPageId, setActiveOnThisPageId] = createSignal('')

  const hasProps = (data: ComponentPropsDoc, items?: ItemsDoc) => {
    return data.own.length > 0 || data.inherited.length > 0 || Boolean(items)
  }
  const hasMainSlots = () => slots().length > 0
  const hasMainProps = () => propsDoc().own.length > 0
  const hasMainItems = () => Boolean(itemsDoc())
  const hasMainInherited = () => propsDoc().inherited.length > 0
  const hasMainApiReference = () =>
    hasMainSlots() || hasMainProps() || hasMainItems() || hasMainInherited()
  const mainPropSections = (): PropsTableSection[] => {
    const sections: PropsTableSection[] = []
    const currentItemsDoc = itemsDoc()

    if (hasMainProps()) {
      sections.push({
        id: 'api-props',
        heading: 'Props',
        props: propsDoc().own,
      })
    }

    if (hasMainItems()) {
      sections.push({
        id: 'api-items',
        heading: 'Items',
        description: currentItemsDoc?.description,
        props: currentItemsDoc?.props ?? [],
      })
    }

    if (hasMainInherited()) {
      sections.push(...createInheritedSections(propsDoc().inherited, 'api-inherited-'))
    }

    return sections
  }

  const shouldShowHeader = () => Boolean(component() || input.componentKey)
  const pageTitle = () => component()?.name ?? input.componentKey
  const githubSourceHref = () => {
    const sourcePath = component()?.sourcePath
    return sourcePath ? `${GITHUB_SOURCE_BASE_URL}/${sourcePath}` : undefined
  }

  const scrollToAnchor = () => {
    const hash = decodeHashAnchor(location.hash.slice(1))
    if (!hash) {
      return true
    }

    const target = document.getElementById(hash)
    if (!target) {
      return false
    }
    target.scrollIntoView?.()
    return true
  }

  const syncActiveIdWithHash = () => {
    const hash = decodeHashAnchor(location.hash.slice(1))
    if (!hash) {
      setActiveOnThisPageId(onThisPageEntries()[0]?.id ?? '')
      return
    }

    setActiveOnThisPageId(hash)
  }

  onMount(() => {
    syncActiveIdWithHash()
    scrollToAnchor()

    const scrollRoot = document.querySelector<HTMLElement>('[data-docs-scroll-root="true"]')
    const observer =
      typeof IntersectionObserver === 'function' && onThisPageEntries().length > 0
        ? new IntersectionObserver(
            (entries) => {
              const visibleEntry = entries
                .filter((entry) => entry.isIntersecting)
                .sort(
                  (left, right) => left.boundingClientRect.top - right.boundingClientRect.top,
                )[0]
              if (!visibleEntry?.target.id) {
                return
              }
              setActiveOnThisPageId(visibleEntry.target.id)
            },
            {
              root: scrollRoot ?? null,
              rootMargin: '-20% 0px -65% 0px',
              threshold: [0, 1],
            },
          )
        : null

    if (observer) {
      for (const entry of onThisPageEntries()) {
        const target = document.getElementById(entry.id)
        if (target) {
          observer.observe(target)
        }
      }
    }

    const handleHashChange = () => {
      scrollToAnchor()
      syncActiveIdWithHash()
    }

    window.addEventListener('hashchange', handleHashChange)
    onCleanup(() => {
      window.removeEventListener('hashchange', handleHashChange)
      observer?.disconnect()
    })
  })

  const renderSegment = (segment: RenderSegment) => {
    switch (segment.type) {
      case 'markdown':
        return (
          <div
            class="max-w-none prose prose-neutral prose-headings:(text-foreground font-semibold mb-3 mt-8) prose-p:(text-muted-foreground leading-6) prose-pre:(b-1 b-border rounded-xl bg-muted) dark:prose-invert"
            // oxlint-disable-next-line solid/no-innerhtml
            innerHTML={segment.html}
          />
        )
      case 'example':
        return (
          <section class="b-1 b-border rounded-2xl bg-background shadow-sm overflow-hidden">
            <div class="p-6 flex items-center justify-center">
              <Dynamic component={segment.component} />
            </div>
            <Show when={segment.code}>
              <ShikiCodeBlock html={segment.code} class="border-t border-border bg-muted/70" />
            </Show>
          </section>
        )
      case 'widget': {
        const Widget = docsWidgetMap[segment.widgetName]

        return (
          <Show
            when={Widget}
            fallback={
              <div class="text-sm text-muted-foreground p-4 b-1 b-border rounded-xl border-dashed">
                Widget not found: {segment.widgetName}
              </div>
            }
          >
            {(w) => <Dynamic component={w()} {...segment.props} />}
          </Show>
        )
      }
      case 'code-tabs':
        return (
          <Tabs
            defaultValue={segment.items[0]?.value}
            variant="link"
            size="sm"
            classes={{
              list: 'w-fit',
              content: 'pt-1 [&_pre]:rounded-lg',
              trigger: 'flex-none',
            }}
            items={segment.items.map((item) => ({
              label: item.label,
              value: item.value,
              content: <ShikiCodeBlock variant="source" html={item.html} />,
            }))}
          />
        )
      default:
        return (
          <div class="text-sm text-muted-foreground p-4 b-1 b-border rounded-xl border-dashed">
            Unsupported segment type
          </div>
        )
    }
  }

  return (
    <main class="text-foreground px-4 py-8 min-h-screen w-full sm:(px-8 py-16)">
      <div class="mx-auto flex gap-8 max-w-7xl items-start">
        <div class="flex-1 min-w-0">
          <div class="mx-auto flex flex-col gap-4 max-w-4xl">
            <Show when={shouldShowHeader()}>
              <header class="text-foreground">
                <div class="flex flex-wrap gap-2 items-center">
                  <Show when={component()?.category}>
                    <p class="text-xs text-muted-foreground tracking-[0.16em] font-semibold uppercase">
                      {component()!.category}
                    </p>
                  </Show>
                  <Show when={input.componentKey}>
                    <p class="text-xs text-muted-foreground font-mono">{input.componentKey}</p>
                  </Show>
                  <Show when={component()?.polymorphic}>
                    <span class="text-xs text-muted-foreground">•</span>
                  </Show>
                  <Show when={component()?.polymorphic}>
                    <p class="text-xs text-muted-foreground font-medium">Polymorphic</p>
                  </Show>
                </div>
                <Show when={pageTitle()}>
                  <p class="text-2xl font-semibold mt-3 sm:text-3xl">{pageTitle()}</p>
                </Show>
                <Show when={component()?.description}>
                  <p class="text-sm text-muted-foreground mt-2 max-w-3xl sm:text-base">
                    {component()!.description}
                  </p>
                </Show>
                <Show when={githubSourceHref() || input.kobalteHref}>
                  <div class="text-xs mt-3 flex flex-wrap gap-3 items-center">
                    <Show when={githubSourceHref()}>
                      {(href) => (
                        <Button
                          as="a"
                          href={href()}
                          target="_blank"
                          rel="noreferrer"
                          variant="outline"
                          leading="i-lucide:github"
                        >
                          GitHub Source
                        </Button>
                      )}
                    </Show>
                    <Show when={input.kobalteHref}>
                      {(href) => (
                        <Button
                          as="a"
                          href={href()}
                          target="_blank"
                          rel="noreferrer"
                          variant="outline"
                          leading="icon-external"
                        >
                          Kobalte
                        </Button>
                      )}
                    </Show>
                  </div>
                </Show>
              </header>
            </Show>

            <For each={input.segments}>{renderSegment}</For>

            <Show when={hasMainApiReference()}>
              <div class={API_HEADING_PROSE_CLASS}>
                <AnchoredHeading id="api-reference" label="API Reference" level={1} class="" />
              </div>

              <Show when={hasMainSlots()}>
                <div class={API_HEADING_PROSE_CLASS}>
                  <AnchoredHeading id="api-slots" label="Slots" class="" />
                </div>
                <div class="flex flex-wrap gap-2">
                  <For each={slots()}>{(slot) => <Badge>{slot}</Badge>}</For>
                </div>
              </Show>

              <Show when={mainPropSections().length > 0}>
                <PropsTable sections={mainPropSections()} />
              </Show>
            </Show>

            <For each={extraApiDocs()}>
              {(doc) => (
                <>
                  <section>
                    <div class="mb-4 flex flex-wrap gap-2 items-center">
                      <AnchoredHeading
                        id={`${toAnchorSlug(doc.component.key || doc.component.name)}-api`}
                        label={`${doc.component.name} API`}
                        class="text-xs text-muted-foreground tracking-[0.16em] font-semibold uppercase"
                      />
                      <p class="text-xs text-muted-foreground font-mono">{doc.component.key}</p>
                    </div>
                    <Show when={doc.component.description}>
                      <p class="text-sm text-muted-foreground max-w-3xl">
                        {doc.component.description}
                      </p>
                    </Show>
                    <Show when={doc.component.sourcePath}>
                      <p class="text-xs text-muted-foreground font-mono mt-2">
                        {doc.component.sourcePath}
                      </p>
                    </Show>
                  </section>

                  <Show when={doc.slots.length > 0}>
                    <AnchoredHeading
                      id={`${toAnchorSlug(doc.component.key || doc.component.name)}-api-slots`}
                      label={`${doc.component.name} Slots`}
                      class="text-xs text-muted-foreground tracking-[0.16em] font-semibold mb-4 uppercase"
                    />
                    <div class="flex flex-wrap gap-2">
                      <For each={doc.slots}>{(slot) => <Badge>{slot}</Badge>}</For>
                    </div>
                  </Show>

                  <Show when={hasProps(doc.props, doc.items)}>
                    <PropsTable
                      sections={[
                        ...(doc.props.own.length > 0
                          ? [
                              {
                                id: `${toAnchorSlug(doc.component.key || doc.component.name)}-api-props`,
                                heading: `${doc.component.name} Props`,
                                props: doc.props.own,
                              } satisfies PropsTableSection,
                            ]
                          : []),
                        ...(doc.items
                          ? [
                              {
                                id: `${toAnchorSlug(doc.component.key || doc.component.name)}-api-items`,
                                heading: `${doc.component.name} Items`,
                                description: doc.items.description,
                                props: doc.items.props,
                              } satisfies PropsTableSection,
                            ]
                          : []),
                        ...createInheritedSections(
                          doc.props.inherited,
                          `${toAnchorSlug(doc.component.key || doc.component.name)}-api-inherited-`,
                        ),
                      ]}
                    />
                  </Show>
                </>
              )}
            </For>
          </div>
        </div>

        <aside class="p-4 shrink-0 max-h-[calc(100vh-4rem)] w-60 hidden self-start top-8 sticky overflow-y-auto xl:block">
          <p class="text-xs text-muted-foreground tracking-[0.16em] font-semibold uppercase">
            On This Page
          </p>
          <Show
            when={onThisPageEntries().length > 0}
            fallback={<p class="text-xs text-muted-foreground mt-3">No sections</p>}
          >
            <nav aria-label="On This Page" class="mt-3 flex flex-col gap-1">
              <For each={onThisPageEntries()}>
                {(entry) => (
                  <a
                    href={`#${entry.id}`}
                    aria-current={activeOnThisPageId() === entry.id ? 'location' : undefined}
                    data-current={activeOnThisPageId() === entry.id ? '' : undefined}
                    class="text-sm text-muted-foreground leading-8 px-2 border border-transparent rounded-md h-8 block transition-colors data-current:(text-foreground border-border bg-accent/60) hover:(text-foreground bg-muted)"
                  >
                    <span class="block truncate" style={getOnThisPageIndentStyle(entry.level)}>
                      {entry.label}
                    </span>
                  </a>
                )}
              </For>
            </nav>
          </Show>
        </aside>
      </div>
    </main>
  )
}
