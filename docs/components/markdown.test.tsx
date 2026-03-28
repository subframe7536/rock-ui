import { render } from '@solidjs/testing-library'
import { afterEach, describe, expect, test, vi } from 'vitest'

vi.mock('../widgets', () => ({
  docsWidgetMap: {},
}))

import { Markdown } from './markdown'
import { MARKDOWN_ANCHOR_LINK_CLASS } from '../vite-plugin/markdown/const'

class MockIntersectionObserver {
  static instances: MockIntersectionObserver[] = []

  callback: IntersectionObserverCallback
  observed: Element[] = []

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback
    MockIntersectionObserver.instances.push(this)
  }

  observe(target: Element) {
    this.observed.push(target)
  }

  disconnect() {}

  unobserve() {}

  takeRecords(): IntersectionObserverEntry[] {
    return []
  }

  trigger(targetId: string) {
    const target = this.observed.find((item) => item.id === targetId)
    if (!target) {
      return
    }

    this.callback(
      [
        {
          target,
          isIntersecting: true,
          boundingClientRect: target.getBoundingClientRect(),
          intersectionRatio: 1,
          intersectionRect: target.getBoundingClientRect(),
          rootBounds: null,
          time: Date.now(),
        } as IntersectionObserverEntry,
      ],
      this as unknown as IntersectionObserver,
    )
  }
}

const originalIntersectionObserver = globalThis.IntersectionObserver

afterEach(() => {
  MockIntersectionObserver.instances.length = 0
  if (originalIntersectionObserver) {
    globalThis.IntersectionObserver = originalIntersectionObserver
  } else {
    delete (globalThis as { IntersectionObserver?: unknown }).IntersectionObserver
  }
  history.replaceState(null, '', '/')
})

describe('Markdown On This Page', () => {
  test('renders toc from compile-time entries', () => {
    const screen = render(() =>
      Markdown({
        onThisPageEntries: [
          { id: 'intro', label: 'Intro', level: 1 },
          { id: 'usage', label: 'Usage', level: 2 },
        ],
        segments: [{ type: 'markdown', html: '<p>Body</p>' }],
      }),
    )

    expect(screen.getByText('On This Page')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Intro' }).getAttribute('href')).toBe('#intro')
    expect(screen.getByRole('link', { name: 'Usage' }).getAttribute('href')).toBe('#usage')
  })

  test('does not collect runtime headings or inherited text into toc', () => {
    const screen = render(() =>
      Markdown({
        onThisPageEntries: [{ id: 'intro', label: 'Intro', level: 1 }],
        segments: [
          {
            type: 'markdown',
            html: '<h2 id="runtime-heading">Runtime Heading</h2><p>Inherited from Base</p>',
          },
        ],
      }),
    )

    expect(screen.queryByRole('link', { name: 'Runtime Heading' })).toBeNull()
    expect(screen.queryByRole('link', { name: 'Inherited from Base' })).toBeNull()
    expect(screen.getByRole('link', { name: 'Intro' })).toBeTruthy()
  })

  test('renders API Reference h1 and api section h2 headings', () => {
    const screen = render(() =>
      Markdown({
        apiDoc: {
          component: {
            key: 'checkbox',
            name: 'Checkbox',
            category: 'Form',
            polymorphic: false,
          },
          slots: ['root'],
          props: {
            own: [{ name: 'checked', required: false, type: 'boolean' }],
            inherited: [{ from: 'Base', props: [] }],
          },
          items: { props: [] },
        },
        onThisPageEntries: [
          { id: 'api-reference', label: 'API Reference', level: 1 },
          { id: 'api-slots', label: 'Slots', level: 2 },
          { id: 'api-props', label: 'Props', level: 2 },
          { id: 'api-items', label: 'Items', level: 2 },
          { id: 'api-inherited-base', label: 'Inherited from Base', level: 2 },
        ],
        segments: [{ type: 'markdown', html: '<p>Body</p>' }],
      }),
    )

    const apiReferenceHeading = screen.container.querySelector('#api-reference')
    const slotsHeading = screen.container.querySelector('#api-slots')
    const propsHeading = screen.container.querySelector('#api-props')
    const itemsHeading = screen.container.querySelector('#api-items')
    const inheritedHeading = screen.container.querySelector('#api-inherited-base')
    const apiReferenceLink = screen.container.querySelector<HTMLAnchorElement>('#api-reference > a')

    expect(apiReferenceHeading?.tagName).toBe('H1')
    expect(slotsHeading?.tagName).toBe('H2')
    expect(propsHeading?.tagName).toBe('H2')
    expect(itemsHeading?.tagName).toBe('H2')
    expect(inheritedHeading?.tagName).toBe('H2')
    expect(apiReferenceLink?.className).toBe(MARKDOWN_ANCHOR_LINK_CLASS)
  })

  test('hides empty api sections', () => {
    const screen = render(() =>
      Markdown({
        apiDoc: {
          component: {
            key: 'checkbox',
            name: 'Checkbox',
            category: 'Form',
            polymorphic: false,
          },
          slots: [],
          props: {
            own: [],
            inherited: [{ from: 'Base', props: [] }],
          },
        },
        onThisPageEntries: [
          { id: 'api-reference', label: 'API Reference', level: 1 },
          { id: 'api-inherited-base', label: 'Inherited from Base', level: 2 },
        ],
        segments: [{ type: 'markdown', html: '<p>Body</p>' }],
      }),
    )

    expect(screen.container.querySelector('#api-reference')?.tagName).toBe('H1')
    expect(screen.container.querySelector('#api-inherited-base')?.tagName).toBe('H2')
    expect(screen.container.querySelector('#api-slots')).toBeNull()
    expect(screen.container.querySelector('#api-props')).toBeNull()
    expect(screen.container.querySelector('#api-items')).toBeNull()
  })

  test('renders inherited sections without any toggle controls', () => {
    const screen = render(() =>
      Markdown({
        apiDoc: {
          component: {
            key: 'checkbox',
            name: 'Checkbox',
            category: 'Form',
            polymorphic: false,
          },
          slots: [],
          props: {
            own: [],
            inherited: [{ from: 'Base', props: [{ name: 'id', required: false, type: 'string' }] }],
          },
        },
        onThisPageEntries: [{ id: 'api-inherited-base', label: 'Inherited from Base', level: 2 }],
        segments: [{ type: 'markdown', html: '<p>Body</p>' }],
      }),
    )

    expect(screen.container.querySelector('#api-inherited-base')?.textContent).toContain(
      'Inherited from Base',
    )
    expect(screen.queryByRole('button', { name: /Inherited/i })).toBeNull()
  })

  test('updates active toc item for scrollspy and hash', () => {
    globalThis.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver

    const screen = render(() =>
      Markdown({
        onThisPageEntries: [
          { id: 'intro', label: 'Intro', level: 1 },
          { id: 'usage', label: 'Usage', level: 2 },
        ],
        segments: [
          {
            type: 'markdown',
            html: '<h1 id="intro">Intro</h1><h2 id="usage">Usage</h2>',
          },
        ],
      }),
    )

    const observer = MockIntersectionObserver.instances[0]
    observer?.trigger('usage')

    expect(screen.getByRole('link', { name: 'Usage' }).getAttribute('aria-current')).toBe(
      'location',
    )

    history.replaceState(null, '', '/#intro')
    window.dispatchEvent(new Event('hashchange'))

    expect(screen.getByRole('link', { name: 'Intro' }).getAttribute('aria-current')).toBe(
      'location',
    )
  })

  test('shows sticky toc container and empty fallback', () => {
    const screen = render(() =>
      Markdown({
        onThisPageEntries: [],
        segments: [{ type: 'markdown', html: '<p>No headings here.</p>' }],
      }),
    )

    expect(screen.getByText('No sections')).toBeTruthy()
    const tocTitle = screen.getByText('On This Page')
    const aside = tocTitle.closest('aside')
    expect(aside?.className).toContain('sticky')
    expect(aside?.className).toContain('overflow-y-auto')
  })
})
