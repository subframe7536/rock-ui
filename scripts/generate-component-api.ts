import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import ts from 'typescript'

type SchemaVersion = '1'

interface PackageInfo {
  name: string
  version: string
}

interface IndexDoc {
  schemaVersion: SchemaVersion
  generatedAt: string
  source: { dtsPath: string }
  package: PackageInfo
  components: ComponentIndexEntry[]
}

interface ComponentIndexEntry {
  key: string
  name: string
  category: string
  description?: string
  sourcePath?: string
  polymorphic: boolean
}

interface PropDoc {
  name: string
  required: boolean
  typeText: string
  defaultValue?: string
  description?: string
}

interface InheritedGroupDoc {
  from: string
  props: PropDoc[]
}

interface ComponentDoc {
  schemaVersion: SchemaVersion
  generatedAt: string
  source: { dtsPath: string }
  package: PackageInfo
  component: ComponentIndexEntry
  props: {
    own: PropDoc[]
    inherited: InheritedGroupDoc[]
  }
}

function toKebabCase(name: string): string {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase()
}

function categoryFromSourcePath(sourcePath: string | undefined): string {
  if (!sourcePath) {
    return 'General'
  }
  if (sourcePath.startsWith('src/elements/form/')) {
    return 'Form'
  }
  if (sourcePath.startsWith('src/elements/navigation/')) {
    return 'Navigation'
  }
  if (sourcePath.startsWith('src/elements/overlay/')) {
    return 'Overlay'
  }
  return 'General'
}

function displayText(parts: readonly ts.SymbolDisplayPart[] | string | undefined): string {
  if (!parts) {
    return ''
  }
  if (typeof parts === 'string') {
    return parts
  }
  return ts.displayPartsToString([...parts])
}

function normalizeDefaultTag(tagText: ts.JSDocTagInfo['text']): string | undefined {
  const text = displayText(tagText).trim()
  return text ? text.replace(/^['"]|['"]$/g, '') : undefined
}

function typeIncludesUndefined(type: ts.Type): boolean {
  if ((type.flags & ts.TypeFlags.Undefined) !== 0) {
    return true
  }
  if (type.isUnion()) {
    return type.types.some((t) => typeIncludesUndefined(t))
  }
  return false
}

function inferModuleFromFileName(fileName: string): string {
  const normalized = fileName.replaceAll('\\', '/')
  const idx = normalized.lastIndexOf('/node_modules/')
  if (idx === -1) {
    return 'Rock UI'
  }

  const rest = normalized.slice(idx + '/node_modules/'.length)
  const parts = rest.split('/').filter(Boolean)
  const pkg =
    parts[0]?.startsWith('@') && parts[1] ? `${parts[0]}/${parts[1]}` : (parts[0] ?? 'unknown')

  if (pkg === '@kobalte/core') {
    const known = [
      'accordion',
      'button',
      'collapsible',
      'progress',
      'separator',
      'checkbox',
      'file-field',
      'number-field',
      'radio-group',
      'combobox',
      'slider',
      'switch',
      'tabs',
      'dropdown-menu',
      'dialog',
      'popover',
      'tooltip',
      'polymorphic',
    ]
    const hit = known.find((k) => parts.includes(k))
    return hit ? `${pkg}/${hit}` : pkg
  }

  return pkg
}

async function exists(filePath: string): Promise<boolean> {
  try {
    await readFile(filePath)
    return true
  } catch {
    return false
  }
}

async function resolveSourcePath(regionPath: string | undefined): Promise<string | undefined> {
  if (!regionPath) {
    return undefined
  }
  if (!regionPath.startsWith('src/')) {
    return regionPath
  }
  if (!regionPath.endsWith('.d.ts')) {
    return regionPath
  }

  const base = regionPath.slice(0, -'.d.ts'.length)
  const tsx = `${base}.tsx`
  if (await exists(tsx)) {
    return tsx
  }
  const tsFile = `${base}.ts`
  if (await exists(tsFile)) {
    return tsFile
  }
  return regionPath
}

function buildRegionByLine(text: string): Array<string | undefined> {
  const lines = text.split(/\r?\n/g)
  const regionByLine: Array<string | undefined> = new Array(lines.length)
  let current: string | undefined

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? ''
    if (line.startsWith('//#region ')) {
      current = line.slice('//#region '.length).trim()
    } else if (line.startsWith('//#endregion')) {
      current = undefined
    }
    regionByLine[i] = current
  }

  return regionByLine
}

function isJsxElementReturn(typeNode: ts.TypeNode | undefined, sourceFile: ts.SourceFile): boolean {
  if (!typeNode) {
    return false
  }
  const text = typeNode.getText(sourceFile).replaceAll(' ', '')
  return text === 'JSX.Element' || text.endsWith('.JSX.Element')
}

async function main(): Promise<void> {
  const projectRoot = process.cwd()
  const dtsRelPath = 'dist/index.d.mts'
  const dtsPath = path.join(projectRoot, dtsRelPath)

  try {
    await readFile(dtsPath)
  } catch {
    console.error(`[gen:api] 找不到 ${dtsRelPath}，请先运行: bun run build`)
    process.exitCode = 1
    return
  }

  const pkgRaw = await readFile(path.join(projectRoot, 'package.json'), 'utf8')
  const pkgJson = JSON.parse(pkgRaw) as { name?: string; version?: string }
  const pkg: PackageInfo = { name: pkgJson.name ?? 'rock-ui', version: pkgJson.version ?? '0.0.0' }

  const options: ts.CompilerOptions = {
    target: ts.ScriptTarget.ESNext,
    module: ts.ModuleKind.NodeNext,
    moduleResolution: ts.ModuleResolutionKind.NodeNext,
    skipLibCheck: true,
    noEmit: true,
    types: [],
  }

  const host = ts.createCompilerHost(options, true)
  const program = ts.createProgram([dtsPath], options, host)
  const checker = program.getTypeChecker()
  const sourceFile = program.getSourceFile(dtsPath)

  if (!sourceFile) {
    console.error(`[gen:api] 无法读取 TypeScript SourceFile: ${dtsRelPath}`)
    process.exitCode = 1
    return
  }

  const regionByLine = buildRegionByLine(sourceFile.getFullText())
  const generatedAt = new Date().toISOString()

  const pendingSourcePathResolves: Array<Promise<void>> = []

  const components: Array<{
    name: string
    key: string
    description?: string
    sourcePath?: string
    polymorphic: boolean
    props: { own: PropDoc[]; inherited: InheritedGroupDoc[] }
  }> = []

  const visit = (node: ts.Node) => {
    if (ts.isFunctionDeclaration(node) && node.name && node.parameters.length > 0) {
      if (!isJsxElementReturn(node.type, sourceFile)) {
        ts.forEachChild(node, visit)
        return
      }

      const param = node.parameters[0]
      if (!param.type) {
        ts.forEachChild(node, visit)
        return
      }

      const componentName = node.name.text
      const componentKey = toKebabCase(componentName)

      const line = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line
      const regionPath = regionByLine[line]

      const fnSymbol = checker.getSymbolAtLocation(node.name)
      const componentDescription = fnSymbol
        ? displayText(fnSymbol.getDocumentationComment(checker)).trim() || undefined
        : undefined

      const resolvedSourcePathPromise = resolveSourcePath(regionPath)
      const propsType = checker.getTypeFromTypeNode(param.type)
      const hasAsProp = Boolean(propsType.getProperty('as'))

      const ownProps: PropDoc[] = []
      const inheritedGroups = new Map<string, PropDoc[]>()

      const propsParamLocation = param.name

      for (const propSymbol of checker.getPropertiesOfType(propsType)) {
        const propName = propSymbol.getName()
        const propType = checker.getTypeOfSymbolAtLocation(propSymbol, propsParamLocation)
        const typeText = checker.typeToString(
          propType,
          propsParamLocation,
          ts.TypeFormatFlags.NoTruncation,
        )

        const optionalFlag = (propSymbol.flags & ts.SymbolFlags.Optional) !== 0
        const required = !(optionalFlag || typeIncludesUndefined(propType))

        const description =
          displayText(propSymbol.getDocumentationComment(checker)).trim() || undefined
        const jsDocTags = propSymbol.getJsDocTags()
        const defaultTag = jsDocTags.find((t) => t.name === 'default')
        const defaultValue = defaultTag ? normalizeDefaultTag(defaultTag.text) : undefined

        const doc: PropDoc = {
          name: propName,
          required,
          typeText,
          ...(defaultValue ? { defaultValue } : {}),
          ...(description ? { description } : {}),
        }

        const decl = propSymbol.declarations?.[0]
        const isOwn = decl?.getSourceFile().fileName === sourceFile.fileName

        if (isOwn) {
          ownProps.push(doc)
        } else {
          const from = decl ? inferModuleFromFileName(decl.getSourceFile().fileName) : 'External'
          const list = inheritedGroups.get(from) ?? []
          list.push(doc)
          inheritedGroups.set(from, list)
        }
      }

      ownProps.sort((a, b) => a.name.localeCompare(b.name))
      const inherited: InheritedGroupDoc[] = [...inheritedGroups.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([from, props]) => ({
          from,
          props: props.sort((a, b) => a.name.localeCompare(b.name)),
        }))

      components.push({
        name: componentName,
        key: componentKey,
        description: componentDescription,
        sourcePath: undefined,
        polymorphic: hasAsProp,
        props: { own: ownProps, inherited },
        // sourcePath filled after resolve promise
      })

      pendingSourcePathResolves.push(
        resolvedSourcePathPromise.then((resolved) => {
          const target = components.find((c) => c.key === componentKey)
          if (target) {
            target.sourcePath = resolved
          }
        }),
      )
    }

    ts.forEachChild(node, visit)
  }

  visit(sourceFile)

  await Promise.all(pendingSourcePathResolves)

  // De-dupe by key (in case of accidental duplicates)
  const byKey = new Map<string, (typeof components)[number]>()
  for (const c of components) {
    byKey.set(c.key, c)
  }

  const finalComponents = [...byKey.values()].sort((a, b) => a.key.localeCompare(b.key))

  const indexDoc: IndexDoc = {
    schemaVersion: '1',
    generatedAt,
    source: { dtsPath: dtsRelPath },
    package: pkg,
    components: finalComponents.map((c) => {
      const sourcePath = c.sourcePath
      const category = categoryFromSourcePath(sourcePath)
      return {
        key: c.key,
        name: c.name,
        category,
        ...(c.description ? { description: c.description } : {}),
        ...(sourcePath ? { sourcePath } : {}),
        polymorphic: c.polymorphic,
      }
    }),
  }

  const outDir = path.join(projectRoot, 'playground/public/component-api')
  const componentsDir = path.join(outDir, 'components')

  await mkdir(outDir, { recursive: true })
  await rm(componentsDir, { recursive: true, force: true })
  await mkdir(componentsDir, { recursive: true })

  await writeFile(path.join(outDir, 'index.json'), `${JSON.stringify(indexDoc, null, 2)}\n`, 'utf8')

  for (const c of finalComponents) {
    const sourcePath = c.sourcePath
    const category = categoryFromSourcePath(sourcePath)

    const componentEntry: ComponentIndexEntry = {
      key: c.key,
      name: c.name,
      category,
      ...(c.description ? { description: c.description } : {}),
      ...(sourcePath ? { sourcePath } : {}),
      polymorphic: c.polymorphic,
    }

    const doc: ComponentDoc = {
      schemaVersion: '1',
      generatedAt,
      source: { dtsPath: dtsRelPath },
      package: pkg,
      component: componentEntry,
      props: c.props,
    }

    await writeFile(
      path.join(componentsDir, `${c.key}.json`),
      `${JSON.stringify(doc, null, 2)}\n`,
      'utf8',
    )
  }

  console.log(
    `[gen:api] 已生成 ${finalComponents.length} 个组件文档到 playground/public/component-api/`,
  )
}

await main()
