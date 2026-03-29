import { CommandPalette } from '@src'

export function CustomEmptyState() {
  return (
    <div class="b-1 b-border rounded-lg w-lg shadow-lg overflow-hidden">
      <CommandPalette
        items={[]}
        empty={
          <span class="flex flex-col gap-1 items-center">
            <span>Nothing here yet.</span>
            <span class="text-xs">Try a different search term.</span>
          </span>
        }
      />
    </div>
  )
}
