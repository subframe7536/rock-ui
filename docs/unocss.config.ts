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
  --background: oklch(0.985 0.006 210);
  --foreground: oklch(0.22 0.025 238);
  --card: oklch(0.996 0.004 210);
  --card-foreground: oklch(0.22 0.025 238);
  --popover: oklch(0.996 0.004 210);
  --popover-foreground: oklch(0.22 0.025 238);
  --primary: oklch(0.55 0.14 210);
  --primary-foreground: oklch(0.985 0.006 210);
  --secondary: oklch(0.93 0.022 202);
  --secondary-foreground: oklch(0.28 0.04 238);
  --muted: oklch(0.94 0.014 220);
  --muted-foreground: oklch(0.49 0.035 238);
  --accent: oklch(0.9 0.04 196);
  --accent-foreground: oklch(0.28 0.05 238);
  --destructive: oklch(0.57 0.21 25);
  --destructive-foreground: oklch(0.985 0.006 25);
  --border: oklch(0.88 0.018 225);
  --input: oklch(0.88 0.018 225);
  --ring: oklch(0.58 0.13 210);
  --chart-1: oklch(0.55 0.14 210);
  --chart-2: oklch(0.62 0.12 178);
  --chart-3: oklch(0.64 0.15 37);
  --chart-4: oklch(0.56 0.12 285);
  --chart-5: oklch(0.62 0.12 140);
  --sidebar: oklch(0.955 0.012 225);
  --sidebar-foreground: oklch(0.25 0.035 238);
  --sidebar-primary: oklch(0.55 0.14 210);
  --sidebar-primary-foreground: oklch(0.985 0.006 210);
  --sidebar-accent: oklch(0.9 0.025 218);
  --sidebar-accent-foreground: oklch(0.31 0.055 224);
  --sidebar-border: oklch(0.86 0.018 225);
  --sidebar-ring: oklch(0.58 0.13 210);
  --radius: 0.5rem;
  --shadow-x: 0;
  --shadow-y: 1px;
  --shadow-blur: 3px;
  --shadow-spread: 0px;
  --shadow-opacity: 0.1;
  --shadow-color: oklch(0 0 0);
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
  --background: oklch(0.18 0.02 238);
  --foreground: oklch(0.93 0.012 215);
  --card: oklch(0.205 0.022 238);
  --card-foreground: oklch(0.93 0.012 215);
  --popover: oklch(0.205 0.022 238);
  --popover-foreground: oklch(0.93 0.012 215);
  --primary: oklch(0.68 0.12 202);
  --primary-foreground: oklch(0.17 0.02 238);
  --secondary: oklch(0.27 0.03 235);
  --secondary-foreground: oklch(0.9 0.012 215);
  --muted: oklch(0.25 0.026 235);
  --muted-foreground: oklch(0.7 0.025 220);
  --accent: oklch(0.31 0.045 218);
  --accent-foreground: oklch(0.94 0.012 215);
  --destructive: oklch(0.68 0.18 25);
  --destructive-foreground: oklch(0.18 0.02 25);
  --border: oklch(0.33 0.026 235);
  --input: oklch(0.31 0.026 235);
  --ring: oklch(0.68 0.12 202);
  --chart-1: oklch(0.68 0.12 202);
  --chart-2: oklch(0.7 0.11 165);
  --chart-3: oklch(0.75 0.13 58);
  --chart-4: oklch(0.7 0.12 285);
  --chart-5: oklch(0.68 0.11 140);
  --sidebar: oklch(0.16 0.018 238);
  --sidebar-foreground: oklch(0.9 0.012 215);
  --sidebar-primary: oklch(0.68 0.12 202);
  --sidebar-primary-foreground: oklch(0.17 0.02 238);
  --sidebar-accent: oklch(0.25 0.026 235);
  --sidebar-accent-foreground: oklch(0.93 0.012 215);
  --sidebar-border: oklch(0.29 0.024 235);
  --sidebar-ring: oklch(0.68 0.12 202);
  --shadow-x: 0;
  --shadow-y: 1px;
  --shadow-blur: 3px;
  --shadow-spread: 0px;
  --shadow-opacity: 0.1;
  --shadow-color: oklch(0 0 0);
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
