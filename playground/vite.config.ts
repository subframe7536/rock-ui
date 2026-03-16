import path from 'node:path'
import { fileURLToPath } from 'node:url'

import uno from 'unocss/vite'
import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'

import unocssConfig from './unocss.config'
import { componentMetaPlugin } from './vite-plugin-component-meta'
import { demoSourcePlugin } from './vite-plugin-demo-source'

const PLAYGROUND_ROOT = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  root: PLAYGROUND_ROOT,
  plugins: [
    componentMetaPlugin(),
    demoSourcePlugin(),
    uno({ ...unocssConfig, inspector: false }),
    solid(),
  ],
  resolve: {
    alias: {
      '~': path.resolve(PLAYGROUND_ROOT, '../src'),
    },
    dedupe: ['solid-js', '@solidjs/router'],
  },
})
