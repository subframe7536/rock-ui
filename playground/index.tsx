import '@unocss/reset/tailwind-v4.css'
import 'uno.css'

import { render } from 'solid-js/web'

import { ButtonDemos } from './components/button-demos'

function App() {
  return <ButtonDemos />
}

render(() => <App />, document.getElementById('app')!)
