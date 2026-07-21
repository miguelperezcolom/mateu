/**
 * Boots the Redwood Spectra renderer.
 *
 * The Oracle JET / Spectra web components (oj-c-*, oj-sp-*) are AMD modules loaded from Oracle's
 * public CDN (the same source the Spectra Shell / Visual Builder pages use — referenced, never
 * bundled into this repo). Vite serves our own code as ES modules. This file bridges the two:
 *
 *   1. load RequireJS from the CDN,
 *   2. point it at the Oracle JET 19 + Spectra bundles on the CDN,
 *   3. require the OJET base + a component to force OJET's init (and its preact binding provider),
 *   4. import our ES-module entry (registers <mateu-ui> + the Redwood renderer),
 *   5. adopt the routed <mateu-ui> into #ui-container and reveal it.
 *
 * If the CDN can't be reached the app still boots with the shared base renderer (step 4 → 5), so
 * development isn't blocked by connectivity.
 */

// Oracle CDN coordinates (bump these to move JET / Spectra versions — same values as the base
// Spectra Shell HTML we started from).
const JET_CDN = 'https://static.oracle.com/cdn/jet/19.0.0/default/js'
const SPECTRA_BUNDLE_CONFIG = 'https://static.oracle.com/cdn/spectra-ui/oj-sp/2604.1.0/oj-sp-bundle-config.js'
const REQUIRE_JS = 'https://static.oracle.com/cdn/jet/19.0.0/3rdparty/require/require.js'

declare global {
  interface Window {
    require?: any
    requirejs?: any
  }
}

const loadScript = (src: string): Promise<void> =>
  new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = src
    s.async = false
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('failed to load ' + src))
    document.head.appendChild(s)
  })

/** Adopt the routed <mateu-ui> (injected by the AP controllers into the inert template) into the
 * live #ui-container, then reveal it and drop the loader. */
async function mountLitRoot() {
  await import('@/index')
  const container = document.getElementById('ui-container')
  const holder = document.getElementById('mateu-ui-holder') as HTMLTemplateElement | null
  if (container && holder && holder.content.childElementCount > 0) {
    container.appendChild(holder.content.cloneNode(true))
  }
  if (container) container.style.display = ''
  document.getElementById('landing-loader')?.remove()
}

async function loadOjet() {
  await loadScript(REQUIRE_JS)
  // The Spectra bundle config registers the require paths for both JET and the oj-sp-* components.
  await loadScript(SPECTRA_BUNDLE_CONFIG)

  const require = window.require
  if (!require) throw new Error('RequireJS did not initialise')

  require.config({
    baseUrl: JET_CDN,
    waitSeconds: 40,
  })

  await new Promise<void>((resolve, reject) => {
    // ojbootstrap + one core component is enough to spin up OJET and the preact binding provider
    // (the body already carries data-oj-binding-provider="preact").
    require(['ojs/ojbootstrap', 'oj-c/button'], () => resolve(), reject)
  })
}

async function boot() {
  try {
    await loadOjet()
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('[redwood-spectra] OJET CDN not available — falling back to the base renderer.', e)
  }
  await mountLitRoot()
}

boot()
