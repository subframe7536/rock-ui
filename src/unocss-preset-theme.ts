import type { Preset } from 'unocss'
import type { Theme } from 'unocss/preset-wind4'

import { transformerInjectPrefix } from './unocss-transformer/inject-prefix'
import type { TransformerInjectPrefixOption } from './unocss-transformer/inject-prefix'

export interface PresetThemeOptions extends Pick<TransformerInjectPrefixOption, 'beforeTransform'> {
  radiusRem?: number
  colors?: Record<string, unknown>
  icons?: Partial<Record<keyof typeof DEFAULT_ICONS, string>>
  enableComponentLayer?:
    | boolean
    | 'preservePrefix'
    | (Partial<TransformerInjectPrefixOption> & { preservePrefix?: boolean })
}

export const DEFAULT_ICONS = {
  arrowDown: 'i-lucide-arrow-down',
  arrowLeft: 'i-lucide-arrow-left',
  arrowRight: 'i-lucide-arrow-right',
  arrowUp: 'i-lucide-arrow-up',
  caution: 'i-lucide-circle-alert',
  check: 'i-lucide-check',
  chevronDoubleLeft: 'i-lucide-chevrons-left',
  chevronDoubleRight: 'i-lucide-chevrons-right',
  chevronDown: 'i-lucide-chevron-down',
  chevronLeft: 'i-lucide-chevron-left',
  chevronRight: 'i-lucide-chevron-right',
  chevronUp: 'i-lucide-chevron-up',
  close: 'i-lucide-x',
  copy: 'i-lucide-copy',
  copyCheck: 'i-lucide-copy-check',
  dark: 'i-lucide-moon',
  drag: 'i-lucide-grip-vertical',
  ellipsis: 'i-lucide-ellipsis',
  error: 'i-lucide-circle-x',
  external: 'i-lucide-arrow-up-right',
  eye: 'i-lucide-eye',
  eyeOff: 'i-lucide-eye-off',
  file: 'i-lucide-file',
  folder: 'i-lucide-folder',
  folderOpen: 'i-lucide-folder-open',
  hash: 'i-lucide-hash',
  info: 'i-lucide-info',
  light: 'i-lucide-sun',
  loading: 'i-lucide-loader-circle',
  menu: 'i-lucide-menu',
  minus: 'i-lucide-minus',
  panelClose: 'i-lucide-panel-left-close',
  panelOpen: 'i-lucide-panel-left-open',
  plus: 'i-lucide-plus',
  reload: 'i-lucide-rotate-ccw',
  search: 'i-lucide-search',
  stop: 'i-lucide-square',
  success: 'i-lucide-circle-check',
  system: 'i-lucide-monitor',
  tip: 'i-lucide-lightbulb',
  upload: 'i-lucide-upload',
  warning: 'i-lucide-triangle-alert',
} as const

const LIGHT_BASE_COLORS = {
  background: 'rgb(248, 247, 244)',
  foreground: 'rgb(26, 31, 46)',
  primary: { DEFAULT: 'hsl(214.9932 22.5930% 64.5044%)', foreground: 'hsl(0 0% 98.0392%)' },
  secondary: {
    DEFAULT: 'hsl(141.6000 13.2275% 62.9412%)',
    foreground: 'hsl(192.0000 100.0000% 99.0196%)',
  },
  card: { DEFAULT: 'rgb(250, 250, 248)', foreground: 'rgb(26, 31, 46)' },
  ring: 'hsl(215.3832 18.3663% 47.0286%)',
  popover: { DEFAULT: 'rgb(250, 250, 250)', foreground: 'rgb(26, 31, 46)' },
  muted: { DEFAULT: 'rgb(232, 230, 225)', foreground: 'rgb(107, 114, 128)' },
  accent: { DEFAULT: 'rgb(215, 219, 223)', foreground: 'rgb(26, 31, 46)' },
  border: 'rgb(232, 230, 225)',
  input: { DEFAULT: 'rgb(212, 217, 223)', foreground: 'rgb(26, 31, 46)' },
  destructive: { DEFAULT: 'rgb(199, 62, 58)', foreground: 'rgb(246, 234, 234)' },
} satisfies Theme['colors']

const DARK_BASE_COLORS = {
  background: 'rgb(37, 39, 38)',
  foreground: 'rgb(220, 220, 220)',
  primary: {
    DEFAULT: 'hsl(200.5658 97.8745% 85.9432%)',
    foreground: 'hsl(223.8136 0.0000% 3.9388%)',
  },
  secondary: {
    DEFAULT: 'hsl(48 33.3333% 97.0588%)',
    foreground: 'hsl(60 2.1277% 18.4314%)',
  },
  card: { DEFAULT: 'rgb(42, 45, 43)', foreground: 'rgb(220, 220, 220)' },
  ring: 'hsl(212.7183 29.9127% 84.0160%)',
  popover: { DEFAULT: 'rgb(51, 51, 51)', foreground: 'rgb(220, 220, 220)' },
  muted: { DEFAULT: 'rgb(56, 61, 58)', foreground: 'rgb(173, 173, 173)' },
  accent: { DEFAULT: 'rgb(96, 112, 118)', foreground: 'rgb(217, 220, 227)' },
  border: 'rgb(79, 79, 79)',
  input: { DEFAULT: 'rgb(65, 65, 65)', foreground: 'rgb(220, 220, 220)' },
  destructive: { DEFAULT: 'rgb(234, 97, 97)', foreground: 'rgb(240, 219, 219)' },
} satisfies Theme['colors']

const ROCK_COMPONENT_LAYER = 'rock-component'
const ROCK_PREFIX = 'rk-'
const RE_ROCK_PREFIX = new RegExp(ROCK_PREFIX, 'g')
const RE_ROCK_PREFIX_CLEAN = new RegExp(`\\\\?${ROCK_PREFIX}`, 'g')

const RE_ATTR = /^(data|aria)-(\w+):/
interface ResolvedPresetThemeOptions {
  radiusRem: number
  colors: Record<string, unknown>
  icons: Partial<Record<keyof typeof DEFAULT_ICONS, string>>
  enableComponentLayer: boolean
  preservePrefix: boolean
  prefix: string
  idFilter: (id: string) => boolean
  beforeTransform?: TransformerInjectPrefixOption['beforeTransform']
}

export function resolvePresetThemeOptions(
  options?: PresetThemeOptions,
): ResolvedPresetThemeOptions {
  const layerOpt = options?.enableComponentLayer ?? false
  const isObj = typeof layerOpt === 'object' && layerOpt !== null

  let enableComponentLayer = false
  let preservePrefix = false

  if (isObj) {
    enableComponentLayer = true
    if (layerOpt.preservePrefix) {
      preservePrefix = true
    }
  } else if (layerOpt) {
    enableComponentLayer = true
    if (layerOpt === 'preservePrefix') {
      preservePrefix = true
    }
  }

  return {
    radiusRem: options?.radiusRem ?? 0.5,
    colors: options?.colors ?? {},
    icons: options?.icons ?? {},
    enableComponentLayer,
    preservePrefix,
    prefix: (isObj && layerOpt.prefix) || ROCK_PREFIX,
    idFilter:
      (isObj && layerOpt.idFilter) || ((id: string) => id.includes('node_modules/rock-ui/')),
    beforeTransform: (isObj && layerOpt.beforeTransform) || options?.beforeTransform,
  }
}

export function presetTheme(options?: PresetThemeOptions): Preset<Theme> {
  const normalized = resolvePresetThemeOptions(options)

  const lightTheme: Theme = {
    colors: LIGHT_BASE_COLORS,
  }

  const darkThemeVars = Object.entries(DARK_BASE_COLORS)
    .flatMap(([k, v]) =>
      typeof v === 'string'
        ? `--colors-${k}: ${v}`
        : Object.entries(v).map(([sk, sv]) => `--colors-${k}-${sk}: ${sv}`),
    )
    .join(';\n')

  const transformers: Preset['transformers'] = []
  if (normalized.enableComponentLayer) {
    transformers.push(
      transformerInjectPrefix({
        prefix: normalized.prefix,
        idFilter: normalized.idFilter,
        beforeTransform: normalized.beforeTransform,
      }),
    )

    if (!normalized.preservePrefix) {
      transformers.push({
        name: 'transformer-rock',
        enforce: 'post',
        idFilter: normalized.idFilter,
        transform(code) {
          const source = code.toString()
          const nextSource = source.replace(RE_ROCK_PREFIX, '')
          if (nextSource !== source) {
            code.overwrite(0, code.original.length, nextSource)
          }
        },
      })
    }
  }

  const variants: Preset['variants'] = [
    (matcher) => {
      const match = matcher.match(RE_ATTR)
      if (!match) {
        return matcher
      }

      return {
        // Remove the prefix (e.g., "data-invalid:") from the matcher string
        matcher: matcher.slice(match[0].length),
        // Transform the selector to include the attribute: .foo -> .foo[data-invalid]
        selector: (s) => `${s}[${match[1]}-${match[2]}]`,
      }
    },
  ]

  if (normalized.enableComponentLayer) {
    variants.push((matcher) => {
      if (!matcher.startsWith(ROCK_PREFIX)) {
        return matcher
      }

      return {
        matcher: matcher.slice(ROCK_PREFIX.length),
        layer: ROCK_COMPONENT_LAYER,
      }
    })
  }
  return {
    name: 'preset-theme-rock',
    theme: {
      ...lightTheme,
      animation: {
        keyframes: {
          'accordion-down':
            '{ from { height: 0 } to { height: var(--kb-accordion-content-height) } }',
          'accordion-up':
            '{ from { height: var(--kb-accordion-content-height) } to { height: 0 } }',
        },
        timingFns: {
          'accordion-down': 'ease-in-out',
          'accordion-up': 'ease-in-out',
        },
        durations: {
          'accordion-down': '150ms',
          'accordion-up': '150ms',
        },
      },
    },
    layers: {
      [ROCK_COMPONENT_LAYER]: -1,
      default: 1,
    },
    transformers,
    variants,
    postprocess:
      normalized.enableComponentLayer && !normalized.preservePrefix
        ? [
            (util) => {
              if (util.layer !== ROCK_COMPONENT_LAYER) {
                return
              }

              util.selector = util.selector.replace(RE_ROCK_PREFIX_CLEAN, '')
              if (util.parent) {
                util.parent = util.parent.replace(RE_ROCK_PREFIX_CLEAN, '')
              }
            },
          ]
        : undefined,
    shortcuts: [
      ['effect-fv', 'outline-none ring-3px ring-ring/30'],
      ['effect-fv-border', 'outline-none border-ring ring-3px ring-ring/30'],
      ['transition-flex-basis', '[transition-property:flex-basis]'],
      ['style-placeholder', 'placeholder:(text-muted-foreground select-none)'],
      [
        'style-input-number',
        '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
      ],
      [
        'style-accordion-content',
        '[&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4',
      ],
      ['surface-outline', 'ring-1 ring-border'],
      ['surface-outline-inset', 'ring ring-inset ring-border'],
      ['surface-highlight', 'ring-1 ring-border/50'],
      ['surface-overlay', 'ring-1 ring-foreground/10'],
      ['hidden-hitless', 'opacity-0 pointer-events-none'],
      [
        'effect-invalid',
        'border-destructive ring-3 ring-destructive/20 dark:(border-destructive/50 ring-destructive/40)',
      ],
      ['effect-dis', 'opacity-64 pointer-events-none'],
      ...Object.entries(DEFAULT_ICONS).map(
        ([k, v]) =>
          [`icon-${k.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()}`, v] as [string, string],
      ),
    ],
    rules: [
      [
        /var-input-([\d.]+)/,
        ([, num]) => ({
          '--i-sm': `calc(var(--spacing) * ${num})`,
          '--i-lg': `calc(var(--spacing) * ${Number(num) + 1})`,
        }),
      ],
      [
        /var-progress-([\d.]+)/,
        ([, num]) => ({
          '--p-size': `calc(var(--spacing) * ${num})`,
        }),
      ],
      [
        /var-select-([\d.]+)-([\d.]+)-([\d.]+)/,
        ([, h, px, ps]) => ({
          '--s-h': `calc(var(--spacing) * ${h})`,
          '--s-px': `calc(var(--spacing) * ${px})`,
          '--s-ps': `calc(var(--spacing) * ${ps})`,
        }),
      ],
      [
        /var-stepper-([\d.]+)-([\d.]+)-([\d.]+)-([\d.]+)/,
        ([, triggerSize, separatorOffset, gap, verticalPt]) => ({
          '--st-size': `calc(var(--spacing) * ${triggerSize})`,
          '--st-sep-x': `calc(var(--spacing) * ${separatorOffset})`,
          '--st-sep-top': `calc(var(--spacing) * ${Number(triggerSize) + 1})`,
          '--st-gap': `calc(var(--spacing) * ${gap})`,
          '--st-pt': `calc(var(--spacing) * ${verticalPt})`,
        }),
      ],
      [
        /var-slider-([\d.]+)/,
        ([, num]) => ({
          '--s-size': `${num}px`,
        }),
      ],
    ],
    preflights: [
      {
        getCSS: () => `:root {
--radius: ${normalized.radiusRem}rem;
--radius-sm: calc(var(--radius) - 4px);
--radius-md: calc(var(--radius) - 2px);
--radius-lg: var(--radius);
--radius-xl: calc(var(--radius) + 2px);
--ui-radius: var(--radius);
--ui-container: 80rem;
}
.dark {
${darkThemeVars};
}`,
      },
    ],
  }
}
