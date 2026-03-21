import type { SourceCodeTransformer } from 'unocss'

import { runTransform } from './shared'

export function prefixClassList(value: string, prefix: string): string {
  const tokens = value.match(/\S+/g)

  if (!tokens) {
    return value
  }

  return tokens.map((token) => (token.startsWith(prefix) ? token : `${prefix}${token}`)).join(' ')
}

export interface TransformerInjectPrefixOption {
  prefix: string
  /**
   * Custom filter function
   * @param id file path
   * @default id => id.includes('node_modules/rock-ui/')
   */
  idFilter?: (id: string) => boolean
  /**
   * Hooks before inject prefix
   */
  beforeTransform?: (...args: Parameters<SourceCodeTransformer['transform']>) => void
}

export function transformerInjectPrefix(
  options: TransformerInjectPrefixOption,
): SourceCodeTransformer {
  const { prefix, idFilter, beforeTransform } = options
  return {
    name: 'transformer-inject-prefix',
    enforce: 'pre',
    idFilter,
    async transform(code, id, context) {
      beforeTransform?.(code, id, context)
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
