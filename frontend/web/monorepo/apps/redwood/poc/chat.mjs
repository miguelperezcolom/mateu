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
export function buildChatBody({ message, sessionId, attachments, context, mcpUrl, menuContext }) {
  return {
    message: message ?? '',
    sessionId,
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
 * @param onText   (accumulatedText) => void   — en cada trozo de texto (para repintar el mensaje)
 * @param onEvent  ({event, detail}) => void   — evento personalizado del agente (≠ agent-error)
 * @param onUsage  (usage) => void             — objeto de uso de tokens
 */
export async function streamChat({ url, body, headers = {}, fetchImpl = globalThis.fetch, onText, onEvent, onUsage }) {
  const response = await fetchImpl(url, {
    method: 'POST',
    headers: { Accept: 'text/event-stream', 'Content-Type': 'application/json', ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })
  if (!response.ok) {
    const errorText = response.text ? await response.text() : ''
    throw new Error(`Servidor respondió ${response.status}: ${errorText}`)
  }
  const reader = response.body && response.body.getReader ? response.body.getReader() : null
  if (!reader) throw new Error('No se pudo obtener el reader del stream.')

  const decoder = new TextDecoder()
  let buffer = ''
  let accumulated = ''

  const handlePayload = (payload) => {
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
      accumulated += payload
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
      if (line.trim().startsWith('data:')) handlePayload(line.trim().slice(5).trim())
    }
  }
  return accumulated
}
