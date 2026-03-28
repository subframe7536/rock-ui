import YAML from 'yaml'

import type { FrontmatterData, ParsedFrontmatter } from './types'

export function parseFrontmatter(markdownSource: string): ParsedFrontmatter {
  const source = markdownSource.startsWith('\uFEFF') ? markdownSource.slice(1) : markdownSource
  const match = source.match(/^\s*---\r?\n([\s\S]*?)\r?\n---\r?\n?/)
  if (!match) {
    return { data: {}, content: source }
  }

  const parsed = YAML.parse(match[1]) as Record<string, unknown> | null
  const data: FrontmatterData = {}

  if (parsed && typeof parsed === 'object') {
    if (
      Array.isArray(parsed.extraApiKeys) &&
      parsed.extraApiKeys.every((item) => typeof item === 'string')
    ) {
      data.extraApiKeys = parsed.extraApiKeys
    }

    if (
      parsed.apiDocOverride &&
      typeof parsed.apiDocOverride === 'object' &&
      !Array.isArray(parsed.apiDocOverride)
    ) {
      data.apiDocOverride = parsed.apiDocOverride as Record<string, unknown>
    }
  }

  return {
    data,
    content: source.slice(match[0].length),
  }
}

export function deepMerge(base: unknown, override: unknown): unknown {
  if (!override || typeof override !== 'object' || Array.isArray(override)) {
    return override
  }

  if (!base || typeof base !== 'object' || Array.isArray(base)) {
    return override
  }

  const output: Record<string, unknown> = { ...(base as Record<string, unknown>) }
  for (const [key, value] of Object.entries(override as Record<string, unknown>)) {
    if (Array.isArray(value)) {
      output[key] = value
      continue
    }

    if (value && typeof value === 'object') {
      output[key] = deepMerge(output[key], value)
      continue
    }

    output[key] = value
  }

  return output
}
