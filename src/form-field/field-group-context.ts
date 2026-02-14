import { createContextProvider } from '../shared/create-context-provider'

export type FieldGroupOrientation = 'horizontal' | 'vertical'

export interface FieldGroupContextValue {
  size?: string
  orientation?: FieldGroupOrientation
}

export const [FieldGroupProvider, useFieldGroupContext] =
  createContextProvider<FieldGroupContextValue | null>('FieldGroup', null)
