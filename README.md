# Moraine

Composable SolidJS component library with atomic class styling.

Inspired by Nuxt UI and shadcn, Moraine provides accessible building blocks, consistent slots and variants, and first-class UnoCSS / Tailwind workflows for Solid apps.

> [!important]
> **Status: pre-alpha.** Breaking changes are allowed before `v1.0.0`.

## Before You Start

Moraine relies on shadcn-style design tokens such as `--background`, `--primary`, and `--radius`.

Complete your style setup first, then start using components. The full setup reference lives in [`docs/pages/style-setup.md`](./docs/pages/style-setup.md).

## Installation

Install `moraine` in a Solid project. If your app does not already depend on `solid-js`, install it together.

```bash
bun add moraine solid-js
```

```bash
pnpm add moraine solid-js
```

```bash
npm install moraine solid-js
```

### Styling Engine Dependencies

Choose one styling path:

- `UnoCSS`: install `unocss`
- `Tailwind CSS v4`: install `tailwindcss`
- `Tailwind CSS v3`: install `tailwindcss`

```bash
bun add unocss
```

If your UnoCSS setup needs the parser dependencies used by Moraine's source transformers, install them too:

```bash
bun add -D oxc-parser oxc-walker
```

## Quick Start

After finishing the style setup, you can import components directly from `moraine`.

```tsx
import { Button, Input } from 'moraine'

function App() {
  return (
    <div class="flex flex-col gap-3">
      <Button>Save changes</Button>
      <Input placeholder="Enter text" />
    </div>
  )
}
```

## Styling

Moraine uses shadcn-style CSS variables. Reuse an existing token set or define your own `:root` / `.dark` variables before rendering components.

### UnoCSS

Use either `presetWind3` or `presetWind4`, then add `presetTheme` from `moraine/unocss`. Built-in component animations are already included.

```ts
// unocss.config.ts
import { defineConfig } from 'unocss'
import { presetWind3, presetWind4 } from 'unocss'
import { presetTheme } from 'moraine/unocss'

export default defineConfig({
  presets: [
    // presetWind3(),
    presetWind4(),
    presetTheme({
      enableComponentLayer: true,
    }),
    // ...other presets
  ],
})
```

`oxc-parser` and `oxc-walker` are only needed if your UnoCSS environment does not already provide them for Moraine's source transformers.

### Tailwind CSS v4

Add Moraine package files to `@source` so Tailwind can detect the utilities used by the library.

```css
@import 'tailwindcss';
@source "./node_modules/moraine/**/*";
```

### Tailwind CSS v3

Register Moraine in `content`, then include the three Tailwind directives.

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}', './node_modules/moraine/**/*'],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## Components

- Elements: Accordion, Avatar, Badge, Button, Card, Collapsible, Icon, Kbd, Progress, Resizable, Separator
- Forms: Checkbox, CheckboxGroup, FileUpload, Form, FormField, Input, InputNumber, RadioGroup, Select, Slider, Switch, Textarea
- Navigation: Breadcrumb, CommandPalette, Pagination, Stepper, Tabs
- Overlays: ContextMenu, Dialog, DropdownMenu, Popover, Popup, Sheet, Tooltip

## Customization

### Component Styles

Most components support `classes` and `styles`. Keys match slot names.

```tsx
import { Button } from 'moraine'

function MyButton() {
  return (
    <Button classes={{ label: 'bg-green-500' }} styles={{ root: { background: 'red' } }}>
      Click me
    </Button>
  )
}
```

### Built-in `cn`

Moraine exports `extendCN` so you can plug in a class merge utility such as `tailwind-merge`.

```ts
import { extendCN } from 'moraine'
import { twMerge } from 'tailwind-merge'

extendCN(twMerge)
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
