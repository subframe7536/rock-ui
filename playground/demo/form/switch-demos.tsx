import { createSignal } from 'solid-js'

import { Switch } from '../../../src'
import meta from '../../.meta/switch.json'
import { ComponentDocPage, DemoSection } from '../../components/common/demo-page'

export default () => {
  const [checked, setChecked] = createSignal(false)

  return (
    <ComponentDocPage meta={meta}>
      <DemoSection title="Basic" description="Toggle states with icon slots and controlled value.">
        <div class="flex flex-col gap-3 max-w-md">
          <Switch
            label="Email alerts"
            description="Uncontrolled state"
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
    </ComponentDocPage>
  )
}
