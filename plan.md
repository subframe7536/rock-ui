## Plan: Inline Kobalte Combobox → `<Combobox>` Component

**TL;DR**: Extract the core state machine from Kobalte (collection, selection, keyboard delegate — ~6 files). Build a basic `<Combobox>` component following the same layered architecture as `<OverlayMenu>` (`#file:src/overlays/base/menu/menu.tsx`). Reuse menu's floating positioning, dismiss, scroll lock, presence/transition, and keyboard nav infrastructure. No `createContext` — plain props and signal returns. Drop `@kobalte/core` from `package.json`.

### Design Principles
- **Component structure mirrors `<OverlayMenu>`**: `<ComboboxRoot>` (controlled/uncontrolled open), `<Combobox>` (portal + dismiss + scroll lock), and internal `<ComboboxLayer>` (listbox positioning + keyboard nav + selection). Same prop layering pattern as `OverlayMenuSharedProps` → `OverlayMenuLayerProps` → `OverlayMenuProps` → `OverlayMenuRootProps`.
- **Max reuse from menu base** (`src/overlays/base/menu/`):
  - `useOverlayMenuFloatingPosition` — floating UI positioning (already generic)
  - `useOverlayMenuDismiss` — click-outside / Escape dismissal
  - `useOverlayMenuLayerState` — adapt for listbox items (registerItem, highlightedItemId, focusItemByOffset, focusItemByTypeahead, etc.)
  - `onLayerKeyDown` / `focusLayerFromStrategy` — keyboard navigation patterns
  - `resolveMenuGroups` — adapt for option groups
  - `acquireBodyScrollLock`, `focusWithoutScrolling`, `getTransformOrigin`, `resolveDirection` from overlay utils
  - `useTransitionPresence` — animation presence
  - `overlayMenuContentVariants` — content styling
- **Minimal Kobalte inlining**: Only the state machine primitives that Moraine doesn't already have: collection, selection, keyboard delegate.
- **No `createContext`**: All state flows through plain props and signal returns. Select/MultiSelect/CommandPalette call `createComboboxState(config)` and pass the returned state to render functions — no `<ComboboxContext.Provider>` needed.

### Current State
- All other Kobalte packages already inlined. Only `@kobalte/core/combobox` remains.
- 8 import sites across 5 files reference `@kobalte/core/combobox`
- `@kobalte/core` + `@kobalte/utils` still in `package.json` (utils already zero source imports)
- Moraine already owns most combobox logic in `src/forms/select/shared/`:
  - `useSelectFilter` ✓, `useSelectField` ✓, `useSelectMenuControl` ✓
  - `normalizeOptions` / `flattenOptions` ✓, `createFindOptionByValue` ✓
  - `createComboboxInputHandlers` ✓
  - `RenderSelectComboboxFrame` — needs adaptation (still uses `<Combobox.*>` sub-components)

### What's Missing (Must Inline from Kobalte)
Only 6 lightweight files from `kobalte/packages/core/src/`:

| File                                           | Purpose                                                              | LOC  |
| ---------------------------------------------- | -------------------------------------------------------------------- | ---- |
| `selection/types.ts`                           | `Selection`, `SelectionMode`, `SelectionBehavior` types              | ~50  |
| `selection/selection-manager.ts`               | `SelectionManager` class — selected keys, focused key, toggle/select | ~400 |
| `selection/create-multiple-selection-state.ts` | `createMultipleSelectionState()` — SolidJS signals for selection     | ~150 |
| `list/list-collection.ts`                      | `ListCollection` — key→node Map with prev/next links                 | ~80  |
| `list/list-keyboard-delegate.ts`               | `ListKeyboardDelegate` — arrow/home/end/pageup/pagedown nav          | ~300 |
| `primitives/create-collection/`                | `createCollection()` — builds Collection from dataSource accessors   | ~200 |

---

## New Component Architecture

### `<Combobox>` — structured like `<OverlayMenu>`

Following the proven pattern from `menu.tsx`:

```
ComboboxSharedProps<TItem>        — shared: items, classes, styles, size, icons, contentTop/Bottom
  ↓
ComboboxLayerProps<TItem>         — layer-specific: open, close, depth, getReferenceElement,
                                     presenceDataAttrs, registerBranch, setPresenceElement,
                                     selectionMode, onSelectionChange, inputValue, onInputChange
  ↓
ComboboxProps<TItem>              — main component: open, onClose, triggerElement, getAnchorRect,
                                     autoFocusStrategy, onContentPointerDown, preventScroll
  ↓
ComboboxRootProps<TItem>          — root wrapper: open?, defaultOpen?, onOpenChange?, disabled?
```

#### Key differences from `<OverlayMenu>`:
| Aspect      | OverlayMenu                                           | Combobox                                  |
| ----------- | ----------------------------------------------------- | ----------------------------------------- |
| ARIA role   | `menu` / `menuitem`                                   | `combobox` + `listbox` / `option`         |
| Input       | None                                                  | Text input for filtering                  |
| Selection   | None (click → onSelect + close)                       | Single/multiple with checkmarks           |
| Submenus    | Yes (recursive `OverlayMenuLayer`)                    | No                                        |
| Trigger     | External element                                      | Input or button showing selected value    |
| Filtering   | Typeahead only                                        | Text-based filter via input               |
| Items       | `OverlayMenuSharedItem` (label, icon, kbds, children) | Options with value/label/disabled         |
| Positioning | Anchor to trigger or virtual rect                     | Anchor to trigger (typically input width) |

#### Reused from menu base:
- **Floating UI**: `useOverlayMenuFloatingPosition` — identical positioning logic (flip, shift, size, sameWidth)
- **Dismiss**: `useOverlayMenuDismiss` — identical click-outside + Escape + focus-out
- **Scroll lock**: `acquireBodyScrollLock` — identical
- **Presence**: `useTransitionPresence` — identical `data-closed`/`data-expanded` attrs
- **Layer state**: Adapt `useOverlayMenuLayerState` — same highlighted item tracking, typeahead search, item registration, pointer grace intent (no submenus needed, so `closeSubmenus` becomes no-op)
- **Keyboard nav**: `onLayerKeyDown` pattern — ArrowUp/Down/Home/End + typeahead + Escape + Tab
- **Auto-focus**: `focusLayerFromStrategy` — identical `content`/`first`/`last`/`none`
- **Content styling**: `overlayMenuContentVariants` — same popover appearance
- **Branch registration**: Same subtree tracking for dismiss containment

### `createComboboxState(config)` Hook
Wires the inlined Kobalte state machine primitives:
- `createCollection` → `ListCollection` → `createMultipleSelectionState` → `SelectionManager` → `ListKeyboardDelegate`
- Returns: `listState` (with `collection` and `selectionManager`), `keyboardDelegate`, `onInputKeyDown`, `selectedOptions`, `resetInputValue`
- Reuses: `useControllableValue` (for value), `useSelectFilter` (for filtering), existing option normalization

---

## Implementation Steps (Single Pass, ~12 steps)

### Step 1: Inline Kobalte state machine primitives

Clone kobalte source file from https://github.com/kobaltedev/kobalte to `kobalte/` locally if not exists.

*All independent, can be done in parallel. Source: `kobalte/packages/core/src/`.*

1. **`src/shared/primitives/selection/types.ts`** ← `kobalte/packages/core/src/selection/types.ts`
2. **`src/shared/primitives/selection/create-multiple-selection-state.ts`** ← `kobalte/packages/core/src/selection/create-multiple-selection-state.ts` (replace `createControllableSelectionSignal` with Moraine's `useControllableValue`)
3. **`src/shared/primitives/selection/selection-manager.ts`** ← `kobalte/packages/core/src/selection/selection-manager.ts`
4. **`src/shared/primitives/collection/list-collection.ts`** ← `kobalte/packages/core/src/list/list-collection.ts`
5. **`src/shared/primitives/collection/create-collection.ts`** ← `kobalte/packages/core/src/primitives/create-collection/`
6. **`src/shared/primitives/collection/list-keyboard-delegate.ts`** ← `kobalte/packages/core/src/list/list-keyboard-delegate.ts`
7. **`src/shared/primitives/test-utils.ts`** ← `kobalte/packages/tests/src/utils.ts` + `events.ts` (`createPointerEvent`, `installPointerEvent`)

Adapt all `@kobalte/utils` imports → local equivalents (`access` → direct call, `isFunction` → `typeof x === 'function'`).

### Step 2: Create `createComboboxState` hook
*Depends on Step 1.*

8. **Create `src/forms/select/shared/combobox-state.ts`**:
   - Wires `createCollection` + `createMultipleSelectionState` + `SelectionManager` + `ListKeyboardDelegate`
   - Returns `{ listState, keyboardDelegate, onInputKeyDown, selectedOptions, resetInputValue }`
   - No context — plain function return

### Step 3: Build `<Combobox>` component
*Depends on Step 2. Follows `OverlayMenu` pattern from `menu.tsx`.*

9. **Create `src/overlays/base/combobox/combobox.tsx`**:
   - `<ComboboxLayer>` — internal listbox layer: floating positioning (reuse `useOverlayMenuFloatingPosition`), item registration, keyboard navigation (adapt `onLayerKeyDown` for listbox), selection rendering
   - `<Combobox>` — main component: portal mounting, scroll lock (reuse `acquireBodyScrollLock`), dismiss (reuse `useOverlayMenuDismiss`), branch registration, presence/transition
   - `<ComboboxRoot>` — controlled/uncontrolled open state wrapper
   - Reuse from menu: `useOverlayMenuFloatingPosition`, `useOverlayMenuDismiss`, `useTransitionPresence`, `overlayMenuContentVariants`, `focusLayerFromStrategy`, overlay utils
   - Adapt from menu: `useOverlayMenuLayerState` → `useComboboxLayerState` (simplified — no submenu support, add selection-awareness)
   - New: input element rendering, listbox ARIA, selection indicator rendering

### Step 4: Rewrite render functions without Kobalte Combobox sub-components
*Depends on Step 3.*

10. **Refactor `src/forms/select/shared/render.tsx`**:
    - `<Combobox.Control>` → plain `<div>` with click handler
    - `<Combobox.Portal>` + `<Combobox.Content>` → handled by new `<Combobox>` component internally
    - `<Combobox.Listbox>` → rendered inside `<ComboboxLayer>`
    - `<Combobox.Item>` → plain `<div role="option">` with selection state from `selectionManager`
    - `<Combobox.ItemLabel>`, `<Combobox.ItemDescription>`, `<Combobox.ItemIndicator>` → plain `<span>`
    - `<Combobox.Section>` → plain `<div role="group">`
    - `<Combobox.Trigger>` → existing Moraine `IconButton`
    - `<Combobox.Input>` → plain `<input>` with handlers from `createComboboxState`
    - `<Combobox.HiddenSelect>` → plain `<select hidden>` for form submission
    - Remove ALL `useComboboxContext()` calls — accept state via props/params

### Step 5: Rewrite Select component
*Depends on Steps 3-4.*

11. **Refactor `src/forms/select/select.tsx`**:
    - Replace `<Combobox>` wrapper with new `<Combobox>` + call `createComboboxState(config)`
    - `useComboboxContext()` → access return from `createComboboxState`
    - `ComboboxSingleSelectionOptions` → inline the single-value bridging (already in `handleSingleChange`)
    - Set `Extend = never` in `SelectT` namespace
    - Remove `'multiple' | 'defaultFilter' | 'itemComponent' | 'sectionComponent'` from `BaseProps` omit
    - No `@kobalte/core/combobox` imports

### Step 6: Rewrite MultiSelect component
*Depends on Steps 3-4. Parallel with Step 5.*

12. **Refactor `src/forms/select/multi-select.tsx`**:
    - Same pattern as Select but with `selectionMode: 'multiple'`
    - Set `Extend = never`
    - Keep existing tag rendering, token separator, maxCount logic

### Step 7: Rewrite CommandPalette component
*Depends on Step 3. Parallel with Steps 5-6.*

13. **Refactor `src/navigation/command-palette/command-palette.tsx`**:
    - Always-open combobox → simplifies to keyboard nav only
    - Replace all `<Combobox.*>` with new `<Combobox>` + plain DOM
    - `Extend` already `never` ✓

### Step 8: Clean up shared layer
*Depends on Steps 5-7.*

14. **Refactor `src/forms/select/shared/behavior.ts`**:
    - Remove `ComboboxContextValue` import — define local `SelectMenuContext`
    - `createComboboxInputHandlers` accepts plain object instead of `Pick<ComboboxContextValue, ...>`

### Step 9: Remove Kobalte dependency
*Depends on Steps 5-8.*

15. Remove `@kobalte/core` + `@kobalte/utils` from `package.json`
16. Run `bun install`

### Step 10: Migrate tests
*Depends on Step 1. Parallel with Steps 2-9.*

17. **`src/shared/primitives/selection/selection-manager.test.ts`** — test SelectionManager in isolation
18. **`src/shared/primitives/collection/list-collection.test.ts`** — test ListCollection

### Step 11: Final verification

19. `bun run test --run` — all existing + new tests pass
20. `bun run typecheck` — zero errors
21. `bun run build` — library builds without @kobalte/core
22. Grep `src/` for `@kobalte` → zero matches
23. `bun run qa` — format, lint, typecheck all clean

---

## Relevant Files

### Files to create (~10):
- `src/shared/primitives/selection/types.ts` ← `kobalte/packages/core/src/selection/types.ts`
- `src/shared/primitives/selection/create-multiple-selection-state.ts` ← `kobalte/packages/core/src/selection/create-multiple-selection-state.ts`
- `src/shared/primitives/selection/selection-manager.ts` ← `kobalte/packages/core/src/selection/selection-manager.ts`
- `src/shared/primitives/collection/list-collection.ts` ← `kobalte/packages/core/src/list/list-collection.ts`
- `src/shared/primitives/collection/create-collection.ts` ← `kobalte/packages/core/src/primitives/create-collection/`
- `src/shared/primitives/collection/list-keyboard-delegate.ts` ← `kobalte/packages/core/src/list/list-keyboard-delegate.ts`
- `src/shared/primitives/test-utils.ts` ← `kobalte/packages/tests/src/`
- `src/forms/select/shared/combobox-state.ts` — NEW: `createComboboxState(config)` hook
- `src/overlays/base/combobox/combobox.tsx` — NEW: `<ComboboxRoot>`, `<Combobox>`, `<ComboboxLayer>` (structured like `menu.tsx`)
- `src/overlays/base/combobox/index.ts` — barrel export
- `src/shared/primitives/selection/selection-manager.test.ts` — migrated test
- `src/shared/primitives/collection/list-collection.test.ts` — migrated test

### Files to modify (~6):
- `src/forms/select/select.tsx` — use `<Combobox>` + `createComboboxState`, drop @kobalte imports, Extend=never
- `src/forms/select/multi-select.tsx` — same, Extend=never
- `src/forms/select/shared/render.tsx` — replace Combobox sub-components with new `<Combobox>` + plain DOM
- `src/forms/select/shared/behavior.ts` — drop ComboboxContextValue, simplify input handlers
- `src/navigation/command-palette/command-palette.tsx` — use `<Combobox>` + `createComboboxState`, plain DOM
- `package.json` — remove @kobalte/core, @kobalte/utils

### Reference (do not modify):
- `src/overlays/base/menu/menu.tsx` — **primary architecture reference** for `<Combobox>`
- `src/overlays/base/menu/menu.utils.ts` — floating position, dismiss, layer state (reuse/adapt)
- `src/overlays/base/menu/types.ts` — shared types pattern
- `kobalte/packages/core/src/selection/` — source for selection primitives
- `kobalte/packages/core/src/list/` — source for collection + keyboard delegate
- `kobalte/packages/core/src/primitives/create-collection/` — source for createCollection
- `kobalte/packages/core/src/combobox/combobox-base.tsx` — reference for state machine wiring
- `kobalte/packages/core/src/combobox/combobox-input.tsx` — reference for input keyboard handling
- `kobalte/packages/core/src/combobox/combobox.test.tsx` — test reference
- `src/overlays/base/utils.ts` — focus trap, scroll lock (reuse)
- `src/shared/use-controllable-value.ts` — controllable signal (reuse)
- `src/shared/use-transition-presence.ts` — animation presence (reuse)

---

## Verification
1. `bun run test --run` — all Moraine + migrated Kobalte tests pass
2. `bun run typecheck` — zero errors
3. `bun run build` — library builds without @kobalte/core
4. Grep `src/` for `@kobalte` → zero matches
5. `bun run qa` — format, lint, typecheck clean
