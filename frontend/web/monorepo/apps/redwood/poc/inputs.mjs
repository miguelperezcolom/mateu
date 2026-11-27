import { chromeText, chromeLanguage } from './i18n.mjs'
import {
  uploadConfigOf, isUploadMode, pickedFileRefusal, uploadPickedFile, xhrUploadTransport, UploadAborted,
  fileValuesOf, withUploadedFile, withoutUploadedFile, currentUploadAssetBase,
} from './fileUploads.mjs'
// CAPTURE fields of a form (file, image, signature, camera) for which JET/Redwood has no
// component: there is no signature pad or camera in oj-*/oj-sp-*, and oj-file-picker only delivers
// File. Mateu's value is a data URI that travels in the state — or, for a file field whose app
// registers a storage (the server sends an upload ticket), the `mateu-file:` reference of the file
// it was uploaded to (fileUploads.mjs) — the same contract as the web renderer. So an OWN, minimal
// element, `<mateu-capture-field>`:
// the buttons are real oj-buttons, the canvas/video/image use Redwood's tokens, and the
// value comes out as `valueChanged` with { value, updatedFrom: 'internal' } — the shape of a JET
// component's event, so the field-change chains (hostInputChanged, mateuFieldEdited…)
// treat it as one more.
//
//   <mateu-capture-field mode="signature|camera|file|image|url" accept="…" readonly value="data:…"
//       data-upload='{"uploadUrl":…,"uploadTicket":…,"maxBytes":…,"multiple":…}'>
//
// A `file` field with `multiple` holds a LIST of values (the `value` property is an array).
//
// `url` is the image stereotype (an image by its URL): editable, the URL input with a contained preview
// under it that follows what is typed; read-only, the image alone.
//
// The pure part (how a file is read, what text it shows) is exported and tested in Node; the DOM part
// is defined once per document (defineCaptureField).

/** Only what an <img> may load: a data:image URI (what capture fields store), http(s) or a relative
 *  path. Anything else (javascript:, other data: types…) shows nothing. */
export function safeImageSrc(value) {
  const v = String(value || '').trim()
  if (/^data:image\/[a-z0-9.+-]+[;,]/i.test(v)) return v
  if (/^https?:\/\//i.test(v)) return v
  if (/^[a-z][a-z0-9+.-]*:/i.test(v)) return ''
  return v
}

const CAPTURE_KEYS = ['clear', 'accept', 'signAgain', 'remove', 'take', 'retake', 'upload', 'replace', 'noCamera', 'empty', 'start', 'signHere', 'useUrl', 'imageUrl']

/**
 * The value an uploadable image takes from a URL typed or pasted ("Use a URL" next to Upload): an
 * http(s) URL or a path on this site, trimmed; undefined for a blank (Remove clears it), a data: URI
 * (that is what Upload produces), a protocol-relative URL or any other scheme. The same rule as
 * libs/mateu imageUrl.ts.
 */
export function imageUrlOf(text) {
  if (typeof text !== 'string') return undefined
  // eslint-disable-next-line no-control-regex
  const url = text.replace(/[\u0000-\u001f\u007f]/g, '').trim()
  if (!url) return undefined
  const m = /^([a-z][a-z0-9+.-]*):/i.exec(url)
  if (m) return /^https?$/i.test(m[1]) ? url : undefined
  if (url.indexOf('//') === 0) return undefined
  return url
}

/** The capture fields' texts in `lang` (the interface catalogue, i18n.mjs). */
export function captureTexts(lang) {
  const l = chromeLanguage(lang)
  return Object.fromEntries(CAPTURE_KEYS.map((k) => [k, chromeText('capture' + k[0].toUpperCase() + k.slice(1), null, l)]))
}

/** Is the value an image that can be shown? (image data URI or ordinary URL) */
export function isImageValue(value) {
  const v = String(value || '')
  return /^data:image\//i.test(v) || /^(https?:)?\/\/|^\//.test(v)
}

/** `N B` / `N KB` / `N MB` — the capture field's size text. */
function sizeText(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1048576) return (bytes / 1024).toFixed(bytes < 10240 ? 1 : 0) + ' KB'
  return (bytes / 1048576).toFixed(1) + ' MB'
}

/**
 * A readable name for a file value: a data URI does not carry one (the type and size are shown); a
 * `mateu-file:` reference — a file another renderer uploaded to the app's FileStorage
 * (design/uploads/file-uploads-contract.md) — shows its name (else its id) and size.
 */
export function describeFileValue(value) {
  const v = String(value || '')
  if (v.indexOf('mateu-file:') === 0) {
    const rest = v.slice('mateu-file:'.length)
    const q = rest.indexOf('?')
    const dec = (t) => { try { return decodeURIComponent(t) } catch (e) { return t } }
    const params = {}
    if (q >= 0) {
      rest.slice(q + 1).split('&').forEach((pair) => {
        const eq = pair.indexOf('=')
        if (eq > 0) params[pair.slice(0, eq)] = dec(pair.slice(eq + 1))
      })
    }
    const name = params.name || dec(q < 0 ? rest : rest.slice(0, q))
    return /^\d+$/.test(params.size || '') ? name + ' · ' + sizeText(Number(params.size)) : name
  }
  // a data URI carries the file's name as a `;name=` parameter when the web or this field read it
  const named = v.match(/^data:([^;,]+)?((?:;[^;,=]+=[^;,]*)*)(;base64)?,(.*)$/i)
  if (!named) return v ? v.split('/').pop() : ''
  const nameParam = (named[2] || '').split(';').find((p) => p.indexOf('name=') === 0)
  let name = ''
  if (nameParam) { try { name = decodeURIComponent(nameParam.slice(5)) } catch (e) { name = nameParam.slice(5) } }
  const bytes = named[3] ? Math.floor((named[4].length * 3) / 4) : decodeURIComponent(named[4]).length
  return (name || named[1] || 'file') + ' · ' + sizeText(bytes)
}

/** Defines `<mateu-capture-field>` in `win` (once). */
export function defineCaptureField(win = typeof window !== 'undefined' ? window : null) {
  if (!win || !win.customElements || win.customElements.get('mateu-capture-field')) return
  const doc = win.document
  const lang = (doc.documentElement.getAttribute('lang') || win.navigator.language || 'en')
  const t = captureTexts(lang)

  const button = (label, chroming, onAction) => {
    const b = doc.createElement('oj-button')
    // a JET component created outside Knockout waits for a «binding provider» that never arrives and
    // stays hidden (visibility:hidden until oj-complete): `none` tells it there is none
    b.setAttribute('data-oj-binding-provider', 'none')
    b.setAttribute('chroming', chroming || 'outlined')
    b.className = 'oj-button-sm oj-sm-margin-2x-end'
    b.textContent = label
    b.addEventListener('ojAction', (e) => { e.stopPropagation(); onAction() })
    return b
  }
  const readFile = (file) => new Promise((resolve, reject) => {
    const reader = new win.FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
  // a file read inline keeps its NAME, as the web renderer stamps it (before the base64 marker)
  const namedDataUri = (uri, name) => {
    const comma = uri.indexOf(',')
    if (comma < 0 || !name) return uri
    const meta = uri.slice(0, comma)
    const stamped = meta.indexOf(';base64') >= 0 ? meta.replace(';base64', ';name=' + encodeURIComponent(name) + ';base64') : meta + ';name=' + encodeURIComponent(name)
    return stamped + uri.slice(comma)
  }

  class MateuCaptureField extends win.HTMLElement {
    static get observedAttributes() { return ['value', 'readonly', 'mode', 'accept'] }
    connectedCallback() { this.render() }
    disconnectedCallback() { this.stopCamera(); for (const u of this.uploads || []) u.controller.abort() }
    attributeChangedCallback() { if (this.isConnected && !this.busy) this.render() }
    // a `multiple` file field holds a list: kept as a property (an attribute would flatten it)
    get value() { return this.list ? this.list.slice() : (this.getAttribute('value') || '') }
    set value(v) {
      if (Array.isArray(v)) {
        this.list = fileValuesOf(v)
        this.removeAttribute('value')
        if (this.isConnected && !this.busy) this.render()
        return
      }
      this.list = null
      if (v == null || v === '') this.removeAttribute('value'); else this.setAttribute('value', String(v))
    }

    /** What the server and the field declare for uploads (data-upload, accept). */
    uploadConfig() {
      let declared = {}
      try { declared = JSON.parse(this.getAttribute('data-upload') || '{}') || {} } catch (e) { declared = {} }
      const config = uploadConfigOf(declared)
      return { ...config, accept: config.accept || this.getAttribute('accept') || undefined }
    }

    emit(value) {
      this.busy = true
      this.value = value
      this.busy = false
      const empty = value == null || value === '' || (Array.isArray(value) && !value.length)
      this.dispatchEvent(new win.CustomEvent('valueChanged', {
        detail: { value: empty ? (Array.isArray(value) ? [] : null) : value, previousValue: null, updatedFrom: 'internal' }, bubbles: true }))
      this.render()
    }

    /** A FILE field: each picked file is checked, then uploaded (upload mode) or read inline. */
    pickFiles() {
      const config = this.uploadConfig()
      const input = doc.createElement('input')
      input.type = 'file'
      if (config.accept) input.accept = config.accept
      input.multiple = !!config.multiple
      input.addEventListener('change', () => {
        const picked = Array.from(input.files || [])
        this.error = null
        for (const file of config.multiple ? picked : picked.slice(0, 1)) {
          const refusal = pickedFileRefusal(config, file)
          if (refusal) { this.error = refusal; continue }
          if (isUploadMode(config)) void this.upload(config, file)
          else readFile(file).then((uri) => this.emit(withUploadedFile(this.value, namedDataUri(uri, file.name), config.multiple)))
            .catch(() => { this.error = chromeText('uploadFailed'); this.render() })
        }
        this.render()
      })
      input.click()
    }

    async upload(config, file) {
      const entry = { name: file.name, fraction: 0, controller: new win.AbortController() }
      this.uploads = [...(this.uploads || []), entry]
      this.render()
      try {
        const value = await uploadPickedFile(currentUploadAssetBase(), config, file, xhrUploadTransport, (fraction) => {
          entry.fraction = fraction
          const bar = entry.bar
          if (bar) bar.setAttribute('value', String(Math.round(fraction * 100)))
        }, entry.controller.signal)
        this.uploads = this.uploads.filter((u) => u !== entry)
        this.emit(withUploadedFile(this.value, value, config.multiple))
      } catch (failure) {
        this.uploads = this.uploads.filter((u) => u !== entry)
        if (!(failure instanceof UploadAborted)) this.error = failure.message
        this.render()
      }
    }

    /** The FILE mode: the entries (each removable in a list), the uploads in flight, the error. */
    renderFile(box, actions, readonly) {
      const config = this.uploadConfig()
      const values = fileValuesOf(this.value)
      values.forEach((v, i) => {
        const row = doc.createElement('div')
        row.className = 'mateu-capture-file'
        const span = doc.createElement('span')
        span.className = 'oj-typography-body-md'
        span.textContent = describeFileValue(v)
        row.appendChild(span)
        if (!readonly && config.multiple) row.appendChild(button(t.remove, 'borderless', () => this.emit(withoutUploadedFile(this.value, i, true))))
        box.appendChild(row)
      })
      for (const u of this.uploads || []) {
        const row = doc.createElement('div')
        row.className = 'mateu-capture-file mateu-capture-uploading'
        const span = doc.createElement('span')
        span.className = 'oj-typography-body-sm'
        span.textContent = chromeText('uploadingFile', { name: u.name })
        const bar = doc.createElement('progress')
        bar.className = 'mateu-capture-progress'
        bar.max = 100
        bar.setAttribute('value', String(Math.round(u.fraction * 100)))
        bar.setAttribute('aria-label', span.textContent)
        u.bar = bar
        row.appendChild(span)
        row.appendChild(bar)
        row.appendChild(button(chromeText('cancel'), 'borderless', () => u.controller.abort()))
        box.appendChild(row)
      }
      if (!values.length && !(this.uploads || []).length) {
        const empty = doc.createElement('span')
        empty.className = 'oj-typography-body-sm oj-text-color-secondary oj-sm-margin-2x-end'
        empty.textContent = readonly ? '—' : t.empty
        box.appendChild(empty)
      }
      if (this.error) {
        const error = doc.createElement('div')
        error.className = 'mateu-capture-error oj-typography-body-sm oj-text-color-danger'
        error.setAttribute('role', 'alert')
        error.textContent = this.error
        box.appendChild(error)
      }
      if (!readonly) {
        if (config.multiple || !values.length) actions.appendChild(button(t.upload, 'outlined', () => this.pickFiles()))
        else {
          actions.appendChild(button(t.replace, 'outlined', () => this.pickFiles()))
          actions.appendChild(button(t.remove, 'borderless', () => this.emit(null)))
        }
      }
      this.appendChild(box)
      if (actions.childNodes.length) this.appendChild(actions)
    }

    stopCamera() {
      if (this.stream) { this.stream.getTracks().forEach((track) => track.stop()); this.stream = null }
    }

    pickFile(capture) {
      const input = doc.createElement('input')
      input.type = 'file'
      const mode = this.getAttribute('mode')
      input.accept = this.getAttribute('accept') || (mode === 'file' ? '' : 'image/*')
      if (capture) input.setAttribute('capture', 'environment')
      input.addEventListener('change', async () => {
        const file = input.files && input.files[0]
        if (file) this.emit(await readFile(file))
      })
      input.click()
    }

    render() {
      const mode = this.getAttribute('mode') || 'file'
      const readonly = this.hasAttribute('readonly') && this.getAttribute('readonly') !== 'false'
      const value = this.value
      this.stopCamera()
      this.textContent = ''
      this.classList.add('mateu-capture-field')
      const box = doc.createElement('div')
      box.className = 'mateu-capture-box'
      const actions = doc.createElement('div')
      actions.className = 'oj-sm-margin-2x-top'

      if (mode === 'url' && !readonly) {
        this.renderUrl(box, value)
        this.appendChild(box)
        return
      }
      if (mode === 'file') {
        this.renderFile(box, actions, readonly)
        return
      }
      if (value && (mode !== 'file' || isImageValue(value))) {
        const img = doc.createElement('img')
        // the guard inline, where the value is assigned: only data:image, http(s) or a path with no
        // scheme reach the src (javascript:, other data: types show nothing) — see safeImageSrc
        const src = String(value).trim()
        if (/^data:image\/[a-z0-9.+-]+[;,]/i.test(src) || /^https?:\/\//i.test(src) || !/^[a-z][a-z0-9+.-]*:/i.test(src)) {
          img.src = src
        }
        img.alt = ''
        img.className = 'mateu-capture-preview' + (mode === 'signature' ? ' mateu-capture-signature' : '')
        box.appendChild(img)
      } else if (value) {
        const span = doc.createElement('span')
        span.className = 'oj-typography-body-md'
        span.textContent = describeFileValue(value)
        box.appendChild(span)
      }

      if (!readonly) {
        if (mode === 'signature' && !value) {
          this.renderPad(box, actions)
        } else if (mode === 'camera' && !value) {
          actions.appendChild(button(t.start, 'callToAction', () => this.openCamera(box, actions)))
          actions.appendChild(button(t.upload, 'outlined', () => this.pickFile(true)))
        } else if (!value) {
          const empty = doc.createElement('span')
          empty.className = 'oj-typography-body-sm oj-text-color-secondary oj-sm-margin-2x-end'
          empty.textContent = t.empty
          box.appendChild(empty)
          actions.appendChild(button(t.upload, 'outlined', () => this.pickFile(false)))
        } else {
          const again = mode === 'signature' ? t.signAgain : mode === 'camera' ? t.retake : t.replace
          actions.appendChild(button(again, 'outlined', () => {
            if (mode === 'signature' || mode === 'camera') this.emit(null)
            else this.pickFile(false)
          }))
          actions.appendChild(button(t.remove, 'borderless', () => this.emit(null)))
        }
      } else if (!value) {
        const dash = doc.createElement('span')
        dash.textContent = '—'
        box.appendChild(dash)
      }
      // an uploadable image can also be set from a URL (the value already shows one): a box under
      // the actions, committed on change with the same rule as the web (imageUrlOf)
      if (mode === 'image' && !readonly) {
        actions.appendChild(button(t.useUrl, 'borderless', () => {
          this.urlOpen = !this.urlOpen
          this.render()
        }))
      }
      this.appendChild(box)
      if (actions.childNodes.length) this.appendChild(actions)
      if (mode === 'image' && !readonly && this.urlOpen) {
        const input = doc.createElement('input')
        input.type = 'url'
        input.className = 'oj-text-field-input mateu-capture-url oj-sm-margin-2x-top'
        input.placeholder = 'https://…'
        input.setAttribute('aria-label', t.imageUrl)
        input.value = /^data:/i.test(String(value || '')) ? '' : String(value || '')
        input.addEventListener('change', () => {
          const url = imageUrlOf(input.value)
          if (url !== undefined && url !== value) this.emit(url)
        })
        this.appendChild(input)
      }
    }

    /** The image stereotype, editable: its URL typed in, the preview following it (committed on change). */
    renderUrl(box, value) {
      const input = doc.createElement('input')
      input.type = 'url'
      input.className = 'oj-text-field-input mateu-capture-url'
      input.value = value
      const label = this.getAttribute('aria-label')
      if (label) input.setAttribute('aria-label', label)
      const img = doc.createElement('img')
      img.alt = ''
      img.className = 'mateu-capture-preview'
      const show = (v) => {
        // the same guard as the other modes: only data:image, http(s) or a scheme-less path
        const src = safeImageSrc(v)
        if (src) img.src = src; else img.removeAttribute('src')
        img.hidden = !src
      }
      show(value)
      input.addEventListener('input', () => show(input.value))
      input.addEventListener('change', () => this.emit(input.value.trim()))
      box.classList.add('mateu-capture-url-box')
      box.appendChild(input)
      box.appendChild(img)
    }

    renderPad(box, actions) {
      const canvas = doc.createElement('canvas')
      canvas.className = 'mateu-capture-pad'
      canvas.width = 560
      canvas.height = 180
      canvas.setAttribute('aria-label', t.signHere)
      canvas.setAttribute('role', 'img')
      const ctx = canvas.getContext('2d')
      ctx.lineWidth = 2.2
      ctx.lineCap = 'round'
      ctx.strokeStyle = '#161513'
      let drawing = false
      let inked = false
      const at = (e) => {
        const r = canvas.getBoundingClientRect()
        return [(e.clientX - r.left) * (canvas.width / r.width), (e.clientY - r.top) * (canvas.height / r.height)]
      }
      canvas.addEventListener('pointerdown', (e) => {
        drawing = true; inked = true
        canvas.setPointerCapture(e.pointerId)
        const [x, y] = at(e); ctx.beginPath(); ctx.moveTo(x, y)
      })
      canvas.addEventListener('pointermove', (e) => {
        if (!drawing) return
        const [x, y] = at(e); ctx.lineTo(x, y); ctx.stroke()
      })
      const stop = () => { drawing = false }
      canvas.addEventListener('pointerup', stop)
      canvas.addEventListener('pointercancel', stop)
      box.appendChild(canvas)
      actions.appendChild(button(t.accept, 'callToAction', () => { if (inked) this.emit(canvas.toDataURL('image/png')) }))
      actions.appendChild(button(t.clear, 'outlined', () => { ctx.clearRect(0, 0, canvas.width, canvas.height); inked = false }))
    }

    async openCamera(box, actions) {
      const media = win.navigator.mediaDevices
      if (!media || !media.getUserMedia) { this.pickFile(true); return }
      try {
        this.stream = await media.getUserMedia({ video: { facingMode: 'environment' } })
      } catch (e) {
        box.textContent = t.noCamera
        return
      }
      const video = doc.createElement('video')
      video.className = 'mateu-capture-preview'
      video.autoplay = true
      video.playsInline = true
      video.muted = true
      video.srcObject = this.stream
      box.textContent = ''
      box.appendChild(video)
      actions.textContent = ''
      actions.appendChild(button(t.take, 'callToAction', () => {
        const canvas = doc.createElement('canvas')
        canvas.width = video.videoWidth || 640
        canvas.height = video.videoHeight || 480
        canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height)
        this.stopCamera()
        this.emit(canvas.toDataURL('image/jpeg', 0.85))
      }))
    }
  }
  win.customElements.define('mateu-capture-field', MateuCaptureField)
}

/** A colour value as a #rrggbb string (what a native colour input takes), '' when it is not one. */
export function hexColorOf(value) {
  const v = String(value == null ? '' : value).trim()
  if (/^#[0-9a-f]{6}$/i.test(v)) return v.toLowerCase()
  const short = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/i.exec(v)
  if (short) return ('#' + short[1] + short[1] + short[2] + short[2] + short[3] + short[3]).toLowerCase()
  const rgb = /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/i.exec(v)
  if (rgb) return '#' + [rgb[1], rgb[2], rgb[3]].map((n) => Math.min(255, +n).toString(16).padStart(2, '0')).join('')
  return ''
}

/**
 * `<mateu-color-field value="#3a7bd5" readonly>`: a colour FIELD. JET's oj-color-spectrum is an
 * inline palette over oj.Color objects, not a form field with a string value — the wire carries a
 * string — so: a swatch (the platform colour picker) beside an oj-input-text with the hex code,
 * and the same `valueChanged` contract as mateu-capture-field.
 */
export function defineColorField(win = typeof window !== 'undefined' ? window : null) {
  if (!win || !win.customElements || win.customElements.get('mateu-color-field')) return
  const doc = win.document
  class MateuColorField extends win.HTMLElement {
    static get observedAttributes() { return ['value', 'readonly'] }
    connectedCallback() { this.render() }
    attributeChangedCallback() { if (this.isConnected && !this.busy) this.render() }
    get value() { return this.getAttribute('value') || '' }
    set value(v) { if (v == null || v === '') this.removeAttribute('value'); else this.setAttribute('value', String(v)) }
    emit(value) {
      this.busy = true
      this.value = value
      this.busy = false
      this.dispatchEvent(new win.CustomEvent('valueChanged', {
        detail: { value: value || null, previousValue: null, updatedFrom: 'internal' }, bubbles: true }))
      this.render()
    }
    render() {
      const readonly = this.hasAttribute('readonly') && this.getAttribute('readonly') !== 'false'
      const hex = hexColorOf(this.value)
      this.textContent = ''
      this.classList.add('mateu-color-field')
      const swatch = doc.createElement('input')
      swatch.type = 'color'
      swatch.className = 'mateu-color-swatch'
      swatch.value = hex || '#000000'
      swatch.disabled = readonly
      swatch.setAttribute('aria-label', chromeText('colourPicker', { label: this.getAttribute('aria-label') || '' }))
      swatch.addEventListener('change', () => this.emit(swatch.value))
      const code = doc.createElement('span')
      code.className = 'oj-typography-body-md mateu-color-code'
      code.textContent = this.value || '—'
      this.appendChild(swatch)
      this.appendChild(code)
    }
  }
  win.customElements.define('mateu-color-field', MateuColorField)
}
