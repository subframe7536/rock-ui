/**
 * Composes final component props by combining Base (`B`), Variant (`V`) and
 * external Extend (`E`). Automatically omits from `E` any keys present in
 * `B & V` as well as 'children', 'class', 'style', and any `ExtraOmitKeys`.
 */
export type RockUIProps<B, V, E, ExtraOmitKeys extends keyof E = never> = B &
  V &
  Omit<E, keyof (B & V) | 'children' | 'class' | 'style' | ExtraOmitKeys>
