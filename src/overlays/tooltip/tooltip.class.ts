import type { VariantProps } from 'cls-variant'

import { cva } from '../../shared/utils'

export const tooltipContentVariants = cva(
  'text-xs px-2 py-1 outline-none rounded-md flex max-w-xs w-fit origin-$kb-tooltip-content-transform-origin items-baseline z-50 data-closed:animate-tooltip-out data-expanded:animate-tooltip-in',
  {
    variants: {
      side: {
        left: 'mr-$kb-popper-content-overflow-padding animate-tooltip-side-left',
        right: 'ml-$kb-popper-content-overflow-padding animate-tooltip-side-right',
        top: 'mb-$kb-popper-content-overflow-padding animate-tooltip-side-top',
        bottom: 'mt-$kb-popper-content-overflow-padding animate-tooltip-side-bottom',
      },
      invert: {
        true: 'text-background bg-foreground',
        false: 'text-foreground bg-background surface-outline shadow-sm',
      },
    },
    defaultVariants: {
      side: 'top',
    },
  },
)

export type TooltipVariantProps = VariantProps<typeof tooltipContentVariants>
