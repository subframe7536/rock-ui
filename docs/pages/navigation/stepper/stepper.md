:::docs-header
:::

## Import

```tsx
import { Stepper } from 'moraine'
```

## Slot Structure

Header with step items and optional per-step content panels.

```text
root
├── header
│   └── item (×n)
│       ├── container
│       │   ├── trigger
│       │   └── separator (optional, between items)
│       └── wrapper (optional)
│           ├── title (optional)
│           └── description (optional)
└── content (×n, optional)
```

## Examples

### Sizes

Preview the Stepper across all supported sizes using the default linear, non-clickable tab navigation.

:::example
name: Sizes
:::

### Controlled + Non-linear

Manage the active step externally and allow jumping to any step.

:::example
name: ControlledNonLinear
:::

### Clickable vs Non-Clickable

Compare the default non-clickable mode with explicit click-enabled navigation.

:::example
name: ClickableVsReadOnly
:::

### Linear Checkout

Enable clicking while still only allowing the next available step to be selected.

:::example
name: LinearCheckout
:::

### Vertical

Render the tab-structured step navigation vertically.

:::example
name: Vertical
:::

:::docs-api-reference
:::
