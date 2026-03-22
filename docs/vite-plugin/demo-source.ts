import { readFileSync } from 'node:fs'
import path from 'node:path'

import { parseSync } from 'oxc-parser'
import { walk } from 'oxc-walker'
import { createHighlighterCore } from 'shiki/core'
import { createJavaScriptRegexEngine } from 'shiki/engine-javascript.mjs'
import type { Plugin } from 'vite'

const VIRTUAL_DEMO_SOURCE = 'virtual:demo-source'
const RESOLVED_VIRTUAL_DEMO_SOURCE = '\0rock-ui-demo-source'
const DEMO_DOC_FILE_RE = /[\\/]docs[\\/].*\.tsx$/

const SUPPORTED_LANGUAGES = new Set(['tsx', 'bash'])

interface CodeInjection {
  propInsertPos: number
  childStart: number
  childEnd: number
  lang: string
  propName: 'code' | 'html'
  sourceText?: string
  skip?: boolean
}

interface ApiDocInjection {
  propInsertPos: number
  componentKey: string
}

interface InjectionResult {
  pos: number
  text: string
}

type ProgramNode = ReturnType<typeof parseSync>['program']

function dedentSource(source: string): string {
  const [first, ...lines] = source.split('\n')
  const minIndent = lines
    .filter((l) => l.trim().length > 0)
    .reduce((min, l) => {
      const indent = l.match(/^(\s*)/)?.[1].length ?? 0
      return Math.min(min, indent)
    }, Number.POSITIVE_INFINITY)

  return minIndent === Number.POSITIVE_INFINITY
    ? source
    : [first, ...lines.map((l) => l.slice(minIndent))].join('\n')
}

function loadApiDoc(projectRoot: string, key: string): unknown | null {
  try {
    const jsonPath = path.join(projectRoot, 'docs/api-doc/components', `${key}.json`)
    const content = readFileSync(jsonPath, 'utf8')
    return JSON.parse(content)
  } catch {
    return null
  }
}

function hasJsxAttribute(node: { attributes: unknown[] }, attrName: string): boolean {
  return node.attributes.some(
    (attr) =>
      typeof attr === 'object' &&
      attr !== null &&
      'type' in attr &&
      attr.type === 'JSXAttribute' &&
      'name' in attr &&
      typeof attr.name === 'object' &&
      attr.name !== null &&
      'type' in attr.name &&
      attr.name.type === 'JSXIdentifier' &&
      'name' in attr.name &&
      attr.name.name === attrName,
  )
}

function getLiteralStringAttribute(
  node: { attributes: unknown[] },
  attrName: string,
): string | undefined {
  const attr = node.attributes.find(
    (item) =>
      typeof item === 'object' &&
      item !== null &&
      'type' in item &&
      item.type === 'JSXAttribute' &&
      'name' in item &&
      typeof item.name === 'object' &&
      item.name !== null &&
      'type' in item.name &&
      item.name.type === 'JSXIdentifier' &&
      'name' in item.name &&
      item.name.name === attrName,
  )

  if (!attr || typeof attr !== 'object' || !('value' in attr)) {
    return undefined
  }

  const value = attr.value
  if (!value || typeof value !== 'object' || !('type' in value)) {
    return undefined
  }

  if (value.type === 'Literal' && 'value' in value && typeof value.value === 'string') {
    return value.value
  }

  if (
    value.type === 'JSXExpressionContainer' &&
    'expression' in value &&
    typeof value.expression === 'object' &&
    value.expression !== null &&
    'type' in value.expression &&
    value.expression.type === 'Literal' &&
    'value' in value.expression &&
    typeof value.expression.value === 'string'
  ) {
    return value.expression.value
  }

  return undefined
}

function normalizeHighlightLang(lang: string | undefined): 'tsx' | 'bash' {
  if (!lang) {
    return 'tsx'
  }
  return SUPPORTED_LANGUAGES.has(lang) ? (lang as 'tsx' | 'bash') : 'tsx'
}

function isJsxIdentifierName(name: unknown, expected: string): boolean {
  return (
    typeof name === 'object' &&
    name !== null &&
    'type' in name &&
    name.type === 'JSXIdentifier' &&
    'name' in name &&
    name.name === expected
  )
}

function hasSourceCodeChild(node: unknown): boolean {
  if (!node || typeof node !== 'object' || !('children' in node) || !Array.isArray(node.children)) {
    return false
  }

  return node.children.some(
    (child) =>
      child &&
      typeof child === 'object' &&
      'type' in child &&
      child.type === 'JSXElement' &&
      'openingElement' in child &&
      typeof child.openingElement === 'object' &&
      child.openingElement !== null &&
      'name' in child.openingElement &&
      isJsxIdentifierName(child.openingElement.name, 'SourceCode'),
  )
}

function extractSourceCodeText(node: unknown, code: string): string | undefined {
  if (!node || typeof node !== 'object' || !('children' in node) || !Array.isArray(node.children)) {
    return undefined
  }

  if (node.children.length !== 1) {
    return undefined
  }

  const onlyChild = node.children[0]
  if (!onlyChild || typeof onlyChild !== 'object' || !('type' in onlyChild)) {
    return undefined
  }

  if (onlyChild.type === 'JSXText' && 'value' in onlyChild && typeof onlyChild.value === 'string') {
    return onlyChild.value
  }

  if (
    onlyChild.type !== 'JSXExpressionContainer' ||
    !('expression' in onlyChild) ||
    !onlyChild.expression ||
    typeof onlyChild.expression !== 'object' ||
    !('type' in onlyChild.expression)
  ) {
    return undefined
  }

  const expr = onlyChild.expression
  if (expr.type === 'Literal' && 'value' in expr && typeof expr.value === 'string') {
    return expr.value
  }

  if (
    expr.type === 'TemplateLiteral' &&
    'expressions' in expr &&
    Array.isArray(expr.expressions) &&
    expr.expressions.length === 0 &&
    'quasis' in expr &&
    Array.isArray(expr.quasis)
  ) {
    const quasi = expr.quasis[0]
    if (
      quasi &&
      typeof quasi === 'object' &&
      'value' in quasi &&
      quasi.value &&
      typeof quasi.value === 'object'
    ) {
      if ('cooked' in quasi.value && typeof quasi.value.cooked === 'string') {
        return quasi.value.cooked
      }
      if ('raw' in quasi.value && typeof quasi.value.raw === 'string') {
        return quasi.value.raw
      }
    }
  }

  if ('start' in onlyChild && 'end' in onlyChild && typeof onlyChild.start === 'number' && typeof onlyChild.end === 'number') {
    return code.slice(onlyChild.start, onlyChild.end)
  }

  return undefined
}

function resolveChildBoundaries(
  program: ProgramNode,
  targetName: string,
  injections: CodeInjection[],
  code: string,
): void {
  if (injections.length === 0) {
    return
  }

  walk(program, {
    enter(node) {
      if (node.type !== 'JSXElement') {
        return
      }
      if (!isJsxIdentifierName(node.openingElement.name, targetName) || node.openingElement.selfClosing) {
        return
      }

      const injection = injections.find((inj) => inj.childStart === node.openingElement.end)
      if (injection && node.closingElement) {
        injection.childEnd = node.closingElement.start
        if (targetName === 'DemoSection') {
          injection.skip = hasSourceCodeChild(node)
          return
        }
        if (targetName === 'SourceCode') {
          injection.sourceText = extractSourceCodeText(node, code)
        }
      }
    },
  })
}

export async function transformDemoSource(
  code: string,
  id: string,
  toHTML: (src: string, lang: 'tsx' | 'bash') => string,
  projectRoot: string,
): Promise<string | null> {
  const { program } = parseSync(id, code, { lang: 'tsx', sourceType: 'module' })

  const demoSectionInjections: CodeInjection[] = []
  const sourceCodeInjections: CodeInjection[] = []
  const apiDocInjections: ApiDocInjection[] = []

  walk(program, {
    enter(node) {
      if (node.type !== 'JSXOpeningElement') {
        return
      }

      if (node.name.type !== 'JSXIdentifier') {
        return
      }

      if (node.name.name === 'DemoSection') {
        if (hasJsxAttribute(node, 'code') || node.selfClosing) {
          return
        }

        demoSectionInjections.push({
          propInsertPos: node.end - 1,
          childStart: node.end,
          childEnd: -1,
          lang: 'tsx',
          propName: 'code',
        })
        return
      }

      if (node.name.name === 'SourceCode') {
        if (hasJsxAttribute(node, 'html') || node.selfClosing) {
          return
        }

        sourceCodeInjections.push({
          propInsertPos: node.end - 1,
          childStart: node.end,
          childEnd: -1,
          lang: getLiteralStringAttribute(node, 'lang') ?? 'tsx',
          propName: 'html',
        })
        return
      }

      if (node.name.name === 'DemoPage') {
        if (hasJsxAttribute(node, 'apiDoc')) {
          return
        }

        const componentKey = getLiteralStringAttribute(node, 'componentKey')
        if (!componentKey) {
          return
        }

        apiDocInjections.push({
          propInsertPos: node.selfClosing ? node.end - 2 : node.end - 1,
          componentKey,
        })
      }
    },
  })

  resolveChildBoundaries(program, 'DemoSection', demoSectionInjections, code)
  resolveChildBoundaries(program, 'SourceCode', sourceCodeInjections, code)

  const validDemoSectionInjections = demoSectionInjections.filter(
    (inj) => inj.childEnd > 0 && !inj.skip,
  )

  const validSourceCodeInjections = sourceCodeInjections.filter((inj) => inj.childEnd > 0)
  const validCodeInjections = [...validDemoSectionInjections, ...validSourceCodeInjections]
  if (validCodeInjections.length === 0 && apiDocInjections.length === 0) {
    return null
  }

  const allInjections: InjectionResult[] = []

  for (const inj of validCodeInjections) {
    const rawChildrenSource = (
      inj.sourceText ??
      code
        .slice(inj.childStart, inj.childEnd)
        .trim()
        .replace(/^\n+|\n+$/g, '')
    )

    const childrenSource = dedentSource(rawChildrenSource)
    const html = toHTML(childrenSource, normalizeHighlightLang(inj.lang))
    const escaped = JSON.stringify(html)
    allInjections.push({ pos: inj.propInsertPos, text: ` ${inj.propName}={${escaped}}` })
  }

  for (const inj of apiDocInjections) {
    const doc = loadApiDoc(projectRoot, inj.componentKey)
    if (doc) {
      const serialized = JSON.stringify(doc)
      allInjections.push({ pos: inj.propInsertPos, text: ` apiDoc={${serialized}}` })
    }
  }

  allInjections.sort((a, b) => b.pos - a.pos)

  let result = code
  for (const inj of allInjections) {
    result = result.slice(0, inj.pos) + inj.text + result.slice(inj.pos)
  }

  return result
}

export async function demoSourcePlugin(projectRoot?: string): Promise<Plugin> {
  const highlighter = await createHighlighterCore({
    themes: [import('shiki/themes/one-light.mjs'), import('shiki/themes/one-dark-pro.mjs')],
    langs: [import('shiki/langs/tsx.mjs'), import('shiki/langs/bash.mjs')],
    engine: createJavaScriptRegexEngine(),
  })

  let resolvedRoot = ''

  return {
    name: 'rock-ui-demo-source',
    enforce: 'pre',

    configResolved(config) {
      resolvedRoot = projectRoot ?? path.resolve(config.root, '..')
    },

    resolveId(id) {
      if (id === VIRTUAL_DEMO_SOURCE) {
        return RESOLVED_VIRTUAL_DEMO_SOURCE
      }
      return null
    },

    load(id) {
      if (id !== RESOLVED_VIRTUAL_DEMO_SOURCE) {
        return null
      }
      const sourcePath = path.resolve(resolvedRoot, 'docs/components/source-code.tsx')
      return `export { SourceCode } from ${JSON.stringify(sourcePath)}`
    },

    transform: {
      order: 'pre',
      filter: {
        id: [DEMO_DOC_FILE_RE],
      },
      async handler(code, id) {
        return transformDemoSource(
          code,
          id,
          (source, lang) =>
            highlighter.codeToHtml(source, {
              lang,
              themes: { light: 'one-light', dark: 'one-dark-pro' },
            }),
          resolvedRoot,
        )
      },
    },
  }
}
