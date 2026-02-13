import type { VariantProps } from 'cls-variant'
import { cva } from 'cls-variant/cva'

export const formFieldRootVariants = cva('', {
  defaultVariants: {
    size: 'md',
    orientation: 'vertical',
  },
  variants: {
    size: {
      xs: 'text-xs',
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-sm',
      xl: 'text-base',
    },
    orientation: {
      vertical: '',
      horizontal: 'flex items-baseline justify-between gap-2',
    },
  },
})

export const formFieldWrapperVariants = cva('', {
  variants: {
    orientation: {
      vertical: '',
      horizontal: 'flex-1',
    },
  },
})

export const formFieldLabelWrapperVariants = cva('flex items-center justify-between gap-1')

export const formFieldLabelVariants = cva('block font-medium text-foreground', {
  variants: {
    required: {
      true: "after:(ms-0.5 text-destructive) after:content-['*']",
    },
  },
})

export const formFieldContainerVariants = cva('relative', {
  variants: {
    orientation: {
      vertical: 'mt-1',
      horizontal: '',
    },
  },
})

export const formFieldDescriptionVariants = cva('text-muted-foreground')
export const formFieldHintVariants = cva('text-muted-foreground')
export const formFieldHelpVariants = cva('mt-2 text-muted-foreground')
export const formFieldErrorVariants = cva('mt-2 text-destructive')

export type FormFieldVariantProps = VariantProps<typeof formFieldRootVariants>
