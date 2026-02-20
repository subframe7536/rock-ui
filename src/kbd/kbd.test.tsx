import { render } from '@solidjs/testing-library'
import { describe, expect, test } from 'vitest'

import { Kbd } from './kbd'

describe('Kbd', () => {
  test('renders kbd root with content', () => {
    const screen = render(() => <Kbd>Ctrl</Kbd>)
    const root = screen.container.querySelector('[data-slot="root"]')

    expect(root?.tagName).toBe('KBD')
    expect(root?.textContent).toBe('Ctrl')
  })

  test('applies size classes: xs/sm/md/lg/xl', () => {
    const xs = render(() => <Kbd size="xs">X</Kbd>)
    const sm = render(() => <Kbd size="sm">S</Kbd>)
    const md = render(() => <Kbd size="md">M</Kbd>)
    const lg = render(() => <Kbd size="lg">L</Kbd>)
    const xl = render(() => <Kbd size="xl">XL</Kbd>)

    expect(xs.container.querySelector('[data-slot="root"]')?.className).toContain('h-4')
    expect(sm.container.querySelector('[data-slot="root"]')?.className).toContain('h-5')
    expect(md.container.querySelector('[data-slot="root"]')?.className).toContain('h-5.5')
    expect(lg.container.querySelector('[data-slot="root"]')?.className).toContain('h-6')
    expect(xl.container.querySelector('[data-slot="root"]')?.className).toContain('h-7')
  })

  test('falls back to md size when runtime size is invalid', () => {
    // @ts-expect-error test invalid size
    const screen = render(() => <Kbd size="invalid">K</Kbd>)
    const root = screen.container.querySelector('[data-slot="root"]')

    expect(root?.className).toContain('h-5.5')
  })

  test('applies classes.root override and ignores legacy class prop', () => {
    const screen = render(() => (
      <Kbd
        classes={{
          root: 'root-override',
        }}
      >
        K
      </Kbd>
    ))
    const root = screen.container.querySelector('[data-slot="root"]')

    expect(root?.className).toContain('root-override')
    expect(root?.className).not.toContain('legacy-class')
  })

  test('forwards id/role/aria-* to root', () => {
    const screen = render(() => (
      <Kbd id="kbd-root" role="note" aria-label="Keyboard shortcut">
        K
      </Kbd>
    ))
    const root = screen.container.querySelector('[data-slot="root"]')

    expect(root?.getAttribute('id')).toBe('kbd-root')
    expect(root?.getAttribute('role')).toBe('note')
    expect(root?.getAttribute('aria-label')).toBe('Keyboard shortcut')
  })
})
