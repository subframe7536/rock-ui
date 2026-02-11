import type { VariantProps } from 'cls-variant'
import { cva } from 'cls-variant/cva'

export const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md whitespace-nowrap font-500 transition cursor-pointer select-none gap-2 text-base transition-shadow focus-visible:effect-fv disabled:(effect-dis cursor-not-allowed) active:shadow-none',
  {
    defaultVariants: {
      size: 'default',
      variant: 'default',
    },
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow hover:bg-primary/90',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        outline:
          'border bg-background text-foreground shadow-xs hover:(bg-input text-input-foreground)',
        ghost: 'hover:(bg-accent text-accent-foreground hover:bg-accent/50)',
        link: 'text-primary underline-offset-4 hover:underline',
        destructive: 'text-destructive-foreground bg-destructive hover:bg-destructive/80',
      },
      size: {
        default: 'h-9 px-4 py-2 text-sm sm:h-8',
        lg: 'h-10 px-2.5 sm:h-9',
        sm: 'h-8 gap-1.5 px-1.5 sm:h-7',
        xl: 'h-11 sm:h-10 px-3',
        xs: 'h-7 sm:h-6 px-1 gap-1 text-sm',
        icon: 'size-9 sm:size-9',
        'icon-lg': 'size-10 sm:size-9',
        'icon-sm': 'size-8 sm:size-7',
        'icon-xl': 'h-11 sm:h-10',
        'icon-xs': 'h-7 sm:h-6',
      },
    },
  },
)

export type ButtonVariantProps = VariantProps<typeof buttonVariants>
