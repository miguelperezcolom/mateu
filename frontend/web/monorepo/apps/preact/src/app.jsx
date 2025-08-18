import { useState } from 'preact/hooks'
import preactLogo from './assets/preact.svg'
import viteLogo from '/vite.svg'
import './app.css'

export function App() {
    const [count, setCount] = useState(0)
    const [texto, setTexto] = useState('hola')


  return (
    <>

    <oj-c-button
        id="button1"
        label={ 'count is ' +  count }
        onojAction={() => setCount((count) => count + 1)}
    part="button"

    >
    <span slot='startIcon' class='oj-ux-ico-information'></span>
    </oj-c-button>

    <oj-c-input-text value="value text" label-hint="enabled"
                         onrawValueChanged={(e) => setTexto(e.detail.value)}
onChange={(e) => setTexto(e.srcElement.value)}></oj-c-input-text>
    <div>texto={texto} {count}</div>

    </>
  )
}
