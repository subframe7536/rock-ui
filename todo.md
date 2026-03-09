# Current

- [x] New Badge: leading, trailing, onTrailingClick, size, variant (default / outline / solid); reuse in select
- [x] New Stepper: reference from nuxt-ui/
- [x] New Resizable: only reference from `zaidan/src/registry/kobalte/ui/resizable.tsx` , use `panels` as `Array` to setuo panels, auto insert handle between panels
  - [ ] handle cannot drag
  - [ ] cascade resize
  - [ ] collapsible follow ant design

# Beta

- [ ] invalid and other boolean state should become `data-*` driven css instead of a variant in `cva`
- [ ] unify id
- [ ] refactor: overlay components should consider children as content, and provider optional trigger prop
- [ ] custom true/false value in form elements
- [ ] polish theme, like ring color etc.
- [ ] tailwind 3 preset support, remove all unocss-specific class syntax and option to simplify by transformer
- [ ] `styles: SlotStyles<SlotNames, JSX.CSSProperties>` (like `classes`)
- [ ] props jsdoc
- [ ] refine demo into doc?

# V1

- [ ] NavigationMenu
- [ ] Calendar https://ant.design/components/calendar.md
- [ ] DatePicker https://ant.design/components/date-picker.md
- [ ] Sidebar, shadcn like
- [ ] New Table: tanstack solid table

# Maybe Future

- [ ] inline/fork external libs
  - [ ] When the pointer moves from that parent item toward the submenu, the submenu closes too early before the pointer can reach it, because a different sibling menu item becomes highlighted/triggered during the pointer movement.
  - [ ] Collapsible component 's content height has not transition
  - [ ] When slider thumb overlapped, should allow to slide to any direction
  - [ ] No keyboard loop option in tab
