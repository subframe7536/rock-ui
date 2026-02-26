import type { VariantProps } from 'cls-variant'
import { cva } from 'cls-variant/cva'

export const selectControlVariants = cva(
  'flex w-full cursor-pointer items-center rounded-md border border-input bg-transparent text-foreground outline-none transition-[color,box-shadow] dark:bg-input/30 focus-within:(border-ring ring-3 ring-ring/50)',
  {
    defaultVariants: {
      size: 'md',
      variant: 'outline',
    },
    variants: {
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
        true: 'cursor-not-allowed opacity-50',
      },
      invalid: {
        true: 'border-destructive ring-3 ring-destructive/20 dark:border-destructive/50 dark:ring-destructive/40',
      },
    },
  },
)

export const selectInputVariants = cva(
  'flex-1 bg-transparent outline-none placeholder:text-muted-foreground disabled:(cursor-not-allowed opacity-50)',
  {
    defaultVariants: {
      mode: 'single',
      size: 'md',
    },
    variants: {
      mode: {
        single: '',
        multiSearch: 'min-w-12',
        multiHidden: 'sr-only',
      },
      size: {
        sm: '',
        md: '',
        lg: '',
      },
      readOnly: {
        true: 'cursor-pointer',
      },
    },
    compoundVariants: [
      {
        mode: 'single',
        size: 'sm',
        class: 'h-7 px-2.5 text-xs',
      },
      {
        mode: 'single',
        size: 'md',
        class: 'h-8 px-2.5 text-sm',
      },
      {
        mode: 'single',
        size: 'lg',
        class: 'h-9 px-3 text-sm',
      },
      {
        mode: 'multiSearch',
        size: 'sm',
        class: 'ps-1 text-xs',
      },
      {
        mode: 'multiSearch',
        size: 'md',
        class: 'ps-1 text-sm',
      },
      {
        mode: 'multiSearch',
        size: 'lg',
        class: 'ps-1.5 text-sm',
      },
    ],
  },
)

export const selectTriggerIconVariants = cva('text-muted-foreground opacity-80 cursor-pointer', {
  defaultVariants: {
    size: 'md',
  },
  variants: {
    size: {
      sm: 'me-1.5 size-4',
      md: 'me-2 size-5',
      lg: 'me-2.5 size-6',
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
  'text-muted-foreground opacity-80 transition-opacity hover:opacity-100',
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
  'flex items-center rounded-md bg-accent px-2 font-medium text-accent-foreground cursor-default',
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
