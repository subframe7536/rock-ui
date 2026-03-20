import type { VariantProps } from 'cls-variant'

import { cva } from '../../shared/utils'

export const iconButtonVariants = cva(
  'inline-flex cursor-pointer cursor-pointer select-none whitespace-nowrap items-center justify-center bg-clip-padding data-loading:effect-loading',
  {
    defaultVariants: {
      size: 'md',
    },
    variants: {
      size: {
        xs: 'rounded-xs',
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
        xl: 'rounded-xl',
      },
    },
  },
)

export const iconVariants = cva('', {
  defaultVariants: {
    size: 'md',
  },
  variants: {
    size: {
      xs: 'size-3.5',
      sm: 'size-4',
      md: 'size-4.5',
      lg: 'size-5',
      xl: 'size-5.5',
    },
  },
})

export type IconButtonVariantProps = VariantProps<typeof iconButtonVariants>
