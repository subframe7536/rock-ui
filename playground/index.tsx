import '@unocss/reset/tailwind-v4.css'
import 'uno.css'

import { render } from 'solid-js/web'

import { FormDemos } from './components/form-demos'

function App() {
  return <FormDemos />
}

render(() => <App />, document.getElementById('app')!)
