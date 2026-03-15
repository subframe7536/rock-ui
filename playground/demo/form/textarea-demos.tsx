import { createSignal } from 'solid-js'

import { Textarea } from '../../../src'
import meta from '../../.meta/textarea.json'
import { ComponentDocPage, DemoSection } from '../../components/common/demo-page'

export default () => {
  const [value, setValue] = createSignal('Type here to see autoresize...')

  return (
    <ComponentDocPage meta={meta}>
      <DemoSection title="Basic" description="Textarea with variants and autoresize.">
        <div class="flex flex-col gap-4 max-w-md">
          <Textarea placeholder="Default outline" />
          <Textarea variant="subtle" placeholder="Subtle variant" />
          <Textarea placeholder="Autoresize" autoresize value={value()} onValueChange={setValue} />
        </div>
      </DemoSection>
    </ComponentDocPage>
  )
}
