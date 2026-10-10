import { takeUndoToasts, showUndoToasts } from './notify.mjs'
import { announce } from './a11y.mjs'
// Efectos de DOM que el reducer (puro) solo DESCRIBE: descargar un fichero y abrir una URL en
// otra pestaña. Antes `effects.download` se calculaba y nadie lo leía — el CSV de un listado o
// el PDF de un folio llegaban al navegador y se perdían. Cada chain que reduce un increment
// llama a applyDomEffects(reg.effects) justo después: es el ÚNICO sitio donde estos efectos
// tocan el documento.
//
// `env` (window por defecto) se inyecta para poder probarlo en Node sin DOM.

// Documentos (Document en el servidor): el DownloadFile trae los bytes inline (base64Content) o
// una URL de un solo uso bajo el baseUrl de la UI (`url`, documentos grandes o perezosos);
// `disposition` inline = mostrarlo en una pestaña nueva, attachment = descargarlo; `print` = abrir
// el diálogo de impresión (iframe oculto, sin popup). Una pestaña que el bloqueador de popups
// rechaza se convierte en descarga: el documento nunca se pierde.

// el origen del API: en vb-serve la app vive en :9006 y el backend en :9005, así que una ruta
// "/mateu/v3/documents/…" se resuelve contra el baseUrl con el que se habló, no contra la página
let documentBase = ''
/** transport.callMateu la llama con el base de cada request. */
export function noteDocumentBase(base) { if (typeof base === 'string') documentBase = base }

/** La URL que seguimos: rutas del mismo sitio y http(s); nada más (un `javascript:` se rechaza). */
export function documentUrlOf(url, base = documentBase) {
  if (!url || typeof url !== 'string') return null
  if (/^https?:\/\//i.test(url)) return url
  if (!url.startsWith('/') || url.startsWith('//')) return null
  if (base && /^https?:\/\//i.test(base)) {
    try { return new URL(url, new URL(base).origin).toString() } catch { return url }
  }
  return url
}

/** DownloadFile del wire → { filename, mimeType, base64Content, url, inline, print } o null. */
export function fileDownloadOf(data) {
  if (!data || typeof data !== 'object') return null
  const url = data.base64Content ? null : documentUrlOf(data.url)
  if (!data.base64Content && !url) return null
  const inline = data.disposition === 'inline'
  return {
    filename: data.filename || 'export',
    mimeType: data.mimeType || 'application/octet-stream',
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

/** Aplica un DownloadFile: lo descarga, lo abre en otra pestaña o lo imprime. El object URL se
 *  libera DESPUÉS (revocarlo en el mismo tick cancela la descarga en Firefox; una pestaña o un
 *  iframe aún tienen que cargarlo). Devuelve 'downloaded' | 'opened' | 'printing' | false. */
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
    // una URL del servidor es de un solo uso y el iframe ya la gastó: sólo un object URL se
    // puede volver a enseñar en una pestaña
    printInFrame(href, env, () => { if (objectUrl && env.open) env.open(href, '_blank') })
    release(OBJECT_URL_TTL_MS)
    return 'printing'
  }
  if (file.inline && env.open) {
    const tab = env.open(href, '_blank')
    if (tab) {
      try { tab.opener = null } catch { /* otra procedencia */ }
      release(OBJECT_URL_TTL_MS)
      return 'opened'
    }
  }
  saveAs(href, file.filename, env)
  release(1000)
  return 'downloaded'
}

// ── imprimir la página (UICommand.print) ────────────────────────────────────────────────────────
// La hoja de impresión deja fuera el chrome de la app (cabecera global, navegación, botones,
// toolbars, mensajes); vale también para el Ctrl+P del navegador. Va al documento Y a cada shadow
// root abierto: el CSS del documento no cruza una frontera de shadow DOM.
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

/** Deja la hoja de impresión en el documento y en cada shadow root abierto. */
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

/** UICommand.print: la página actual, sin chrome. */
export function printPage(env = globalThis) {
  if (!env || !env.document || typeof env.print !== 'function') return false
  preparePrint(env.document)
  env.print()
  return true
}

let printSupport = false
/** El Ctrl+P del navegador imprime igual que UICommand.print (sin chrome). */
export function installPrintSupport(win = globalThis.window) {
  if (!win || printSupport || typeof win.addEventListener !== 'function') return false
  printSupport = true
  win.addEventListener('beforeprint', () => preparePrint(win.document))
  return true
}

// lo que la app quiere hacer con el registro recién reducido (las reglas del cliente toman de ahí
// su contexto: reglas + estado del host)
let afterReduce = null
export function setAfterReduceHook(fn) { afterReduce = typeof fn === 'function' ? fn : null }

/** Aplica los efectos de DOM de una reducción. Devuelve cuántas descargas ha lanzado. */
export function applyDomEffects(effects, reg, env = globalThis) {
  if (reg && reg.contexts && afterReduce) afterReduce(reg)
  if (!effects) return 0
  let n = 0
  for (const d of effects.downloads || (effects.download ? [effects.download] : []))
    if (triggerDownload(d, env)) n++
  if (effects.print) printPage(env)
  // los toasts con «Undo» salen por el oj-message de JET (notify.mjs), no por el toast normal
  const undo = takeUndoToasts(effects)
  if (undo.length && env && env.document) showUndoToasts(undo, env.document)
  // the Announce command: through the live regions installAnnouncer created at boot (polite, or
  // assertive for what must not be missed). `env.mateuAnnounce` is the test seam.
  const say = (env && env.mateuAnnounce) || announce
  for (const a of effects.announcements || []) say(a.text, { politeness: a.assertive ? 'assertive' : 'polite' })
  return n
}
