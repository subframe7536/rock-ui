import { clamp } from '@kobalte/utils'

import { fixToPrecision, nearlyEqual, resolveSize } from './size'
import type { ResizableHandleAria, ResizablePanelItem, ResizableResolvedPanel } from './types'

export function resolvePanels(
  panels: ResizablePanelItem[] | undefined,
  rootSize: number,
  panelIdPrefix: string,
): ResizableResolvedPanel[] {
  return (panels ?? []).map((panel, index) => {
    const minSize = clamp(resolveSize(panel.minSize ?? 0, rootSize), 0, 1)
    const maxSize = clamp(resolveSize(panel.maxSize ?? '100%', rootSize), minSize, 1)
    const collapsedSize = clamp(resolveSize(panel.collapsedSize ?? 0, rootSize), 0, minSize)
    const collapseThreshold = clamp(
      resolveSize(panel.collapseThreshold ?? '5%', rootSize),
      0,
      Math.max(0, minSize - collapsedSize),
    )

    return {
      panelId: panel.panelId ?? `${panelIdPrefix}-panel-${index + 1}`,
      initialSize: panel.initialSize,
      minSize,
      maxSize,
      collapsible: panel.collapsible === true,
      collapsedSize,
      collapseThreshold,
      onResize: panel.onResize,
      onCollapse: panel.onCollapse,
      onExpand: panel.onExpand,
      class: panel.class,
      style: panel.style,
      content: panel.content,
    }
  })
}

export function isPanelCollapsed(size: number, panel: ResizableResolvedPanel): boolean {
  return panel.collapsible && nearlyEqual(size, panel.collapsedSize)
}

export function getHandleAria(input: {
  handleIndex: number
  sizes: number[]
  panels: ResizableResolvedPanel[]
}): ResizableHandleAria {
  const { handleIndex, sizes, panels } = input
  let valueNow = 0
  let valueMin = 0
  let followingMin = 0

  for (let index = 0; index <= handleIndex; index += 1) {
    valueNow += sizes[index] ?? 0
    valueMin += panels[index]?.minSize ?? 0
  }

  for (let index = handleIndex + 1; index < panels.length; index += 1) {
    followingMin += panels[index]?.minSize ?? 0
  }

  return {
    controls: panels[handleIndex]?.panelId,
    valueNow: fixToPrecision(valueNow),
    valueMin: fixToPrecision(valueMin),
    valueMax: fixToPrecision(1 - followingMin),
  }
}
