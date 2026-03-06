import type { VariantProps } from 'cls-variant'
import { cva } from 'cls-variant/cva'

import { INPUT_VARIANT_CLASSES, SURFACE_HIGHLIGHT_VARIANT } from '../../shared/cva-common.class'

export const inputRootVariants = cva(
  'inline-flex w-full items-center overflow-hidden rounded-md transition-[color,box-shadow] focus-within:effect-fv-border data-invalid:effect-invalid focus-within:data-invalid:effect-invalid',
  {
    defaultVariants: {
      size: 'md',
      variant: 'outline',
    },
    variants: {
      size: {
        xs: 'h-7 text-xs leading-7',
        sm: 'h-8 text-xs leading-8',
        md: 'h-9 text-sm leading-9',
        lg: 'h-10 text-sm leading-10',
        xl: 'h-11 text-base leading-11',
      },
      variant: INPUT_VARIANT_CLASSES,
      highlight: SURFACE_HIGHLIGHT_VARIANT,
      disabled: {
        true: 'effect-dis',
      },
    },
  },
)

export const inputInputVariants = cva(
  'flex-1 min-w-0 h-full bg-transparent text-foreground outline-none style-placeholder disabled:effect-dis',
  {
    defaultVariants: {
      size: 'md',
      hasLeading: false,
      hasTrailing: false,
    },
    variants: {
      type: {
        file: 'text-muted-foreground file:(me-1.5 font-medium outline-none)',
      },
      size: {
        xs: 'var-input-1',
        sm: 'var-input-1.5',
        md: 'var-input-1.5',
        lg: 'var-input-2',
        xl: 'var-input-2',
      },
      hasLeading: { true: 'ps-$i-sm', false: 'ps-$i-lg' },
      hasTrailing: { true: 'pe-$i-sm', false: 'pe-$i-lg' },
    },
  },
)
export const inputLeadingVariants = cva('flex items-center shrink-0 text-muted-foreground', {
  defaultVariants: {
    size: 'md',
  },
  variants: {
    size: {
      xs: 'ps-2 gap-1',
      sm: 'ps-2.5 gap-1.5',
      md: 'ps-2.5 gap-1.5',
      lg: 'ps-3 gap-2',
      xl: 'ps-3 gap-2',
    },
  },
})

export const inputTrailingVariants = cva('flex items-center shrink-0 text-muted-foreground', {
  defaultVariants: {
    size: 'md',
  },
  variants: {
    size: {
      xs: 'pe-2 gap-1',
      sm: 'pe-2.5 gap-1.5',
      md: 'pe-2.5 gap-1.5',
      lg: 'pe-3 gap-2',
      xl: 'pe-3 gap-2',
    },
  },
})

export type InputVariantProps = VariantProps<typeof inputRootVariants>
