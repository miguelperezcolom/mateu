import { chromeText, chromeLanguage } from './i18n.mjs'
// CAPTURE fields of a form (file, image, signature, camera) for which JET/Redwood has no
// component: there is no signature pad or camera in oj-*/oj-sp-*, and oj-file-picker only delivers
// File (Mateu's value is a data URI that travels in the state, with no upload endpoint — the same
// contract as the web renderer). So an OWN, minimal element, `<mateu-capture-field>`:
// the buttons are real oj-buttons, the canvas/video/image use Redwood's tokens, and the
// value comes out as `valueChanged` with { value, updatedFrom: 'internal' } — the shape of a JET
// component's event, so the field-change chains (hostInputChanged, mateuFieldEdited…)
// treat it as one more.
//
//   <mateu-capture-field mode="signature|camera|file|image" accept="…" readonly value="data:…">
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

const CAPTURE_KEYS = ['clear', 'accept', 'signAgain', 'remove', 'take', 'retake', 'upload', 'replace', 'noCamera', 'empty', 'start', 'signHere']

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

/** A readable name for a file data URI (it does not carry one: the type and size are shown). */
export function describeFileValue(value) {
  const v = String(value || '')
  const m = v.match(/^data:([^;,]+)?(;base64)?,(.*)$/i)
  if (!m) return v ? v.split('/').pop() : ''
  const bytes = m[2] ? Math.floor((m[3].length * 3) / 4) : decodeURIComponent(m[3]).length
  const kb = bytes < 1024 ? bytes + ' B' : (bytes / 1024).toFixed(bytes < 10240 ? 1 : 0) + ' KB'
  return (m[1] || 'file') + ' · ' + kb
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

  class MateuCaptureField extends win.HTMLElement {
    static get observedAttributes() { return ['value', 'readonly', 'mode', 'accept'] }
    connectedCallback() { this.render() }
    disconnectedCallback() { this.stopCamera() }
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
      this.appendChild(box)
      if (actions.childNodes.length) this.appendChild(actions)
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
