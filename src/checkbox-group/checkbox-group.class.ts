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
    size: 'md',
    orientation: 'vertical',
  },
  variants: {
    variant: {
      list: '',
      card: '',
      table: 'border border-border',
    },
    size: {
      xs: '',
      sm: '',
      md: '',
      lg: '',
      xl: '',
    },
    orientation: {
      horizontal: '',
      vertical: '',
    },
    disabled: {
      true: 'cursor-not-allowed',
    },
  },
  compoundVariants: [
    { variant: 'table', size: 'xs', class: 'p-2.5' },
    { variant: 'table', size: 'sm', class: 'p-3' },
    { variant: 'table', size: 'md', class: 'p-3.5' },
    { variant: 'table', size: 'lg', class: 'p-4' },
    { variant: 'table', size: 'xl', class: 'p-4.5' },
    {
      variant: 'table',
      orientation: 'horizontal',
      class: 'first-of-type:rounded-s-lg last-of-type:rounded-e-lg -ms-px first:ms-0',
    },
    {
      variant: 'table',
      orientation: 'vertical',
      class: 'first-of-type:rounded-t-lg last-of-type:rounded-b-lg -mt-px first:mt-0',
    },
  ],
})

export type CheckboxGroupVariantProps = VariantProps<typeof checkboxGroupFieldsetVariants> &
  VariantProps<typeof checkboxGroupLegendVariants> &
  VariantProps<typeof checkboxGroupItemVariants>
