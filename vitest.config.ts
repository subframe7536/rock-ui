import solid from 'vite-plugin-solid'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  define: {
    'process.env.NODE_ENV': JSON.stringify('test'),
  },
  resolve: {
    dedupe: ['solid-js', '@solidjs/router'],
  },
  plugins: [solid({ hot: false })],
  test: {
    include: ['src/**/*.{test,spec}.?(c|m)[jt]s?(x)', 'docs/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
    environment: 'jsdom',
    globals: true,
    server: {
      deps: {
        inline: ['@solidjs/router'],
      },
    },
  },
})
