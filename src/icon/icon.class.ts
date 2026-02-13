import type { VariantProps } from 'cls-variant'
import { cva } from 'cls-variant/cva'

export const iconVariants = cva('inline-flex shrink-0 items-center justify-center align-middle', {
  defaultVariants: {
    mode: 'css',
  },
  variants: {
    mode: {
      css: '',
      svg: '',
    },
  },
})

export type IconVariantProps = VariantProps<typeof iconVariants>
