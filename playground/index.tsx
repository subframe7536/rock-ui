import { render } from 'solid-js/web'
import '@unocss/reset/tailwind-v4.css'
import 'uno.css'
import { Button } from '../src/button'

render(
  () => (
    <div class="flex flex-col gap-4 h-100vh w-full items-center justify-center">
      <Button
        class="text-white px-3 py-2 rounded-lg bg-slate-900"
        icon={<div class="i-lucide:arrow-down"></div>}
      >
        Button
      </Button>
    </div>
  ),
  document.getElementById('app')!,
)
