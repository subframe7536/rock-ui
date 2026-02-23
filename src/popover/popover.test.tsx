import { fireEvent, render, waitFor } from '@solidjs/testing-library'
import { describe, expect, test, vi } from 'vitest'

import { Popover } from './popover'

describe('Popover', () => {
  test('supports click mode and renders content', () => {
    render(() => (
      <Popover open content="Popover content">
        <button type="button">Trigger</button>
      </Popover>
    ))

    const content = document.body.querySelector('[data-slot="content"]')

    expect(content?.textContent).toContain('Popover content')
    expect(content?.getAttribute('role')).toBe('dialog')
  })

  test('supports hover mode and renders content', () => {
    render(() => (
      <Popover mode="hover" open content="Hover content">
        <button type="button">Trigger</button>
      </Popover>
    ))

    const content = document.body.querySelector('[data-slot="content"]')

    expect(content?.textContent).toContain('Hover content')
  })

  test.each([
    ['top-start', 'mb-$kb-popper-content-overflow-padding'],
    ['right-start', 'ml-$kb-popper-content-overflow-padding'],
    ['bottom-start', 'mt-$kb-popper-content-overflow-padding'],
    ['left-start', 'mr-$kb-popper-content-overflow-padding'],
  ])('applies side class for placement %s', (placement, expectedClass) => {
    render(() => <Popover open placement={placement as never} content="Placement content" />)

    const content = document.body.querySelector('[data-slot="content"]')

    expect(content?.className).toContain(expectedClass)
  })

  test('supports classes for content slot', () => {
    render(() => (
      <Popover
        open
        classes={{
          content: 'content-slot-class',
        }}
        content="Styled"
      />
    ))

    const content = document.body.querySelector('[data-slot="content"]')

    expect(content?.className).toContain('content-slot-class')
  })

  test('renders into portal by default', () => {
    const screen = render(() => (
      <Popover open content="Portal default">
        <button type="button">Trigger</button>
      </Popover>
    ))

    expect(screen.container.querySelector('[data-slot="content"]')).toBeNull()
    expect(document.body.querySelector('[data-slot="content"]')).not.toBeNull()
  })

  test('does not render trigger when default slot is missing', () => {
    render(() => <Popover open content="No trigger" />)

    expect(document.body.querySelector('[data-slot="trigger"]')).toBeNull()
  })

  test('does not render body wrapper when content is undefined or null', () => {
    const undefinedPanelScreen = render(() => <Popover open />)
    expect(
      undefinedPanelScreen.container.ownerDocument.body.querySelector('[data-slot="body"]'),
    ).toBeNull()

    render(() => <Popover open content={null as never} />)
    expect(document.body.querySelector('[data-slot="body"]')).toBeNull()
  })

  test('keeps popover open and emits onClosePrevent when dismissible=false', async () => {
    const onClosePrevent = vi.fn()

    render(() => (
      <Popover defaultOpen dismissible={false} onClosePrevent={onClosePrevent} content="Persistent">
        <button type="button">Trigger</button>
      </Popover>
    ))

    const content = document.body.querySelector('[data-slot="content"]') as HTMLElement
    content.focus()
    await fireEvent.keyDown(content, { key: 'Escape' })

    await waitFor(() => {
      expect(onClosePrevent).toHaveBeenCalledTimes(1)
      expect(document.body.querySelector('[data-slot="content"]')).not.toBeNull()
    })
  })

  test('emits onClosePrevent once for blocked outside pointer interaction', async () => {
    const onClosePrevent = vi.fn()

    const screen = render(() => (
      <>
        <button type="button" data-testid="outside">
          Outside target
        </button>
        <Popover
          defaultOpen
          dismissible={false}
          onClosePrevent={onClosePrevent}
          content="Persistent"
        >
          <button type="button">Trigger</button>
        </Popover>
      </>
    ))

    await new Promise((resolve) => setTimeout(resolve, 0))
    await fireEvent.pointerDown(screen.getByTestId('outside'))

    await waitFor(() => {
      expect(onClosePrevent).toHaveBeenCalledTimes(1)
      expect(document.body.querySelector('[data-slot="content"]')).not.toBeNull()
    })
  })

  test('does not double count pointer attempt followed by outside focus', async () => {
    const onClosePrevent = vi.fn()

    const screen = render(() => (
      <>
        <button type="button" data-testid="outside">
          Outside target
        </button>
        <Popover
          defaultOpen
          dismissible={false}
          onClosePrevent={onClosePrevent}
          content="Persistent"
        >
          <button type="button">Trigger</button>
        </Popover>
      </>
    ))

    const outside = screen.getByTestId('outside')

    await new Promise((resolve) => setTimeout(resolve, 0))
    await fireEvent.pointerDown(outside)
    await fireEvent.focusIn(outside)

    await waitFor(() => {
      expect(onClosePrevent).toHaveBeenCalledTimes(1)
      expect(document.body.querySelector('[data-slot="content"]')).not.toBeNull()
    })
  })

  test('closes popover on escape when dismissible=true', async () => {
    const onClosePrevent = vi.fn()
    const onOpenChange = vi.fn()

    render(() => (
      <Popover
        defaultOpen
        dismissible
        onClosePrevent={onClosePrevent}
        onOpenChange={onOpenChange}
        content="Closable"
      >
        <button type="button">Trigger</button>
      </Popover>
    ))

    const content = document.body.querySelector('[data-slot="content"]') as HTMLElement
    content.focus()
    await fireEvent.keyDown(content, { key: 'Escape' })

    await waitFor(() => {
      expect(onClosePrevent).not.toHaveBeenCalled()
      expect(onOpenChange).toHaveBeenCalledWith(false)

      const contentNode = document.body.querySelector('[data-slot="content"]')
      expect(contentNode?.hasAttribute('data-closed')).toBe(true)

      const trigger = document.body.querySelector('[data-slot="trigger"]')
      expect(trigger?.getAttribute('aria-expanded')).toBe('false')
    })
  })
})
