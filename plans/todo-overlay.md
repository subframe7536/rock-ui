# TODO: Overlay Components (8)

PORT DETAILS: `./nuxt-ui-port-plan.md`

## Execution Policy

- This file is the single source of truth for overlay scope, order, and status.
- Work only active items in phased order; do not parallelize unrelated overlay implementations.
- Keep `(SKIP)` items tracked but out of active delivery phases.
- Respect renamed target: Nuxt `Slideover.vue` ports to Rock `sheet` (`src/sheet/`).
- Do not mark a component complete until implementation, tests, and exports are all done.

## Scope Snapshot (2026-02-21)

- Total scoped components: `8`
- Active delivery scope: `5` (`context-menu`, `dropdown-menu`, `modal`, `popover`, `sheet`)
- Skip scope: `2` (`drawer`, `toast`)
- Completed: `6` (`context-menu`, `dropdown-menu`, `modal`, `popover`, `sheet`, `tooltip`)

## Component Backlog

- [x] context-menu | nuxt:ContextMenu.vue | coss:menu.tsx | rock:src/context-menu/ | tests+exports
- [ ] (SKIP) drawer | nuxt:Drawer.vue | coss:sheet.tsx | rock:src/drawer/ | tests+exports
- [x] dropdown-menu | nuxt:DropdownMenu.vue | coss:menu.tsx | rock:src/dropdown-menu/ | tests+exports
- [x] modal | nuxt:Modal.vue | coss:dialog.tsx | rock:src/modal/ | tests+exports
- [x] popover | nuxt:Popover.vue | coss:popover.tsx | rock:src/popover/ | tests+exports
- [x] sheet | nuxt:Slideover.vue | coss:sheet.tsx | rock:src/sheet/ | tests+exports
- [ ] (SKIP) toast | nuxt:Toast.vue | coss:toast.tsx | rock:src/toast/ | tests+exports
- [x] tooltip | nuxt:Tooltip.vue | coss:tooltip.tsx | rock:src/tooltip/ | tests+exports

## File Reference Map

### Context Menu

- Nuxt logic: `nuxt-ui/src/runtime/components/ContextMenu.vue`
- Nuxt content renderer: `nuxt-ui/src/runtime/components/ContextMenuContent.vue`
- Coss style seed: `coss/packages/ui/src/components/menu.tsx`
- Rock target files:
  - `src/context-menu/context-menu.tsx`
  - `src/context-menu/context-menu.class.ts`
  - `src/context-menu/context-menu.test.tsx`
  - `src/context-menu/index.ts`
- Export touchpoint: `src/index.ts`

### Dropdown Menu

- Nuxt logic: `nuxt-ui/src/runtime/components/DropdownMenu.vue`
- Nuxt content renderer: `nuxt-ui/src/runtime/components/DropdownMenuContent.vue`
- Coss style seed: `coss/packages/ui/src/components/menu.tsx`
- Rock target files:
  - `src/dropdown-menu/dropdown-menu.tsx`
  - `src/dropdown-menu/dropdown-menu.class.ts`
  - `src/dropdown-menu/dropdown-menu.test.tsx`
  - `src/dropdown-menu/index.ts`
- Export touchpoint: `src/index.ts`

### Modal

- Nuxt logic: `nuxt-ui/src/runtime/components/Modal.vue`
- Coss style seed: `coss/packages/ui/src/components/dialog.tsx`
- Rock target files:
  - `src/modal/modal.tsx`
  - `src/modal/modal.class.ts`
  - `src/modal/modal.test.tsx`
  - `src/modal/index.ts`
- Export touchpoint: `src/index.ts`

### Popover

- Nuxt logic: `nuxt-ui/src/runtime/components/Popover.vue`
- Coss style seed: `coss/packages/ui/src/components/popover.tsx`
- Rock target files:
  - `src/popover/popover.tsx`
  - `src/popover/popover.class.ts`
  - `src/popover/popover.test.tsx`
  - `src/popover/index.ts`
- Export touchpoint: `src/index.ts`

### Sheet (Nuxt Slideover Port)

- Nuxt logic source: `nuxt-ui/src/runtime/components/Slideover.vue`
- Coss style seed: `coss/packages/ui/src/components/sheet.tsx`
- Rock target files:
  - `src/sheet/sheet.tsx`
  - `src/sheet/sheet.class.ts`
  - `src/sheet/sheet.test.tsx`
  - `src/sheet/index.ts`
- Export touchpoint: `src/index.ts`

### Tooltip (Completed Baseline)

- Nuxt logic: `nuxt-ui/src/runtime/components/Tooltip.vue`
- Coss style seed: `coss/packages/ui/src/components/tooltip.tsx`
- Rock implementation:
  - `src/tooltip/tooltip.tsx`
  - `src/tooltip/tooltip.class.ts`
  - `src/tooltip/tooltip.test.tsx`
  - `src/tooltip/index.ts`
- Root export: `src/index.ts`

### Skip References

- Drawer:
  - `nuxt-ui/src/runtime/components/Drawer.vue`
  - `coss/packages/ui/src/components/sheet.tsx`
  - target when resumed: `src/drawer/`
- Toast:
  - `nuxt-ui/src/runtime/components/Toast.vue`
  - `nuxt-ui/src/runtime/components/Toaster.vue`
  - `coss/packages/ui/src/components/toast.tsx`
  - target when resumed: `src/toast/`

## Delivery Phases (Active Scope Only)

### P0 - Baseline Complete

- `tooltip` is complete and remains the overlay baseline.

### P1 - Popover Foundation

- Deliver `popover` first.
- Why:
  - small core overlay primitive
  - direct dependency for navigation work (`navigation-menu -> popover`)
- Minimum contract:
  - click + hover behavior parity
  - `portal` and content placement defaults
  - outside interaction + `dismissible` behavior

### P2 - Menu Pair

- Deliver together: `dropdown-menu` + `context-menu`
- Shared implementation goal:
  - common recursive item rendering for `children`
  - common item shape for `label/description/icon/avatar/kbds`
  - checkbox/select item behavior and submenu coverage
- Completion gate:
  - keyboard navigation tests
  - nested submenu tests
  - slot rendering tests

### P3 - Dialog Pair

- Deliver together: `modal` + `sheet`
- Shared implementation goal:
  - common shell structure (overlay/content/header/body/footer/close)
  - variant differences mostly isolated in `*.class.ts`
- Completion gate:
  - dismissible false path (`close:prevent`)
  - close button/slot behavior
  - side variant behavior for `sheet`

### P4 - Overlay QA Sweep

- Commands:
  - `bun run test --run`
  - `bun run typecheck`
  - `bun run qa`
- Update tracker only after all three pass.

## Definition Of Done (Per Active Component)

- `src/<component>/<component>.tsx` implemented.
- `src/<component>/<component>.class.ts` implemented.
- `src/<component>/<component>.test.tsx` implemented.
- `src/<component>/index.ts` implemented.
- root export added in `src/index.ts`.
- targeted tests pass for the component.
- no unresolved TODO markers in component public API.

## Status Tracker

### Phase Tracker

- [x] P0 complete (`tooltip`)
- [x] P1 complete (`popover`)
- [x] P2 complete (`dropdown-menu`, `context-menu`)
- [x] P3 complete (`modal`, `sheet`)
- [ ] P4 pending (overlay QA sweep, blocked by existing repo-wide failures outside overlay scope)

### Component Tracker

| Component       | Source Audit | API Contract | TSX | Class | Tests | Local Export | Root Export | QA  | Status   |
| --------------- | ------------ | ------------ | --- | ----- | ----- | ------------ | ----------- | --- | -------- |
| `context-menu`  | [x]          | [x]          | [x] | [x]   | [x]   | [x]          | [x]         | [x] | complete |
| `dropdown-menu` | [x]          | [x]          | [x] | [x]   | [x]   | [x]          | [x]         | [x] | complete |
| `modal`         | [x]          | [x]          | [x] | [x]   | [x]   | [x]          | [x]         | [x] | complete |
| `popover`       | [x]          | [x]          | [x] | [x]   | [x]   | [x]          | [x]         | [x] | complete |
| `sheet`         | [x]          | [x]          | [x] | [x]   | [x]   | [x]          | [x]         | [x] | complete |
| `tooltip`       | [x]          | [x]          | [x] | [x]   | [x]   | [x]          | [x]         | [x] | complete |
| `drawer`        | [ ]          | [ ]          | [ ] | [ ]   | [ ]   | [ ]          | [ ]         | [ ] | SKIP     |
| `toast`         | [ ]          | [ ]          | [ ] | [ ]   | [ ]   | [ ]          | [ ]         | [ ] | SKIP     |

### Change Log

- 2026-02-21: expanded overlay component test suite for parity-focused coverage (`popover`, `dropdown-menu`, `context-menu`, `modal`, `sheet`); targeted run now passes `56/56`.
- 2026-02-21: completed active overlay scope (`popover`, `dropdown-menu`, `context-menu`, `modal`, `sheet`) with tests and root exports.
- 2026-02-21: P4 sweep executed; `test --run` / `typecheck` / `qa` still blocked by existing non-overlay failures (`src/kbd/*.test`, existing class typing, and `zaidan/` lint set).
- 2026-02-21: refactored for `(SKIP)` handling and `slideover -> sheet` rename.
- 2026-02-21: added explicit Nuxt/Coss/Rock file reference map per component.
