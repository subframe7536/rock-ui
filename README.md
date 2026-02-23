# Rock UI

Opinioned component library for solid.js, with style/base component sourcing from `zaidan/` (Kobalte-powered primitives)

## Breaking Changes

### 2026-02-22

- Overlay `arrow` support has been hard-removed from public APIs and runtime rendering paths (`Popover`, `Tooltip`, `DropdownMenu`, `ContextMenu`, and shared overlay menu contracts).
- Kobalte-backed components now type exported props as `RockBaseProps + Omit<KobalteRootProps, ...>` and no longer extend `JSX.*HTMLAttributes` directly.
- Components without a direct Kobalte root primitive (`Card`, `CheckboxGroup`, `FieldGroup`, `Form`, `FormField`, `Icon`, `Kbd`) no longer accept generic HTML passthrough props; only explicit Rock props are supported.
- `Input` and `Textarea` now use Kobalte `TextFieldRootProps`-based typing plus explicit Rock props, instead of direct `JSX.InputHTMLAttributes` / `JSX.TextareaHTMLAttributes` extension.
- Where slot-style APIs are used, `class` passthrough remains intentionally unsupported in favor of `classes.*` overrides.
