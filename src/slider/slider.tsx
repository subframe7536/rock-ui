import * as KobalteSlider from '@kobalte/core/slider'
import type { JSX, ValidComponent } from 'solid-js'
import { For, createEffect, createMemo, createSignal, mergeProps, splitProps } from 'solid-js'

import { useFormField } from '../form-field/form-field-context'
import { useId } from '../shared/utils'

import type { SliderVariantProps } from './slider.class'
import {
  sliderInputVariants,
  sliderRangeVariants,
  sliderRootVariants,
  sliderThumbVariants,
  sliderTrackVariants,
} from './slider.class'

type SliderColor = NonNullable<SliderBaseProps['color']>
type SliderSize = NonNullable<SliderBaseProps['size']>

export type SliderValue = number | number[]

export interface SliderClasses {
  root?: string
  track?: string
  range?: string
  thumb?: string
  input?: string
}

export interface SliderBaseProps extends Pick<SliderVariantProps, 'color' | 'size' | 'highlight'> {
  as?: ValidComponent
  id?: string
  name?: string
  value?: SliderValue
  defaultValue?: SliderValue
  min?: number
  max?: number
  step?: number
  minStepsBetweenThumbs?: number
  orientation?: 'horizontal' | 'vertical'
  inverted?: boolean
  required?: boolean
  disabled?: boolean
  readOnly?: boolean
  onValueChange?: (value: SliderValue) => void
  onChange?: (value: SliderValue) => void
  classes?: SliderClasses
}

export type SliderProps = SliderBaseProps &
  Omit<KobalteSlider.SliderRootProps, keyof SliderBaseProps | 'id' | 'children' | 'class'>

function normalizeSliderValues(
  value: SliderValue | undefined,
  fallback: number,
): number[] | undefined {
  if (value === undefined) {
    return undefined
  }

  if (Array.isArray(value)) {
    return value.length > 0 ? [...value] : [fallback]
  }

  return [value]
}

function createThumbAriaLabel(index: number, total: number): string {
  if (total <= 1) {
    return 'Thumb'
  }

  return `Thumb ${index + 1} of ${total}`
}

export function Slider(props: SliderProps): JSX.Element {
  const merged = mergeProps(
    {
      as: 'div' as ValidComponent,
      min: 0,
      max: 100,
      step: 1,
      minStepsBetweenThumbs: 0,
      orientation: 'horizontal' as const,
      color: 'primary' as const,
      size: 'md' as const,
    },
    props,
  )

  const [formProps, rangeProps, styleProps, rootProps] = splitProps(
    merged as SliderProps,
    [
      'as',
      'id',
      'name',
      'value',
      'defaultValue',
      'required',
      'disabled',
      'readOnly',
      'onValueChange',
      'onChange',
    ],
    ['min', 'max', 'step', 'minStepsBetweenThumbs', 'orientation', 'inverted'],
    ['color', 'size', 'highlight', 'classes'],
  )

  const field = useFormField(() => ({
    id: formProps.id,
    name: formProps.name,
    size: styleProps.size,
    color: styleProps.color,
    highlight: styleProps.highlight,
    disabled: formProps.disabled,
  }))
  const generatedId = useId(() => formProps.id, 'slider')

  const inputId = () => field.id() ?? generatedId()
  const resolvedColor = () => (field.color() ?? styleProps.color) as SliderColor
  const resolvedSize = () => (field.size() ?? styleProps.size) as SliderSize
  const resolvedHighlight = () => field.highlight() ?? styleProps.highlight
  const disabled = () => field.disabled()
  const kobalteValue = createMemo(() => normalizeSliderValues(formProps.value, rangeProps.min!))
  const kobalteDefaultValue = createMemo(() =>
    normalizeSliderValues(formProps.defaultValue, rangeProps.min!),
  )
  const [uncontrolledValues, setUncontrolledValues] = createSignal<number[]>([0])

  const thumbValues = () => kobalteValue() ?? kobalteDefaultValue() ?? [rangeProps.min!]
  const thumbIndexes = () => Array.from({ length: thumbValues().length }, (_, index) => index)

  createEffect(() => {
    if (formProps.value !== undefined) {
      return
    }

    const initial = kobalteDefaultValue() ?? [rangeProps.min!]
    setUncontrolledValues(initial)
  })

  function inputIdForIndex(index: number): string {
    if (index === 0) {
      return inputId()
    }

    return `${inputId()}-${index + 1}`
  }

  function toPublicValue(values: number[]): SliderValue {
    if (Array.isArray(formProps.value) || Array.isArray(formProps.defaultValue)) {
      return [...values]
    }

    return values[0] ?? rangeProps.min!
  }

  function resolveThumbPercent(index: number): number {
    const range = rangeProps.max! - rangeProps.min!

    if (range <= 0) {
      return 0
    }

    const visualValues = kobalteValue() ?? uncontrolledValues()
    const nextValue = visualValues[index] ?? rangeProps.min!
    const percent = ((nextValue - rangeProps.min!) / range) * 100

    if (!Number.isFinite(percent)) {
      return 0
    }

    return Math.max(0, Math.min(100, percent))
  }

  function thumbStyle(index: number): JSX.CSSProperties {
    const percent = resolveThumbPercent(index)

    if (rangeProps.orientation === 'vertical') {
      const startEdge = rangeProps.inverted ? 'top' : 'bottom'
      const transform = rangeProps.inverted ? 'translateY(-50%)' : 'translateY(50%)'

      return {
        [startEdge]: `calc(${percent}%)`,
        transform,
      } as JSX.CSSProperties
    }

    const startEdge = rangeProps.inverted ? 'right' : 'left'
    const transform = rangeProps.inverted ? 'translateX(50%)' : 'translateX(-50%)'

    return {
      [startEdge]: `calc(${percent}%)`,
      transform,
    } as JSX.CSSProperties
  }

  function onValueChange(values: number[]): void {
    if (formProps.value === undefined) {
      setUncontrolledValues([...values])
    }

    formProps.onValueChange?.(toPublicValue(values))
    field.emitFormInput()
  }

  function onChange(values: number[]): void {
    formProps.onChange?.(toPublicValue(values))
    field.emitFormChange()
  }

  return (
    <KobalteSlider.Root
      as={formProps.as}
      id={`${inputId()}-root`}
      name={field.name()}
      minValue={rangeProps.min}
      maxValue={rangeProps.max}
      step={rangeProps.step}
      minStepsBetweenThumbs={rangeProps.minStepsBetweenThumbs}
      orientation={rangeProps.orientation}
      inverted={rangeProps.inverted}
      value={kobalteValue()}
      defaultValue={kobalteDefaultValue()}
      required={formProps.required}
      disabled={disabled()}
      readOnly={formProps.readOnly}
      onChange={onValueChange}
      onChangeEnd={onChange}
      data-slot="root"
      class={sliderRootVariants(
        {
          color: resolvedColor(),
          size: resolvedSize(),
          orientation: rangeProps.orientation,
          highlight: resolvedHighlight(),
          disabled: disabled(),
        },
        styleProps.classes?.root,
      )}
      {...rootProps}
    >
      <KobalteSlider.Track
        data-slot="track"
        class={sliderTrackVariants(
          {
            color: resolvedColor(),
            size: resolvedSize(),
            orientation: rangeProps.orientation,
            highlight: resolvedHighlight(),
            disabled: disabled(),
          },
          styleProps.classes?.track,
        )}
      >
        <KobalteSlider.Fill
          data-slot="range"
          class={sliderRangeVariants(
            {
              color: resolvedColor(),
              size: resolvedSize(),
              orientation: rangeProps.orientation,
              highlight: resolvedHighlight(),
              disabled: disabled(),
            },
            styleProps.classes?.range,
          )}
        />
      </KobalteSlider.Track>

      <For each={thumbIndexes()}>
        {(thumbIndex) => (
          <KobalteSlider.Thumb
            data-slot="thumb"
            aria-label={createThumbAriaLabel(thumbIndex, thumbValues().length)}
            style={thumbStyle(thumbIndex)}
            class={sliderThumbVariants(
              {
                color: resolvedColor(),
                size: resolvedSize(),
                orientation: rangeProps.orientation,
                highlight: resolvedHighlight(),
                disabled: disabled(),
              },
              styleProps.classes?.thumb,
            )}
            onFocus={() => field.emitFormFocus()}
            onBlur={() => field.emitFormBlur()}
          >
            <KobalteSlider.Input
              id={inputIdForIndex(thumbIndex)}
              data-slot="input"
              class={sliderInputVariants(
                {
                  color: resolvedColor(),
                  size: resolvedSize(),
                  orientation: rangeProps.orientation,
                  highlight: resolvedHighlight(),
                  disabled: disabled(),
                },
                styleProps.classes?.input,
              )}
              {...(field.ariaAttrs() ?? {})}
            />
          </KobalteSlider.Thumb>
        )}
      </For>
    </KobalteSlider.Root>
  )
}
