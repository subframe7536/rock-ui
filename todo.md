# Todo

- [ ] Create a new `<BaseSelect>` component, the selection part should fully customizable via props, no preset. make `<Select>` and `<MultiSelect>` as the public wrapper.
  - Port practical Kobalte Select Root options and relative logic to `<BaseSelect>`. reference: kobalte/apps/docs/src/routes/docs/core/components/select.mdx , kobalte/packages/core/src/select/
  - Remove `openOnClick` prop and relative logic
  - Refactor `<BaseSelect />`: inline one-usage components / functions, move them into the parent component to bypass jsx props transfer. Remove `emptyRender` prop and relative logic, the empty state should be handled by `optionRender` so the `api` / `context` is useless.
  - `<Select>` JSX structure
    - when not seachable: `<div data-slot="control"><span data-slot="select-value" /><Icon /></div>`
    - when seachable: `<div data-slot="control"><input data-slot="select-value" /><Icon /></div>`. Nothing matched and dismissed will clear the input and show the placeholder again.
    - drop `allowClear` prop, the `<Icon />` is just a placeholder for down arrow, so DO NOT use `<IconButton />`
  - `<MultiSelect>` JSX structure
    - when not seachable: `<div data-slot="control"><div data-slot="tagsContainer">...</div><span data-slot="placeholder" /><IconButton /></div>`. placeholder is only shown when no value is selected, once there is a value, it will be hidden by `<Show>`
    - when seachable: `<div data-slot="control"><div data-slot="tagsContainer">...</div><input data-slot="input" /><IconButton /></div>`.
    - when `allowClear` is `true`, the `<IconButton />` will act as a clear button when tags are selected and the icon name should be `x`. when not hovered, the icon name should be `chevron-down` and it will act as a dropdown toggle button. when `allowClear` is `false`, the `<IconButton />` will always be a dropdown toggle button with `chevron-down` icon.
    - The `<IconButton />` should has full height of the control and be placed at the right end of the control.

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
