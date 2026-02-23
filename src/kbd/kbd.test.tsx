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

    expect(xs.container.querySelector('[data-slot="root"]')?.className).toContain('h-2')
    expect(sm.container.querySelector('[data-slot="root"]')?.className).toContain('h-3')
    expect(md.container.querySelector('[data-slot="root"]')?.className).toContain('h-4')
    expect(lg.container.querySelector('[data-slot="root"]')?.className).toContain('h-5')
    expect(xl.container.querySelector('[data-slot="root"]')?.className).toContain('h-6')
  })

  test('falls back to md size when runtime size is invalid', () => {
    // @ts-expect-error test invalid size
    const screen = render(() => <Kbd size="invalid">K</Kbd>)
    const root = screen.container.querySelector('[data-slot="root"]')

    expect(root?.className).toContain('h-4')
  })

  test('applies classes.root override', () => {
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
  })

  test('keeps explicit data-slot support', () => {
    const screen = render(() => <Kbd data-slot="kbd">K</Kbd>)
    const root = screen.container.querySelector('[data-slot="root"]')
    const explicitSlotRoot = screen.container.querySelector('[data-slot="kbd"]')

    expect(root).toBeNull()
    expect(explicitSlotRoot?.tagName).toBe('KBD')
  })
})
