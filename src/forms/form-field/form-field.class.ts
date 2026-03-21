import type { VariantProps } from 'cls-variant'

import { REQUIRED_MARK_VARIANT, TEXT_SIZE_VARIANT } from '../../shared/cva-common.class'
import { cva } from '../../shared/utils'

export const formFieldSizeVariants = cva('text-sm', {
  defaultVariants: {
    size: 'md',
  },
  variants: {
    size: TEXT_SIZE_VARIANT,
  },
})

export const formFieldLabelVariants = cva('text-foreground font-medium block', {
  variants: {
    required: REQUIRED_MARK_VARIANT,
  },
})

export const formFieldContainerVariants = cva('relative', {
  variants: {
    orientation: {
      vertical: 'mt-1',
      horizontal: 'relative',
    },
  },
})

export type FormFieldVariantProps = VariantProps<typeof formFieldSizeVariants> & {
  orientation?: 'vertical' | 'horizontal'
}
