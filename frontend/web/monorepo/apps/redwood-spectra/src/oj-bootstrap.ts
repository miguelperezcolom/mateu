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
const SPECTRA_BASE = 'https://static.oracle.com/cdn/spectra-ui/oj-sp/2604.1.0'
const REQUIRE_JS = `${JET_BASE}/3rdparty/require/require.js`
const JET_BUNDLE_CONFIG = `${JET_BASE}/default/js/bundles-config.js`
const SPECTRA_BUNDLE_CONFIG = `${SPECTRA_BASE}/oj-sp-bundle-config.js`

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

/** Register the Redwood adapter, then adopt the routed <mateu-ui> the AP controllers injected into
 * the inert holder into #ui-container and reveal it. mateu-ui boots the neutral core, which renders
 * through the registered RedwoodComponentRenderer — now that OJET + the preact provider are ready. */
async function mountLitRoot() {
  await import('@/index') // defines <mateu-ui> + registers the RedwoodComponentRenderer
  const container = document.getElementById('ui-container')
  if (!container) return

  // The routed <mateu-ui> — adopt the AP-injected one, or a dev fallback.
  const holder = document.getElementById('mateu-ui-holder') as HTMLTemplateElement | null
  const injected = holder?.content.querySelector('mateu-ui')
  let ui: Element
  if (injected) {
    // Production: the AP-generated controller injected the routed <mateu-ui baseUrl="/route" …>.
    ui = document.importNode(injected, true)
  } else {
    // Dev / statically served dist (no AP injection): mirror the other renderers' index.html —
    // baseUrl="" (same-origin API at /mateu) + top defaulting to 'true' makes mateu-ui loadUrl(window),
    // reading the route from window.location.pathname. (config parallels apps/vaadin/index.html.)
    const el = document.createElement('mateu-ui')
    el.setAttribute('baseurl', '')
    el.setAttribute('pathprefix', '')
    el.setAttribute('config', '{"tenantId":"1111","profile":"dev"}')
    el.style.width = '100%'
    ui = el
  }

  // Mount <mateu-ui> BARE. The authentic Spectra shell (oj-sp-simple-ui-shell) is created by
  // RedwoodComponentRenderer.renderAppComponent (the App component owns the shell: globalHeader =
  // oj-sp-global-header + Ask-Oracle nav, stretchingContents = routed content). The shell's pageLayout
  // is kept in sync there via the pageLayoutSync directive (finds the descendant mateu-ux).
  container.appendChild(ui)
  container.style.display = ''
  document.getElementById('landing-loader')?.remove()
}

async function loadOjet() {
  await loadScript(REQUIRE_JS)
  // Oracle's own require configs. They self-execute requirejs.config against absolute CDN URLs, so
  // we don't reproduce their paths/bundle map. The JET config sets paths for ojs/* and oj-c/*; the
  // Spectra config only sets the oj-sp BUNDLE MAP (which module lives in which bundle) — it lazy-
  // loads its own paths, so `oj-sp` itself has no path yet and its bundle files 404.
  await loadScript(JET_BUNDLE_CONFIG)
  await loadScript(SPECTRA_BUNDLE_CONFIG)

  const require = window.require
  if (!require) throw new Error('RequireJS did not initialise')

  // Point `oj-sp` at the Spectra CDN so its bundle files resolve. require.config MERGES paths, so
  // this only adds oj-sp and leaves Oracle's JET/Spectra config intact.
  require.config({ paths: { 'oj-sp': SPECTRA_BASE } })
  // The oj-dynamic pack (Dynamic UI: oj-dynamic-table listings, oj-dyn-form forms) — a Component
  // Exchange pack, but its runtime bundle IS on the public JET CDN under /jet/packs/. Point its
  // require path there (debug/unminified so requirejs resolves the AMD modules against it).
  require.config({ paths: { 'oj-dynamic': 'https://static.oracle.com/cdn/jet/packs/oj-dynamic/2604.1.0' } })

  await new Promise<void>((resolve, reject) => {
    // ojbootstrap spins up OJET + its preact binding provider (the body carries
    // data-oj-binding-provider="preact"). ojarraydataprovider backs the oj-c form controls (its
    // constructor is stashed for the FormField template — a select needs a DataProvider). The rest
    // are the oj-sp/oj-c loaders the registered templates need — sourced from the registry so a
    // newly ported screen only adds its loader there, never here. Each resolves from its CDN bundle.
    require(
      [
        'ojs/ojbootstrap',
        'ojs/ojarraydataprovider',
        // ArrayTreeDataProvider backs the Ask-Oracle product-map nav (mateu-spectra-nav) — a tree of
        // the app menu. Stashed on window like the flat one.
        'ojs/ojarraytreedataprovider',
        // oj-dynamic pack (position 3 — captured/stashed): JsonMetadataProvider backs both the
        // oj-dynamic-table listings (mateu-spectra-table) and oj-dyn-form forms; the loaders register
        // the custom elements. Kept at position 3 so the callback can capture it positionally.
        'oj-dynamic/providers/JsonMetadataProvider',
        'oj-dynamic/table/loader',
        'oj-dynamic/form/loader',
        // The authentic Redwood page frame: the Spectra shell owns the fixed/full/edge width anatomy
        // (applied in RedwoodComponentRenderer.renderAppComponent). css-additions injects the shell
        // layout CSS the pageLayout width classes resolve their rules from.
        'oj-sp/css-additions/loader',
        'oj-sp/simple-ui-shell/loader',
        // Authentic app shell chrome: the Redwood global header + the Ask-Oracle product-map nav
        // (renderAppComponent's globalHeader + mateu-spectra-nav).
        'oj-sp/global-header/loader',
        'oj-sp/ask-oracle-product-map/loader',
        // oj-c form controls used by the Redwood FormField widget (renderRedwoodField).
        'oj-c/button',
        'oj-c/input-text',
        'oj-c/input-number',
        'oj-c/select-single',
        // oj-c leaf display components (renderRedwoodLeaves).
        'oj-c/avatar',
        'oj-c/progress-bar',
        'oj-c/badge',
        'oj-c/meter-bar',
        'oj-c/tab-bar',
        // oj-sp dashboard leaf components (renderRedwoodDashboard).
        'oj-sp/dashboard-panel/loader',
        'oj-sp/scoreboard-metric-card/loader',
        // oj-sp foldout page (renderRedwoodFoldout).
        'oj-sp/foldout-layout/loader',
        'oj-sp/foldout-panel-summarizing/loader',
        // oj-sp welcome/hero page (renderRedwoodWelcome).
        'oj-sp/welcome-page/loader',
        // oj-sp empty state (renderRedwoodEmptyState) + section (renderRedwoodSection).
        'oj-sp/empty-state/loader',
        'oj-sp/section/loader',
        // oj-sp breadcrumbs (renderRedwoodBreadcrumbs) — data-driven via ojarraydataprovider (above).
        'oj-sp/breadcrumb-container/loader',
      ],
      (
        _bootstrap: unknown,
        arrayDataProvider: unknown,
        arrayTreeDataProvider: unknown,
        jsonMetadataProvider: unknown,
      ) => {
        const adp = arrayDataProvider as { default?: unknown; ArrayDataProvider?: unknown }
        ;(window as unknown as { __mateuArrayDataProvider?: unknown }).__mateuArrayDataProvider =
          adp?.default ?? adp?.ArrayDataProvider ?? arrayDataProvider
        const atdp = arrayTreeDataProvider as { default?: unknown; ArrayTreeDataProvider?: unknown }
        ;(window as unknown as { __mateuArrayTreeDataProvider?: unknown }).__mateuArrayTreeDataProvider =
          atdp?.default ?? atdp?.ArrayTreeDataProvider ?? arrayTreeDataProvider
        const jmp = jsonMetadataProvider as { default?: unknown; JsonMetadataProvider?: unknown }
        ;(window as unknown as { __mateuJsonMetadataProvider?: unknown }).__mateuJsonMetadataProvider =
          jmp?.default ?? jmp?.JsonMetadataProvider ?? jsonMetadataProvider
        resolve()
      },
      reject,
    )
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
