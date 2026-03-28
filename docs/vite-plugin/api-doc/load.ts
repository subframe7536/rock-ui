import { readFileSync } from 'node:fs'
import path from 'node:path'

import type { ComponentDoc, IndexDoc } from './types'

export function loadApiDocIndex(projectRoot: string): IndexDoc | null {
  try {
    const jsonPath = path.join(projectRoot, 'docs/api-doc/index.json')
    return JSON.parse(readFileSync(jsonPath, 'utf8')) as IndexDoc
  } catch {
    return null
  }
}

export function loadComponentApiDoc(projectRoot: string, key: string): ComponentDoc | null {
  try {
    const jsonPath = path.join(projectRoot, 'docs/api-doc/components', `${key}.json`)
    return JSON.parse(readFileSync(jsonPath, 'utf8')) as ComponentDoc
  } catch {
    return null
  }
}
