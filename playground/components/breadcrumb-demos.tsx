import { createSignal } from 'solid-js'

import { Breadcrumb } from '../../src'

import { DemoPage, DemoSection } from './common/demo-page'

const DEFAULT_ITEMS = [
  { label: 'Home', href: '#', icon: 'i-lucide:house' },
  { label: 'Library', href: '#', icon: 'i-lucide:folder' },
  { label: 'Components', href: '#', icon: 'i-lucide:box' },
  { label: 'Breadcrumb', href: '#', icon: 'icon-chevron-right', active: true },
]

export const BreadcrumbDemos = () => {
  const [wrap, setWrap] = createSignal(true)

  return (
    <DemoPage
      eyebrow="Rock UI Playground"
      title="Breadcrumb"
      description="Navigation trails with configurable wrapping, separators, icons, and disabled states."
    >
      <DemoSection title="Default" description="Simple breadcrumb trail with active last item.">
        <Breadcrumb items={DEFAULT_ITEMS} />
      </DemoSection>

      <DemoSection
        title="Custom Separator + Disabled"
        description="Use an alternative separator icon and mark links as disabled."
      >
        <Breadcrumb
          separatorIcon="icon-dot"
          separator=">"
          items={[
            { label: 'Workspace', href: '#', icon: 'i-lucide:briefcase' },
            { label: 'Settings', href: '#', icon: 'i-lucide:settings' },
            { label: 'Danger Zone', href: '#', disabled: true, icon: 'i-lucide:triangle-alert' },
          ]}
        />
      </DemoSection>

      <DemoSection
        title="Wrapping"
        description="Toggle wrapping behavior for long breadcrumb labels."
      >
        <div class="space-y-3">
          <button
            type="button"
            class="text-sm px-3 py-1.5 border border-zinc-300 rounded-md hover:bg-zinc-100"
            onClick={() => setWrap((value) => !value)}
          >
            Wrap: {wrap() ? 'enabled' : 'disabled'}
          </button>

          <div class="max-w-md">
            <Breadcrumb
              wrap={wrap()}
              items={[
                { label: 'Very long section name that can wrap', href: '#' },
                { label: 'Another long nested section title', href: '#' },
                { label: 'Current page with long title', href: '#', active: true },
              ]}
            />
          </div>
        </div>
      </DemoSection>
    </DemoPage>
  )
}
