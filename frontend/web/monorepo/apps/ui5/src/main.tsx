import React from 'react'
import { createRoot } from 'react-dom/client'
// UI5 configuration BEFORE any web component is defined: the 72 font from THIS jar (never SAP's CDN),
// Horizon (light, dark, high contrast) and the texts + CLDR data of Mateu's six languages (src/ui5/assets.ts)
import { setDefaultFontLoading } from '@ui5/webcomponents-base/dist/config/Fonts.js'
import './ui5/assets'
import './kit/fonts.css'
import './tokens.css'
import './ui5.css'
import './index.css'
import { installAnnouncer } from '@mr/shims/react-native'
import { setRendererName, setRendererVersion } from '@rn/core/buildSkew'
import { setStreamingFetch } from '@rn/api/MateuApiClient'
import { ThemedRoot } from '@app/overrides/shell/header/theme'
import { MateuApp } from '@app/overrides/shell/MateuApp'
import { baseUrlOfPage, bundleUrlOfPage } from '@mr/shell/pageConfig'
import { openPageBundle } from '@mr/shell/staticBundle'
import { preloadCatalogue } from '@mr/views/render/catalogue'
import { signInFirst } from '@mr/shell/signIn'
import { registerTexts } from '@mr/i18n/texts'
import { RendererKitProvider, type RendererKit } from '@mr/render/RendererKit'
import { ViewBody } from '@mr/views/render/ViewBody'
import { PresenceChip } from '@mr/views/shell/header/LiveHeader'
import { UI5_TEXTS } from './i18n/ui5Texts'

declare const __MATEU_RENDERER_VERSION__: string

setDefaultFontLoading(false)
installAnnouncer()
// a browser's fetch streams its body: LongTask increments and the live-updates stream apply as they arrive
setStreamingFetch(window.fetch.bind(window))
setRendererName('ui5')
setRendererVersion(typeof __MATEU_RENDERER_VERSION__ === 'string' ? __MATEU_RENDERER_VERSION__ : 'unknown')
registerTexts(UI5_TEXTS)

// the React root is its own element: the mount marker (<mateu-ui> on a served page) only names the mount
const host = document.getElementById('mateu-ui5-root') ?? document.body.appendChild(document.createElement('div'))

const baseUrl = baseUrlOfPage(document, 'mateu-ui5')

// the views the shared hosting draws with UI5
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
        <RendererKitProvider value={KIT}>
          <MateuApp baseUrl={baseUrl} bundle={bundle} />
        </RendererKitProvider>
      </ThemedRoot>
    </React.StrictMode>,
  )
})

preloadCatalogue()
