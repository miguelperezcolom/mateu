import React from 'react'
import { createRoot } from 'react-dom/client'
import { BaseStyles, ThemeProvider } from '@primer/react'
import '@primer/primitives/dist/css/primitives.css'
import '@primer/primitives/dist/css/functional/themes/light.css'
import '@primer/primitives/dist/css/functional/themes/dark.css'
import './index.css'
import { installAnnouncer } from './shims/react-native'
import { setRendererName, setRendererVersion } from '@rn/core/buildSkew'
import { MateuPrimerApp } from './shell/MateuPrimerApp'
import { baseUrlOfPage } from './shell/pageConfig'

declare const __MATEU_RENDERER_VERSION__: string

installAnnouncer()
setRendererName('primer')
setRendererVersion(typeof __MATEU_RENDERER_VERSION__ === 'string' ? __MATEU_RENDERER_VERSION__ : 'unknown')

// the React root is its own element: the mount marker (<mateu-ui> on a served page) only names the mount
const host = document.getElementById('mateu-primer-root') ?? document.body.appendChild(document.createElement('div'))

createRoot(host).render(
  <React.StrictMode>
    <ThemeProvider colorMode="auto">
      <BaseStyles>
        <MateuPrimerApp baseUrl={baseUrlOfPage(document)} />
      </BaseStyles>
    </ThemeProvider>
  </React.StrictMode>,
)
