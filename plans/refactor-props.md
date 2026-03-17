# Plan: Unify Component Props with Namespace Pattern

## Context

Rock UI has ~35 components with inconsistent props type structures. Types like `Base`, `Variant`, `Slots`, `Classes`, `Styles`, `Items`, and external `Extend` are scattered as loose exports with varying naming conventions. This plan unifies all component props into a standardized `ComponentT` namespace with 8 fixed members (`Slot`, `Variant`, `Items`, `Extend`, `Classes`, `Styles`, `Base`, `Props`), plus a utility type to compose the final `ComponentProps`.

## Goals

- Standardize component prop types into a single predictable namespace shape per component (`{ComponentName}T`)
- Keep runtime behavior unchanged (type-only reorganization)
- Reduce mental overhead when authoring new components and when porting patterns from Nuxt UI / shadcn
- Make it easy to discover and reuse per-component primitives (`Slot`, `Variant`, `Items`, etc.) without guessing export names

## Non-Goals

- No runtime refactor (JSX structure, component logic, class computation, and `.class.ts` contents stay the same)
- No public API redesign beyond type export surface normalization (breaking changes are allowed in pre-alpha, but this plan tries to avoid them)
- No large-scale reformat of unrelated code

## Definition of Done

- All components listed in **Files to Modify** have a `{ComponentName}T` namespace with the 8 standard members
- Each component exports a top-level `*Props` interface (e.g. `export interface ButtonProps extends ButtonT.Props {}`)
- `bun run typecheck` passes after each batch; `bun run qa` passes at the end
- Tests still pass (`bun run test --run`)

## 1. Add `RockUIProps` Utility Type

**File:** `src/shared/types.ts`

Add alongside existing `RockUIComposeProps`:

```typescript
/**
 * Composes final component props from namespace members.
 * B = Base, V = Variant, E = Extend, ExtraOmitKeys = additional keys to omit from E.
 *
 * Since every component always provides explicit types for B, V, and E
 * (empty interfaces for absent categories), this simply intersects B & V
 * and composes with E using RockUIComposeProps.
 */
export type RockUIProps<B, V, E, ExtraOmitKeys extends keyof any = never> = RockUIComposeProps<
  B & V,
  E,
  ExtraOmitKeys
>
```

## 2. Namespace Pattern

Every component gets a `ComponentT` namespace with exactly 8 members. Empty `interface` when absent. All existing JSDoc on props must be preserved.

### Simple Component (Card — no Variant, no Extend, no Items)

```typescript
// card.tsx
export namespace CardT {
  export type Slot = 'root' | 'header' | 'title' | 'description' | 'action' | 'body' | 'footer'
  export interface Variant {}
  export interface Items {}
  export interface Extend {}
  export interface Classes extends SlotClasses<Slot> {}
  export interface Styles extends SlotStyles<Slot> {}
  export interface Base {
    compact?: boolean
    title?: JSX.Element
    description?: JSX.Element
    header?: JSX.Element
    footer?: JSX.Element
    action?: JSX.Element
    classes?: Classes
    styles?: Styles
    children?: JSX.Element
  }
  export interface Props extends RockUIProps<Base, Variant, Extend> {}
}

export interface CardProps extends CardT.Props {}
```

### Medium Component (Button — Variant + Extend, polymorphic)

```typescript
// button.tsx  (button.class.ts stays unchanged)
export namespace ButtonT {
  export type Slot = 'base' | 'loading' | 'leading' | 'label' | 'trailing'
  export type Variant = ButtonVariantProps // re-export from .class.ts
  export interface Items {}
  export type Extend<T extends ValidComponent = 'button'> = PolymorphicProps<
    T,
    KobalteButton.ButtonRootProps<ElementOf<T>>
  >
  export interface Classes extends SlotClasses<Slot> {}
  export interface Styles extends SlotStyles<Slot> {}
  export interface Base {
    loading?: boolean
    loadingAuto?: boolean
    loadingIcon?: IconName
    leading?: IconName
    trailing?: IconName
    classes?: Classes
    styles?: Styles
    children?: JSX.Element
  }
  export interface Props<T extends ValidComponent = 'button'> extends RockUIProps<
    Base,
    Variant,
    Extend<T>,
    'class' | 'style'
  > {}
}

export interface ButtonProps<T extends ValidComponent = 'button'> extends ButtonT.Props<T> {}
```

### Complex Component (CheckboxGroup — Variant + Items, generics)

```typescript
// checkbox-group.tsx
export namespace CheckboxGroupT {
  export type Slot =
    | 'root'
    | 'fieldset'
    | 'legend'
    | 'item'
    | 'container'
    | 'base'
    | 'indicator'
    | 'icon'
    | 'wrapper'
    | 'label'
    | 'description'

  export type Variant = CheckboxGroupVariantProps

  export interface Items<TTrue = boolean, TFalse = boolean> {
    value?: string
    label?: JSX.Element
    description?: JSX.Element
    disabled?: boolean
    indeterminate?: CheckboxProps<TTrue, TFalse>['indeterminate']
    checkedIcon?: CheckboxProps<TTrue, TFalse>['checkedIcon']
    indeterminateIcon?: CheckboxProps<TTrue, TFalse>['indeterminateIcon']
  }

  export interface Extend {}
  export interface Classes extends SlotClasses<Slot> {}
  export interface Styles extends SlotStyles<Slot> {}

  export interface Base<TTrue = boolean, TFalse = boolean>
    extends
      FormIdentityOptions,
      FormValueOptions<CheckboxGroupValue[]>,
      FormRequiredOption,
      FormDisableOption {
    legend?: JSX.Element
    items?: (string | Items<TTrue, TFalse>)[]
    indicator?: CheckboxProps<TTrue, TFalse>['indicator']
    checkedIcon?: CheckboxProps<TTrue, TFalse>['checkedIcon']
    indeterminateIcon?: CheckboxProps<TTrue, TFalse>['indeterminateIcon']
    onChange?: (value: CheckboxGroupValue[]) => void
    classes?: Classes
    styles?: Styles
  }

  export interface Props<TTrue = boolean, TFalse = boolean> extends RockUIProps<
    Base<TTrue, TFalse>,
    Variant,
    Extend
  > {}

  // Extra types beyond the 6 standard categories when needed:
  export type Value = string
}

export interface CheckboxGroupProps<TTrue = boolean, TFalse = boolean> extends CheckboxGroupT.Props<
  TTrue,
  TFalse
> {}
```

### Overlay Component (Tooltip — Variant + Extend)

```typescript
// tooltip.tsx
export namespace TooltipT {
  export type Slot = 'content' | 'trigger' | 'text' | 'kbds' | 'kbd'
  export type Variant = TooltipVariantProps
  export interface Items {}
  export type Extend = KobalteTooltip.TooltipRootProps
  export interface Classes extends SlotClasses<Slot> {}
  export interface Styles extends SlotStyles<Slot> {}
  export interface Base {
    text?: JSX.Element
    kbds?: string[]
    classes?: Classes
    styles?: Styles
    children: JSX.Element
  }
  export interface Props extends RockUIProps<Base, Variant, Extend> {}
}

export interface TooltipProps extends TooltipT.Props {}
```

## 3. Rules

1. **Namespace name**: `{ComponentName}T` (e.g., `ButtonT`, `CheckboxGroupT`)
2. **8 standard members**: `Slot`, `Variant`, `Items`, `Extend`, `Classes`, `Styles`, `Base`, `Props` — always present
3. **Empty `interface`** for absent categories (e.g., `export interface Items {}`)
4. **`Slot`** = string union of slot names. `classes`/`styles` on Base use `SlotClasses<Slot>` / `SlotStyles<Slot>` (unless custom Classes type needed)
5. **`Variant`** = type alias to the existing `VariantProps` from `.class.ts` file
6. **`Items`** = interface describing a single item's shape (the item object)
7. **`Extend`** = type alias to the external library props (Kobalte, etc.) or empty interface
8. **`Classes`/`Styles`** live in the namespace and are the only supported classes/styles types for external consumption
9. **`Base`** = the main component props interface (includes `classes?`, `styles?`, `children?`, form extends)
10. **`Props`** = final composed type using `RockUIProps<Base, Variant, Extend>` inside the namespace, supports generics
11. **`ComponentProps`** = top-level convenience interface: `export interface ButtonProps<T> extends ButtonT.Props<T> {}`
12. **`.class.ts` files** = unchanged (still export CVA functions + `VariantProps`)
13. **Extra types** beyond the 8 categories live as additional namespace members
14. **Base no longer `extends` Variant** — they compose via `RockUIProps`
15. **Preserve JSDoc** — all existing JSDoc comments on props must be kept as-is when moving into namespace
16. **No top-level `*Classes/*Styles/*BaseProps/*Item*` exports** — these should be moved into `ComponentT` namespace instead

## 3.1 Implementation Checklist (Per Component)

Use this checklist when migrating a single `*.tsx` file:

1. Identify existing exported prop-related types: `*Props`, `*BaseProps`, `*VariantProps`, `*Classes`, `*Styles`, `*Item`, `*Option`, etc.
2. Create `export namespace {ComponentName}T { ... }` near the top of the file (after imports).
3. Move or re-alias types into the namespace:
   - `Slot`: string union (reuse existing literal types if they exist)
   - `Variant`: alias to `FooVariantProps` from `{component}.class.ts` if present, else empty `interface Variant {}`
   - `Items`: the item object shape if the component has `items`/`options`, else empty `interface Items {}`
   - `Extend`: alias to external library props / polymorphic props, else empty `interface Extend {}`
   - `Base`: the core props interface (keep JSDoc and any `extends` for form options, etc.)
   - `Props`: use `RockUIProps<...>` (and generics if needed)
4. Keep top-level `export type FooProps = FooT.Props` (or `FooProps<T> = FooT.Props<T>`).
5. Update internal references inside the file to point at the new types only when required for compilation.
6. Ensure imports remain minimal:
   - If `FooVariantProps` comes from `.class.ts`, the component must still import it.
   - If `SlotClasses`/`SlotStyles` are used, keep those imports.
7. Do not change runtime code (component body, JSX, `cn()` usage, CVA calls, etc.).
8. Run `bun run typecheck` for the current batch before continuing.

## 4. Files to Modify

### Infrastructure (1 file)

- `src/shared/types.ts` — add `RockUIProps` utility type

### Components (~35 files, type reorganization only)

**Elements:**

- `src/elements/accordion/accordion.tsx`
- `src/elements/avatar/avatar.tsx`
- `src/elements/badge/badge.tsx`
- `src/elements/button/button.tsx`
- `src/elements/card/card.tsx`
- `src/elements/collapsible/collapsible.tsx`
- `src/elements/icon/icon.tsx`
- `src/elements/icon/icon-button.tsx`
- `src/elements/kbd/kbd.tsx`
- `src/elements/progress/progress.tsx`
- `src/elements/resizable/resizable.tsx`
- `src/elements/separator/separator.tsx`

**Forms:**

- `src/forms/checkbox/checkbox.tsx`
- `src/forms/checkbox-group/checkbox-group.tsx`
- `src/forms/file-upload/file-upload.tsx`
- `src/forms/form/form.tsx`
- `src/forms/form-field/form-field.tsx`
- `src/forms/input/input.tsx`
- `src/forms/input-number/input-number.tsx`
- `src/forms/radio-group/radio-group.tsx`
- `src/forms/select/select.tsx`
- `src/forms/slider/slider.tsx`
- `src/forms/switch/switch.tsx`
- `src/forms/textarea/textarea.tsx`

**Navigation:**

- `src/navigation/breadcrumb/breadcrumb.tsx`
- `src/navigation/command-palette/command-palette.tsx`
- `src/navigation/pagination/pagination.tsx`
- `src/navigation/stepper/stepper.tsx`
- `src/navigation/tabs/tabs.tsx`

**Overlays:**

- `src/overlays/context-menu/context-menu.tsx`
- `src/overlays/dialog/dialog.tsx`
- `src/overlays/dropdown-menu/dropdown-menu.tsx`
- `src/overlays/popover/popover.tsx`
- `src/overlays/popup/popup.tsx`
- `src/overlays/sheet/sheet.tsx`
- `src/overlays/tooltip/tooltip.tsx`

### Unchanged

- All `.class.ts` files (still export CVA functions + VariantProps)
- All `index.ts` barrel files (`export *` automatically picks up namespace)
- Component function bodies and JSX (no runtime changes)

## 5. Migration Order

1. Add `RockUIProps` to `src/shared/types.ts`, merge `src/shared/slot.ts` into `src/shared/types.ts`
2. Simplest first: Card, Separator, Collapsible (Base-only or simple Extend)
3. Variant components: Badge, Kbd, Progress (Variant, simple shapes)
4. Variant + Extend: Button, Tooltip, Dialog, Accordion, Popover, Sheet, Popup
5. Forms: Input, Textarea, Switch, Checkbox, FormField
6. Items: CheckboxGroup, RadioGroup, Tabs, Stepper, Breadcrumb, Accordion
7. Complex: Select, ContextMenu, DropdownMenu, CommandPalette, FileUpload, Slider, InputNumber
8. Remaining: Avatar, Resizable, Pagination, Icon, IconButton

Run `bun run typecheck` after each batch. Run `bun run qa` at the end.

## 5.1 Suggested PR/Commit Slicing

If this is done across multiple commits/PRs:

1. Infra-only: add `RockUIProps` and any necessary exported helper types
2. Elements: migrate simple elements first
3. Overlays: migrate components with Kobalte `Extend`
4. Forms: migrate form components, ensure the form shared types remain consistent
5. Navigation + Complex: migrate items-heavy and generic-heavy components last

Each slice should be able to typecheck on its own.

## 6. Verification

1. `bun run typecheck` — no type errors
2. `bun run test --run` — all tests pass (no runtime changes)
3. `bun run qa` — full QA pass (format + lint + typecheck)
4. Spot-check that `ComponentProps` resolves to the same structural type as before (hover in IDE)

## 7. Risks and Mitigations

- **Accidental breaking export surface**: renaming or removing a previously exported type alias can break downstream usage.
  - Mitigation: keep the existing top-level `*Props` export shape (but as an `interface`), and move auxiliary exports (`*Classes`, `*Items`, etc.) into the namespace. Since this is pre-alpha, breaking changes are allowed, but the migration should still be mechanical and consistent.
- **Generic parameter drift**: components with generics/polymorphic props may subtly change defaults.
  - Mitigation: preserve defaults exactly (e.g. `T extends ValidComponent = 'button'`), and keep `ExtraOmitKeys` consistent for `class`/`style`.
- **JSDoc loss**: moving interfaces can drop documentation and degrade DX.
  - Mitigation: treat JSDoc as part of the API; move comments with the fields and keep wording identical.
- **Type import cycles**: moving types can introduce circular imports.
  - Mitigation: prefer `type` imports and keep namespace types inside the same file as the component where possible.

## 8. Rollback Strategy

- Since this is a type-only refactor, rollback is simply reverting the affected `*.tsx` type sections and removing `RockUIProps` if needed.
- Keep each batch small enough that reverting does not block unrelated work.

## 9. Notes / Edge Cases

- Components that already define `Classes`/`Styles` types:
  - Prefer `classes?: ComponentT.Classes` and `styles?: ComponentT.Styles` by default.
  - If a component needs a custom `Classes`/`Styles` shape (e.g. derived keys, generics), define them directly as `ComponentT.Classes`/`ComponentT.Styles` (or additional namespace members) and keep `Base.classes/styles` pointing at the namespace types.
- Components with `items`/`options` supporting `string | object`:
  - `Items` describes the object form; the `Base.items` prop can remain a union.
- Components that wrap Kobalte primitives:
  - `Extend` should point to the relevant Kobalte prop type (or the polymorphic wrapper) and omit `class`/`style` when Rock UI owns those props.
