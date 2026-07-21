/**
 * Boots the Redwood Spectra renderer.
 *
 * The Oracle JET / Spectra web components (oj-c-*, oj-sp-*) are AMD modules served from Oracle's
 * public CDN as BUNDLES (a require() for e.g. `ojs/ojbootstrap` resolves to the bundle file that
 * contains it). We load Oracle's own RequireJS bundle configs FROM the CDN — never copied here —
 * so the require paths + bundle map are always Oracle's authoritative ones. Then Vite serves our
 * own code as ES modules; this file bridges the two:
 *
 *   1. load RequireJS from the CDN,
 *   2. load the JET bundle config (configures ojs/* and oj-c/*) and the Spectra bundle config
 *      (configures oj-sp/*) — both self-execute requirejs.config against the CDN,
 *   3. require the OJET base + a component to force OJET's init (and its preact binding provider),
 *   4. import our ES-module entry (registers <mateu-ui> + the Redwood renderer),
 *   5. adopt the routed <mateu-ui> into #ui-container and reveal it.
 *
 * If the CDN can't be reached the app still boots with the shared base renderer (step 4 → 5).
 */

// Oracle CDN coordinates — the exact versions the Spectra Shell uses (bump together to move JET /
// Spectra). NOTE the JET version carries the build suffix (…-2604.8): the bundle files only exist
// under that path.
const JET_BASE = 'https://static.oracle.com/cdn/jet/19.0.0-2604.8'
const REQUIRE_JS = `${JET_BASE}/3rdparty/require/require.js`
const JET_BUNDLE_CONFIG = `${JET_BASE}/default/js/bundles-config.js`
const SPECTRA_BUNDLE_CONFIG = 'https://static.oracle.com/cdn/spectra-ui/oj-sp/2604.1.0/oj-sp-bundle-config.js'

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
  // Oracle's own require configs (paths + bundle map). They self-execute requirejs.config against
  // absolute CDN URLs, so we must NOT override require.config ourselves afterwards.
  await loadScript(JET_BUNDLE_CONFIG)
  await loadScript(SPECTRA_BUNDLE_CONFIG)

  const require = window.require
  if (!require) throw new Error('RequireJS did not initialise')

  await new Promise<void>((resolve, reject) => {
    // ojbootstrap + one core component is enough to spin up OJET and the preact binding provider
    // (the body already carries data-oj-binding-provider="preact"). Each resolves from its bundle.
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
