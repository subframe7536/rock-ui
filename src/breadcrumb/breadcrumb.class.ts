import type { VariantProps } from 'cls-variant'
import { cva } from 'cls-variant/cva'

export const breadcrumbListVariants = cva('flex items-center gap-1.5', {
  variants: {
    wrap: {
      true: 'flex-wrap',
      false: 'flex-nowrap',
    },
  },
  defaultVariants: {
    wrap: true,
  },
})

export const breadcrumbLinkVariants = cva(
  'relative inline-flex min-w-0 items-center gap-1.5 rounded-md px-1 py-0.5 text-sm font-medium transition focus-visible:effect-fv-border disabled:effect-dis',
  {
    variants: {
      active: {
        true: 'text-primary',
        false: 'text-muted-foreground',
      },
      clickable: {
        true: 'hover:text-foreground',
      },
      disabled: {
        true: 'effect-dis',
      },
    },
    defaultVariants: {
      active: false,
      clickable: false,
      disabled: false,
    },
    compoundVariants: [
      {
        active: false,
        clickable: true,
        disabled: false,
        class: 'transition-colors',
      },
    ],
  },
)

export type BreadcrumbVariantProps = VariantProps<typeof breadcrumbListVariants> &
  VariantProps<typeof breadcrumbLinkVariants>
