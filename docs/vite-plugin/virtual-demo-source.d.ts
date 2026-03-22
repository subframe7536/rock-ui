declare module 'virtual:demo-source' {
  import type { JSX } from 'solid-js'

  export interface SourceCodeProps {
    lang?: string
    html?: string
    class?: string
    style?: JSX.CSSProperties
    children: JSX.Element
  }

  export function SourceCode(props: SourceCodeProps): JSX.Element
}
