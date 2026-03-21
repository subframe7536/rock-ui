import { For, createSignal } from 'solid-js'

import { Button, Tabs } from '../../../src'
import { DemoPage } from '../../components/demo-page'
import { DemoSection } from '../../components/demo-section'

const BASE_ITEMS = [
  {
    label: 'Overview',
    value: 'overview',
    icon: 'i-lucide:layout-dashboard',
    content: <p class="text-sm text-foreground">Overview panel content.</p>,
  },
  {
    label: 'Settings',
    value: 'settings',
    icon: 'i-lucide:settings',
    content: <p class="text-sm text-foreground">Settings panel content.</p>,
  },
  {
    label: 'Billing',
    value: 'billing',
    icon: 'i-lucide:credit-card',
    content: <p class="text-sm text-foreground">Billing panel content.</p>,
  },
] as const

const SIZE_OPTIONS = ['xs', 'sm', 'md', 'lg', 'xl'] as const

export default () => {
  const [value, setValue] = createSignal('overview')

  return (
    <DemoPage componentKey="tabs">
      <DemoSection title="Variants" description="Pill and link visual variants for the tab list.">
        <div class="gap-4 grid lg:grid-cols-2">
          <Tabs defaultValue="overview" variant="pill" items={[...BASE_ITEMS]} />
          <Tabs defaultValue="settings" variant="link" items={[...BASE_ITEMS]} />
        </div>
      </DemoSection>

      <DemoSection
        title="Orientation"
        description="Horizontal and vertical orientation with the same items contract."
      >
        <div class="gap-4 grid lg:grid-cols-2">
          <Tabs defaultValue="overview" orientation="horizontal" items={[...BASE_ITEMS]} />
          <Tabs
            defaultValue="settings"
            orientation="vertical"
            classes={{
              root: 'max-w-md',
              list: 'w-40',
            }}
            items={[...BASE_ITEMS]}
          />
        </div>
      </DemoSection>

      <DemoSection title="Sizes" description="Trigger size scale from xs to xl.">
        <div class="space-y-4">
          <For each={SIZE_OPTIONS}>
            {(size) => (
              <div class="space-y-1">
                <p class="text-xs text-muted-foreground tracking-wide uppercase">{size}</p>
                <Tabs
                  size={size}
                  defaultValue="overview"
                  items={[
                    {
                      label: 'Overview',
                      value: 'overview',
                      content: <p class="text-sm text-foreground">Overview</p>,
                    },
                    {
                      label: 'Metrics',
                      value: 'metrics',
                      content: <p class="text-sm text-foreground">Metrics</p>,
                    },
                    {
                      label: 'Activity',
                      value: 'activity',
                      content: <p class="text-sm text-foreground">Activity</p>,
                    },
                  ]}
                />
              </div>
            )}
          </For>
        </div>
      </DemoSection>

      <DemoSection
        title="Controlled + Disabled Items"
        description="Controlled value with disabled tab options and external navigation controls."
      >
        <div class="space-y-3">
          <div class="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => setValue('overview')}>
              Go overview
            </Button>
            <Button size="sm" variant="outline" onClick={() => setValue('settings')}>
              Go settings
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setValue('billing')}>
              Try disabled billing
            </Button>
          </div>

          <Tabs
            value={value()}
            onChange={setValue}
            variant="link"
            items={[
              {
                label: 'Overview',
                value: 'overview',
                content: (
                  <p class="text-sm text-foreground">Overview section with release status.</p>
                ),
              },
              {
                label: 'Settings',
                value: 'settings',
                content: (
                  <p class="text-sm text-foreground">Settings section with environment options.</p>
                ),
              },
              {
                label: 'Billing (Disabled)',
                value: 'billing',
                disabled: true,
                content: (
                  <p class="text-sm text-foreground">This panel is intentionally disabled.</p>
                ),
              },
            ]}
          />
          <p class="text-xs text-muted-foreground">Current tab value: {value()}</p>
        </div>
      </DemoSection>
    </DemoPage>
  )
}
