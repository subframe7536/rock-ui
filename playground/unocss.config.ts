import lucideIcons from '@iconify-json/lucide/icons.json' with { type: 'json' }
import type { PresetWind4Theme } from 'unocss'
import { defineConfig, presetIcons, presetWind4, transformerVariantGroup } from 'unocss'
import { presetAnimations } from 'unocss-preset-animations'

import { presetTheme } from '../src/unocss-preset-theme'

const transformer = transformerVariantGroup()
export default defineConfig<PresetWind4Theme>({
  presets: [
    presetWind4(),
    presetIcons({
      scale: 1.2,
      collections: {
        lucide: () => lucideIcons,
      },
    }),
    presetAnimations() as any,
    presetTheme({
      enableComponentLayer: {
        idFilter(id: string) {
          return id.endsWith('.class.ts') || id.endsWith('.tsx')
        },
        beforeTransform(code, id, ctx) {
          transformer.transform(code, id, ctx)
        },
      },
    }),
  ],
  content: {
    pipeline: {
      include: [
        './**/*.tsx',
        './**/*.class.ts',
        '../src/**/*.tsx',
        '../src/**/*.class.ts',
        'node_modules/**/*.*',
      ],
    },
  },
})
