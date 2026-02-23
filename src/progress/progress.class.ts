import type { VariantProps } from 'cls-variant'
import { cva } from 'cls-variant/cva'

export const progressRootVariants = cva('relative gap-2', {
  defaultVariants: {
    orientation: 'horizontal',
  },
  variants: {
    orientation: {
      horizontal: 'flex w-full flex-col',
      vertical: 'flex h-full min-h-36 flex-row-reverse items-start',
    },
  },
})

export const progressStatusVariants = cva(
  'flex text-muted-foreground transition-[width,height] duration-200',
  {
    defaultVariants: {
      orientation: 'horizontal',
      size: 'md',
      color: 'primary',
      inverted: false,
    },
    variants: {
      orientation: {
        horizontal: 'min-w-fit flex-row items-center justify-end',
        vertical: 'min-h-fit flex-col justify-end',
      },
      size: {
        xs: 'text-xs',
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-sm',
        xl: 'text-base',
      },
      color: {
        primary: 'text-primary',
        secondary: 'text-secondary',
        neutral: 'text-muted-foreground',
        error: 'text-destructive',
      },
      inverted: {
        true: 'self-end',
      },
    },
    compoundVariants: [
      {
        orientation: 'horizontal',
        inverted: true,
        class: 'flex-row-reverse',
      },
      {
        orientation: 'vertical',
        inverted: true,
        class: 'flex-col-reverse',
      },
    ],
  },
)

export const progressBaseVariants = cva(
  'relative overflow-hidden rounded-full bg-input [transform:translateZ(0)]',
  {
    defaultVariants: {
      orientation: 'horizontal',
      size: 'md',
    },
    variants: {
      orientation: {
        horizontal: 'w-full',
        vertical: 'h-full min-h-36',
      },
      size: {
        xs: '',
        sm: '',
        md: '',
        lg: '',
        xl: '',
      },
    },
    compoundVariants: [
      { orientation: 'horizontal', size: 'xs', class: 'h-0.5' },
      { orientation: 'horizontal', size: 'sm', class: 'h-1' },
      { orientation: 'horizontal', size: 'md', class: 'h-2' },
      { orientation: 'horizontal', size: 'lg', class: 'h-3' },
      { orientation: 'horizontal', size: 'xl', class: 'h-4' },
      { orientation: 'vertical', size: 'xs', class: 'w-0.5' },
      { orientation: 'vertical', size: 'sm', class: 'w-1' },
      { orientation: 'vertical', size: 'md', class: 'w-2' },
      { orientation: 'vertical', size: 'lg', class: 'w-3' },
      { orientation: 'vertical', size: 'xl', class: 'w-4' },
    ],
  },
)

export const progressIndicatorVariants = cva(
  'absolute inset-0 size-full rounded-full transition-transform duration-200 ease-out will-change-transform',
  {
    defaultVariants: {
      color: 'primary',
      orientation: 'horizontal',
      animation: 'carousel',
    },
    variants: {
      color: {
        primary: 'bg-primary',
        secondary: 'bg-secondary',
        neutral: 'bg-inverted',
        error: 'bg-destructive',
      },
      orientation: {
        horizontal: 'origin-left',
        vertical: 'origin-bottom',
      },
      animation: {
        carousel: 'data-indeterminate:opacity-100',
        'carousel-inverse': 'data-indeterminate:opacity-100',
        swing: 'data-indeterminate:opacity-100',
        elastic: 'data-indeterminate:opacity-100',
      },
    },
    compoundVariants: [
      {
        orientation: 'horizontal',
        animation: 'carousel',
        class:
          'data-indeterminate:animate-[carousel_2s_ease-in-out_infinite] data-indeterminate:rtl:animate-[carousel-rtl_2s_ease-in-out_infinite]',
      },
      {
        orientation: 'vertical',
        animation: 'carousel',
        class: 'data-indeterminate:animate-[carousel-vertical_2s_ease-in-out_infinite]',
      },
      {
        orientation: 'horizontal',
        animation: 'carousel-inverse',
        class:
          'data-indeterminate:animate-[carousel-inverse_2s_ease-in-out_infinite] data-indeterminate:rtl:animate-[carousel-inverse-rtl_2s_ease-in-out_infinite]',
      },
      {
        orientation: 'vertical',
        animation: 'carousel-inverse',
        class: 'data-indeterminate:animate-[carousel-inverse-vertical_2s_ease-in-out_infinite]',
      },
      {
        orientation: 'horizontal',
        animation: 'swing',
        class: 'data-indeterminate:animate-[swing_2s_ease-in-out_infinite]',
      },
      {
        orientation: 'vertical',
        animation: 'swing',
        class: 'data-indeterminate:animate-[swing-vertical_2s_ease-in-out_infinite]',
      },
      {
        orientation: 'horizontal',
        animation: 'elastic',
        class: 'data-indeterminate:animate-[elastic_2s_ease-in-out_infinite]',
      },
      {
        orientation: 'vertical',
        animation: 'elastic',
        class: 'data-indeterminate:animate-[elastic-vertical_2s_ease-in-out_infinite]',
      },
    ],
  },
)

export const progressStepsVariants = cva('grid items-end', {
  defaultVariants: {
    orientation: 'horizontal',
    size: 'md',
    color: 'primary',
  },
  variants: {
    orientation: {
      horizontal: 'w-full',
      vertical: 'ms-2 h-full items-start',
    },
    size: {
      xs: 'text-xs',
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-sm',
      xl: 'text-base',
    },
    color: {
      primary: 'text-primary',
      secondary: 'text-secondary',
      neutral: 'text-foreground',
      error: 'text-destructive',
    },
  },
})

export const progressStepVariants = cva(
  'row-start-1 col-start-1 truncate text-end transition-opacity duration-200',
  {
    defaultVariants: {
      state: 'other',
      size: 'md',
      color: 'primary',
      inverted: false,
    },
    variants: {
      state: {
        active: 'opacity-100',
        first: 'opacity-100 text-muted-foreground',
        other: 'opacity-0',
        last: 'opacity-100',
      },
      size: {
        xs: 'text-xs',
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-sm',
        xl: 'text-base',
      },
      color: {
        primary: 'text-primary',
        secondary: 'text-secondary',
        neutral: 'text-foreground',
        error: 'text-destructive',
      },
      inverted: {
        true: 'text-start',
      },
    },
  },
)

export type ProgressVariantProps = VariantProps<typeof progressRootVariants> &
  VariantProps<typeof progressStatusVariants> &
  VariantProps<typeof progressBaseVariants> &
  VariantProps<typeof progressIndicatorVariants> &
  VariantProps<typeof progressStepsVariants> &
  VariantProps<typeof progressStepVariants>
