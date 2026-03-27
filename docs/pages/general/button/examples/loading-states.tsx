import { Button } from '@src/elements/button/button'
import { createSignal } from 'solid-js'

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms)
  })
}

export function LoadingStates() {
  const [controlledLoading, setControlledLoading] = createSignal(false)
  const [customLoading, setCustomLoading] = createSignal(false)
  const [autoRuns, setAutoRuns] = createSignal(0)

  const runControlledLoading = async () => {
    setControlledLoading(true)
    await wait(1000)
    setControlledLoading(false)
  }

  const runCustomLoading = async () => {
    setCustomLoading(true)
    await wait(1200)
    setCustomLoading(false)
  }

  const runAutoLoading = async () => {
    await wait(2000)
    setAutoRuns((value) => value + 1)
  }

  return (
    <div class="flex flex-wrap gap-3 items-center">
      <Button
        loading={controlledLoading()}
        onClick={runControlledLoading}
        leading="i-lucide:arrow-big-down"
      >
        {controlledLoading() ? 'Processing...' : 'Controlled loading'}
      </Button>

      <Button
        loading={customLoading()}
        loadingIcon="i-lucide:loader-circle"
        variant="outline"
        onClick={runCustomLoading}
      >
        {customLoading() ? 'Syncing...' : 'Custom loading icon'}
      </Button>

      <Button
        loadingAuto
        variant="outline"
        leading="i-lucide:a-arrow-up"
        trailing="i-lucide:timer"
        onClick={runAutoLoading}
      >
        Async auto-loading ({autoRuns()})
      </Button>

      <Button disabled variant="ghost">
        Disabled
      </Button>
    </div>
  )
}
