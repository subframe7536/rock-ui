import * as KobalteProgress from '@kobalte/core/progress'
import type { JSX } from 'solid-js'
import { For, Show, createMemo, mergeProps, splitProps } from 'solid-js'

import type { ProgressVariantProps } from './progress.class'
import {
  progressBaseVariants,
  progressIndicatorVariants,
  progressRootVariants,
  progressStatusVariants,
  progressStepVariants,
  progressStepsVariants,
} from './progress.class'

type ProgressStepState = ProgressStepRenderContext['state']

export interface ProgressClasses {
  root?: string
  status?: string
  base?: string
  indicator?: string
  steps?: string
  step?: string
}

export interface ProgressStatusRenderContext {
  percent?: number
}

export interface ProgressStepRenderContext {
  step: string
  index: number
  state: 'active' | 'first' | 'last' | 'other'
}

export interface ProgressBaseProps extends Pick<
  ProgressVariantProps,
  'animation' | 'color' | 'orientation' | 'size'
> {
  value?: number | null
  max?: number | string[]
  status?: boolean
  inverted?: boolean
  getValueLabel?: KobalteProgress.ProgressRootProps['getValueLabel']
  renderStatus?: (context: ProgressStatusRenderContext) => JSX.Element
  renderStep?: (context: ProgressStepRenderContext) => JSX.Element
  classes?: ProgressClasses
}

export type ProgressProps = ProgressBaseProps &
  Omit<
    KobalteProgress.ProgressRootProps,
    | keyof ProgressBaseProps
    | 'as'
    | 'class'
    | 'value'
    | 'minValue'
    | 'maxValue'
    | 'indeterminate'
    | 'children'
  >

function resolveMaxValue(max: ProgressProps['max']): number {
  if (Array.isArray(max)) {
    return Math.max(max.length - 1, 0)
  }

  if (typeof max === 'number' && Number.isFinite(max) && max >= 0) {
    return max
  }

  return 100
}

export function Progress(props: ProgressProps): JSX.Element {
  const merged = mergeProps(
    {
      value: null,
      max: 100,
      status: false,
      inverted: false,
      orientation: 'horizontal' as const,
      animation: 'carousel' as const,
      color: 'primary' as const,
      size: 'md' as const,
    },
    props,
  )

  const [local, rest] = splitProps(merged as ProgressProps & { as?: unknown; class?: string }, [
    'as',
    'class',
    'value',
    'max',
    'status',
    'inverted',
    'orientation',
    'animation',
    'color',
    'size',
    'renderStatus',
    'renderStep',
    'classes',
  ])

  const steps = createMemo<string[]>(() => (Array.isArray(local.max) ? local.max : []))
  const hasSteps = createMemo(() => steps().length > 0)
  const realMax = createMemo(() => resolveMaxValue(local.max))
  const isIndeterminate = createMemo(() => local.value === null || local.value === undefined)

  const kobalteMax = createMemo(() => (realMax() <= 0 ? 1 : realMax()))
  const kobalteValue = createMemo(() => {
    if (isIndeterminate()) {
      return 0
    }

    const value = Number(local.value)
    if (!Number.isFinite(value)) {
      return 0
    }

    return value
  })

  function ProgressContent(): JSX.Element {
    const context = KobalteProgress.useProgressContext()
    const percent = createMemo<number | undefined>(() => {
      if (isIndeterminate()) {
        return undefined
      }

      const ratio = context.valuePercent()
      if (!Number.isFinite(ratio)) {
        return 0
      }

      const bounded = Math.min(Math.max(ratio, 0), 1)
      return Math.round(bounded * 100)
    })

    const statusStyle = createMemo<JSX.CSSProperties>(() => {
      const styleValue = `${Math.max(percent() ?? 0, 0)}%`
      if (local.orientation === 'vertical') {
        return { height: styleValue }
      }

      return { width: styleValue }
    })

    const indicatorStyle = createMemo<JSX.CSSProperties | undefined>(() => {
      const currentPercent = percent()
      if (currentPercent === undefined) {
        return undefined
      }

      const distance = 100 - currentPercent
      if (local.orientation === 'vertical') {
        return {
          transform: `translateY(${local.inverted ? '' : '-'}${distance}%)`,
        }
      }

      return {
        transform: `translateX(${local.inverted ? '' : '-'}${distance}%)`,
      }
    })

    function stepState(index: number): ProgressStepState {
      const value = context.value()
      const activeIndex = Number.isFinite(value) ? Math.round(value) : 0
      const isActive = !isIndeterminate() && index === activeIndex
      const lastIndex = steps().length - 1

      if (isActive && index === 0) {
        return 'first'
      }

      if (isActive && index === lastIndex) {
        return 'last'
      }

      if (isActive) {
        return 'active'
      }

      return 'other'
    }

    return (
      <>
        <Show when={!isIndeterminate() && (local.status || local.renderStatus)}>
          <div
            data-slot="status"
            class={progressStatusVariants(
              {
                orientation: local.orientation,
                size: local.size,
                color: local.color,
                inverted: local.inverted,
              },
              local.classes?.status,
            )}
            style={statusStyle()}
          >
            <Show when={local.renderStatus} fallback={`${percent() ?? 0}%`}>
              {(renderStatus) => renderStatus()({ percent: percent() })}
            </Show>
          </div>
        </Show>

        <KobalteProgress.Track
          data-slot="base"
          class={progressBaseVariants(
            {
              orientation: local.orientation,
              size: local.size,
            },
            local.classes?.base,
          )}
        >
          <KobalteProgress.Fill
            data-slot="indicator"
            class={progressIndicatorVariants(
              {
                color: local.color,
                orientation: local.orientation,
                animation: local.animation,
              },
              local.classes?.indicator,
            )}
            style={indicatorStyle()}
          />
        </KobalteProgress.Track>

        <Show when={hasSteps()}>
          <div
            data-slot="steps"
            class={progressStepsVariants(
              {
                orientation: local.orientation,
                size: local.size,
                color: local.color,
              },
              local.classes?.steps,
            )}
          >
            <For each={steps()}>
              {(step, index) => (
                <div
                  data-slot="step"
                  class={progressStepVariants(
                    {
                      state: stepState(index()),
                      size: local.size,
                      color: local.color,
                      inverted: local.inverted,
                    },
                    local.classes?.step,
                  )}
                >
                  <Show when={local.renderStep} fallback={step}>
                    {(renderStep) =>
                      renderStep()({
                        step,
                        index: index(),
                        state: stepState(index()),
                      })
                    }
                  </Show>
                </div>
              )}
            </For>
          </div>
        </Show>
      </>
    )
  }

  return (
    <KobalteProgress.Root
      minValue={0}
      maxValue={kobalteMax()}
      value={kobalteValue()}
      indeterminate={isIndeterminate()}
      data-slot="root"
      data-orientation={local.orientation}
      class={progressRootVariants(
        {
          orientation: local.orientation,
        },
        local.classes?.root,
      )}
      {...rest}
    >
      <ProgressContent />
    </KobalteProgress.Root>
  )
}
