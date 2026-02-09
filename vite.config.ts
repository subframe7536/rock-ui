import path from 'node:path'
import uno from 'unocss/vite'
import solid from 'vite-plugin-solid'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  root: './playground',
  plugins: [uno({ inspector: false }), solid()],
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './src'),
    },
  },
})
