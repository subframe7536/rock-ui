import type { VariantProps } from 'cls-variant'
import { cva } from 'cls-variant/cva'

export const radioGroupFieldsetVariants = cva('flex gap-x-2', {
  defaultVariants: {
    orientation: 'vertical',
    size: 'md',
  },
  variants: {
    orientation: {
      horizontal: 'flex-row',
      vertical: 'flex-col',
    },
    size: {
      xs: 'gap-y-0.5',
      sm: 'gap-y-0.5',
      md: 'gap-y-1',
      lg: 'gap-y-1',
      xl: 'gap-y-1.5',
    },
  },
})

export const radioGroupLegendVariants = cva('mb-1 block font-medium text-foreground', {
  defaultVariants: {
    size: 'md',
  },
  variants: {
    size: {
      xs: 'text-xs',
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-sm',
      xl: 'text-base',
    },
    required: {
      true: "after:(ms-0.5 text-destructive content-['*'])",
    },
  },
})

export const radioGroupItemVariants = cva('flex items-start', {
  defaultVariants: {
    size: 'md',
    indicator: 'start',
  },
  variants: {
    size: {
      xs: 'text-xs',
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-sm',
      xl: 'text-base',
    },
    variant: {
      card: 'rounded-lg border',
      table: 'border',
    },
    indicator: {
      start: 'flex-row',
      end: 'flex-row-reverse',
    },
    disabled: {
      true: 'opacity-75 cursor-not-allowed',
    },
  },
  compoundVariants: [],
})

export const radioGroupCardPaddingVariants = cva('p-3.5', {
  defaultVariants: {
    size: 'md',
  },
  variants: {
    size: {
      xs: 'p-2.5',
      sm: 'p-3',
      md: 'p-3.5',
      lg: 'p-4',
      xl: 'p-4.5',
    },
  },
})

export const radioGroupTablePaddingVariants = cva('p-3.5', {
  defaultVariants: {
    size: 'md',
  },
  variants: {
    size: {
      xs: 'p-2.5',
      sm: 'p-3',
      md: 'p-3.5',
      lg: 'p-4',
      xl: 'p-4.5',
    },
  },
})

export const radioGroupTableOrientationVariants = cva(
  'first-of-type:rounded-t-lg last-of-type:rounded-b-lg -mt-px first:mt-0',
  {
    defaultVariants: {
      orientation: 'vertical',
    },
    variants: {
      orientation: {
        horizontal: 'first-of-type:rounded-s-lg last-of-type:rounded-e-lg -ms-px first:ms-0',
        vertical: 'first-of-type:rounded-t-lg last-of-type:rounded-b-lg -mt-px first:mt-0',
      },
    },
  },
)

export const radioGroupCardCheckedColorVariants = cva('', {
  defaultVariants: {
    color: 'primary',
  },
  variants: {
    color: {
      primary: 'data-checked:border-primary',
      secondary: 'data-checked:border-secondary',
      neutral: 'data-checked:border-foreground',
      error: 'data-checked:border-destructive',
    },
  },
})

export const radioGroupTableCheckedColorVariants = cva('z-1', {
  defaultVariants: {
    color: 'primary',
  },
  variants: {
    color: {
      primary: 'data-checked:(bg-primary/10 border-primary/50)',
      secondary: 'data-checked:(bg-secondary/10 border-secondary/50)',
      neutral: 'data-checked:(bg-muted border-foreground/50)',
      error: 'data-checked:(bg-destructive/10 border-destructive/50)',
    },
  },
})

export const radioGroupContainerVariants = cva('flex items-center', {
  defaultVariants: {
    size: 'md',
  },
  variants: {
    size: {
      xs: 'h-4',
      sm: 'h-4',
      md: 'h-5',
      lg: 'h-5',
      xl: 'h-6',
    },
  },
})

export const radioGroupBaseVariants = cva(
  'inline-flex items-center justify-center overflow-hidden rounded-full border border-input bg-background bg-clip-padding outline-none transition-shadow dark:bg-input/30 focus-visible:(border-ring ring-3 ring-ring/50)',
  {
    defaultVariants: {
      size: 'md',
      invalid: false,
    },
    variants: {
      size: {
        xs: 'size-3',
        sm: 'size-3.5',
        md: 'size-4',
        lg: 'size-4.5',
        xl: 'size-5',
      },
      disabled: {
        true: 'cursor-not-allowed',
      },
      invalid: {
        true: 'border-destructive ring-3 ring-destructive/20 dark:border-destructive/50 dark:ring-destructive/40',
      },
    },
  },
)

export const radioGroupIndicatorVariants = cva(
  'flex size-full items-center justify-center rounded-full',
  {
    defaultVariants: {
      color: 'primary',
    },
    variants: {
      color: {
        primary: 'bg-primary',
        secondary: 'bg-secondary',
        neutral: 'bg-neutral',
        error: 'bg-destructive',
      },
    },
  },
)

export const radioGroupDotVariants = cva('rounded-full bg-primary-foreground', {
  defaultVariants: {
    size: 'md',
  },
  variants: {
    size: {
      xs: 'size-1',
      sm: 'size-1',
      md: 'size-1.5',
      lg: 'size-1.5',
      xl: 'size-2',
    },
  },
})

export const radioGroupWrapperVariants = cva('w-full', {
  defaultVariants: {
    indicator: 'start',
  },
  variants: {
    indicator: {
      start: 'ms-2',
      end: 'me-2',
      hidden: 'text-center',
    },
  },
})

export const radioGroupLabelVariants = cva('block font-medium text-foreground', {
  variants: {
    disabled: {
      true: 'cursor-not-allowed',
    },
  },
})

export const radioGroupDescriptionVariants = cva('text-muted-foreground', {
  variants: {
    disabled: {
      true: 'cursor-not-allowed',
    },
  },
})

type RadioGroupItemVariant = 'list' | 'card' | 'table'
type RadioGroupItemIndicator = 'start' | 'end' | 'hidden'
type RadioGroupItemVariantProps = Omit<
  VariantProps<typeof radioGroupItemVariants>,
  'variant' | 'indicator'
>

export type RadioGroupVariantProps = VariantProps<typeof radioGroupFieldsetVariants> &
  VariantProps<typeof radioGroupLegendVariants> &
  RadioGroupItemVariantProps &
  VariantProps<typeof radioGroupIndicatorVariants> & {
    variant?: RadioGroupItemVariant
    indicator?: RadioGroupItemIndicator
  }
