import { fireEvent, render } from '@solidjs/testing-library'
import { describe, expect, test } from 'vitest'

import { DocsApiReference } from './docs-api-reference'

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

globalThis.ResizeObserver = ResizeObserverMock as typeof ResizeObserver

describe('DocsApiReference', () => {
  test('renders attributes as vertical tabs without type and default columns', async () => {
    const screen = render(() => (
      <DocsApiReference
        model={{
          sections: [
            {
              id: 'attributes',
              heading: 'Attributes',
              props: [],
              slots: [
                {
                  name: 'root',
                  cssVariables: [
                    {
                      name: '--command-palette-height',
                      required: false,
                      type: 'string',
                      description: 'Controls the rendered panel height.',
                    },
                  ],
                  dataAttributes: [
                    {
                      name: 'data-open',
                      required: false,
                      type: 'string | undefined',
                      description: 'Present when the panel is open.',
                    },
                  ],
                  ariaAttributes: [],
                },
                {
                  name: 'empty',
                  cssVariables: [],
                  dataAttributes: [],
                  ariaAttributes: [],
                },
              ],
            },
          ],
        }}
      />
    ))

    expect(screen.getByRole('tablist').getAttribute('aria-orientation')).toBe('vertical')
    expect(screen.getByText('Attributes')).toBeDefined()
    expect(screen.getByRole('tab', { name: 'root' })).toBeDefined()
    expect(screen.getByRole('tab', { name: 'empty' })).toBeDefined()
    expect(screen.getByText('CSS Variable')).toBeDefined()
    expect(screen.queryByText('Type')).toBeNull()
    expect(screen.queryByText('Default')).toBeNull()

    await fireEvent.click(screen.getByRole('tab', { name: 'empty' }))

    expect(screen.getByText('No attribute metadata for this slot.')).toBeDefined()
  })
})
