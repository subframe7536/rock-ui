import { createMemo, createSignal } from 'solid-js'
import { createStore } from 'solid-js/store'

import { Icon, Resizable } from '../../src'

import { DemoPage, DemoSection } from './common/demo-page'

function formatPixelSizes(sizes: number[]): string {
  return sizes.map((size) => `${Math.round(size)}px`).join(' / ')
}

function formatPercentValue(value: number): `${number}%` {
  return `${Number.parseFloat((value * 100).toFixed(2))}%`
}

function createPanel(title: string, description: string, tone: string) {
  return (
    <div class={`p-4 h-full ${tone}`}>
      <p class="text-sm text-zinc-800 font-semibold">{title}</p>
      <p class="text-xs text-zinc-600 mt-1">{description}</p>
    </div>
  )
}

export const ResizableDemos = () => {
  const [controlledPanels, setControlledPanels] = createStore([
    {
      size: 360,
      minSize: '20%' as const,
      content: createPanel(
        'Logs',
        'Drag or use arrow keys to rebalance with px callbacks.',
        'bg-zinc-50',
      ),
    },
    {
      size: 640,
      minSize: '25%' as const,
      content: createPanel(
        'Preview',
        'The external store writes callback px values back into panel.size.',
        'bg-zinc-100',
      ),
    },
  ])
  const controlledSizes = createMemo(() =>
    controlledPanels.map((panel) => (typeof panel.size === 'number' ? panel.size : 0)),
  )
  const [handleIcon, setHandleIcon] = createSignal<'grip' | 'dots'>('grip')
  const [collapseThreshold, setCollapseThreshold] = createSignal(0.08)
  const [collapsedSize, setCollapsedSize] = createSignal(0.06)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = createSignal(false)

  const handleIconClass = createMemo(() =>
    handleIcon() === 'grip' ? 'i-lucide-grip-vertical' : 'i-lucide-grip',
  )

  function handleControlledResize(nextSizes: number[]): void {
    nextSizes.forEach((nextSize, index) => {
      if (Number.isFinite(nextSize)) {
        setControlledPanels(index, 'size', nextSize)
      }
    })
  }

  return (
    <DemoPage
      eyebrow="Rock UI Playground"
      title="Resizable"
      description="Panel splitter layout powered by a panels array, with root-level handles and resize lifecycle callbacks."
    >
      <DemoSection
        title="Basic Horizontal"
        description="Two panels with auto-inserted divider and root-level handle rendering."
      >
        <div class="border border-zinc-200 rounded-xl h-52 overflow-hidden">
          <Resizable
            renderHandle
            panels={[
              {
                initialSize: '40%',
                minSize: '20%',
                content: createPanel('Navigation', 'Left panel can shrink to 20%.', 'bg-zinc-100'),
              },
              {
                initialSize: '60%',
                minSize: '30%',
                content: createPanel(
                  'Content',
                  'Right panel keeps enough width for details.',
                  'bg-white',
                ),
              },
            ]}
          />
        </div>
      </DemoSection>

      <DemoSection
        title="Controlled Sizes"
        description="Use panel.size + onResize to sync external state. The callback now returns pixel sizes."
      >
        <div class="space-y-3">
          <div class="border border-zinc-200 rounded-xl h-48 overflow-hidden">
            <Resizable renderHandle onResize={handleControlledResize} panels={controlledPanels} />
          </div>
          <p class="text-xs text-zinc-600">Current sizes: {formatPixelSizes(controlledSizes())}</p>
        </div>
      </DemoSection>

      <DemoSection
        title="Vertical + Disable"
        description="The root disable prop keeps dividers visible while turning off drag and keyboard resizing."
      >
        <div class="gap-4 grid md:grid-cols-2">
          <div class="space-y-2">
            <p class="text-xs text-zinc-600">
              <code>disable: false</code>
            </p>
            <div class="border border-zinc-200 rounded-xl h-72 overflow-hidden">
              <Resizable
                orientation="vertical"
                renderHandle
                classes={{ divider: 'bg-zinc-300/80' }}
                panels={[
                  {
                    initialSize: '33%',
                    content: createPanel(
                      'Top',
                      'Interactive vertical divider between top and middle.',
                      'bg-zinc-100',
                    ),
                  },
                  {
                    initialSize: '34%',
                    content: createPanel(
                      'Middle',
                      'All dividers remain present because handle settings live on the root now.',
                      'bg-white',
                    ),
                  },
                  {
                    initialSize: '33%',
                    content: createPanel(
                      'Bottom',
                      'Last panel in the vertical stack.',
                      'bg-zinc-50',
                    ),
                  },
                ]}
              />
            </div>
          </div>

          <div class="space-y-2">
            <p class="text-xs text-zinc-600">
              <code>disable: true</code>
            </p>
            <div class="border border-zinc-200 rounded-xl h-72 overflow-hidden">
              <Resizable
                disable
                orientation="vertical"
                renderHandle
                classes={{ divider: 'bg-zinc-300/80 opacity-80' }}
                panels={[
                  {
                    initialSize: '33%',
                    content: createPanel(
                      'Top',
                      'Divider stays visible but is not interactive.',
                      'bg-zinc-100',
                    ),
                  },
                  {
                    initialSize: '34%',
                    content: createPanel(
                      'Middle',
                      'Keyboard and pointer resizing are both disabled.',
                      'bg-white',
                    ),
                  },
                  {
                    initialSize: '33%',
                    content: createPanel('Bottom', 'Useful for read-only layouts.', 'bg-zinc-50'),
                  },
                ]}
              />
            </div>
          </div>
        </div>
      </DemoSection>

      <DemoSection
        title="Nested Panels"
        description="Use the root intersection prop to control whether crossed dividers become draggable."
      >
        <div class="gap-4 grid md:grid-cols-2">
          <div class="space-y-2">
            <p class="text-xs text-zinc-600">
              <code>intersection: true</code>
            </p>
            <div class="border border-zinc-200 rounded-xl h-72 overflow-hidden">
              <Resizable
                renderHandle
                intersection
                panels={[
                  {
                    initialSize: '32%',
                    minSize: '20%',
                    content: createPanel(
                      'Sidebar',
                      'Outer divider can intersect with the nested group.',
                      'bg-zinc-50',
                    ),
                  },
                  {
                    initialSize: '68%',
                    minSize: '35%',
                    content: (
                      <Resizable
                        orientation="vertical"
                        renderHandle
                        intersection
                        panels={[
                          {
                            initialSize: '50%',
                            minSize: '25%',
                            content: createPanel('Editor', 'Nested top panel.', 'bg-white'),
                          },
                          {
                            initialSize: '50%',
                            minSize: '20%',
                            content: createPanel(
                              'Console',
                              'Nested bottom panel with cross drag enabled.',
                              'bg-zinc-100',
                            ),
                          },
                        ]}
                      />
                    ),
                  },
                ]}
              />
            </div>
          </div>

          <div class="space-y-2">
            <p class="text-xs text-zinc-600">
              <code>intersection: false</code>
            </p>
            <div class="border border-zinc-200 rounded-xl h-72 overflow-hidden">
              <Resizable
                renderHandle
                intersection={false}
                panels={[
                  {
                    initialSize: '68%',
                    minSize: '35%',
                    content: (
                      <Resizable
                        orientation="vertical"
                        renderHandle={<Icon name="i-lucide:activity" />}
                        intersection={false}
                        panels={[
                          {
                            initialSize: '50%',
                            minSize: '25%',
                            content: createPanel('Editor', 'Nested top panel.', 'bg-white'),
                          },
                          {
                            initialSize: '50%',
                            minSize: '20%',
                            content: createPanel(
                              'Console',
                              'Nested bottom panel with cross drag disabled.',
                              'bg-zinc-100',
                            ),
                          },
                        ]}
                      />
                    ),
                  },
                  {
                    initialSize: '32%',
                    minSize: '20%',
                    content: createPanel(
                      'Inspector',
                      'Comparison panel for nested intersection behavior.',
                      'bg-zinc-100',
                    ),
                  },
                ]}
              />
            </div>
          </div>
        </div>
      </DemoSection>

      <DemoSection
        title="Custom Handle + Configurable Collapse"
        description="Customize the root handle, animate divider states, and tune collapse thresholds live."
      >
        <div class="space-y-4">
          <div class="flex flex-wrap gap-3 items-end">
            <label class="space-y-1">
              <p class="text-xs text-zinc-600">Handle icon</p>
              <select
                class="text-xs px-2 border border-zinc-300 rounded-md bg-white h-8"
                value={handleIcon()}
                onChange={(event) =>
                  setHandleIcon((event.currentTarget.value as 'grip' | 'dots') ?? 'grip')
                }
              >
                <option value="grip">Grip Vertical</option>
                <option value="dots">Grip Dots</option>
              </select>
            </label>

            <label class="space-y-1">
              <p class="text-xs text-zinc-600">
                collapsedSize: {Math.round(collapsedSize() * 100)}%
              </p>
              <input
                class="accent-sky-600 w-40"
                type="range"
                min="0"
                max="0.2"
                step="0.01"
                value={collapsedSize()}
                onInput={(event) => setCollapsedSize(Number.parseFloat(event.currentTarget.value))}
              />
            </label>

            <label class="space-y-1">
              <p class="text-xs text-zinc-600">
                collapseThreshold: {Math.round(collapseThreshold() * 100)}%
              </p>
              <input
                class="accent-sky-600 w-40"
                type="range"
                min="0.01"
                max="0.3"
                step="0.01"
                value={collapseThreshold()}
                onInput={(event) =>
                  setCollapseThreshold(Number.parseFloat(event.currentTarget.value))
                }
              />
            </label>
          </div>

          <div class="border border-zinc-200 rounded-xl h-56 overflow-hidden">
            <Resizable
              renderHandle={
                <div class={`text-zinc-600 h-3.5 w-3.5 pointer-events-none ${handleIconClass()}`} />
              }
              classes={{
                divider:
                  'w-[6px] rounded-full bg-zinc-300/45 transition-colors duration-200 hover:bg-sky-300/45 data-dragging:bg-sky-500/70',
              }}
              panels={[
                {
                  initialSize: '30%',
                  minSize: '16%',
                  collapsible: true,
                  collapsedSize: formatPercentValue(collapsedSize()),
                  collapseThreshold: formatPercentValue(collapseThreshold()),
                  onCollapse: () => setIsSidebarCollapsed(true),
                  onExpand: () => setIsSidebarCollapsed(false),
                  content: createPanel(
                    'Sidebar',
                    'Press Enter on the divider or drag past the threshold to collapse and expand.',
                    'bg-zinc-50',
                  ),
                },
                {
                  initialSize: '46%',
                  minSize: '24%',
                  content: createPanel(
                    'Editor',
                    'All dividers use the same custom root handle icon in the new API.',
                    'bg-white',
                  ),
                },
                {
                  initialSize: '24%',
                  minSize: '16%',
                  content: createPanel(
                    'Preview',
                    'Hover dividers to see transitions and focus them for keyboard resizing.',
                    'bg-zinc-100',
                  ),
                },
              ]}
            />
          </div>

          <p class="text-xs text-zinc-600">
            Sidebar state: {isSidebarCollapsed() ? 'collapsed' : 'expanded'} · Tip: focus a divider,
            then press <kbd class="px-1 py-0.5 border border-zinc-300 rounded">Enter</kbd> to toggle
            collapse.
          </p>
        </div>
      </DemoSection>
    </DemoPage>
  )
}
