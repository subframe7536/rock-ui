Keep Moraine config-driven and styled by default. Do not add Kobalte-style primitive or compound composition APIs as a product goal.

# Current

- [ ] Make `<Select>` support single and multiple selection through shared config-driven logic, and keep `<MultiSelect>` as the public multiple-selection wrapper.
- [ ] Correct `<Select>` JSX structure based on shadcn/ui's Select: remove pointer-click focus ring, keep keyboard focus ring, and verify `aria-expanded`, `aria-controls`, `aria-activedescendant`, `role="combobox"`, `role="listbox"`, and `role="option"`.
- [ ] Port practical Kobalte Select behavior into the config API: typeahead, virtualized/large-list aria metadata, grouped options, disabled options, controlled search value, clear button, no-results state, scroll-bottom callback, and robust hidden form value handling.
- [ ] Audit all interactive components for keyboard correctness: Arrow keys, Home/End, PageUp/PageDown, Enter, Space, Escape, Tab focus exit, keyboard loop behavior, disabled item skipping, and RTL direction.
- [ ] Audit all interactive components for ARIA correctness: stable generated ids, label/description wiring, `aria-invalid`, `aria-required`, `aria-disabled`, `aria-readonly`, `aria-current`, `aria-selected`, `aria-checked`, `aria-valuemin/max/now/text`, and hidden input form submission.
- [ ] Audit controlled/uncontrolled behavior across components: `value` vs `defaultValue`, `open` vs `defaultOpen`, callback order, duplicate callback prevention, form reset behavior, and prop updates after mount.
- [ ] Audit disabled/read-only/loading states across components: prevent pointer and keyboard interaction, preserve form semantics, expose correct data attributes, and avoid focus traps on disabled controls.
- [ ] Audit overlay correctness: focus restore, focus trap, outside pointer/focus dismissal, Escape handling, nested overlays, scroll locking, portal cleanup, transition presence cleanup, and collision/flip/shift edge cases.
- [ ] Audit menu correctness: submenu pointer grace, nested submenu dismissal, checkbox item state, future radio item support, typeahead search, disabled item skipping, and close-on-select behavior.
- [ ] Audit form-field integration: generated id consistency, label click behavior, error message linkage, validation event timing, blur/change/input emission, and nested field path handling.
- [ ] Audit layout edge cases: empty items, duplicate values, missing labels, very long labels, custom JSX labels, dynamic item changes, SSR-safe document access, hydration-safe ids, and cleanup of timers/listeners/object URLs.
- [ ] Add focused tests for accessibility, keyboard navigation, form submission, controlled/uncontrolled state, disabled/read-only behavior, overlay dismissal, and edge cases before adding new visual variants.

# Component Correctness Backlog

## Accordion

- [ ] Add ArrowUp/ArrowDown/Home/End trigger navigation.
- [ ] Verify single vs multiple selection, non-collapsible single mode, disabled item behavior, and dynamic item removal.
- [ ] Ensure trigger/content ids, `aria-expanded`, `aria-controls`, and content labelling stay stable.

## Checkbox and CheckboxGroup

- [ ] Verify indeterminate state, custom true/false values, hidden input value, required behavior, and form reset.
- [ ] Add keyboard and aria tests for Space toggling, read-only prevention, disabled prevention, `aria-checked="mixed"`, and label/description linkage.

## RadioGroup

- [ ] Verify roving focus, Arrow key direction, Home/End, RTL, disabled item skipping, required semantics, and form submission.
- [ ] Add edge-case tests for empty items, duplicate values, dynamic items, controlled value updates, and read-only groups.

## Switch

- [ ] Verify `role="switch"`, `aria-checked`, Space/Enter toggling, read-only behavior, disabled behavior, hidden input value, and form reset.

## Input and Textarea

- [ ] Verify modifier handling, IME composition, `input` vs `change` timing, autofocus timing, clearable states if added, and form-field error aria wiring.
- [ ] Verify Textarea autoresize edge cases: min height, max height, dynamic value changes, SSR guards, and cleanup.

## InputNumber

- [ ] Verify min/max clamping, invalid text input, step precision, PageUp/PageDown, Home/End, wheel behavior if added, hold-repeat cleanup, and controlled raw value sync.
- [ ] Add locale-aware formatting/parsing only if it can remain simple and config-driven.

## Select and MultiSelect

- [ ] Verify keyboard behavior: ArrowUp/ArrowDown, Home/End, Enter, Space, Escape, Tab, typeahead, search input focus, and disabled option skipping.
- [ ] Verify ARIA behavior for combobox/listbox/options, active descendant, selected options, grouped options, virtualized metadata, and hidden form values.
- [ ] Verify edge cases: empty options, duplicate values, missing labels, JSX labels with `key`, async options, dynamic selected value removal, `maxCount`, token separators, `allowCreate`, clear button, and loading state.

## Slider

- [ ] Verify pointer capture, keyboard increments, PageUp/PageDown, Home/End, min steps between thumbs, thumb crossing, RTL, vertical orientation, inverted axis, read-only state, and hidden inputs.
- [ ] Verify `aria-valuemin`, `aria-valuemax`, `aria-valuenow`, `aria-valuetext`, per-thumb labels, and multi-thumb focus order.

## FileUpload

- [ ] Add max file size, min file size, file count, accepted type, and duplicate file edge-case tests.
- [ ] Verify drag enter/leave nesting, drop prevention, keyboard trigger, object URL cleanup, remove behavior, controlled value sync, and rejection payloads.

## Progress and Meter

- [ ] Verify determinate vs indeterminate aria values, custom value label, vertical orientation, invalid max/value handling, and step rendering.
- [ ] Add `<Meter>` rather than overloading `<Progress>` for scalar bounded measurements.

## Tabs

- [ ] Verify automatic vs manual activation, Arrow key direction, Home/End, disabled tab skipping, vertical orientation, dynamic items, and controlled value updates.
- [ ] Verify `role="tablist"`, `role="tab"`, `role="tabpanel"`, `aria-selected`, `aria-controls`, and panel labelling.

## Pagination

- [ ] Verify `aria-current="page"`, navigation label, disabled previous/next buttons, link mode, page clamping, total changes, sibling edge cases, and ellipsis placement.

## Breadcrumb

- [ ] Verify `aria-current="page"` for the current item, separator hiding from screen readers, link vs text item semantics, and empty/single item behavior.

## Dialog, Sheet, and Popup

- [ ] Verify focus trap, initial focus, focus restore, Escape handling, outside dismissal, non-dismissible attempts, nested dialogs, scroll locking, portal cleanup, and labelled/described-by wiring.
- [ ] Add AlertDialog with destructive action semantics, least-destructive focus option, and explicit cancel/action config.

## Popover, Tooltip, DropdownMenu, and ContextMenu

- [ ] Verify positioning updates, collision handling, viewport sizing, hidden-when-detached behavior, hover delay cleanup, focus behavior, Escape dismissal, and nested overlay interactions.
- [ ] Verify menu typeahead, submenu keyboard navigation, pointer grace, checkbox item state, future radio item support, group labels, separators, disabled items, and close-on-select config.

## Resizable

- [ ] Verify pointer and keyboard resizing, min/max/collapsible panels, percent and pixel sizes, nested groups, persistence hooks if added, RTL, and aria separator values.

# V1

## Components

- [ ] Create an `<IconButtonInner>` component with size variants for internal use without loading logic, and expose `<IconButton>` with loading logic for external use.
- [ ] Tune motion rules: interaction enter transitions should be shorter for responsiveness, exit transitions should be longer for smoothness, and shared easing should be consistent across overlays and disclosure components.
- [ ] Solid 2
- [ ] NavigationMenu
- [ ] Calendar https://ant.design/components/calendar.md
- [ ] DatePicker https://ant.design/components/date-picker.md
- [ ] Table: tanstack solid table

## Documentation

- [ ] Add documentation pages for config-driven usage, accessibility guarantees, keyboard behavior, form integration, and controlled/uncontrolled patterns.
- [ ] Add `llm.txt`.
