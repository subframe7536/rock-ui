import MarkdownIt from 'markdown-it'
import path from 'node:path'

import { loadComponentApiDoc } from '../api-doc/load'
import { resolveDocsPageContext, toImportPath } from '../core/paths'
import { toSingleQuoted } from '../core/strings'

import { parseSegments } from './directives'
import { deepMerge, parseFrontmatter } from './frontmatter'
import type { CompileMarkdownOptions, MarkdownHighlightLang, ParsedSegment } from './types'

const MARKDOWN_LANG_ALIASES: Record<string, MarkdownHighlightLang> = {
  bash: 'bash',
  sh: 'bash',
  shell: 'bash',
  zsh: 'bash',
  console: 'bash',
  tsx: 'tsx',
  ts: 'tsx',
  typescript: 'tsx',
  jsx: 'tsx',
  css: 'css',
  js: 'javascript',
  cjs: 'javascript',
  mjs: 'javascript',
  javascript: 'javascript',
}

interface ExampleImport {
  componentAlias: string
  codeAlias: string
  sourcePath: string
  exportName: string
}

interface SegmentLiteral {
  code: string
  importSpec?: ExampleImport
}

interface CodeTabItemLiteral {
  label: string
  value: string
  html: string
}

function normalizeMarkdownLang(value: string): MarkdownHighlightLang | null {
  const key = value.trim().toLowerCase()
  if (!key) {
    return null
  }
  return MARKDOWN_LANG_ALIASES[key] ?? null
}

function createMarkdown(
  highlightCode?: (source: string, lang: MarkdownHighlightLang) => string | null,
): MarkdownIt {
  return new MarkdownIt({
    html: false,
    linkify: true,
    typographer: true,
    highlight(source, info) {
      if (!highlightCode) {
        return ''
      }

      const langToken = info.trim().split(/\s+/g)[0] ?? ''
      const lang = normalizeMarkdownLang(langToken)
      if (!lang) {
        return ''
      }

      return highlightCode(source, lang) ?? ''
    },
  })
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function createPlainCodeBlockHtml(source: string): string {
  return `<pre><code>${escapeHtml(source)}</code></pre>`
}

function createCodeTabsItems(
  packageName: string,
  highlightCode?: (source: string, lang: MarkdownHighlightLang) => string | null,
): CodeTabItemLiteral[] {
  return [
    { label: 'bun', value: 'bun', source: `bun add ${packageName}` },
    { label: 'pnpm', value: 'pnpm', source: `pnpm add ${packageName}` },
    { label: 'npm', value: 'npm', source: `npm i ${packageName}` },
  ].map((command) => ({
    label: command.label,
    value: command.value,
    html: highlightCode?.(command.source, 'bash') ?? createPlainCodeBlockHtml(command.source),
  }))
}

function buildSegmentLiterals(
  segments: ParsedSegment[],
  renderMarkdown: (source: string) => string,
  highlightCode?: (source: string, lang: MarkdownHighlightLang) => string | null,
): SegmentLiteral[] {
  let exampleIndex = 0

  return segments.map((segment) => {
    if (segment.type === 'markdown') {
      return {
        code: `{ type: 'markdown', html: ${JSON.stringify(renderMarkdown(segment.text).trim())} }`,
      }
    }

    if (segment.type === 'widget') {
      return {
        code: `{ type: 'widget', widgetName: ${JSON.stringify(segment.widgetName)}${
          segment.props ? `, props: ${JSON.stringify(segment.props)}` : ''
        } }`,
      }
    }

    if (segment.type === 'code-tabs') {
      return {
        code: `{ type: 'code-tabs', items: ${JSON.stringify(
          createCodeTabsItems(segment.packageName, highlightCode),
        )} }`,
      }
    }

    const componentAlias = `ExampleComponent${exampleIndex}`
    const codeAlias = `ExampleCode${exampleIndex}`
    exampleIndex += 1

    return {
      code: `{ type: 'example', component: ${componentAlias}, code: ${codeAlias} }`,
      importSpec: {
        componentAlias,
        codeAlias,
        sourcePath: segment.source,
        exportName: segment.name,
      },
    }
  })
}

export function compileMarkdownPage(
  markdownSource: string,
  id: string,
  options: CompileMarkdownOptions = {},
): string {
  const idWithoutQuery = id.split('?')[0] ?? id
  const page = resolveDocsPageContext(idWithoutQuery)
  const parsedFrontmatter = parseFrontmatter(markdownSource)
  const segments = parseSegments(parsedFrontmatter.content, idWithoutQuery)
  const markdown = createMarkdown(options.highlightCode)
  const segmentLiterals = buildSegmentLiterals(
    segments,
    (source) => markdown.render(source),
    options.highlightCode,
  )
  const runtimePath = toImportPath(idWithoutQuery, path.join(page.docsRoot, 'components/markdown'))

  const importLines = [`import { Markdown } from ${toSingleQuoted(runtimePath)}`]
  const segmentCodes: string[] = []

  for (const literal of segmentLiterals) {
    if (!literal.importSpec) {
      segmentCodes.push(literal.code)
      continue
    }

    importLines.push(
      literal.importSpec.exportName === 'default'
        ? `import ${literal.importSpec.componentAlias} from ${toSingleQuoted(literal.importSpec.sourcePath)}`
        : `import { ${literal.importSpec.exportName} as ${literal.importSpec.componentAlias} } from ${toSingleQuoted(
            literal.importSpec.sourcePath,
          )}`,
    )

    importLines.push(
      `import ${literal.importSpec.codeAlias} from ${toSingleQuoted(
        `${literal.importSpec.sourcePath}?example-source&name=${encodeURIComponent(
          literal.importSpec.exportName,
        )}`,
      )}`,
    )

    segmentCodes.push(literal.code)
  }

  const extraApiKeys = parsedFrontmatter.data.extraApiKeys ?? []
  const loadedApiDoc = options.projectRoot
    ? loadComponentApiDoc(options.projectRoot, page.pageKey)
    : null
  const loadedExtraApiDocs =
    options.projectRoot && extraApiKeys.length > 0
      ? [...new Set(extraApiKeys)]
          .map((key) => loadComponentApiDoc(options.projectRoot!, key))
          .filter((value) => Boolean(value))
      : []

  const mergedApiDoc =
    parsedFrontmatter.data.apiDocOverride && loadedApiDoc
      ? deepMerge(loadedApiDoc, parsedFrontmatter.data.apiDocOverride)
      : (loadedApiDoc ?? parsedFrontmatter.data.apiDocOverride)

  const shouldExposeComponentKey = Boolean(mergedApiDoc || loadedExtraApiDocs.length > 0)
  const configFields = [
    shouldExposeComponentKey ? `componentKey: ${JSON.stringify(page.pageKey)}` : '',
    mergedApiDoc ? `apiDoc: ${JSON.stringify(mergedApiDoc)}` : '',
    loadedExtraApiDocs.length > 0 ? `extraApiDocs: ${JSON.stringify(loadedExtraApiDocs)}` : '',
    'segments',
  ].filter(Boolean)

  return [
    ...importLines,
    '',
    `const segments = [${segmentCodes.join(', ')}]`,
    '',
    'export default function MarkdownPage() {',
    `  return Markdown({ ${configFields.join(', ')} })`,
    '}',
    '',
  ].join('\n')
}
