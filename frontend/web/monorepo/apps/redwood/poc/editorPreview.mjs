// Editor-preview mode: the IDE's visual editor paints the definition being edited with THIS app,
// inside an iframe (apps/visual-editor, canvas/redwood-frame.ts). The editor already knows how to
// turn the edited YAML into a wire increment — the reserved `__preview__` sync action of any Mateu
// backend, or the client-side expander with no backend at all — so the app does not ask a server
// for anything: it is HANDED the increment through postMessage and answers its own /mateu calls
// with it, exactly as the palette-thumbnail harness does from Playwright:
//
//   - the shell's bootstrap gets a one-route App (no menu worth showing: the chrome is hidden),
//   - the route's load gets the edited tree, wrapped as a server-side component, the way a real
//     route's content arrives,
//   - any other call (an OnLoad search, a button) gets an empty answer: the canvas is inert, a
//     click SELECTS the component under it instead of running it.
//
// It is the visual editor's canvas, so it is also EDITABLE: with the projection's node ids on
// (core/content.mjs setEditorNodeIds), every painted atom carries the id of the definition node it
// came from as data-node-id — the editor's synthetic `ve-<path>` — and a click posts that id back.
// Production pages never enter this mode: only a page that sets window.__mateuEditorPreview (the
// editor's preview page) does, so no production element ever carries an editor id.
//
// Pure except installEditorPreview (DOM + window), so test.mjs exercises the protocol, the answers
// and the stamping with plain objects.

/** The single route of the preview app. */
export const PREVIEW_ROUTE = '/preview'
const PREVIEW_SST = 'mateu.editor.preview'

/** The tag every message of the protocol carries: `{ mateuPreview: <kind>, … }`. */
export const PREVIEW_MESSAGE_KEY = 'mateuPreview'

/** True on the editor's preview page (it sets the flag before the app boots). */
export const isEditorPreview = (win) => !!(win && win.__mateuEditorPreview)

const EMPTY_INCREMENT = () => ({ commands: [], messages: [], fragments: [] })

/** What the shell's bootstrap gets: a one-route App whose home is the preview route. */
export function previewAppIncrement(initiator = 'shell') {
  return {
    commands: [], messages: [],
    fragments: [{
      targetComponentId: initiator, action: 'Replace',
      component: {
        type: 'ClientSide', id: 'mateu-editor-app', children: [],
        metadata: {
          type: 'App', route: '', variant: 'MENU_ON_TOP', layout: 'SINGLE_SLOT', title: '',
          homeRoute: PREVIEW_ROUTE,
          menu: [{ label: ' ', path: PREVIEW_ROUTE, route: PREVIEW_ROUTE, consumedRoute: '', serverSideType: PREVIEW_SST,
            submenus: [], visible: true }],
          apps: [], fabs: [], contextSelectors: [], contextActions: [],
        },
      },
    }],
  }
}

/** What the route's load gets: the edited tree (the first fragment of the editor's increment),
 *  wrapped as a server-side component — the way a real route's content arrives — and aimed at the
 *  surface that loads it. */
export function previewLoadIncrement(fragment, request = {}) {
  if (!fragment || !fragment.component) return EMPTY_INCREMENT()
  const state = fragment.state || {}
  return {
    commands: [], messages: [],
    fragments: [{
      targetComponentId: request.initiatorComponentId || '',
      action: 'Replace',
      state,
      data: fragment.data || {},
      component: {
        type: 'ServerSide', id: 'mateu-editor-page', serverSideType: PREVIEW_SST,
        route: request.route || PREVIEW_ROUTE, actions: [], triggers: [], rules: [],
        children: [fragment.component], initialData: state,
      },
    }],
  }
}

/** The answer to a request the app sends to its backend, or null when it is not a Mateu call
 *  (a REST source, a CDN module: those go out for real). */
export function previewAnswerOf(url, body, fragment) {
  const u = String(url || '')
  if (u.indexOf('/mateu/v3/') < 0) return null
  if (u.indexOf('/mateu/v3/components/') >= 0) return previewAppIncrement((body && body.initiatorComponentId) || 'shell')
  if (u.indexOf('/mateu/v3/sync/') >= 0) {
    // a load is actionId '' — anything else (a search, a button) does nothing on a canvas
    if (body && (body.actionId === '' || body.actionId == null)) return previewLoadIncrement(fragment, body)
    return EMPTY_INCREMENT()
  }
  // client-log, notifications, chat…: nobody is listening
  return EMPTY_INCREMENT()
}

const parseBody = (init) => {
  try { return init && typeof init.body === 'string' ? JSON.parse(init.body) : {} } catch (e) { return {} }
}

/** A fetch that answers the Mateu calls locally (awaiting the first fragment the editor hands
 *  over: the route's load may go out before it arrives) and lets everything else through. */
export function previewFetch(realFetch, fragmentNow) {
  return async (input, init) => {
    const url = typeof input === 'string' ? input : (input && input.url) || ''
    if (url.indexOf('/mateu/v3/') < 0) return realFetch(input, init)
    const body = parseBody(init)
    const isLoad = url.indexOf('/mateu/v3/sync/') >= 0 && (body.actionId === '' || body.actionId == null)
    const json = previewAnswerOf(url, body, isLoad ? await fragmentNow() : null)
    return new Response(JSON.stringify(json), { status: 200, headers: { 'Content-Type': 'application/json' } })
  }
}

/** The editor id under a click: the nearest element of the event path that carries one. */
export function nodeIdOfPath(path) {
  for (const el of path || []) {
    const id = el && typeof el.getAttribute === 'function' ? el.getAttribute('data-node-id') : null
    if (id) return id
  }
  return null
}

/**
 * Copies the projection's node ids onto the painted DOM: every element whose bound data (its
 * template's $current.data, read by `dataOf`) carries a `nodeId` different from its parent's gets
 * data-node-id — so the OUTERMOST element of an atom is the one tagged, and a nested object of the
 * same atom (a group of a queue) inherits. An element whose data has none and that still carries
 * a stale id (re-used by the template) loses it. Returns how many elements carry an id.
 */
export function stampNodeIds(root, dataOf) {
  let count = 0
  const walk = (el, inherited) => {
    let data
    try { data = dataOf(el) } catch (e) { data = undefined }
    const own = data && typeof data === 'object' && data.nodeId ? String(data.nodeId) : ''
    if (own && own !== inherited) {
      if (el.getAttribute('data-node-id') !== own) el.setAttribute('data-node-id', own)
      count++
    } else if (el.hasAttribute && el.hasAttribute('data-node-id')) {
      el.removeAttribute('data-node-id')
    }
    const next = own || inherited
    for (const child of Array.from(el.children || [])) walk(child, next)
  }
  for (const child of Array.from((root && root.children) || [])) walk(child, '')
  return count
}

/** The element painted for an editor id (the first: an atom projected twice is selected once). */
export const elementOfNodeId = (doc, id) =>
  (id && doc ? doc.querySelector('[data-node-id="' + String(id).replace(/["\\]/g, '\\$&') + '"]') : null)

// The canvas does not run the app: these never reach it (capture phase, stopped before JET).
const INERT_EVENTS = ['pointerdown', 'pointerup', 'mousedown', 'mouseup', 'dblclick', 'contextmenu',
  'touchstart', 'touchend', 'submit', 'dragstart', 'auxclick']
// Keys the editor handles (undo/redo, delete, move): forwarded to it, never typed into a field.
const FORWARDED_KEYS = { Delete: 1, Backspace: 1, ArrowUp: 1, ArrowDown: 1, Escape: 1 }

/** What the shell chrome looks like on a canvas: nothing. The page is what is being designed. */
export const EDITOR_PREVIEW_CSS = `
html.mateu-editor-preview oj-sp-global-header, html.mateu-editor-preview .mateu-subheader,
html.mateu-editor-preview oj-sp-simple-ui-shell .oj-sp-rw-chat-icon-cont,
html.mateu-editor-preview .mateu-skip-link { display: none !important; }
html.mateu-editor-preview [data-node-id] { cursor: default; }
.mateu-editor-outline { position: fixed; pointer-events: none; z-index: 2147483000; box-sizing: border-box;
  border: 2px solid #4f8cff; border-radius: 2px; display: none; }
.mateu-editor-outline.hover { border: 1px dashed #4f8cff; }
.mateu-editor-outline .tag { position: absolute; top: -18px; left: -2px; font: 600 10px/1.4 system-ui, sans-serif;
  padding: 1px 5px; color: #fff; background: #4f8cff; border-radius: 3px 3px 0 0; white-space: nowrap; }
.mateu-editor-outline.below .tag { top: auto; bottom: -18px; border-radius: 0 0 3px 3px; }
`

/**
 * Wires the page as the editor's canvas: the fetch that answers from the handed increment, the
 * message protocol, the inert interactions, the id stamping and the selection outline.
 *
 * @param win the window (the iframe's)
 * @param opts.rerender re-runs the preview route (the shell chain: onMateuNavigate with force)
 * @param opts.dataOf element → its bound data (knockout's contextFor(el).$current.data)
 * @returns { booted() } — the shell calls it once its first navigation is done
 */
export function installEditorPreview(win, opts = {}) {
  const doc = win.document
  const post = (msg) => { try { win.parent.postMessage({ [PREVIEW_MESSAGE_KEY]: msg.kind, ...msg }, '*') } catch (e) { /* no parent */ } }
  doc.documentElement.classList.add('mateu-editor-preview')
  const style = doc.createElement('style')
  style.textContent = EDITOR_PREVIEW_CSS
  doc.head.appendChild(style)

  let fragment = null
  let waiters = []
  const fragmentNow = () => (fragment ? Promise.resolve(fragment) : new Promise((resolve) => waiters.push(resolve)))
  const realFetch = win.fetch.bind(win)
  win.fetch = previewFetch(realFetch, fragmentNow)

  let booted = false
  let rendering = false
  let again = false
  const rerender = async () => {
    if (!booted || !opts.rerender) return
    if (rendering) { again = true; return }
    rendering = true
    try { await opts.rerender() } catch (e) { /* the next edit retries */ } finally {
      rendering = false
      if (again) { again = false; rerender() }
    }
  }

  // ── selection & hover outlines (inside the frame: the editor cannot see this DOM) ──
  const outline = (cls) => {
    const el = doc.createElement('div')
    el.className = 'mateu-editor-outline ' + cls
    el.appendChild(doc.createElement('span')).className = 'tag'
    doc.body.appendChild(el)
    return el
  }
  let selOutline = null
  let hoverOutline = null
  let selected = { id: null, label: '' }
  let hovered = { id: null, label: '' }
  const place = (box, target) => {
    const el = target.id ? elementOfNodeId(doc, target.id) : null
    if (!el) { box.style.display = 'none'; return }
    const r = el.getBoundingClientRect()
    box.style.display = 'block'
    box.style.left = r.left + 'px'
    box.style.top = r.top + 'px'
    box.style.width = r.width + 'px'
    box.style.height = r.height + 'px'
    box.classList.toggle('below', r.top < 20)
    box.firstChild.textContent = target.label || ''
    box.firstChild.style.display = target.label ? '' : 'none'
  }
  const reposition = () => {
    if (!selOutline) { selOutline = outline('sel'); hoverOutline = outline('hover') }
    place(selOutline, selected)
    place(hoverOutline, hovered.id && hovered.id !== selected.id ? hovered : { id: null })
  }

  // ── stamping, after every render ──
  let stampQueued = false
  let renderedTimer = 0
  const stampSoon = () => {
    if (stampQueued) return
    stampQueued = true
    win.requestAnimationFrame(() => {
      stampQueued = false
      const root = doc.getElementById('pageContent') || doc.body
      const count = opts.dataOf ? stampNodeIds(root, opts.dataOf) : 0
      reposition()
      win.clearTimeout(renderedTimer)
      renderedTimer = win.setTimeout(() => post({ kind: 'rendered', count }), 120)
    })
  }
  new win.MutationObserver(stampSoon).observe(doc.body, { childList: true, subtree: true })
  win.addEventListener('scroll', reposition, true)
  win.addEventListener('resize', reposition)

  // ── inert canvas: a click selects ──
  const stop = (e) => { e.preventDefault(); e.stopImmediatePropagation() }
  for (const name of INERT_EVENTS) win.addEventListener(name, stop, true)
  win.addEventListener('click', (e) => {
    stop(e)
    const path = typeof e.composedPath === 'function' ? e.composedPath() : [e.target]
    post({ kind: 'click', id: nodeIdOfPath(path) })
  }, true)
  win.addEventListener('mousemove', (e) => {
    const path = typeof e.composedPath === 'function' ? e.composedPath() : [e.target]
    const id = nodeIdOfPath(path)
    if (id === hovered.id) return
    hovered = { id, label: '' }
    reposition()
  }, true)
  doc.documentElement.addEventListener('mouseleave', () => { hovered = { id: null, label: '' }; reposition() })
  win.addEventListener('keydown', (e) => {
    const mod = e.metaKey || e.ctrlKey
    if (FORWARDED_KEYS[e.key] || (mod && /^[zZyY]$/.test(e.key))) {
      stop(e)
      post({ kind: 'key', key: e.key, code: e.code, metaKey: e.metaKey, ctrlKey: e.ctrlKey, shiftKey: e.shiftKey, altKey: e.altKey })
    }
  }, true)

  // ── the protocol ──
  win.addEventListener('message', (e) => {
    if (e.source !== win.parent) return
    const msg = e.data
    if (!msg || typeof msg !== 'object') return
    const kind = msg[PREVIEW_MESSAGE_KEY]
    if (kind === 'render' && msg.fragment) {
      fragment = msg.fragment
      const pending = waiters
      waiters = []
      pending.forEach((resolve) => resolve(fragment))
      rerender()
    } else if (kind === 'select') {
      selected = { id: msg.id || null, label: msg.label || '' }
      reposition()
      const el = selected.id ? elementOfNodeId(doc, selected.id) : null
      if (el && msg.reveal && typeof el.scrollIntoView === 'function') el.scrollIntoView({ block: 'nearest' })
    }
  })
  post({ kind: 'hello' })

  return {
    booted() {
      booted = true
      stampSoon()
    },
  }
}
