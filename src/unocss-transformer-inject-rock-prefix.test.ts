import MagicString from 'magic-string'
import { describe, expect, test } from 'vitest'

import { ROCK_PREFIX } from './unocss-preset-theme'
import {
  createInjectRockPrefixTransformer,
  prefixClassList,
} from './unocss-transformer-inject-rock-prefix'

type InjectTransformer = ReturnType<typeof createInjectRockPrefixTransformer>
type TransformContext = Parameters<InjectTransformer['transform']>[2]
const TEST_PREFIX = ROCK_PREFIX

async function runTransform(source: string, id: string): Promise<string> {
  const transformer = createInjectRockPrefixTransformer()
  const code = new MagicString(source)
  const context = {
    tokens: new Set<string>(),
  } as unknown as TransformContext

  await transformer.transform(code, id, context)

  return code.toString()
}

describe('transformer-inject-rock-prefix', () => {
  test('prefixClassList is idempotent and ignores empty tokens', () => {
    expect(prefixClassList(`${TEST_PREFIX}a b   c`)).toBe(
      `${TEST_PREFIX}a ${TEST_PREFIX}b ${TEST_PREFIX}c`,
    )
    expect(prefixClassList('   ')).toBe('   ')
  })

  test('prefixes class strings in cva base, variants and compoundVariants.class only', async () => {
    const output = await runTransform(
      `
export const card = cva('p-2 text-sm', {
  defaultVariants: {
    variant: 'table',
    size: 'md',
  },
  variants: {
    variant: {
      table: 'rounded border',
      list: 'text-xs',
    },
    disabled: {
      true: 'opacity-50',
    },
  },
  compoundVariants: [
    { variant: 'table', size: 'md', class: 'ring-1 ring-border' },
  ],
})
`,
      'src/example.class.ts',
    )

    expect(output).toContain(`cva('${TEST_PREFIX}p-2 ${TEST_PREFIX}text-sm', {`)
    expect(output).toContain(`table: '${TEST_PREFIX}rounded ${TEST_PREFIX}border'`)
    expect(output).toContain(`list: '${TEST_PREFIX}text-xs'`)
    expect(output).toContain(`true: '${TEST_PREFIX}opacity-50'`)
    expect(output).toContain(`class: '${TEST_PREFIX}ring-1 ${TEST_PREFIX}ring-border'`)
    expect(output).toContain("defaultVariants: {\n    variant: 'table',\n    size: 'md',")
    expect(output).toContain(
      `{ variant: 'table', size: 'md', class: '${TEST_PREFIX}ring-1 ${TEST_PREFIX}ring-border' }`,
    )
    expect(output).not.toContain(`${TEST_PREFIX}table`)
    expect(output).not.toContain(`${TEST_PREFIX}md`)
  })

  test('prefixes only class operands inside tsx class expressions', async () => {
    const output = await runTransform(
      `
const view = (
  <div
    class={cn('a b', cond && 'c', local.variant === 'table' && 'd')}
  >
    <span
      class={fooVariants(
        { size: local.variant === 'table' ? 'md' : 'sm' },
        'x y',
        cond && 'z',
        local.classes?.root,
      )}
    />
    <i class="plain static" />
  </div>
)
`,
      'src/example.tsx',
    )

    expect(output).toContain(
      `cn('${TEST_PREFIX}a ${TEST_PREFIX}b', cond && '${TEST_PREFIX}c', local.variant === 'table' && '${TEST_PREFIX}d')`,
    )
    expect(output).toContain(
      `fooVariants(\n        { size: local.variant === 'table' ? 'md' : 'sm' },\n        '${TEST_PREFIX}x ${TEST_PREFIX}y',\n        cond && '${TEST_PREFIX}z',\n        local.classes?.root,`,
    )
    expect(output).toContain(`<i class="${TEST_PREFIX}plain ${TEST_PREFIX}static" />`)
    expect(output).not.toContain(`${TEST_PREFIX}table`)
    expect(output).not.toContain(`${TEST_PREFIX}md`)
    expect(output).not.toContain(`${TEST_PREFIX}sm`)
  })

  test('is idempotent when transformer runs multiple times', async () => {
    const source = `const view = <div class={'${TEST_PREFIX}a b'} />`
    const once = await runTransform(source, 'src/once.tsx')
    const twice = await runTransform(once, 'src/once.tsx')

    expect(once).toContain(`class={'${TEST_PREFIX}a ${TEST_PREFIX}b'}`)
    expect(twice).toBe(once)
  })

  test('does not crash when matching cva calls', async () => {
    await expect(
      runTransform(
        "export const value = cva('p-2', { variants: { size: { sm: 'text-sm' } } })",
        'src/regression.class.ts',
      ),
    ).resolves.toContain(
      `cva('${TEST_PREFIX}p-2', { variants: { size: { sm: '${TEST_PREFIX}text-sm' } } })`,
    )
  })
})
