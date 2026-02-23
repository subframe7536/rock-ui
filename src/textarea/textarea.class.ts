import type { VariantProps } from 'cls-variant'
import { cva } from 'cls-variant/cva'

export const textareaRootVariants = cva(
  'inline-flex w-full overflow-hidden rounded-md border border-input bg-transparent transition-[color,box-shadow] dark:bg-input/30 focus-within:(border-ring ring-3 ring-ring/50) has-[[data-slot=base][aria-invalid=true]]:(border-destructive ring-3 ring-destructive/20) dark:has-[[data-slot=base][aria-invalid=true]]:(border-destructive/50 ring-destructive/40)',
  {
    defaultVariants: {
      color: 'primary',
      size: 'md',
      variant: 'outline',
    },
    variants: {
      color: {
        primary: '',
        secondary: '',
        neutral: '',
        error: '',
      },
      size: {
        xs: 'text-xs',
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-sm',
        xl: 'text-base',
      },
      variant: {
        outline: 'bg-transparent',
        soft: 'border-transparent bg-muted/50 hover:bg-muted',
        subtle: 'border border-border bg-muted',
        ghost: 'border-transparent bg-transparent hover:bg-muted',
        none: 'border-transparent bg-transparent',
      },
      highlight: {
        true: 'ring-1 ring-border/50',
      },
      disabled: {
        true: 'cursor-not-allowed opacity-75',
      },
    },
    compoundVariants: [],
  },
)

export const textareaBaseVariants = cva(
  'flex-1 min-w-0 bg-transparent text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed',
  {
    defaultVariants: {
      size: 'md',
      autoresize: false,
    },
    variants: {
      size: {
        xs: 'min-h-17 py-1',
        sm: 'min-h-18 py-1.5',
        md: 'min-h-20 py-1.5',
        lg: 'min-h-22 py-2',
        xl: 'min-h-24 py-2',
      },
      autoresize: {
        true: 'resize-none',
        false: 'resize-y',
      },
    },
  },
)

export const textareaPaddingVariants = cva('ps-2.5 pe-2.5', {
  defaultVariants: {
    size: 'md',
  },
  variants: {
    size: {
      xs: 'ps-2 pe-2',
      sm: 'ps-2.5 pe-2.5',
      md: 'ps-2.5 pe-2.5',
      lg: 'ps-3 pe-3',
      xl: 'ps-3 pe-3',
    },
  },
})

export type TextareaVariantProps = VariantProps<typeof textareaRootVariants> &
  VariantProps<typeof textareaBaseVariants> &
  VariantProps<typeof textareaPaddingVariants>
