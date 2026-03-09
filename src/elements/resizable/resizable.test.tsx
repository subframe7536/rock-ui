import { fireEvent, render } from '@solidjs/testing-library'
import { createSignal } from 'solid-js'
import { createStore } from 'solid-js/store'
import { beforeAll, afterAll, describe, expect, test, vi } from 'vitest'

import { Resizable } from './resizable'

if (!(globalThis as Record<string, unknown>).ResizeObserver) {
  ;(globalThis as Record<string, unknown>).ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
}

function createRect(input: { top: number; right: number; bottom: number; left: number }): DOMRect {
  const { top, right, bottom, left } = input

  return {
    x: left,
    y: top,
    width: right - left,
    height: bottom - top,
    top,
    right,
    bottom,
    left,
    toJSON: () => ({}),
  } as DOMRect
}

function setRect(element: Element, rect: DOMRect): void {
  Object.defineProperty(element, 'getBoundingClientRect', {
    configurable: true,
    value: () => rect,
  })
}

const defaultRect = createRect({ top: 0, right: 1000, bottom: 600, left: 0 })
const originalGetBoundingClientRect = HTMLElement.prototype.getBoundingClientRect

beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, 'getBoundingClientRect', {
    configurable: true,
    value() {
      return defaultRect
    },
  })
})

afterAll(() => {
  Object.defineProperty(HTMLElement.prototype, 'getBoundingClientRect', {
    configurable: true,
    value: originalGetBoundingClientRect,
  })
})

describe('Resizable', () => {
  test('renders panels and auto inserts handles between panels', () => {
    const screen = render(() => (
      <Resizable panels={[{ content: 'Left' }, { content: 'Center' }, { content: 'Right' }]} />
    ))

    const panels = screen.container.querySelectorAll('[data-slot="panel"]')
    const handles = screen.container.querySelectorAll('[data-slot="divider"]')

    expect(panels).toHaveLength(3)
    expect(handles).toHaveLength(2)
    expect(handles[0]?.getAttribute('role')).toBe('separator')
  })

  test('supports vertical orientation classes', () => {
    const screen = render(() => (
      <Resizable orientation="vertical" panels={[{ content: 'Top' }, { content: 'Bottom' }]} />
    ))

    const root = screen.container.querySelector('[data-slot="root"]')
    const handle = screen.container.querySelector('[data-slot="divider"]')

    expect(root?.getAttribute('data-orientation')).toBe('vertical')
    expect(root?.className).toContain('flex-col')
    expect(handle?.className).toContain('cursor-row-resize')
  })

  test('keeps dividers visible but disables all interactions from root config', async () => {
    const onResize = vi.fn()

    const screen = render(() => (
      <Resizable
        disable
        onResize={onResize}
        panels={[{ content: 'One' }, { content: 'Two' }, { content: 'Three' }]}
      />
    ))

    const handles = screen.container.querySelectorAll('[data-slot="divider"]')
    expect(handles).toHaveLength(2)
    expect(handles[0]?.getAttribute('aria-disabled')).toBe('true')
    expect(handles[0]?.getAttribute('tabindex')).toBe('-1')

    const handle = handles[0] as HTMLElement
    await fireEvent.mouseEnter(handle)
    expect(handle.getAttribute('data-active')).toBeNull()

    await fireEvent.keyDown(handle, { key: 'ArrowRight' })
    await fireEvent.pointerDown(handle, { pointerId: 1, clientX: 0, clientY: 0 })
    await fireEvent.pointerMove(window, { pointerId: 1, clientX: 100, clientY: 0 })
    await fireEvent.pointerUp(window, { pointerId: 1, clientX: 100, clientY: 0 })

    expect(onResize).not.toHaveBeenCalled()
    expect(handle.getAttribute('data-dragging')).toBeNull()
  })

  test('applies class overrides and supports root-level custom handle rendering', () => {
    const screen = render(() => (
      <Resizable
        renderHandle={<span data-slot="custom-handle-icon" class="i-lucide-grip-vertical" />}
        classes={{
          root: 'root-override',
          panel: 'panel-override',
          divider: 'divider-override',
          handle: 'handle-override',
        }}
        panels={[{ content: 'A', class: 'panel-a' }, { content: 'B' }, { content: 'C' }]}
      />
    ))

    const root = screen.container.querySelector('[data-slot="root"]')
    const panels = screen.container.querySelectorAll('[data-slot="panel"]')
    const handles = screen.container.querySelectorAll('[data-slot="divider"]')
    const handleInners = screen.container.querySelectorAll('[data-slot="handle"]')
    const customHandleIcons = screen.container.querySelectorAll('[data-slot="custom-handle-icon"]')

    expect(root?.className).toContain('root-override')
    expect(panels[0]?.className).toContain('panel-override')
    expect(panels[0]?.className).toContain('panel-a')
    expect(handles[0]?.className).toContain('divider-override')
    expect(handleInners[0]?.className).toContain('handle-override')
    expect(handles).toHaveLength(2)
    expect(handleInners).toHaveLength(2)
    expect(customHandleIcons).toHaveLength(2)
  })

  test('emits keyboard resize lifecycle in controlled mode with px payloads', async () => {
    const events: Array<{ type: 'start' | 'resize' | 'end'; sizes: number[] }> = []

    const screen = render(() => {
      const [sizes, setSizes] = createSignal([500, 500])

      return (
        <Resizable
          onResizeStart={(nextSizes) => events.push({ type: 'start', sizes: nextSizes })}
          onResize={(nextSizes) => {
            events.push({ type: 'resize', sizes: nextSizes })
            setSizes(nextSizes)
          }}
          onResizeEnd={(nextSizes) => events.push({ type: 'end', sizes: nextSizes })}
          panels={[
            { content: 'Left', minSize: '20%', size: sizes()[0] },
            { content: 'Right', minSize: '20%', size: sizes()[1] },
          ]}
        />
      )
    })

    const handle = screen.container.querySelector('[data-slot="divider"]') as HTMLElement
    await fireEvent.keyDown(handle, { key: 'ArrowRight' })

    expect(events.map((event) => event.type)).toEqual(['start', 'resize', 'end'])
    expect(events[0]?.sizes).toEqual([500, 500])
    expect(events[1]?.sizes[0]).toBeCloseTo(600, 3)
    expect(events[1]?.sizes[1]).toBeCloseTo(400, 3)
    expect(events[2]?.sizes).toEqual(events[1]?.sizes)

    const panels = screen.container.querySelectorAll('[data-slot="panel"]')
    expect((panels[0] as HTMLDivElement).style.flexBasis).toBe('60%')
    expect((panels[1] as HTMLDivElement).style.flexBasis).toBe('40%')
  })

  test('does not emit resize lifecycle when a keyboard interaction cannot change sizes', async () => {
    const onResizeStart = vi.fn()
    const onResize = vi.fn()
    const onResizeEnd = vi.fn()

    const screen = render(() => (
      <Resizable
        keyboardDelta={0}
        onResizeStart={onResizeStart}
        onResize={onResize}
        onResizeEnd={onResizeEnd}
        panels={[
          { content: 'Left', minSize: '20%', size: 200 },
          { content: 'Right', minSize: '20%', size: 800 },
        ]}
      />
    ))

    const handle = screen.container.querySelector('[data-slot="divider"]') as HTMLElement
    await fireEvent.keyDown(handle, { key: 'ArrowLeft' })

    expect(onResizeStart).not.toHaveBeenCalled()
    expect(onResize).not.toHaveBeenCalled()
    expect(onResizeEnd).not.toHaveBeenCalled()
  })

  test('updates controlled panel sizes from pointer dragging with px payloads', async () => {
    const events: Array<{ type: 'start' | 'resize' | 'end'; sizes: number[] }> = []

    const screen = render(() => {
      const [sizes, setSizes] = createSignal([400, 600])

      return (
        <Resizable
          onResizeStart={(nextSizes) => events.push({ type: 'start', sizes: nextSizes })}
          onResize={(nextSizes) => {
            events.push({ type: 'resize', sizes: nextSizes })
            setSizes(nextSizes)
          }}
          onResizeEnd={(nextSizes) => events.push({ type: 'end', sizes: nextSizes })}
          panels={[
            { content: 'Left', minSize: '20%', size: sizes()[0] },
            { content: 'Right', minSize: '20%', size: sizes()[1] },
          ]}
        />
      )
    })

    const handle = screen.container.querySelector('[data-slot="divider"]') as HTMLElement
    await fireEvent.pointerDown(handle, { pointerId: 1, clientX: 0, clientY: 0 })
    await fireEvent.pointerMove(window, { pointerId: 1, clientX: 100, clientY: 0 })
    await fireEvent.pointerUp(window, { pointerId: 1, clientX: 100, clientY: 0 })

    expect(events.map((event) => event.type)).toEqual(['start', 'resize', 'end'])
    expect(events[0]?.sizes).toEqual([400, 600])
    expect(events[1]?.sizes[0]).toBeCloseTo(500, 3)
    expect(events[1]?.sizes[1]).toBeCloseTo(500, 3)
    expect(events[2]?.sizes[0]).toBeGreaterThan(0)
    expect(events[2]?.sizes[1]).toBeGreaterThan(0)
  })

  test('supports controlled dragging when onResize mutates an existing panel list', async () => {
    const onResize = vi.fn()

    const screen = render(() => {
      const [panels, setPanels] = createStore([
        { content: 'Left', minSize: '20%' as const, size: 400 },
        { content: 'Right', minSize: '20%' as const, size: 600 },
      ])

      return (
        <Resizable
          onResize={(nextSizes) => {
            onResize(nextSizes)
            nextSizes.forEach((nextSize, index) => setPanels(index, 'size', nextSize))
          }}
          panels={panels}
        />
      )
    })

    const handle = screen.container.querySelector('[data-slot="divider"]') as HTMLElement
    await fireEvent.pointerDown(handle, { pointerId: 1, clientX: 0, clientY: 0 })
    await fireEvent.pointerMove(window, { pointerId: 1, clientX: 100, clientY: 0 })
    await fireEvent.pointerUp(window, { pointerId: 1, clientX: 100, clientY: 0 })

    const nextSizes = onResize.mock.calls.at(-1)?.[0] as number[] | undefined
    expect(onResize).toHaveBeenCalled()
    expect(nextSizes?.[0]).toBeCloseTo(500, 3)
    expect(nextSizes?.[1]).toBeCloseTo(500, 3)
  })

  test('supports mixed controlled sizes with px numbers and percent strings', () => {
    const screen = render(() => (
      <Resizable
        panels={[{ content: 'A', size: 200 }, { content: 'B', size: '30%' }, { content: 'C' }]}
      />
    ))

    const panels = screen.container.querySelectorAll(
      '[data-slot="panel"]',
    ) as NodeListOf<HTMLDivElement>
    expect(panels[0]?.style.flexBasis).toBe('20%')
    expect(panels[1]?.style.flexBasis).toBe('30%')
    expect(panels[2]?.style.flexBasis).toBe('50%')
  })

  test('toggles the nearest collapsible panel with Enter and emits resize lifecycle', async () => {
    const events: Array<{ type: 'start' | 'resize' | 'end'; sizes: number[] }> = []

    const screen = render(() => (
      <Resizable
        onResizeStart={(nextSizes) => events.push({ type: 'start', sizes: nextSizes })}
        onResize={(nextSizes) => events.push({ type: 'resize', sizes: nextSizes })}
        onResizeEnd={(nextSizes) => events.push({ type: 'end', sizes: nextSizes })}
        panels={[
          {
            content: 'Sidebar',
            initialSize: '30%',
            minSize: '20%',
            collapsible: true,
            collapsedSize: 0,
            collapseThreshold: '5%',
          },
          { content: 'Content', initialSize: '70%', minSize: '20%' },
        ]}
      />
    ))

    const handle = screen.container.querySelector('[data-slot="divider"]') as HTMLElement
    await fireEvent.keyDown(handle, { key: 'Enter' })

    expect(events.map((event) => event.type)).toEqual(['start', 'resize', 'end'])
    expect(events[0]?.sizes).toEqual([300, 700])
    expect(events[1]?.sizes[0]).toBeCloseTo(0, 3)
    expect(events[1]?.sizes[1]).toBeCloseTo(1000, 3)

    const panels = screen.container.querySelectorAll('[data-slot="panel"]')
    expect(panels[0]?.getAttribute('data-collapsed')).toBe('')
  })

  test('supports nested resizable panels and root-level intersection config', async () => {
    const screen = render(() => (
      <Resizable
        renderHandle
        intersection
        panels={[
          { content: 'Outer Left' },
          {
            content: (
              <Resizable
                orientation="vertical"
                renderHandle
                intersection
                panels={[{ content: 'Inner Top' }, { content: 'Inner Bottom' }]}
              />
            ),
          },
        ]}
      />
    ))

    const handles = screen.container.querySelectorAll('[data-slot="divider"]')
    const [outerHandle, innerHandle] = Array.from(handles) as HTMLDivElement[]

    setRect(outerHandle, createRect({ top: 0, right: 101, bottom: 200, left: 100 }))
    setRect(innerHandle, createRect({ top: 80, right: 220, bottom: 81, left: 101 }))

    const { refreshResizableHandleIntersections } = await import('./hook/manager')
    refreshResizableHandleIntersections()
    await Promise.resolve()

    const crossTargets = screen.container.querySelectorAll('[data-slot="cross-target"]')
    expect(crossTargets.length).toBeGreaterThan(0)
    const hasEdgeTarget = Array.from(crossTargets).some(
      (target) =>
        target.hasAttribute('data-resizable-handle-start-target') ||
        target.hasAttribute('data-resizable-handle-end-target'),
    )
    expect(hasEdgeTarget).toBe(true)
  })

  test('does not show cross targets when the root handle system is disabled', async () => {
    const screen = render(() => (
      <Resizable
        disable
        renderHandle
        intersection
        panels={[
          { content: 'Outer Left' },
          {
            content: (
              <Resizable
                orientation="vertical"
                renderHandle
                intersection
                panels={[{ content: 'Inner Top' }, { content: 'Inner Bottom' }]}
              />
            ),
          },
        ]}
      />
    ))

    const handles = screen.container.querySelectorAll('[data-slot="divider"]')
    const [outerHandle, innerHandle] = Array.from(handles) as HTMLDivElement[]

    setRect(outerHandle, createRect({ top: 0, right: 101, bottom: 200, left: 100 }))
    setRect(innerHandle, createRect({ top: 80, right: 220, bottom: 81, left: 101 }))

    const { refreshResizableHandleIntersections } = await import('./hook/manager')
    refreshResizableHandleIntersections()
    await Promise.resolve()

    expect(screen.container.querySelectorAll('[data-slot="cross-target"]')).toHaveLength(0)
  })

  test('marks all affected handles as active when hovering a cross-target', async () => {
    const screen = render(() => (
      <Resizable
        renderHandle
        intersection
        panels={[
          { content: 'Outer Left' },
          {
            content: (
              <Resizable
                orientation="vertical"
                renderHandle
                intersection
                panels={[{ content: 'Inner Top' }, { content: 'Inner Bottom' }]}
              />
            ),
          },
        ]}
      />
    ))

    const handles = screen.container.querySelectorAll('[data-slot="divider"]')
    const [outerHandle, innerHandle] = Array.from(handles) as HTMLDivElement[]

    setRect(outerHandle, createRect({ top: 0, right: 101, bottom: 200, left: 100 }))
    setRect(innerHandle, createRect({ top: 80, right: 220, bottom: 81, left: 101 }))

    const { refreshResizableHandleIntersections } = await import('./hook/manager')
    refreshResizableHandleIntersections()
    await Promise.resolve()

    const crossTarget = innerHandle.querySelector('[data-slot="cross-target"]') as HTMLElement
    expect(crossTarget).toBeTruthy()
    expect(outerHandle.getAttribute('data-active')).toBeNull()
    expect(innerHandle.getAttribute('data-active')).toBeNull()

    await fireEvent.mouseEnter(crossTarget)
    expect(outerHandle.getAttribute('data-active')).toBe('')
    expect(innerHandle.getAttribute('data-active')).toBe('')

    await fireEvent.mouseLeave(crossTarget)
    expect(outerHandle.getAttribute('data-active')).toBeNull()
    expect(innerHandle.getAttribute('data-active')).toBeNull()
  })

  test('keeps handle index reactive after the panels list changes', async () => {
    const onResize = vi.fn()

    const screen = render(() => {
      const [panelMetas, setPanelMetas] = createSignal([
        { content: 'One', minSize: '20%' as const },
        { content: 'Two', minSize: '20%' as const },
        { content: 'Three', minSize: '20%' as const },
      ])
      const [sizes, setSizes] = createSignal([340, 330, 330])
      const panels = () =>
        panelMetas().map((panel, index) =>
          Object.assign({}, panel, {
            size: sizes()[index],
          }),
        )

      return (
        <div>
          <button
            type="button"
            data-slot="shrink"
            onClick={() => {
              setPanelMetas((previous) => previous.slice(1))
              setSizes([500, 500])
            }}
          >
            Shrink
          </button>
          <Resizable
            onResize={(nextSizes) => {
              onResize(nextSizes)
              setSizes(nextSizes)
            }}
            panels={panels()}
          />
        </div>
      )
    })

    const shrinkButton = screen.container.querySelector('[data-slot="shrink"]') as HTMLButtonElement
    await fireEvent.click(shrinkButton)

    const handles = screen.container.querySelectorAll('[data-slot="divider"]')
    expect(handles).toHaveLength(1)

    const handle = handles[0] as HTMLElement
    await fireEvent.keyDown(handle, { key: 'ArrowRight' })

    const nextSizes = onResize.mock.calls.at(-1)?.[0] as number[] | undefined
    expect(Array.isArray(nextSizes)).toBe(true)
    expect(nextSizes).toHaveLength(2)
    expect(nextSizes?.[0]).toBeCloseTo(600, 3)
    expect(nextSizes?.[1]).toBeCloseTo(400, 3)
  })

  test('updates data-active and data-dragging through hover and drag states', async () => {
    const screen = render(() => <Resizable panels={[{ content: 'Left' }, { content: 'Right' }]} />)

    const handle = screen.container.querySelector('[data-slot="divider"]') as HTMLElement

    expect(handle.getAttribute('data-active')).toBeNull()
    expect(handle.getAttribute('data-dragging')).toBeNull()

    await fireEvent.mouseEnter(handle)
    expect(handle.getAttribute('data-active')).toBe('')

    await fireEvent.mouseLeave(handle)
    expect(handle.getAttribute('data-active')).toBeNull()

    await fireEvent.pointerDown(handle, { pointerId: 1, clientX: 0, clientY: 0 })
    expect(handle.getAttribute('data-active')).toBe('')
    expect(handle.getAttribute('data-dragging')).toBe('')

    await fireEvent.pointerUp(window, { pointerId: 1, clientX: 0, clientY: 0 })
    expect(handle.getAttribute('data-dragging')).toBeNull()
  })
})
