import { presetWind4, transformerVariantGroup, presetIcons, defineConfig } from 'unocss'
import { presetAnimations } from 'unocss-preset-animations'
import { presetFunctionCompletion, presetObjectCompletion } from 'unocss-preset-completion'

export default defineConfig({
  presets: [
    presetWind4(),
    presetIcons({
      scale: 1.2,
    }),
    presetAnimations(),
    presetObjectCompletion(),
    presetFunctionCompletion(),
  ],
  transformers: [transformerVariantGroup()],
  theme: {
    animation: {
      durations: {
        slideup: '.3s',
        slidedown: '.3s',
      },
      timingFns: {
        slideup: 'ease-out',
        slidedown: 'ease-out',
      },
      keyframes: {
        slideup: `
{
    0% {
        height: var(--rock-collapsible-content-height);
    }
    100% {
        height: 0;
    }
}`,
        slidedown: `
{
    0% {
        height: 0;
    }
    100% {
        height: var(--rock-collapsible-content-height);
    }
}`,
      },
    },
  },
})
