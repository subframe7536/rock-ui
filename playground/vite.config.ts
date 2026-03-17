import uno from 'unocss/vite'
import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'

import unocssConfig from './unocss.config'
import { demoSourcePlugin } from './vite-plugin-demo-source'

export default defineConfig({
  plugins: [demoSourcePlugin(), uno({ ...unocssConfig, inspector: false }), solid()],
  resolve: {
    dedupe: ['solid-js', '@solidjs/router'],
  },
})
