import type { VariantProps } from 'cls-variant'
import { cva } from 'cls-variant/cva'

export const kbdVariants = cva(
  'inline-flex items-center justify-center rounded border border-border bg-muted font-mono font-medium leading-none text-muted-foreground uppercase select-none',
  {
    defaultVariants: {
      size: 'md',
    },
    variants: {
      size: {
        xs: 'h-4 min-w-4 px-1 text-10px',
        sm: 'h-5 min-w-5 px-1 text-10px',
        md: 'h-5.5 min-w-5.5 px-1.5 text-10px',
        lg: 'h-6 min-w-6 px-2 text-xs',
        xl: 'h-7 min-w-7 px-2 text-xs',
      },
    },
  },
)

export type KbdVariantProps = VariantProps<typeof kbdVariants>
