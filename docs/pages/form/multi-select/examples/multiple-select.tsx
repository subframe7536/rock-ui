import { MultiSelect } from '@src'
import type { SelectT, MultiSelectT } from '@src'
import { createSignal } from 'solid-js'

export function MultipleSelect() {
  const FRUIT_OPTIONS: SelectT.Item[] = [
    { label: 'Apple', value: 'apple' },
    { label: 'Banana', value: 'banana' },
    { label: 'Cherry', value: 'cherry' },
    { label: 'Date', value: 'date' },
    { label: 'Elderberry', value: 'elderberry', disabled: true },
    { label: 'Forest', value: 'forest', icon: 'i-lucide:braces' },
  ]

  const [multiValue, setMultiValue] = createSignal<MultiSelectT.Value[]>([])

  return (
    <div class="max-w-sm space-y-2">
      <MultiSelect
        options={FRUIT_OPTIONS}
        value={multiValue()}
        onChange={setMultiValue}
        placeholder="Pick fruits..."
        allowClear
        classes={{ control: 'w-lg' }}
      />
      <p class="text-xs text-muted-foreground">Selected: {multiValue().join(', ') || 'none'}</p>
    </div>
  )
}
