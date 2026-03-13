import type { SourceCodeTransformer } from 'unocss'

import { runTransform } from './unocss-transformer-shared'

const TSX_SUFFIX = '.tsx'
const CLASS_TS_SUFFIX = '.class.ts'

function isClassFile(id: string): boolean {
  return id.endsWith(CLASS_TS_SUFFIX)
}

function isTsxFile(id: string): boolean {
  return id.endsWith(TSX_SUFFIX)
}

export function prefixClassList(value: string, prefix: string): string {
  const tokens = value.match(/\S+/g)

  if (!tokens) {
    return value
  }

  return tokens.map((token) => (token.startsWith(prefix) ? token : `${prefix}${token}`)).join(' ')
}

export function createInjectRockPrefixTransformer(prefix: string): SourceCodeTransformer {
  return {
    name: 'transformer-inject-rock-prefix',
    enforce: 'pre',
    idFilter: (id) => isClassFile(id) || isTsxFile(id),
    transform(code, id) {
      runTransform(code, id, (start, end, text, source) => {
        const nextValue = prefixClassList(text, prefix)
        const originalSlice = source.slice(start, end)

        if (nextValue === originalSlice) {
          return null
        }

        return { start, end, value: nextValue }
      })
    },
  }
}
