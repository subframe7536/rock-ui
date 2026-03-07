import type { VariantProps } from 'cls-variant'
import { cva } from 'cls-variant/cva'

export const stepperRootVariants = cva('flex gap-4', {
  defaultVariants: {
    orientation: 'horizontal',
  },
  variants: {
    orientation: {
      horizontal: 'w-full flex-col',
      vertical: 'w-full flex-row items-start gap-6',
    },
  },
})

export const stepperHeaderVariants = cva('flex', {
  defaultVariants: {
    orientation: 'horizontal',
  },
  variants: {
    orientation: {
      horizontal: 'w-full',
      vertical: 'min-w-0 flex-col gap-4',
    },
  },
})

export const stepperItemVariants = cva('relative min-w-0', {
  defaultVariants: {
    orientation: 'horizontal',
    disabled: false,
  },
  variants: {
    orientation: {
      horizontal: 'w-full flex-1 text-center',
      vertical: 'flex items-start text-start gap-$st-gap',
    },
    size: {
      xs: 'var-stepper-6-4-1.5-0.5',
      sm: 'var-stepper-8-5-2-0.5',
      md: 'var-stepper-10-7-2.5-1',
      lg: 'var-stepper-12-8-3-1',
      xl: 'var-stepper-14-9-3.5-1',
    },
    disabled: {
      true: 'opacity-75',
    },
  },
})

export const stepperContainerVariants = cva('relative flex items-center', {
  defaultVariants: {
    orientation: 'horizontal',
  },
  variants: {
    orientation: {
      horizontal: 'justify-center',
      vertical: 'shrink-0 self-stretch flex-col',
    },
  },
})

export const stepperTriggerVariants = cva('inline-flex size-$st-size rounded-full', {
  defaultVariants: {
    size: 'md',
    state: 'inactive',
  },
  variants: {
    size: {
      xs: 'text-xs p-1',
      sm: 'text-sm p-1.5',
      md: 'text-base p-2',
      lg: 'text-lg p-2.5',
      xl: 'text-xl p-3',
    },
    state: {
      inactive: 'border-input bg-background text-muted-foreground shadow-xs',
      active: 'border-primary bg-primary text-primary-foreground',
      completed: 'border-primary bg-primary text-primary-foreground',
    },
  },
})

export const stepperSeparatorVariants = cva('absolute rounded-full bg-border transition-colors', {
  defaultVariants: {
    orientation: 'horizontal',
    state: 'inactive',
    disabled: false,
  },
  variants: {
    orientation: {
      horizontal:
        'top-1/2 h-0.5 -translate-y-1/2 start-[calc(50%+var(--st-sep-x))] end-[calc(-50%+var(--st-sep-x))]',
      vertical: 'left-1/2 w-0.5 -translate-x-1/2 top-$st-sep-top bottom--3',
    },
    state: {
      inactive: 'bg-border',
      active: 'bg-border',
      completed: 'bg-primary',
    },
    disabled: {
      true: 'opacity-75',
    },
  },
})

export const stepperWrapperVariants = cva('min-w-0', {
  defaultVariants: {
    orientation: 'horizontal',
  },
  variants: {
    orientation: {
      horizontal: 'w-full text-center mt-$st-gap',
      vertical: 'text-start pt-$st-pt',
    },
  },
})

export const stepperTitleVariants = cva('font-medium text-foreground', {
  defaultVariants: {
    size: 'md',
  },
  variants: {
    size: {
      xs: 'text-xs',
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base',
      xl: 'text-lg',
    },
  },
})

export const stepperDescriptionVariants = cva('text-muted-foreground text-wrap', {
  defaultVariants: {
    size: 'md',
  },
  variants: {
    size: {
      xs: 'text-xs',
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base',
      xl: 'text-lg',
    },
  },
})

export type StepperVariantProps = VariantProps<typeof stepperItemVariants> &
  VariantProps<typeof stepperTriggerVariants>
