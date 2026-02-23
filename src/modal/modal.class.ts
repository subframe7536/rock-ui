import type { VariantProps } from 'cls-variant'
import { cva } from 'cls-variant/cva'

export const modalOverlayVariants = cva(
  'fixed inset-0 z-50 bg-black/10 supports-backdrop-filter:backdrop-blur-xs data-expanded:(animate-in fade-in-0) data-closed:(animate-out fade-out-0) duration-100',
  {
    defaultVariants: {
      scrollable: false,
    },
    variants: {
      scrollable: {
        true: 'grid grid-rows-[1fr_auto_3fr] justify-items-center p-4 max-sm:grid-rows-[1fr_auto] max-sm:p-0 max-sm:pt-12',
        false: 'block',
      },
    },
  },
)

export const modalContentVariants = cva(
  'z-50 w-full min-w-0 max-h-full min-h-0 border border-border bg-background text-foreground outline-none ring-1 ring-foreground/10',
  {
    defaultVariants: {
      layout: 'default',
      transition: true,
    },
    variants: {
      layout: {
        default:
          'fixed left-1/2 top-1/2 grid max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 rounded-xl text-sm sm:max-w-sm',
        scrollable:
          'relative row-start-2 grid w-full max-w-[calc(100%-2rem)] rounded-xl text-sm sm:max-w-sm',
        fullscreen: 'fixed inset-0 flex max-w-none flex-col rounded-none ring-0',
      },
      transition: {
        true: 'data-expanded:(animate-in fade-in-0 zoom-in-95) data-closed:(animate-out fade-out-0 zoom-out-95) duration-100',
        false: 'transition-none data-expanded:animate-none data-closed:animate-none',
      },
    },
  },
)

export type ModalOverlayVariantProps = VariantProps<typeof modalOverlayVariants>
export type ModalContentVariantProps = VariantProps<typeof modalContentVariants>
