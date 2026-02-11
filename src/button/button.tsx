import type { ComponentProps, JSX } from 'solid-js'
import { splitProps, createMemo } from 'solid-js'

import type { ButtonVariantProps } from './button.class'
import { buttonVariants } from './button.class'

export interface ButtonProps extends ComponentProps<'button'>, ButtonVariantProps {
  block?: boolean
  square?: boolean
  loading?: boolean
  icon?: JSX.Element
  trailing?: boolean
}

export const Button = (props: ButtonProps) => {
  const [local, rest] = splitProps(props, [
    'class',
    'variant',
    'size',
    'block',
    'square',
    'loading',
    'icon',
    'children',
    'trailing',
  ])
  const buttonClass = createMemo(() => {
    return buttonVariants(
      {},
      local.block && 'w-full',
      local.loading && 'cursor-wait opacity-80',
      local.class,
    )
  })

  const renderIcon = () => {
    if (local.loading) {
      return <div class="i-lucide:spinner" />
    }
    if (!local.icon) {
      return null
    }

    if (local.children && !local.trailing) {
      return <span class="flex items-center">{local.icon}</span>
    }
    return local.icon
  }

  const renderTrailingIcon = () => {
    if (local.loading) {
      return null
    }
    if (local.icon && local.trailing && local.children) {
      return <span class="ml-auto flex items-center">{local.icon}</span> // ml-auto push to right if needed, or just normal flow
    }
    return null
  }

  return (
    <button class={buttonClass()} disabled={local.loading || rest.disabled} {...rest}>
      {renderIcon()}
      {local.loading ? ' Loading...' : local.children}
      {renderTrailingIcon()}
    </button>
  )
}
