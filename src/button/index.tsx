import type { ComponentProps, JSX } from 'solid-js'

import { cls } from 'cls-variant'
// src/components/ui/Button.tsx
import { splitProps, createMemo } from 'solid-js'

// 定义颜色变体类型，主要引用 Tailwind 配置中的语义化颜色
type ColorKey = 'primary' | 'gray' | 'error' | 'success' | 'warning'

export interface ButtonProps extends ComponentProps<'button'> {
  variant?: 'solid' | 'outline' | 'soft' | 'ghost' | 'link'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  color?: ColorKey
  block?: boolean
  square?: boolean
  loading?: boolean
  icon?: JSX.Element
  leading?: boolean // 强制图标在前
  trailing?: boolean // 强制图标在后
}

/**
 * 样式配置表
 * 注意：这里使用的是 Tailwind 的语义化类名（如 bg-primary），而不是具体的颜色（如 bg-blue-500）。
 * 你需要在 tailwind.config.js 中定义 primary, error 等颜色。
 */
const baseClasses =
  'inline-flex items-center justify-center font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transform'

const sizes = {
  xs: 'text-xs px-2 py-1 rounded gap-1',
  sm: 'text-sm px-3 py-1.5 rounded-md gap-1.5',
  md: 'text-sm px-4 py-2 rounded-md gap-2',
  lg: 'text-base px-5 py-2.5 rounded-lg gap-2',
  xl: 'text-lg px-6 py-3 rounded-lg gap-2.5',
}

// 定义颜色逻辑，基于 Tailwind 主题配置
const getColorClasses = (color: ColorKey, variant: string) => {
  // 这里的类名假设你在 tailwind.config.js 中扩展了 colors
  // 例如 primary: '#your_color'
  switch (variant) {
    case 'solid':
      return cls(
        `text-white focus:ring-${color}-50 dark:focus:ring-${color}-400/50`,
        `bg-${color}-500 hover:bg-${color}-600 dark:bg-${color}-400 dark:hover:bg-${color}-500`,
        // 对于 gray 这种中性色，可能需要特殊处理文字颜色，这里为了通用性保持统一逻辑
        color === 'gray' ? 'text-gray-900 dark:text-white' : 'text-white',
      )
    case 'outline':
      return cls(
        `border border-${color}-500 text-${color}-500 hover:bg-${color}-50 dark:hover:bg-${color}-950`,
        `focus:ring-${color}-50 dark:focus:ring-${color}-400/50`,
      )
    case 'soft':
      return cls(
        `bg-${color}-50 text-${color}-600 hover:bg-${color}-100`,
        `dark:bg-${color}-950 dark:text-${color}-400 dark:hover:bg-${color}-900`,
        `focus:ring-${color}-50 dark:focus:ring-${color}-400/50`,
      )
    case 'ghost':
      return cls(
        `text-${color}-500 hover:bg-${color}-50 dark:hover:bg-${color}-950`,
        `focus:ring-${color}-50 dark:focus:ring-${color}-400/50`,
      )
    case 'link':
      return cls(
        `text-${color}-500 hover:underline underline-offset-4`,
        `focus:ring-${color}-50 dark:focus:ring-${color}-400/50`,
      )
    default:
      return ''
  }
}

export const Button = (props: ButtonProps) => {
  // 1. 使用 splitProps 分离自定义 props 和原生 HTML button props
  const [local, rest] = splitProps(props, [
    'class',
    'variant',
    'size',
    'color',
    'block',
    'square',
    'loading',
    'icon',
    'children',
    'leading',
    'trailing',
  ])

  // 2. 默认值
  const variant = () => local.variant ?? 'solid'
  const size = () => local.size ?? 'md'
  const color = () => local.color ?? 'primary'

  // 3. 计算最终的类名 (使用 createMemo 优化)
  const buttonClass = createMemo(() => {
    const sizeClasses = local.square
      ? sizes[size()].replace(/px-\d+ /g, '').replace(/items-center/g, '') // 移除 padding，保留尺寸高度
      : sizes[size()]

    // 如果是 square 模式，我们需要手动设置宽高一致
    const squareClasses = local.square
      ? 'w-8 h-8 p-0 flex items-center justify-center' // 简化的 square 样式，实际项目可能需要根据 size 映射具体宽高
      : ''

    return cls(
      baseClasses,
      sizeClasses,
      getColorClasses(color(), variant()),
      local.block && 'w-full',
      local.loading && 'cursor-wait opacity-80',
      squareClasses,
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

    // 如果有 children，默认图标在前，除非 trailing 为 true
    if (local.children && !local.trailing) {
      return <span class="flex items-center">{local.icon}</span>
    }
    // 如果 trailing 为 true 或者没有 children（此时图标居中）
    return local.icon
  }

  const renderTrailingIcon = () => {
    if (local.loading) {
      return null
    }
    if (local.icon && local.trailing && local.children) {
      return <span class="flex items-center ml-auto">{local.icon}</span> // ml-auto push to right if needed, or just normal flow
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
