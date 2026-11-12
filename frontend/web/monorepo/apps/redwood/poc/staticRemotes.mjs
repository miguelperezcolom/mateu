// STATIC REMOTES: a federated shell (RemoteMenu) can mount a domain that has no backend at all — its
// static bundle. Its base url then names the bundle's manifest (`…/catalog/manifest.json`) instead
// of a server, and every LOAD the shell aims at it is answered from that manifest: a pre-rendered
// answer, a :param template, or — a `specsOnly` bundle — the RAW YAML definition expanded here, in
// the browser. The rules are the web renderers' own (libs/mateu bundleResolver.ts + the expander),
// packaged as poc/vendor/bundleResolver.mjs by make-expander.mjs, so both renderers answer a static
// remote identically. The remote's REST sources join the catalogue as named sources (what its
// screens reference by `ref`); its actions have no server to go to (transport.mjs refuses them).
// Each remote keeps its own parsed state; the page's own bundle (bundle.mjs) is untouched.
import { mateuBundleResolver } from './vendor/bundleResolver.mjs'
import { adoptReferencedSources } from './restSources.mjs'

const staticRemoteBundles = new Map()

/** Loads (once) the manifest a static remote's base url names; null when it cannot be read. A
 *  failed load is asked again next time (the remote-menu retry), never cached. */
export function loadStaticRemote(url, fetchImpl) {
  const doFetch = fetchImpl || (typeof fetch === 'function' ? fetch : null)
  let loading = staticRemoteBundles.get(url)
  if (!loading) {
    loading = (async () => {
      try {
        const res = await doFetch(url)
        if (!res || !res.ok) return null
        const manifest = await res.json()
        if (!mateuBundleResolver.isBundleManifest(manifest)) return null
        const parsed = mateuBundleResolver.parseBundleManifest(manifest)
        const sources = manifest.sources && Array.isArray(manifest.sources.sources) ? manifest.sources.sources : []
        if (sources.length) adoptReferencedSources({ restSources: sources })
        return parsed
      } catch (e) {
        try { console.warn('mateu: static remote manifest load failed', url, e) } catch (ignored) { /* no console */ }
        return null
      }
    })()
    const settled = loading
    settled.then((parsed) => { if (!parsed && staticRemoteBundles.get(url) === settled) staticRemoteBundles.delete(url) })
    staticRemoteBundles.set(url, settled)
  }
  return loading
}

/** `${i18n.…}` of a remote's answer resolved with ITS translations, for the page's language. */
function localizerOf(state) {
  const translations = (state && state.translations) || {}
  const r = mateuBundleResolver
  return (value) => {
    if (value === undefined || !Object.keys(translations).length || !r.mentionsI18n(value)) return value
    const lang = typeof document !== 'undefined' && document.documentElement ? document.documentElement.lang : undefined
    const locale = r.pickLocale(translations, [lang, ...r.browserLocales()])
    const fallback = r.pickLocale(translations, [])
    return r.translateDeep(value, locale ? translations[locale] : undefined,
      fallback && fallback !== locale ? translations[fallback] : undefined)
  }
}

/**
 * A static remote's answer to a route LOAD (actionId ''), with the same rules as the web's
 * resolveRemoteBundledLoad: the FRESH load (`consumedRoute` absent or '_empty' — the shell asking
 * for the remote's app, its menu) answers the remote's app shell; a CONTENT load answers the
 * screen; the remote mounted at its ROOT as content is its home screen, never its own shell nested
 * in the shell's. Fragments without a target go to `initiator`. null when the manifest cannot be
 * read or does not answer the route.
 */
export async function staticRemoteLoad(url, route, consumedRoute, initiator, fetchImpl) {
  const remote = await loadStaticRemote(url, fetchImpl)
  if (!remote) return null
  const r = mateuBundleResolver
  const localize = localizerOf(remote)
  const syncPath = r.toSyncPath(route)
  // this core sends '_empty' on a fresh load (the menu expansion, a deep link's shell) and '' or the
  // consumed route on a load INTO the shell — the same split bundle.mjs makes for the page's bundle
  const fresh = consumedRoute === undefined || consumedRoute === null || consumedRoute === '_empty'
  let answer
  if (!fresh && syncPath === '_no_route') {
    const shell = r.appShellOf(r.rootIncrement(remote, localize))
    const home = shell && shell.homeRoute
    if (typeof home !== 'string' || r.toSyncPath(home) === '_no_route') return null
    answer = r.resolveLoad(remote, r.toSyncPath(home), consumedRoute, localize)
  } else {
    answer = r.resolveLoad(remote, syncPath, fresh ? '_empty' : (consumedRoute || syncPath), localize)
  }
  if (!answer) return null
  return {
    ...answer,
    fragments: (answer.fragments || []).map((f) => (f.targetComponentId ? f : { ...f, targetComponentId: initiator || '' })),
  }
}

/** Test hook: forget the loaded remotes. */
export function resetStaticRemotesForTests() { staticRemoteBundles.clear() }
