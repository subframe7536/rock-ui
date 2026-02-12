import { cn } from '../../../src/shared/utils'

export interface DemoIconProps {
  name: string
  class?: string
}

export const DemoIcon = (props: DemoIconProps) => (
  <div class={cn(`i-lucide:${props.name}`, props.class)} />
)
