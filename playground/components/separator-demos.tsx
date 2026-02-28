import { For } from 'solid-js'

import { Separator } from '../../src'

import { DemoPage, DemoSection } from './common/demo-page'

const TYPES = ['solid', 'dashed', 'dotted'] as const
const SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const

export const SeparatorDemos = () => (
  <DemoPage
    eyebrow="Rock UI Playground"
    title="Separator"
    description="Visual dividers for content grouping with orientation, size, type, and child content."
  >
    <DemoSection title="Types" description="Solid, dashed, and dotted divider styles.">
      <div class="space-y-4">
        <For each={TYPES}>
          {(type) => (
            <div class="space-y-2">
              <p class="text-xs text-zinc-600 tracking-wider uppercase">{type}</p>
              <Separator type={type} />
            </div>
          )}
        </For>
      </div>
    </DemoSection>

    <DemoSection title="Sizes" description="Border thickness variants.">
      <div class="space-y-4">
        <For each={SIZES}>
          {(size) => (
            <div class="space-y-2">
              <p class="text-xs text-zinc-600 tracking-wider uppercase">{size}</p>
              <Separator size={size} />
            </div>
          )}
        </For>
      </div>
    </DemoSection>

    <DemoSection
      title="With Content + Vertical"
      description="Inline content and vertical separators in flexible layouts."
    >
      <div class="space-y-6">
        <Separator>
          <span class="text-xs text-zinc-500">OR</span>
        </Separator>

        <div class="flex gap-4 h-20 items-center">
          <span>Left</span>
          <Separator orientation="vertical" />
          <span>Center</span>
          <Separator orientation="vertical" type="dashed" classes={{ root: 'text-primary' }} />
          <span>Right</span>
        </div>
      </div>
    </DemoSection>
  </DemoPage>
)
