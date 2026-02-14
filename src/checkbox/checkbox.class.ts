import type { VariantProps } from 'cls-variant'
import { cva } from 'cls-variant/cva'

export const checkboxRootVariants = cva('relative flex items-start', {
  defaultVariants: {
    variant: 'list',
    indicator: 'start',
    size: 'md',
  },
  variants: {
    variant: {
      list: '',
      card: 'rounded-lg border border-border',
    },
    indicator: {
      start: 'flex-row',
      end: 'flex-row-reverse',
      hidden: '',
    },
    size: {
      xs: '',
      sm: '',
      md: '',
      lg: '',
      xl: '',
    },
    disabled: {
      true: 'opacity-75',
    },
  },
  compoundVariants: [
    { variant: 'card', size: 'xs', class: 'p-2.5' },
    { variant: 'card', size: 'sm', class: 'p-3' },
    { variant: 'card', size: 'md', class: 'p-3.5' },
    { variant: 'card', size: 'lg', class: 'p-4' },
    { variant: 'card', size: 'xl', class: 'p-4.5' },
  ],
})

export const checkboxContainerVariants = cva('flex items-center', {
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

export const checkboxBaseVariants = cva(
  'inline-flex items-center justify-center overflow-hidden rounded-sm border border-input bg-background outline-none transition-shadow focus-visible:effect-fv',
  {
    defaultVariants: {
      size: 'md',
      disabled: false,
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
    },
  },
)

export const checkboxIndicatorVariants = cva('flex size-full items-center justify-center', {
  defaultVariants: {
    color: 'primary',
  },
  variants: {
    color: {
      primary: 'bg-primary text-primary-foreground',
      secondary: 'bg-secondary text-secondary-foreground',
      neutral: 'bg-foreground text-background',
      error: 'bg-destructive text-destructive-foreground',
    },
  },
})

export const checkboxIconVariants = cva('shrink-0', {
  defaultVariants: {
    size: 'md',
  },
  variants: {
    size: {
      xs: 'size-2',
      sm: 'size-2.5',
      md: 'size-3',
      lg: 'size-3.5',
      xl: 'size-4',
    },
  },
})

export const checkboxWrapperVariants = cva('w-full', {
  defaultVariants: {
    indicator: 'start',
    size: 'md',
  },
  variants: {
    indicator: {
      start: 'ms-2',
      end: 'me-2',
      hidden: 'text-center',
    },
    size: {
      xs: 'text-xs',
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-sm',
      xl: 'text-base',
    },
  },
})

export const checkboxLabelVariants = cva('block font-medium text-foreground', {
  variants: {
    required: {
      true: "after:(ms-0.5 text-destructive) after:content-['*']",
    },
    disabled: {
      true: 'cursor-not-allowed',
    },
  },
})

export const checkboxDescriptionVariants = cva('text-muted-foreground', {
  variants: {
    disabled: {
      true: 'cursor-not-allowed',
    },
  },
})

export type CheckboxVariantProps = VariantProps<typeof checkboxRootVariants> &
  VariantProps<typeof checkboxIndicatorVariants>
