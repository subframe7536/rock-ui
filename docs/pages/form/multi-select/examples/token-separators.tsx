import { MultiSelect } from '@src'
import type { SelectT, MultiSelectT } from '@src'
import { createSignal } from 'solid-js'

export function TokenSeparators() {
  const FRUIT_OPTIONS: SelectT.Item[] = [
    { label: 'Apple', value: 'apple' },
    { label: 'Banana', value: 'banana' },
    { label: 'Cherry', value: 'cherry' },
    { label: 'Date', value: 'date' },
    { label: 'Elderberry', value: 'elderberry', disabled: true },
    { label: 'Forest', value: 'forest', icon: 'i-lucide:braces' },
  ]

  const [tagValues, setTagValues] = createSignal<MultiSelectT.Value[]>([])

  return (
    <div class="max-w-sm space-y-2">
      <MultiSelect
        search
        options={FRUIT_OPTIONS}
        value={tagValues()}
        onChange={setTagValues}
        tokenSeparators={[' ']}
        placeholder="Type text and press Space..."
      />
      <p class="text-xs text-muted-foreground">Tags: {tagValues().join(', ') || 'none'}</p>
    </div>
  )
}
