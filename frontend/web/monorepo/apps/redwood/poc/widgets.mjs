// Widgets de CABECERA del App (WidgetSupplier.widgets / @Widget): llegan como hijos del App con
// slot "widgets" — un layout con, típicamente, un MicroFrontend (el badge de la bandeja, otro pod
// que se refresca solo) y un Popover sobre un Text (el saludo al usuario, que abre su email y el
// Logout). El renderer Vaadin los pinta tal cual en su barra; aquí se reparten entre las DOS zonas
// que declara oj-sp-global-header:
//
//  - slot `usermenu`: el área de perfil de la cabecera global de Redwood (FA pone ahí el avatar del
//    usuario, y al pulsarlo su menú). Un Popover cuyo disparador es un TEXT es el idioma Mateu de
//    "quién soy + un menú": un texto no es un control, así que lo único que puede estar diciendo es
//    un rótulo — y en la cabecera, el del usuario. El PRIMERO de esos va al área de perfil como
//    avatar con iniciales + nombre, y su contenido a un oj-popup anclado. Es un reconocimiento de
//    FORMA, no de valores: no se mira qué dice el texto.
//  - slot `end` (zona de acciones): todo lo demás, en orden — HTML de un Text, el HTML vivo de un
//    MicroFrontend, y cualquier otro Popover como botón + oj-popup.
//
// El HTML se pinta como HTML (lo es en el wire: un <a> con su onclick que emite
// navigation-requested), con una sola traducción: <vaadin-icon> no existe en Redwood y se cambia
// por el icono de fuente oj-ux-ico equivalente. La navegación que emite la escucha la shell.

import { ojIconOf, interpolate, mediatorOf } from './reduceContexts.mjs'
import { callMateu } from './transport.mjs'

const CONTAINERS = new Set([
  'HorizontalLayout', 'VerticalLayout', 'FormLayout', 'Container', 'Div', 'Scroller',
  'SplitLayout', 'FlexLayout',
])

const ENTITIES = { nbsp: ' ', amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", '#39': "'" }

/** El texto visible de un fragmento HTML: sin etiquetas, entidades resueltas, blancos plegados. */
export function plainTextOf(html) {
  return String(html == null ? '' : html)
    .replace(/<[^>]*>/g, ' ')
    .replace(/&(nbsp|amp|lt|gt|quot|apos|#39);/g, (all, name) => ENTITIES[name])
    .replace(/\s+/g, ' ')
    .trim()
}

/** Iniciales para el avatar: del nombre que sigue al saludo ("Hola, Demo User" → "DU"). */
export function initialsOf(label) {
  const text = plainTextOf(label)
  const who = text.indexOf(',') >= 0 ? text.slice(text.lastIndexOf(',') + 1) : text
  const words = who.trim().split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w))
  if (!words.length) return ''
  const first = words[0][0]
  const last = words.length > 1 ? words[words.length - 1][0] : (words[0][1] || '')
  return (first + last).toUpperCase()
}

const attrOf = (attrs, name) => {
  const m = new RegExp(`\\b${name}\\s*=\\s*("([^"]*)"|'([^']*)')`, 'i').exec(attrs || '')
  return m ? (m[2] != null ? m[2] : m[3]) : null
}

/**
 * El HTML de un widget, apto para Redwood: cada <vaadin-icon icon="vaadin:x"> pasa a un
 * <span class="oj-ux-ico-…"> (fuente de iconos de Redwood) conservando su style — su tamaño, su
 * alineación y su color (p.ej. el rojo del badge cuando hay algo urgente). Un icono sin
 * equivalente se quita: un elemento desconocido no pinta nada y ocupa su sitio igual.
 */
export function redwoodHtmlOf(html) {
  const swap = (all, attrs) => {
    const cls = ojIconOf(attrOf(attrs, 'icon'))
    if (!cls) return ''
    const style = attrOf(attrs, 'style')
    return `<span class="${cls} mateu-widget-icon" aria-hidden="true"${style ? ` style="${style}"` : ''}></span>`
  }
  return String(html == null ? '' : html)
    .replace(/<vaadin-icon\b([^>]*?)\/>/gi, swap)
    .replace(/<vaadin-icon\b([^>]*)>\s*<\/vaadin-icon>/gi, swap)
}

/** El contenido de un Popover → filas del popup (texto, enlace), en orden. */
export function popoverContentOf(node) {
  const out = []
  const visit = (n) => {
    if (!n) return
    if (Array.isArray(n)) { n.forEach(visit); return }
    const md = n.metadata || {}
    if (md.type === 'Text') {
      const text = plainTextOf(md.text)
      if (text) out.push({ id: 'r' + out.length, isText: true, text })
      return
    }
    if (md.type === 'Anchor') {
      out.push({ id: 'r' + out.length, isLink: true, label: md.text || md.url || '', href: md.url || '#', target: md.target || '' })
      return
    }
    if (md.type === 'Button') {
      // un botón en el popup de un widget solo puede navegar o ejecutar JS del cliente: sin
      // contexto propio no tiene a quién mandar una acción de servidor
      const label = md.label || md.text || ''
      if (label) out.push({ id: 'r' + out.length, isText: true, text: label })
      return
    }
    for (const child of n.children || []) visit(child)
    if (md.content) visit(md.content)
  }
  visit(node)
  return out
}

/**
 * La proyección de los widgets de cabecera del registro: `user` (el área de perfil) o null, e
 * `items` (la zona de acciones), cada uno con un id estable por POSICIÓN — el mismo en cada
 * bootstrap, que es lo que deja al DOM y al refresco reencontrar su hueco.
 */
export function headerWidgetsOf(reg) {
  const nodes = (reg && reg.shell && reg.shell.widgets) || []
  let user = null
  const items = []
  const visit = (node, path) => {
    if (!node) return
    const md = node.metadata || {}
    const id = 'mateu-widget-' + path
    if (CONTAINERS.has(md.type)) {
      (node.children || []).forEach((child, i) => visit(child, path + '-' + i))
      if (md.content) (Array.isArray(md.content) ? md.content : [md.content]).forEach((c, i) => visit(c, path + '-c' + i))
      return
    }
    if (md.type === 'Popover') {
      const wrapped = md.wrapped || {}
      const wmd = wrapped.metadata || {}
      const label = wmd.type === 'Text' ? plainTextOf(wmd.text) : plainTextOf(wmd.label || wmd.text || '')
      const rows = popoverContentOf(md.content)
      if (!user && wmd.type === 'Text' && label) {
        user = { id, label, initials: initialsOf(label), rows }
      } else {
        items.push({ id, isPopover: true, label: label || '…', rows, buttonId: id + '-button', popupId: id + '-popup' })
      }
      return
    }
    if (md.type === 'MicroFrontend') {
      items.push({
        id,
        isRemote: true,
        baseUrl: md.baseUrl || '',
        route: md.route || '',
        consumedRoute: md.consumedRoute || '',
        serverSideType: md.serverSideType || undefined,
        appState: md.appState || null,
      })
      return
    }
    if (md.type === 'Text') {
      const html = redwoodHtmlOf(md.text)
      if (plainTextOf(html) || /<span class="oj-ux-ico-/.test(html)) items.push({ id, isHtml: true, html })
      return
    }
    if (md.type === 'Anchor') {
      items.push({ id, isHtml: true, html: `<a href="${String(md.url || '#').replace(/"/g, '&quot;')}"${md.target ? ` target="${md.target}"` : ''}>${md.text || ''}</a>` })
    }
  }
  nodes.forEach((node, i) => visit(node, String(i)))
  return { user, items }
}

/** El HTML de un widget remoto ya cargado: sus Text, interpolados contra su state. */
export function remoteWidgetHtmlOf(tree, state) {
  const parts = []
  const visit = (n) => {
    if (!n) return
    const md = n.metadata || {}
    if (md.type === 'Text') parts.push(redwoodHtmlOf(interpolate(md.text, state)))
    for (const child of n.children || []) visit(child)
  }
  visit(tree)
  return parts.join('')
}

const widgetRuntimes = new Map()

/**
 * Carga un MicroFrontend de cabecera y lo mantiene vivo con SUS triggers: OnLoad al cargar y
 * OnSuccess tras cada acción que los nombre (el badge: `refresh` cada 10 s, encadenado). Es el
 * mismo contrato que el renderer web — si un refresco falla, no se reprograma (OnSuccess).
 *
 * Las peticiones van en modo `quiet`: un refresco de fondo cada pocos segundos no debe encender la
 * barra de ocupado ni la banda de error de la pantalla, que hablan de lo que el usuario hace.
 *
 * `deps` existe para los tests (call/schedule/cancel); `onHtml(html)` recibe cada repintado.
 * Arrancar de nuevo el mismo id para el anterior: un rebootstrap no deja dos bucles.
 */
export function startRemoteWidget(item, onHtml, deps = {}) {
  const call = deps.call || callMateu
  const schedule = deps.schedule || ((fn, ms) => setTimeout(fn, ms))
  const cancel = deps.cancel || ((h) => clearTimeout(h))
  const appState = deps.appState || (() => ({}))
  stopRemoteWidget(item.id, cancel)
  const rt = { stopped: false, timers: new Set(), ctx: null, outbound: {} }
  widgetRuntimes.set(item.id, rt)

  const request = (actionId, extra = {}) => call(item.baseUrl || '', {
    route: item.route || '',
    consumedRoute: rt.outbound.consumedRoute != null ? rt.outbound.consumedRoute : (item.consumedRoute || ''),
    serverSideType: rt.outbound.serverSideType || (rt.ctx && rt.ctx.tree && rt.ctx.tree.serverSideType) || item.serverSideType,
    actionId,
    initiatorComponentId: item.id,
    componentState: (rt.ctx && rt.ctx.state) || {},
    appState: Object.assign({}, appState(), item.appState || {}),
    ...extra,
  }, { quiet: true, idempotent: true })

  const apply = (increment) => {
    for (const fr of (increment && increment.fragments) || []) {
      if (fr.component) {
        rt.ctx = { tree: fr.component, state: fr.state || fr.component.initialData || {} }
      } else if (fr.state && rt.ctx) {
        rt.ctx = { tree: rt.ctx.tree, state: Object.assign({}, rt.ctx.state, fr.state) }
      }
    }
    if (!rt.stopped && rt.ctx) onHtml(remoteWidgetHtmlOf(rt.ctx.tree, rt.ctx.state))
  }

  const plan = (trigger) => {
    if (rt.stopped) return
    const handle = schedule(() => { rt.timers.delete(handle); run(trigger.actionId) }, trigger.timeoutMillis || 0)
    rt.timers.add(handle)
  }
  const triggers = () => (rt.ctx && rt.ctx.tree && rt.ctx.tree.triggers) || []

  const run = async (actionId) => {
    if (rt.stopped) return
    try {
      apply(await request(actionId))
    } catch (e) {
      return
    }
    for (const t of triggers()) if (t.type === 'OnSuccess' && t.calledActionId === actionId) plan(t)
  }

  const load = (async () => {
    try {
      apply(await request(''))
      // un remoto que conteste con un mediador (App chromeless) trae el contenido en un 2º salto
      const info = rt.ctx && mediatorOf(rt.ctx)
      if (info) {
        rt.outbound = { consumedRoute: info.rootRoute || item.route || '', serverSideType: info.serverSideType }
        apply(await request('', { consumedRoute: rt.outbound.consumedRoute, serverSideType: info.serverSideType }))
      }
    } catch (e) {
      return
    }
    for (const t of triggers()) if (t.type === 'OnLoad' && t.actionId) plan(t)
  })()

  return {
    loaded: load,
    stop: () => stopRemoteWidget(item.id, cancel),
    // para los tests: cuántos refrescos hay programados
    pending: () => rt.timers.size,
  }
}

export function stopRemoteWidget(id, cancel = (h) => clearTimeout(h)) {
  const previous = widgetRuntimes.get(id)
  if (!previous) return
  previous.stopped = true
  for (const h of previous.timers) cancel(h)
  previous.timers.clear()
  widgetRuntimes.delete(id)
}

export function stopRemoteWidgets() {
  for (const [id, rt] of widgetRuntimes) {
    rt.stopped = true
    for (const h of rt.timers) clearTimeout(h)
    widgetRuntimes.delete(id)
  }
}

// ── DOM ─────────────────────────────────────────────────────────────────────────────────────
// VB no sabe estampar HTML crudo desde un binding: el hueco (<span class="mateu-header-widget"
// data-widget-id>) lo pinta la plantilla y el HTML lo pone el bridge, como con los componentes web
// de terceros (elements.mjs). Se recuerda el último HTML de cada hueco: si VB lo re-estampa, el
// siguiente montaje lo rellena otra vez; si no cambió, no se toca (un clic en curso sobre el
// enlace no pierde su elemento cada 10 s).

const lastHtml = {}

export function mountHeaderHtml(id, html) {
  if (html != null) lastHtml[id] = html
  if (typeof document === 'undefined') return false
  const hole = document.querySelector(`.mateu-header-widget[data-widget-id="${id}"]`)
  if (!hole) return false
  const next = lastHtml[id] || ''
  if (hole.__mateuHtml !== next) {
    hole.innerHTML = next
    hole.__mateuHtml = next
  }
  return true
}

/** Igual, esperando a que VB pinte el hueco (sus bindings son asíncronos). */
export function mountHeaderHtmlSoon(id, html, frames = 30) {
  if (html != null) lastHtml[id] = html
  if (typeof requestAnimationFrame === 'undefined') return
  let left = frames
  const tick = () => {
    if (mountHeaderHtml(id)) return
    left -= 1
    if (left > 0) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}

// ── FAB de "ask" del shell ──────────────────────────────────────────────────────────────────
// oj-sp-simple-ui-shell estampa su propio FAB (evento ojSpChatAction) con `oj-ux-ico-oracle-chat`:
// el bocadillo de conversación del asistente DIGITAL de Oracle. Aquí ese FAB abre Ask Oracle — el
// buscador de destinos —, y el chat del agente tiene su propio FAB con `oj-ux-ico-chat`: dos
// bocadillos para dos cosas distintas. Así que el del shell lleva la marca de Ask Oracle, el glifo
// que usa el propio oj-sp-ask-oracle en la cabecera de Fusion (`oj-ux-ico-oracle-o`, la "O" de
// Oracle), y su rótulo. Un App que no quiera la marca Oracle pone la suya con @App(askLabel,
// askIcon): una inicial, una imagen (su logo) o un icono.

export const ASK_FAB_LABEL = 'Ask Oracle'
export const ASK_FAB_GLYPH = 'oj-ux-ico-oracle-o'
/** El glifo con el que lo estampa el shell (el que se quita). */
export const SHELL_CHAT_GLYPH = 'oj-ux-ico-oracle-chat'

const isImageRef = (value) => /^(data:|https?:|\/\/)/i.test(value) || /[/.]/.test(value)

/**
 * Qué lleva el FAB de "ask" del shell: `{ label, kind, glyph?, text?, src? }`.
 *  - sin @App(askIcon): el glifo de Ask Oracle de Redwood (kind 'glyph');
 *  - una o dos letras ("R"): la inicial (kind 'initial');
 *  - una ruta o url ("/images/riu.svg"): la imagen (kind 'image'), relativa al backend como el logo;
 *  - `oj-ux-ico-…` o un nombre Mateu (`vaadin:…`) con equivalente: ese icono (kind 'glyph').
 * Un askIcon que no es nada de eso (un icono sin equivalente, una palabra) no deja el FAB vacío:
 * vuelve al glifo de Ask Oracle.
 */
export function askFabOf(shell, base = '') {
  const label = String((shell && shell.askLabel) || '').trim() || ASK_FAB_LABEL
  const raw = String((shell && shell.askIcon) || '').trim()
  const glyph = (cls) => ({ label, kind: 'glyph', glyph: cls })
  if (!raw) return glyph(ASK_FAB_GLYPH)
  if (isImageRef(raw)) {
    const absolute = /^(data:|https?:|\/\/)/i.test(raw)
    return { label, kind: 'image', src: absolute ? raw : base + raw }
  }
  if (raw.startsWith('oj-ux-') || raw.includes(':')) return glyph(ojIconOf(raw) || ASK_FAB_GLYPH)
  const letters = Array.from(raw)
  if (letters.length <= 2) return { label, kind: 'initial', text: raw.toUpperCase() }
  return glyph(ASK_FAB_GLYPH)
}

const MARK_CLASS = 'mateu-ask-fab-mark'
const BRANDED_CLASS = 'mateu-ask-fab-branded'

/**
 * Pone la marca y el nombre al FAB del shell (`fab`, el `<a>`; dentro, el `div role=img` del
 * glifo). Idempotente: se puede volver a aplicar con otra marca. Además le da lo que el shell no le
 * da: sin href ni rol, no se alcanzaba con el tabulador y sólo decía "Ask".
 */
export function brandAskFab(fab, spec) {
  if (!fab || !spec) return false
  const icon = fab.querySelector('.oj-sp-rw-chat-icon-image')
  if (!icon) return false
  fab.setAttribute('role', 'button')
  fab.setAttribute('tabindex', '0')
  fab.setAttribute('aria-label', spec.label)
  fab.setAttribute('title', spec.label)
  if (!fab.__mateuKeys) {
    fab.__mateuKeys = true
    fab.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        fab.click()
      }
    })
  }
  icon.setAttribute('aria-label', spec.label)
  icon.classList.remove(SHELL_CHAT_GLYPH, BRANDED_CLASS)
  if (icon.__mateuGlyph) icon.classList.remove(icon.__mateuGlyph)
  icon.__mateuGlyph = null
  const old = icon.querySelector(`.${MARK_CLASS}`)
  if (old) old.remove()
  if (spec.kind === 'glyph') {
    icon.classList.add(spec.glyph)
    icon.__mateuGlyph = spec.glyph
    return true
  }
  const mark = icon.ownerDocument.createElement(spec.kind === 'image' ? 'img' : 'span')
  mark.className = `${MARK_CLASS} ${MARK_CLASS}-${spec.kind}`
  mark.setAttribute('aria-hidden', 'true')
  if (spec.kind === 'image') {
    mark.setAttribute('alt', '')
    mark.setAttribute('src', spec.src)
  } else {
    mark.textContent = spec.text
  }
  icon.classList.add(BRANDED_CLASS)
  icon.appendChild(mark)
  return true
}
