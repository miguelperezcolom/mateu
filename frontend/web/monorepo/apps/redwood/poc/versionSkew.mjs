// Version skew between this renderer and the backend it talks to (the shared contract every
// Mateu renderer follows — transport HEADERS only, nothing in the wire JSON):
//
//  - every request to a Mateu endpoint (sync / sse) says who is calling:
//      X-Mateu-Renderer: redwood/<version> wire/<major>.<minor>
//    never a third-party REST source (restSources.mjs fetches those itself, without this header);
//  - every Mateu response says which deployment answered: X-Mateu-Build (opaque, equality only).
//    The FIRST build seen per backend (origin + baseUrl, the URL up to `/mateu/`) is the baseline of
//    this page; a later success from another build → «this app has been updated» once per backend;
//    a Mateu 403 refusal from another build → the screen is STALE, not a permission problem.
//
// Pure decisions here (noteResponseBuild, backendKeyOf, rendererHeaderValue); resilience.mjs
// (fetchWithPolicy) feeds them and the shell (loadMateuShell.js) shows the notices in the error band
// with a Reload that does location.reload().

import { chromeText } from './i18n.mjs'
import { SUPPORTED_WIRE_MAJOR } from './wireVersion.mjs'

export const RENDERER_NAME = 'redwood'

// make-amd.mjs replaces the placeholder with apps/redwood/package.json's version when it writes the
// bridge; run from the sources (Node tests) it stays a placeholder and reads as 'unknown'.
const RENDERER_VERSION_STAMP = '@@MATEU_REDWOOD_VERSION@@'

/** The renderer's own version, or 'unknown' when the bridge was not stamped. */
export function rendererVersion(stamp = RENDERER_VERSION_STAMP) {
  return typeof stamp === 'string' && stamp && !stamp.startsWith('@@') ? stamp : 'unknown'
}

/** The wire version this renderer was built for: the major it checks, minor 0. */
export const RENDERER_WIRE_VERSION = `${SUPPORTED_WIRE_MAJOR}.0`

export const RENDERER_HEADER = 'X-Mateu-Renderer'
export const BUILD_HEADER = 'X-Mateu-Build'

/** `redwood/<version> wire/<major>.<minor>` */
export function rendererHeaderValue(version = rendererVersion(), wire = RENDERER_WIRE_VERSION) {
  return `${RENDERER_NAME}/${version || 'unknown'} wire/${wire}`
}

/** Index of the `/mateu/` segment of a URL, or -1 (not a Mateu endpoint). */
function mateuSegmentOf(url) {
  return typeof url === 'string' ? url.indexOf('/mateu/') : -1
}

/** Whether a URL is one of Mateu's own endpoints (it has a `/mateu/` segment). */
export function isMateuEndpoint(url) {
  return mateuSegmentOf(url) >= 0
}

/** The request init with the renderer header added — only for a Mateu endpoint. */
export function withRendererHeader(url, init) {
  if (!isMateuEndpoint(url)) return init
  const headers = (init && init.headers) || {}
  if (typeof headers.set === 'function') {
    headers.set(RENDERER_HEADER, rendererHeaderValue())
    return init
  }
  return { ...(init || {}), headers: { ...headers, [RENDERER_HEADER]: rendererHeaderValue() } }
}

/** A plain headers object with the renderer header, for the streams that call fetch themselves. */
export function rendererHeaders() {
  return { [RENDERER_HEADER]: rendererHeaderValue() }
}

/**
 * The backend a request belongs to: the ABSOLUTE URL up to (excluding) `/mateu/`. A relative URL
 * (same-origin base '') is resolved against the page; without a page (Node) it is kept as written.
 */
export function backendKeyOf(url, pageHref = typeof location !== 'undefined' ? location.href : undefined) {
  if (typeof url !== 'string') return ''
  let absolute = url
  if (pageHref) {
    try { absolute = new URL(url, pageHref).href } catch (e) { absolute = url }
  }
  const i = mateuSegmentOf(absolute)
  return i >= 0 ? absolute.slice(0, i) : absolute
}

/** The X-Mateu-Build of a response (fetch Response or a plain headers object), or null. */
export function buildOfHeaders(headers) {
  if (!headers) return null
  let value = null
  try {
    value = typeof headers.get === 'function'
      ? headers.get(BUILD_HEADER)
      : (headers[BUILD_HEADER] || headers[BUILD_HEADER.toLowerCase()])
  } catch (e) {
    value = null
  }
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

// per backend: the baseline build of this page, and whether its notice was already shown
const skew = { baselines: new Map(), shown: new Set(), listener: null }

/**
 * The verdict for one response: `'updated'` (a success from another build, first time for that
 * backend), `'stale'` (a Mateu 403 refusal from another build) or null (nothing to say).
 * The baseline is the first build seen and is never moved; a missing header says nothing.
 */
export function noteResponseBuild(url, build, { ok = true, status, mateuRefusal = false } = {}) {
  if (!build) return null
  const key = backendKeyOf(url)
  if (!skew.baselines.has(key)) {
    skew.baselines.set(key, build)
    return null
  }
  if (skew.baselines.get(key) === build) return null
  if (ok) {
    if (skew.shown.has(key)) return null
    skew.shown.add(key)
    return 'updated'
  }
  if (status === 403 && mateuRefusal) {
    // the stale-screen error replaces the «updated» notice for that backend: never both
    skew.shown.add(key)
    return 'stale'
  }
  return null
}

/** The texts, in the interface's language. */
export function appUpdatedMessage(lang) { return chromeText('appUpdated', {}, lang) }
export function staleScreenMessage(lang) { return chromeText('screenChanged', {}, lang) }

/** The shell's hook for the «app updated» notice: called once per backend with the message. */
export function setAppUpdatedListener(fn) {
  skew.listener = typeof fn === 'function' ? fn : null
}

/** Called by the transport with a SUCCESSFUL response's verdict. */
export function reportAppUpdated(verdict) {
  if (verdict !== 'updated' || !skew.listener) return
  try { skew.listener(appUpdatedMessage()) } catch (e) { /* the UI must not break the transport */ }
}

/** Test hook: forget every baseline and notice. */
export function resetVersionSkew() {
  skew.baselines.clear()
  skew.shown.clear()
}
