import type { JSX } from 'solid-js'
import { mergeProps, splitProps } from 'solid-js'

import type { SlotClasses } from '../shared/slot-class'

import { FieldGroupProvider } from './field-group-context'
import type { FieldGroupOrientation, FieldGroupSize } from './field-group-context'
import { fieldGroupVariants } from './field-group.class'

export type { FieldGroupOrientation, FieldGroupSize } from './field-group-context'

type FieldGroupSlots = 'root'

export type FieldGroupClasses = SlotClasses<FieldGroupSlots>

export interface FieldGroupBaseProps {
  size?: FieldGroupSize
  orientation?: FieldGroupOrientation
  classes?: FieldGroupClasses
  children?: JSX.Element
}

export type FieldGroupProps = FieldGroupBaseProps

export function FieldGroup(props: FieldGroupProps): JSX.Element {
  const merged = mergeProps(
    {
      size: 'md' as const,
      orientation: 'horizontal' as const,
    },
    props,
  )

  const [layoutProps, contentProps] = splitProps(merged as FieldGroupProps, [
    'size',
    'orientation',
    'classes',
  ])

  return (
    <FieldGroupProvider
      value={{
        get size() {
          return layoutProps.size
        },
        get orientation() {
          return layoutProps.orientation
        },
      }}
    >
      <div
        data-slot="root"
        data-orientation={layoutProps.orientation}
        class={fieldGroupVariants(
          {
            orientation: layoutProps.orientation,
          },
          layoutProps.classes?.root,
        )}
      >
        {contentProps.children}
      </div>
    </FieldGroupProvider>
  )
}
