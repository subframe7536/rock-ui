import { unocss } from 'rolldown-plugin-unocss'
import type { InlineConfig } from 'tsdown'
import { defineConfig } from 'tsdown'
import solid from 'vite-plugin-solid'

const entry = ['./src/index.ts']
const base: InlineConfig = {
  entry,
  unbundle: true,
  exports: true,
  external: ['@solid-primitives/props', '@solid-primitives/utils', '@kobalte/core'],
}
// export both js and jsx
export default defineConfig([
  {
    ...base,
    platform: 'browser',
    // use the solid plugin to handle jsx
    plugins: [unocss(), solid()],
    dts: { oxc: true },
  },
  {
    ...base,
    platform: 'neutral',
    plugins: [unocss({ generateCSS: false })],
    outExtensions: () => ({ js: '.jsx' }),
    dts: false,
  },
])
