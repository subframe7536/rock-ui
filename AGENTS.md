# AGENTS.md

This file contains guidelines for agentic coding agents working on Rock UI (@subf/base-ui), a SolidJS component library based on Kobalte.

## Essential Commands

### Build & Development
- `bun run build` - Build the library using tsdown (outputs to dist/)
- `bun run dev` - Build in watch mode for development
- `bun run play` - Start the Vite playground server on port 3000
- `bun run typecheck` - Run TypeScript type checking

### Linting & Formatting
- `bun run lint` - Run oxlint (fast linter based on oxc)
- `bun run format` - Format code using oxfmt
- `bun run qa` - Run format, lint (with --fix), and typecheck together

### Testing
- `bun run test` - Run all tests using Vitest
- `bun run test --run` - Run tests once (no watch mode)
- `bun run test <test-file>` - Run a single test file (e.g., `bun run test button.test.tsx`)

## Code Style Guidelines

### Import Order & Style
Imports must be sorted alphabetically and grouped by type. Use consistent type specifiers style (inline type imports).
```tsx
import { render } from 'solid-js/web'
import type { Component } from 'solid-js'
import { something } from 'external-package'
import { localHelper } from './utils'
import type { LocalType } from './types'
```

### Formatting Rules (oxfmt)
- **No semicolons** - Use ASI (Automatic Semicolon Insertion)
- **Single quotes only** - Never use double quotes unless required for escaping
- **Imports sorted alphabetically** - Handled automatically by oxfmt

### TypeScript Rules
- **Strict mode enabled** - All type safety features active
- **Consistent type definitions** - Use `type` for object types, not `interface`
- **Consistent type imports** - Use inline type imports: `import type { X } from '...')` not `import { type X } from '...'`
- **No var allowed** - Use `const` or `let` exclusively
- **Prefer const assertions** - Use `as const` where appropriate
- **@ts-expect-error** must include a description explaining why it's needed
- **Never use** `@ts-ignore`, `@ts-nocheck`, or `@ts-check`

### Naming Conventions
- Components: PascalCase (`Button`, `CollapsibleContent`)
- Functions: camelCase (`createCollapsible`, `mergeProps`)
- Constants: UPPER_SNAKE_CASE (`DEFAULT_TIMEOUT`)
- Types: PascalCase (`CollapsibleProps`, `CollapsibleRoot`)
- Private/internal: Prefix with `_` (`_internalState`, `_handleClick`)

### SolidJS-Specific Guidelines
- **No destructuring of reactive values** - This breaks reactivity (rule: solid/no-destructure)
- **Prefer Show over If** - For conditional rendering (rule: solid/prefer-show)
- **Prefer For over map** - For lists (rule: solid/prefer-for)
- **Self-closing components** - Use `<Component />` instead of `<Component></Component>`
- **Event handlers** - Use lowercase event names (`onclick` not `onClick`)
- **No innerHTML** - Use textContent or createTextNode (static strings allowed)
- **No React patterns** - Avoid React-specific props and dependency arrays
- **Imports organization** - Use proper SolidJS imports (rule: solid/imports)

### JSX/CSS Style
- **UnoCSS classes** - Use Tailwind/Wind4 utility classes from UnoCSS
- **Class prop** - Use `class` attribute (not `className`)
- **Style prop** - Use `style` prop for inline styles, consider using `css` prop if configured
- **Class ordering** - UnoCSS classes should be ordered logically (warned by @unocss/order)

### Error Handling
- **Use try-catch blocks** for async operations that might fail
- **Empty catch blocks allowed** - Only when explicitly needed
- **Always handle errors** - Don't let errors propagate to top level without handling
- **Type error boundaries** - Use proper TypeScript types instead of `any`

### Function Guidelines
- **Prefer function declarations** over arrow functions for named functions
- **Arrow functions allowed** for callbacks and inline definitions
- **Curly braces required** - Always use curly braces for control flow (rule: curly)
- **Default case last** - In switch statements
- **Default params last** - In function signatures
- **No unused variables** - Remove or prefix with `_`

### Reactivity & State
- **Reactivity warnings** - Heed `solid/reactivity` warnings (set to "warn")
- **Props destructuring** - Use spread or individual prop access, never destructure props object directly
- **Refs** - Use `@solid-primitives/refs` for ref utilities
- **Props merging** - Use `@solid-primitives/props` for prop merging utilities

### Performance
- **No await in loops** - Generally allowed (rule set to "allow")
- **Promise handling** - Use proper async/await or Promise chains
- **Avoid unnecessary promises** - Don't wrap synchronous code in promises

## Project Structure

```
src/
  index.ts           # Main entry point, exports all components
  button/            # Component directories
    index.ts         # Component exports
    button.tsx       # Component implementation
    button.test.tsx  # Component tests
playground/         # Dev playground with examples
test/               # Test utilities and setup
  setup/            # Test configuration
```

## Testing Guidelines
- Use **Vitest** as test runner with **jsdom** environment
- Use **@solidjs/testing-library** for component testing
- Test files should be named `*.test.tsx` or `*.spec.tsx`
- Use `#test-utils` alias for test utilities
- Test environment globals are enabled (no need to import describe, it, etc.)

## Build Notes
- **tsdown** is used for bundling with both `.js` and `.jsx` outputs
- External dependencies: `@solid-primitives/props`, `@solid-primitives/utils`
- Type definitions generated using oxc (`dts: { oxc: true }`)
- UnoCSS is processed as a plugin during build
- Platform targets: browser (for .js) and neutral (for .jsx)

## Important Reminders
1. Always run `bun run qa` before committing - it runs format, lint --fix, and typecheck
2. The project uses Bun as package manager and runtime
3. All tests must pass before releasing (`bun run release` requires tests)
4. The library exports as `@subf/base-ui` (check package.json)
5. Use `~` alias in playground to reference src directory
6. Type checking must pass (`tsc --noEmit`)

## Known Patterns
This library is based on Kobalte patterns. When creating components:
- Study Kobalte's component structure for consistency
- Use primitive patterns where appropriate
- Maintain accessibility (a11y) standards
- Follow the established prop conventions (root, trigger, content, etc.)

## Before Making Changes
1. Read existing code to understand patterns (even if src is empty, check configs)
2. Run relevant tests first
3. Make changes in small increments
4. Test each increment
5. Run `bun run qa` before finishing
