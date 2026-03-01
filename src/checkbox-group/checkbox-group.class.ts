import type { VariantProps } from 'cls-variant'
import { cva } from 'cls-variant/cva'

export const checkboxGroupFieldsetVariants = cva('flex gap-x-2', {
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

export const checkboxGroupLegendVariants = cva('mb-1 block font-medium text-foreground', {
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
      true: "after:(ms-0.5 text-destructive) after:content-['*']",
    },
  },
})

export const checkboxGroupItemVariants = cva('', {
  defaultVariants: {
    variant: 'list',
    disabled: false,
  },
  variants: {
    variant: {
      list: '',
      card: '',
      table: 'border',
    },
    disabled: {
      true: 'effect-dis',
    },
  },
})

export const checkboxGroupTablePaddingVariants = cva('p-3.5', {
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

export const checkboxGroupTableOrientationVariants = cva(
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

export type CheckboxGroupVariantProps = VariantProps<typeof checkboxGroupFieldsetVariants> &
  VariantProps<typeof checkboxGroupLegendVariants> & {
    variant?: 'list' | 'card' | 'table'
  }
