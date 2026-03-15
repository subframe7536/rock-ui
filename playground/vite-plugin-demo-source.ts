import { parseSync } from 'oxc-parser'
import { walk } from 'oxc-walker'
import type { Plugin } from 'vite'

/**
 * Vite plugin that auto-injects source code strings into `<DemoSection>` components.
 * For every `<DemoSection>` found in `*-demos.tsx` files, extracts the children source
 * and injects a `code={...}` prop so examples can show their source code.
 */
export function demoSourcePlugin(): Plugin {
  return {
    name: 'rock-ui-demo-source',
    enforce: 'pre',
    transform(code, id) {
      if (!id.endsWith('-demos.tsx') && !id.endsWith('-demos.jsx')) {
        return
      }
      if (id.includes('node_modules')) {
        return
      }

      const { program } = parseSync(id, code, { lang: 'tsx', sourceType: 'module' })

      // Collect all DemoSection JSX elements and their children spans
      const injections: { propInsertPos: number; childStart: number; childEnd: number }[] = []

      walk(program, {
        enter(node) {
          if (node.type !== 'JSXOpeningElement') {
            return
          }

          // Match <DemoSection ...>
          if (node.name.type !== 'JSXIdentifier' || node.name.name !== 'DemoSection') {
            return
          }

          // Skip if already has a `code` prop
          const hasCode = node.attributes.some(
            (attr) =>
              attr.type === 'JSXAttribute' &&
              attr.name.type === 'JSXIdentifier' &&
              attr.name.name === 'code',
          )
          if (hasCode) {
            return
          }

          // Find the parent JSXElement to get children range
          // The opening tag ends at node.end, the element's children start right after
          const openEnd = node.end
          // We need the position right before the closing `>` of the opening tag to inject the prop
          // For self-closing tags, skip (no children to extract)
          if (node.selfClosing) {
            return
          }

          // Find the insertion point: just before the `>` of the opening tag
          const propInsertPos = openEnd - 1

          injections.push({
            propInsertPos,
            childStart: openEnd,
            childEnd: -1, // will be filled in
          })
        },
      })

      if (injections.length === 0) {
        return
      }

      // Now find the closing tags to determine children ranges
      // Walk again to find JSXElement nodes to get children boundaries
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

          // Match this element to our injection by openingElement end position
          const openEnd = node.openingElement.end
          const injection = injections.find((inj) => inj.childStart === openEnd)
          if (injection && node.closingElement) {
            injection.childEnd = node.closingElement.start
          }
        },
      })

      // Build the transformed source, processing injections from end to start
      const validInjections = injections
        .filter((inj) => inj.childEnd > 0)
        .sort((a, b) => b.propInsertPos - a.propInsertPos)

      if (validInjections.length === 0) {
        return
      }

      let result = code
      for (const inj of validInjections) {
        const childrenSource = code
          .slice(inj.childStart, inj.childEnd)
          .trim()
          // Dedent: find minimum indentation and remove it
          .replace(/^\n+|\n+$/g, '')

        const lines = childrenSource.split('\n')
        const minIndent = lines
          .filter((l) => l.trim().length > 0)
          .reduce((min, l) => {
            const indent = l.match(/^(\s*)/)?.[1].length ?? 0
            return Math.min(min, indent)
          }, Number.POSITIVE_INFINITY)

        const dedented =
          minIndent === Number.POSITIVE_INFINITY
            ? childrenSource
            : lines.map((l) => l.slice(minIndent)).join('\n')

        const escaped = JSON.stringify(dedented)
        result =
          result.slice(0, inj.propInsertPos) +
          ` code={${escaped}}` +
          result.slice(inj.propInsertPos)
      }

      return { code: result, map: null }
    },
  }
}
