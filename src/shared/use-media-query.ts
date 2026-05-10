import { createSignal, onCleanup } from 'solid-js'
import type { Accessor } from 'solid-js'

export function createMediaQuery(query: string, defaultValue = false): Accessor<boolean> {
  const [matches, setMatches] = createSignal(defaultValue)
  if (typeof window !== 'undefined' && window.matchMedia) {
    const media = window.matchMedia(query)
    setMatches(media.matches)
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches)
    media.addEventListener('change', listener)
    onCleanup(() => media.removeEventListener('change', listener))
  }
  return matches
}
