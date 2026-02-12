import solid from 'vite-plugin-solid'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  define: {
    'process.env.NODE_ENV': JSON.stringify('test'),
  },
  plugins: [solid({ hot: false })],
  test: {
    include: ['src/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
    environment: 'jsdom',
    globals: true,
    setupFiles: ['node_modules/@testing-library/jest-dom/vitest'],
    server: {
      deps: {
        inline: ['@solidjs/testing-library', 'solid-js', '@solidjs/router'],
      },
    },
  },
})
