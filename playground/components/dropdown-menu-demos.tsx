import { createSignal } from 'solid-js'

import { Button, DropdownMenu } from '../../src'
import type { DropdownMenuItems } from '../../src'

import { DemoPage, DemoSection } from './common/demo-page'

export const DropdownMenuDemos = () => {
  const [lastAction, setLastAction] = createSignal('None')
  const [autoSave, setAutoSave] = createSignal(true)

  const menuItems: DropdownMenuItems = [
    [
      { type: 'label', label: 'File' },
      {
        label: 'New File',
        icon: 'icon-file-plus',
        kbds: ['Ctrl', 'N'],
        onSelect: () => setLastAction('New File'),
      },
      {
        label: 'Open Search',
        icon: <span class="text-[10px] font-semibold">JSX</span>,
        kbds: ['Ctrl', 'K'],
        onSelect: () => setLastAction('Open Search'),
      },
      { type: 'separator' },
      {
        type: 'checkbox',
        label: 'Auto Save',
        defaultChecked: true,
        onCheckedChange: (checked) => setAutoSave(checked),
      },
      {
        label: 'More',
        children: [
          {
            label: 'Duplicate',
            kbds: ['Ctrl', 'D'],
            onSelect: () => setLastAction('Duplicate'),
          },
        ],
      },
    ],
  ]

  return (
    <DemoPage
      eyebrow="Rock UI Playground"
      title="Dropdown Menu"
      description="Menu overlay with shortcuts, nested items, and checkbox states."
    >
      <DemoSection
        title="Rich Items"
        description="Icons, kbds, group labels, separators, checkbox, and submenu."
      >
        <div class="flex flex-wrap gap-3 items-center">
          <DropdownMenu
            contentTop={({ sub }) => (
              <div class="text-xs text-muted-foreground">{sub ? 'Submenu' : 'Main menu'}</div>
            )}
            contentBottom={({ sub }) => (
              <div class="text-xs text-muted-foreground">{sub ? 'Sub actions' : 'Menu footer'}</div>
            )}
            items={menuItems}
          >
            <Button>Open menu</Button>
          </DropdownMenu>

          <p class="text-sm text-zinc-600">
            Last action: <span class="font-medium">{lastAction()}</span>
          </p>
          <p class="text-sm text-zinc-600">
            Auto save: <span class="font-medium">{String(autoSave())}</span>
          </p>
        </div>
      </DemoSection>

      <DemoSection
        title="Custom Item Render"
        description="Override item row with `itemRender` while keeping menu behavior."
      >
        <div class="flex flex-wrap gap-3 items-center">
          <DropdownMenu
            items={[
              { label: 'Profile' },
              { label: 'Billing' },
              {
                label: 'Project',
                children: [{ label: 'Members' }, { label: 'Activity' }],
              },
            ]}
            itemRender={(ctx) => (
              <div class="flex w-full items-center justify-between">
                <span class="truncate">{String(ctx.item.label ?? 'Item')}</span>
                <span class="text-xs text-muted-foreground">
                  d:{ctx.depth} {ctx.hasChildren ? 'sub' : 'leaf'}
                </span>
              </div>
            )}
          >
            <Button variant="outline">Custom render</Button>
          </DropdownMenu>
        </div>
      </DemoSection>
    </DemoPage>
  )
}
