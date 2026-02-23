import type { VariantProps } from 'cls-variant'
import { cva } from 'cls-variant/cva'

export const selectControlVariants = cva(
  'flex w-full cursor-pointer items-center rounded-md border border-input bg-transparent text-foreground outline-none transition-[color,box-shadow] dark:bg-input/30 focus-within:(border-ring ring-3 ring-ring/50)',
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
        sm: 'min-h-8 text-xs',
        md: 'min-h-9 text-sm',
        lg: 'min-h-10 text-sm',
      },
      variant: {
        outline: 'bg-transparent',
        soft: 'border-transparent bg-muted/50 hover:bg-muted',
        subtle: 'bg-muted',
        ghost: 'border-transparent hover:bg-muted',
        none: 'border-transparent bg-transparent',
      },
      highlight: {
        true: 'ring-1 ring-border/50',
      },
      disabled: {
        true: 'cursor-not-allowed opacity-75',
      },
      invalid: {
        true: 'border-destructive ring-3 ring-destructive/20 dark:border-destructive/50 dark:ring-destructive/40',
      },
    },
    compoundVariants: [],
  },
)

export const selectInputVariants = cva(
  'flex-1 bg-transparent outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed',
  {
    defaultVariants: {
      mode: 'single',
    },
    variants: {
      mode: {
        single: 'min-w-0',
        multiSearch: 'min-w-12 h-6 py-0.5',
        multiHidden: 'absolute h-0 w-0 overflow-hidden border-0 p-0 opacity-0',
      },
      readOnly: {
        true: 'cursor-pointer',
      },
    },
  },
)

export const selectInputSingleSizeVariants = cva('h-8 px-2.5 text-sm', {
  defaultVariants: {
    size: 'md',
  },
  variants: {
    size: {
      sm: 'h-7 px-2.5 text-xs',
      md: 'h-8 px-2.5 text-sm',
      lg: 'h-9 px-3 text-sm',
    },
  },
})

export const selectInputMultiSearchSizeVariants = cva('ps-1 text-sm', {
  defaultVariants: {
    size: 'md',
  },
  variants: {
    size: {
      sm: 'ps-1 text-xs',
      md: 'ps-1 text-sm',
      lg: 'ps-1.5 text-sm',
    },
  },
})

export const selectTriggerIconVariants = cva('shrink-0 text-muted-foreground opacity-80', {
  defaultVariants: {
    size: 'md',
  },
  variants: {
    size: {
      sm: 'me-1.5 text-sm',
      md: 'me-2 text-base',
      lg: 'me-2.5 text-base',
    },
  },
})

export const selectLeadingIconVariants = cva('shrink-0 text-muted-foreground', {
  defaultVariants: {
    size: 'md',
  },
  variants: {
    size: {
      sm: 'ms-2 text-sm',
      md: 'ms-2.5 text-base',
      lg: 'ms-3 text-base',
    },
  },
})

export const selectClearVariants = cva(
  'shrink-0 cursor-pointer text-muted-foreground opacity-80 transition-opacity hover:opacity-100',
  {
    defaultVariants: {
      size: 'md',
    },
    variants: {
      size: {
        sm: 'me-1 text-xs',
        md: 'me-1.5 text-sm',
        lg: 'me-2 text-sm',
      },
    },
  },
)

export const selectItemVariants = cva(
  'flex items-center justify-between gap-2 rounded-sm py-1 ps-3 pe-2 outline-none data-disabled:(pointer-events-none opacity-50) data-highlighted:(bg-accent text-accent-foreground)',
  {
    defaultVariants: {
      size: 'md',
    },
    variants: {
      size: {
        sm: 'min-h-7 text-xs',
        md: 'min-h-8 text-sm',
        lg: 'min-h-9 text-sm',
      },
    },
  },
)

export const selectTagVariants = cva(
  'flex items-center rounded-md bg-accent px-2 font-medium text-accent-foreground text-sm',
  {
    defaultVariants: {
      size: 'md',
    },
    variants: {
      size: {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-sm',
      },
    },
  },
)

export type SelectControlVariantProps = VariantProps<typeof selectControlVariants>
