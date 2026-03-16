import { parseSync } from 'oxc-parser'
import { walk } from 'oxc-walker'
import { createHighlighterCore } from 'shiki/core'
import { createJavaScriptRegexEngine } from 'shiki/engine-javascript.mjs'
import type { Plugin } from 'vite'

interface Injection {
  propInsertPos: number
  childStart: number
  childEnd: number
}

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

async function transformDemoSource(
  code: string,
  id: string,
  toHTML: (src: string) => string,
): Promise<string | null> {
  const { program } = parseSync(id, code, { lang: 'tsx', sourceType: 'module' })

  const injections: Injection[] = []

  walk(program, {
    enter(node) {
      if (node.type !== 'JSXOpeningElement') {
        return
      }

      if (node.name.type !== 'JSXIdentifier' || node.name.name !== 'DemoSection') {
        return
      }

      const hasCode = node.attributes.some(
        (attr) =>
          attr.type === 'JSXAttribute' &&
          attr.name.type === 'JSXIdentifier' &&
          attr.name.name === 'code',
      )
      if (hasCode) {
        return
      }

      if (node.selfClosing) {
        return
      }

      injections.push({
        propInsertPos: node.end - 1,
        childStart: node.end,
        childEnd: -1,
      })
    },
  })

  if (injections.length === 0) {
    return null
  }

  walk(program, {
    enter(node) {
      if (node.type !== 'JSXElement') {
        return
      }
      if (
        node.openingElement.name.type !== 'JSXIdentifier' ||
        node.openingElement.name.name !== 'DemoSection'
      ) {
        return
      }
      if (node.openingElement.selfClosing) {
        return
      }

      const injection = injections.find((inj) => inj.childStart === node.openingElement.end)
      if (injection && node.closingElement) {
        injection.childEnd = node.closingElement.start
      }
    },
  })

  const validInjections = injections
    .filter((inj) => inj.childEnd > 0)
    .sort((a, b) => b.propInsertPos - a.propInsertPos)

  if (validInjections.length === 0) {
    return null
  }

  let result = code
  for (const inj of validInjections) {
    const childrenSource = dedentSource(
      code
        .slice(inj.childStart, inj.childEnd)
        .trim()
        .replace(/^\n+|\n+$/g, ''),
    )
    const html = toHTML(childrenSource)
    const escaped = JSON.stringify(html)
    result =
      result.slice(0, inj.propInsertPos) + ` code={${escaped}}` + result.slice(inj.propInsertPos)
  }

  return result
}

export async function demoSourcePlugin(): Promise<Plugin> {
  const highlighter = await createHighlighterCore({
    themes: [import('shiki/themes/one-light.mjs')],
    langs: [import('shiki/langs/tsx.mjs')],
    engine: createJavaScriptRegexEngine(),
  })
  return {
    name: 'rock-ui-demo-source',
    enforce: 'pre',
    transform: {
      order: 'pre',
      filter: {
        id: [/^(?!.*node_modules).*-demos\.tsx$/],
      },
      async handler(code, id) {
        return transformDemoSource(code, id, (s) =>
          highlighter.codeToHtml(s, { lang: 'tsx', theme: 'one-light' }),
        )
      },
    },
  }
}
