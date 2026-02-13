# Nuxt UI Real Component Dependency Graph (Scoped 58)

Derived from source imports in `nuxt-ui/src/runtime/components/<Pascal>.vue` for components listed in `plans/todo-*.md`.

## Method

- Edge rule: `A -> B` when `A.vue` directly imports `./B.vue`.
- Graph scope: only `layout`, `element`, `form`, `navigation`, `overlay` todo components.
- `Out-of-scope deps` are local runtime components imported by scoped components but not in the 58 target set.

## Global Edges (Within Scoped 58)

- `error -> button`
- `footer -> container`
- `header -> button`
- `header -> container`
- `header -> drawer`
- `header -> link`
- `header -> modal`
- `header -> slideover`
- `alert -> avatar`
- `alert -> button`
- `alert -> icon`
- `avatar -> chip`
- `avatar -> icon`
- `avatar-group -> avatar`
- `badge -> avatar`
- `badge -> icon`
- `banner -> button`
- `banner -> container`
- `banner -> icon`
- `banner -> link`
- `button -> avatar`
- `button -> icon`
- `button -> link`
- `calendar -> button`
- `separator -> avatar`
- `separator -> icon`
- `checkbox -> icon`
- `checkbox-group -> checkbox`
- `file-upload -> avatar`
- `file-upload -> button`
- `file-upload -> icon`
- `input -> avatar`
- `input -> icon`
- `input-date -> avatar`
- `input-date -> icon`
- `input-menu -> avatar`
- `input-menu -> button`
- `input-menu -> chip`
- `input-menu -> icon`
- `input-number -> button`
- `input-tags -> avatar`
- `input-tags -> icon`
- `input-time -> avatar`
- `input-time -> icon`
- `select -> avatar`
- `select -> chip`
- `select -> icon`
- `select-menu -> avatar`
- `select-menu -> button`
- `select-menu -> chip`
- `select-menu -> icon`
- `select-menu -> input`
- `slider -> tooltip`
- `switch -> icon`
- `textarea -> avatar`
- `textarea -> icon`
- `breadcrumb -> avatar`
- `breadcrumb -> icon`
- `breadcrumb -> link`
- `command-palette -> avatar`
- `command-palette -> button`
- `command-palette -> chip`
- `command-palette -> icon`
- `command-palette -> input`
- `command-palette -> kbd`
- `command-palette -> link`
- `footer-columns -> icon`
- `footer-columns -> link`
- `navigation-menu -> avatar`
- `navigation-menu -> badge`
- `navigation-menu -> icon`
- `navigation-menu -> link`
- `navigation-menu -> popover`
- `navigation-menu -> tooltip`
- `pagination -> button`
- `stepper -> icon`
- `tabs -> avatar`
- `tabs -> badge`
- `tabs -> icon`
- `modal -> button`
- `slideover -> button`
- `toast -> avatar`
- `toast -> button`
- `toast -> icon`
- `toast -> progress`
- `tooltip -> kbd`

## Layout

| Component | Scoped deps | Out-of-scope deps |
| --- | --- | --- |
| `app` | — | `OverlayProvider`, `Toaster` |
| `container` | — | — |
| `error` | `button` | — |
| `footer` | `container` | — |
| `header` | `button`, `container`, `drawer`, `link`, `modal`, `slideover` | — |
| `main` | — | — |
| `theme` | — | — |

## Element

| Component | Scoped deps | Out-of-scope deps |
| --- | --- | --- |
| `alert` | `avatar`, `button`, `icon` | — |
| `avatar` | `chip`, `icon` | — |
| `avatar-group` | `avatar` | — |
| `badge` | `avatar`, `icon` | — |
| `banner` | `button`, `container`, `icon`, `link` | — |
| `button` | `avatar`, `icon`, `link` | `LinkBase` |
| `calendar` | `button` | — |
| `card` | — | — |
| `chip` | — | — |
| `collapsible` | — | — |
| `field-group` | — | — |
| `icon` | — | — |
| `kbd` | — | — |
| `progress` | — | — |
| `separator` | `avatar`, `icon` | — |
| `skeleton` | — | — |

## Form

| Component | Scoped deps | Out-of-scope deps |
| --- | --- | --- |
| `checkbox` | `icon` | — |
| `checkbox-group` | `checkbox` | — |
| `color-picker` | — | — |
| `file-upload` | `avatar`, `button`, `icon` | — |
| `form` | — | — |
| `form-field` | — | — |
| `input` | `avatar`, `icon` | — |
| `input-date` | `avatar`, `icon` | — |
| `input-menu` | `avatar`, `button`, `chip`, `icon` | — |
| `input-number` | `button` | — |
| `input-tags` | `avatar`, `icon` | — |
| `input-time` | `avatar`, `icon` | — |
| `pin-input` | — | — |
| `radio-group` | — | — |
| `select` | `avatar`, `chip`, `icon` | — |
| `select-menu` | `avatar`, `button`, `chip`, `icon`, `input` | — |
| `slider` | `tooltip` | — |
| `switch` | `icon` | — |
| `textarea` | `avatar`, `icon` | — |

## Navigation

| Component | Scoped deps | Out-of-scope deps |
| --- | --- | --- |
| `breadcrumb` | `avatar`, `icon`, `link` | `LinkBase` |
| `command-palette` | `avatar`, `button`, `chip`, `icon`, `input`, `kbd`, `link` | `LinkBase` |
| `footer-columns` | `icon`, `link` | `LinkBase` |
| `link` | — | `LinkBase` |
| `navigation-menu` | `avatar`, `badge`, `icon`, `link`, `popover`, `tooltip` | `LinkBase` |
| `pagination` | `button` | — |
| `stepper` | `icon` | — |
| `tabs` | `avatar`, `badge`, `icon` | — |

## Overlay

| Component | Scoped deps | Out-of-scope deps |
| --- | --- | --- |
| `context-menu` | — | `ContextMenuContent` |
| `drawer` | — | — |
| `dropdown-menu` | — | `DropdownMenuContent` |
| `modal` | `button` | — |
| `popover` | — | — |
| `slideover` | `button` | — |
| `toast` | `avatar`, `button`, `icon`, `progress` | — |
| `tooltip` | `kbd` | — |

## Out-of-Scope Runtime Components Referenced

- `ContextMenuContent`
- `DropdownMenuContent`
- `LinkBase`
- `OverlayProvider`
- `Toaster`
