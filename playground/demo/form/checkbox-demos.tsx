import { createSignal } from 'solid-js'

import { Checkbox } from '../../../src'
import meta from '../../.meta/checkbox.json'
import { ComponentDocPage, DemoSection } from '../../components/common/demo-page'

export default () => {
  const [checked, setChecked] = createSignal(true)

  return (
    <ComponentDocPage meta={meta}>
      <DemoSection title="Basic" description="Default and card variants with controlled state.">
        <div class="flex flex-col gap-3 max-w-md">
          <Checkbox
            label="Default style"
            description="Standard checkbox appearance"
            defaultChecked
          />
          <Checkbox
            label="Card variant"
            description="Full-surface card interaction"
            variant="card"
            defaultChecked
          />
          <Checkbox
            label="Controlled"
            description={`Current: ${checked() ? 'checked' : 'unchecked'}`}
            variant="list"
            indicator="end"
            checked={checked()}
            onChange={setChecked}
          />
          <Checkbox label="Disabled" description="Read only" variant="card" disabled />
        </div>
      </DemoSection>
    </ComponentDocPage>
  )
}
