## Edge-case parity sweep

- [ ] Freeze the parity audit scope and reference matrix
	Scope this sweep to existing Moraine components and shared hooks under `src/elements`, `src/forms`, `src/navigation`, and `src/overlays`. Map each target to `base-ui` and `kobalte` references, and explicitly exclude new components that do not exist in Moraine yet, such as `ScrollArea`, `OTPField`, and `Combobox`.

- [ ] Align `useControllableValue` with robust controlled/uncontrolled semantics
	Add functional updater support, `Object.is` equality short-circuiting, and explicit controlled vs uncontrolled change semantics. Audit all current consumers before changing behavior, and add hook-level regression coverage so downstream components do not silently drift.

- [ ] Enhance `useSelectableCollectionNavigation` for keyboard and RTL compatibility
	Port the missing collection-navigation edge cases: orientation-aware arrow handling, RTL-aware horizontal navigation, `Home`/`End`, manual vs automatic activation, and a stable extension point for typeahead behavior.

- [ ] Port non-native button compatibility behavior into `Button`
	Make polymorphic non-native buttons behave like accessible buttons: keyboard activation with `Enter` and `Space`, correct disabled/loading interaction blocking, and compatibility with anchor rendering without leaking button-only attributes. use `callHandler` to call event listeners in props and `onClick` options with the correct event type.

- [ ] Harden `InputNumber` partial-input and locale parsing behavior
	Support incomplete but valid in-progress input states such as `-`, `.`, and locale-specific separators without forcing premature commits. Bring parsing and formatting behavior closer to the number-field references, and add regression tests for partial input and localized separators.

- [ ] Port missing `BaseSelect` compatibility and edge-case handlers
	Fill the state-machine gaps in `src/forms/select/base-select.tsx` and `src/forms/select/shared/behavior.tsx`: typeahead, search input and highlighted-option synchronization, controlled value synchronization, disabled-option skipping, and hidden form value plus ARIA consistency.

- [ ] Add `Slider` commit semantics and multi-thumb keyboard edge cases
	Separate live value updates from committed value changes, and harden multi-thumb keyboard interactions including boundary movement and thumb selection behavior.

- [ ] Bring `Tabs` navigation behavior up to parity
	Use the improved collection-navigation behavior to support orientation-aware keys, RTL handling, `Home`/`End`, and correct manual activation where focus and selected state intentionally diverge.

- [ ] Improve `Pagination` accessibility labels
	Add clearer page-item labels such as current-page announcements and “go to page” labels so the component behaves more like the stronger reference implementations without changing the public API unnecessarily.

- [ ] Stabilize overlay dismissal and focus handling in `Modal`
	Move outside-interaction, focus trap, focus restoration, and nested overlay stacking behavior toward a reusable dismiss/focus model. Prioritize `pointerdown` outside handling, trigger-content competition, and reliable focus restoration after close.

- [ ] Regress `Dialog`, `Popover`, and `DropdownMenu` against the improved overlay behavior
	Once `Modal` is stable, validate and patch its consumers. Focus on dialog close/restore behavior, menu timing and typeahead expectations, and hover-gap or safe-polygon behavior only where the current API already supports hover-driven interaction.

- [ ] Sweep remaining component-specific compatibility gaps
	Use the shared-foundation changes to clean up remaining existing components that still have behavior mismatches, especially `Switch` focus-state handling, `Accordion` DOM collection and registration-based navigation, and any other direct consumers of the updated hooks.

- [ ] Apply regression discipline for every phase
	For each task above, add or extend the narrowest failing tests first, then implement the behavior, then rerun focused tests and `bun run typecheck`. After the whole sweep is complete, run `bun run qa` and do manual regression passes for keyboard navigation, RTL, pointer types, controlled/uncontrolled transitions, form submission values, and overlay focus restoration.

# V1

- [ ] Create an `<IconButtonInner>` component with size variants for internal use without loading logic, and expose `<IconButton>` with loading logic for external use.
- [ ] Tune motion rules: interaction enter transitions should be shorter for responsiveness, exit transitions should be longer for smoothness, and shared easing should be consistent across overlays and disclosure components.

## Components

- [ ] Solid 2
- [ ] NavigationMenu
- [ ] Calendar https://ant.design/components/calendar.md
- [ ] DatePicker https://ant.design/components/date-picker.md
- [ ] Table: tanstack solid table

## Documentation

- [ ] Add documentation pages for config-driven usage, accessibility guarantees, keyboard behavior, form integration, and controlled/uncontrolled patterns.
- [ ] Add `llm.txt`.
