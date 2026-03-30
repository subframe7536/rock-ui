import { createSignal, onCleanup, onMount } from 'solid-js'

export interface OnThisPageEntry {
  id: string
  label: string
  level: number
}

function decodeHashAnchor(hash: string): string {
  if (!hash) {
    return ''
  }
  try {
    return decodeURIComponent(hash)
  } catch {
    return hash
  }
}

export function useTableOfContents(getEntries: () => OnThisPageEntry[]) {
  const [activeId, setActiveId] = createSignal('')

  const setActiveIdIfChanged = (nextId: string) => {
    if (nextId !== activeId()) {
      setActiveId(nextId)
    }
  }

  const scrollToAnchor = () => {
    const hash = decodeHashAnchor(location.hash.slice(1))
    if (!hash) {
      return true
    }

    const target = document.getElementById(hash)
    if (!target) {
      return false
    }
    target.scrollIntoView?.()
    return true
  }

  onMount(() => {
    const entries = getEntries()

    const syncActiveIdWithHashWithEntries = () => {
      const hash = decodeHashAnchor(location.hash.slice(1))
      if (!hash) {
        setActiveIdIfChanged(entries[0]?.id ?? '')
        return
      }

      setActiveIdIfChanged(hash)
    }

    syncActiveIdWithHashWithEntries()
    scrollToAnchor()

    const scrollRoot = document.querySelector<HTMLElement>('[data-docs-scroll-root="true"]')
    const observer =
      typeof IntersectionObserver === 'function' && entries.length > 0
        ? new IntersectionObserver(
            (intersectingEntries) => {
              let bestId = ''
              let bestTop = Number.POSITIVE_INFINITY

              for (const entry of intersectingEntries) {
                if (!entry.isIntersecting) {
                  continue
                }
                const top = entry.boundingClientRect.top
                if (top < bestTop) {
                  bestTop = top
                  bestId = (entry.target as HTMLElement)?.id ?? ''
                }
              }

              if (bestId) {
                setActiveIdIfChanged(bestId)
              }
            },
            {
              root: scrollRoot,
              rootMargin: '0px',
              threshold: 0.98,
            },
          )
        : null

    if (observer) {
      for (const entry of entries) {
        const target = document.getElementById(entry.id)
        if (target) {
          observer.observe(target)
        }
      }
    }

    const handleHashChange = () => {
      scrollToAnchor()
      syncActiveIdWithHashWithEntries()
    }

    window.addEventListener('hashchange', handleHashChange)
    onCleanup(() => {
      window.removeEventListener('hashchange', handleHashChange)
      observer?.disconnect()
    })
  })

  return { activeId }
}
