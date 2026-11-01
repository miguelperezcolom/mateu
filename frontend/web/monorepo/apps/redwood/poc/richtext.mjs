import { chromeText } from './i18n.mjs'
// RICH TEXT (P2 #23): a read-only richText/html/markdown field and the Markdown
// component are painted WITH formatting. VB does not stamp HTML from a binding, so the atom carries the
// ALREADY SANITISED HTML in data-mateu-html and installRichText dumps it into its container. Sanitising is
// by ALLOWLIST (text tags; of attributes only a link's href with a safe
// scheme): no scripts, styles, handlers or iframes. Editing a richText is Spectra's own editor
// (oj-sp-input-rich-text-2) inside mateu-rich-text-field, which falls back to a small one of its own.

const ALLOWED = new Set(['p', 'br', 'b', 'strong', 'i', 'em', 'u', 's', 'code', 'pre', 'blockquote',
  'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'span', 'div', 'hr', 'table', 'thead',
  'tbody', 'tr', 'th', 'td', 'sub', 'sup'])
// its CONTENT is discarded too, not just the tag
const DROP_WITH_CONTENT = new Set(['script', 'style', 'iframe', 'object', 'embed', 'template', 'noscript', 'svg', 'math', 'textarea', 'select'])
const VOID = new Set(['br', 'hr'])
const SAFE_HREF = /^(https?:|mailto:|tel:|\/|#)/i

const escapeText = (t) => String(t).replace(/&(?!(#\d+|#x[0-9a-f]+|[a-z]+);)/gi, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const escapeAttr = (t) => String(t).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// `presentation` (the HTML of an Element / a header widget, not a rich-text value): also keeps
// `class`, `title`, `aria-hidden` and a FILTERED `style` on the allowed tags, and an <img> whose
// src is http(s), relative or a raster data: image. Still nothing that runs: no handler, no
// script, no url() in a style, no form.
const STYLE_PROPS = /^(color|background-color|font-(size|weight|style|family)|text-(align|decoration|transform)|vertical-align|(margin|padding)(-(top|right|bottom|left|inline|block)(-(start|end))?)?|(min-|max-)?(width|height)|line-height|display|white-space|opacity|gap|border(-(top|right|bottom|left))?(-(width|style|color|radius))?|border-collapse|flex(-(grow|shrink|basis|wrap|direction))?|align-(items|self|content)|justify-(content|self)|order)$/i
const STYLE_VALUE = /^[#\w\s.,%()+-]*$/
const SAFE_IMG_SRC = /^(https?:|\/|\.{0,2}\/|data:image\/(png|jpe?g|gif|webp|bmp|avif);)|^[^:]*$/i

const attrOfToken = (attrs, name) => {
  const m = new RegExp('(?:^|\\s)' + name + '\\s*=\\s*(?:"([^"]*)"|\'([^\']*)\'|([^\\s>]+))', 'i').exec(attrs || '')
  return m ? (m[1] ?? m[2] ?? m[3] ?? '') : null
}

/** A wire style (`"font-weight: 600; flex: 1"`) kept to the declarations that can only PRESENT —
 *  the same filter an Element's HTML goes through: known properties, plain values, no url() /
 *  expression(). What is left, as a CSS text. */
export function safeStyle(style) {
  const kept = []
  for (const decl of String(style).split(';')) {
    const i = decl.indexOf(':')
    if (i < 0) continue
    const prop = decl.slice(0, i).trim()
    const value = decl.slice(i + 1).trim()
    if (STYLE_PROPS.test(prop) && STYLE_VALUE.test(value) && !/url|expression|image-set/i.test(value)) kept.push(prop + ': ' + value)
  }
  return kept.join('; ')
}

/** The same filtered style as an object for a JET `:style` binding (camelCase keys: VB templates
 *  bind objects, not CSS text); {} when nothing survives. Custom properties are not kept. */
export function styleObjectOf(style) {
  const out = {}
  if (!style) return out
  for (const decl of safeStyle(style).split('; ')) {
    const i = decl.indexOf(':')
    if (i < 0) continue
    const prop = decl.slice(0, i).trim().toLowerCase()
    out[prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = decl.slice(i + 1).trim()
  }
  return out
}

function presentationAttrs(tag, attrs) {
  let out = ''
  const cls = attrOfToken(attrs, 'class')
  if (cls && /^[\w\s-]+$/.test(cls)) out += ' class="' + escapeAttr(cls.trim()) + '"'
  const title = attrOfToken(attrs, 'title')
  if (title) out += ' title="' + escapeAttr(title) + '"'
  if (attrOfToken(attrs, 'aria-hidden') === 'true') out += ' aria-hidden="true"'
  const style = attrOfToken(attrs, 'style')
  const clean = style ? safeStyle(style) : ''
  if (clean) out += ' style="' + escapeAttr(clean) + '"'
  if (tag === 'img') {
    const src = (attrOfToken(attrs, 'src') || '').replace(/[\t\n\r]/g, '').trim()
    if (src && SAFE_IMG_SRC.test(src)) out += ' src="' + escapeAttr(src) + '"'
    const alt = attrOfToken(attrs, 'alt')
    if (alt != null) out += ' alt="' + escapeAttr(alt) + '"'
    for (const dim of ['width', 'height']) {
      const v = attrOfToken(attrs, dim)
      if (v && /^\d+%?$/.test(v)) out += ' ' + dim + '="' + v + '"'
    }
  }
  return out
}

/** HTML → HTML sanitised by allowlist (`{ presentation: true }`: see presentationAttrs). */
export function sanitizeHtml(html, options = {}) {
  const presentation = !!options.presentation
  const out = []
  let skipping = null
  let depth = 0
  const re = /<!--[\s\S]*?-->|<\/?([a-zA-Z][a-zA-Z0-9]*)\b((?:[^>"']|"[^"]*"|'[^']*')*)>|[^<]+|</g
  let m
  const src = String(html == null ? '' : html)
  while ((m = re.exec(src))) {
    const token = m[0]
    if (token.startsWith('<!--')) continue
    const tag = m[1] ? m[1].toLowerCase() : null
    const closing = token.startsWith('</')
    if (skipping) {
      if (tag === skipping) depth += closing ? -1 : 1
      if (depth === 0) skipping = null
      continue
    }
    if (!tag) { out.push(escapeText(token)); continue }
    if (DROP_WITH_CONTENT.has(tag)) {
      if (!closing && !/\/\s*$/.test(m[2] || '')) { skipping = tag; depth = 1 }
      continue
    }
    const isImg = presentation && tag === 'img'
    if (!ALLOWED.has(tag) && !isImg) continue
    if (closing) { if (!VOID.has(tag) && !isImg) out.push('</' + tag + '>'); continue }
    let attrs = presentation ? presentationAttrs(tag, m[2] || '') : ''
    if (tag === 'a') {
      const href = /\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i.exec(m[2] || '')
      const value = href ? (href[1] ?? href[2] ?? href[3] ?? '').trim().replace(/&amp;/g, '&') : ''
      if (value && SAFE_HREF.test(value)) {
        attrs += ' href="' + escapeAttr(value) + '"' + (/^https?:/i.test(value) ? ' target="_blank" rel="noopener noreferrer"' : '')
      }
    }
    if (tag === 'th' || tag === 'td') {
      const align = /\balign\s*=\s*["']?(left|right|center)\b/i.exec(m[2] || '')
      // emitted from constants only: nothing of the input reaches the attribute
      const ALIGNS = { left: ' align="left"', right: ' align="right"', center: ' align="center"' }
      if (align) attrs += ALIGNS[align[1].toLowerCase()] || ''
    }
    out.push('<' + tag + attrs + '>')
  }
  return out.join('')
}

const tableCells = (line) => {
  const t = line.trim().replace(/^\|/, '').replace(/\|$/, '')
  return t.split(/(?<!\\)\|/).map((c) => c.trim().replace(/\\\|/g, '|'))
}
const isTableSeparator = (line) => /\|/.test(line) && tableCells(line).every((c) => /^:?-{1,}:?$/.test(c))

/** Markdown → HTML (sanitised): headings, paragraphs, lists, quotes, code, and inline bold,
 *  italics, code and links. Whatever it does not recognise stays as text. */
export function markdownToHtml(md) {
  // HTML written inside the Markdown (an allowed tag: <b>, <br>, <span>…) is kept — the final
  // sanitizeHtml pass drops what is not on the list and every attribute but a safe href
  const escapeKeepingTags = (t) => String(t).split(/(<\/?[a-zA-Z][a-zA-Z0-9]*\b(?:[^>"']|"[^"]*"|'[^']*')*>)/)
    .map((part, i) => (i % 2 && ALLOWED.has(part.replace(/^<\/?([a-zA-Z0-9]+).*$/s, '$1').toLowerCase()) ? part : escapeText(part)))
    .join('')
  const inline = (t) => escapeKeepingTags(t)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>')
    .replace(/(\*\*|__)(.+?)\1/g, '<strong>$2</strong>')
    .replace(/(^|[^*\w])\*(?!\s)(.+?)\*(?!\w)/g, '$1<em>$2</em>')
    .replace(/(^|[^_\w])_(?!\s)(.+?)_(?!\w)/g, '$1<em>$2</em>')
  const lines = String(md == null ? '' : md).replace(/\r\n?/g, '\n').split('\n')
  const html = []
  let para = []
  let list = null // { tag, items }
  let quote = []
  const flushPara = () => { if (para.length) { html.push('<p>' + inline(para.join(' ')) + '</p>'); para = [] } }
  const flushList = () => { if (list) { html.push('<' + list.tag + '>' + list.items.map((i) => '<li>' + inline(i) + '</li>').join('') + '</' + list.tag + '>'); list = null } }
  const flushQuote = () => { if (quote.length) { html.push('<blockquote><p>' + inline(quote.join(' ')) + '</p></blockquote>'); quote = [] } }
  const flushAll = () => { flushPara(); flushList(); flushQuote() }
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (/^\s*```/.test(line)) {
      flushAll()
      const code = []
      while (++i < lines.length && !/^\s*```/.test(lines[i])) code.push(lines[i])
      html.push('<pre><code>' + escapeText(code.join('\n')) + '</code></pre>')
      continue
    }
    if (!line.trim()) { flushAll(); continue }
    // GFM table: a header row, a |---|:--:| separator, then body rows
    if (/\|/.test(line) && i + 1 < lines.length && isTableSeparator(lines[i + 1])) {
      flushAll()
      const aligns = tableCells(lines[i + 1]).map((c) => (/^:-+:$/.test(c) ? 'center' : /-+:$/.test(c) ? 'right' : ''))
      const head = tableCells(line)
      const body = []
      i += 2
      while (i < lines.length && /\|/.test(lines[i]) && lines[i].trim()) body.push(tableCells(lines[i++]))
      i--
      const cell = (tag, text, k) => '<' + tag + (aligns[k] ? ' align="' + aligns[k] + '"' : '') + '>' + inline(text) + '</' + tag + '>'
      html.push('<table><thead><tr>' + head.map((c, k) => cell('th', c, k)).join('') + '</tr></thead><tbody>'
        + body.map((r) => '<tr>' + head.map((_, k) => cell('td', r[k] || '', k)).join('') + '</tr>').join('') + '</tbody></table>')
      continue
    }
    const heading = /^\s*(#{1,6})\s+(.*)$/.exec(line)
    if (heading) { flushAll(); html.push('<h' + heading[1].length + '>' + inline(heading[2].trim()) + '</h' + heading[1].length + '>'); continue }
    if (/^\s*([-*_])(\s*\1){2,}\s*$/.test(line)) { flushAll(); html.push('<hr>'); continue }
    const bullet = /^\s*[-*+]\s+(.*)$/.exec(line)
    const ordered = /^\s*\d+[.)]\s+(.*)$/.exec(line)
    if (bullet || ordered) {
      flushPara(); flushQuote()
      const tag = bullet ? 'ul' : 'ol'
      if (list && list.tag !== tag) flushList()
      if (!list) list = { tag, items: [] }
      list.items.push((bullet || ordered)[1])
      continue
    }
    const quoted = /^\s*>\s?(.*)$/.exec(line)
    if (quoted) { flushPara(); flushList(); quote.push(quoted[1]); continue }
    flushList(); flushQuote()
    para.push(line.trim())
  }
  flushAll()
  return sanitizeHtml(html.join(''))
}

// ── The stored value of a richText field ─────────────────────────────────────────────────────
// (a port of libs/mateu richTextValue.ts — the bridge cannot import libs/mateu.) The value is HTML.
// Values written by the old vaadin-rich-text-editor are Quill Delta JSON (`[{"insert":"…"}]` or
// `{"ops":[…]}`): they are recognised and turned into the equivalent HTML, so existing data still
// opens, and the editor writes HTML from the next edit on.

const isDeltaOp = (op) => !!op && typeof op === 'object' && 'insert' in op

/** The ops of a Delta value, or null when the value is not Delta JSON. */
export function deltaOps(value) {
  const raw = String(value == null ? '' : value).trim()
  if (!raw.startsWith('[') && !raw.startsWith('{')) return null
  try {
    const parsed = JSON.parse(raw)
    const ops = Array.isArray(parsed) ? parsed : parsed && Array.isArray(parsed.ops) ? parsed.ops : null
    return ops && ops.length > 0 && ops.every(isDeltaOp) ? ops : null
  } catch (e) {
    // not JSON: plain text or HTML that happens to start with a bracket
    return null
  }
}

const deltaEscape = (text) => String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const deltaHref = (href) => {
  const h = String(href == null ? '' : href).trim()
  return /^(https?:|mailto:|tel:|\/|#)/i.test(h) || !/^[a-z][a-z0-9+.-]*:/i.test(h) ? h : ''
}
const deltaInline = (text, a = {}) => {
  let out = deltaEscape(text)
  if (a.code) out = '<code>' + out + '</code>'
  if (a.bold) out = '<strong>' + out + '</strong>'
  if (a.italic) out = '<em>' + out + '</em>'
  if (a.underline) out = '<u>' + out + '</u>'
  if (a.strike) out = '<s>' + out + '</s>'
  if (a.link && deltaHref(a.link)) out = '<a href="' + deltaEscape(deltaHref(a.link)) + '">' + out + '</a>'
  return out
}

/** Quill Delta → HTML, for the formats the old editor produced (inline marks, links, headings,
 *  lists, quotes, code blocks). Line formats live on the newline that ends the line. */
export function deltaToHtml(ops) {
  const lines = []
  let current = ''
  for (const op of ops) {
    if (typeof op.insert !== 'string') continue // embeds (images…) are not carried over
    const parts = op.insert.split('\n')
    parts.forEach((part, i) => {
      if (part) current += deltaInline(part, op.attributes)
      if (i < parts.length - 1) {
        lines.push({ html: current, attrs: op.attributes || {} })
        current = ''
      }
    })
  }
  if (current) lines.push({ html: current, attrs: {} })
  const out = []
  let list = null
  const flush = () => {
    if (list) out.push('<' + list.tag + '>' + list.items.map((i) => '<li>' + i + '</li>').join('') + '</' + list.tag + '>')
    list = null
  }
  for (const line of lines) {
    const a = line.attrs
    const listTag = a.list === 'ordered' ? 'ol' : a.list === 'bullet' ? 'ul' : null
    if (listTag) {
      if (!list || list.tag !== listTag) { flush(); list = { tag: listTag, items: [] } }
      list.items.push(line.html)
      continue
    }
    flush()
    const level = Number(a.header)
    if (level >= 1 && level <= 6) out.push('<h' + level + '>' + line.html + '</h' + level + '>')
    else if (a.blockquote) out.push('<blockquote>' + line.html + '</blockquote>')
    else if (a['code-block']) out.push('<pre><code>' + line.html + '</code></pre>')
    else out.push('<p>' + line.html + '</p>')
  }
  flush()
  return out.join('')
}

/** The HTML to open a stored value with: the value itself, or its Delta converted. */
export function richTextHtml(value) {
  const ops = deltaOps(value)
  return ops ? deltaToHtml(ops) : (value == null ? '' : String(value))
}

/** What the editor stores: '' for an editor left empty (only empty paragraphs/breaks), else the
 *  sanitised HTML. */
export function richTextValueOf(html) {
  const clean = sanitizeHtml(html)
  return clean.replace(/<(p|div)>(\s|&nbsp;|<br>)*<\/\1>/g, '').replace(/<br>/g, '').trim() ? clean : ''
}

/** Spectra's rich text editor (oj-sp-input-rich-text-2, on CKEditor 5): the module that defines it. */
export const SPECTRA_RICH_TEXT_LOADER = 'oj-sp/input-rich-text-2/loader'

/** Its toolbar: no `uploadImage` — CKEditor would inline the picture as base64 in the value. */
export const SPECTRA_RICH_TEXT_TOOLBAR = ['heading', 'bold', 'italic', 'underline', 'bulletedList', 'numberedList',
  'link', 'horizontalLine', 'removeFormat', 'undo', 'redo', 'generateHtmlSupport']

/** Asks the page's AMD loader for Spectra's editor once per window: a promise of whether it loaded
 *  (false with no loader — Node, a page without RequireJS — or when the CDN does not answer). */
export function spectraRichTextReady(win) {
  if (!win) return Promise.resolve(false)
  if (!win.__mateuSpectraRte) {
    win.__mateuSpectraRte = typeof win.require !== 'function'
      ? Promise.resolve(false)
      : new Promise((resolve) => {
        try {
          win.require([SPECTRA_RICH_TEXT_LOADER], () => resolve(true), () => resolve(false))
        } catch (e) {
          resolve(false)
        }
      })
  }
  return win.__mateuSpectraRte
}

/** The toolbar of the editor: each command and its accessible label. */
export const RICH_TEXT_COMMANDS = [
  { cmd: 'bold', icon: 'oj-ux-ico-bold', label: 'rteBold', key: 'b' },
  { cmd: 'italic', icon: 'oj-ux-ico-italics', label: 'rteItalic', key: 'i' },
  { cmd: 'underline', icon: 'oj-ux-ico-underline', label: 'rteUnderline', key: 'u' },
  { cmd: 'insertUnorderedList', icon: 'oj-ux-ico-list-bulleted', label: 'rteBullets' },
  { cmd: 'insertOrderedList', icon: 'oj-ux-ico-number-list', label: 'rteNumbers' },
  { cmd: 'createLink', icon: 'oj-ux-ico-link', label: 'rteLink' },
  { cmd: 'removeFormat', icon: 'oj-ux-ico-remove-formatting', label: 'rteClear' },
]

/**
 * `<mateu-markup-field kind="markdown|html" value="…">`: the editor of an EDITABLE markdown / html
 * field — the source in a textarea and a Preview toggle that shows it rendered (markdown through
 * markdownToHtml, html sanitised). It was drawn as an oj-text-area with the raw source and no way
 * to see the result, while Vaadin drew the result and could not edit it (owner, 2026-10-12: an
 * editor with preview on both). Leaves as `valueChanged` {value, updatedFrom:'internal'}.
 */
export function markupPreviewHtml(kind, source) {
  return kind === 'markdown' ? markdownToHtml(source || '') : sanitizeHtml(source || '')
}

export function defineMarkupField(win = typeof window !== 'undefined' ? window : null) {
  if (!win || !win.customElements || win.customElements.get('mateu-markup-field')) return
  const doc = win.document
  class MateuMarkupField extends win.HTMLElement {
    static get observedAttributes() { return ['value', 'kind', 'aria-label'] }
    connectedCallback() { this.render() }
    attributeChangedCallback() { if (this.isConnected && !this.editing) this.render() }
    get value() { return this.getAttribute('value') || '' }
    set value(v) { if (v == null || v === '') this.removeAttribute('value'); else this.setAttribute('value', String(v)) }
    render() {
      this.textContent = ''
      this.classList.add('mateu-markup-field')
      const bar = doc.createElement('div')
      bar.className = 'mateu-markup-bar'
      const toggle = doc.createElement('button')
      toggle.type = 'button'
      toggle.className = 'mateu-markup-toggle'
      toggle.setAttribute('aria-pressed', this.previewing ? 'true' : 'false')
      toggle.textContent = chromeText(this.previewing ? 'edit' : 'preview')
      toggle.addEventListener('click', () => { this.previewing = !this.previewing; this.render() })
      bar.appendChild(toggle)
      this.appendChild(bar)
      if (this.previewing) {
        const view = doc.createElement('div')
        view.className = 'mateu-atom-richtext mateu-markup-preview oj-typography-body-md'
        view.innerHTML = markupPreviewHtml(this.getAttribute('kind'), this.value)
        this.appendChild(view)
        return
      }
      const area = doc.createElement('textarea')
      area.className = 'mateu-markup-source'
      area.value = this.value
      area.setAttribute('aria-label', this.getAttribute('aria-label') || '')
      area.addEventListener('input', () => {
        this.editing = true
        this.value = area.value
        this.editing = false
      })
      area.addEventListener('change', () => this.dispatchEvent(new win.CustomEvent('valueChanged', {
        detail: { value: area.value || null, previousValue: null, updatedFrom: 'internal' }, bubbles: true })))
      this.appendChild(area)
    }
  }
  win.customElements.define('mateu-markup-field', MateuMarkupField)
}

/**
 * `<mateu-rich-text-field value="<p>…</p>" readonly>`: the editor of an editable richText field.
 * It is Spectra's (oj-sp-input-rich-text-2: headings, marks, lists, links, a rule, the source),
 * loaded from the page's CDN when the page has an AMD loader. Mounted by hand inside a VB page, a
 * JET element waits for the page's binding provider to apply bindings to it and stays "being
 * upgraded" forever: its wrapper says `data-oj-binding-provider="none"`. Until it loads — and for
 * good when there is no loader or the CDN fails — a small editor of its own: a toolbar of
 * oj-buttons over a contenteditable region. Either way the value is HTML (a legacy Delta opens
 * converted) and leaves as `valueChanged` {value, updatedFrom:'internal'} — the event shape of a
 * JET component, so the field chains treat it like any other — on blur, sanitised by the same
 * allowlist as the viewer.
 */
export function defineRichTextField(win = typeof window !== 'undefined' ? window : null) {
  if (!win || !win.customElements || win.customElements.get('mateu-rich-text-field')) return
  const doc = win.document
  class MateuRichTextField extends win.HTMLElement {
    static get observedAttributes() { return ['value', 'readonly', 'aria-label'] }
    connectedCallback() { this.render() }
    attributeChangedCallback() { if (this.isConnected && !this.editing) this.render() }
    get value() { return this.getAttribute('value') || '' }
    set value(v) { if (v == null || v === '') this.removeAttribute('value'); else this.setAttribute('value', String(v)) }
    get readonlyNow() { return this.hasAttribute('readonly') && this.getAttribute('readonly') !== 'false' }
    commit() {
      if (this.area) this.commitHtml(this.area.innerHTML)
    }
    commitHtml(html) {
      const value = richTextValueOf(html)
      if (value === richTextValueOf(richTextHtml(this.value))) return
      this.editing = true
      this.value = value
      this.editing = false
      this.dispatchEvent(new win.CustomEvent('valueChanged', {
        detail: { value: value || null, previousValue: null, updatedFrom: 'internal' }, bubbles: true }))
    }
    render() {
      this.textContent = ''
      this.classList.add('mateu-rich-text-field')
      const html = sanitizeHtml(richTextHtml(this.value))
      if (this.readonlyNow) {
        const view = doc.createElement('div')
        view.className = 'mateu-atom-richtext oj-typography-body-md'
        view.innerHTML = html
        this.appendChild(view)
        this.area = null
        return
      }
      if (this.spectra !== false && typeof win.require === 'function') {
        this.renderSpectra(html)
        return
      }
      const bar = doc.createElement('div')
      bar.className = 'mateu-rte-toolbar'
      bar.setAttribute('role', 'toolbar')
      bar.setAttribute('aria-label', chromeText('formatting'))
      const area = doc.createElement('div')
      area.className = 'mateu-rte-area oj-typography-body-md'
      area.setAttribute('contenteditable', 'true')
      area.setAttribute('role', 'textbox')
      area.setAttribute('aria-multiline', 'true')
      if (this.getAttribute('aria-label')) area.setAttribute('aria-label', this.getAttribute('aria-label'))
      area.innerHTML = html
      for (const c of RICH_TEXT_COMMANDS) {
        const b = doc.createElement('oj-button')
        b.setAttribute('data-oj-binding-provider', 'none')
        b.setAttribute('display', 'icons')
        b.setAttribute('chroming', 'borderless')
        b.className = 'oj-button-sm'
        const icon = doc.createElement('span')
        icon.setAttribute('slot', 'startIcon')
        icon.className = c.icon
        b.appendChild(icon)
        b.appendChild(doc.createTextNode(chromeText(c.label)))
        // keep the selection in the editor when the button takes the click
        b.addEventListener('mousedown', (e) => e.preventDefault())
        b.addEventListener('ojAction', (e) => {
          e.stopPropagation()
          area.focus()
          if (c.cmd === 'createLink') {
            const url = win.prompt(chromeText('rteLinkPrompt'), 'https://')
            if (url && deltaHref(url)) doc.execCommand('createLink', false, url)
          } else doc.execCommand(c.cmd, false, null)
          this.commit()
        })
        bar.appendChild(b)
      }
      area.addEventListener('blur', () => this.commit())
      area.addEventListener('keydown', (e) => {
        const mod = e.ctrlKey || e.metaKey
        const hit = mod && RICH_TEXT_COMMANDS.find((c) => c.key && c.key === String(e.key).toLowerCase())
        if (hit) { e.preventDefault(); doc.execCommand(hit.cmd, false, null) }
      })
      this.area = area
      this.appendChild(bar)
      this.appendChild(area)
    }
    renderSpectra(html) {
      this.area = null
      const box = doc.createElement('div')
      box.className = 'mateu-rte-spectra'
      box.setAttribute('data-oj-binding-provider', 'none')
      const editor = doc.createElement('oj-sp-input-rich-text-2')
      if (this.getAttribute('aria-label')) editor.setAttribute('label-hint', this.getAttribute('aria-label'))
      // ATTRIBUTES, not properties: the element is usually created before the loader defines it,
      // and a property set on it then shadows the setter of its class — the editor opened empty, with
      // the default toolbar. The label is the field's oj-label; the toolbar is read once, at mount.
      editor.setAttribute('display-options', JSON.stringify({ label: 'off', formattingToolbar: 'on', toolbarItems: SPECTRA_RICH_TEXT_TOOLBAR }))
      editor.setAttribute('value', html)
      // 'internal': the user's edit, on blur — not the echo of the value set here
      editor.addEventListener('valueChanged', (e) => {
        if (e.detail && e.detail.updatedFrom === 'internal') this.commitHtml(e.detail.value || '')
      })
      // …but its valueChanged comes AFTER the blur, asynchronously: a click on Save would run the
      // action with the old value. Leaving the editor commits what it holds now (rawValue follows
      // every keystroke), synchronously, before the click; moving to its own toolbar does not.
      box.addEventListener('focusout', (e) => {
        if (e.relatedTarget && box.contains(e.relatedTarget)) return
        if (typeof editor.rawValue === 'string') this.commitHtml(editor.rawValue)
      })
      box.appendChild(editor)
      this.appendChild(box)
      spectraRichTextReady(win).then((ok) => {
        if (ok || !this.contains(box)) return
        this.spectra = false // no CDN: our own editor, for good
        this.render()
      })
    }
  }
  win.customElements.define('mateu-rich-text-field', MateuRichTextField)
}

/** Dumps the sanitised HTML of each [data-mateu-html] into its container (and when it changes). */
export function installRichText(doc = typeof document !== 'undefined' ? document : null) {
  if (!doc || doc.__mateuRichText || typeof MutationObserver === 'undefined') return
  doc.__mateuRichText = true
  const fill = (el) => {
    const html = el.getAttribute('data-mateu-html') || ''
    if (el.__mateuHtml === html) return
    el.__mateuHtml = html
    // the value already comes sanitised from the bridge; it is sanitised again here in case someone writes the attribute
    el.innerHTML = sanitizeHtml(html)
  }
  const scan = (root) => {
    if (root.nodeType !== 1) return
    if (root.hasAttribute('data-mateu-html')) fill(root)
    for (const el of root.querySelectorAll('[data-mateu-html]')) fill(el)
  }
  scan(doc.body || doc.documentElement)
  new MutationObserver((records) => {
    for (const r of records) {
      if (r.type === 'attributes') fill(r.target)
      else for (const n of r.addedNodes) scan(n)
    }
  }).observe(doc.body || doc.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ['data-mateu-html'] })
}
