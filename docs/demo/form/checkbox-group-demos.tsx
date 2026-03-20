import { For, createSignal } from 'solid-js'

import { CheckboxGroup } from '../../../src'
import { DemoPage } from '../../components/demo-page'
import { DemoSection } from '../../components/demo-section'

const ITEMS = [
  { value: 'alpha', label: 'Alpha', description: 'Primary rollout channel' },
  { value: 'beta', label: 'Beta', description: 'Early access channel' },
  { value: 'stable', label: 'Stable', description: 'Production channel' },
]

const SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const
const INDICATORS = ['start', 'end', 'hidden'] as const

export default () => {
  const [value, setValue] = createSignal<string[]>(['beta'])

  return (
    <DemoPage componentKey="checkbox-group">
      <DemoSection
        title="Variant Matrix"
        description="List, card, and table variants with shared items data."
      >
        <div class="gap-4 grid lg:grid-cols-3 sm:grid-cols-2">
          <div class="p-4 b-(1 border) rounded-lg">
            <CheckboxGroup legend="List" items={ITEMS} defaultValue={['alpha']} />
          </div>
          <div class="p-4 b-(1 border) rounded-lg">
            <CheckboxGroup legend="Card" items={ITEMS} variant="card" defaultValue={['beta']} />
          </div>
          <div class="p-4 b-(1 border) rounded-lg">
            <CheckboxGroup
              legend="Table"
              items={ITEMS}
              variant="table"
              orientation="horizontal"
              defaultValue={['stable']}
            />
          </div>
        </div>
      </DemoSection>

      <DemoSection
        title="Orientation + Indicator"
        description="Vertical/horizontal layout with start/end/hidden indicator positions."
      >
        <div class="gap-4 grid lg:grid-cols-3 sm:grid-cols-2">
          <For each={INDICATORS}>
            {(indicator) => (
              <div class="p-4 b-(1 border) rounded-lg space-y-2">
                <p class="text-xs text-muted-foreground">Indicator: {indicator}</p>
                <CheckboxGroup
                  legend="Vertical"
                  items={ITEMS}
                  indicator={indicator}
                  defaultValue={['beta']}
                />
                <CheckboxGroup
                  legend="Horizontal"
                  items={ITEMS}
                  indicator={indicator}
                  orientation="horizontal"
                  defaultValue={['alpha']}
                />
              </div>
            )}
          </For>
        </div>
      </DemoSection>

      <DemoSection title="Sizes" description="Size scale from xs to xl in card variant.">
        <div class="gap-3 grid lg:grid-cols-3 sm:grid-cols-2">
          <For each={SIZES}>
            {(size) => (
              <div class="p-4 b-(1 border) rounded-lg">
                <CheckboxGroup
                  legend={`Size ${size}`}
                  items={ITEMS}
                  variant="card"
                  size={size}
                  defaultValue={size === 'xs' ? ['alpha'] : ['stable']}
                />
              </div>
            )}
          </For>
        </div>
      </DemoSection>

      <DemoSection
        title="Controlled + Disabled Items"
        description="Controlled selected values with per-item disabled state."
      >
        <div class="max-w-2xl space-y-3">
          <CheckboxGroup
            legend="Controlled channels"
            variant="table"
            orientation="horizontal"
            items={[
              ...ITEMS,
              { value: 'legacy', label: 'Legacy', description: 'Frozen channel', disabled: true },
            ]}
            value={value()}
            onChange={setValue}
          />
          <p class="text-xs text-muted-foreground">Selected: {value().join(', ') || 'none'}</p>
        </div>
      </DemoSection>
    </DemoPage>
  )
}
