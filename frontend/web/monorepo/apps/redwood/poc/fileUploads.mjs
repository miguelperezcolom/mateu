import { chromeText } from './i18n.mjs'
import { authHeadersOf } from './resilience.mjs'
import { storedTokenMayGoTo } from './hostHeaders.mjs'

// LARGE FILE UPLOADS through the app's storage port (design/uploads/file-uploads-contract.md) on
// the VB shell — a port of libs/mateu fileUploads.ts + fileUploader.ts (the same rules as the React
// Native app's src/core/fileUploads.ts; keep the three in step). A fileUpload field the server gave
// an `uploadTicket` + `uploadUrl` (its storage is registered) sends the bytes to the server —
// streamed (`POST uploadUrl`, raw body, X-Mateu-Upload-Ticket + X-Mateu-File-Name), or, with
// `uploadDirect`, to the pre-signed target the store issues (`POST uploadUrl/target`; a 404 falls
// back to streaming) — and commits the `mateu-file:` reference the server answers. Without a ticket
// the file is read into a data URI as before, refused over `maxBytes` (10 MB when undeclared).
// The pure half is tested in Node (test-sources.mjs); mateu-capture-field (inputs.mjs) uses it.

/** The data-URI fallback's limit when the field declares none (10 MB). */
export const DEFAULT_UPLOAD_FALLBACK_MAX_BYTES = 10485760

const attrMapOf = (attributes) => {
  const out = {}
  if (Array.isArray(attributes)) {
    for (const a of attributes) if (a && typeof a.key === 'string' && a.value != null) out[a.key] = String(a.value)
  } else if (attributes && typeof attributes === 'object') {
    for (const [k, v] of Object.entries(attributes)) if (v != null) out[k] = String(v)
  }
  return out
}
const blankless = (s) => (s && String(s).trim() ? String(s).trim() : undefined)

/** What a fileUpload field declares (accept/maxBytes/multiple) and what the server added
 *  (uploadUrl/uploadTicket/uploadDirect), from the field's generic attributes. */
export function uploadConfigOf(attributes) {
  const a = attrMapOf(attributes)
  const max = a.maxBytes !== undefined && /^\d+$/.test(a.maxBytes.trim()) ? Number(a.maxBytes.trim()) : undefined
  return {
    accept: blankless(a.accept),
    maxBytes: max,
    multiple: (a.multiple || '').trim().toLowerCase() === 'true',
    uploadUrl: blankless(a.uploadUrl),
    uploadTicket: blankless(a.uploadTicket),
    uploadDirect: (a.uploadDirect || '').trim().toLowerCase() === 'true',
  }
}

/** True when the field uploads through the server instead of reading the file into a data URI. */
export const isUploadMode = (c) => !!(c && c.uploadTicket && c.uploadUrl)

/** Whether `accept` lets a file through — the server's rule (`.ext`, `type/*`, exact type). */
export function uploadAccepts(accept, name, contentType) {
  const entries = String(accept || '').split(',').map((e) => e.trim().toLowerCase()).filter(Boolean)
  if (!entries.length) return true
  const lowerName = String(name || '').toLowerCase()
  const type = String(contentType || '').split(';')[0].trim().toLowerCase()
  return entries.some((entry) => {
    if (entry.startsWith('.')) return lowerName.endsWith(entry)
    if (entry.endsWith('/*')) return type.startsWith(entry.slice(0, -1))
    return type === entry
  })
}

/** `N bytes`, `N KB`, `N MB`, `N GB` (1024 base, integer when exact, else one decimal). */
export function uploadBytesText(bytes) {
  const units = ['bytes', 'KB', 'MB', 'GB']
  let value = bytes
  let unit = 0
  while (unit < units.length - 1 && value >= 1024) { value /= 1024; unit++ }
  return (Number.isInteger(value) ? String(value) : value.toFixed(1)) + ' ' + units[unit]
}

/** Percent-encodes UTF-8, escaping every byte outside `A-Za-z0-9-._~` (the file name header). */
export function uploadPercentEncode(text) {
  return encodeURIComponent(String(text)).replace(/[!'()*]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase())
}

/** The field's value as a list of entries (a single value → one entry; blank → none). */
export function fileValuesOf(value) {
  if (Array.isArray(value)) return value.filter((v) => v != null && String(v) !== '').map(String)
  if (value == null || String(value) === '') return []
  return [String(value)]
}

/** The value after a file was committed: appended for a `multiple` field, replaced otherwise. */
export const withUploadedFile = (current, added, multiple) => (multiple ? [...fileValuesOf(current), added] : added)

/** The value after the entry at `index` was removed. */
export function withoutUploadedFile(current, index, multiple) {
  if (!multiple) return ''
  const list = fileValuesOf(current)
  list.splice(index, 1)
  return list
}

/** What the user is told when a picked file cannot go: null when it may. */
export function pickedFileRefusal(config, file) {
  if (!uploadAccepts(config.accept, file.name, file.type)) return chromeText('fileNotAccepted')
  const max = isUploadMode(config) ? config.maxBytes : (config.maxBytes ?? DEFAULT_UPLOAD_FALLBACK_MAX_BYTES)
  if (max !== undefined && file.size > max) return chromeText('fileTooLarge', { max: uploadBytesText(max) })
  return null
}

/**
 * Where to send the bytes: an absolute `uploadUrl` as it is; a root-relative one under the ROOT the
 * backend serves its assets from (mount.mjs mateuAssetBase: the public base in path mode, the
 * backend origin in development) — the upload endpoints live at the root path, never under a mount.
 */
export function resolveUploadTarget(assetBase, uploadUrl) {
  if (/^[a-z][a-z0-9+.-]*:/i.test(uploadUrl)) return uploadUrl
  const root = String(assetBase || '').replace(/\/+$/, '')
  return uploadUrl.startsWith('/') ? root + uploadUrl : root + '/' + uploadUrl
}

const jsonOfText = (text) => {
  try { const v = JSON.parse(text); return v && typeof v === 'object' ? v : null } catch (e) { return null }
}

/** The server's `message` of a refused upload, else a plain text for its status. */
export function uploadErrorText(status, text) {
  const message = (jsonOfText(text) || {}).message
  if (typeof message === 'string' && message) return message
  if (status === 403) return chromeText('uploadNotAllowed')
  if (status === 404) return chromeText('uploadsNotAvailable')
  if (status === 415) return chromeText('fileNotAccepted')
  if (status === 0) return chromeText('uploadNotSent')
  return chromeText('uploadFailed')
}

/** A refused or failed upload; `message` is what the user is shown. */
export class UploadFailure extends Error {
  constructor(status, message) { super(message); this.status = status }
}
/** The user cancelled the upload (nothing to show). */
export class UploadAborted extends Error {
  constructor() { super('cancelled') }
}

/** The Mateu credentials only for a url they may go to (the stored token never leaves its origins). */
const credentialsFor = (url) => (storedTokenMayGoTo(url) ? authHeadersOf() : {})

async function sendUpload(transport, request) {
  if (request.signal && request.signal.aborted) throw new UploadAborted()
  try {
    return await transport(request)
  } catch (e) {
    if (e instanceof UploadAborted || (request.signal && request.signal.aborted)) throw new UploadAborted()
    throw new UploadFailure(0, uploadErrorText(0, ''))
  }
}

/**
 * Uploads `file` for a field in upload mode and returns the value to commit (a `mateu-file:`
 * reference). `transport({method, url, headers, body, onProgress, signal})` → `{status, text}`.
 */
export async function uploadPickedFile(assetBase, config, file, transport, onProgress, signal) {
  if (!isUploadMode(config)) throw new UploadFailure(0, chromeText('uploadsNotAvailable'))
  const url = resolveUploadTarget(assetBase, config.uploadUrl)
  const ticket = config.uploadTicket
  const contentType = file.type || undefined
  if (config.uploadDirect) {
    const targetUrl = url.replace(/\/+$/, '') + '/target'
    const answer = await sendUpload(transport, {
      method: 'POST', url: targetUrl, signal,
      headers: { ...credentialsFor(targetUrl), 'X-Mateu-Upload-Ticket': ticket, 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ name: file.name, contentType: contentType || 'application/octet-stream', size: file.size == null ? -1 : file.size }),
    })
    if (answer.status === 200) {
      const json = jsonOfText(answer.text)
      if (!json || typeof json.url !== 'string' || typeof json.value !== 'string') throw new UploadFailure(200, chromeText('uploadFailed'))
      const headers = {}
      for (const [k, v] of Object.entries(json.headers || {})) if (v != null) headers[k] = String(v)
      const hasType = Object.keys(headers).some((k) => k.toLowerCase() === 'content-type')
      // the pre-signed url belongs to the store, not to Mateu: only the headers the store asked for
      const sent = await sendUpload(transport, {
        method: typeof json.method === 'string' && json.method ? json.method : 'PUT', url: json.url, signal, onProgress,
        headers: { ...(contentType && !hasType ? { 'Content-Type': contentType } : {}), ...headers }, body: file,
      })
      if (sent.status < 200 || sent.status >= 300) throw new UploadFailure(sent.status, uploadErrorText(sent.status, sent.text))
      return json.value
    }
    if (answer.status !== 404) throw new UploadFailure(answer.status, uploadErrorText(answer.status, answer.text))
    // 404: the store issued no target — stream it through Mateu
  }
  const answer = await sendUpload(transport, {
    method: 'POST', url, signal, onProgress, body: file,
    headers: {
      ...credentialsFor(url),
      'X-Mateu-Upload-Ticket': ticket,
      'X-Mateu-File-Name': uploadPercentEncode(file.name),
      'Content-Type': contentType || 'application/octet-stream',
      Accept: 'application/json',
    },
  })
  if (answer.status !== 200) throw new UploadFailure(answer.status, uploadErrorText(answer.status, answer.text))
  const value = (jsonOfText(answer.text) || {}).value
  if (typeof value !== 'string' || !value) throw new UploadFailure(answer.status, chromeText('uploadFailed'))
  return value
}

/** The browser's transport: XMLHttpRequest, which reports upload progress and can be aborted. */
export function xhrUploadTransport(request) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open(request.method, request.url)
    for (const [k, v] of Object.entries(request.headers || {})) xhr.setRequestHeader(k, v)
    if (request.onProgress && xhr.upload) {
      xhr.upload.onprogress = (e) => { if (e.lengthComputable && e.total > 0) request.onProgress(Math.min(1, e.loaded / e.total)) }
    }
    xhr.onload = () => resolve({ status: xhr.status, text: String(xhr.responseText || '') })
    xhr.onerror = () => reject(new Error('network'))
    xhr.ontimeout = () => reject(new Error('timeout'))
    xhr.onabort = () => reject(new UploadAborted())
    if (request.signal) request.signal.addEventListener('abort', () => xhr.abort())
    xhr.send(request.body)
  })
}

// where the upload endpoints are (loadMateuShell: mount.mjs mateuAssetBase)
let uploadAssetBase = ''
export function setUploadAssetBase(base) { uploadAssetBase = base || '' }
export const currentUploadAssetBase = () => uploadAssetBase
