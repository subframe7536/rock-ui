import { CommandPalette } from '@src'
import type { CommandPaletteT } from '@src'

export function Loading() {
  const BASIC_GROUPS: CommandPaletteT.Items[] = [
    {
      id: 'actions',
      label: 'Actions',
      children: [
        { value: 'new-file', label: 'New File', icon: 'i-lucide-file-plus', kbds: ['⌘', 'N'] },
        { value: 'open-file', label: 'Open File', icon: 'i-lucide-folder-open', kbds: ['⌘', 'O'] },
        { value: 'save', label: 'Save', icon: 'i-lucide-save', kbds: ['⌘', 'S'] },
        {
          value: 'export-pdf',
          label: 'Export as PDF',
          icon: 'i-lucide-file-text',
          description: 'Export current document to PDF',
        },
      ],
    },
  ]

  return (
    <div class="b-1 b-border rounded-lg w-lg shadow-lg overflow-hidden">
      <CommandPalette items={BASIC_GROUPS} loading />
    </div>
  )
}
