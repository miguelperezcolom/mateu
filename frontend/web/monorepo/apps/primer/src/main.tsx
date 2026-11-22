import React from 'react'
import { createRoot } from 'react-dom/client'
import { BaseStyles } from '@primer/react'
import '@primer/primitives/dist/css/primitives.css'
import '@primer/primitives/dist/css/functional/themes/light.css'
import '@primer/primitives/dist/css/functional/themes/dark.css'
import './index.css'
import { installAnnouncer } from '@mr/shims/react-native'
import { setRendererName, setRendererVersion } from '@rn/core/buildSkew'
import { setStreamingFetch } from '@rn/api/MateuApiClient'
import { ThemedRoot } from './shell/header/theme'
import { MateuPrimerApp } from './shell/MateuPrimerApp'
import { baseUrlOfPage, bundleUrlOfPage } from '@mr/shell/pageConfig'
import { openPageBundle } from '@mr/shell/staticBundle'
import { preloadCatalogue } from './render/catalogue'
import { signInFirst } from '@mr/shell/signIn'
import { RendererKitProvider, type RendererKit } from '@mr/render/RendererKit'
import { ViewBody } from './render/ViewBody'
import { PresenceChip } from './shell/header/LiveHeader'

declare const __MATEU_RENDERER_VERSION__: string

installAnnouncer()
// a browser's fetch streams its body: LongTask increments and the live-updates stream apply as they arrive
setStreamingFetch(window.fetch.bind(window))
setRendererName('primer')
setRendererVersion(typeof __MATEU_RENDERER_VERSION__ === 'string' ? __MATEU_RENDERER_VERSION__ : 'unknown')

// the React root is its own element: the mount marker (<mateu-ui> on a served page) only names the mount
const host = document.getElementById('mateu-primer-root') ?? document.body.appendChild(document.createElement('div'))

const baseUrl = baseUrlOfPage(document, 'mateu-primer')

// the views the shared hosting draws in Primer
const KIT: RendererKit = { ViewBody, PresenceChip }

// a page that declares sign-in providers signs the user in first (or completes the provider's
// callback); without them the app loads at once
void signInFirst(baseUrl).then(async (proceed) => {
  if (!proceed) return
  // a static bundle (no server behind the loads): fetched before the first render
  const bundle = await openPageBundle(bundleUrlOfPage(document))
  createRoot(host).render(
    <React.StrictMode>
      <ThemedRoot>
        <BaseStyles>
          <RendererKitProvider value={KIT}>
            <MateuPrimerApp baseUrl={baseUrl} bundle={bundle} />
          </RendererKitProvider>
        </BaseStyles>
      </ThemedRoot>
    </React.StrictMode>,
  )
})

preloadCatalogue()
