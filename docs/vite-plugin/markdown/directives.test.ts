import { describe, expect, test } from 'vitest'

import { parseSegments } from './directives'

describe('parseSegments', () => {
  test('parses example, widget and code-tabs directives', () => {
    const source = `
hello

:::example
name: Variants
:::

:::widget
name: intro-cards
props:
  title: Intro
:::

:::code-tabs
package: moraine
:::
`

    expect(parseSegments(source, '/tmp/docs/pages/introduction.md')).toEqual([
      { type: 'markdown', text: 'hello' },
      { type: 'example', name: 'Variants', source: './examples/variants.tsx' },
      { type: 'widget', widgetName: 'intro-cards', props: { title: 'Intro' } },
      { type: 'code-tabs', packageName: 'moraine' },
    ])
  })

  test('throws when code-tabs package is missing', () => {
    const source = `
:::code-tabs
name: moraine
:::
`

    expect(() => parseSegments(source, '/tmp/docs/pages/introduction.md')).toThrow(
      ':::code-tabs requires "package"',
    )
  })

  test('throws on unsupported directive blocks', () => {
    const source = `
:::video
src: demo.mp4
:::
`

    expect(() => parseSegments(source, '/tmp/docs/pages/introduction.md')).toThrow(
      'unsupported :::video block',
    )
  })
})
