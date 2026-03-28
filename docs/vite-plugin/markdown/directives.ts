import YAML from 'yaml'

import { toKebabCase, toPosixPath } from '../core/strings'

import type { ParsedSegment } from './types'

function parseDirectivePayload(
  raw: string,
  id: string,
  directive: string,
): Record<string, unknown> {
  try {
    const parsed = YAML.parse(raw)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error(`${directive} payload must be an object`)
    }
    return parsed as Record<string, unknown>
  } catch (error) {
    throw new Error(`[example-markdown] invalid ${directive} block in ${id}: ${String(error)}`)
  }
}

export function parseSegments(source: string, id: string): ParsedSegment[] {
  const lines = source.split(/\r?\n/g)
  const segments: ParsedSegment[] = []
  const markdownBuffer: string[] = []

  const flushMarkdown = () => {
    const text = markdownBuffer.join('\n').trim()
    markdownBuffer.length = 0
    if (text) {
      segments.push({ type: 'markdown', text })
    }
  }

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]?.trim() ?? ''
    if (!line.startsWith(':::')) {
      markdownBuffer.push(lines[index] ?? '')
      continue
    }

    const directiveName = line.slice(3).trim()
    if (!directiveName) {
      markdownBuffer.push(lines[index] ?? '')
      continue
    }

    flushMarkdown()

    const payloadLines: string[] = []
    let foundEnd = false

    for (index += 1; index < lines.length; index += 1) {
      if ((lines[index]?.trim() ?? '') === ':::') {
        foundEnd = true
        break
      }
      payloadLines.push(lines[index] ?? '')
    }

    if (!foundEnd) {
      throw new Error(`[example-markdown] unclosed :::${directiveName} block in ${id}`)
    }

    const payload = parseDirectivePayload(payloadLines.join('\n'), id, `:::${directiveName}`)

    if (directiveName === 'example') {
      const name = payload.name
      if (typeof name !== 'string' || !name.trim()) {
        throw new Error(`[example-markdown] :::example requires "name" in ${id}`)
      }

      const sourcePath = payload.source
      segments.push({
        type: 'example',
        name: name.trim(),
        source:
          typeof sourcePath === 'string' && sourcePath.trim()
            ? toPosixPath(sourcePath.trim())
            : `./examples/${toKebabCase(name.trim())}.tsx`,
      })
      continue
    }

    if (directiveName === 'widget') {
      const widgetName = payload.name
      if (typeof widgetName !== 'string' || !widgetName.trim()) {
        throw new Error(`[example-markdown] :::widget requires "name" in ${id}`)
      }

      const props =
        payload.props && typeof payload.props === 'object' && !Array.isArray(payload.props)
          ? (payload.props as Record<string, unknown>)
          : undefined

      segments.push({
        type: 'widget',
        widgetName: widgetName.trim(),
        ...(props ? { props } : {}),
      })
      continue
    }

    if (directiveName === 'code-tabs') {
      const packageName = payload.package
      if (typeof packageName !== 'string' || !packageName.trim()) {
        throw new Error(`[example-markdown] :::code-tabs requires "package" in ${id}`)
      }

      segments.push({
        type: 'code-tabs',
        packageName: packageName.trim(),
      })
      continue
    }

    throw new Error(`[example-markdown] unsupported :::${directiveName} block in ${id}`)
  }

  flushMarkdown()

  return segments
}
