import { Button, CommandPalette, Kbd, Popup } from '@src'
import type { CommandPaletteT } from '@src'
import { createSignal, onCleanup, onMount } from 'solid-js'

export function Usage() {
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

  const [paletteOpen, setPaletteOpen] = createSignal(false)

  onMount(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setPaletteOpen(true)
      }
    }
    window.addEventListener('keydown', handler)
    onCleanup(() => window.removeEventListener('keydown', handler))
  })

  return (
    <Popup
      open={paletteOpen()}
      onOpenChange={setPaletteOpen}
      content={
        <CommandPalette
          items={BASIC_GROUPS}
          close
          onClose={() => setPaletteOpen(false)}
          footer={
            <div class="text-xs flex gap-4 items-center justify-between">
              <div class="flex gap-4 items-center">
                <div class="flex gap-2 items-center">
                  <Kbd value={['↑', '↓']} />
                  <span>Navigate</span>
                </div>
                <div class="flex gap-2 items-center">
                  <Kbd value={['↵']} />
                  <span>Open</span>
                </div>
              </div>
              <div class="flex gap-2 items-center">
                <Kbd value={['Esc']} />
                <span>Close</span>
              </div>
            </div>
          }
        />
      }
      classes={{ content: 'top-1/4 translate-y-0' }}
    >
      <Button variant="outline" trailing={<Kbd value={['⌘', 'K']} />}>
        Search...
      </Button>
    </Popup>
  )
}
