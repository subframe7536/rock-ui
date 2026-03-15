import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { basename, dirname, join, relative, resolve } from 'node:path'

import { Glob } from 'bun'
import { parseSync } from 'oxc-parser'
import type {
  Comment,
  ExportNamedDeclaration,
  ObjectExpression,
  ObjectProperty,
  TSInterfaceDeclaration,
  TSTypeAliasDeclaration,
} from 'oxc-parser'
import { walk } from 'oxc-walker'

// ── Types ──────────────────────────────────────────────────────────────

interface PropMeta {
  name: string
  type: string
  optional: boolean
  description: string
  default?: string
  inherited: boolean
  inheritedFrom?: string
}

interface VariantMeta {
  name: string
  options: string[]
  default?: string
}

interface ComponentMeta {
  name: string
  key: string
  sourcePath: string
  category: string
  description: string
  props: PropMeta[]
  variants: VariantMeta[]
  slots: string[]
  polymorphic: boolean
}

interface RegistryEntry {
  key: string
  name: string
  category: string
}

// ── Constants ──────────────────────────────────────────────────────────

const ROOT = resolve(import.meta.dir, '..')
const SRC = join(ROOT, 'src')
const OUT_DIR = join(ROOT, 'playground', '.meta')

const DIR_CATEGORY: Record<string, string> = {
  elements: 'General',
  forms: 'Form',
  navigation: 'Navigation',
  overlays: 'Overlay',
}

// Shared option interfaces from form-options.ts to inline as inherited props
const FORM_OPTIONS_FILE = join(SRC, 'forms/form-field/form-options.ts')

// ── Helpers ────────────────────────────────────────────────────────────

function kebabToPascal(str: string): string {
  return str
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('')
}

function getPropertyName(key: ObjectProperty['key']): string | undefined {
  if (key.type === 'Identifier') {
    return key.name
  }
  if (key.type === 'Literal' && typeof key.value === 'string') {
    return key.value
  }
  return undefined
}

function getObjectProperty(obj: ObjectExpression, name: string): ObjectProperty | undefined {
  return obj.properties.find(
    (p): p is ObjectProperty => p.type === 'Property' && getPropertyName(p.key) === name,
  )
}

/** Find the closest preceding block comment (JSDoc) for a given AST position */
function findJSDoc(comments: Comment[], position: number): string {
  let best: Comment | undefined
  for (const c of comments) {
    if (c.type !== 'Block') {
      continue
    }
    if (c.end > position) {
      break
    }
    best = c
  }
  if (!best || position - best.end > 20) {
    return ''
  }
  return parseJSDocBody(best.value)
}

function parseJSDocBody(raw: string): string {
  return raw
    .replace(/^\*+/, '')
    .split('\n')
    .map((line) => line.replace(/^\s*\*\s?/, '').trim())
    .filter((line) => !line.startsWith('@'))
    .join(' ')
    .trim()
}

function parseJSDocDefault(raw: string): string | undefined {
  const match = raw.match(/@default\s+(.+)/)
  return match ? match[1].trim().replace(/^['"]|['"]$/g, '') : undefined
}

function findJSDocRaw(comments: Comment[], position: number): string {
  let best: Comment | undefined
  for (const c of comments) {
    if (c.type !== 'Block') {
      continue
    }
    if (c.end > position) {
      break
    }
    best = c
  }
  if (!best || position - best.end > 20) {
    return ''
  }
  return best.value
}

// ── Variant Extraction (.class.ts) ────────────────────────────────────

function extractVariants(filePath: string): VariantMeta[] {
  const source = readFileSync(filePath, 'utf-8') as string
  if (!source) {
    return []
  }

  const { program } = parseSync(filePath, source, { lang: 'ts', sourceType: 'module' })
  const variants: VariantMeta[] = []

  walk(program, {
    enter(node) {
      if (node.type !== 'CallExpression') {
        return
      }
      const callee = node.callee
      if (callee.type !== 'Identifier' || callee.name !== 'cva') {
        return
      }

      const config = node.arguments[1]
      if (!config || config.type !== 'ObjectExpression') {
        return
      }

      const variantsProp = getObjectProperty(config, 'variants')
      const defaultsProp = getObjectProperty(config, 'defaultVariants')

      const defaults: Record<string, string> = {}
      if (defaultsProp?.value.type === 'ObjectExpression') {
        for (const dp of defaultsProp.value.properties) {
          if (dp.type !== 'Property') {
            continue
          }
          const name = getPropertyName(dp.key)
          if (!name) {
            continue
          }
          if (dp.value.type === 'Literal' && typeof dp.value.value === 'string') {
            defaults[name] = dp.value.value
          }
        }
      }

      if (variantsProp?.value.type !== 'ObjectExpression') {
        return
      }

      for (const vp of variantsProp.value.properties) {
        if (vp.type !== 'Property') {
          continue
        }
        const variantName = getPropertyName(vp.key)
        if (!variantName) {
          continue
        }
        const options: string[] = []
        if (vp.value.type === 'ObjectExpression') {
          for (const op of vp.value.properties) {
            if (op.type !== 'Property') {
              continue
            }
            const optName = getPropertyName(op.key)
            if (optName) {
              options.push(optName)
            }
          }
        }
        variants.push({
          name: variantName,
          options,
          default: defaults[variantName],
        })
      }
    },
  })

  return variants
}

// ── Shared Form Options Parsing ───────────────────────────────────────

function parseFormOptions(): Map<string, PropMeta[]> {
  const map = new Map<string, PropMeta[]>()
  const source = readFileSync(FORM_OPTIONS_FILE, 'utf-8') as string
  const { program, comments } = parseSync(FORM_OPTIONS_FILE, source, {
    lang: 'ts',
    sourceType: 'module',
  })

  walk(program, {
    enter(node) {
      if (node.type !== 'TSInterfaceDeclaration') {
        return
      }
      const iface = node as TSInterfaceDeclaration
      const name = iface.id.name
      const props: PropMeta[] = []

      for (const member of iface.body.body) {
        if (member.type !== 'TSPropertySignature' || member.key.type !== 'Identifier') {
          continue
        }
        const propName = member.key.name
        const typeText = member.typeAnnotation?.typeAnnotation
          ? source.slice(
              member.typeAnnotation.typeAnnotation.start,
              member.typeAnnotation.typeAnnotation.end,
            )
          : 'unknown'
        const raw = findJSDocRaw(comments, member.start)
        props.push({
          name: propName,
          type: typeText,
          optional: Boolean(member.optional),
          description: parseJSDocBody(raw),
          default: parseJSDocDefault(raw),
          inherited: true,
          inheritedFrom: name,
        })
      }

      map.set(name, props)
    },
  })

  return map
}

// ── Component TSX Parsing ─────────────────────────────────────────────

interface TsxParseResult {
  props: PropMeta[]
  slots: string[]
  description: string
  polymorphic: boolean
  extendsInterfaces: string[]
}

function parseTsx(filePath: string, formOptions: Map<string, PropMeta[]>): TsxParseResult {
  const source = readFileSync(filePath, 'utf-8') as string
  const { program, comments } = parseSync(filePath, source, {
    lang: 'tsx',
    sourceType: 'module',
  })

  const props: PropMeta[] = []
  const slots: string[] = []
  let description = ''
  let polymorphic = false
  const extendsInterfaces: string[] = []

  walk(program, {
    enter(node) {
      // Extract slots from type alias: type *Slots = 'a' | 'b' | ...
      if (node.type === 'TSTypeAliasDeclaration') {
        const alias = node as TSTypeAliasDeclaration
        if (alias.id.name.endsWith('Slots') && alias.typeAnnotation.type === 'TSUnionType') {
          for (const member of alias.typeAnnotation.types) {
            if (
              member.type === 'TSLiteralType' &&
              member.literal.type === 'Literal' &&
              typeof member.literal.value === 'string'
            ) {
              slots.push(member.literal.value)
            }
          }
        }
      }

      // Extract props from *BaseProps interface
      if (node.type === 'TSInterfaceDeclaration') {
        const iface = node as TSInterfaceDeclaration
        if (!iface.id.name.endsWith('BaseProps')) {
          return
        }

        // Check extends
        if (iface.extends) {
          for (const ext of iface.extends) {
            if (ext.expression.type === 'Identifier') {
              const extName = ext.expression.name
              extendsInterfaces.push(extName)

              // Check for VariantProps - mark as having variants
              if (extName.endsWith('VariantProps')) {
                // Variants are handled separately
              }

              // Inline form options
              if (formOptions.has(extName)) {
                const inherited = formOptions.get(extName)!
                props.push(...inherited)
              }
            }
          }
        }

        // Extract own properties
        for (const member of iface.body.body) {
          if (member.type !== 'TSPropertySignature') {
            continue
          }
          let propName: string
          if (member.key.type === 'Identifier') {
            propName = member.key.name
          } else if (member.key.type === 'Literal' && typeof member.key.value === 'string') {
            propName = member.key.value
          } else {
            continue
          }

          const typeText = member.typeAnnotation?.typeAnnotation
            ? source.slice(
                member.typeAnnotation.typeAnnotation.start,
                member.typeAnnotation.typeAnnotation.end,
              )
            : 'unknown'
          const raw = findJSDocRaw(comments, member.start)

          props.push({
            name: propName,
            type: typeText,
            optional: Boolean(member.optional),
            description: parseJSDocBody(raw),
            default: parseJSDocDefault(raw),
            inherited: false,
          })
        }
      }

      // Extract component-level JSDoc from exported function
      if (node.type === 'ExportNamedDeclaration') {
        const exp = node as ExportNamedDeclaration
        if (exp.declaration?.type === 'FunctionDeclaration') {
          description = findJSDoc(comments, exp.start)
        }
      }

      // Check for polymorphic pattern
      if (node.type === 'TSTypeReference' && 'typeName' in node) {
        const ref = node as any
        if (ref.typeName?.type === 'Identifier' && ref.typeName.name === 'PolymorphicProps') {
          polymorphic = true
        }
      }
    },
  })

  return { props, slots, description, polymorphic, extendsInterfaces }
}

// ── Discovery & Main ──────────────────────────────────────────────────

function discoverComponents(): {
  tsxPath: string
  classPath?: string
  key: string
  relDir: string
}[] {
  const glob = new Glob('**/*.tsx')
  const components: { tsxPath: string; classPath?: string; key: string; relDir: string }[] = []

  for (const category of ['elements', 'forms', 'navigation', 'overlays']) {
    const dir = join(SRC, category)
    for (const match of glob.scanSync(dir)) {
      if (match.endsWith('.test.tsx')) {
        continue
      }
      // Skip internal shared files
      if (match.includes('shared-overlay-menu')) {
        continue
      }

      const fullPath = join(dir, match)
      const relDir = `${category}/${dirname(match)}`
      const key = basename(dirname(match)) // e.g. "button"
      const classPath = fullPath.replace(/\.tsx$/, '.class.ts')

      // Only include main component file (same name as directory)
      const fileName = basename(match, '.tsx')
      if (fileName !== key) {
        continue
      }

      const classExists = existsSync(classPath)

      components.push({
        tsxPath: fullPath,
        classPath: classExists ? classPath : undefined,
        key,
        relDir,
      })
    }
  }

  return components
}

function main() {
  mkdirSync(OUT_DIR, { recursive: true })

  const formOptions = parseFormOptions()
  const discovered = discoverComponents()
  const registry: RegistryEntry[] = []

  for (const comp of discovered) {
    const parentDir = comp.relDir.split('/')[0]
    const category = DIR_CATEGORY[parentDir]
    if (!category) {
      console.warn(`Skipping ${comp.relDir} (no category for dir '${parentDir}')`)
      continue
    }

    const name = kebabToPascal(comp.key)
    const variants = comp.classPath ? extractVariants(comp.classPath) : []
    const { props, slots, description, polymorphic, extendsInterfaces } = parseTsx(
      comp.tsxPath,
      formOptions,
    )

    // Synthesize variant props from .class.ts into the props list
    const variantExtends = extendsInterfaces.filter((e) => e.endsWith('VariantProps'))
    if (variantExtends.length > 0 && variants.length > 0) {
      // Find primary variant set (first cva call with the most variants)
      for (const v of variants) {
        // Skip non-user-facing variants (hasLeading, hasTrailing, etc.)
        if (['hasLeading', 'hasTrailing', 'type'].includes(v.name)) {
          continue
        }

        const typeStr = v.options.map((o) => `'${o}'`).join(' | ')
        // Only add if not already present from interface props
        if (!props.some((p) => p.name === v.name)) {
          props.push({
            name: v.name,
            type: typeStr,
            optional: true,
            description: `Visual ${v.name} of the component.`,
            default: v.default,
            inherited: false,
          })
        }
      }
    }

    const meta: ComponentMeta = {
      name,
      key: comp.key,
      sourcePath: relative(SRC, comp.tsxPath),
      category,
      description,
      props,
      variants,
      slots,
      polymorphic,
    }

    writeFileSync(join(OUT_DIR, `${comp.key}.json`), JSON.stringify(meta, null, 2))
    registry.push({ key: comp.key, name, category })
  }

  // Sort registry by category order then name
  const categoryOrder = ['General', 'Navigation', 'Overlay', 'Form']
  registry.sort((a, b) => {
    const ai = categoryOrder.indexOf(a.category)
    const bi = categoryOrder.indexOf(b.category)
    if (ai !== bi) {
      return ai - bi
    }
    return a.name.localeCompare(b.name)
  })

  writeFileSync(join(OUT_DIR, 'index.json'), JSON.stringify(registry, null, 2))

  console.log(`Extracted metadata for ${registry.length} components to ${OUT_DIR}`)
  for (const entry of registry) {
    console.log(`  ${entry.category.padEnd(12)} ${entry.name}`)
  }
}

main()
