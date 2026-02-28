import { fireEvent, render, waitFor } from '@solidjs/testing-library'
import { describe, expect, test, vi } from 'vitest'

import { CommandPalette } from './command-palette'
import type { CommandPaletteItem } from './command-palette'

const GROUPS = [
  {
    id: 'actions',
    label: 'Actions',
    items: [
      { value: 'new-file', label: 'New File', icon: 'i-lucide-file-plus', kbds: ['⌘', 'N'] },
      { value: 'open-folder', label: 'Open Folder', icon: 'i-lucide-folder-open' },
      { value: 'disabled-action', label: 'Disabled Action', disabled: true },
    ],
  },
  {
    id: 'navigation',
    label: 'Navigation',
    items: [
      { value: 'go-dashboard', label: 'Go to Dashboard' },
      { value: 'go-settings', label: 'Go to Settings' },
    ],
  },
]

describe('CommandPalette', () => {
  test('uses css variable classes for item gap by icon presence', async () => {
    const screen = render(() => <CommandPalette groups={GROUPS} />)

    await waitFor(() => {
      const withIcon = screen.getByText('New File').closest('[data-slot="item"]')
      const withoutIcon = screen.getByText('Go to Dashboard').closest('[data-slot="item"]')

      expect(withIcon?.className).toContain('gap-$cmd-item-gap-icon')
      expect(withIcon?.className).toContain('[--cmd-item-gap-icon:calc(var(--spacing)*2.5)]')
      expect(withoutIcon?.className).toContain('gap-$cmd-item-gap-no-icon')
      expect(withoutIcon?.className).toContain('[--cmd-item-gap-no-icon:calc(var(--spacing)*1.5)]')
    })
  })

  test('renders input and item labels', async () => {
    const screen = render(() => <CommandPalette groups={GROUPS} />)

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search...')).toBeTruthy()
      expect(screen.getByText('New File')).toBeTruthy()
      expect(screen.getByText('Go to Dashboard')).toBeTruthy()
    })
  })

  test('renders group labels', async () => {
    const screen = render(() => <CommandPalette groups={GROUPS} />)

    await waitFor(() => {
      expect(screen.getByText('Actions')).toBeTruthy()
      expect(screen.getByText('Navigation')).toBeTruthy()
    })
  })

  test('shows empty state when no groups', async () => {
    const screen = render(() => <CommandPalette groups={[]} />)

    await waitFor(() => {
      expect(screen.getByText('No results.')).toBeTruthy()
    })
  })

  test('kbds render in item', async () => {
    const screen = render(() => <CommandPalette groups={GROUPS} />)

    await waitFor(() => {
      const kbds = screen.container.querySelectorAll('[data-slot="item-kbd"]')
      expect(kbds.length).toBeGreaterThan(0)
      expect(screen.container.querySelector('[data-slot="item-trailing-kbds"]')).toBeNull()
    })
  })

  test('fires onSelect when a leaf item is activated', async () => {
    const onSelect = vi.fn()

    const screen = render(() => (
      <CommandPalette
        groups={[{ id: 'g', items: [{ value: 'action', label: 'Action', onSelect }] }]}
      />
    ))

    await waitFor(() => screen.getByText('Action'))

    const item = screen.container.querySelector('[data-slot="item"]') as HTMLElement
    await fireEvent.click(item)

    expect(onSelect).toHaveBeenCalledTimes(1)
  })

  test('supports overriding built-in icons including back icon', async () => {
    const screen = render(() => (
      <CommandPalette
        close
        searchIcon="icon-hash"
        loadingIcon="icon-reload"
        childIcon="icon-arrow-right"
        backIcon="icon-arrow-up"
        closeIcon="icon-minus"
        groups={[
          {
            id: 'g',
            items: [
              {
                value: 'parent',
                label: 'Parent',
                children: [{ value: 'child', label: 'Child' }],
              },
            ],
          },
        ]}
      />
    ))

    await waitFor(() => {
      const searchIcon = screen.container.querySelector(
        '[data-slot="search-icon"] [data-slot="icon"]',
      ) as HTMLElement
      const childIcon = screen.container.querySelector(
        '[data-slot="item-trailing-icon"]',
      ) as HTMLElement
      const closeIcon = screen.container.querySelector(
        '[data-slot="close"] [data-slot="icon"]',
      ) as HTMLElement

      expect(searchIcon.className).toContain('icon-hash')
      expect(childIcon.className).toContain('icon-arrow-right')
      expect(closeIcon.className).toContain('icon-minus')
    })

    const parentItem = screen.container.querySelector('[data-slot="item"]') as HTMLElement
    await fireEvent.click(parentItem)

    await waitFor(() => {
      const backIcon = screen.container.querySelector(
        '[data-slot="back"] [data-slot="icon"]',
      ) as HTMLElement
      expect(backIcon.className).toContain('icon-arrow-up')
    })
  })

  test('navigates into children on selection and shows back button', async () => {
    const screen = render(() => (
      <CommandPalette
        groups={[
          {
            id: 'g',
            items: [
              {
                value: 'more',
                label: 'More',
                children: [{ value: 'sub-item', label: 'Sub Item' }],
              },
            ],
          },
        ]}
      />
    ))

    await waitFor(() => screen.getByText('More'))

    const item = screen.container.querySelector('[data-slot="item"]') as HTMLElement
    await fireEvent.click(item)

    await waitFor(() => {
      expect(screen.container.querySelector('[data-slot="back"]')).not.toBeNull()
    })
  })

  test('navigates back on back button click', async () => {
    const screen = render(() => (
      <CommandPalette
        groups={[
          {
            id: 'g',
            items: [
              {
                value: 'parent',
                label: 'Parent',
                children: [{ value: 'child', label: 'Child' }],
              },
            ],
          },
        ]}
      />
    ))

    await waitFor(() => screen.getByText('Parent'))

    const parentItem = screen.container.querySelector('[data-slot="item"]') as HTMLElement
    await fireEvent.click(parentItem)

    await waitFor(() => {
      expect(screen.container.querySelector('[data-slot="back"]')).not.toBeNull()
    })

    const backButton = screen.container.querySelector('[data-slot="back"]') as HTMLElement
    await fireEvent.click(backButton)

    await waitFor(() => {
      expect(screen.getByText('Parent')).toBeTruthy()
      expect(screen.container.querySelector('[data-slot="back"]')).toBeNull()
    })
  })

  test('navigates back on Backspace with empty input', async () => {
    const screen = render(() => (
      <CommandPalette
        groups={[
          {
            id: 'g',
            items: [
              {
                value: 'parent',
                label: 'Parent',
                children: [{ value: 'child', label: 'Child' }],
              },
            ],
          },
        ]}
      />
    ))

    await waitFor(() => screen.getByText('Parent'))

    const parentItem = screen.container.querySelector('[data-slot="item"]') as HTMLElement
    await fireEvent.click(parentItem)

    await waitFor(() => {
      expect(screen.container.querySelector('[data-slot="back"]')).not.toBeNull()
    })

    const input = screen.getByPlaceholderText('Search...') as HTMLInputElement
    await fireEvent.keyDown(input, { key: 'Backspace' })

    await waitFor(() => {
      expect(screen.getByText('Parent')).toBeTruthy()
      expect(screen.container.querySelector('[data-slot="back"]')).toBeNull()
    })
  })

  test('close button renders and calls onClose', async () => {
    const onClose = vi.fn()
    const screen = render(() => <CommandPalette groups={GROUPS} close onClose={onClose} />)

    await waitFor(() => {
      const closeBtn = screen.container.querySelector('[data-slot="close"]') as HTMLElement
      expect(closeBtn).not.toBeNull()
      fireEvent.click(closeBtn)
    })

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  test('disabled item has data-disabled attribute', async () => {
    const screen = render(() => <CommandPalette groups={GROUPS} />)

    await waitFor(() => {
      const items = screen.container.querySelectorAll('[data-slot="item"]')
      const disabledItem = [...items].find((el) => el.getAttribute('data-disabled') !== null)
      expect(disabledItem).toBeTruthy()
    })
  })

  test('renders custom placeholder', async () => {
    const screen = render(() => <CommandPalette groups={GROUPS} placeholder="Type a command..." />)

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Type a command...')).toBeTruthy()
    })
  })

  test('applies classes overrides to root and slots', async () => {
    const screen = render(() => (
      <CommandPalette
        close
        groups={GROUPS}
        classes={{
          root: 'root-override',
          inputWrapper: 'input-wrapper-override',
          input: 'input-override',
          listbox: 'listbox-override',
          group: 'group-override',
          groupLabel: 'group-label-override',
          item: 'item-override',
          searchIcon: 'search-icon-override',
          close: 'close-override',
        }}
      />
    ))

    await waitFor(() => {
      expect(screen.container.querySelector('[data-slot="root"]')?.className).toContain(
        'root-override',
      )
      expect(screen.container.querySelector('[data-slot="input-wrapper"]')?.className).toContain(
        'input-wrapper-override',
      )
      expect(screen.container.querySelector('[data-slot="input"]')?.className).toContain(
        'input-override',
      )
      expect(screen.container.querySelector('[data-slot="listbox"]')?.className).toContain(
        'listbox-override',
      )
      expect(screen.container.querySelector('[data-slot="group"]')?.className).toContain(
        'group-override',
      )
      expect(screen.container.querySelector('[data-slot="group-label"]')?.className).toContain(
        'group-label-override',
      )
      expect(screen.container.querySelector('[data-slot="item"]')?.className).toContain(
        'item-override',
      )
      expect(screen.container.querySelector('[data-slot="search-icon"]')?.className).toContain(
        'search-icon-override',
      )
      expect(screen.container.querySelector('[data-slot="close"]')?.className).toContain(
        'close-override',
      )
    })
  })

  test('applies classes.empty override', async () => {
    const screen = render(() => (
      <CommandPalette groups={[]} classes={{ empty: 'empty-override' }} />
    ))

    await waitFor(() => {
      expect(screen.container.querySelector('[data-slot="empty"]')?.className).toContain(
        'empty-override',
      )
    })
  })

  test('applies classes.back override', async () => {
    const screen = render(() => (
      <CommandPalette
        groups={[
          {
            id: 'g',
            items: [
              {
                value: 'parent',
                label: 'Parent',
                children: [{ value: 'child', label: 'Child' }],
              },
            ],
          },
        ]}
        classes={{ back: 'back-override' }}
      />
    ))

    await waitFor(() => {
      expect(screen.getByText('Parent')).toBeTruthy()
    })

    const item = screen.container.querySelector('[data-slot="item"]') as HTMLElement
    await fireEvent.click(item)

    await waitFor(() => {
      expect(screen.container.querySelector('[data-slot="back"]')?.className).toContain(
        'back-override',
      )
    })
  })

  test('filters by controlled searchTerm', async () => {
    const screen = render(() => <CommandPalette groups={GROUPS} searchTerm="Settings" />)

    await waitFor(() => {
      expect(screen.getByText('Go to Settings')).toBeTruthy()
      expect(screen.queryByText('Go to Dashboard')).toBeNull()
    })
  })

  test('warns for duplicate item values while keeping items renderable', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const screen = render(() => (
      <CommandPalette
        groups={[
          {
            id: 'g',
            items: [
              { value: 'dup', label: 'First' },
              { value: 'dup', label: 'Second' },
            ],
          },
        ]}
      />
    ))

    await waitFor(() => {
      expect(screen.getByText('First')).toBeTruthy()
      expect(screen.getByText('Second')).toBeTruthy()
    })

    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('duplicate item value "dup"'))
    warnSpy.mockRestore()
  })

  test('requires value in item type contract', () => {
    // @ts-expect-error value is required
    const item: CommandPaletteItem = { label: 'No value' }
    expect(item).toBeDefined()
  })

  test('rejects item classes in type contract', () => {
    // @ts-expect-error item-level classes has been removed
    const item: CommandPaletteItem = { value: 'x', label: 'Legacy', classes: { item: 'x' } }
    expect(item).toBeDefined()
  })
})
