import { For, createSignal } from 'solid-js'

import { Switch } from '../../../src'
import type { SwitchVariantProps } from '../../../src/forms/switch/switch.class'
import { DemoPage } from '../../components/demo-page'
import { DemoSection } from '../../components/demo-section'

type SwitchSizeName = Exclude<SwitchVariantProps['size'], undefined>

const SIZES: SwitchSizeName[] = ['xs', 'sm', 'md', 'lg', 'xl']

export default () => {
  const [checked, setChecked] = createSignal(false)
  const [deploymentGuard, setDeploymentGuard] = createSignal<'enabled' | 'disabled'>('disabled')

  return (
    <DemoPage componentKey="switch">
      <DemoSection
        title="Basic + Controlled"
        description="Uncontrolled and controlled switch with icon slots."
      >
        <div class="flex flex-col gap-3 max-w-xl">
          <Switch
            label="Email alerts"
            description="Uncontrolled"
            defaultChecked
            checkedIcon="i-lucide-bell"
            uncheckedIcon="i-lucide-bell-off"
          />
          <Switch
            label="Deploy protection"
            description={`Current: ${checked() ? 'enabled' : 'disabled'}`}
            checked={checked()}
            onChange={setChecked}
            checkedIcon="i-lucide-shield-check"
            uncheckedIcon="i-lucide-shield"
          />
        </div>
      </DemoSection>

      <DemoSection title="Sizes" description="Switch size scale from xs to xl.">
        <div class="gap-3 grid sm:grid-cols-2">
          <For each={SIZES}>
            {(size) => (
              <Switch
                size={size}
                label={`Size ${size}`}
                description="Size preview"
                defaultChecked={size === 'lg' || size === 'xl'}
              />
            )}
          </For>
        </div>
      </DemoSection>

      <DemoSection
        title="Icon and State Variants"
        description="Loading, disabled, and explicit icon combinations."
      >
        <div class="flex flex-col gap-3 max-w-xl">
          <Switch
            label="Sync in progress"
            description="Loading state"
            loading
            checked
            checkedIcon="i-lucide-check"
            uncheckedIcon="i-lucide-x"
          />
          <Switch
            label="Dark mode"
            description="Custom icons"
            defaultChecked
            checkedIcon="i-lucide-moon-star"
            uncheckedIcon="i-lucide-sun"
          />
          <Switch
            label="Billing lock"
            description="Disabled"
            disabled
            checked
            checkedIcon="i-lucide-lock"
            uncheckedIcon="i-lucide-unlock"
          />
        </div>
      </DemoSection>

      <DemoSection
        title="Custom true/false values"
        description="Map checked state to domain values instead of boolean."
      >
        <div class="max-w-xl space-y-3">
          <Switch<'enabled', 'disabled'>
            label="Deployment gate"
            description="Domain value binding"
            trueValue="enabled"
            falseValue="disabled"
            checked={deploymentGuard()}
            onChange={setDeploymentGuard}
            checkedIcon="i-lucide-check-check"
            uncheckedIcon="i-lucide-x"
          />
          <p class="text-xs text-muted-foreground">Current value: {deploymentGuard()}</p>
        </div>
      </DemoSection>
    </DemoPage>
  )
}
