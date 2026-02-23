import { render } from '@solidjs/testing-library'
import { describe, expect, test } from 'vitest'

import { Button } from '../button'
import { Input } from '../input'
import { Textarea } from '../textarea'

import { FieldGroup } from './field-group'

describe('FieldGroup', () => {
  test('renders root with default horizontal orientation', () => {
    const screen = render(() => (
      <FieldGroup>
        <Input />
      </FieldGroup>
    ))

    const root = screen.container.firstElementChild as HTMLElement

    expect(root.getAttribute('data-slot')).toBe('root')
    expect(root.getAttribute('data-orientation')).toBe('horizontal')
    expect(root.className).toContain('inline-flex')
    expect(root.className).toContain('-space-x-px')
  })

  test('applies vertical orientation classes and data attribute', () => {
    const screen = render(() => (
      <FieldGroup orientation="vertical">
        <Input />
      </FieldGroup>
    ))

    const root = screen.container.firstElementChild as HTMLElement

    expect(root.getAttribute('data-orientation')).toBe('vertical')
    expect(root.className).toContain('flex-col')
    expect(root.className).toContain('-space-y-px')
  })

  test('inherits size for input, textarea and button', () => {
    const screen = render(() => (
      <FieldGroup size="xl">
        <Input />
        <Textarea />
        <Button>Action</Button>
      </FieldGroup>
    ))

    const input = screen.container.querySelector('input') as HTMLInputElement
    const textarea = screen.container.querySelector('textarea') as HTMLTextAreaElement
    const button = screen.getByRole('button', { name: 'Action' })

    const inputRoot = input.closest('[data-slot="root"]')

    expect(inputRoot?.className).toContain('h-11')
    expect(textarea.className).toContain('min-h-24')
    expect(button.className).toContain('h-11')
  })

  test('child explicit size has higher priority than group size', () => {
    const screen = render(() => (
      <FieldGroup size="xl">
        <Input size="sm" />
        <Textarea size="sm" />
        <Button size="sm">Action</Button>
      </FieldGroup>
    ))

    const input = screen.container.querySelector('input') as HTMLInputElement
    const textarea = screen.container.querySelector('textarea') as HTMLTextAreaElement
    const button = screen.getByRole('button', { name: 'Action' })
    const inputRoot = input.closest('[data-slot="root"]')

    expect(inputRoot?.className).toContain('h-8')
    expect(inputRoot?.className).not.toContain('h-11')
    expect(textarea.className).toContain('min-h-18')
    expect(button.className).toContain('h-8')
  })

  test('applies classes.root', () => {
    const screen = render(() => (
      <FieldGroup
        classes={{
          root: 'root-override',
        }}
      >
        <Input />
      </FieldGroup>
    ))

    const root = screen.container.firstElementChild as HTMLElement

    expect(root.className).toContain('root-override')
  })
})
