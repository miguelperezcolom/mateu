import { streamChat, buildChatBody, chatMarkdownToHtml } from './chat.mjs'
import { sanitizeHtml } from './richtext.mjs'
import { authHeadersOf } from './resilience.mjs'
import { hasConsentCookie, customComponentMountOf } from './reduceContexts.mjs'

// The DOM side of the display atoms that VB bindings cannot paint by themselves: the BPMN diagram
// (an SVG drawn from its BPMN-DI), the cookie consent band (a cookie decides whether it shows),
// the right click of a ContextMenu, and the Chat component (a streamed conversation). Same idiom as
// installRichText/installMaps: the atom leaves a slot with data-* attributes, a MutationObserver
// fills each slot when it appears. The pure parts (bpmnDiagramOf, hasConsentCookie,
// chatTurnsOf…) are tested in Node; this file only touches the DOM.

const SVG_NS = 'http://www.w3.org/2000/svg'

/** Observes the document and calls fill(el) for every element matching `selector` that appears
 *  (and when one of `attributes` changes on it). */
function observeSlots(doc, flag, selector, attributes, fill) {
  if (!doc || doc[flag] || typeof MutationObserver === 'undefined') return
  doc[flag] = true
  const scan = (root) => {
    if (!root || root.nodeType !== 1) return
    if (root.matches && root.matches(selector)) fill(root)
    for (const el of root.querySelectorAll(selector)) fill(el)
  }
  scan(doc.body || doc.documentElement)
  new MutationObserver((records) => {
    for (const r of records) {
      if (r.type === 'attributes') { if (r.target.matches && r.target.matches(selector)) fill(r.target) } else for (const n of r.addedNodes) scan(n)
    }
  }).observe(doc.body || doc.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: attributes })
}

// ── BPMN ────────────────────────────────────────────────────────────────────────────────────
/** Draws the diagram spec (bpmnDiagramOf) as SVG: tasks as rounded boxes, events as circles (the
 *  end one thicker), gateways as diamonds, flows as arrowed polylines, names as text. */
export function drawBpmn(el, spec, doc = el.ownerDocument) {
  const svg = doc.createElementNS(SVG_NS, 'svg')
  svg.setAttribute('viewBox', [spec.minX, spec.minY, spec.width, spec.height].join(' '))
  svg.setAttribute('width', '100%')
  svg.setAttribute('class', 'mateu-bpmn-svg')
  svg.setAttribute('aria-hidden', 'true')
  const el2 = (tag, attrs, parent = svg) => {
    const n = doc.createElementNS(SVG_NS, tag)
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, String(v))
    parent.appendChild(n)
    return n
  }
  const defs = el2('defs', {})
  const marker = el2('marker', { id: el.id + '-arrow', viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 8, markerHeight: 8, orient: 'auto-start-reverse' }, defs)
  el2('path', { d: 'M 0 0 L 10 5 L 0 10 z', class: 'mateu-bpmn-arrow' }, marker)
  for (const f of spec.flows || []) {
    el2('polyline', { points: f.points.map((p) => p.join(',')).join(' '), class: 'mateu-bpmn-flow', 'marker-end': 'url(#' + el.id + '-arrow)' })
    if (f.label) {
      const mid = f.points[Math.floor(f.points.length / 2)]
      const t = el2('text', { x: mid[0] + 4, y: mid[1] - 4, class: 'mateu-bpmn-flow-label' })
      t.textContent = f.label
    }
  }
  for (const n of spec.nodes || []) {
    const cx = n.x + n.w / 2
    const cy = n.y + n.h / 2
    if (n.kind === 'event' || n.kind === 'end') {
      el2('circle', { cx, cy, r: Math.min(n.w, n.h) / 2, class: 'mateu-bpmn-event' + (n.kind === 'end' ? ' mateu-bpmn-end' : '') })
    } else if (n.kind === 'gateway') {
      el2('polygon', { points: [[cx, n.y], [n.x + n.w, cy], [cx, n.y + n.h], [n.x, cy]].map((p) => p.join(',')).join(' '), class: 'mateu-bpmn-gateway' })
    } else if (n.kind === 'note') {
      el2('path', { d: 'M ' + (n.x + 12) + ' ' + n.y + ' L ' + n.x + ' ' + n.y + ' L ' + n.x + ' ' + (n.y + n.h) + ' L ' + (n.x + 12) + ' ' + (n.y + n.h), class: 'mateu-bpmn-note' })
    } else {
      el2('rect', { x: n.x, y: n.y, width: n.w, height: n.h, rx: n.kind === 'data' ? 2 : 10, class: 'mateu-bpmn-task' })
    }
    if (n.label) {
      const inside = n.kind === 'task' || n.kind === 'note'
      const t = el2('text', {
        x: inside ? cx : cx, y: inside ? cy : n.y + n.h + 14,
        'text-anchor': 'middle', 'dominant-baseline': inside ? 'middle' : 'hanging', class: 'mateu-bpmn-label',
      })
      // a long name wraps on words over up to three lines inside its box
      const words = String(n.label).split(/\s+/)
      const lines = []
      let line = ''
      const max = inside ? Math.max(8, Math.floor(n.w / 7)) : 18
      for (const w of words) {
        if ((line + ' ' + w).trim().length > max && line) { lines.push(line); line = w } else line = (line + ' ' + w).trim()
      }
      if (line) lines.push(line)
      lines.slice(0, 3).forEach((l, i) => {
        const span = el2('tspan', { x: cx, dy: i === 0 ? (inside ? -(Math.min(lines.length, 3) - 1) * 7 : 0) : 14 }, t)
        span.textContent = l
      })
    }
  }
  el.textContent = ''
  el.appendChild(svg)
}

export function installBpmn(doc = typeof document !== 'undefined' ? document : null) {
  observeSlots(doc, '__mateuBpmn', '[data-mateu-bpmn]', ['data-mateu-bpmn'], (el) => {
    const raw = el.getAttribute('data-mateu-bpmn') || ''
    if (el.__mateuBpmn === raw) return
    el.__mateuBpmn = raw
    let spec
    try { spec = JSON.parse(raw) } catch (e) { return }
    if (!spec || !(spec.nodes || []).length) { el.textContent = 'Empty process'; return }
    drawBpmn(el, spec, doc)
  })
}

// ── Cookie consent ─────────────────────────────────────────────────────────────────────────
export function installCookieConsent(doc = typeof document !== 'undefined' ? document : null) {
  if (!doc) return
  observeSlots(doc, '__mateuCookie', '[data-mateu-cookie]', ['data-mateu-cookie'], (el) => {
    const name = el.getAttribute('data-mateu-cookie')
    el.hidden = !!name && hasConsentCookie(doc.cookie, name)
  })
  if (doc.__mateuCookieClicks) return
  doc.__mateuCookieClicks = true
  doc.addEventListener('click', (e) => {
    const btn = e.target && e.target.closest ? e.target.closest('[data-mateu-cookie-dismiss]') : null
    const band = btn && btn.closest('[data-mateu-cookie]')
    if (!band) return
    const name = band.getAttribute('data-mateu-cookie')
    if (name) doc.cookie = encodeURIComponent(name) + '=dismiss; max-age=' + (365 * 24 * 3600) + '; path=/; SameSite=Lax'
    band.hidden = true
  }, true)
}

// ── ContextMenu: right click on the content before the menu opens that menu ───────────────────
export function installContextMenus(doc = typeof document !== 'undefined' ? document : null) {
  if (!doc || doc.__mateuContextMenus) return
  doc.__mateuContextMenus = true
  doc.addEventListener('contextmenu', (e) => {
    // the menu atom follows its content in the same block: look up a few levels for one
    let node = e.target
    for (let depth = 0; node && depth < 5; depth++, node = node.parentElement) {
      const holder = node.querySelector && node.querySelector('.mateu-context-menu[data-mateu-context-menu="true"]')
      if (!holder) continue
      const menu = holder.querySelector('oj-menu')
      if (!menu || typeof menu.open !== 'function') return
      e.preventDefault()
      try { menu.open(e) } catch (err) { /* not upgraded yet */ }
      return
    }
  })
}

// ── CustomComponent slots: the view the app registered paints itself into its slot ──────────────
export function installCustomComponents(doc = typeof document !== 'undefined' ? document : null) {
  observeSlots(doc, '__mateuCustomSlots', '[data-mateu-custom]', ['data-mateu-custom-props'], (el) => {
    const props = el.getAttribute('data-mateu-custom-props') || '{}'
    if (el.__mateuCustomProps === props) return
    el.__mateuCustomProps = props
    const mount = customComponentMountOf(el.getAttribute('data-mateu-custom'))
    if (!mount) return
    if (typeof el.__mateuCustomCleanup === 'function') { try { el.__mateuCustomCleanup() } catch (e) { /* its own */ } }
    el.textContent = ''
    let parsed = {}
    try { parsed = JSON.parse(props) } catch (e) { parsed = {} }
    try { el.__mateuCustomCleanup = mount(el, parsed) } catch (e) { el.textContent = 'Custom component failed: ' + (e && e.message) }
  })
}

// ── The Chat component ─────────────────────────────────────────────────────────────────────
/** A conversation's turns → what the panel shows: each with its role class and its HTML (the
 *  assistant's answer as sanitised Markdown, the user's text escaped). Pure. */
export function chatTurnsOf(turns) {
  const escape = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  return (turns || []).map((t) => ({
    role: t.role,
    cls: 'mateu-chat-turn mateu-chat-' + (t.role === 'user' ? 'user' : 'assistant'),
    html: t.role === 'user' ? '<p>' + escape(t.text) + '</p>' : sanitizeHtml(chatMarkdownToHtml(t.text || (t.error ? '' : '…'))),
  }))
}

const conversations = new Map()
const newSessionId = () => 'mateu-' + Math.random().toString(36).slice(2) + Date.now().toString(36)

export function installChatComponents(doc = typeof document !== 'undefined' ? document : null) {
  observeSlots(doc, '__mateuChatComponents', '[data-mateu-chat-url]', ['data-mateu-chat-url'], (el) => {
    if (el.__mateuChat) return
    el.__mateuChat = true
    const key = el.id || el.getAttribute('data-mateu-chat-url')
    if (!conversations.has(key)) conversations.set(key, { sessionId: newSessionId(), turns: [], busy: false })
    const conv = conversations.get(key)
    el.textContent = ''
    const log = doc.createElement('div')
    log.className = 'mateu-chat-log'
    log.setAttribute('role', 'log')
    log.setAttribute('aria-live', 'polite')
    const form = doc.createElement('form')
    form.className = 'mateu-chat-form'
    const input = doc.createElement('textarea')
    input.className = 'mateu-chat-input oj-typography-body-md'
    input.rows = 2
    input.setAttribute('aria-label', 'Message')
    input.placeholder = 'Ask something…'
    const send = doc.createElement('oj-button')
    send.setAttribute('data-oj-binding-provider', 'none')
    send.setAttribute('chroming', 'callToAction')
    send.textContent = 'Send'
    form.appendChild(input)
    form.appendChild(send)
    el.appendChild(log)
    el.appendChild(form)
    const paint = () => {
      log.textContent = ''
      for (const turn of chatTurnsOf(conv.turns)) {
        const div = doc.createElement('div')
        div.className = turn.cls
        div.innerHTML = turn.html
        log.appendChild(div)
      }
      log.scrollTop = log.scrollHeight
    }
    const submit = async () => {
      const text = input.value.trim()
      if (!text || conv.busy) return
      input.value = ''
      conv.busy = true
      conv.turns.push({ role: 'user', text })
      const answer = { role: 'assistant', text: '' }
      conv.turns.push(answer)
      paint()
      try {
        await streamChat({
          url: el.getAttribute('data-mateu-chat-url'),
          body: buildChatBody({ message: text, sessionId: conv.sessionId, currentRoute: location.pathname }),
          headers: () => authHeadersOf(),
          onText: (all) => { answer.text = all; paint() },
        })
      } catch (err) {
        answer.error = true
        answer.text = 'The assistant could not answer: ' + (err && err.message ? err.message : err)
      } finally {
        conv.busy = false
        paint()
      }
    }
    send.addEventListener('ojAction', (e) => { e.stopPropagation(); submit() })
    form.addEventListener('submit', (e) => { e.preventDefault(); submit() })
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit() } })
    paint()
  })
}
