# Moraine

Inspired by Nuxt UI and shadcn, Moraine is a comprehensive SolidJS component library with atomic class styling.

> [!important]
> **Status: pre-alpha.** Breaking changes are allowed before `v1.0.0`.

## Documention

Full guide and examples: https://ui.subf.dev

## Quick Start

1. Install `moraine` in a Solid project

```bash
bun add moraine solid-js unocss
```

2. Setup Styles

UnoCSS as example here. TailwindCSS is experimentally supported.

```ts
// unocss.config.ts
import { defineConfig, presetWind4 } from 'unocss'
import { presetMoraine } from 'moraine/unocss'

export default defineConfig({
  presets: [presetWind4(), presetMoraine()],
})
```

3. Now you can import components directly from `moraine`.

```tsx
import { Button, Input } from 'moraine'

function App() {
  return (
    <div class="flex flex-col gap-3">
      <Input placeholder="Enter text" />
      <Button variant="outline">Save changes</Button>
    </div>
  )
}
```

## Development

```bash
# Install dependencies
bun install

# Start development build
bun run dev

# Run tests
bun run test

# Start docs development server
bun run docs

# Run linting and type checking
bun run qa
```

## License

MIT

## Credits

- [Kobalte](https://kobalte.dev) - Accessible UI primitives
- [Nuxt UI](https://ui.nuxt.com) - Design inspiration
- [Shadcn/ui](https://ui.shadcn.com) - Component patterns
- [Zaidan](https://github.com/carere/zaidan) - Shadcn-like implementation inspiration
