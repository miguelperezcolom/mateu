import { takeUndoToasts, showUndoToasts } from './notify.mjs'
import { announce } from './a11y.mjs'
import { updateHeaderValue } from './appExtras.mjs'
// DOM effects the (pure) reducer only DESCRIBES: downloading a file and opening a URL in
// another tab. Before, `effects.download` was computed and nobody read it — a listing's CSV or
// a folio's PDF reached the browser and got lost. Each chain that reduces an increment
// calls applyDomEffects(reg.effects) right after: it is the ONLY place where these effects
// touch the document.
//
// `env` (window by default) is injected so it can be tested in Node without a DOM.

// Documents (Document on the server): the DownloadFile carries the bytes inline (base64Content) or
// a single-use URL under the UI's baseUrl (`url`, large or lazy documents);
// `disposition` inline = show it in a new tab, attachment = download it; `print` = open
// the print dialog (hidden iframe, no popup). A tab the popup blocker
// rejects turns into a download: the document is never lost.

// the API origin: in vb-serve the app lives on :9006 and the backend on :9005, so a route
// "/mateu/v3/documents/…" is resolved against the baseUrl that was talked to, not against the page
let documentBase = ''
/** transport.callMateu calls it with the base of each request. */
export function noteDocumentBase(base) { if (typeof base === 'string') documentBase = base }

/** The URL we follow: same-site routes and http(s); nothing else (a `javascript:` is rejected). */
export function documentUrlOf(url, base = documentBase) {
  if (!url || typeof url !== 'string') return null
  if (/^https?:\/\//i.test(url)) return url
  if (!url.startsWith('/') || url.startsWith('//')) return null
  if (base && /^https?:\/\//i.test(base)) {
    try { return new URL(url, new URL(base).origin).toString() } catch { return url }
  }
  return url
}

// Types the browser only DISPLAYS. Inline bytes become a blob: URL, which belongs to the APP's
// origin: an HTML/SVG/XML document opened or printed from it would run inside the app with the
// user's token in reach. Only these are shown in place; any other inline type is SAVED, typed as
// opaque bytes. (A server-parked document comes with Content-Security-Policy: sandbox.)
const PASSIVE_INLINE_TYPES = [
  /^application\/pdf$/, /^image\/(png|jpe?g|gif|webp|bmp|avif|x-icon|vnd\.microsoft\.icon)$/,
  /^text\/(plain|csv)$/, /^application\/json$/, /^audio\//, /^video\//,
]

export function isPassiveInlineType(mimeType) {
  const base = String(mimeType == null ? '' : mimeType).split(';')[0].trim().toLowerCase()
  return PASSIVE_INLINE_TYPES.some((re) => re.test(base))
}

/** Wire DownloadFile → { filename, mimeType, base64Content, url, inline, print } or null. */
export function fileDownloadOf(data) {
  if (!data || typeof data !== 'object') return null
  const url = data.base64Content ? null : documentUrlOf(data.url)
  if (!data.base64Content && !url) return null
  const active = !!data.base64Content && !isPassiveInlineType(data.mimeType)
  const inline = data.disposition === 'inline' && !active
  return {
    filename: data.filename || 'export',
    mimeType: active ? 'application/octet-stream' : (data.mimeType || 'application/octet-stream'),
    base64Content: data.base64Content ? String(data.base64Content) : null,
    url,
    inline,
    print: inline && !!data.print,
  }
}

export function base64ToBytes(b64, atobFn = globalThis.atob) {
  const bin = atobFn(b64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return bytes
}

const OBJECT_URL_TTL_MS = 60000

function saveAs(href, filename, env) {
  const a = env.document.createElement('a')
  a.href = href
  a.download = filename
  a.rel = 'noopener'
  a.style.display = 'none'
  env.document.body.appendChild(a)
  a.click()
  a.remove()
}

function printInFrame(href, env, onFail) {
  const frame = env.document.createElement('iframe')
  frame.setAttribute('aria-hidden', 'true')
  frame.setAttribute('tabindex', '-1')
  frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden'
  frame.addEventListener('load', () => {
    try {
      frame.contentWindow.focus()
      frame.contentWindow.print()
    } catch { onFail() }
    env.setTimeout(() => frame.remove(), OBJECT_URL_TTL_MS)
  }, { once: true })
  frame.src = href
  env.document.body.appendChild(frame)
}

/** Applies a DownloadFile: downloads it, opens it in another tab or prints it. The object URL is
 *  released AFTERWARDS (revoking it in the same tick cancels the download in Firefox; a tab or an
 *  iframe still have to load it). Returns 'downloaded' | 'opened' | 'printing' | false. */
export function triggerDownload(data, env = globalThis) {
  const file = fileDownloadOf(data)
  if (!file || !env.document) return false
  let href = file.url
  const objectUrl = !!file.base64Content
  if (objectUrl) {
    const blob = new env.Blob([base64ToBytes(file.base64Content, env.atob)], { type: file.mimeType })
    href = env.URL.createObjectURL(blob)
  }
  const release = (ms) => { if (objectUrl) env.setTimeout(() => env.URL.revokeObjectURL(href), ms) }
  if (file.print) {
    // a server URL is single-use and the iframe already spent it: only an object URL can
    // be shown again in a tab
    printInFrame(href, env, () => { if (objectUrl && env.open) env.open(href, '_blank') })
    release(OBJECT_URL_TTL_MS)
    return 'printing'
  }
  if (file.inline && env.open) {
    const tab = env.open(href, '_blank')
    if (tab) {
      try { tab.opener = null } catch { /* another origin */ }
      release(OBJECT_URL_TTL_MS)
      return 'opened'
    }
  }
  saveAs(href, file.filename, env)
  release(1000)
  return 'downloaded'
}

// ── printing the page (UICommand.print) ────────────────────────────────────────────────────────
// The print sheet leaves out the app chrome (global header, navigation, buttons,
// toolbars, messages); it also applies to the browser's Ctrl+P. It goes to the document AND to each open shadow
// root: the document's CSS does not cross a shadow DOM boundary.
export const PRINT_CSS = `
@media print {
  oj-sp-global-header, oj-navigation-list, #mateuNavList, oj-drawer-popup, oj-c-drawer-popup,
  oj-button:not([data-mateu-print="show"]), oj-c-button:not([data-mateu-print="show"]),
  oj-c-menu-button, oj-menu-button, oj-buttonset-one, oj-toolbar, oj-c-toolbar, oj-messages,
  oj-c-message-toast, oj-sp-smart-search, nav, button:not([data-mateu-print="show"]),
  .mateu-skip-link, .mateu-no-print, [data-mateu-print="hide"] { display: none !important; }
  oj-vb-content, [role="main"] { overflow: visible !important; height: auto !important; max-height: none !important; }
  * { box-shadow: none !important; }
}`

const printRoots = new WeakSet()
function adoptPrintSheet(root, env) {
  if (printRoots.has(root)) return
  printRoots.add(root)
  const doc = root.ownerDocument || root
  const container = root.head || root
  if (!container || !doc.createElement) return
  const style = doc.createElement('style')
  style.setAttribute('data-mateu-print', 'styles')
  style.textContent = PRINT_CSS
  container.appendChild(style)
}

/** Puts the print sheet in the document and in each open shadow root. */
export function preparePrint(doc) {
  if (!doc) return 0
  adoptPrintSheet(doc)
  let n = 1
  const visit = (root) => {
    const all = root.querySelectorAll ? root.querySelectorAll('*') : []
    for (const el of all) if (el.shadowRoot) { adoptPrintSheet(el.shadowRoot); n++; visit(el.shadowRoot) }
  }
  visit(doc)
  return n
}

/** UICommand.print: the current page, without chrome. */
export function printPage(env = globalThis) {
  if (!env || !env.document || typeof env.print !== 'function') return false
  preparePrint(env.document)
  env.print()
  return true
}

let printSupport = false
/** The browser's Ctrl+P prints the same as UICommand.print (without chrome). */
export function installPrintSupport(win = globalThis.window) {
  if (!win || printSupport || typeof win.addEventListener !== 'function') return false
  printSupport = true
  win.addEventListener('beforeprint', () => preparePrint(win.document))
  return true
}

// what the app wants to do with the freshly reduced registry (client rules take their
// context from there: rules + host state)
let afterReduce = null
export function setAfterReduceHook(fn) { afterReduce = typeof fn === 'function' ? fn : null }

/** Applies a reduction's DOM effects. Returns how many downloads it launched. */
export function applyDomEffects(effects, reg, env = globalThis) {
  if (reg && reg.contexts && afterReduce) afterReduce(reg)
  if (!effects) return 0
  let n = 0
  for (const d of effects.downloads || (effects.download ? [effects.download] : []))
    if (triggerDownload(d, env)) n++
  if (effects.print) printPage(env)
  // toasts with «Undo» go out through JET's oj-message (notify.mjs), not through the normal toast
  const undo = takeUndoToasts(effects)
  if (undo.length && env && env.document) showUndoToasts(undo, env.document)
  // the Announce command: through the live regions installAnnouncer created at boot (polite, or
  // assertive for what must not be missed). `env.mateuAnnounce` is the test seam.
  const say = (env && env.mateuAnnounce) || announce
  for (const a of effects.announcements || []) say(a.text, { politeness: a.assertive ? 'assertive' : 'polite' })
  // UICommand.updateHeaderValue: the header repaints and the other tabs follow (appExtras.mjs)
  for (const h of effects.headerValues || []) ((env && env.mateuHeaderValue) || updateHeaderValue)(h.id, h.value)
  return n
}
