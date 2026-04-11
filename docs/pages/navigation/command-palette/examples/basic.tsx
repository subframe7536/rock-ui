import { CommandPalette } from '@src'
import type { CommandPaletteT } from '@src'

export function Basic() {
  const BASIC_GROUPS: CommandPaletteT.Item[] = [
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
    {
      id: 'navigation',
      label: 'Navigation',
      children: [
        { value: 'dashboard', label: 'Dashboard', icon: 'i-lucide-layout-dashboard' },
        { value: 'settings', label: 'Settings', icon: 'i-lucide-settings', suffix: 'Preferences' },
        { value: 'profile', label: 'Profile', icon: 'i-lucide-user', disabled: true },
        { value: 'setting', label: 'Setting1', icon: 'i-lucide-settings', suffix: 'Preferences' },
        { value: 'setting', label: 'Setting2', icon: 'i-lucide-settings', suffix: 'Preferences' },
        { value: 'setting', label: 'Setting3', icon: 'i-lucide-settings', suffix: 'Preferences' },
        { value: 'setting', label: 'Setting3', icon: 'i-lucide-settings', suffix: 'Preferences' },
        { value: 'setting', label: 'Setting3', icon: 'i-lucide-settings', suffix: 'Preferences' },
        { value: 'setting', label: 'Setting3', icon: 'i-lucide-settings', suffix: 'Preferences' },
        { value: 'setting', label: 'Setting3', icon: 'i-lucide-settings', suffix: 'Preferences' },
        { value: 'setting', label: 'Setting10', icon: 'i-lucide-settings', suffix: 'Preferences' },
      ],
    },
  ]

  return (
    <div class="b-1 b-border rounded-lg w-lg shadow-lg overflow-hidden">
      <CommandPalette items={BASIC_GROUPS} />
    </div>
  )
}
