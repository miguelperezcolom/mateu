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
const WIRE_TO_PAGELAYOUT: Record<string, string> = {
  fixed: 'fixedWidth',
  full: 'fullWidth',
  edge: 'edgeToEdge',
}

/** Keep the shell's `pageLayout` in sync with the RDS page-width the core resolves per route and
 * stamps as `data-page-width` on <mateu-ux> (which lives inside <mateu-ui>'s shadow root). Poll until
 * mateu-ux exists, then a MutationObserver tracks it across navigations. */
function syncPageLayout(shell: HTMLElement & { pageLayout?: string }, ui: Element): void {
  // mateu-ui renders in LIGHT DOM by default (no shadow root), so mateu-ux is a light-DOM descendant;
  // check the shadow root too in case a future config turns shadow DOM on.
  const findUx = (): Element | null =>
    (ui as HTMLElement & { shadowRoot?: ShadowRoot }).shadowRoot?.querySelector('mateu-ux') ??
    ui.querySelector('mateu-ux')
  const read = () => {
    const ux = findUx()
    const mode = ux?.getAttribute('data-page-width') // 'fixed' | 'full' | 'edge'
    const layout = mode ? WIRE_TO_PAGELAYOUT[mode] : undefined
    if (layout) shell.pageLayout = layout
    // The content cap element `.oj-sp-rw-ask-oracle-page-container` reads the shell's width VARS via
    // `max-width: var(--oj-sp-simple-uishell-max-content-width)` etc. In fixedWidth it inherits the
    // :root defaults (1392 cap, auto margins, 24px gutters). But the shell's pageLayout override of
    // those vars (set on its stretching container) doesn't reach our slotted content in the post-mount
    // flow, so drive the vars DIRECTLY on the page container for full/edge (uses the shell's own rule).
    const pc = shell.querySelector('.oj-sp-rw-ask-oracle-page-container') as HTMLElement | null
    if (pc && layout) {
      if (layout === 'fullWidth' || layout === 'edgeToEdge') {
        pc.style.setProperty('--oj-sp-simple-uishell-max-content-width', '100%')
        pc.style.setProperty('--oj-sp-simple-uishell-max-content-width-margin', '0')
        pc.style.setProperty('--oj-sp-simple-uishell-max-content-width-padding', layout === 'edgeToEdge' ? '0' : '24px')
      } else {
        pc.style.removeProperty('--oj-sp-simple-uishell-max-content-width')
        pc.style.removeProperty('--oj-sp-simple-uishell-max-content-width-margin')
        pc.style.removeProperty('--oj-sp-simple-uishell-max-content-width-padding')
      }
    }
  }
  let observer: MutationObserver | undefined
  let ticks = 0
  const timer = setInterval(() => {
    const ux = findUx()
    if (ux && !observer) {
      observer = new MutationObserver(read)
      observer.observe(ux, { attributes: true, attributeFilter: ['data-page-width'] })
      read()
    }
    if (observer || ++ticks > 60) clearInterval(timer)
  }, 250)
}

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

  // Wrap the whole routed UI in the AUTHENTIC Spectra shell — it owns the RDS page frame (fixed cap
  // 1408/centered · full · edge-to-edge). The content must live inside `.oj-sp-rw-ask-oracle-page-
  // container` (the element the shell CSS applies the max-width cap to); the shell's `pageLayout`
  // (synced from the wire page width) drives which of the three modes.
  const pageContainer = document.createElement('div')
  pageContainer.setAttribute('slot', 'stretchingContents')
  pageContainer.className = 'oj-sp-rw-ask-oracle-page-container'
  pageContainer.appendChild(ui)

  const shell = document.createElement('oj-sp-simple-ui-shell') as HTMLElement & { pageLayout?: string }
  shell.appendChild(pageContainer)
  container.appendChild(shell)
  shell.pageLayout = 'fixedWidth'
  syncPageLayout(shell, ui)

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
        // The authentic Redwood page frame: the Spectra shell owns the fixed/full/edge width anatomy
        // (applied in RedwoodComponentRenderer.renderAppComponent). css-additions injects the shell
        // layout CSS the pageLayout width classes resolve their rules from.
        'oj-sp/css-additions/loader',
        'oj-sp/simple-ui-shell/loader',
        // oj-c form controls used by the Redwood FormField widget (renderRedwoodField).
        'oj-c/input-text',
        'oj-c/input-number',
        'oj-c/select-single',
        // oj-sp dashboard leaf components (renderRedwoodDashboard).
        'oj-sp/dashboard-panel/loader',
        'oj-sp/scoreboard-metric-card/loader',
        // oj-sp foldout page (renderRedwoodFoldout).
        'oj-sp/foldout-layout/loader',
        'oj-sp/foldout-panel-summarizing/loader',
        // oj-sp welcome/hero page (renderRedwoodWelcome).
        'oj-sp/welcome-page/loader',
      ],
      (_bootstrap: unknown, arrayDataProvider: unknown) => {
        const adp = arrayDataProvider as { default?: unknown; ArrayDataProvider?: unknown }
        ;(window as unknown as { __mateuArrayDataProvider?: unknown }).__mateuArrayDataProvider =
          adp?.default ?? adp?.ArrayDataProvider ?? arrayDataProvider
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
