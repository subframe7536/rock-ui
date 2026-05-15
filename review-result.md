# Review Report

[review.md](./review.md)

## Confirmed Completed

- `Select` and `MultiSelect` are already built on shared config-driven logic, with shared option normalization, filtering, popup control, and form-field integration in [src/forms/select/select.tsx](/Users/subf/Developer/project/moraine/src/forms/select/select.tsx) and [src/forms/select/shared/behavior.ts](/Users/subf/Developer/project/moraine/src/forms/select/shared/behavior.ts).
- `FormField` integration is already in place, including generated ids, label wiring, validation state, and nested path handling in [src/forms/form-field/form-field.tsx](/Users/subf/Developer/project/moraine/src/forms/form-field/form-field.tsx) and [src/forms/form/form.tsx](/Users/subf/Developer/project/moraine/src/forms/form/form.tsx).
- `Dialog`, `Sheet`, and `Popup` are already assembled on a shared modal base that handles open state, outside dismissal, Escape handling, scroll locking, focus restore, portal cleanup, and aria wiring in [src/overlays/base/modal.tsx](/Users/subf/Developer/project/moraine/src/overlays/base/modal.tsx).
- `Popover`, `Tooltip`, `DropdownMenu`, `ContextMenu`, and the shared overlay menu layer are already implemented on the floating-positioning and menu base in [src/overlays/base/popper.tsx](/Users/subf/Developer/project/moraine/src/overlays/base/popper.tsx) and [src/overlays/base/menu/menu.tsx](/Users/subf/Developer/project/moraine/src/overlays/base/menu/menu.tsx).
- `Button`, `Icon`, `Badge`, `Card`, `Separator`, and `Collapsible` are already present and stable in [src/elements/button/button.tsx](/Users/subf/Developer/project/moraine/src/elements/button/button.tsx), [src/elements/icon/icon.tsx](/Users/subf/Developer/project/moraine/src/elements/icon/icon.tsx), [src/elements/badge/badge.tsx](/Users/subf/Developer/project/moraine/src/elements/badge/badge.tsx), [src/elements/card/card.tsx](/Users/subf/Developer/project/moraine/src/elements/card/card.tsx), [src/elements/separator/separator.tsx](/Users/subf/Developer/project/moraine/src/elements/separator/separator.tsx), and [src/elements/collapsible/collapsible.tsx](/Users/subf/Developer/project/moraine/src/elements/collapsible/collapsible.tsx).

## Partial Or Missing

- `Select` and `MultiSelect` already cover combobox/listbox/option roles, `aria-controls`, `aria-activedescendant`, grouped options, disabled options, controlled search value, clear button, empty state, scroll-bottom callback, and virtualized-style aria metadata, but async options support was not found and the hidden form value behavior is form-field driven rather than a native hidden-input submission path.
- `Select` pointer-click focus-ring behavior is implemented in the control logic, but there is no dedicated regression test proving the pointer ring is absent while keyboard focus ring remains.
- `Accordion` still lacks ArrowUp/ArrowDown/Home/End trigger navigation. Current behavior only covers basic toggle and expansion state.
- `Checkbox` and `CheckboxGroup` already cover core semantics, but the backlog items for Space-key coverage, disabled prevention, and full form-reset verification still need sharper regression tests.
- `RadioGroup` already covers roving focus, Arrow/Home/End, aria wiring, and form integration, but RTL handling and some edge-case item behaviors are still incomplete.
- `Switch` already covers role and aria wiring, but the backlog still calls for explicit keyboard and reset coverage.
- `Input` and `Textarea` are largely implemented, but IME composition, cleanup, and SSR-guard edge cases still need stronger verification; `Textarea` autoresize cleanup and SSR guard were not found as explicit safeguards.
- `InputNumber` covers clamping, keyboard increments, step precision, and controlled synchronization, but wheel behavior and locale-aware parsing/formatting are still absent.
- `FileUpload` covers drag/drop, removal, object URL cleanup, and form integration, but min/max file size and duplicate-file rejection behavior are still missing.
- `Slider` already covers pointer capture, keyboard increments, thumb crossing, vertical and inverted axes, and aria values, but RTL, PageUp/PageDown, and read-only edge coverage still needs either implementation or explicit tests.
- `Tabs`, `Pagination`, `Breadcrumb`, and `Progress` are implemented, but the backlog still includes stronger edge-case tests for disabled skipping, dynamic items, total changes, sibling edge cases, and progress-related value semantics.
- `Dialog`, `Sheet`, `Popup`, `Popover`, and `Tooltip` already work, but dedicated tests for initial focus, focus trap looping, and some positioning edge cases are still missing.
- `DropdownMenu` and `ContextMenu` already cover most menu behavior, but radio item support is not implemented yet.
- `Resizable` already covers pointer and keyboard resizing, min/max, collapsible panels, and nested groups, but RTL and persistence hooks are still absent.
- `IconButtonInner` does not exist yet; `IconButton` still includes loading logic inline.

## Inaccurate

- The `Breadcrumb` comment that mentions “collapsible overflow” is misleading because the implementation does not currently include breadcrumb overflow collapsing.
- The `Stepper` documentation language is more aspirational than precise in places; the component is tab-structured interactive navigation, not a generic read-only progress indicator.

## Verification Notes

- The repository is currently green: `bun run test --run` passed all tests.
- The audit results are therefore based on both source inspection and the full test suite.
