/**
 * The ONE owner of the AMD/ESM bridge to Oracle JET.
 *
 * Oracle JET / Spectra / the Dynamic UI pack (oj-c-*, oj-sp-*, oj-dynamic-*) are AMD modules served
 * from Oracle's public CDN as bundles. Our own code is ESM (Vite). This module is the single seam
 * between the two worlds: it loads RequireJS + Oracle's own bundle configs from the CDN, requires
 * the loaders once, and hands back the runtime constructors through a typed Promise —
 * `await ojRuntime.ready()`.
 *
 * This deliberately replaces the previous attempt's `window.__mateu*` global smuggling: nothing
 * reads OJET constructors off `window`; every view awaits the typed `OjRuntime` instead.
 *
 * If the CDN is unreachable, `ready()` rejects and the caller decides the fallback — but the app
 * shell (plain HTML with Redwood's own applayout CSS classes) still renders, because the shell
 * needs no OJET components.
 */

// Oracle CDN coordinates — the exact versions the Visual Builder Redwood apps use. Bump together to
// move JET / Spectra. NOTE the JET version carries the build suffix (…-2604.8): the bundle files
// only exist under that path.
const JET_VERSION = '19.0.0-2604.8'
const JET_BASE = `https://static.oracle.com/cdn/jet/${JET_VERSION}`
const SPECTRA_BASE = 'https://static.oracle.com/cdn/spectra-ui/oj-sp/2604.1.0'
const DYNAMIC_BASE = 'https://static.oracle.com/cdn/jet/packs/oj-dynamic/2604.1.0'
const REQUIRE_JS = `${JET_BASE}/3rdparty/require/require.js`
const JET_BUNDLE_CONFIG = `${JET_BASE}/default/js/bundles-config.js`
const SPECTRA_BUNDLE_CONFIG = `${SPECTRA_BASE}/oj-sp-bundle-config.js`

/** The OJET runtime pieces our views need. Constructors are unwrapped from their AMD module shape. */
export interface OjRuntime {
  /** Backs oj-c form controls (a select needs a DataProvider) and oj-dynamic-table rows. */
  ArrayDataProvider: new (data: unknown[], options?: unknown) => unknown
  /** Backs tree navs / hierarchical rows. */
  ArrayTreeDataProvider: new (data: unknown[], options?: unknown) => unknown
  /** Drives oj-dynamic-form / oj-dynamic-table from a JSON field/column metadata description.
   *  Constructed with a single config object: `{ data: { properties: { <id>: {type,labelHint,…} } } }`. */
  JsonMetadataProvider: new (config: unknown) => unknown
}

declare global {
  interface Window {
    require?: any
    requirejs?: any
  }
}

let readyPromise: Promise<OjRuntime> | null = null

const loadScript = (src: string): Promise<void> =>
  new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = src
    s.async = false
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('failed to load ' + src))
    document.head.appendChild(s)
  })

/** Unwrap the constructor from an AMD module's various export shapes (default / named / bare). */
function unwrap(mod: any, name: string): any {
  return mod?.default ?? mod?.[name] ?? mod
}

/**
 * Load Oracle JET and return the runtime constructors. Idempotent — the first call kicks off the
 * load, every later call awaits the same Promise.
 */
export function loadOjet(): Promise<OjRuntime> {
  if (readyPromise) return readyPromise
  readyPromise = (async () => {
    await loadScript(REQUIRE_JS)
    // Oracle's own require configs self-execute requirejs.config against absolute CDN URLs — we
    // never reproduce their paths/bundle map. JET config sets ojs/* + oj-c/*; Spectra config sets
    // only the oj-sp bundle MAP (module→bundle); it lazy-loads its own paths.
    await loadScript(JET_BUNDLE_CONFIG)
    await loadScript(SPECTRA_BUNDLE_CONFIG)

    const require = window.require
    if (!require) throw new Error('RequireJS did not initialise')

    // require.config MERGES paths — this only ADDS oj-sp + oj-dynamic and leaves Oracle's config
    // intact. oj-sp needs a path so its bundle files resolve; the oj-dynamic pack's runtime bundle
    // lives on the public JET CDN under /packs/.
    require.config({ paths: { 'oj-sp': SPECTRA_BASE, 'oj-dynamic': DYNAMIC_BASE } })

    return await new Promise<OjRuntime>((resolve, reject) => {
      require(
        [
          // ojbootstrap spins up OJET + its preact binding provider (body carries
          // data-oj-binding-provider="preact").
          'ojs/ojbootstrap',
          'ojs/ojarraydataprovider',
          'ojs/ojarraytreedataprovider',
          // The Dynamic UI pack: JsonMetadataProvider backs oj-dynamic-form + oj-dynamic-table; the
          // loaders register the custom elements.
          'oj-dynamic/providers/JsonMetadataProvider',
          'oj-dynamic/table/loader',
          'oj-dynamic/form/loader',
          // oj-c leaf controls used across the content views.
          'oj-c/button',
          'oj-c/input-text',
          'oj-c/input-number',
          'oj-c/select-single',
          'oj-c/checkbox',
          'oj-c/text-area',
          'oj-c/avatar',
          'oj-c/progress-bar',
          'oj-c/badge',
          'oj-c/meter-bar',
          'oj-c/tab-bar',
        ],
        (
          ojBootstrap: any,
          arrayDataProvider: any,
          arrayTreeDataProvider: any,
          jsonMetadataProvider: any,
        ) => {
          const runtime: OjRuntime = {
            ArrayDataProvider: unwrap(arrayDataProvider, 'ArrayDataProvider'),
            ArrayTreeDataProvider: unwrap(arrayTreeDataProvider, 'ArrayTreeDataProvider'),
            JsonMetadataProvider: unwrap(jsonMetadataProvider, 'JsonMetadataProvider'),
          }
          // Wait for OJET to finish its document-ready init before anyone renders a component.
          const done = () => resolve(runtime)
          if (ojBootstrap?.whenDocumentReady) ojBootstrap.whenDocumentReady().then(done, done)
          else done()
        },
        reject,
      )
    })
  })()
  return readyPromise
}

export const ojRuntime = {
  ready: (): Promise<OjRuntime> => loadOjet(),
}
