import type { JSX } from 'solid-js'

export interface BaseSelectItems<TItems> {
  value?: string | number
  label?: string | JSX.Element
  key?: string
  disabled?: boolean
  children?: TItems[]
}

export type SelectFilterMode = 'startsWith' | 'endsWith' | 'contains'

export type SelectFilterOption<TRaw> =
  | boolean
  | SelectFilterMode
  | ((inputValue: string, option: TRaw) => boolean)

export interface SelectFilterableOption<TRaw> {
  key: string
  raw: TRaw
}

export interface NormalizedOption<TItems> {
  value: string
  label: string | JSX.Element
  key: string
  disabled: boolean
  raw: TItems
  isGroup?: false
}

export interface NormalizedGroup<TItems> {
  label: string | JSX.Element
  options: NormalizedOption<TItems>[]
  isGroup: true
}

export interface SelectControlState<TItems> {
  selectedOptions: () => NormalizedOption<TItems>[]
  remove: (option: NormalizedOption<TItems>) => void
  clear: () => void
}

export const SELECT_COMMON_DEFAULT_PROPS = {
  variant: 'outline' as const,
  placeholder: '',
  allowClear: false,
  triggerIcon: 'icon-chevron-down' as const,
  loadingIcon: 'icon-loading' as const,
  filterOption: true,
  openOnClick: 'control' as const,
}
