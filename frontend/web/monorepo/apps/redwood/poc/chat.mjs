// poc/chat.mjs — núcleo de transporte del CHAT de IA, renderer-neutral (paridad Redwood/VB).
//
// El chat compartido (libs/mateu/.../mateu-chat.ts, ~939 líneas) mezcla transporte y UI de Lit. Para
// llevarlo a VB "apoyándonos en VB al máximo" (la UI la pone un componente de conversación de JET, no
// dibujada a mano), lo que se comparte es SOLO la lógica de transporte: construir el body, elegir la
// URL (agente local vs sseUrl), aplanar el menú como contexto, discriminar cada payload `data:` y
// acumular el texto del asistente. Ese núcleo va aquí — probado en Node (poc/test.mjs) — y el bucle
// de streaming acepta un `fetchImpl` inyectable para no tocar globals. Es la capa "lógica" del
// roadmap; el panel VB (gate visual) la consume. Se concatena en el bundle AMD (make-amd quita el import).

import { chromeText } from './i18n.mjs'

/** Discrimina un payload `data:` que es un objeto de uso de tokens ({inputTokens|outputTokens|totalTokens}). */
export function tryParseTokenUsage(payload) {
  const trimmed = (payload || '').trim()
  if (!trimmed.startsWith('{')) return null
  try {
    const obj = JSON.parse(trimmed)
    if ('inputTokens' in obj || 'outputTokens' in obj || 'totalTokens' in obj) return obj
  } catch {
    // no es JSON válido
  }
  return null
}

/** Discrimina un payload `data:` que es un evento personalizado del agente ({event, detail}). */
export function tryParseCustomEvent(payload) {
  const trimmed = (payload || '').trim()
  if (!trimmed.startsWith('{')) return null
  try {
    const obj = JSON.parse(trimmed)
    if (typeof obj.event === 'string') return { event: obj.event, detail: obj.detail ?? {} }
  } catch {
    // no es JSON válido
  }
  return null
}

/** Aplana el menú al contexto que recibe el LLM (solo en el primer mensaje). Misma forma que
 *  `MenuContextEntry` del chat compartido: breadcrumb `path` + objeto `navigation`. Salta
 *  separadores y entradas remotas aún sin resolver (su ruta apunta al loader, no a una pantalla). */
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
      // lo que el agente necesita para ENSEÑAR filas en este listado: sus filtros por URL, el campo
      // id de la fila y el parámetro de la selección (?ids=…). Lo publica el server en el menú.
      if (opt.listing) entry.listing = opt.listing
      result.push(entry)
    }
  }
  return result
}

/** La URL efectiva del stream: el agente local si respondió a /health, si no el `sseUrl` del wire. */
export function effectiveChatUrl({ localAgentAlive, localAgentUrl, sseUrl }) {
  return localAgentAlive && localAgentUrl ? localAgentUrl + '/mateu/agent/stream' : sseUrl
}

/** El body del POST del chat. `menuContext` solo viaja en el primer mensaje (lo decide el llamante). */
export function buildChatBody({ message, sessionId, attachments, context, mcpUrl, menuContext, currentRoute }) {
  return {
    message: message ?? '',
    sessionId,
    // la ruta de la pantalla desde la que se pregunta: las reglas de enrutado del plano de control
    // eligen el agente por ella
    ...(currentRoute ? { currentRoute } : {}),
    ...(attachments && attachments.length ? { attachments } : {}),
    ...(context !== undefined && context !== null ? { context } : {}),
    ...(mcpUrl ? { mcpUrl } : {}),
    ...(menuContext && menuContext.length ? { menuContext } : {}),
  }
}

/** Sube ficheros al endpoint de `@AI(upload=…)` como multipart; devuelve los `{name, path}` guardados. */
export async function uploadChatFiles({ uploadUrl, files, sessionId, headers = {}, fetchImpl = globalThis.fetch, FormDataImpl = globalThis.FormData }) {
  const form = new FormDataImpl()
  for (const f of files || []) form.append('files', f)
  if (sessionId) form.append('sessionId', sessionId)
  const response = await fetchImpl(uploadUrl, { method: 'POST', headers, body: form })
  if (!response.ok) throw new Error(chromeText('chatUploadFailed', { status: response.status }))
  const result = await response.json()
  return ((result && result.files) || []).filter((f) => f && f.path)
}

// ── El stream SSE, leído como SSE ──────────────────────────────────────────────────────────────
// Por EVENTO, no por línea: las líneas `data:` de un evento se unen con '\n' y una línea en blanco lo
// cierra; de `data:` sólo se quita el espacio opcional (la sangría del markdown sobrevive); los
// comentarios (`:keep-alive`) y los demás campos se ignoran. Misma lógica que el chat compartido
// (libs/mateu/.../chatStream.ts) — mantener las dos a la par.

/** Un lector SSE incremental: `push(texto)` devuelve los `data` de los eventos que se han cerrado;
 *  `end()` el que el stream dejó sin línea en blanco detrás. */
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
        // un '\r' al final puede ser la primera mitad de un '\r\n' partido entre trozos
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
 * Qué es el `data` de un evento: uso de tokens, un trozo de la respuesta (agent-delta), una fase
 * (agent-status), una herramienta (agent-tool), un error (agent-error), otro evento de UI, o texto.
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

/** Un uso que no dice nada: todos sus contadores a cero (los marcadores de agentes anteriores). */
export function isEmptyUsage(usage) {
  if (!usage) return true
  const values = ['inputTokens', 'outputTokens', 'totalTokens'].map((k) => usage[k]).filter((v) => typeof v === 'number' && Number.isFinite(v))
  return values.length === 0 || values.every((v) => v === 0)
}

/**
 * Lo que el agente dice que está haciendo en esta respuesta: la fase, las herramientas (la que corre
 * y las ya hechas, con su duración o su error) y si ya está escribiendo. `line(now)` es la fila de
 * estado: «Llamando a booking_findBookings… 3 s», «Respondiendo…», «Conectando con 2 servidores MCP…»;
 * null si el agente no ha informado de nada (agentes anteriores: el panel sigue con «Pensando… N s»).
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
 * Postea un mensaje al stream del chat y consume la respuesta SSE, por eventos (ver
 * createSseParser). Cada `data` es uso de tokens, un evento personalizado, progreso del agente, un
 * trozo de la respuesta (agent-delta: se AÑADE), o texto: tras trozos, el primero es la respuesta
 * entera y LOS SUSTITUYE (el agente la manda limpia al final); sin trozos, cada texto es una línea
 * — el contrato de siempre de los agentes que mandan la respuesta línea a línea. `agent-error` se
 * muestra como el texto del asistente. Devuelve el texto final. `fetchImpl` es inyectable para tests.
 *
 * Un 401 se recupera como en el resto del tráfico (fetchWithPolicy): `reauthenticate` pide a la
 * página que reautentique y, si lo hace, el mensaje se reenvía UNA vez. Por eso `headers` puede ser
 * una función: se evalúa en cada envío, y el reenvío lleva el token NUEVO, no el que acaba de ser
 * rechazado — o el que faltaba: en ec1 el chat llegó a salir sin token porque en ese instante no
 * había ninguno en localStorage, y enseñaba "Servidor respondió 401" mientras las pantallas, que sí
 * reautentican, seguían funcionando. Sin nadie que reautentique, o si el reenvío vuelve a dar 401,
 * falla como siempre.
 *
 * @param headers         objeto de cabeceras, o () => objeto (leído en cada envío)
 * @param reauthenticate  async () => boolean — true si hay que reenviar (askForReauthentication)
 *
 * @param onText     (accumulatedText) => void   — en cada cambio del texto (para repintar el mensaje)
 * @param onDelta    (piece, accumulatedText) => void — en cada trozo que llega en streaming
 * @param onProgress (progress) => void          — en cada fase/herramienta (createChatProgress)
 * @param onEvent    ({event, detail}) => void   — evento personalizado del agente (≠ agent-*)
 * @param onUsage    (usage) => void             — objeto de uso de tokens (los todo-cero no llegan)
 */
export async function streamChat({ url, body, headers = {}, reauthenticate, fetchImpl = globalThis.fetch, onText, onDelta, onProgress, onEvent, onUsage, now = () => Date.now() }) {
  const payload = typeof body === 'string' ? body : JSON.stringify(body)
  const send = () => fetchImpl(url, {
    method: 'POST',
    headers: {
      Accept: 'text/event-stream', 'Content-Type': 'application/json',
      ...((typeof headers === 'function' ? headers() : headers) || {}),
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
  // hubo trozos desde el último texto entero: el siguiente texto los sustituye
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

// ---- El estado del panel mientras el asistente trabaja, los tokens y el dictado ------------------

/**
 * El uso de UNA respuesta: el stream puede mandar más de un objeto de uso; dentro de una respuesta
 * manda el último valor de cada contador, como en el chat compartido (merge, no suma).
 */
export function mergeTurnUsage(turn, usage) {
  return { ...(turn || {}), ...(usage || {}) }
}

/**
 * El uso que enseña el panel tras una respuesta: el de ESA respuesta, que es lo que el agente manda
 * como total de la conversación (el ia-agent de ec-demo1 manda el acumulado de la sesión; sumarlo
 * contaba cada respuesta otra vez en cada respuesta siguiente). Una respuesta sin uso deja el que
 * había. Mismo criterio que el chat compartido: se sustituye, no se suma.
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
 * Los totales de la conversación: se suma el uso de cada respuesta ya terminada — para un agente que
 * manda el uso de cada respuesta suelta. El panel ya no la usa (ver latestUsage). Solo los
 * contadores numéricos; null si todavía no hay ninguno (el panel no enseña una fila vacía).
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
 * Qué dice la fila de estado bajo la conversación: nada si el asistente no trabaja; lo que el agente
 * dice que hace, si lo dice (`progress`, de createChatProgress: la herramienta que llama con sus
 * segundos, la fase, «Respondiendo…»); si no — agentes que no informan —, «Pensando…» con los
 * segundos mientras no ha llegado nada (la espera larga es la que inquieta) y «Respondiendo…» en
 * cuanto llega el primer texto.
 */
export function chatStatusText({ busy, hasText, elapsedSeconds, progress, now }) {
  if (!busy) return ''
  const line = progress && progress.line ? progress.line(typeof now === 'number' ? now : Date.now()) : null
  if (line) return line
  if (hasText) return chromeText('chatAnswering')
  const s = Math.max(0, Math.floor(elapsedSeconds || 0))
  return s > 0 ? chromeText('chatThinkingFor', { s }) : chromeText('chatThinking')
}

/** El constructor del reconocimiento de voz del navegador, o null donde no existe (Firefox). */
export function speechRecognitionCtor(win = globalThis) {
  return (win && (win.SpeechRecognition || win.webkitSpeechRecognition)) || null
}

/** El texto dictado: el último resultado reconocido (mismo criterio que el chat compartido). */
export function transcriptOf(event) {
  const results = event && event.results
  if (!results || !results.length) return ''
  const last = results[results.length - 1]
  return (last && last[0] && last[0].transcript ? String(last[0].transcript) : '').trim()
}

/**
 * El atajo del micrófono del chat: Ctrl+Shift+M en todas las plataformas (en macOS también Ctrl, no
 * Cmd — Cmd+Shift+M cambia de perfil en Chrome y Opción+M escribe «µ»). Exactamente Ctrl y Shift,
 * sin Alt ni Cmd, y no la autorrepetición de la tecla mantenida. La tecla se reconoce por su carácter
 * (AZERTY incluido) o, en un teclado cuya M no escribe una letra latina, por su posición (KeyM).
 */
export const CHAT_MIC_SHORTCUT = 'Ctrl+Shift+M'
export const CHAT_MIC_ARIA_KEYSHORTCUTS = 'Control+Shift+M'

export function isChatMicShortcut(event) {
  if (!event || !event.ctrlKey || !event.shiftKey || event.altKey || event.metaKey || event.repeat) return false
  const key = typeof event.key === 'string' ? event.key : ''
  if (/^[a-z]$/i.test(key)) return key.toLowerCase() === 'm'
  return event.code === 'KeyM'
}

// ── Markdown de las respuestas ──────────────────────────────────────────────────────────────────
// El agente contesta en markdown (negritas, listas, tablas, código). El chat compartido lo pinta con
// marked + DOMPurify; aquí no hay npm en el bundle AMD, así que el subconjunto que usan los agentes se
// convierte a mano, ESCAPANDO PRIMERO: todo el HTML del texto sale como texto, y las únicas etiquetas
// del resultado son las que pone esta función (sin atributos salvo href/target/rel de los enlaces
// http(s)). Seguro por construcción, sin sanitizador. Tolera el markdown a medias del streaming: un
// bloque de código sin cerrar es código hasta el final, y un ** sin pareja se queda como texto.

const MD_ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }
const mdEscape = (s) => String(s).replace(/[&<>"']/g, (c) => MD_ESC[c])

/** El markdown en línea de un texto YA escapado: código, enlaces, negrita, cursiva. */
function mdInline(escaped) {
  const codes = []
  // la etiqueta de apertura de cada enlace se aparta hasta el final: su href puede llevar `_` o `*`
  // (ids=A_B) y la negrita/cursiva de abajo lo romperían
  const opens = []
  const open = (tag) => { opens.push(tag); return `\u0001${opens.length - 1}\u0001` }
  let s = escaped.replace(/`([^`\n]+)`/g, (_, c) => { codes.push(c); return `\u0000${codes.length - 1}\u0000` })
  // enlaces: solo http(s); la URL ya viene escapada (las comillas no pueden cerrar el atributo)
  s = s.replace(/\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)/g,
    (_, text, url) => `${open(`<a href="${url}" target="_blank" rel="noopener noreferrer">`)}${text}</a>`)
  // y las rutas de la propia app (`[4MBZS7](/booking/bookings/4MBZS7)`): un enlace que navega DENTRO
  // de la consola (la burbuja lo engancha, chatRouteOfLink) — sin recargar ni abrir pestaña. Solo
  // una ruta que empieza por UNA barra: `//host` sería otro sitio.
  s = s.replace(/\[([^\]\n]+)\]\((\/(?!\/)[^\s)]*)\)/g,
    (_, text, route) => `${open(`<a href="${route}" class="mateu-chat-route" data-mateu-route="${route}">`)}${text}</a>`)
  s = s.replace(/\*\*([^*\n]+?)\*\*/g, '<strong>$1</strong>').replace(/__([^_\n]+?)__/g, '<strong>$1</strong>')
  s = s.replace(/(^|[^*\w])\*([^*\s][^*\n]*?)\*(?!\w)/g, '$1<em>$2</em>')
    .replace(/(^|[^_\w])_([^_\s][^_\n]*?)_(?!\w)/g, '$1<em>$2</em>')
  return s.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${codes[+i]}</code>`)
    .replace(/\u0001(\d+)\u0001/g, (_, i) => opens[+i])
}

/**
 * La ruta a la que navega un clic en un enlace del chat, o null si el clic no es nuestro: sólo los
 * enlaces a rutas de la app (mateu-chat-route) y un clic normal — con Ctrl/Cmd/Mayús o el botón del
 * medio el navegador hace lo suyo (abrirlo en otra pestaña sigue funcionando: el href es la URL).
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
 * El markdown de una respuesta del asistente como HTML seguro para su burbuja: párrafos con saltos
 * de línea, títulos, listas (con y sin número), citas, reglas, bloques y trozos de código, tablas,
 * enlaces http(s) (en otra pestaña), negrita y cursiva.
 */
export function chatMarkdownToHtml(text) {
  const lines = String(text ?? '').replace(/\r\n?/g, '\n').split('\n')
  const out = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    // bloque de código (``` … ```); sin cerrar —el stream a medias— llega hasta el final
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
      const level = Math.min(6, heading[1].length + 2)   // h3…h6: dentro de una burbuja, no de una página
      out.push(`<h${level}>${mdInline(mdEscape(heading[2].replace(/\s*#+\s*$/, '')))}</h${level}>`)
      i++
      continue
    }
    if (/^\s*([-*_])(\s*\1){2,}\s*$/.test(line)) { out.push('<hr>'); i++; continue }
    // tabla: cabecera | a | b | seguida de |---|---|
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
    // párrafo: líneas seguidas hasta una en blanco o un bloque; cada salto, un <br>
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

/** Una lista (y sus sublistas, por sangría) desde la línea `start`; devuelve su HTML y avanza. */
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
    // continuación de un elemento: una línea sangrada que no es otro elemento
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

// ---- Paridad con el chat web (libs/mateu mateu-chat.ts): lo que el panel VB necesitaba ----------
//
// El chat compartido manda en cada mensaje, además del texto: el CONTEXTO de la pantalla (url,
// título, appState/appData, el estado del componente — su contextProvider), una PROYECCIÓN
// autodescriptiva de la pantalla (screenContext.ts: campos con tipo/rótulo/valor + acciones, la
// misma que recibe un agente MCP), el `mcpUrl` del @AI y los adjuntos; prefiere el agente LOCAL si
// contesta a /health; titula el panel con el @App(askLabel); enseña las herramientas que usa el
// agente en el turno en curso; y explica una respuesta vacía o un corte de red. Todo puro aquí.

/** El agente local (companion) por defecto, el mismo que el chat web. */
export const LOCAL_AGENT_URL = 'http://127.0.0.1:8776'

/** ¿Contesta el agente local? (GET <url>/health con un tope de 1,2 s; cualquier fallo = no). */
export async function probeLocalAgent({ url = LOCAL_AGENT_URL, fetchImpl = globalThis.fetch, timeoutMs = 1200 } = {}) {
  if (!url || !fetchImpl) return false
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null
  const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : null
  try {
    const response = await fetchImpl(url + '/health', controller ? { signal: controller.signal } : {})
    return !!(response && response.ok)
  } catch {
    return false
  } finally {
    if (timer) clearTimeout(timer)
  }
}

/** La configuración del panel desde la shell (el App del bootstrap) y la base del backend. */
export function chatConfigOf(shell, base = '') {
  const s = shell || {}
  const abs = (u) => (u ? (/^[a-z][a-z0-9+.-]*:/i.test(u) ? u : base + u) : '')
  return {
    sseUrl: abs(s.sseUrl),
    uploadUrl: abs(s.uploadUrl),
    mcpUrl: abs(s.mcpUrl),
    // el título del panel: la marca del App (@App(askLabel)), si no «Assistant»
    title: String(s.askLabel || '').trim() || chromeText('chatTitle'),
  }
}

const mdTypeOf = (node) => (node && node.metadata && typeof node.metadata.type === 'string' ? node.metadata.type : undefined)

/**
 * La pantalla proyectada para el agente — port de screenContext.ts `projectScreen`: los FormField
 * (id, rótulo, tipo, estereotipo, obligatorio, solo lectura, valor del estado, opciones) y las
 * acciones (las declaradas por el componente, con el rótulo de su botón; y los botones sueltos).
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
 * El POST de un turno, con la misma forma que el del chat web: el texto, la sesión, la ruta, los
 * adjuntos, el contexto (url, título, appState/appData y el estado/datos del contexto HOST del
 * registro), la pantalla proyectada (si tiene algo), el mcpUrl y, sólo en el primer mensaje de la
 * sesión (`sendMenu`), el menú. Devuelve `{ body, shown }`: `shown` es lo que se pinta como mensaje
 * del usuario (el texto + 📎 los adjuntos).
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

/** El texto final del turno: la respuesta, o por qué no la hay (respuesta vacía, corte de red, error). */
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

/** La duración de una herramienta como el chat web: «850 ms», «1,2 s». */
export function formatToolDuration(ms) {
  if (typeof ms !== 'number' || !Number.isFinite(ms)) return ''
  return ms < 1000 ? `${Math.round(ms)} ms` : `${(ms / 1000).toFixed(1).replace('.', ',')} s`
}

/** Las herramientas del turno en curso, listas para pintar bajo la respuesta (CSP: todo precomputado). */
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

/** Adjuntos tras una subida: los que había + los nuevos, sin repetir ruta. */
export function withAttachments(current, added) {
  const out = (current || []).slice()
  for (const a of added || []) if (a && a.path && !out.some((b) => b.path === a.path)) out.push({ name: a.name || a.path, path: a.path, removeLabel: chromeText('chatRemoveAttachment', { name: a.name || a.path }) })
  return out
}
