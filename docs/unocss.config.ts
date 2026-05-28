import lucideIcons from '@iconify-json/lucide/icons.json' with { type: 'json' }
import type { PresetWind4Theme } from '@subf/unocss'
import { defineConfig, presetIcons, presetWind4, transformerVariantGroup } from '@subf/unocss'

import { presetMoraine } from '../src/unocss/theme'

const transformer = transformerVariantGroup()
const markdownShortCuts = {
  'docs-h1': 'text-3xl text-foreground font-bold mb-3 mt-6 sm:mt-10',
  'docs-h2':
    'text-xl sm:text-2xl text-foreground font-semibold mb-3 sm:mb-4 mt-8 sm:mt-11 pb-2 border-b border-border/80',
  'docs-h3': 'text-lg sm:text-xl text-foreground font-semibold mb-2 mt-5 sm:mt-7',
  'docs-h4': 'text-sm sm:text-base text-foreground font-semibold mb-1.5 mt-4',
  'docs-h5': 'text-sm text-foreground font-semibold mb-1 mt-3',
  'docs-p': 'text-muted-foreground leading-6 mb-3',
  'docs-ul': 'list-disc list-outside pl-5 mb-3 text-muted-foreground',
  'docs-ol': 'list-decimal list-outside pl-5 mb-3 text-muted-foreground',
  'docs-li': 'leading-6',
  'docs-a': 'text-primary underline underline-offset-2 hover:text-primary/80',
  'docs-blockquote': 'my-4 rounded-md bg-muted/60 b-1 b-border px-4 py-3 text-muted-foreground',
  'docs-strong': 'text-foreground font-semibold',
  'docs-hr': 'border-t border-border my-6',
  'docs-inline-code':
    'mx-[0.1rem] px-[0.3rem] py-0 bg-muted border border-border rounded-[0.35rem] text-sm font-mono [h2>&]:text-xl [h2>&]:lg:text-2xl',
  'docs-pre': 'b-1 b-border rounded-lg bg-muted overflow-x-auto text-sm my-4 p-5',
  'docs-code-block': 'b-1 b-border rounded-lg overflow-hidden my-4 bg-muted/80',
  'docs-code-block-inner': 'text-xs leading-relaxed overflow-x-auto font-mono',
}
export default defineConfig<PresetWind4Theme>({
  shortcuts: markdownShortCuts,
  safelist: Object.keys(markdownShortCuts),
  presets: [
    presetWind4(),
    presetIcons({
      scale: 1.2,
      collections: {
        lucide: () => lucideIcons,
      },
    }),
    presetMoraine({
      enableComponentLayer: {
        strategy: 'prefix',
        idFilter(id: string) {
          return id.includes('/src/') && (id.endsWith('.class.ts') || id.endsWith('.tsx'))
        },
        beforeTransform(code, id, ctx) {
          transformer.transform(code, id, ctx)
        },
      },
    }),
  ],
  theme: {
    font: {
      sans: 'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
      mono: 'Maple Mono NF CN, Maple Mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    },
  },
  content: {
    pipeline: {
      include: [
        './**/*.tsx',
        './**/*.md',
        './**/*.class.ts',
        '../src/**/*.tsx',
        '../src/**/*.class.ts',
        'node_modules/**/*.*',
      ],
    },
  },
  preflights: [
    {
      getCSS: () => `
:root {
  --background: hsl(190, 50%, 98%);
  --foreground: hsl(205, 42%, 10%);
  --card: hsl(180, 100%, 99%);
  --card-foreground: hsl(205, 42%, 10%);
  --popover: hsl(180, 100%, 99%);
  --popover-foreground: hsl(205, 42%, 10%);
  --primary: hsl(189, 100%, 31%);
  --primary-foreground: hsl(190, 50%, 98%);
  --secondary: hsl(183, 39%, 89%);
  --secondary-foreground: hsl(202, 49%, 15%);
  --muted: hsl(195, 38%, 92%);
  --muted-foreground: hsl(203, 19%, 38%);
  --accent: hsl(180, 45%, 83%);
  --accent-foreground: hsl(202, 68%, 15%);
  --destructive: hsl(357, 70%, 50%);
  --destructive-foreground: hsl(10, 75%, 98%);
  --border: hsl(198, 24%, 84%);
  --input: hsl(198, 24%, 84%);
  --ring: hsl(188, 100%, 32%);
  --radius: 0.5rem;
  --shadow-x: 0;
  --shadow-y: 1px;
  --shadow-blur: 3px;
  --shadow-spread: 0px;
  --shadow-opacity: 0.1;
  --shadow-color: hsl(0, 0%, 0%);
  --shadow-2xs: 0 1px 3px 0px hsl(0 0% 0% / 0.05);
  --shadow-xs: 0 1px 3px 0px hsl(0 0% 0% / 0.05);
  --shadow-sm: 0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 1px 2px -1px hsl(0 0% 0% / 0.10);
  --shadow: 0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 1px 2px -1px hsl(0 0% 0% / 0.10);
  --shadow-md: 0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 2px 4px -1px hsl(0 0% 0% / 0.10);
  --shadow-lg: 0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 4px 6px -1px hsl(0 0% 0% / 0.10);
  --shadow-xl: 0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 8px 10px -1px hsl(0 0% 0% / 0.10);
  --shadow-2xl: 0 1px 3px 0px hsl(0 0% 0% / 0.25);
  --tracking-normal: 0;
  --spacing: 0.25rem;
}

.dark {
  --background: hsl(203, 47%, 7%);
  --foreground: hsl(193, 28%, 90%);
  --card: hsl(202, 42%, 9%);
  --card-foreground: hsl(193, 28%, 90%);
  --popover: hsl(202, 42%, 9%);
  --popover-foreground: hsl(193, 28%, 90%);
  --primary: hsl(184, 100%, 36%);
  --primary-foreground: hsl(203, 53%, 6%);
  --secondary: hsl(201, 38%, 15%);
  --secondary-foreground: hsl(194, 19%, 86%);
  --muted: hsl(201, 35%, 13%);
  --muted-foreground: hsl(196, 14%, 61%);
  --accent: hsl(191, 59%, 15%);
  --accent-foreground: hsl(194, 30%, 92%);
  --destructive: hsl(2, 86%, 66%);
  --destructive-foreground: hsl(5, 33%, 8%);
  --border: hsl(202, 24%, 21%);
  --input: hsl(202, 26%, 19%);
  --ring: hsl(184, 100%, 36%);
  --shadow-x: 0;
  --shadow-y: 1px;
  --shadow-blur: 3px;
  --shadow-spread: 0px;
  --shadow-opacity: 0.1;
  --shadow-color: hsl(0, 0%, 0%);
  --shadow-2xs: 0 1px 3px 0px hsl(0 0% 0% / 0.05);
  --shadow-xs: 0 1px 3px 0px hsl(0 0% 0% / 0.05);
  --shadow-sm: 0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 1px 2px -1px hsl(0 0% 0% / 0.10);
  --shadow: 0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 1px 2px -1px hsl(0 0% 0% / 0.10);
  --shadow-md: 0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 2px 4px -1px hsl(0 0% 0% / 0.10);
  --shadow-lg: 0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 4px 6px -1px hsl(0 0% 0% / 0.10);
  --shadow-xl: 0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 8px 10px -1px hsl(0 0% 0% / 0.10);
  --shadow-2xl: 0 1px 3px 0px hsl(0 0% 0% / 0.25);
}
      `,
    },
  ],
})
