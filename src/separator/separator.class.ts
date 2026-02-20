import type { VariantProps } from 'cls-variant'
import { cva } from 'cls-variant/cva'

export const separatorRootVariants = cva('flex items-center text-center', {
  defaultVariants: {
    orientation: 'horizontal',
  },
  variants: {
    orientation: {
      horizontal: 'w-full flex-row',
      vertical: 'h-full min-h-10 flex-col',
    },
  },
})

export const separatorBorderVariants = cva('shrink-0 border-border', {
  defaultVariants: {
    color: 'neutral',
    orientation: 'horizontal',
    size: 'xs',
    type: 'solid',
  },
  variants: {
    color: {
      primary: 'border-primary',
      secondary: 'border-secondary',
      neutral: 'border-border',
      error: 'border-destructive',
    },
    orientation: {
      horizontal: 'w-full border-t',
      vertical: 'h-full border-s',
    },
    size: {
      xs: '',
      sm: '',
      md: '',
      lg: '',
      xl: '',
    },
    type: {
      solid: 'border-solid',
      dashed: 'border-dashed',
      dotted: 'border-dotted',
    },
  },
  compoundVariants: [
    {
      orientation: 'horizontal',
      size: 'xs',
      class: 'border-t-1',
    },
    {
      orientation: 'horizontal',
      size: 'sm',
      class: 'border-t-2',
    },
    {
      orientation: 'horizontal',
      size: 'md',
      class: 'border-t-3',
    },
    {
      orientation: 'horizontal',
      size: 'lg',
      class: 'border-t-4',
    },
    {
      orientation: 'horizontal',
      size: 'xl',
      class: 'border-t-5',
    },
    {
      orientation: 'vertical',
      size: 'xs',
      class: 'border-s-1',
    },
    {
      orientation: 'vertical',
      size: 'sm',
      class: 'border-s-2',
    },
    {
      orientation: 'vertical',
      size: 'md',
      class: 'border-s-3',
    },
    {
      orientation: 'vertical',
      size: 'lg',
      class: 'border-s-4',
    },
    {
      orientation: 'vertical',
      size: 'xl',
      class: 'border-s-5',
    },
  ],
})

export const separatorContainerVariants = cva('flex items-center font-medium', {
  defaultVariants: {
    color: 'neutral',
    orientation: 'horizontal',
  },
  variants: {
    color: {
      primary: 'text-primary',
      secondary: 'text-secondary',
      neutral: 'text-muted-foreground',
      error: 'text-destructive',
    },
    orientation: {
      horizontal: 'mx-3 whitespace-nowrap',
      vertical: 'my-2',
    },
  },
})

export type SeparatorVariantProps = VariantProps<typeof separatorRootVariants> &
  VariantProps<typeof separatorBorderVariants> &
  VariantProps<typeof separatorContainerVariants>
