// poc/chat.mjs — the AI CHAT core, renderer-neutral (Redwood/VB parity with the web chat).
//
// The web chat (libs/mateu/.../mateu-chat.ts + chatStream.ts + chatEvents.ts) keeps its transport
// and its event decisions in pure modules next to the Lit panel. This is their port for VB, where the
// panel is the shell's (shell-page.html + the chatSend chain) and the inline Chat component is
// displayDom's: building the turn's body, flattening the menu as context, reading the SSE stream by
// event and classifying each `data:` payload, accumulating the answer, the progress and token
// lines, and what to do with the UI events the agent sends (navigation-requested, close-requested,
// render-screen and any other). Tested in Node (poc/test.mjs); the streaming loop takes an injectable
// `fetchImpl`. It is concatenated into the AMD bundle (make-amd strips the imports).

import { chromeText } from './i18n.mjs'
import { busSubscribersOf, callMateu } from './transport.mjs'
import { neutralizeUntrusted } from './untrusted.mjs'
import { storedTokenMayGoTo, isTrustedOrigin } from './hostHeaders.mjs'

/** Recognises a `data:` payload that is a token-usage object ({inputTokens|outputTokens|totalTokens}). */
export function tryParseTokenUsage(payload) {
  const trimmed = (payload || '').trim()
  if (!trimmed.startsWith('{')) return null
  try {
    const obj = JSON.parse(trimmed)
    if ('inputTokens' in obj || 'outputTokens' in obj || 'totalTokens' in obj) return obj
  } catch {
    // not valid JSON
  }
  return null
}

/** Recognises a `data:` payload that is a custom agent event ({event, detail}). */
export function tryParseCustomEvent(payload) {
  const trimmed = (payload || '').trim()
  if (!trimmed.startsWith('{')) return null
  try {
    const obj = JSON.parse(trimmed)
    if (typeof obj.event === 'string') return { event: obj.event, detail: obj.detail ?? {} }
  } catch {
    // not valid JSON
  }
  return null
}

/** Flattens the menu into the context the LLM receives (only on the first message). Same shape as
 *  the shared chat's `MenuContextEntry`: breadcrumb `path` + `navigation` object. Skips
 *  separators and remote entries not yet resolved (their route points at the loader, not at a screen). */
export function buildChatMenuContext(options, parentPath = []) {
  const result = []
  for (const opt of options || []) {
    if (opt.separator) continue
    if (opt.remote) continue
    const path = [...parentPath, opt.label]
    if (opt.submenus && opt.submenus.length > 0) {
      result.push(...buildChatMenuContext(opt.submenus, path))
    } else {
      const entry = {
        path,
        navigation: {
          route: opt.route,
          consumedRoute: opt.consumedRoute,
          actionId: opt.actionId ?? '',
          baseUrl: opt.baseUrl,
          serverSideType: opt.serverSideType,
          uriPrefix: opt.uriPrefix,
        },
      }
      if (opt.description) entry.description = opt.description
      // what the agent needs to SHOW rows in this listing: its URL filters, the row's id
      // field and the selection parameter (?ids=…). The server publishes it in the menu.
      if (opt.listing) entry.listing = opt.listing
      result.push(entry)
    }
  }
  return result
}

/** The chat POST body. `menuContext` only travels on the first message (the caller decides). */
export function buildChatBody({ message, sessionId, attachments, context, mcpUrl, menuContext, currentRoute }) {
  return {
    message: message ?? '',
    sessionId,
    // the route of the screen the question is asked from: the control plane's routing rules
    // choose the agent by it
    ...(currentRoute ? { currentRoute } : {}),
    ...(attachments && attachments.length ? { attachments } : {}),
    ...(context !== undefined && context !== null ? { context } : {}),
    ...(mcpUrl ? { mcpUrl } : {}),
    ...(menuContext && menuContext.length ? { menuContext } : {}),
  }
}

/** Uploads files to the `@AI(upload=…)` endpoint as multipart; returns the saved `{name, path}`. */
/**
 * The credential headers a chat request to `url` may carry: all of them to an origin trusted with
 * the user's token (the page's, the shell's backend, the remotes its app names —
 * hostHeaders.storedTokenMayGoTo), NONE to any other. A `Chat` names its `sseUrl`/`uploadUrl` in a
 * screen, and a screen may come from a remote or an agent: the token must not follow it there (the
 * web client's credentialHeadersFor does the same).
 */
export function chatHeadersFor(url, headers) {
  return storedTokenMayGoTo(url) ? (headers || {}) : {}
}

export async function uploadChatFiles({ uploadUrl, files, sessionId, headers = {}, fetchImpl = globalThis.fetch, FormDataImpl = globalThis.FormData }) {
  const form = new FormDataImpl()
  for (const f of files || []) form.append('files', f)
  if (sessionId) form.append('sessionId', sessionId)
  const response = await fetchImpl(uploadUrl, { method: 'POST', headers: chatHeadersFor(uploadUrl, headers), body: form })
  if (!response.ok) throw new Error(chromeText('chatUploadFailed', { status: response.status }))
  const result = await response.json()
  return ((result && result.files) || []).filter((f) => f && f.path)
}

// ── The SSE stream, read as SSE ──────────────────────────────────────────────────────────────
// By EVENT, not by line: an event's `data:` lines are joined with '\n' and a blank line
// closes it; from `data:` only the optional space is removed (markdown indentation survives);
// comments (`:keep-alive`) and other fields are ignored. Same logic as the shared chat
// (libs/mateu/.../chatStream.ts) — keep both in step.

/** An incremental SSE reader: `push(text)` returns the `data` of the events that have closed;
 *  `end()` the one the stream left without a blank line after it. */
export function createSseParser() {
  let buffer = ''
  let data = []
  let hasData = false
  const dispatch = (out) => {
    if (hasData) out.push(data.join('\n'))
    data = []
    hasData = false
  }
  const line = (l, out) => {
    if (l === '') { dispatch(out); return }
    if (l.startsWith(':')) return
    const colon = l.indexOf(':')
    const field = colon < 0 ? l : l.slice(0, colon)
    if (field !== 'data') return
    let value = colon < 0 ? '' : l.slice(colon + 1)
    if (value.startsWith(' ')) value = value.slice(1)
    data.push(value)
    hasData = true
  }
  return {
    push(text) {
      buffer += text
      const out = []
      for (;;) {
        const m = /\r\n|\r|\n/.exec(buffer)
        if (!m) break
        // a trailing '\r' may be the first half of a '\r\n' split across chunks
        if (m[0] === '\r' && m.index === buffer.length - 1) break
        const l = buffer.slice(0, m.index)
        buffer = buffer.slice(m.index + m[0].length)
        line(l, out)
      }
      return out
    },
    end() {
      const out = []
      if (buffer) { line(buffer.replace(/\r$/, ''), out); buffer = '' }
      dispatch(out)
      return out
    },
  }
}

/**
 * What an event's `data` is: token usage, a piece of the answer (agent-delta), a phase
 * (agent-status), a tool (agent-tool), an error (agent-error), another UI event, or text.
 */
export function classifyChatPayload(payload) {
  const usage = tryParseTokenUsage(payload)
  if (usage) return { kind: 'usage', usage }
  const ev = tryParseCustomEvent(payload)
  if (ev) {
    const detail = ev.detail || {}
    if (ev.event === 'agent-delta') return { kind: 'delta', text: typeof detail.text === 'string' ? detail.text : '' }
    if (ev.event === 'agent-status') return { kind: 'status', detail }
    if (ev.event === 'agent-tool') return { kind: 'tool', detail }
    if (ev.event === 'agent-error') return { kind: 'error', message: String(detail.message || chromeText('chatAgentError')) }
    return { kind: 'event', event: ev.event, detail: ev.detail }
  }
  return { kind: 'text', text: payload ?? '' }
}

/** A usage that says nothing: all its counters at zero (the markers of older agents). */
export function isEmptyUsage(usage) {
  if (!usage) return true
  const values = ['inputTokens', 'outputTokens', 'totalTokens'].map((k) => usage[k]).filter((v) => typeof v === 'number' && Number.isFinite(v))
  return values.length === 0 || values.every((v) => v === 0)
}

/**
 * What the agent says it is doing in this answer: the phase, the tools (the running one
 * and those already done, with their duration or their error) and whether it is already writing. `line(now)` is the
 * status row: «Llamando a booking_findBookings… 3 s», «Respondiendo…», «Conectando con 2 servidores MCP…»;
 * null if the agent has not reported anything (older agents: the panel keeps «Pensando… N s»).
 */
export function createChatProgress(now = Date.now()) {
  const p = {
    phase: undefined, statusText: undefined, since: now, steps: [], answering: false, reported: false,
    status(detail, at) {
      p.reported = true
      const text = typeof (detail && detail.text) === 'string' ? detail.text : undefined
      if ((detail && detail.phase) !== p.phase || text !== p.statusText || p.answering) p.since = at
      p.phase = detail && detail.phase
      p.statusText = text
      p.answering = false
    },
    tool(detail, at) {
      p.reported = true
      const d = detail || {}
      const name = d.name || chromeText('chatTool')
      if (d.phase === 'start') {
        p.steps = [...p.steps, { name, server: d.server, kind: d.kind, running: true }]
        p.since = at
        p.answering = false
        return
      }
      const steps = p.steps.slice()
      let i = steps.length - 1
      while (i >= 0 && !(steps[i].running && steps[i].name === name)) i--
      const done = { name, server: d.server, kind: d.kind, ms: d.ms, error: d.error, running: false }
      if (i >= 0) steps[i] = done; else steps.push(done)
      p.steps = steps
      p.since = at
    },
    text(at) {
      if (!p.answering) p.since = at
      p.answering = true
    },
    runningTool() {
      for (let i = p.steps.length - 1; i >= 0; i--) if (p.steps[i].running) return p.steps[i]
      return undefined
    },
    line(at) {
      const secs = Math.max(0, Math.floor((at - p.since) / 1000))
      const withSecs = (s) => (secs > 0 ? `${s} ${secs} s` : s)
      const running = p.runningTool()
      if (running) return withSecs(chromeText('chatCalling', { name: running.name }))
      if (p.answering) return chromeText('chatAnswering')
      if (!p.reported) return null
      return withSecs(p.statusText || chromeText('chatThinking'))
    },
  }
  return p
}

/**
 * Posts a message to the chat stream and consumes the SSE response, by events (see
 * createSseParser). Each `data` is token usage, a custom event, agent progress, a
 * piece of the answer (agent-delta: it is APPENDED), or text: after pieces, the first one is the whole
 * answer and REPLACES THEM (the agent sends it clean at the end); without pieces, each text is a line
 * — the usual contract of agents that send the answer line by line. `agent-error` is
 * shown as the assistant's text. Returns the final text. `fetchImpl` is injectable for tests.
 *
 * A 401 is recovered as in the rest of the traffic (fetchWithPolicy): `reauthenticate` asks the
 * page to reauthenticate and, if it does, the message is resent ONCE. That is why `headers` can be
 * a function: it is evaluated on every send, and the resend carries the NEW token, not the one just
 * rejected — or the missing one: in ec1 the chat went out without a token because at that moment there
 * was none in localStorage, and it showed "Servidor respondió 401" while the screens, which do
 * reauthenticate, kept working. With nobody to reauthenticate, or if the resend gets 401 again,
 * it fails as always.
 *
 * @param headers         headers object, or () => object (read on every send)
 * @param reauthenticate  async () => boolean — true if it must be resent (askForReauthentication)
 *
 * @param onText     (accumulatedText) => void   — on every change of the text (to repaint the message)
 * @param onDelta    (piece, accumulatedText) => void — on every piece that arrives while streaming
 * @param onProgress (progress) => void          — on every phase/tool (createChatProgress)
 * @param onEvent    ({event, detail}) => void   — custom agent event (≠ agent-*)
 * @param onUsage    (usage) => void             — token-usage object (all-zero ones do not arrive)
 */
export async function streamChat({ url, body, headers = {}, reauthenticate, fetchImpl = globalThis.fetch, onText, onDelta, onProgress, onEvent, onUsage, now = () => Date.now() }) {
  const payload = typeof body === 'string' ? body : JSON.stringify(body)
  const send = () => fetchImpl(url, {
    method: 'POST',
    headers: {
      Accept: 'text/event-stream', 'Content-Type': 'application/json',
      ...chatHeadersFor(url, typeof headers === 'function' ? headers() : headers),
    },
    body: payload,
  })
  let response = await send()
  if (response.status === 401 && reauthenticate && await reauthenticate()) {
    response = await send()
  }
  if (!response.ok) {
    const errorText = response.text ? await response.text() : ''
    throw new Error(chromeText('chatServerError', { status: response.status, text: errorText }))
  }
  const reader = response.body && response.body.getReader ? response.body.getReader() : null
  if (!reader) throw new Error(chromeText('chatNoReader'))

  const decoder = new TextDecoder()
  const parser = createSseParser()
  const progress = createChatProgress(now())
  let accumulated = ''
  // there were pieces since the last whole text: the next text replaces them
  let streamed = false

  const handlePayload = (data) => {
    const msg = classifyChatPayload(data)
    switch (msg.kind) {
      case 'usage':
        if (!isEmptyUsage(msg.usage) && onUsage) onUsage(msg.usage)
        return
      case 'delta':
        accumulated += msg.text
        streamed = true
        progress.text(now())
        if (onDelta) onDelta(msg.text, accumulated)
        if (onText) onText(accumulated)
        if (onProgress) onProgress(progress)
        return
      case 'text':
        if (streamed) { accumulated = msg.text; streamed = false } else accumulated = accumulated ? accumulated + '\n' + msg.text : msg.text
        progress.text(now())
        if (onText) onText(accumulated)
        if (onProgress) onProgress(progress)
        return
      case 'error':
        accumulated = '⚠️ ' + msg.message
        streamed = false
        if (onText) onText(accumulated)
        return
      case 'status':
        progress.status(msg.detail, now())
        if (onProgress) onProgress(progress)
        return
      case 'tool':
        progress.tool(msg.detail, now())
        if (onProgress) onProgress(progress)
        return
      default:
        if (onEvent) onEvent({ event: msg.event, detail: msg.detail })
    }
  }

  while (true) {
    const { done, value } = await reader.read()
    if (done) {
      parser.push(decoder.decode())
      parser.end().forEach(handlePayload)
      break
    }
    parser.push(decoder.decode(value, { stream: true })).forEach(handlePayload)
  }
  return accumulated
}

// ---- The panel state while the assistant works, the tokens and dictation ------------------

/**
 * The usage of ONE answer: the stream may send more than one usage object; within an answer
 * the last value of each counter wins, as in the shared chat (merge, not sum).
 */
export function mergeTurnUsage(turn, usage) {
  return { ...(turn || {}), ...(usage || {}) }
}

/**
 * The usage the panel shows after an answer: that of THAT answer, which is what the agent sends
 * as the conversation total (ec-demo1's ia-agent sends the session's running total; summing it
 * counted each answer again in every following answer). An answer without usage keeps the one
 * there was. Same criterion as the shared chat: it is replaced, not summed.
 */
export function latestUsage(previous, turn) {
  const keys = ['inputTokens', 'outputTokens', 'totalTokens']
  const has = turn && keys.some((k) => typeof turn[k] === 'number' && Number.isFinite(turn[k]))
  if (!has) return previous || null
  const out = {}
  for (const k of keys) if (typeof turn[k] === 'number' && Number.isFinite(turn[k])) out[k] = turn[k]
  return out
}

/**
 * The conversation totals: the usage of each finished answer is summed — for an agent that
 * sends the usage of each answer separately. The panel no longer uses it (see latestUsage). Only the
 * numeric counters; null if there is none yet (the panel does not show an empty row).
 */
export function addUsage(total, turn) {
  const keys = ['inputTokens', 'outputTokens', 'totalTokens']
  const out = { ...(total || {}) }
  let any = total ? keys.some((k) => typeof total[k] === 'number') : false
  for (const k of keys) {
    const v = turn && turn[k]
    if (typeof v === 'number' && Number.isFinite(v)) {
      out[k] = (typeof out[k] === 'number' ? out[k] : 0) + v
      any = true
    }
  }
  return any ? out : null
}

/**
 * What the status row under the conversation says: nothing if the assistant is not working; what the agent
 * says it is doing, if it says so (`progress`, from createChatProgress: the tool it is calling with its
 * seconds, the phase, «Respondiendo…»); otherwise — agents that do not report —, «Pensando…» with the
 * seconds while nothing has arrived (the long wait is the worrying one) and «Respondiendo…» as
 * soon as the first text arrives.
 */
export function chatStatusText({ busy, hasText, elapsedSeconds, progress, now }) {
  if (!busy) return ''
  const line = progress && progress.line ? progress.line(typeof now === 'number' ? now : Date.now()) : null
  if (line) return line
  if (hasText) return chromeText('chatAnswering')
  const s = Math.max(0, Math.floor(elapsedSeconds || 0))
  return s > 0 ? chromeText('chatThinkingFor', { s }) : chromeText('chatThinking')
}

/** The browser's speech-recognition constructor, or null where it does not exist (Firefox). */
export function speechRecognitionCtor(win = globalThis) {
  return (win && (win.SpeechRecognition || win.webkitSpeechRecognition)) || null
}

/** The dictated text: the last recognised result (same criterion as the shared chat). */
export function transcriptOf(event) {
  const results = event && event.results
  if (!results || !results.length) return ''
  const last = results[results.length - 1]
  return (last && last[0] && last[0].transcript ? String(last[0].transcript) : '').trim()
}

/**
 * The chat microphone shortcut: Ctrl+Shift+M on every platform (on macOS also Ctrl, not
 * Cmd — Cmd+Shift+M switches profile in Chrome and Option+M types «µ»). Exactly Ctrl and Shift,
 * without Alt or Cmd, and not the auto-repeat of a held key. The key is recognised by its character
 * (AZERTY included) or, on a keyboard whose M does not type a Latin letter, by its position (KeyM).
 */
export const CHAT_MIC_SHORTCUT = 'Ctrl+Shift+M'
export const CHAT_MIC_ARIA_KEYSHORTCUTS = 'Control+Shift+M'

export function isChatMicShortcut(event) {
  if (!event || !event.ctrlKey || !event.shiftKey || event.altKey || event.metaKey || event.repeat) return false
  const key = typeof event.key === 'string' ? event.key : ''
  if (/^[a-z]$/i.test(key)) return key.toLowerCase() === 'm'
  return event.code === 'KeyM'
}

// ── Markdown of the answers ──────────────────────────────────────────────────────────────────
// The agent answers in markdown (bold, lists, tables, code). The shared chat paints it with
// marked + DOMPurify; here there is no npm in the AMD bundle, so the subset agents use is
// converted by hand, ESCAPING FIRST: all HTML in the text comes out as text, and the only tags
// in the result are the ones this function adds (no attributes except href/target/rel of
// http(s) links). Safe by construction, no sanitiser. It tolerates streaming's half-written markdown: an
// unclosed code block is code until the end, and an unpaired ** stays as text.

const MD_ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }
const mdEscape = (s) => String(s).replace(/[&<>"']/g, (c) => MD_ESC[c])

/** The inline markdown of an ALREADY escaped text: code, links, bold, italics. */
function mdInline(escaped) {
  const codes = []
  // each link's opening tag is set aside until the end: its href may carry `_` or `*`
  // (ids=A_B) and the bold/italics below would break it
  const opens = []
  const open = (tag) => { opens.push(tag); return `\u0001${opens.length - 1}\u0001` }
  let s = escaped.replace(/`([^`\n]+)`/g, (_, c) => { codes.push(c); return `\u0000${codes.length - 1}\u0000` })
  // links: only http(s); the URL comes already escaped (quotes cannot close the attribute)
  s = s.replace(/\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)/g,
    (_, text, url) => `${open(`<a href="${url}" target="_blank" rel="noopener noreferrer">`)}${text}</a>`)
  // and the app's own routes (`[4MBZS7](/booking/bookings/4MBZS7)`): a link that navigates INSIDE
  // the console (the bubble hooks it, chatRouteOfLink) — without reloading or opening a tab. Only
  // a route starting with ONE slash: `//host` would be another site.
  s = s.replace(/\[([^\]\n]+)\]\((\/(?!\/)[^\s)]*)\)/g,
    (_, text, route) => `${open(`<a href="${route}" class="mateu-chat-route" data-mateu-route="${route}">`)}${text}</a>`)
  s = s.replace(/\*\*([^*\n]+?)\*\*/g, '<strong>$1</strong>').replace(/__([^_\n]+?)__/g, '<strong>$1</strong>')
  s = s.replace(/(^|[^*\w])\*([^*\s][^*\n]*?)\*(?!\w)/g, '$1<em>$2</em>')
    .replace(/(^|[^_\w])_([^_\s][^_\n]*?)_(?!\w)/g, '$1<em>$2</em>')
  return s.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${codes[+i]}</code>`)
    .replace(/\u0001(\d+)\u0001/g, (_, i) => opens[+i])
}

/**
 * The route a click on a chat link navigates to, or null if the click is not ours: only
 * links to app routes (mateu-chat-route) and a plain click — with Ctrl/Cmd/Shift or the middle
 * button the browser does its own thing (opening it in another tab keeps working: the href is the URL).
 */
export function chatRouteOfLink(anchor, event) {
  if (!anchor || !anchor.getAttribute) return null
  const route = anchor.getAttribute('data-mateu-route')
  if (!route || route.charAt(0) !== '/' || route.charAt(1) === '/') return null
  if (event && (event.button > 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)) return null
  return route
}

const MD_TABLE_SEP = /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/
const mdCells = (line) => line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => mdInline(mdEscape(c.trim())))

/**
 * The markdown of an assistant answer as safe HTML for its bubble: paragraphs with line
 * breaks, headings, lists (numbered and not), quotes, rules, code blocks and snippets, tables,
 * http(s) links (in another tab), bold and italics.
 */
export function chatMarkdownToHtml(text) {
  const lines = String(text ?? '').replace(/\r\n?/g, '\n').split('\n')
  const out = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    // code block (``` … ```); unclosed —the half-done stream— it runs to the end
    const fence = line.match(/^\s*```/)
    if (fence) {
      const body = []
      i++
      while (i < lines.length && !/^\s*```/.test(lines[i])) body.push(lines[i++])
      i++
      out.push(`<pre><code>${mdEscape(body.join('\n'))}</code></pre>`)
      continue
    }
    if (/^\s*$/.test(line)) { i++; continue }
    const heading = line.match(/^\s*(#{1,6})\s+(.*)$/)
    if (heading) {
      const level = Math.min(6, heading[1].length + 2)   // h3…h6: inside a bubble, not a page
      out.push(`<h${level}>${mdInline(mdEscape(heading[2].replace(/\s*#+\s*$/, '')))}</h${level}>`)
      i++
      continue
    }
    if (/^\s*([-*_])(\s*\1){2,}\s*$/.test(line)) { out.push('<hr>'); i++; continue }
    // table: header | a | b | followed by |---|---|
    if (line.includes('|') && i + 1 < lines.length && MD_TABLE_SEP.test(lines[i + 1])) {
      const head = mdCells(line)
      i += 2
      const rows = []
      while (i < lines.length && lines[i].includes('|') && !/^\s*$/.test(lines[i])) rows.push(mdCells(lines[i++]))
      out.push('<table><thead><tr>' + head.map((c) => `<th>${c}</th>`).join('') + '</tr></thead><tbody>'
        + rows.map((r) => '<tr>' + r.map((c) => `<td>${c}</td>`).join('') + '</tr>').join('') + '</tbody></table>')
      continue
    }
    if (/^\s*>/.test(line)) {
      const quote = []
      while (i < lines.length && /^\s*>/.test(lines[i])) quote.push(lines[i++].replace(/^\s*>\s?/, ''))
      out.push(`<blockquote>${chatMarkdownToHtml(quote.join('\n'))}</blockquote>`)
      continue
    }
    const item = line.match(/^(\s*)([-*+]|\d+[.)])\s+(.*)$/)
    if (item) {
      out.push(mdList(lines, i, (next) => { i = next }))
      continue
    }
    // paragraph: consecutive lines up to a blank one or a block; each break, a <br>
    const para = []
    while (i < lines.length && !/^\s*$/.test(lines[i]) && !/^\s*(```|#{1,6}\s|>|([-*+]|\d+[.)])\s)/.test(lines[i])
      && !(lines[i].includes('|') && i + 1 < lines.length && MD_TABLE_SEP.test(lines[i + 1]))) {
      para.push(mdInline(mdEscape(lines[i++].trim())))
    }
    if (para.length) out.push(`<p>${para.join('<br>')}</p>`)
    else i++
  }
  return out.join('')
}

/** A list (and its sublists, by indentation) from line `start`; returns its HTML and advances. */
function mdList(lines, start, advance) {
  const first = lines[start].match(/^(\s*)([-*+]|\d+[.)])\s+/)
  const indent = first[1].length
  const ordered = /\d/.test(first[2])
  const items = []
  let i = start
  while (i < lines.length) {
    const m = lines[i].match(/^(\s*)([-*+]|\d+[.)])\s+(.*)$/)
    if (m && m[1].length === indent && /\d/.test(m[2]) === ordered) {
      items.push({ text: mdInline(mdEscape(m[3])), sub: '' })
      i++
      continue
    }
    if (m && m[1].length > indent && items.length) {
      items[items.length - 1].sub += mdList(lines, i, (next) => { i = next })
      continue
    }
    // continuation of an item: an indented line that is not another item
    if (!m && items.length && /^\s{2,}\S/.test(lines[i])) {
      items[items.length - 1].text += '<br>' + mdInline(mdEscape(lines[i].trim()))
      i++
      continue
    }
    break
  }
  advance(i)
  const tag = ordered ? 'ol' : 'ul'
  return `<${tag}>` + items.map((it) => `<li>${it.text}${it.sub}</li>`).join('') + `</${tag}>`
}

/**
 * Keeps a chat's message list scrolled to its last message while it grows: a new message, or an
 * answer streaming in chunk by chunk. Nothing scrolled it, so the answer kept arriving below the
 * fold. It follows the end only while the reader is at it (within `slack` px): someone who scrolled
 * up to reread is left there, and is followed again once back at the end or after sending. Returns
 * a function that stops it. `el` is the scrolling element (overflow-y: auto).
 */
export function stickChatToBottom(el, { slack = 48, isUserMessage = (node) => !!(node && node.querySelector && node.querySelector('.mateu-chat-user-text')) } = {}) {
  if (!el || typeof MutationObserver === 'undefined') return () => {}
  let stick = true
  const atEnd = () => el.scrollHeight - el.scrollTop - el.clientHeight <= slack
  const toEnd = () => { el.scrollTop = el.scrollHeight }
  const onScroll = () => { stick = atEnd() }
  el.addEventListener('scroll', onScroll, { passive: true })
  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      for (const node of m.addedNodes || []) {
        if (node.nodeType === 1 && (isUserMessage(node) || (node.classList && node.classList.contains('mateu-chat-user-text')))) stick = true
      }
    }
    if (stick) toEnd()
  })
  observer.observe(el, { childList: true, subtree: true, characterData: true })
  toEnd()
  return () => { observer.disconnect(); el.removeEventListener('scroll', onScroll) }
}

// ---- Parity with the web chat (libs/mateu mateu-chat.ts): what the VB panel needed ----------
//
// The shared chat sends with each message, besides the text: the screen CONTEXT (url,
// title, appState/appData, the component state — its contextProvider), a self-describing
// PROJECTION of the screen (screenContext.ts: fields with type/label/value + actions, the
// same an MCP agent receives), the @AI's `mcpUrl` and the attachments; it titles the panel with @App(askLabel); it shows the tools the
// agent uses in the current turn; and it explains an empty answer or a network cut. All pure here.

/** The panel configuration from the shell (the bootstrap App) and the backend base. */
export function chatConfigOf(shell, base = '') {
  const s = shell || {}
  const abs = (u) => resolveChatUrl(u, base)
  return {
    sseUrl: abs(s.sseUrl),
    uploadUrl: abs(s.uploadUrl),
    mcpUrl: abs(s.mcpUrl),
    // the panel title: the App's brand (@App(askLabel)), otherwise «Assistant»
    title: String(s.askLabel || '').trim() || chromeText('chatTitle'),
  }
}

const mdTypeOf = (node) => (node && node.metadata && typeof node.metadata.type === 'string' ? node.metadata.type : undefined)

/**
 * The screen projected for the agent — port of screenContext.ts `projectScreen`: the FormFields
 * (id, label, type, stereotype, required, read-only, state value, options) and the
 * actions (those declared by the component, with their button's label; and the loose buttons).
 */
export function projectChatScreen(component, state) {
  if (!component || typeof component !== 'object') return { fields: [], actions: [] }
  const fieldMds = []
  const buttons = new Map()
  let page
  const seen = new Set()
  const visit = (node) => {
    if (!node || typeof node !== 'object' || seen.has(node)) return
    seen.add(node)
    if (!Array.isArray(node)) {
      const t = mdTypeOf(node)
      if (t === 'FormField' && node.metadata.fieldId) fieldMds.push(node.metadata)
      else if (t === 'Page' && !page) page = node.metadata
      else if (t === 'Button' && node.metadata.actionId && !buttons.has(node.metadata.actionId)) buttons.set(node.metadata.actionId, node.metadata.label)
    }
    for (const v of Array.isArray(node) ? node : Object.values(node)) if (v && typeof v === 'object') visit(v)
  }
  visit(component)
  const values = state && typeof state === 'object' ? state
    : (component.initialData && typeof component.initialData === 'object' ? component.initialData : {})
  const fields = []
  const seenField = new Set()
  for (const md of fieldMds) {
    if (seenField.has(md.fieldId)) continue
    seenField.add(md.fieldId)
    const field = {
      id: md.fieldId,
      label: md.label != null ? md.label : md.fieldId,
      dataType: md.dataType || 'string',
      stereotype: md.stereotype || 'regular',
      required: !!md.required,
      readOnly: !!md.readOnly,
    }
    if (Object.prototype.hasOwnProperty.call(values, md.fieldId)) field.value = values[md.fieldId]
    if (Array.isArray(md.options) && md.options.length) {
      field.options = md.options.map((o) => (o && typeof o === 'object'
        ? { value: o.value, label: o.label != null ? o.label : String(o.value != null ? o.value : '') }
        : { value: o, label: String(o) }))
    }
    fields.push(field)
  }
  const actions = []
  const seenAction = new Set()
  for (const a of Array.isArray(component.actions) ? component.actions : []) {
    if (!a || !a.id || seenAction.has(a.id)) continue
    seenAction.add(a.id)
    const action = { id: a.id, label: buttons.get(a.id) != null ? buttons.get(a.id) : a.id }
    if (a.shortcut) action.shortcut = a.shortcut
    actions.push(action)
  }
  for (const [id, label] of buttons) {
    if (!seenAction.has(id)) { seenAction.add(id); actions.push({ id, label: label != null ? label : id }) }
  }
  const screen = { fields, actions }
  const title = (page && (page.pageTitle || page.title)) || undefined
  if (title) screen.title = title
  if (component.route) screen.route = component.route
  if (component.serverSideType) screen.serverSideType = component.serverSideType
  if (component.pageType || (page && page.pageType)) screen.pageType = component.pageType || page.pageType
  return screen
}

/**
 * A turn's POST, with the same shape as the web chat's: the text, the session, the route, the
 * attachments, the context (url, title, appState/appData and the state/data of the registry's HOST
 * context), the projected screen (if it has anything), the mcpUrl and, only on the session's first
 * message (`sendMenu`), the menu. Returns `{ body, shown }`: `shown` is what is painted as the
 * user's message (the text + 📎 the attachments).
 */
export function chatTurnOf({ message, sessionId, attachments = [], registry, appState, appData, url, screenTitle, currentRoute, mcpUrl, menu, sendMenu, origin }) {
  const text = String(message || '').trim()
  const host = registry && registry.contexts ? registry.contexts.__root__ : null
  const context = {
    url: url || '',
    screenTitle: screenTitle || '',
    appState: appState || {},
    appData: appData || (registry && registry.appData) || {},
    componentState: (host && host.state) || {},
    componentData: (host && host.data) || {},
  }
  const screen = host && host.tree ? projectChatScreen(host.tree, host.state) : null
  const hasScreen = !!screen && (screen.fields.length > 0 || screen.actions.length > 0 || !!screen.title)
  const pageOrigin = origin || (typeof location !== 'undefined' && location.origin) || 'http://localhost'
  const body = {
    ...buildChatBody({
      message: text,
      sessionId,
      attachments,
      context,
      mcpUrl: mcpUrl ? new URL(mcpUrl, pageOrigin).href : undefined,
      menuContext: sendMenu ? buildChatMenuContext(menu || []) : undefined,
      currentRoute,
    }),
    ...(hasScreen ? { screen } : {}),
  }
  const names = (attachments || []).map((a) => a.name).join(', ')
  const shown = names ? `${text}${text ? '\n\n' : ''}📎 ${names}` : text
  return { body, shown }
}

/** The final text of the turn: the answer, or why there is none (empty answer, network cut, error). */
export function chatTurnTextOf(accumulated, error) {
  if (error) {
    const message = (error && error.message) || String(error)
    const network = message === 'Failed to fetch' || message === 'network error' || message === 'Load failed'
    if (network && !accumulated) return '⚠️ ' + chromeText('chatNoAnswer')
    return '⚠️ ' + chromeText('chatError', { message })
  }
  if (!accumulated) return '⚠️ ' + chromeText('chatEmptyAnswer')
  return accumulated
}

/** A tool's duration like the web chat: «850 ms», «1,2 s». */
export function formatToolDuration(ms) {
  if (typeof ms !== 'number' || !Number.isFinite(ms)) return ''
  return ms < 1000 ? `${Math.round(ms)} ms` : `${(ms / 1000).toFixed(1).replace('.', ',')} s`
}

/** The tools of the current turn, ready to paint under the answer (CSP: all precomputed). */
export function chatToolStepsOf(progress) {
  return ((progress && progress.steps) || []).map((step, i) => ({
    key: i + ':' + step.name,
    name: step.name,
    title: step.server ? `${step.name} (${step.server})` : step.name,
    icon: step.running ? '…' : step.error ? '✕' : '✓',
    cls: 'mateu-chat-step ' + (step.running ? 'running' : step.error ? 'failed' : 'done'),
    time: step.running ? '' : formatToolDuration(step.ms),
    error: step.error ? String(step.error) : '',
  }))
}

/** Attachments after an upload: the existing ones + the new ones, without repeating a path. */
export function withAttachments(current, added) {
  const out = (current || []).slice()
  for (const a of added || []) if (a && a.path && !out.some((b) => b.path === a.path)) out.push({ name: a.name || a.path, path: a.path, removeLabel: chromeText('chatRemoveAttachment', { name: a.name || a.path }) })
  return out
}

/**
 * A chat URL the app declares (@AI sse/upload/mcp, a Chat component's), resolved against the
 * backend base with URL semantics: an absolute URL stays; "/x" is the backend ORIGIN + /x; "x" is
 * under the base. A base that is not absolute ('' = this origin's root in path mode, or a mount
 * path) keeps "/x" as is and puts "x" under it.
 */
export function resolveChatUrl(url, base = '') {
  const u = String(url || '').trim()
  if (!u) return ''
  if (/^[a-z][a-z0-9+.-]*:/i.test(u)) return u
  const b = String(base || '')
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(b)) {
    try { return new URL(u, b.endsWith('/') ? b : b + '/').href } catch { return b + u }
  }
  if (u.startsWith('/')) return u
  return b.replace(/\/+$/, '') + '/' + u
}

// ── The UI events of the stream (port of libs/mateu chatEvents.ts) ────────────────────────────
//
// What the shell does with an `{"event": …, "detail": …}` the agent sends, decided here and run by
// whoever hosts the chat (the shell's chatSend chain, the inline Chat component) through the SAME
// dispatcher (dispatchChatEvent), so both behave alike:
//   - navigation-requested {route, consumedRoute, actionId, baseUrl, serverSideType, uriPrefix} →
//     navigate in the app like a menu click carrying those fields;
//   - close-requested → close the chat panel;
//   - render-screen {yaml? | uidl?, target?, title?} → the surfaces on screen subscribed to it
//     (an OnCustomEvent trigger, @SubscribeTo) run their action with the detail as parameters; when
//     none is, the shell renders it itself (the BUILT-IN render target): the reserved `__preview__`
//     sync action turns the definition into an ordinary increment, painted in the content (default,
//     transient), a drawer or a dialog;
//   - anything else a surface on screen subscribes to → a document CustomEvent and the registry's
//     bus (its OnCustomEvent subscribers); an undeclared or framework event name goes nowhere.
// Each event is handled AS SOON AS it arrives, while the answer keeps streaming.

export const CHAT_NAVIGATION_REQUESTED = 'navigation-requested'
export const CHAT_CLOSE_REQUESTED = 'close-requested'
export const CHAT_RENDER_SCREEN = 'render-screen'
/** The reserved sync action that turns a definition into a normal UI increment. */
export const CHAT_PREVIEW_ACTION = '__preview__'
export const CHAT_PREVIEW_YAML_KEY = '_yaml'
/** Marks the preview as rendering an UNTRUSTED (agent-authored) definition: the backend strips what
 *  could run script (conformance/untrusted). The visual editor's preview does not send it. */
export const CHAT_PREVIEW_UNTRUSTED_KEY = '_untrusted'
/** The pseudo action id the content page runs a ready-made preview increment under. */
export const CHAT_PREVIEW_PAINT_ACTION = '__chatPreview__'
const CHAT_RENDER_TARGETS = ['content', 'drawer', 'dialog']

/**
 * What a render-screen detail asks for, or null when it carries no definition: `yaml` (text) wins
 * over `uidl` (a component tree as an object, or as JSON text); an unknown target is the content.
 */
export function renderScreenRequestOf(detail) {
  if (!detail || typeof detail !== 'object') return null
  let yaml
  if (typeof detail.yaml === 'string' && detail.yaml.trim()) yaml = detail.yaml
  else if (typeof detail.uidl === 'string' && detail.uidl.trim()) yaml = detail.uidl
  else if (detail.uidl && typeof detail.uidl === 'object') {
    try { yaml = JSON.stringify(detail.uidl) } catch { yaml = undefined } // a cyclic object is no definition
  }
  if (!yaml) return null
  const target = CHAT_RENDER_TARGETS.includes(detail.target) ? detail.target : 'content'
  const title = typeof detail.title === 'string' && detail.title.trim() ? detail.title : undefined
  return { yaml, target, ...(title ? { title } : {}) }
}

/** The navigation a navigation-requested detail asks for — the menu-click fields it carries — or
 *  null without a route. Only the fields that are set travel. */
export function chatNavigationOf(detail) {
  if (!detail || typeof detail !== 'object' || typeof detail.route !== 'string') return null
  const out = { route: detail.route }
  for (const k of ['consumedRoute', 'actionId', 'baseUrl', 'serverSideType', 'uriPrefix']) {
    if (typeof detail[k] === 'string' && detail[k] !== '') out[k] = detail[k]
  }
  return out
}

/** What a requested navigation adds to the route's load — the fields a menu click sends with it
 *  (consumedRoute, serverSideType, actionId); {} for a bare route. baseUrl/uriPrefix are where it
 *  goes, recorded as a remote route by whoever asks for the navigation. */
export function navigationLoadExtraOf(navigation) {
  const out = {}
  if (!navigation || typeof navigation !== 'object') return out
  for (const k of ['consumedRoute', 'serverSideType', 'actionId']) {
    if (typeof navigation[k] === 'string' && navigation[k] !== '') out[k] = navigation[k]
  }
  return out
}

// ── which events an agent may dispatch (NM9) ─────────────────────────────────────────────────
// The built-in ones always; any other only when a surface on screen subscribes to it (its
// OnCustomEvent trigger: @SubscribeTo) and it is not one of the framework's own event names — an
// agent must not fire the renderer's or the DOM's own events at the app. Same lists as libs/mateu
// agentEventPolicy.ts, pinned by conformance/client/agent-events.json.
export const CHAT_AGENT_BUILT_IN_EVENTS = new Set([
  'navigation-requested', 'close-requested', 'render-screen',
])
export const CHAT_RESERVED_EVENT_NAMES = new Set([
  'action-requested', 'server-side-action-requested', 'url-update-requested', 'route-changed',
  'navigate-to-requested', 'page-banners-received', 'dirty', 'clean', 'value-changed', 'data-changed',
  'app-data-updated', 'close-modal-requested', 'column-prefs-changed', 'compact-changed', 'history-pushed',
  'selected-changed', 'search-requested', 'filter-reset-requested', 'picked', 'pinged', 'click',
  'dblclick', 'input', 'change', 'submit', 'keydown', 'keyup', 'keypress', 'focus', 'blur', 'focusin',
  'focusout', 'load', 'error', 'abort', 'message', 'storage', 'popstate', 'hashchange', 'beforeunload',
  'pagehide', 'online', 'offline', 'resize', 'scroll', 'wheel', 'contextmenu', 'pointerdown', 'pointerup',
  'mousedown', 'mouseup', 'touchstart', 'drop', 'dragstart', 'dragend', 'unhandledrejection',
  'DOMContentLoaded',
])
export const CHAT_RESERVED_EVENT_PREFIXES = ['mateu-', 'backend-', 'vaadin-']

/** Whether an agent may dispatch `name`, given whether a surface on screen subscribes to it. */
export function agentMayDispatchEvent(name, subscribed) {
  if (typeof name !== 'string' || !name) return false
  if (CHAT_AGENT_BUILT_IN_EVENTS.has(name)) return true
  if (CHAT_RESERVED_EVENT_NAMES.has(name) || CHAT_RESERVED_EVENT_PREFIXES.some((p) => name.startsWith(p))) return false
  return !!subscribed
}

/**
 * What an agent event means on this screen (`reg` = the registry, for its subscribers):
 *   {kind:'navigate', navigation} | {kind:'close'} | {kind:'ignore'}
 *   {kind:'subscribers', name, detail, subscribers:[{ctxId, actionId, parameters}], dispatch}
 *   {kind:'preview', request, dispatch}  (render-screen nobody on screen takes)
 *   {kind:'custom', name, detail, subscribers, dispatch}  (only one a surface subscribes to and
 *     not a framework event name: anything else is {kind:'ignore'})
 * `dispatch`: it also goes out as a document CustomEvent (a page's web component may listen).
 */
export function chatEventPlanOf(ev, reg) {
  const name = ev && typeof ev.event === 'string' ? ev.event : ''
  if (!name) return { kind: 'ignore' }
  const detail = ev.detail && typeof ev.detail === 'object' ? ev.detail : {}
  if (name === CHAT_NAVIGATION_REQUESTED) {
    const navigation = chatNavigationOf(detail)
    if (!navigation) return { kind: 'ignore' }
    // R1: an agent may only name a base url the shell trusts — its own, a remote its app names
    // (the token's rule); any other is dropped and the route opens in the app. Otherwise it was
    // registered as a remote route and its answer painted with the author's trust.
    if (navigation.baseUrl && !isTrustedOrigin(navigation.baseUrl)) {
      delete navigation.baseUrl
    }
    return { kind: 'navigate', navigation }
  }
  if (name === CHAT_CLOSE_REQUESTED) return { kind: 'close' }
  const subscribers = (reg ? busSubscribersOf(reg, { name, detail, source: null }) : [])
    .map((s) => ({ ...s, parameters: { ...detail } }))
  if (name === CHAT_RENDER_SCREEN) {
    if (subscribers.length) return { kind: 'subscribers', name, detail, subscribers, dispatch: true }
    const request = renderScreenRequestOf(detail)
    return request ? { kind: 'preview', request, dispatch: true } : { kind: 'ignore' }
  }
  // nobody on screen declares it (or it is one of the framework's own): it goes nowhere
  if (!agentMayDispatchEvent(name, subscribers.length > 0)) return { kind: 'ignore' }
  return { kind: 'custom', name, detail, subscribers, dispatch: true }
}

/** The body of the `__preview__` call: the current route, consumed as is, NO serverSideType, an
 *  empty state and the definition as `_yaml` — the same envelope as any action. */
export function chatPreviewBodyOf(route, request) {
  const r = route || ''
  return {
    route: r,
    consumedRoute: r,
    actionId: CHAT_PREVIEW_ACTION,
    componentState: {},
    parameters: { [CHAT_PREVIEW_YAML_KEY]: request.yaml, [CHAT_PREVIEW_UNTRUSTED_KEY]: true },
    serverSideType: undefined,
    initiatorComponentId: '',
  }
}

/**
 * The increment that paints a `__preview__` answer, or null when it brings no component. Its first
 * fragment's component goes, as it is (an invalid definition comes back as the backend's red Text):
 *   content → REPLACES the host (an ordinary page re-render; transient: the next navigation loads
 *             the real screen again);
 *   drawer / dialog → an Add of a Drawer / Dialog overlay whose content it is, `title` in its header
 *             — exactly what a server answering a Drawer/Dialog sends, so the usual overlay paints it.
 * The answer's commands and messages travel with it — all of it UNTRUSTED (neutralizeUntrusted).
 */
export function chatPreviewIncrementOf(answer, request, route = '') {
  // an agent wrote it: nothing in it may run script in this tab, whatever the backend sent (untrusted.mjs)
  const increment = answer ? neutralizeUntrusted(answer) : answer
  const fragment = ((increment && increment.fragments) || []).find((f) => f && f.component)
  if (!fragment) return null
  const target = (request && request.target) || 'content'
  const base = { commands: (increment && increment.commands) || [], messages: (increment && increment.messages) || [] }
  if (target === 'content') {
    // a definition comes back as a ClientSide tree (a Form, a Text): the content projection reads a
    // PAGE — a ServerSide boundary with its own state —, so it is wrapped the way a route's content
    // arrives (as the visual editor's preview does). No serverSideType: it is no class of the app.
    const own = fragment.component
    const state = fragment.state || {}
    const page = own.type === 'ServerSide' ? own : {
      type: 'ServerSide', id: 'mateu-chat-preview', serverSideType: undefined, route: route || '',
      actions: [], triggers: [], rules: [], children: [own], initialData: state,
    }
    return { ...base, fragments: [{ ...fragment, targetComponentId: '', action: 'Replace', state, component: page }] }
  }
  const type = target === 'dialog' ? 'Dialog' : 'Drawer'
  return {
    ...base,
    fragments: [{
      targetComponentId: null,
      action: 'Add',
      state: fragment.state || {},
      data: fragment.data || {},
      component: {
        type: 'ClientSide',
        id: 'mateu-chat-preview-' + type.toLowerCase(),
        children: [],
        metadata: {
          type,
          headerTitle: (request && request.title) || null,
          content: fragment.component,
          initialData: fragment.state || {},
        },
      },
    }],
  }
}

/** The token line of a usage ({inputTokens, outputTokens, totalTokens}): "in 12 · out 34 · total 46". */
export function chatUsageTextOf(usage) {
  if (!usage) return ''
  const parts = []
  if (typeof usage.inputTokens === 'number') parts.push(chromeText('chatTokensIn') + ' ' + usage.inputTokens)
  if (typeof usage.outputTokens === 'number') parts.push(chromeText('chatTokensOut') + ' ' + usage.outputTokens)
  if (typeof usage.totalTokens === 'number') parts.push(chromeText('chatTokensTotal') + ' ' + usage.totalTokens)
  return parts.length ? chromeText('chatTokens') + ': ' + parts.join(' · ') : ''
}

// The host of the chat's UI events: what the SHELL can do (set once by loadMateuShell). Everything
// this needs from VB is a callback, so the dispatcher runs — and is tested — without VB.
//   registry()            the registry on screen (its subscribers)
//   currentRoute()        the route on screen
//   base()                the backend base of the screen
//   navigate(navigation)  a menu-click-like navigation
//   closeChat()           close the chat panel
//   runAction(actionId, parameters, ctxId)   a subscriber's action, on the surface that declares it
//   paintPreview(increment, request)         paint a ready-made preview increment
//   call(base, body)      the sync POST (default: transport's callMateu)
let chatEventHost = null
export function setChatEventHost(host) { chatEventHost = host || null }

/**
 * Runs an agent event (chatEventPlanOf) against the chat host. Returns the plan. Failures are
 * reported through `host.onError` (the panel shows them) and never break the stream.
 */
export async function dispatchChatEvent(ev, host = chatEventHost, doc = typeof document !== 'undefined' ? document : null) {
  const registry = host && host.registry ? host.registry() : null
  const plan = chatEventPlanOf(ev, registry)
  try {
    if (plan.dispatch && doc && typeof CustomEvent === 'function') {
      doc.dispatchEvent(new CustomEvent(ev.event, { detail: (ev && ev.detail) || {}, bubbles: true, composed: true }))
    }
    if (!host) return plan
    if (plan.kind === 'navigate') {
      if (host.navigate) await host.navigate(plan.navigation)
    } else if (plan.kind === 'close') {
      if (host.closeChat) await host.closeChat()
    } else if (plan.kind === 'subscribers' || plan.kind === 'custom') {
      for (const s of plan.subscribers) if (host.runAction) await host.runAction(s.actionId, s.parameters, s.ctxId)
    } else if (plan.kind === 'preview') {
      const route = host.currentRoute ? host.currentRoute() : ''
      const base = host.base ? host.base() : ''
      const call = host.call || ((b, body) => callMateu(b, body, { quiet: true }))
      const answer = await call(base, chatPreviewBodyOf(route, plan.request))
      const increment = chatPreviewIncrementOf(answer, plan.request, route)
      if (increment && host.paintPreview) await host.paintPreview(increment, plan.request)
    }
  } catch (e) {
    if (host && host.onError) host.onError(e, plan)
  }
  return plan
}
