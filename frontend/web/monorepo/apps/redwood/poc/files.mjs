// Efectos de DOM que el reducer (puro) solo DESCRIBE: descargar un fichero y abrir una URL en
// otra pestaña. Antes `effects.download` se calculaba y nadie lo leía — el CSV de un listado o
// el PDF de un folio llegaban al navegador y se perdían. Cada chain que reduce un increment
// llama a applyDomEffects(reg.effects) justo después: es el ÚNICO sitio donde estos efectos
// tocan el documento.
//
// `env` (window por defecto) se inyecta para poder probarlo en Node sin DOM.

/** DownloadFile del wire → { filename, mimeType, base64Content } o null si no hay contenido. */
export function fileDownloadOf(data) {
  if (!data || typeof data !== 'object' || !data.base64Content) return null
  return {
    filename: data.filename || 'export',
    mimeType: data.mimeType || 'application/octet-stream',
    base64Content: String(data.base64Content),
  }
}

export function base64ToBytes(b64, atobFn = globalThis.atob) {
  const bin = atobFn(b64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return bytes
}

/** Descarga un DownloadFile: Blob + <a download> anclado al body (Safari/Firefox ignoran el
 *  click de un enlace suelto) y el object URL se libera DESPUÉS (revocarlo en el mismo tick
 *  cancela la descarga en Firefox). */
export function triggerDownload(data, env = globalThis) {
  const file = fileDownloadOf(data)
  if (!file || !env.document) return false
  const blob = new env.Blob([base64ToBytes(file.base64Content, env.atob)], { type: file.mimeType })
  const url = env.URL.createObjectURL(blob)
  const a = env.document.createElement('a')
  a.href = url
  a.download = file.filename
  a.rel = 'noopener'
  a.style.display = 'none'
  env.document.body.appendChild(a)
  a.click()
  a.remove()
  env.setTimeout(() => env.URL.revokeObjectURL(url), 1000)
  return true
}

/** Aplica los efectos de DOM de una reducción. Devuelve cuántos ha aplicado. */
export function applyDomEffects(effects, env = globalThis) {
  if (!effects) return 0
  let n = 0
  for (const d of effects.downloads || (effects.download ? [effects.download] : []))
    if (triggerDownload(d, env)) n++
  return n
}
