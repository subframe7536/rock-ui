import type { VariantProps } from 'cls-variant'
import { cva } from 'cls-variant/cva'

export const formVariants = cva('w-full', {
  variants: {
    loading: {
      true: 'data-[loading=true]:(opacity-80)',
    },
  },
})

export type FormVariantProps = VariantProps<typeof formVariants>
