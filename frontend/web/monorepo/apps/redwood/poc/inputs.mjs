import { chromeText, chromeLanguage } from './i18n.mjs'
// Campos de CAPTURA de un formulario (fichero, imagen, firma, cámara) para los que JET/Redwood no
// trae componente: no hay pad de firma ni cámara en oj-*/oj-sp-*, y oj-file-picker sólo entrega
// File (el valor de Mateu es un data URI que viaja en el estado, sin endpoint de subida — el mismo
// contrato que el renderer web). Así que un elemento PROPIO y mínimo, `<mateu-capture-field>`:
// los botones son oj-button de verdad, el lienzo/vídeo/imagen van con los tokens de Redwood, y el
// valor sale como `valueChanged` con { value, updatedFrom: 'internal' } — la forma del evento de
// un componente JET, así que las chains de cambio de campo (hostInputChanged, mateuFieldEdited…)
// lo tratan como uno más.
//
//   <mateu-capture-field mode="signature|camera|file|image" accept="…" readonly value="data:…">
//
// Lo puro (cómo se lee un fichero, qué texto enseña) está exportado y probado en Node; lo de DOM
// se define una vez por documento (defineCaptureField).

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

/** Los textos de los campos de captura en `lang` (catálogo de la interfaz, i18n.mjs). */
export function captureTexts(lang) {
  const l = chromeLanguage(lang)
  return Object.fromEntries(CAPTURE_KEYS.map((k) => [k, chromeText('capture' + k[0].toUpperCase() + k.slice(1), null, l)]))
}

/** ¿El valor es una imagen que se puede enseñar? (data URI de imagen o URL corriente) */
export function isImageValue(value) {
  const v = String(value || '')
  return /^data:image\//i.test(v) || /^(https?:)?\/\/|^\//.test(v)
}

/** Un nombre legible para un data URI de fichero (no lo lleva: se enseña el tipo y el tamaño). */
export function describeFileValue(value) {
  const v = String(value || '')
  const m = v.match(/^data:([^;,]+)?(;base64)?,(.*)$/i)
  if (!m) return v ? v.split('/').pop() : ''
  const bytes = m[2] ? Math.floor((m[3].length * 3) / 4) : decodeURIComponent(m[3]).length
  const kb = bytes < 1024 ? bytes + ' B' : (bytes / 1024).toFixed(bytes < 10240 ? 1 : 0) + ' KB'
  return (m[1] || 'file') + ' · ' + kb
}

/** Define `<mateu-capture-field>` en `win` (una vez). */
export function defineCaptureField(win = typeof window !== 'undefined' ? window : null) {
  if (!win || !win.customElements || win.customElements.get('mateu-capture-field')) return
  const doc = win.document
  const lang = (doc.documentElement.getAttribute('lang') || win.navigator.language || 'en')
  const t = captureTexts(lang)

  const button = (label, chroming, onAction) => {
    const b = doc.createElement('oj-button')
    // un componente JET creado fuera de Knockout espera un «binding provider» que nunca llega y
    // se queda oculto (visibility:hidden hasta oj-complete): `none` le dice que no lo hay
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
