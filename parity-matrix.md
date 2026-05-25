## Edge-case parity sweep — reference matrix

This matrix is the **canonical scope** for the edge-case parity sweep tracked in
`todo.md`. It freezes the audit boundary so downstream tasks share the same
definition of what is in-scope.

### Scope

- Existing Moraine components and shared hooks under `src/elements`,
  `src/forms`, `src/navigation`, `src/overlays`, and `src/shared`.
- Each in-scope target is mapped to its closest reference counterpart in
  [`base-ui`](./base-ui) (React, `base-ui/packages/react/src/<name>`) and
  [`kobalte`](./kobalte) (SolidJS, `kobalte/packages/core/src/<name>`).
- "—" means the reference library has no direct counterpart; behavior in that
  cell should be derived from neighboring primitives in the same library, not
  re-implemented from scratch.

### Non-goals (explicitly out of scope)

The following components do **not** exist in Moraine yet and are **out of scope**
for this sweep. Do not introduce them as part of the parity work:

- `ScrollArea` (base-ui has `scroll-area`; kobalte has none — not in Moraine)
- `OTPField` (base-ui has `otp-field` — not in Moraine)
- `Combobox` / `Autocomplete` (base-ui has `combobox` and `autocomplete`,
  kobalte has `combobox` — not in Moraine)
- Color primitives (`color-area`, `color-slider`, `color-wheel`, `color-field`,
  `color-swatch`, `color-channel-field` — kobalte only, not in Moraine)
- Date/time primitives (`time-field`, dates — not in Moraine)
- `Toast`, `Drawer` (Moraine has `Sheet`; `Toast` is not in Moraine)
- `Menubar`, `NavigationMenu`, `Toolbar` (tracked in V1 / Components section of
  `todo.md`, not in this sweep)
- `HoverCard` / `PreviewCard`, `RatingGroup`, `SegmentedControl`, `Skeleton`,
  `Meter`, `Toggle` / `ToggleGroup` (not in Moraine)

Behaviors from these references may still be **studied for inspiration** when
porting edge cases into existing Moraine components, but the components
themselves are not deliverables of this sweep.

### `src/elements`

| Moraine target | base-ui reference | kobalte reference |
| -------------- | ----------------- | ----------------- |
| `accordion`    | `accordion`       | `accordion`       |
| `avatar`       | `avatar`          | `image`           |
| `badge`        | —                 | `badge`           |
| `button`       | `button`          | `button`          |
| `card`         | —                 | —                 |
| `collapsible`  | `collapsible`     | `collapsible`     |
| `icon`         | —                 | —                 |
| `kbd`          | —                 | —                 |
| `progress`     | `progress`        | `progress`        |
| `resizable`    | —                 | —                 |
| `separator`    | `separator`       | `separator`       |

### `src/forms`

| Moraine target                                                    | base-ui reference      | kobalte reference                     |
| ----------------------------------------------------------------- | ---------------------- | ------------------------------------- |
| `checkbox`                                                        | `checkbox`             | `checkbox`                            |
| `checkbox-group`                                                  | `checkbox-group`       | `checkbox` (group via `form-control`) |
| `file-upload`                                                     | —                      | `file-field`                          |
| `form`                                                            | `form`                 | `form-control`                        |
| `form-field`                                                      | `field`, `fieldset`    | `form-control`                        |
| `input`                                                           | `input`                | `text-field`                          |
| `input-number`                                                    | `number-field`         | `number-field`, `spin-button`         |
| `radio-group`                                                     | `radio`, `radio-group` | `radio-group`                         |
| `select` (incl. `base-select`, `multi-select`, `shared/behavior`) | `select`               | `select`, `listbox`                   |
| `slider`                                                          | `slider`               | `slider`                              |
| `switch`                                                          | `switch`               | `switch`                              |
| `textarea`                                                        | `input` (semantics)    | `text-field`                          |

### `src/navigation`

| Moraine target    | base-ui reference                        | kobalte reference                                  |
| ----------------- | ---------------------------------------- | -------------------------------------------------- |
| `breadcrumb`      | —                                        | `breadcrumbs`                                      |
| `command-palette` | `menu` (typeahead/listbox patterns only) | `listbox`, `search` (listbox/search patterns only) |
| `pagination`      | —                                        | `pagination`                                       |
| `sidebar-frame`   | —                                        | —                                                  |
| `stepper`         | —                                        | —                                                  |
| `tabs`            | `tabs`                                   | `tabs`                                             |

### `src/overlays`

| Moraine target    | base-ui reference                                                                               | kobalte reference                                                                                                                                                           |
| ----------------- | ----------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `base/modal.tsx`  | `dialog`, `utils/InternalBackdrop`, `utils/useAnchoredPopupScrollLock`, `utils/useSwipeDismiss` | `dialog`, `dismissable-layer`, `primitives/create-focus-scope`, `primitives/create-hide-outside`, `primitives/create-interact-outside`, `primitives/create-escape-key-down` |
| `base/popper.tsx` | `floating-ui-react`, `utils/useAnchorPositioning`, `utils/usePositioner`                        | `popper`                                                                                                                                                                    |
| `base/menu`       | `menu`                                                                                          | `menu`                                                                                                                                                                      |
| `context-menu`    | `context-menu`                                                                                  | `context-menu`                                                                                                                                                              |
| `dialog`          | `dialog`, `alert-dialog`                                                                        | `dialog`, `alert-dialog`                                                                                                                                                    |
| `dropdown-menu`   | `menu`                                                                                          | `dropdown-menu`, `menu`                                                                                                                                                     |
| `popover`         | `popover`                                                                                       | `popover`                                                                                                                                                                   |
| `popup`           | `floating-ui-react`, `utils/usePositioner`                                                      | `popper`, `dismissable-layer`                                                                                                                                               |
| `sheet`           | `drawer`                                                                                        | `dialog` (no direct sheet; reuse dialog dismissal)                                                                                                                          |
| `tooltip`         | `tooltip`                                                                                       | `tooltip`                                                                                                                                                                   |

### `src/shared` (hooks)

| Moraine hook                           | base-ui reference                                                                              | kobalte reference                                                                       |
| -------------------------------------- | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `use-controllable-value`               | (internal `useControlled` patterns across components)                                          | `primitives/create-controllable-signal`                                                 |
| `use-disclosure-state`                 | (internal open-state mappings, `utils/collapsibleOpenStateMapping`, `utils/popupStateMapping`) | `primitives/create-disclosure-state`, `primitives/create-toggle-state`                  |
| `use-event-listener`                   | (component-local listeners)                                                                    | (component-local listeners)                                                             |
| `use-loading-auto`                     | —                                                                                              | —                                                                                       |
| `use-media-query`                      | `unstable-use-media-query`                                                                     | (i18n locale primitives only)                                                           |
| `use-selectable-collection-navigation` | `menu`, `select`, `tabs`, `toolbar` (per-component nav)                                        | `primitives/create-collection`, `primitives/create-dom-collection`, `selection`, `list` |
| `use-transition-presence`              | `utils/getDisabledMountTransitionStyles`, `utils/styles.tsx`                                   | `primitives/create-transition`                                                          |

### Acceptance

This matrix is accepted as the **canonical scope** for the edge-case parity
sweep. Any addition or removal must be reflected here before related parity
tasks are picked up.
