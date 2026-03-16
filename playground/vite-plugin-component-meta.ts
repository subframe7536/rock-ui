import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { basename, dirname, join, relative, resolve } from 'node:path'

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
import type { Logger, Plugin } from 'vite'

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

const DIR_CATEGORY: Record<string, string> = {
  elements: 'General',
  forms: 'Form',
  navigation: 'Navigation',
  overlays: 'Overlay',
}

const CATEGORY_ORDER = ['General', 'Navigation', 'Overlay', 'Form']

// ── Helpers ────────────────────────────────────────────────────────────

/** Resolve component-specific type aliases to their generic form for display */
function resolveDisplayType(typeText: string): string {
  const classesMatch = typeText.match(/^(\w+)Classes$/)
  if (classesMatch) {
    return `Classes<${classesMatch[1]}Slots, ClassValue>`
  }
  const stylesMatch = typeText.match(/^(\w+)Styles$/)
  if (stylesMatch) {
    return `Styles<${stylesMatch[1]}Slots, JSX.CSSProperties>`
  }
  return typeText
}

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

function parseFormOptions(filePath: string): Map<string, PropMeta[]> {
  const map = new Map<string, PropMeta[]>()
  if (!existsSync(filePath)) {
    return map
  }

  const source = readFileSync(filePath, 'utf-8') as string
  const { program, comments } = parseSync(filePath, source, {
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

      if (node.type === 'TSInterfaceDeclaration') {
        const iface = node as TSInterfaceDeclaration
        if (!iface.id.name.endsWith('BaseProps')) {
          return
        }

        if (iface.extends) {
          for (const ext of iface.extends) {
            if (ext.expression.type === 'Identifier') {
              const extName = ext.expression.name
              extendsInterfaces.push(extName)

              if (formOptions.has(extName)) {
                const inherited = formOptions.get(extName)!
                props.push(...inherited)
              }
            }
          }
        }

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

      if (node.type === 'ExportNamedDeclaration') {
        const exp = node as ExportNamedDeclaration
        if (exp.declaration?.type === 'FunctionDeclaration') {
          description = findJSDoc(comments, exp.start)
        }
      }

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

// ── Discovery ─────────────────────────────────────────────────────────

function discoverComponents(srcDir: string) {
  const components: { tsxPath: string; classPath?: string; key: string; relDir: string }[] = []

  for (const category of ['elements', 'forms', 'navigation', 'overlays']) {
    const dir = join(srcDir, category)
    if (!existsSync(dir)) {
      continue
    }

    const files = readdirSync(dir, { recursive: true, encoding: 'utf-8' }) as string[]

    for (const match of files) {
      const normalized = match.replace(/\\/g, '/')
      if (!normalized.endsWith('.tsx')) {
        continue
      }
      if (normalized.endsWith('.test.tsx')) {
        continue
      }
      if (normalized.includes('shared-overlay-menu')) {
        continue
      }

      const fullPath = join(dir, match)
      const relDir = `${category}/${dirname(normalized)}`
      const key = basename(dirname(normalized))
      const classPath = fullPath.replace(/\.tsx$/, '.class.ts')

      const fileName = basename(normalized, '.tsx')
      if (fileName !== key) {
        continue
      }

      components.push({
        tsxPath: fullPath,
        classPath: existsSync(classPath) ? classPath : undefined,
        key,
        relDir,
      })
    }
  }

  return components
}

// ── Extraction ────────────────────────────────────────────────────────

function extractAll(srcDir: string, outDir: string): RegistryEntry[] {
  mkdirSync(outDir, { recursive: true })

  const formOptionsFile = join(srcDir, 'forms/form-field/form-options.ts')
  const formOptions = parseFormOptions(formOptionsFile)
  const discovered = discoverComponents(srcDir)
  const registry: RegistryEntry[] = []

  for (const comp of discovered) {
    const parentDir = comp.relDir.split('/')[0]
    const category = DIR_CATEGORY[parentDir]
    if (!category) {
      continue
    }

    const name = kebabToPascal(comp.key)
    const variants = comp.classPath ? extractVariants(comp.classPath) : []
    const { props, slots, description, polymorphic, extendsInterfaces } = parseTsx(
      comp.tsxPath,
      formOptions,
    )

    const variantExtends = extendsInterfaces.filter((e) => e.endsWith('VariantProps'))
    if (variantExtends.length > 0 && variants.length > 0) {
      for (const v of variants) {
        if (['hasLeading', 'hasTrailing', 'type'].includes(v.name)) {
          continue
        }

        const typeStr = v.options.map((o) => `'${o}'`).join(' | ')
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

    // Resolve display types for classes/styles props
    for (const prop of props) {
      prop.type = resolveDisplayType(prop.type)
    }

    const meta: ComponentMeta = {
      name,
      key: comp.key,
      sourcePath: relative(srcDir, comp.tsxPath).replaceAll('\\', '/'),
      category,
      description,
      props,
      variants,
      slots,
      polymorphic,
    }

    writeFileSync(join(outDir, `${comp.key}.json`), JSON.stringify(meta, null, 2))
    registry.push({ key: comp.key, name, category })
  }

  registry.sort((a, b) => {
    const ai = CATEGORY_ORDER.indexOf(a.category)
    const bi = CATEGORY_ORDER.indexOf(b.category)
    if (ai !== bi) {
      return ai - bi
    }
    return a.name.localeCompare(b.name)
  })

  writeFileSync(join(outDir, 'index.json'), JSON.stringify(registry, null, 2))
  return registry
}

// ── Plugin ────────────────────────────────────────────────────────────

export function componentMetaPlugin(): Plugin {
  let srcDir: string
  let outDir: string
  let logger: Logger

  return {
    name: 'rock-ui-component-meta',
    configResolved(config) {
      const projectRoot = resolve(config.root, '..')
      srcDir = join(projectRoot, 'src')
      outDir = join(config.root, '.meta')
      logger = config.logger
    },
    buildStart() {
      const registry = extractAll(srcDir, outDir)
      const grouped = Map.groupBy(registry, (e) => e.category)
      const lines = [`extracted metadata for ${registry.length} components`]
      for (const [category, entries] of grouped) {
        lines.push(`  ${category.padEnd(12)} ${entries.map((e) => e.name).join(', ')}`)
      }
      logger.info(lines.join('\n'), { timestamp: true })
    },
    configureServer(server) {
      server.watcher.add(srcDir)

      let timer: ReturnType<typeof setTimeout> | null = null
      server.watcher.on('change', (changed) => {
        const norm = changed.replace(/\\/g, '/')
        const srcNorm = srcDir.replace(/\\/g, '/')
        if (!norm.startsWith(srcNorm)) {
          return
        }
        if (!norm.endsWith('.ts') && !norm.endsWith('.tsx')) {
          return
        }
        if (norm.endsWith('.test.tsx') || norm.endsWith('.test.ts')) {
          return
        }

        if (timer) {
          clearTimeout(timer)
        }
        timer = setTimeout(() => {
          const registry = extractAll(srcDir, outDir)
          logger.info(`re-extracted metadata for ${registry.length} components`, {
            timestamp: true,
          })
          timer = null
        }, 200)
      })
    },
  }
}
