import { chromeText } from './i18n.mjs'
import { streamChat, buildChatBody, chatMarkdownToHtml, chatStatusText, chatTurnTextOf, chatUsageTextOf, dispatchChatEvent, latestUsage, mergeTurnUsage, uploadChatFiles } from './chat.mjs'
import { sanitizeHtml } from './richtext.mjs'
import { authHeadersOf, askForReauthentication } from './resilience.mjs'
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
        x: cx, y: inside ? cy : n.y + n.h + 14,
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
    if (!spec || !(spec.nodes || []).length) { el.textContent = chromeText('emptyProcess'); return }
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
    try { el.__mateuCustomCleanup = mount(el, parsed) } catch (e) { el.textContent = chromeText('customFailed', { message: e && e.message }) }
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
// a chat session id names the conversation on the agent's side: unguessable, from the platform CSPRNG
const newSessionId = () => 'mateu-' + (globalThis.crypto && globalThis.crypto.randomUUID
  ? globalThis.crypto.randomUUID()
  : Array.from(globalThis.crypto.getRandomValues(new Uint8Array(16)), (b) => b.toString(16).padStart(2, '0')).join(''))

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
    input.setAttribute('aria-label', chromeText('chatInputLabel'))
    input.placeholder = chromeText('askSomething')
    const send = doc.createElement('oj-button')
    send.setAttribute('data-oj-binding-provider', 'none')
    send.setAttribute('chroming', 'callToAction')
    send.textContent = chromeText('chatSend')
    // what the agent is doing (its phase, the tool it calls, «Thinking… N s») and the tokens it used,
    // as in the shell panel: a polite status row and a quiet token line under the conversation
    const status = doc.createElement('div')
    status.className = 'mateu-chat-status oj-typography-body-sm oj-text-color-secondary'
    status.setAttribute('role', 'status')
    const tokens = doc.createElement('div')
    tokens.className = 'mateu-chat-tokens oj-typography-body-xs oj-text-color-secondary'
    // attachments, when the Chat declares an upload endpoint (Chat.uploadUrl): multipart "files"
    const uploadUrl = el.getAttribute('data-mateu-chat-upload') || ''
    let attachments = []
    const attached = doc.createElement('div')
    attached.className = 'mateu-chat-attached oj-typography-body-xs'
    if (uploadUrl) {
      const picker = doc.createElement('input')
      picker.setAttribute('type', 'file')
      picker.setAttribute('multiple', '')
      picker.setAttribute('hidden', '')
      const attach = doc.createElement('oj-button')
      attach.setAttribute('data-oj-binding-provider', 'none')
      attach.setAttribute('chroming', 'borderless')
      attach.setAttribute('class', 'mateu-chat-attach')
      attach.textContent = '📎'
      attach.setAttribute('aria-label', chromeText('chatAttach'))
      attach.setAttribute('title', chromeText('chatAttach'))
      attach.addEventListener('ojAction', (e) => { e.stopPropagation(); if (picker.click) picker.click() })
      picker.addEventListener('change', async () => {
        const files = Array.from(picker.files || [])
        if (!files.length) return
        try {
          const saved = await uploadChatFiles({ uploadUrl, files, sessionId: conv.sessionId, headers: authHeadersOf() })
          for (const f of saved) if (!attachments.some((a) => a.path === f.path)) attachments.push({ name: f.name || f.path, path: f.path })
        } catch (err) {
          conv.turns.push({ role: 'assistant', error: true, text: '⚠️ ' + (err && err.message ? err.message : String(err)) })
          paint()
        }
        picker.value = ''
        attached.textContent = attachments.length ? '📎 ' + attachments.map((a) => a.name).join(', ') : ''
      })
      form.appendChild(picker)
      form.appendChild(attach)
    }
    form.appendChild(input)
    form.appendChild(send)
    el.appendChild(log)
    el.appendChild(status)
    el.appendChild(tokens)
    el.appendChild(attached)
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
      tokens.textContent = chatUsageTextOf(conv.usage)
    }
    const submit = async () => {
      const text = input.value.trim()
      if ((!text && !attachments.length) || conv.busy) return
      input.value = ''
      conv.busy = true
      const sentAttachments = attachments
      attachments = []
      attached.textContent = ''
      const names = sentAttachments.map((a) => a.name).join(', ')
      conv.turns.push({ role: 'user', text: names ? `${text}${text ? '\n\n' : ''}📎 ${names}` : text })
      const answer = { role: 'assistant', text: '' }
      conv.turns.push(answer)
      paint()
      const startedAt = Date.now()
      let progress = null
      let turnUsage = null
      let accumulated = ''
      let failure = null
      const showStatus = () => {
        status.textContent = chatStatusText({ busy: true, hasText: !!accumulated, elapsedSeconds: (Date.now() - startedAt) / 1000, progress, now: Date.now() })
      }
      showStatus()
      const ticking = setInterval(showStatus, 1000)
      // the agent's UI events, AS THEY ARRIVE and in order, through the shell's dispatcher (the same
      // the shell panel uses: navigation, render-screen, close, any other to the page's subscribers)
      let events = Promise.resolve()
      try {
        accumulated = await streamChat({
          url: el.getAttribute('data-mateu-chat-url'),
          body: buildChatBody({ message: text, sessionId: conv.sessionId, attachments: sentAttachments, currentRoute: location.pathname }),
          headers: () => authHeadersOf(),
          reauthenticate: askForReauthentication,
          onText: (all) => { accumulated = all; answer.text = all; paint(); showStatus() },
          onProgress: (p) => { progress = p; showStatus() },
          onUsage: (usage) => { turnUsage = mergeTurnUsage(turnUsage, usage) },
          onEvent: (ev) => { events = events.then(() => dispatchChatEvent(ev)).catch(() => undefined) },
        }) || accumulated
      } catch (err) {
        failure = err || new Error('Error')
      } finally {
        clearInterval(ticking)
        answer.text = chatTurnTextOf(accumulated, failure)
        answer.error = !!failure
        conv.usage = latestUsage(conv.usage, turnUsage)
        status.textContent = ''
        conv.busy = false
        paint()
      }
      await events
    }
    send.addEventListener('ojAction', (e) => { e.stopPropagation(); void submit() })
    form.addEventListener('submit', (e) => { e.preventDefault(); void submit() })
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void submit() } })
    paint()
  })
}

// ── Fact actions in an oj-sp header: the icon button right after the fact's value ─────────────
// oj-sp's contextualInfo (the facts row of oj-sp-header-general-overview, also inside the general
// overview page) takes only {label, value}: it has no room for a fact's action (the pencil next to
// "EMPRESA"). The projection leaves the actions on the header element as JSON
// (`data-mateu-fact-actions`, factActionsJsonOf) and this puts a small icon button right after
// each value, which oj-sp draws as `<uid>_contextualInfo<index>`. oj-sp re-renders that row on
// its own, so it is re-checked on every change inside the header; a pass that finds everything in
// place touches nothing (no observer loop).
let factActionSink = null
/** Who runs a fact's action (the shell: the page's action channel, the one a Button's takes). */
export function setFactActionSink(fn) { factActionSink = typeof fn === 'function' ? fn : null }

const FACT_ACTIONS_HOST = '[data-mateu-fact-actions]'

/** The actions a header element carries ([] when none or unreadable). */
function factActionsOf(host) {
  const raw = host.getAttribute('data-mateu-fact-actions') || ''
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (e) {
    return []
  }
}

/** Puts (or keeps, or removes) each fact action's button right after its value inside `host`. */
export function decorateFactActions(host, doc = host.ownerDocument) {
  const actions = factActionsOf(host)
  const keyOf = (a) => a.index + ':' + a.actionId
  const wanted = {}
  for (const a of actions) wanted[keyOf(a)] = a
  // a button whose fact no longer acts (another record, another projection) goes
  for (const old of Array.from(host.querySelectorAll('.mateu-fact-action'))) {
    if (!wanted[old.getAttribute('data-mateu-fact-key')]) old.remove()
  }
  if (!actions.length) return
  const ids = Array.from(host.querySelectorAll('[id]'))
  for (const a of actions) {
    const key = keyOf(a)
    const value = ids.find((el) => String(el.id).endsWith('_contextualInfo' + a.index))
    if (!value || !value.parentNode) continue // oj-sp shows the first 4 facts only
    const parent = value.parentNode
    const siblings = Array.from(parent.childNodes)
    const next = siblings[siblings.indexOf(value) + 1] || null
    if (next && next.nodeType === 1 && next.getAttribute('data-mateu-fact-key') === key) continue
    const stale = host.querySelector('.mateu-fact-action[data-mateu-fact-key="' + key + '"]')
    if (stale) stale.remove()
    const button = doc.createElement('button')
    button.setAttribute('type', 'button')
    button.setAttribute('class', 'mateu-fact-action')
    button.setAttribute('data-mateu-fact-key', key)
    button.setAttribute('data-action-id', a.actionId)
    if (a.parameters) button.setAttribute('data-mateu-fact-parameters', JSON.stringify(a.parameters))
    if (a.label) {
      button.setAttribute('aria-label', a.label)
      button.setAttribute('title', a.label)
    }
    const glyph = doc.createElement('span')
    glyph.setAttribute('class', a.iconClass || 'oj-ux-ico-edit')
    glyph.setAttribute('aria-hidden', 'true')
    button.appendChild(glyph)
    parent.insertBefore(button, next)
  }
}

/** Installs (once) the fact action buttons of every header that carries some, and their clicks. */
export function installFactActions(doc = typeof document !== 'undefined' ? document : null) {
  if (!doc || doc.__mateuFactActions) return
  doc.__mateuFactActions = true
  doc.addEventListener('click', (e) => {
    const button = e.target && e.target.closest ? e.target.closest('.mateu-fact-action') : null
    if (!button || !factActionSink) return
    let parameters = {}
    try { parameters = JSON.parse(button.getAttribute('data-mateu-fact-parameters') || '{}') || {} } catch (err) { parameters = {} }
    factActionSink(button.getAttribute('data-action-id'), parameters, {})
  })
  const root = doc.body || doc.documentElement
  for (const host of Array.from(root.querySelectorAll(FACT_ACTIONS_HOST))) decorateFactActions(host, doc)
  if (typeof MutationObserver === 'undefined') return
  new MutationObserver((records) => {
    const hosts = new Set()
    for (const r of records) {
      const target = r.target && r.target.nodeType === 1 ? r.target : r.target && r.target.parentNode
      const host = target && target.closest ? target.closest(FACT_ACTIONS_HOST) : null
      if (host) hosts.add(host)
      for (const n of r.addedNodes || []) {
        if (n.nodeType !== 1) continue
        if (n.matches && n.matches(FACT_ACTIONS_HOST)) hosts.add(n)
        for (const h of Array.from(n.querySelectorAll ? n.querySelectorAll(FACT_ACTIONS_HOST) : [])) hosts.add(h)
      }
    }
    for (const host of hosts) decorateFactActions(host, doc)
  }).observe(root, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['data-mateu-fact-actions'] })
}
