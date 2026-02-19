import { render } from '@solidjs/testing-library'
import type { JSX } from 'solid-js'
import { describe, expect, test } from 'vitest'

import { Card } from './card'

describe('Card', () => {
  test('renders root with default outline variant classes', () => {
    const screen = render(() => <Card />)
    const root = screen.container.querySelector('[data-slot="root"]')

    expect(root?.className).toContain('divide-y')
    expect(root?.className).toContain('border-border')
  })

  test('always renders static div even when legacy as is passed', () => {
    const screen = render(() => <Card {...({ as: 'section' } as any)} />)
    const root = screen.container.querySelector('[data-slot="root"]')

    expect(root?.tagName).toBe('DIV')
  })

  test('renders body slot only when children exist', () => {
    const emptyScreen = render(() => <Card />)
    const hasNoBody = emptyScreen.container.querySelector('[data-slot="body"]')
    expect(hasNoBody).toBeNull()

    const screen = render(() => <Card>Body content</Card>)
    const body = screen.container.querySelector('[data-slot="body"]')
    expect(body?.textContent).toBe('Body content')
  })

  test('renders header and footer only when provided', () => {
    const emptyScreen = render(() => (
      <Card header={false as unknown as JSX.Element} footer={null as unknown as JSX.Element}>
        Body
      </Card>
    ))

    expect(emptyScreen.container.querySelector('[data-slot="header"]')).toBeNull()
    expect(emptyScreen.container.querySelector('[data-slot="footer"]')).toBeNull()

    const screen = render(() => (
      <Card header="Header content" footer="Footer content">
        Body
      </Card>
    ))
    const header = screen.container.querySelector('[data-slot="header"]')
    const footer = screen.container.querySelector('[data-slot="footer"]')

    expect(header?.textContent).toBe('Header content')
    expect(footer?.textContent).toBe('Footer content')
  })

  test('applies each variant class: solid/outline/soft/subtle', () => {
    const outline = render(() => <Card variant="outline" />)
    const soft = render(() => <Card variant="soft" />)
    const subtle = render(() => <Card variant="subtle" />)
    const solid = render(() => <Card variant="solid" />)

    expect(outline.container.querySelector('[data-slot="root"]')?.className).toContain('divide-y')
    expect(soft.container.querySelector('[data-slot="root"]')?.className).toContain('bg-muted/56')
    expect(subtle.container.querySelector('[data-slot="root"]')?.className).toContain('ring-1')
    expect(solid.container.querySelector('[data-slot="root"]')?.className).toContain('bg-inverted')
  })

  test('applies classes.root/classes.header/classes.body/classes.footer overrides', () => {
    const screen = render(() => (
      <Card
        header="Header"
        footer="Footer"
        classes={{
          root: 'root-override',
          header: 'header-override',
          body: 'body-override',
          footer: 'footer-override',
        }}
      >
        Body
      </Card>
    ))

    const root = screen.container.querySelector('[data-slot="root"]')
    const header = screen.container.querySelector('[data-slot="header"]')
    const body = screen.container.querySelector('[data-slot="body"]')
    const footer = screen.container.querySelector('[data-slot="footer"]')

    expect(root?.className).toContain('root-override')
    expect(header?.className).toContain('header-override')
    expect(body?.className).toContain('body-override')
    expect(footer?.className).toContain('footer-override')
  })

  test('ignores legacy class prop and keeps classes.root as root override channel', () => {
    const screen = render(() => (
      <Card
        {...({
          class: 'legacy-class',
          classes: {
            root: 'root-override',
          },
        } as any)}
      />
    ))

    const root = screen.container.querySelector('[data-slot="root"]')
    expect(root?.className).toContain('root-override')
    expect(root?.className).not.toContain('legacy-class')
  })

  test('forwards id and aria attributes to root', () => {
    const screen = render(() => <Card id="card-root" role="region" aria-label="Card Region" />)
    const root = screen.container.querySelector('[data-slot="root"]')

    expect(root?.getAttribute('id')).toBe('card-root')
    expect(root?.getAttribute('role')).toBe('region')
    expect(root?.getAttribute('aria-label')).toBe('Card Region')
  })

  test('falls back to outline variant when runtime value is invalid', () => {
    const screen = render(() => <Card {...({ variant: 'invalid' } as any)} />)
    const root = screen.container.querySelector('[data-slot="root"]')

    expect(root?.className).toContain('divide-y')
    expect(root?.className).toContain('border-border')
  })
})
