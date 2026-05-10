import { fireEvent, render, waitFor } from '@solidjs/testing-library'
import { createSignal } from 'solid-js'
import { describe, expect, test, vi } from 'vitest'

import { Form } from '../form'
import { FormField } from '../form-field'

import { Slider } from './slider'

function getThumbs(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll('[data-slot="thumb"]')) as HTMLElement[]
}

function getInputs(container: HTMLElement): HTMLInputElement[] {
  return Array.from(container.querySelectorAll('input[type="range"]')) as HTMLInputElement[]
}

function mockPointerCapture(target: HTMLElement): void {
  const capturedPointers = new Set<number>()

  Object.defineProperty(target, 'setPointerCapture', {
    configurable: true,
    value(pointerId: number) {
      capturedPointers.add(pointerId)
    },
  })

  Object.defineProperty(target, 'hasPointerCapture', {
    configurable: true,
    value(pointerId: number) {
      return capturedPointers.has(pointerId)
    },
  })

  Object.defineProperty(target, 'releasePointerCapture', {
    configurable: true,
    value(pointerId: number) {
      capturedPointers.delete(pointerId)
    },
  })
}

function mockTrackRect(target: HTMLElement): void {
  Object.defineProperty(target, 'getBoundingClientRect', {
    configurable: true,
    value: () =>
      ({
        left: 0,
        top: 0,
        right: 100,
        bottom: 100,
        width: 100,
        height: 100,
        x: 0,
        y: 0,
        toJSON() {
          return this
        },
      }) as DOMRect,
  })
}

function createForm(validateOn: Array<'blur' | 'change' | 'input'>) {
  const state = { value: 10 }

  const screen = render(() => (
    <Form
      state={state}
      validateOn={validateOn}
      validateOnInputDelay={0}
      validate={(currentState) => {
        if ((currentState?.value as number) >= 20) {
          return []
        }

        return [{ name: 'value', message: 'Error message' }]
      }}
    >
      <FormField name="value" label="Slider" hint="Hint" description="Description" help="Help">
        <Slider
          id="slider-input"
          defaultValue={state.value}
          onValueChange={(nextValue) => {
            state.value = Array.isArray(nextValue) ? (nextValue[0] ?? 0) : nextValue
          }}
        />
      </FormField>
    </Form>
  ))

  return {
    screen,
    thumb: () => {
      const thumb = screen.container.querySelector('[data-slot="thumb"]')
      if (!thumb) {
        throw new Error('Slider thumb not found')
      }
      return thumb as HTMLElement
    },
    input: () => {
      const input = screen.container.querySelector('#slider-input')
      if (!input) {
        throw new Error('Slider input not found')
      }
      return input as HTMLInputElement
    },
  }
}

describe('Slider', () => {
  test('uses css variable classes for track thickness', () => {
    const horizontal = render(() => <Slider orientation="horizontal" size="xs" />)
    const vertical = render(() => <Slider orientation="vertical" size="xl" />)

    const horizontalTrack = horizontal.container.querySelector('[data-slot="track"]')
    const verticalTrack = vertical.container.querySelector('[data-slot="track"]')

    expect(horizontalTrack?.className).toContain('h-$s-size')
    expect(horizontalTrack?.className).toContain('var-slider-3')
    expect(verticalTrack?.className).toContain('w-$s-size')
    expect(verticalTrack?.className).toContain('var-slider-6')
  })

  test('renders base attributes and orientation without tooltip', () => {
    const screen = render(() => (
      <Slider
        id="volume"
        name="volume"
        min={1}
        max={10}
        step={2}
        orientation="vertical"
        required
        disabled
        readOnly
        inverted
      />
    ))

    const root = screen.container.querySelector('[data-slot="root"][id$="-root"]')
    const track = screen.container.querySelector('[data-slot="track"]')
    const thumb = screen.container.querySelector('[data-slot="thumb"]') as HTMLElement | null
    const inputs = getInputs(screen.container)

    expect(inputs.length).toBe(1)
    expect(inputs[0]?.id).toBe('volume')
    expect(inputs[0]?.name).toBe('volume')
    expect(inputs[0]?.min).toBe('1')
    expect(inputs[0]?.max).toBe('10')
    expect(inputs[0]?.step).toBe('2')
    expect(inputs[0]?.required).toBe(true)
    expect(inputs[0]?.disabled).toBe(true)
    expect(inputs[0]?.readOnly).toBe(true)
    expect(root?.getAttribute('data-orientation')).toBe('vertical')
    expect(track?.className).toContain('bg-input')
    expect(thumb?.className).toContain('absolute')
    expect(thumb?.style.translate).toBe('')
    expect(thumb?.className).toContain('translate-y-1/2')
    expect(thumb?.className).toContain('scale-120')
    expect(thumb?.className).toContain('cursor-pointer')
    expect(thumb?.className).toContain('hover:effect-fv')
    expect(thumb?.className).toContain('focus-visible:effect-fv')
    expect(screen.queryByRole('tooltip')).toBeNull()
  })

  test('vertical arrow keys follow the visual direction', async () => {
    const verticalChange = vi.fn()
    const verticalScreen = render(() => (
      <Slider orientation="vertical" defaultValue={45} onValueChange={verticalChange} />
    ))
    const verticalThumb = getThumbs(verticalScreen.container)[0]

    await fireEvent.focus(verticalThumb as HTMLElement)
    await fireEvent.keyDown(verticalThumb as HTMLElement, { key: 'ArrowDown' })

    expect(verticalChange).toHaveBeenLastCalledWith(46)

    const invertedChange = vi.fn()
    const invertedScreen = render(() => (
      <Slider orientation="vertical" inverted defaultValue={45} onValueChange={invertedChange} />
    ))
    const invertedThumb = getThumbs(invertedScreen.container)[0]

    await fireEvent.focus(invertedThumb as HTMLElement)
    await fireEvent.keyDown(invertedThumb as HTMLElement, { key: 'ArrowDown' })

    expect(invertedChange).toHaveBeenLastCalledWith(44)
  })

  test('single uncontrolled emits number for input and commit phases', async () => {
    const onValueChange = vi.fn()
    const onChange = vi.fn()
    const screen = render(() => (
      <Slider defaultValue={10} onValueChange={onValueChange} onChange={onChange} />
    ))
    const thumbs = getThumbs(screen.container)

    await fireEvent.focus(thumbs[0] as HTMLElement)
    await fireEvent.keyDown(thumbs[0] as HTMLElement, { key: 'ArrowRight' })

    expect(onValueChange).toHaveBeenLastCalledWith(11)
    expect(onChange).not.toHaveBeenCalled()
    expect(typeof onValueChange.mock.calls[0]?.[0]).toBe('number')

    await fireEvent.blur(thumbs[0] as HTMLElement)

    expect(onChange).toHaveBeenLastCalledWith(11)
    expect(typeof onChange.mock.calls[0]?.[0]).toBe('number')
  })

  test('range uncontrolled emits number[] for input and commit phases', async () => {
    const onValueChange = vi.fn()
    const onChange = vi.fn()
    const screen = render(() => (
      <Slider defaultValue={[20, 80]} onValueChange={onValueChange} onChange={onChange} />
    ))
    const thumbs = getThumbs(screen.container)

    expect(thumbs.length).toBe(2)
    expect(thumbs[0]?.getAttribute('aria-label')).toBe('Thumb 1 of 2')
    expect(thumbs[1]?.getAttribute('aria-label')).toBe('Thumb 2 of 2')

    await fireEvent.focus(thumbs[1] as HTMLElement)
    await fireEvent.keyDown(thumbs[1] as HTMLElement, { key: 'ArrowLeft' })

    expect(onValueChange).toHaveBeenLastCalledWith([20, 79])
    expect(Array.isArray(onValueChange.mock.calls[0]?.[0])).toBe(true)

    await fireEvent.blur(thumbs[1] as HTMLElement)

    expect(onChange).toHaveBeenLastCalledWith([20, 79])
    expect(Array.isArray(onChange.mock.calls[0]?.[0])).toBe(true)
  })

  test('moves overlapping thumbs in both directions', async () => {
    const rightChange = vi.fn()
    const rightScreen = render(() => <Slider defaultValue={[20, 20]} onValueChange={rightChange} />)
    const rightThumbs = getThumbs(rightScreen.container)

    await fireEvent.focus(rightThumbs[0] as HTMLElement)
    await fireEvent.keyDown(rightThumbs[0] as HTMLElement, { key: 'ArrowRight' })

    expect(rightChange).toHaveBeenLastCalledWith([20, 21])

    const leftChange = vi.fn()
    const leftScreen = render(() => <Slider defaultValue={[20, 20]} onValueChange={leftChange} />)
    const leftThumbs = getThumbs(leftScreen.container)

    await fireEvent.focus(leftThumbs[0] as HTMLElement)
    await fireEvent.keyDown(leftThumbs[0] as HTMLElement, { key: 'ArrowLeft' })

    expect(leftChange).toHaveBeenLastCalledWith([19, 20])
  })

  test('dragging past another thumb moves the dragged value across the range when minStepsBetweenThumbs is 0', async () => {
    const screen = render(() => <Slider defaultValue={[20, 50]} />)
    const thumbs = getThumbs(screen.container)
    const track = screen.container.querySelector('[data-slot="track"]') as HTMLElement

    mockPointerCapture(thumbs[0] as HTMLElement)
    mockTrackRect(track)

    await fireEvent.pointerDown(thumbs[0] as HTMLElement, {
      button: 0,
      pointerId: 1,
      clientX: 20,
      clientY: 0,
    })
    await fireEvent.pointerMove(thumbs[0] as HTMLElement, {
      pointerId: 1,
      clientX: 60,
      clientY: 0,
    })
    await fireEvent.pointerMove(thumbs[0] as HTMLElement, {
      pointerId: 1,
      clientX: 70,
      clientY: 0,
    })

    expect(thumbs[0]?.getAttribute('aria-valuenow')).toBe('50')
    expect(thumbs[1]?.getAttribute('aria-valuenow')).toBe('70')

    await fireEvent.pointerUp(thumbs[0] as HTMLElement, {
      pointerId: 1,
      clientX: 70,
      clientY: 0,
    })
  })

  test('dragging the left thumb across the right thumb keeps updating when reversing direction', async () => {
    const onValueChange = vi.fn()
    const screen = render(() => <Slider defaultValue={[20, 50]} onValueChange={onValueChange} />)
    const thumbs = getThumbs(screen.container)
    const track = screen.container.querySelector('[data-slot="track"]') as HTMLElement

    mockPointerCapture(thumbs[0] as HTMLElement)
    mockTrackRect(track)

    await fireEvent.pointerDown(thumbs[0] as HTMLElement, {
      button: 0,
      pointerId: 1,
      clientX: 20,
      clientY: 0,
    })
    await fireEvent.pointerMove(thumbs[0] as HTMLElement, {
      pointerId: 1,
      clientX: 60,
      clientY: 0,
    })

    expect(onValueChange).toHaveBeenLastCalledWith([50, 60])
    expect(thumbs[0]?.getAttribute('aria-valuenow')).toBe('50')
    expect(thumbs[1]?.getAttribute('aria-valuenow')).toBe('60')
    expect(thumbs[1]?.getAttribute('data-dragging')).toBe('')

    await fireEvent.pointerMove(thumbs[0] as HTMLElement, {
      pointerId: 1,
      clientX: 40,
      clientY: 0,
    })

    expect(onValueChange).toHaveBeenLastCalledWith([40, 50])
    expect(thumbs[0]?.getAttribute('aria-valuenow')).toBe('40')
    expect(thumbs[1]?.getAttribute('aria-valuenow')).toBe('50')
    expect(thumbs[0]?.getAttribute('data-dragging')).toBe('')

    await fireEvent.pointerUp(thumbs[0] as HTMLElement, {
      pointerId: 1,
      clientX: 40,
      clientY: 0,
    })
  })

  test('can disable thumb crossing while dragging', async () => {
    const onValueChange = vi.fn()
    const screen = render(() => (
      <Slider defaultValue={[20, 50]} allowThumbCrossing={false} onValueChange={onValueChange} />
    ))
    const thumbs = getThumbs(screen.container)
    const track = screen.container.querySelector('[data-slot="track"]') as HTMLElement

    mockPointerCapture(thumbs[0] as HTMLElement)
    mockTrackRect(track)

    await fireEvent.pointerDown(thumbs[0] as HTMLElement, {
      button: 0,
      pointerId: 1,
      clientX: 20,
      clientY: 0,
    })
    await fireEvent.pointerMove(thumbs[0] as HTMLElement, {
      pointerId: 1,
      clientX: 60,
      clientY: 0,
    })
    await fireEvent.pointerMove(thumbs[0] as HTMLElement, {
      pointerId: 1,
      clientX: 70,
      clientY: 0,
    })

    expect(onValueChange).toHaveBeenLastCalledWith([50, 50])
    expect(thumbs[0]?.getAttribute('aria-valuenow')).toBe('50')
    expect(thumbs[1]?.getAttribute('aria-valuenow')).toBe('50')
    expect(thumbs[0]?.getAttribute('data-dragging')).toBe('')

    await fireEvent.pointerUp(thumbs[0] as HTMLElement, {
      pointerId: 1,
      clientX: 70,
      clientY: 0,
    })
  })

  test('dragging overlapping thumbs respects minStepsBetweenThumbs without moving the sibling', async () => {
    const screen = render(() => <Slider defaultValue={[20, 20]} minStepsBetweenThumbs={10} />)
    const thumbs = getThumbs(screen.container)
    const track = screen.container.querySelector('[data-slot="track"]') as HTMLElement

    mockPointerCapture(thumbs[0] as HTMLElement)
    mockTrackRect(track)

    await fireEvent.pointerDown(thumbs[0] as HTMLElement, {
      button: 0,
      pointerId: 1,
      clientX: 20,
      clientY: 0,
    })
    await fireEvent.pointerMove(thumbs[0] as HTMLElement, {
      pointerId: 1,
      clientX: 30,
      clientY: 0,
    })

    expect(thumbs[0]?.getAttribute('aria-valuenow')).toBe('10')
    expect(thumbs[1]?.getAttribute('aria-valuenow')).toBe('20')

    await fireEvent.pointerUp(thumbs[0] as HTMLElement, {
      pointerId: 1,
      clientX: 30,
      clientY: 0,
    })
  })

  test('single thumb uses default aria label', () => {
    const screen = render(() => <Slider defaultValue={10} />)
    const thumbs = getThumbs(screen.container)

    expect(thumbs.length).toBe(1)
    expect(thumbs[0]?.getAttribute('aria-label')).toBe('Thumb')
  })

  test('controlled single keeps rendered value while emitting updates', async () => {
    const onValueChange = vi.fn()
    const screen = render(() => <Slider value={10} onValueChange={onValueChange} />)
    const thumbs = getThumbs(screen.container)

    expect(thumbs[0]?.getAttribute('aria-valuenow')).toBe('10')

    await fireEvent.focus(thumbs[0] as HTMLElement)
    await fireEvent.keyDown(thumbs[0] as HTMLElement, { key: 'ArrowRight' })

    expect(onValueChange).toHaveBeenLastCalledWith(11)
    expect(thumbs[0]?.getAttribute('aria-valuenow')).toBe('10')
  })

  test('controlled range keeps rendered value while emitting updates', async () => {
    const onValueChange = vi.fn()
    const screen = render(() => <Slider value={[20, 80]} onValueChange={onValueChange} />)
    const thumbs = getThumbs(screen.container)

    expect(thumbs[0]?.getAttribute('aria-valuenow')).toBe('20')
    expect(thumbs[1]?.getAttribute('aria-valuenow')).toBe('80')

    await fireEvent.focus(thumbs[0] as HTMLElement)
    await fireEvent.keyDown(thumbs[0] as HTMLElement, { key: 'ArrowRight' })

    expect(onValueChange).toHaveBeenLastCalledWith([21, 80])
    expect(thumbs[0]?.getAttribute('aria-valuenow')).toBe('20')
    expect(thumbs[1]?.getAttribute('aria-valuenow')).toBe('80')
  })

  test('controlled single keeps thumb dom node stable after value updates', async () => {
    const screen = render(() => {
      const [value, setValue] = createSignal(10)

      return (
        <Slider
          value={value()}
          onValueChange={(nextValue) => {
            if (!Array.isArray(nextValue)) {
              setValue(nextValue)
            }
          }}
        />
      )
    })

    const thumbsBefore = getThumbs(screen.container)
    const thumbBefore = thumbsBefore[0]
    expect(thumbBefore).toBeDefined()

    await fireEvent.focus(thumbBefore as HTMLElement)
    await fireEvent.keyDown(thumbBefore as HTMLElement, { key: 'ArrowRight' })

    await waitFor(() => {
      expect(getThumbs(screen.container)[0]?.getAttribute('aria-valuenow')).toBe('11')
    })

    const thumbAfter = getThumbs(screen.container)[0]
    expect(thumbAfter).toBe(thumbBefore)
  })

  test('controlled range keeps thumb dom nodes stable after value updates', async () => {
    const screen = render(() => {
      const [value, setValue] = createSignal<number[]>([20, 80])

      return (
        <Slider
          value={value()}
          onValueChange={(nextValue) => {
            if (Array.isArray(nextValue)) {
              setValue(nextValue)
            }
          }}
        />
      )
    })

    const thumbsBefore = getThumbs(screen.container)
    const firstThumbBefore = thumbsBefore[0]
    const secondThumbBefore = thumbsBefore[1]
    expect(firstThumbBefore).toBeDefined()
    expect(secondThumbBefore).toBeDefined()

    await fireEvent.focus(firstThumbBefore as HTMLElement)
    await fireEvent.keyDown(firstThumbBefore as HTMLElement, { key: 'ArrowRight' })

    await waitFor(() => {
      const [firstThumb, secondThumb] = getThumbs(screen.container)
      expect(firstThumb?.getAttribute('aria-valuenow')).toBe('21')
      expect(secondThumb?.getAttribute('aria-valuenow')).toBe('80')
    })

    const [firstThumbAfter, secondThumbAfter] = getThumbs(screen.container)
    expect(firstThumbAfter).toBe(firstThumbBefore)
    expect(secondThumbAfter).toBe(secondThumbBefore)
  })

  test('controlled range keeps thumb updates stable with thumb style overrides', async () => {
    const screen = render(() => {
      const [value, setValue] = createSignal<number[]>([20, 80])

      return (
        <Slider
          value={value()}
          styles={{ thumb: { width: '20px' } }}
          onValueChange={(nextValue) => {
            if (Array.isArray(nextValue)) {
              setValue(nextValue)
            }
          }}
        />
      )
    })

    const [firstThumbBefore, secondThumbBefore] = getThumbs(screen.container)

    expect(firstThumbBefore?.style.width).toBe('20px')
    expect(secondThumbBefore?.style.width).toBe('20px')

    await fireEvent.focus(firstThumbBefore as HTMLElement)
    await fireEvent.keyDown(firstThumbBefore as HTMLElement, { key: 'ArrowRight' })

    await waitFor(() => {
      const [firstThumb, secondThumb] = getThumbs(screen.container)
      expect(firstThumb?.getAttribute('aria-valuenow')).toBe('21')
      expect(secondThumb?.getAttribute('aria-valuenow')).toBe('80')
      expect(firstThumb?.style.width).toBe('20px')
      expect(secondThumb?.style.width).toBe('20px')
    })

    const [firstThumbAfter, secondThumbAfter] = getThumbs(screen.container)
    expect(firstThumbAfter).toBe(firstThumbBefore)
    expect(secondThumbAfter).toBe(secondThumbBefore)
  })

  test('integrates with form validation on change', async () => {
    const { screen, thumb } = createForm(['change'])

    await fireEvent.focus(thumb())
    await fireEvent.keyDown(thumb(), { key: 'ArrowRight' })
    await fireEvent.blur(thumb())

    await waitFor(() => {
      expect(screen.getByText('Error message')).not.toBeNull()
    })

    await fireEvent.focus(thumb())
    for (let index = 0; index < 10; index += 1) {
      await fireEvent.keyDown(thumb(), { key: 'ArrowRight' })
    }
    await fireEvent.blur(thumb())

    await waitFor(() => {
      expect(screen.queryByText('Error message')).toBeNull()
    })
  })

  test('integrates with form validation on input', async () => {
    const { screen, thumb } = createForm(['input'])

    await fireEvent.focus(thumb())
    await fireEvent.keyDown(thumb(), { key: 'ArrowRight' })

    await waitFor(() => {
      expect(screen.getByText('Error message')).not.toBeNull()
    })

    await fireEvent.keyDown(thumb(), { key: 'End' })

    await waitFor(() => {
      expect(screen.queryByText('Error message')).toBeNull()
    })
  })

  test('forwards aria-invalid and aria-describedby to slider inputs', async () => {
    const { screen, input } = createForm(['change'])

    await fireEvent.submit(screen.container.querySelector('form') as HTMLFormElement)
    await waitFor(() => {
      expect(screen.getByText('Error message')).not.toBeNull()
    })

    const inputEl = input()
    expect(inputEl.getAttribute('aria-invalid')).toBe('true')

    const describedBy = inputEl.getAttribute('aria-describedby') ?? ''
    expect(describedBy).toContain('-error')
    expect(describedBy).toContain('-hint')
    expect(describedBy).toContain('-description')
    expect(describedBy).toContain('-help')
  })

  test('applies class overrides for root and thumb slots', () => {
    const screen = render(() => (
      <Slider classes={{ root: 'root-override', thumb: 'thumb-override' }} />
    ))

    const root = screen.container.querySelector('[data-slot="root"][id$="-root"]')
    const thumb = screen.container.querySelector('[data-slot="thumb"]')

    expect(root?.className).toContain('root-override')
    expect(thumb?.className).toContain('thumb-override')
  })

  test('applies style overrides for root and thumb slots', () => {
    const screen = render(() => (
      <Slider styles={{ root: { width: '200px' }, thumb: { width: '200px' } } as any} />
    ))

    const root = screen.container.querySelector(
      '[data-slot="root"][id$="-root"]',
    ) as HTMLElement | null
    const thumb = screen.container.querySelector('[data-slot="thumb"]') as HTMLElement | null

    expect(root?.style.width).toBe('200px')
    expect(thumb?.style.width).toBe('200px')
  })
})
