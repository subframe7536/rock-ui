import { fireEvent, render, waitFor } from '@solidjs/testing-library'
import { describe, expect, test, vi } from 'vitest'

import { Modal } from './dialog'

describe('Modal', () => {
  test('renders default shell with title, description, body, footer and close button', () => {
    render(() => (
      <Modal
        open
        title="Confirm"
        description="Please confirm"
        body="Modal body"
        footer="Modal footer"
      >
        <button type="button">Trigger</button>
      </Modal>
    ))

    expect(document.body.textContent).toContain('Confirm')
    expect(document.body.textContent).toContain('Please confirm')
    expect(document.body.textContent).toContain('Modal body')
    expect(document.body.textContent).toContain('Modal footer')
    expect(document.body.querySelector('[data-slot="close"]')).not.toBeNull()

    const content = document.body.querySelector('[data-slot="dialog"]')
    expect(content?.className).toContain('bg-background')
    expect(content?.className).toContain('data-expanded:(animate-in fade-in-0 zoom-in-95)')
  })

  test('renders custom header slot and overrides default title/description section', () => {
    render(() => (
      <Modal
        open
        title="Default title"
        description="Default description"
        header={<div data-testid="custom-header">Custom Header</div>}
      >
        <button type="button">Trigger</button>
      </Modal>
    ))

    expect(document.body.querySelector('[data-testid="custom-header"]')?.textContent).toContain(
      'Custom Header',
    )
    expect(document.body.textContent).not.toContain('Default title')
    expect(document.body.textContent).not.toContain('Default description')
  })

  test('renders body content and keeps shell sections', () => {
    render(() => (
      <Modal open title="Dialog title" body={<div data-testid="custom-body">Body Content</div>}>
        <button type="button">Trigger</button>
      </Modal>
    ))

    expect(document.body.querySelector('[data-testid="custom-body"]')?.textContent).toContain(
      'Body Content',
    )
    expect(document.body.textContent).toContain('Dialog title')
  })

  test('opens by trigger click and closes through close button', async () => {
    const onOpenChange = vi.fn()

    const screen = render(() => (
      <Modal onOpenChange={onOpenChange} title="Settings" body="Body">
        <button type="button">Open modal</button>
      </Modal>
    ))

    expect(document.body.querySelector('[data-slot="dialog"]')).toBeNull()

    await fireEvent.click(screen.getByText('Open modal'))

    await waitFor(() => {
      expect(document.body.querySelector('[data-slot="dialog"]')).not.toBeNull()
    })

    const closeButton = document.body.querySelector('[data-slot="close"]') as HTMLElement
    await fireEvent.click(closeButton)

    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false)

      const content = document.body.querySelector('[data-slot="dialog"]')
      expect(content?.hasAttribute('data-closed')).toBe(true)
    })
  })

  test('renders into portal by default', () => {
    const screen = render(() => (
      <Modal open title="Portal default" body="Body">
        <button type="button">Trigger</button>
      </Modal>
    ))

    expect(screen.container.querySelector('[data-slot="dialog"]')).toBeNull()
    expect(document.body.querySelector('[data-slot="dialog"]')).not.toBeNull()
  })

  test('supports overlay=false', () => {
    render(() => (
      <Modal open overlay={false} body="Body">
        <button type="button">Trigger</button>
      </Modal>
    ))

    expect(document.body.querySelector('[data-slot="overlay"]')).toBeNull()
  })

  test('supports scrollable overlay mode', () => {
    render(() => (
      <Modal open scrollable body="Scrollable body">
        <button type="button">Trigger</button>
      </Modal>
    ))

    const overlays = document.body.querySelectorAll('[data-slot="overlay"]')
    const contents = document.body.querySelectorAll('[data-slot="dialog"]')
    const overlay = overlays[overlays.length - 1]
    const content = contents[contents.length - 1]

    expect(overlay).not.toBeNull()
    expect(overlay?.contains(content ?? null)).toBe(true)
  })

  test('applies fullscreen + transition=false classes', () => {
    render(() => (
      <Modal
        open
        fullscreen
        transition={false}
        classes={{
          dialog: 'content-class',
        }}
        body="Body"
      >
        <button type="button">Trigger</button>
      </Modal>
    ))

    const content = document.body.querySelector('[data-slot="dialog"]')

    expect(content?.className).toContain('fixed inset-0 flex max-w-none flex-col rounded-none')
    expect(content?.className).toContain('transition-none')
    expect(content?.className).toContain('content-class')
  })

  test('supports custom close content', () => {
    render(() => (
      <Modal open closeIcon={<span data-testid="custom-close">X</span>} body="Body">
        <button type="button">Trigger</button>
      </Modal>
    ))

    expect(document.body.querySelector('[data-testid="custom-close"]')?.textContent).toBe('X')
  })

  test('hides close button when close=false', () => {
    render(() => (
      <Modal open close={false} body="Body">
        <button type="button">Trigger</button>
      </Modal>
    ))

    expect(document.body.querySelector('[data-slot="close"]')).toBeNull()
  })

  test('prevents close when dismissible=false and emits onClosePrevent', async () => {
    const onClosePrevent = vi.fn()

    render(() => (
      <Modal defaultOpen dismissible={false} onClosePrevent={onClosePrevent} body="Body">
        <button type="button">Trigger</button>
      </Modal>
    ))

    const content = document.body.querySelector('[data-slot="dialog"]') as HTMLElement
    content.focus()
    await fireEvent.keyDown(content, { key: 'Escape' })

    await waitFor(() => {
      expect(onClosePrevent).toHaveBeenCalledTimes(1)
      expect(document.body.querySelector('[data-slot="dialog"]')).not.toBeNull()
    })
  })

  test('emits onClosePrevent once for blocked outside pointer interaction', async () => {
    const onClosePrevent = vi.fn()

    const screen = render(() => (
      <>
        <button type="button" data-testid="outside">
          Outside target
        </button>
        <Modal defaultOpen dismissible={false} onClosePrevent={onClosePrevent} body="Body">
          <button type="button">Trigger</button>
        </Modal>
      </>
    ))

    await new Promise((resolve) => setTimeout(resolve, 0))
    await fireEvent.pointerDown(screen.getByTestId('outside'))

    await waitFor(() => {
      expect(onClosePrevent).toHaveBeenCalledTimes(1)
      expect(document.body.querySelector('[data-slot="dialog"]')).not.toBeNull()
    })
  })

  test('allows close when dismissible=true', async () => {
    const onClosePrevent = vi.fn()
    const onOpenChange = vi.fn()

    render(() => (
      <Modal
        defaultOpen
        dismissible
        onClosePrevent={onClosePrevent}
        onOpenChange={onOpenChange}
        body="Body"
      >
        <button type="button">Trigger</button>
      </Modal>
    ))

    const content = document.body.querySelector('[data-slot="dialog"]') as HTMLElement
    content.focus()
    await fireEvent.keyDown(content, { key: 'Escape' })

    await waitFor(() => {
      expect(onClosePrevent).not.toHaveBeenCalled()
      expect(onOpenChange).toHaveBeenCalledWith(false)

      const contentNode = document.body.querySelector('[data-slot="dialog"]')
      expect(contentNode?.hasAttribute('data-closed')).toBe(true)
    })
  })
})
