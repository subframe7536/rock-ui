import type { JSX } from 'solid-js'

import { cn } from '../../src'

import { ShikiCodeBlock } from './shiki-code-block'

export interface SourceCodeProps {
  lang?: string
  html?: string
  class?: string
  style?: JSX.CSSProperties
  children: JSX.Element
}

export const SourceCode = (props: SourceCodeProps) => {
  return (
    <ShikiCodeBlock
      html={props.html}
      class={cn('border border-border rounded-xl bg-muted/70 overflow-hidden', props.class)}
      style={props.style}
    >
      {props.children}
    </ShikiCodeBlock>
  )
}
