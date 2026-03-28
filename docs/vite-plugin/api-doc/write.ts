import { mkdirSync, rmSync } from 'node:fs'
import { writeFile } from 'node:fs/promises'
import path from 'node:path'

import type { GenerationResult } from './types'

export async function writeJsonFiles(outDir: string, result: GenerationResult): Promise<void> {
  const componentsDir = path.join(outDir, 'components')

  mkdirSync(outDir, { recursive: true })
  rmSync(componentsDir, { recursive: true, force: true })
  mkdirSync(componentsDir, { recursive: true })

  await writeFile(path.join(outDir, 'index.json'), JSON.stringify(result.indexDoc), 'utf8')
  await Promise.all(
    [...result.componentDocs.entries()].map(([key, doc]) =>
      writeFile(path.join(componentsDir, `${key}.json`), JSON.stringify(doc), 'utf8'),
    ),
  )

  console.log(`[api-doc] Generated ${result.componentDocs.size} component api docs to ${outDir}`)
}
