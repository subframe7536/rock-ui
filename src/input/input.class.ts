import type { VariantProps } from 'cls-variant'
import { cva } from 'cls-variant/cva'

export const inputRootVariants = cva('relative inline-flex w-full items-center')

export const inputBaseVariants = cva(
  'w-full rounded-md border border-input bg-background text-foreground outline-none transition-shadow placeholder:text-muted-foreground disabled:(cursor-not-allowed opacity-75)',
  {
    defaultVariants: {
      color: 'primary',
      size: 'md',
      variant: 'outline',
    },
    variants: {
      color: {
        primary: 'focus-visible:(ring-2 ring-inset ring-primary)',
        secondary: 'focus-visible:(ring-2 ring-inset ring-secondary)',
        neutral: 'focus-visible:(ring-2 ring-inset ring-foreground)',
        error: 'focus-visible:(ring-2 ring-inset ring-destructive)',
      },
      size: {
        xs: 'h-7 px-2 text-xs',
        sm: 'h-8 px-2.5 text-xs',
        md: 'h-9 px-2.5 text-sm',
        lg: 'h-10 px-3 text-sm',
        xl: 'h-11 px-3 text-base',
      },
      variant: {
        outline: 'border border-input bg-background',
        soft: 'border-transparent bg-muted/50 hover:bg-muted',
        subtle: 'border border-border bg-muted',
        ghost: 'border-transparent bg-transparent hover:bg-muted',
        none: 'border-transparent bg-transparent',
      },
      highlight: {
        true: 'ring-1 ring-inset ring-border',
      },
      leading: {
        true: '',
      },
      trailing: {
        true: '',
      },
      loading: {
        true: '',
      },
      fieldGroup: {
        horizontal: '',
        vertical: '',
      },
      type: {
        file: 'text-muted-foreground file:(me-2 bg-transparent font-medium text-foreground text-sm outline-none)',
      },
    },
    compoundVariants: [
      { color: 'primary', highlight: 'true', class: 'ring-primary' },
      { color: 'secondary', highlight: 'true', class: 'ring-secondary' },
      { color: 'neutral', highlight: 'true', class: 'ring-foreground' },
      { color: 'error', highlight: 'true', class: 'ring-destructive' },
      { leading: 'true', size: 'xs', class: 'ps-7' },
      { leading: 'true', size: 'sm', class: 'ps-8' },
      { leading: 'true', size: 'md', class: 'ps-9' },
      { leading: 'true', size: 'lg', class: 'ps-10' },
      { leading: 'true', size: 'xl', class: 'ps-11' },
      { trailing: 'true', size: 'xs', class: 'pe-7' },
      { trailing: 'true', size: 'sm', class: 'pe-8' },
      { trailing: 'true', size: 'md', class: 'pe-9' },
      { trailing: 'true', size: 'lg', class: 'pe-10' },
      { trailing: 'true', size: 'xl', class: 'pe-11' },
    ],
  },
)

export const inputLeadingVariants = cva('absolute inset-y-0 start-0 flex items-center', {
  defaultVariants: {
    size: 'md',
  },
  variants: {
    size: {
      xs: 'ps-2',
      sm: 'ps-2.5',
      md: 'ps-2.5',
      lg: 'ps-3',
      xl: 'ps-3',
    },
  },
})

export const inputTrailingVariants = cva('absolute inset-y-0 end-0 flex items-center', {
  defaultVariants: {
    size: 'md',
  },
  variants: {
    size: {
      xs: 'pe-2',
      sm: 'pe-2.5',
      md: 'pe-2.5',
      lg: 'pe-3',
      xl: 'pe-3',
    },
  },
})

export const inputLeadingIconVariants = cva('shrink-0 text-muted-foreground', {
  defaultVariants: {
    size: 'md',
  },
  variants: {
    size: {
      xs: 'text-sm',
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-base',
      xl: 'text-lg',
    },
    loading: {
      true: 'animate-spin',
    },
  },
})

export const inputTrailingIconVariants = cva('shrink-0 text-muted-foreground', {
  defaultVariants: {
    size: 'md',
  },
  variants: {
    size: {
      xs: 'text-sm',
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-base',
      xl: 'text-lg',
    },
    loading: {
      true: 'animate-spin',
    },
  },
})

export const inputLeadingAvatarVariants = cva('shrink-0', {
  defaultVariants: {
    size: 'md',
  },
  variants: {
    size: {
      xs: 'size-4',
      sm: 'size-4',
      md: 'size-5',
      lg: 'size-5',
      xl: 'size-6',
    },
  },
})

export type InputVariantProps = VariantProps<typeof inputBaseVariants> &
  VariantProps<typeof inputLeadingVariants> &
  VariantProps<typeof inputTrailingVariants> &
  VariantProps<typeof inputLeadingIconVariants> &
  VariantProps<typeof inputTrailingIconVariants> &
  VariantProps<typeof inputLeadingAvatarVariants>
