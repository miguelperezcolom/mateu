// poc/chat.mjs — núcleo de transporte del CHAT de IA, renderer-neutral (paridad Redwood/VB).
//
// El chat compartido (libs/mateu/.../mateu-chat.ts, ~939 líneas) mezcla transporte y UI de Lit. Para
// llevarlo a VB "apoyándonos en VB al máximo" (la UI la pone un componente de conversación de JET, no
// dibujada a mano), lo que se comparte es SOLO la lógica de transporte: construir el body, elegir la
// URL (agente local vs sseUrl), aplanar el menú como contexto, discriminar cada payload `data:` y
// acumular el texto del asistente. Ese núcleo va aquí — probado en Node (poc/test.mjs) — y el bucle
// de streaming acepta un `fetchImpl` inyectable para no tocar globals. Es la capa "lógica" del
// roadmap; el panel VB (gate visual) la consume. Sin imports: se concatena en el bundle AMD.

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
  if (!response.ok) throw new Error(`Upload failed: ${response.status}`)
  const result = await response.json()
  return ((result && result.files) || []).filter((f) => f && f.path)
}

/**
 * Postea un mensaje al stream del chat y consume la respuesta SSE. Idéntico al bucle del chat
 * compartido: parte por líneas, cada `data:` es uso de tokens, un evento personalizado, o texto que
 * se ACUMULA en el mensaje del asistente. `agent-error` se muestra como el texto del asistente.
 * Devuelve el texto acumulado. `fetchImpl` es inyectable para tests.
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
 * @param onText   (accumulatedText) => void   — en cada trozo de texto (para repintar el mensaje)
 * @param onEvent  ({event, detail}) => void   — evento personalizado del agente (≠ agent-error)
 * @param onUsage  (usage) => void             — objeto de uso de tokens
 */
export async function streamChat({ url, body, headers = {}, reauthenticate, fetchImpl = globalThis.fetch, onText, onEvent, onUsage }) {
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
    throw new Error(`Servidor respondió ${response.status}: ${errorText}`)
  }
  const reader = response.body && response.body.getReader ? response.body.getReader() : null
  if (!reader) throw new Error('No se pudo obtener el reader del stream.')

  const decoder = new TextDecoder()
  let buffer = ''
  let accumulated = ''

  // `line`: el payload venía en una línea terminada (lo normal), y lleva su salto — el agente manda
  // cada línea de la respuesta en su propio `data:`, así que sin él el markdown llega de una pieza
  // («…plataforma:### Lista…»). Mismo criterio que el chat compartido (mateu-chat.ts): + '\n'.
  const handlePayload = (payload, line = false) => {
    const usage = tryParseTokenUsage(payload)
    const customEvent = !usage && tryParseCustomEvent(payload)
    if (usage) {
      if (onUsage) onUsage(usage)
    } else if (customEvent) {
      if (customEvent.event === 'agent-error') {
        accumulated = '⚠️ ' + ((customEvent.detail && customEvent.detail.message) || 'Error desconocido del agente')
        if (onText) onText(accumulated)
      } else if (onEvent) {
        onEvent(customEvent)
      }
    } else {
      accumulated += line ? payload + '\n' : payload
      if (onText) onText(accumulated)
    }
  }

  while (true) {
    const { done, value } = await reader.read()
    if (done) {
      if (buffer.trim().startsWith('data:')) handlePayload(buffer.trim().slice(5).trim())
      break
    }
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''
    for (const line of lines) {
      if (line.trim().startsWith('data:')) handlePayload(line.trim().slice(5).trim(), true)
    }
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
 * Los totales de la conversación: se suma el uso de cada respuesta ya terminada. Solo los
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
 * Qué dice la fila de estado bajo la conversación: nada si el asistente no trabaja; «Pensando…»
 * con los segundos mientras no ha llegado nada (la espera larga es la que inquieta); «Respondiendo…»
 * en cuanto llega el primer texto.
 */
export function chatStatusText({ busy, hasText, elapsedSeconds }) {
  if (!busy) return ''
  if (hasText) return 'Respondiendo…'
  const s = Math.max(0, Math.floor(elapsedSeconds || 0))
  return s > 0 ? `Pensando… ${s} s` : 'Pensando…'
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
  let s = escaped.replace(/`([^`\n]+)`/g, (_, c) => { codes.push(c); return `\u0000${codes.length - 1}\u0000` })
  // enlaces: solo http(s); la URL ya viene escapada (las comillas no pueden cerrar el atributo)
  s = s.replace(/\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)/g,
    (_, text, url) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`)
  s = s.replace(/\*\*([^*\n]+?)\*\*/g, '<strong>$1</strong>').replace(/__([^_\n]+?)__/g, '<strong>$1</strong>')
  s = s.replace(/(^|[^*\w])\*([^*\s][^*\n]*?)\*(?!\w)/g, '$1<em>$2</em>')
    .replace(/(^|[^_\w])_([^_\s][^_\n]*?)_(?!\w)/g, '$1<em>$2</em>')
  return s.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${codes[+i]}</code>`)
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
