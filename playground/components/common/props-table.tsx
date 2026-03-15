import type { JSX } from 'solid-js'
import { For, Show, createMemo, createSignal } from 'solid-js'

interface PropMeta {
  name: string
  type: string
  optional: boolean
  description: string
  default?: string
  inherited: boolean
  inheritedFrom?: string
}

export interface PropsTableProps {
  props: PropMeta[]
}

export function PropsTable(props: PropsTableProps): JSX.Element {
  const ownProps = createMemo(() => props.props.filter((p) => !p.inherited))
  const inheritedGroups = createMemo(() => {
    const groups = new Map<string, PropMeta[]>()
    for (const p of props.props) {
      if (!p.inherited || !p.inheritedFrom) {
        continue
      }
      const list = groups.get(p.inheritedFrom) ?? []
      list.push(p)
      groups.set(p.inheritedFrom, list)
    }
    return [...groups.entries()]
  })

  return (
    <div class="flex flex-col gap-4">
      <Show when={ownProps().length > 0}>
        <PropRows props={ownProps()} />
      </Show>

      <For each={inheritedGroups()}>
        {([groupName, groupProps]) => <InheritedGroup name={groupName} props={groupProps} />}
      </For>
    </div>
  )
}

function PropRows(tableProps: { props: PropMeta[] }): JSX.Element {
  return (
    <div class="b-1 b-zinc-200/80 rounded-lg overflow-x-auto">
      <table class="text-sm w-full border-collapse">
        <thead>
          <tr class="text-xs text-zinc-500 tracking-wider text-left bg-zinc-50 uppercase">
            <th class="font-medium px-3 py-2">Prop</th>
            <th class="font-medium px-3 py-2">Type</th>
            <th class="font-medium px-3 py-2">Default</th>
            <th class="font-medium px-3 py-2">Description</th>
          </tr>
        </thead>
        <tbody>
          <For each={tableProps.props}>
            {(prop) => (
              <tr class="b-t b-zinc-100 hover:bg-zinc-50/50">
                <td class="text-xs text-primary font-mono px-3 py-2 whitespace-nowrap">
                  {prop.name}
                  {prop.optional ? '' : '*'}
                </td>
                <td class="px-3 py-2">
                  <code class="text-xs text-zinc-600 px-1.5 py-0.5 rounded bg-zinc-100">
                    {prop.type}
                  </code>
                </td>
                <td class="text-xs text-zinc-500 px-3 py-2">
                  <Show when={prop.default} fallback={<span class="text-zinc-300">—</span>}>
                    <code class="px-1.5 py-0.5 rounded bg-zinc-100">{prop.default}</code>
                  </Show>
                </td>
                <td class="text-zinc-600 px-3 py-2">{prop.description}</td>
              </tr>
            )}
          </For>
        </tbody>
      </table>
    </div>
  )
}

function InheritedGroup(groupProps: { name: string; props: PropMeta[] }): JSX.Element {
  const [open, setOpen] = createSignal(false)

  return (
    <div>
      <button
        type="button"
        class="text-xs text-zinc-500 flex gap-1.5 cursor-pointer transition-colors items-center hover:text-zinc-700"
        onClick={() => setOpen((v) => !v)}
      >
        <span
          class="inline-block transition-transform"
          style={{ transform: open() ? 'rotate(90deg)' : 'rotate(0deg)' }}
        >
          ▶
        </span>
        Inherited from <code class="text-zinc-600 font-mono">{groupProps.name}</code>
        <span class="text-zinc-400">({groupProps.props.length})</span>
      </button>

      <Show when={open()}>
        <div class="mt-2">
          <PropRows props={groupProps.props} />
        </div>
      </Show>
    </div>
  )
}
