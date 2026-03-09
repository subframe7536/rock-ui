import type { ResizableSize } from './types'
import { EPSILON, PRECISION } from './types'

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

export function nearlyEqual(a: number, b: number): boolean {
  return Math.abs(a - b) <= EPSILON
}

export function fixToPrecision(value: number): number {
  return Number.parseFloat(value.toFixed(PRECISION))
}

function correctRemainder(sizes: number[], total: number): void {
  const lastIndex = sizes.length - 1
  const remainder = fixToPrecision(1 - total)
  sizes[lastIndex] = fixToPrecision((sizes[lastIndex] ?? 0) + remainder)
}

export function normalizeSizeVector(sizes: number[]): number[] {
  const sizeCount = sizes.length
  if (sizeCount === 0) {
    return []
  }

  const normalized: number[] = []
  let total = 0

  for (let index = 0; index < sizeCount; index += 1) {
    const size = sizes[index]
    const clamped = isFiniteNumber(size) ? Math.max(0, size) : 0

    normalized[index] = clamped
    total += clamped
  }

  if (total <= EPSILON) {
    const equal = fixToPrecision(1 / sizeCount)
    let fallbackTotal = 0

    for (let index = 0; index < sizeCount; index += 1) {
      normalized[index] = equal
      fallbackTotal += equal
    }

    correctRemainder(normalized, fallbackTotal)
    return normalized
  }

  let normalizedTotal = 0

  for (let index = 0; index < sizeCount; index += 1) {
    const nextSize = fixToPrecision(normalized[index] / total)
    normalized[index] = nextSize
    normalizedTotal += nextSize
  }

  correctRemainder(normalized, normalizedTotal)

  return normalized
}

export function resolveSize(size: ResizableSize | undefined | null, rootSize: number): number {
  const safeRootSize = rootSize > EPSILON ? rootSize : 1

  if (!size) {
    return 0
  }

  if (isFiniteNumber(size)) {
    return fixToPrecision(size / safeRootSize)
  }

  if (typeof size === 'string' && size.endsWith('%')) {
    const percentage = Number.parseFloat(size)
    if (!Number.isFinite(percentage)) {
      return 0
    }

    return fixToPrecision(percentage / 100)
  }

  return 0
}

export function resolveKeyboardDelta(delta: ResizableSize | undefined, rootSize: number): number {
  if (delta === undefined) {
    return resolveSize('10%', rootSize)
  }

  return resolveSize(delta, rootSize)
}

export function normalizePanelSizes(input: {
  panelCount: number
  rootSize: number
  panelInitialSizes: Array<ResizableSize | undefined>
  controlledSizes?: Array<ResizableSize | undefined>
}): number[] {
  const { panelCount, rootSize, panelInitialSizes, controlledSizes } = input

  if (panelCount === 0) {
    return []
  }

  if (controlledSizes && controlledSizes.length > 0) {
    const aligned: number[] = []
    let definedSum = 0
    let undefinedCount = 0

    for (let index = 0; index < panelCount; index += 1) {
      const controlledSize = controlledSizes[index]
      if (controlledSize === undefined) {
        aligned[index] = 0
        undefinedCount += 1
        continue
      }

      const resolvedControlledSize = resolveSize(controlledSize, rootSize)
      const clampedControlledSize = Math.max(0, resolvedControlledSize)
      aligned[index] = clampedControlledSize
      definedSum += clampedControlledSize
    }

    if (undefinedCount > 0) {
      const remaining = 1 - definedSum
      const fallbackSize = remaining > EPSILON ? remaining / undefinedCount : 0

      for (let index = 0; index < panelCount; index += 1) {
        if (controlledSizes[index] === undefined) {
          aligned[index] = fallbackSize
        }
      }
    }

    return normalizeSizeVector(aligned)
  }

  const resolved: number[] = []
  let definedSum = 0
  let undefinedCount = 0

  for (let index = 0; index < panelCount; index += 1) {
    const panelSize = panelInitialSizes[index]
    if (panelSize === undefined) {
      resolved[index] = 0
      undefinedCount += 1
      continue
    }

    const size = resolveSize(panelSize, rootSize)
    resolved[index] = size
    definedSum += size
  }

  if (undefinedCount > 0) {
    const remaining = 1 - definedSum
    const fallbackSize = remaining > EPSILON ? remaining / undefinedCount : 1 / panelCount

    for (let index = 0; index < panelCount; index += 1) {
      if (resolved[index] === 0 && panelInitialSizes[index] === undefined) {
        resolved[index] = fallbackSize
      }
    }
  }

  return normalizeSizeVector(resolved)
}
