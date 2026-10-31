// App HEADER widgets (WidgetSupplier.widgets / @Widget): they arrive as children of the App with
// slot "widgets" — a layout with, typically, a MicroFrontend (the inbox badge, another pod
// that refreshes itself) and a Popover over a Text (the user greeting, which opens their email and
// Logout). The Vaadin renderer paints them as they are in its bar; here they are split between the TWO zones
// oj-sp-global-header declares:
//
//  - slot `usermenu`: the profile area of Redwood's global header (FA puts the user's avatar
//    there, and their menu on click). A Popover whose trigger is a TEXT is the Mateu idiom for
//    "who I am + a menu": a text is not a control, so the only thing it can be saying is
//    a label — and in the header, the user's. The FIRST of those goes to the profile area as an
//    avatar with initials + name, and its content to an anchored oj-popup. It is a recognition of
//    SHAPE, not of values: what the text says is not looked at.
//  - slot `end` (actions zone): everything else, in order — a Text's HTML, a
//    MicroFrontend's live HTML, and any other Popover as button + oj-popup.
//
// HTML is painted as HTML (it is HTML on the wire: an <a> with an onclick that emits
// navigation-requested), with two translations: <vaadin-icon> does not exist in Redwood and is replaced
// by the equivalent oj-ux-ico font icon, and — since no handler passes the sanitiser (M-S7) — such a
// link becomes a route href (routeLinksOf) whose click the header turns back into the same
// navigation-requested, which the shell listens to.

import { ojIconOf, interpolate, mediatorOf } from './reduceContexts.mjs'
import { callMateu } from './transport.mjs'
import { chromeText } from './i18n.mjs'
import { sanitizeHtml } from './richtext.mjs'
import { safeHref } from './core/display.mjs'
import { isPathMode, currentMount, pathOfRoute } from './mount.mjs'

const CONTAINERS = new Set([
  'HorizontalLayout', 'VerticalLayout', 'FormLayout', 'Container', 'Div', 'Scroller',
  'SplitLayout', 'FlexLayout',
])

const ENTITIES = { nbsp: ' ', amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", '#39': "'" }

/** The visible text of an HTML fragment: no tags, entities resolved, whitespace collapsed. */
export function plainTextOf(html) {
  return String(html == null ? '' : html)
    .replace(/<[^>]*>/g, ' ')
    .replace(/&(nbsp|amp|lt|gt|quot|apos|#39);/g, (all, name) => ENTITIES[name])
    .replace(/\s+/g, ' ')
    .trim()
}

/** Initials for the avatar: from the name following the greeting ("Hola, Demo User" → "DU"). */
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
 * A widget's HTML, fit for Redwood: each <vaadin-icon icon="vaadin:x"> becomes a
 * <span class="oj-ux-ico-…"> (Redwood's icon font) keeping its style — its size, its
 * alignment and its colour (e.g. the badge's red when something is urgent). An icon without an
 * equivalent is removed: an unknown element paints nothing and takes up its space all the same.
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

/** A Popover's content → popup rows (text, link), in order. */
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
      out.push({ id: 'r' + out.length, isLink: true, label: md.text || md.url || '', href: safeHref(md.url) || '#', target: md.target || '' })
      return
    }
    if (md.type === 'Button') {
      // a button in a widget's popup can only navigate or run client JS: without
      // its own context it has nobody to send a server action to
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
 * The projection of the registry's header widgets: `user` (the profile area) or null, and
 * `items` (the actions zone), each with an id stable by POSITION — the same on every
 * bootstrap, which is what lets the DOM and the refresh find their slot again.
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
        // the host resolved it (resolve = SERVER): the answer to its first load is already here
        resolved: md.resolved && typeof md.resolved === 'object' ? md.resolved : null,
      })
      return
    }
    if (md.type === 'Text') {
      const html = redwoodHtmlOf(md.text)
      if (plainTextOf(html) || /<span class="oj-ux-ico-/.test(html)) items.push({ id, isHtml: true, html })
      return
    }
    if (md.type === 'Anchor') {
      // the url only as a safe link, the text as TEXT (M-S7); mountHeaderHtml sanitizes the result
      const href = safeHref(md.url) || '#'
      const text = String(md.text == null ? '' : md.text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      items.push({ id, isHtml: true, html: `<a href="${href.replace(/&/g, '&amp;').replace(/"/g, '&quot;')}">${text}</a>` })
    }
  }
  nodes.forEach((node, i) => visit(node, String(i)))
  return { user, items }
}

/** The HTML of an already loaded remote widget: its Texts, interpolated against its state. */
export function remoteWidgetHtmlOf(tree, state) {
  const parts = []
  const visit = (n) => {
    if (!n) return
    const md = n.metadata || {}
    // the remote's state may carry markup (a badge's link and icon): it reaches the page only
    // through mountHeaderHtml's whitelist (M-S7)
    if (md.type === 'Text') parts.push(redwoodHtmlOf(interpolate(md.text, state)))
    for (const child of n.children || []) visit(child)
  }
  visit(tree)
  return parts.join('')
}

const widgetRuntimes = new Map()

/**
 * Loads a header MicroFrontend and keeps it alive with ITS triggers: OnLoad on load and
 * OnSuccess after each action that names them (the badge: `refresh` every 10 s, chained). It is the
 * same contract as the web renderer — if a refresh fails, it is not rescheduled (OnSuccess).
 *
 * Requests go in `quiet` mode: a background refresh every few seconds must not turn on the
 * screen's busy bar or error band, which are about what the user does.
 *
 * `deps` exists for the tests (call/schedule/cancel); `onHtml(html)` receives each repaint.
 * Starting the same id again stops the previous one: a rebootstrap does not leave two loops.
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
      // resolved by the host: no request for the first paint; its triggers still go to the remote
      apply(item.resolved || (await request('')))
      // a remote that answers with a mediator (chromeless App) brings the content in a 2nd hop
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
    // for the tests: how many refreshes are scheduled
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

// ── Navigation links ───────────────────────────────────────────────────────────────────────────
// The Mateu idiom for a widget link (the inbox badge) is an <a href="#" onclick="…dispatchEvent(new
// CustomEvent('navigation-requested', {detail: {route: '/inbox/pending', baseUrl: '/_inbox', …}}))">.
// The sanitiser drops every handler, so the link would go nowhere: it is rewritten into a link to
// the ROUTE (the path under the mount, `#/route` when served statically) and the detail is kept
// beside the HTML, keyed by that href, for the header's click to emit. Only string values of the
// known keys are read — the handler is never evaluated.

const NAV_DETAIL_KEYS = new Set(['route', 'consumedRoute', 'baseUrl', 'uriPrefix', 'serverSideType'])

/** The detail of the navigation-requested an inline handler emits, or null if it emits none. */
export function navigationDetailOfHandler(handler) {
  const js = String(handler == null ? '' : handler)
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&apos;/g, "'").replace(/&amp;/g, '&')
  if (!/new\s+CustomEvent\(\s*(['"])navigation-requested\1/.test(js)) return null
  const body = /\bdetail\s*:\s*\{([^{}]*)\}/.exec(js)
  if (!body) return null
  const detail = {}
  const re = /([A-Za-z_$][\w$]*)\s*:\s*(?:'([^']*)'|"([^"]*)")/g
  let m
  while ((m = re.exec(body[1]))) {
    if (NAV_DETAIL_KEYS.has(m[1])) detail[m[1]] = m[2] != null ? m[2] : m[3]
  }
  if (typeof detail.route !== 'string') return null
  // a route is a path of this app: an absolute url or a scheme is never navigated to
  if (detail.route !== '' && (detail.route.charAt(0) !== '/' || detail.route.charAt(1) === '/')) return null
  return detail
}

/** The href of an app route: its path under the mount (path mode) or `#/route` (static serving). */
export function routeHrefOf(route, { pathMode = true, mount = '' } = {}) {
  const r = String(route == null ? '' : route)
  if (pathMode) return pathOfRoute(r, mount)
  return '#' + (r.charAt(0) === '/' ? r : '/' + r)
}


/**
 * `html` with each link whose handler emits navigation-requested turned into a link to its route,
 * and `targets`: href → the detail to emit when it is clicked.
 */
const LINK_ATTR = /\s+([a-zA-Z_:][-\w:.]*)(?:\s*=\s*("[^"]*"|'[^']*'|[^\s>]+))?/g
const SAFE_LINK_ATTRS = new Set(['class', 'id', 'title', 'style', 'role', 'tabindex', 'lang', 'dir', 'slot'])

/** The attributes of an `<a>` worth keeping on a rebuilt route link: inert ones only. */
function keptLinkAttributes(attrs) {
  let kept = ''
  for (const m of String(attrs).matchAll(LINK_ATTR)) {
    const name = m[1].toLowerCase()
    if (SAFE_LINK_ATTRS.has(name) || name.startsWith('aria-') || name.startsWith('data-')) {
      kept += m[2] === undefined ? ` ${name}` : ` ${name}=${m[2]}`
    }
  }
  return kept
}

export function routeLinksOf(html, options = {}) {
  const targets = {}
  const out = String(html == null ? '' : html).replace(/<a\b((?:[^>"']|"[^"]*"|'[^']*')*)>/gi, (all, attrs) => {
    const detail = navigationDetailOfHandler(attrOf(attrs, 'onclick'))
    if (!detail) return all
    const href = safeHref(routeHrefOf(detail.route, options))
    if (!href) return all
    targets[href] = detail
    // the link is rebuilt from an allow-list of inert attributes (never a handler, never another href;
    // style is kept here and filtered by the whitelist sanitizer at the sink)
    const rest = keptLinkAttributes(attrs)
    return `<a href="${href.replace(/&/g, '&amp;').replace(/"/g, '&quot;')}"${rest}>`
  })
  return { html: out, targets }
}

/** The detail a click on a header link emits, or null when the click is the browser's (a modified
 *  or non-primary click opens the href as any link; a link that is not a route link). */
export function headerNavigationOf(href, event, targets) {
  if (href == null || !targets || !Object.prototype.hasOwnProperty.call(targets, href)) return null
  if (event && (event.defaultPrevented || event.button > 0
    || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)) return null
  return targets[href]
}

function onHeaderLinkClick(hole, event) {
  const path = typeof event.composedPath === 'function' ? event.composedPath() : []
  const anchor = path.find((node) => node && node.tagName === 'A')
    || (event.target && typeof event.target.closest === 'function' ? event.target.closest('a') : null)
  if (!anchor || typeof anchor.getAttribute !== 'function') return
  const detail = headerNavigationOf(anchor.getAttribute('href'), event, hole.__mateuNavTargets)
  if (!detail) return
  event.preventDefault()
  anchor.dispatchEvent(new CustomEvent('navigation-requested', { detail: { ...detail }, bubbles: true, composed: true }))
}

// ── DOM ─────────────────────────────────────────────────────────────────────────────────────
// VB cannot stamp raw HTML from a binding: the slot (<span class="mateu-header-widget"
// data-widget-id>) is painted by the template and the HTML is put in by the bridge, as with third-party
// web components (elements.mjs). The last HTML of each slot is remembered: if VB re-stamps it, the
// next mount fills it again; if it did not change, it is not touched (a click in progress on the
// link does not lose its element every 10 s).

const lastHtml = {}

export function mountHeaderHtml(id, html) {
  if (html != null) lastHtml[id] = html
  if (typeof document === 'undefined') return false
  const hole = document.querySelector(`.mateu-header-widget[data-widget-id="${id}"]`)
  if (!hole) return false
  const next = lastHtml[id] || ''
  if (hole.__mateuHtml !== next) {
    // a widget's HTML carries DATA (a remote's state interpolated into its Text): whitelist-sanitized
    // at the one sink, keeping the icon spans' class/style (M-S7)
    // (its navigation links become route hrefs first: their handler would not survive)
    const linked = routeLinksOf(next, { pathMode: isPathMode(), mount: currentMount() })
    hole.innerHTML = sanitizeHtml(linked.html, { presentation: true })
    hole.__mateuHtml = next
    hole.__mateuNavTargets = linked.targets
    if (!hole.__mateuNavWired && typeof hole.addEventListener === 'function') {
      hole.__mateuNavWired = true
      hole.addEventListener('click', (event) => onHeaderLinkClick(hole, event))
    }
  }
  return true
}

/** The same, waiting for VB to paint the slot (its bindings are asynchronous). */
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

// ── The shell's "ask" FAB ──────────────────────────────────────────────────────────────────
// oj-sp-simple-ui-shell stamps its own FAB (ojSpChatAction event) with `oj-ux-ico-oracle-chat`:
// the speech bubble of Oracle's DIGITAL assistant. Here that FAB opens the destination
// finder, and the agent chat has its own FAB with `oj-ux-ico-chat`: two bubbles for two
// different things. By default it is NEUTRAL — «Search» with the magnifier —: a Mateu app is not an Oracle
// product and must not look like one (brand risk). Whoever wants the Ask Oracle look, or their
// own brand, sets it with @App(askLabel, askIcon): an initial, an image (their logo) or an icon
// (`oj-ux-ico-oracle-o` is the "O" of Ask Oracle).

export const ASK_FAB_LABEL = 'Search'
export const ASK_FAB_GLYPH = 'oj-ux-ico-search'
/** The glyph the shell stamps it with (the one that is removed). */
export const SHELL_CHAT_GLYPH = 'oj-ux-ico-oracle-chat'

const isImageRef = (value) => /^(data:|https?:|\/\/)/i.test(value) || /[/.]/.test(value)

/**
 * What the shell's "ask" FAB carries: `{ label, kind, glyph?, text?, src? }`.
 *  - without @App(askIcon): the magnifier (kind 'glyph'), neutral;
 *  - one or two letters ("R"): the initial (kind 'initial');
 *  - a path or url ("/images/riu.svg"): the image (kind 'image'), relative to the backend like the logo;
 *  - `oj-ux-ico-…` or a Mateu name (`vaadin:…`) with an equivalent: that icon (kind 'glyph').
 * An askIcon that is none of those (an icon without an equivalent, a word) does not leave the FAB empty:
 * it falls back to the magnifier.
 */
export function askFabOf(shell, base = '') {
  const label = String((shell && shell.askLabel) || '').trim() || chromeText('askSearch')
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
 * Puts the brand and the name on the shell's FAB (`fab`, the `<a>`; inside, the glyph's `div role=img`).
 * Idempotent: it can be applied again with another brand. It also gives it what the shell does not:
 * without href or role, it was not reachable with Tab and only said "Ask".
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
