import type { Accessor, JSX } from 'solid-js'

export type MaybeRenderProp<TProps> = JSX.Element | ((props: TProps) => JSX.Element)

export function resolveRenderProp<TProps>(
  value: MaybeRenderProp<TProps> | undefined,
  propsInput: Accessor<TProps>,
): JSX.Element {
  if (typeof value !== 'function') {
    return value as JSX.Element
  }

  if (value.length === 0) {
    return (value as () => JSX.Element)()
  }

  return value(propsInput())
}
