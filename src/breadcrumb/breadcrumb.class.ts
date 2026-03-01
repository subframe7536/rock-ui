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

export const breadcrumbLinkVariants = cva('min-w-0 h-auto sm:h-auto px-1 py-0.5 shadow-none', {
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
    {
      active: true,
      class: 'hover:text-primary',
    },
  ],
})

export type BreadcrumbVariantProps = VariantProps<typeof breadcrumbListVariants>
