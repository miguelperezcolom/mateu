import React from 'react'
import { createRoot } from 'react-dom/client'
import { BaseStyles } from '@kit'
import './kit/slds.css'
import './index.css'
import { installAnnouncer } from '@mr/shims/react-native'
import { setRendererName, setRendererVersion } from '@rn/core/buildSkew'
import { setStreamingFetch } from '@rn/api/MateuApiClient'
import { ThemedRoot } from '@mr/views/shell/header/theme'
import { MateuApp } from '@mr/views/shell/MateuApp'
import { sldsAccent } from './accent'
import { baseUrlOfPage, bundleUrlOfPage } from '@mr/shell/pageConfig'
import { openPageBundle } from '@mr/shell/staticBundle'
import { preloadCatalogue } from '@mr/views/render/catalogue'
import { installCustomComponentGlobal } from '@mr/views/render/catalogue/custom'
import { signInFirst } from '@mr/shell/signIn'
import { RendererKitProvider, type RendererKit } from '@mr/render/RendererKit'
import { registerTexts } from '@mr/i18n/texts'
import { SLDS_TEXTS } from './i18n/sldsTexts'
import { ViewBody } from '@mr/views/render/ViewBody'
import { PresenceChip } from '@mr/views/shell/header/LiveHeader'

/**
 * The Salesforce renderer: the shared views (frontend/web/react-renderer/views) drawn with the SLDS
 * kit (src/kit: the Lightning Design System's blueprints as React components), plus the few
 * overrides where SLDS's structure differs (src/overrides — the Global Header shell, cards, the
 * combobox trigger, Path, the pickers…).
 */
declare const __MATEU_RENDERER_VERSION__: string

installAnnouncer()
// a browser's fetch streams its body: LongTask increments and the live-updates stream apply as they arrive
setStreamingFetch(window.fetch.bind(window))
setRendererName('slds')
// an app's own CustomComponent renderers: window.MateuSlds.registerCustomComponent(name, renderer)
installCustomComponentGlobal('MateuSlds')
setRendererVersion(typeof __MATEU_RENDERER_VERSION__ === 'string' ? __MATEU_RENDERER_VERSION__ : 'unknown')
registerTexts(SLDS_TEXTS)

// the React root is its own element: the mount marker (<mateu-ui> on a served page) only names the mount
const host = document.getElementById('mateu-slds-root') ?? document.body.appendChild(document.createElement('div'))

const baseUrl = baseUrlOfPage(document, 'mateu-slds')

// the views the shared hosting draws with SLDS
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
            <MateuApp baseUrl={baseUrl} bundle={bundle} accentCss={sldsAccent} />
          </RendererKitProvider>
        </BaseStyles>
      </ThemedRoot>
    </React.StrictMode>,
  )
})

preloadCatalogue()
