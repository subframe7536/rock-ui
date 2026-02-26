import * as KobalteButton from '@kobalte/core/button'
import type { ElementOf, PolymorphicProps } from '@kobalte/core/polymorphic'
import { cva } from 'cls-variant/cva'
import type { JSX, ValidComponent } from 'solid-js'
import { splitProps } from 'solid-js'

import { Icon } from './icon'
import type { IconName } from './icon'

export interface IconButtonBaseProps {
  /**
   * Icon source. Strings should be Uno icon classes such as `i-lucide-search`.
   */
  name: IconName

  /**
   * Controlled loading state.
   */
  loading?: boolean

  /**
   * Optional icon shown when `loading` is active.
   */
  loadingIcon?: IconName
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
}

const sizeVariant = cva('', {
  defaultVariants: { size: 'md' },
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

export type IconButtonProps<T extends ValidComponent = 'button'> = PolymorphicProps<
  T,
  IconButtonBaseProps & Omit<KobalteButton.ButtonRootProps<ElementOf<T>>, 'class'>
>

export function IconButton<T extends ValidComponent = 'button'>(
  props: IconButtonProps<T>,
): JSX.Element {
  const [local, rest] = splitProps(props as IconButtonProps, [
    'class',
    'name',
    'loading',
    'loadingIcon',
    'disabled',
    'size',
  ])

  return (
    <KobalteButton.Root
      data-slot="icon-button"
      class={sizeVariant(
        { size: local.size },
        local.loading
          ? 'cursor-wait opacity-80 animate-spin pointer-events-none'
          : 'cursor-pointer',
        local.class,
      )}
      aria-busy={local.loading || undefined}
      data-loading={local.loading ? '' : undefined}
      disabled={local.loading || local.disabled}
      {...rest}
    >
      <Icon
        name={local.loading ? local.loadingIcon || 'icon-loading' + 'animate-spin' : local.name}
        class="size-full"
      />
    </KobalteButton.Root>
  )
}
