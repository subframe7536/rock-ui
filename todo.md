# Todo

- [ ] Make `<Select>` support single and multiple selection through shared config-driven logic, and keep `<MultiSelect>` as the public multiple-selection wrapper.
- [ ] Correct `<Select>` JSX structure based on shadcn/ui's Select: remove pointer-click focus ring, keep keyboard focus ring, and verify `aria-expanded`, `aria-controls`, `aria-activedescendant`, `role="combobox"`, `role="listbox"`, and `role="option"`.
- [ ] Port practical Kobalte Select behavior into the config API: typeahead, virtualized/large-list aria metadata, grouped options, disabled options, controlled search value, clear button, no-results state, scroll-bottom callback, and robust hidden form value handling.

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
