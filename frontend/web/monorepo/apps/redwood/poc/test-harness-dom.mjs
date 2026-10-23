// A minimal DOM to test in Node, WITHOUT dependencies, the DOM wiring of the VB core (keys,
// dragging, action panels, matrix, gantt, floating windows, accessibility, rules, capture
// fields). It is not a browser: just what those modules use — element tree, attributes,
// classes, dataset, styles, simple CSS selectors (type, #id, .class, [attr], [attr="v"],
// descendant, comma lists), events with capture and bubbling, focus, configurable boxes and
// custom elements. It is not a test file (test-dom.mjs uses it); it does not go into the bridge.

export class FakeEvent {
  constructor(type, init = {}) {
    this.type = type
    this.bubbles = !!init.bubbles
    this.detail = init.detail
    this.defaultPrevented = false
    this.propagationStopped = false
    for (const [k, v] of Object.entries(init)) if (!(k in this)) this[k] = v
  }
  preventDefault() { this.defaultPrevented = true }
  stopPropagation() { this.propagationStopped = true }
  stopImmediatePropagation() { this.propagationStopped = true }
  composedPath() { return this.path || [] }
}

/** A copy of a real CustomEvent that is still called that (whoever serializes the event looks at it). */
const FakeCustomEvent = { CustomEvent: class CustomEvent extends FakeEvent {} }.CustomEvent

class Target {
  constructor() { this._listeners = [] }
  addEventListener(type, fn, opts) {
    const capture = opts === true || !!(opts && opts.capture)
    this._listeners.push({ type, fn, capture, once: !!(opts && opts.once) })
  }
  removeEventListener(type, fn, opts) {
    const capture = opts === true || !!(opts && opts.capture)
    this._listeners = this._listeners.filter((l) => !(l.type === type && l.fn === fn && l.capture === capture))
  }
  _fire(ev, phase) {
    for (const l of [...this._listeners]) {
      if (l.type !== ev.type) continue
      if (phase === 'capture' && !l.capture) continue
      if (phase === 'bubble' && l.capture) continue
      if (l.once) this.removeEventListener(l.type, l.fn, l.capture)
      ev.currentTarget = this
      l.fn.call(this, ev)
      if (ev.propagationStopped) return
    }
  }
  dispatchEvent(input) {
    // real events (Node's CustomEvent) have a read-only target: they are copied
    const ev = input instanceof FakeEvent ? input
      : new (input.constructor && input.constructor.name === 'CustomEvent' ? FakeCustomEvent : FakeEvent)(input.type, { bubbles: input.bubbles, detail: input.detail })
    ev.target = this
    const path = []
    for (let n = this; n; n = n.parentNode || (n.nodeType === 9 ? n.defaultView : null)) path.push(n)
    ev.path = path
    for (const n of [...path].reverse()) { if (n === this) break; n._fire(ev, 'capture'); if (ev.propagationStopped) return !ev.defaultPrevented }
    this._fire(ev, 'at')
    if (ev.bubbles && !ev.propagationStopped) for (const n of path.slice(1)) { n._fire(ev, 'bubble'); if (ev.propagationStopped) break }
    return !ev.defaultPrevented
  }
}

// ── selectores ─────────────────────────────────────────────────────────────────────────────────
function parseCompound(src) {
  const sel = { tag: null, id: null, classes: [], attrs: [] }
  let i = 0
  const ident = () => { let j = i; while (j < src.length && /[\w-]/.test(src[j])) j++; const s = src.slice(i, j); i = j; return s }
  while (i < src.length) {
    const c = src[i]
    if (c === '#') { i++; sel.id = ident() } else if (c === '.') { i++; sel.classes.push(ident()) } else if (c === '[') {
      i++
      let name = ''
      while (src[i] !== '=' && src[i] !== ']') name += src[i++]
      let value = null
      if (src[i] === '=') {
        i++
        const q = src[i]
        if (q === '"' || q === "'") {
          i++
          value = ''
          while (src[i] !== q) { if (src[i] === '\\') { value += src[i + 1]; i += 2 } else value += src[i++] }
          i++
        } else { value = ''; while (src[i] !== ']') value += src[i++] }
      }
      i++ // ]
      sel.attrs.push({ name: name.trim(), value })
    } else if (c === '*') { i++ } else sel.tag = ident().toLowerCase()
  }
  return sel
}
/** Split on a separator that is not inside [] or quotes. */
function splitTop(src, sep) {
  const out = []
  let depth = 0; let q = null; let cur = ''
  for (let i = 0; i < src.length; i++) {
    const c = src[i]
    if (q) { cur += c; if (c === '\\') { cur += src[++i]; continue } if (c === q) q = null; continue }
    if (c === '"' || c === "'") { q = c; cur += c; continue }
    if (c === '[') depth++
    if (c === ']') depth--
    if (depth === 0 && (sep === ',' ? c === ',' : /\s/.test(c))) { if (cur.trim()) out.push(cur.trim()); cur = ''; continue }
    cur += c
  }
  if (cur.trim()) out.push(cur.trim())
  return out
}
const matchesCompound = (el, s) => el.nodeType === 1
  && (!s.tag || el.tagName === s.tag)
  && (!s.id || el.getAttribute('id') === s.id)
  && s.classes.every((c) => el.classList.contains(c))
  && s.attrs.every((a) => el.hasAttribute(a.name) && (a.value == null || el.getAttribute(a.name) === a.value))
function matchesChain(el, chain) {
  if (!matchesCompound(el, chain[chain.length - 1])) return false
  let k = chain.length - 2
  for (let n = el.parentNode; n && k >= 0; n = n.parentNode) if (n.nodeType === 1 && matchesCompound(n, chain[k])) k--
  return k < 0
}
const compile = (selector) => splitTop(selector, ',').map((part) => splitTop(part, ' ').map(parseCompound))
const matchesSelector = (el, compiled) => compiled.some((chain) => matchesChain(el, chain))

// ── HTML: just enough for innerHTML (tags, attributes, text) ────────────────────────────────────
const VOID = new Set(['img', 'br', 'hr', 'input', 'meta', 'link', 'source', 'col', 'area', 'base', 'wbr'])
class FakeText {
  constructor(text) { this.nodeType = 3; this.textContent = text; this.parentNode = null; this.childNodes = [] }
  get isConnected() { let n = this; while (n.parentNode) n = n.parentNode; return n.nodeType === 9 }
  _connect() {}
  remove() { const p = this.parentNode; if (p) { p.childNodes.splice(p.childNodes.indexOf(this), 1); this.parentNode = null } }
}
const decode = (s) => String(s).replace(/&(lt|gt|quot|apos|amp|#(\d+)|#x([0-9a-f]+));/gi, (all, name, dec, hex) =>
  dec ? String.fromCodePoint(+dec) : hex ? String.fromCodePoint(parseInt(hex, 16))
    : ({ lt: '<', gt: '>', quot: '"', apos: "'", amp: '&' })[name.toLowerCase()])
function parseHtml(doc, html) {
  const root = new FakeElement('#root')
  root.ownerDocument = doc
  let cur = root
  // The tag's attribute text is one run of quoted strings or other non-'>' characters — disjoint
  // alternatives, so no input can be matched more than one way (no catastrophic backtracking).
  // Attributes are read out of it below; a trailing '/' marks a self-closing tag.
  const re = /<(\/?)([a-zA-Z][\w-]*)((?:"[^"]*"|'[^']*'|[^>"'])*)>|([^<]+)|</g
  let m
  while ((m = re.exec(html))) {
    if (m[4] !== undefined || m[0] === '<') { cur.childNodes.push(Object.assign(new FakeText(decode(m[4] ?? '<')), { parentNode: cur })); continue }
    const rawAttrs = m[3].trimEnd()
    const selfClosing = rawAttrs.endsWith('/')
    const attrText = selfClosing ? rawAttrs.slice(0, -1) : rawAttrs
    const tag = m[2].toLowerCase()
    if (m[1]) { for (let n = cur; n !== root; n = n.parentNode) if (n.tagName === tag) { cur = n.parentNode; break } continue }
    const el = doc.createElement(tag)
    for (const a of attrText.matchAll(/([^\s=>/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) el._attrs.set(a[1], decode(a[2] ?? a[3] ?? a[4] ?? ''))
    el.parentNode = cur
    cur.childNodes.push(el)
    if (!selfClosing && !VOID.has(tag)) cur = el
  }
  const nodes = root.childNodes
  nodes.forEach((n) => { n.parentNode = null })
  return nodes
}
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
function serialize(nodes, text = '') {
  return esc(text) + nodes.map((n) => {
    if (n.nodeType === 3) return esc(n.textContent)
    const attrs = n.attributes.map((a) => ' ' + a.name + '="' + String(a.value).replace(/"/g, '&quot;') + '"').join('')
    return '<' + n.tagName + attrs + '>' + (VOID.has(n.tagName) ? '' : serialize(n.childNodes, n._text) + '</' + n.tagName + '>')
  }).join('')
}

// ── elementos ──────────────────────────────────────────────────────────────────────────────────
const camel = (s) => s.replace(/-([a-z])/g, (_, c) => c.toUpperCase())
const kebab = (s) => s.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase())

export class FakeElement extends Target {
  constructor(tagName = 'div') {
    super()
    this.nodeType = 1
    this.tagName = String(tagName).toLowerCase()
    this.childNodes = []
    this.parentNode = null
    this._attrs = new Map()
    this._text = ''
    this.ownerDocument = null
    this._rect = null
    this.style = { cssText: '', setProperty(k, v) { this[k] = String(v) }, getPropertyValue(k) { return this[k] || '' } }
    const el = this
    this.classList = {
      _set: () => new Set((el.getAttribute('class') || '').split(/\s+/).filter(Boolean)),
      _write(s) { el.setAttribute('class', [...s].join(' ')) },
      contains(c) { return this._set().has(c) },
      add(...cs) { const s = this._set(); cs.forEach((c) => s.add(c)); this._write(s) },
      remove(...cs) { const s = this._set(); cs.forEach((c) => s.delete(c)); this._write(s) },
      toggle(c, force) { const s = this._set(); const on = force === undefined ? !s.has(c) : !!force; on ? s.add(c) : s.delete(c); this._write(s); return on },
      [Symbol.iterator]() { return this._set()[Symbol.iterator]() },
    }
    this.dataset = new Proxy({}, {
      get: (_, k) => (typeof k === 'string' ? (el.getAttribute('data-' + kebab(k)) ?? undefined) : undefined),
      set: (_, k, v) => { el.setAttribute('data-' + kebab(k), String(v)); return true },
    })
  }
  get children() { return this.childNodes.filter((n) => n.nodeType === 1) }
  get nextElementSibling() { const k = this.parentNode ? this.parentNode.children : []; return k[k.indexOf(this) + 1] || null }
  get previousElementSibling() { const k = this.parentNode ? this.parentNode.children : []; return k[k.indexOf(this) - 1] || null }
  get id() { return this.getAttribute('id') || '' }
  set id(v) { this.setAttribute('id', v) }
  get className() { return this.getAttribute('class') || '' }
  set className(v) { this.setAttribute('class', v) }
  get isConnected() { let n = this; while (n.parentNode) n = n.parentNode; return n.nodeType === 9 }
  get offsetParent() { return null }
  getAttribute(n) { return this._attrs.has(n) ? this._attrs.get(n) : null }
  hasAttribute(n) { return this._attrs.has(n) }
  setAttribute(n, v) {
    const old = this.getAttribute(n)
    this._attrs.set(n, String(v))
    this._changed(n, old, String(v))
  }
  removeAttribute(n) {
    if (!this._attrs.has(n)) return
    const old = this.getAttribute(n)
    this._attrs.delete(n)
    this._changed(n, old, null)
  }
  _changed(n, old, value) {
    const observed = this.constructor.observedAttributes
    if (observed && observed.includes(n) && typeof this.attributeChangedCallback === 'function') this.attributeChangedCallback(n, old, value)
  }
  get textContent() { return this._text + this.childNodes.map((c) => c.textContent).join('') }
  set textContent(v) { this.childNodes.forEach((c) => { c.parentNode = null }); this.childNodes = []; this._text = v == null ? '' : String(v) }
  get innerHTML() { return serialize(this.childNodes, this._text) }
  set innerHTML(v) { this.textContent = ''; for (const n of parseHtml(this.ownerDocument, String(v))) this.appendChild(n) }
  get content() { return this } // <template>: its content is itself (enough for sanitizing)
  get attributes() { return [...this._attrs].map(([name, value]) => ({ name, value })) }
  get firstElementChild() { return this.children[0] || null }
  get parentElement() { return this.parentNode && this.parentNode.nodeType === 1 ? this.parentNode : null }
  appendChild(child) { return this.insertBefore(child, null) }
  insertBefore(child, ref) {
    if (child.parentNode) child.remove()
    const i = ref ? this.childNodes.indexOf(ref) : -1
    if (i >= 0) this.childNodes.splice(i, 0, child); else this.childNodes.push(child)
    child.parentNode = this
    if (child.isConnected) child._connect()
    return child
  }
  _connect() {
    if (typeof this.connectedCallback === 'function') this.connectedCallback()
    for (const c of [...this.childNodes]) c._connect()
  }
  get firstChild() { return this.childNodes[0] || null }
  remove() {
    const p = this.parentNode
    if (!p) return
    p.childNodes.splice(p.childNodes.indexOf(this), 1)
    this.parentNode = null
    if (typeof this.disconnectedCallback === 'function') this.disconnectedCallback()
  }
  contains(other) { for (let n = other; n; n = n.parentNode) if (n === this) return true; return false }
  _descendants() { const out = []; const walk = (n) => { for (const c of n.childNodes) { if (c.nodeType === 1) { out.push(c); walk(c) } } }; walk(this); return out }
  querySelectorAll(sel) { const c = compile(sel); return this._descendants().filter((el) => matchesSelector(el, c)) }
  querySelector(sel) { return this.querySelectorAll(sel)[0] || null }
  matches(sel) { return matchesSelector(this, compile(sel)) }
  closest(sel) { const c = compile(sel); for (let n = this; n && n.nodeType === 1; n = n.parentNode) if (matchesSelector(n, c)) return n; return null }
  /** A box: by default 100×20 at the origin; `el.box({…})` sets it; `el.box(null)` = no box. */
  box(r) { this._rect = r === null ? 'none' : { left: 0, top: 0, width: 100, height: 20, ...r }; return this }
  getBoundingClientRect() {
    const r = this._rect && this._rect !== 'none' ? this._rect : { left: 0, top: 0, width: this._rect === 'none' ? 0 : 100, height: this._rect === 'none' ? 0 : 20 }
    return { ...r, right: r.left + r.width, bottom: r.top + r.height, x: r.left, y: r.top }
  }
  getClientRects() { return this._rect === 'none' ? [] : [this.getBoundingClientRect()] }
  focus() {
    if (this._rect === 'none') return // without a box it does not take, as in the browser
    const doc = this.ownerDocument
    if (doc) doc.activeElement = this
  }
  click() { this.dispatchEvent(new FakeEvent('click', { bubbles: true })) }
  scrollIntoView() {}
}

export class FakeDocument extends Target {
  constructor() {
    super()
    this.nodeType = 9
    this.parentNode = null
    this.childNodes = []
    this.registry = new Map()
    this.documentElement = this.createElement('html')
    this.documentElement.parentNode = this
    this.childNodes.push(this.documentElement)
    this.head = this.createElement('head')
    this.body = this.createElement('body')
    this.documentElement.appendChild(this.head)
    this.documentElement.appendChild(this.body)
    this.activeElement = this.body
    this.defaultView = null
    this.cookie = ''
  }
  createElement(tag) {
    const Cls = this.registry.get(String(tag).toLowerCase())
    const el = Cls ? new Cls() : new FakeElement(tag)
    el.tagName = String(tag).toLowerCase()
    el.ownerDocument = this
    if (el.tagName === 'canvas') {
      const ops = []
      el.width = 300; el.height = 150; el.ops = ops
      el.getContext = () => new Proxy({}, { get: (_, k) => (typeof k === 'string' ? (...a) => ops.push([k, ...a]) : undefined), set: () => true })
      el.toDataURL = (type = 'image/png') => 'data:' + type + ';base64,SIGNED'
      el.setPointerCapture = () => {}
    }
    return el
  }
  createTextNode(text) { return new FakeText(String(text)) }
  createElementNS(ns, tag) { const e = this.createElement(tag); e.namespaceURI = ns; return e }
  getElementById(id) { return this.documentElement.querySelectorAll('[id]').find((e) => e.id === id) || null }
  querySelectorAll(sel) { return this.documentElement.querySelectorAll(sel).concat(this.documentElement.matches(sel) ? [this.documentElement] : []) }
  querySelector(sel) { return this.querySelectorAll(sel)[0] || null }
  contains(n) { return this.documentElement.contains(n) }
}

/** A fake document + window. `el(tag, attrs, ...children)` builds trees. */
export function makeDom({ innerHeight = 800 } = {}) {
  const doc = new FakeDocument()
  const win = new Target()
  Object.assign(win, { document: doc, innerHeight, scrollX: 0, scrollY: 0, navigator: { language: 'en' } })
  doc.defaultView = win
  win.customElements = {
    get: (name) => doc.registry.get(name),
    define: (name, Cls) => doc.registry.set(name, Cls),
  }
  win.HTMLElement = FakeElement
  win.CustomEvent = FakeEvent
  const el = (tag, attrs = {}, ...children) => {
    const e = doc.createElement(tag)
    for (const [k, v] of Object.entries(attrs || {})) {
      if (k === 'text') e.textContent = v
      else if (k === 'box') e.box(v)
      else e.setAttribute(k, v === true ? '' : v)
    }
    for (const c of children) e.appendChild(c)
    return e
  }
  /** Fires an event like the browser: at the target, with capture and bubbling. */
  const fire = (target, type, init = {}) => {
    const ev = new FakeEvent(type, { bubbles: true, ...init })
    target.dispatchEvent(ev)
    return ev
  }
  return { doc, win, el, fire }
}

/** A DataTransfer with types (the MIME types the drag carries). */
export function dataTransfer(data = {}) {
  return { types: Object.keys(data), getData: (t) => data[t] ?? '', setData(t, v) { data[t] = v; this.types = Object.keys(data) }, dropEffect: 'none', effectAllowed: 'all' }
}

/** Advance real timers without blocking (setTimeout of 0..N ms). */
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
