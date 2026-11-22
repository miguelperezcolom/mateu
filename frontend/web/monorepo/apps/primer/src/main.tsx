import React from 'react'
import { createRoot } from 'react-dom/client'
import { BaseStyles } from '@primer/react'
import '@primer/primitives/dist/css/primitives.css'
import '@primer/primitives/dist/css/functional/themes/light.css'
import '@primer/primitives/dist/css/functional/themes/dark.css'
import './index.css'
import { installAnnouncer } from './shims/react-native'
import { setRendererName, setRendererVersion } from '@rn/core/buildSkew'
import { setStreamingFetch } from '@rn/api/MateuApiClient'
import { ThemedRoot } from './shell/header/theme'
import { MateuPrimerApp } from './shell/MateuPrimerApp'
import { baseUrlOfPage } from './shell/pageConfig'
import { preloadCatalogue } from './render/catalogue'

declare const __MATEU_RENDERER_VERSION__: string

installAnnouncer()
// a browser's fetch streams its body: LongTask increments and the live-updates stream apply as they arrive
setStreamingFetch(window.fetch.bind(window))
setRendererName('primer')
setRendererVersion(typeof __MATEU_RENDERER_VERSION__ === 'string' ? __MATEU_RENDERER_VERSION__ : 'unknown')

// the React root is its own element: the mount marker (<mateu-ui> on a served page) only names the mount
const host = document.getElementById('mateu-primer-root') ?? document.body.appendChild(document.createElement('div'))

createRoot(host).render(
  <React.StrictMode>
    <ThemedRoot>
      <BaseStyles>
        <MateuPrimerApp baseUrl={baseUrlOfPage(document)} />
      </BaseStyles>
    </ThemedRoot>
  </React.StrictMode>,
)

// the catalogue families a screen did not need yet, fetched while the browser is idle
preloadCatalogue()
