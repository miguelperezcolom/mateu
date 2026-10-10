// TEXTO ENRIQUECIDO (P2 #23): un campo richText/html/markdown de sólo lectura y el componente
// Markdown se pintan CON formato. VB no estampa HTML desde un binding, así que el átomo lleva el
// HTML YA SANEADO en data-mateu-html y installRichText lo vuelca en su contenedor. El saneado es
// por LISTA BLANCA (etiquetas de texto; de atributos sólo el href de un enlace con esquema
// seguro): nada de scripts, estilos, manejadores ni iframes. JET no tiene editor de texto
// enriquecido: editar un richText es un oj-text-area con su HTML (limitación declarada).

const ALLOWED = new Set(['p', 'br', 'b', 'strong', 'i', 'em', 'u', 's', 'code', 'pre', 'blockquote',
  'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'span', 'div', 'hr', 'table', 'thead',
  'tbody', 'tr', 'th', 'td', 'sub', 'sup'])
// su CONTENIDO también se descarta, no sólo la etiqueta
const DROP_WITH_CONTENT = new Set(['script', 'style', 'iframe', 'object', 'embed', 'template', 'noscript', 'svg', 'math', 'textarea', 'select'])
const VOID = new Set(['br', 'hr'])
const SAFE_HREF = /^(https?:|mailto:|tel:|\/|#)/i

const escapeText = (t) => String(t).replace(/&(?!(#\d+|#x[0-9a-f]+|[a-z]+);)/gi, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const escapeAttr = (t) => String(t).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

/** HTML → HTML saneado por lista blanca. */
export function sanitizeHtml(html) {
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
    if (!ALLOWED.has(tag)) continue
    if (closing) { if (!VOID.has(tag)) out.push('</' + tag + '>'); continue }
    let attrs = ''
    if (tag === 'a') {
      const href = /\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i.exec(m[2] || '')
      const value = href ? (href[1] ?? href[2] ?? href[3] ?? '').trim().replace(/&amp;/g, '&') : ''
      if (value && SAFE_HREF.test(value)) {
        attrs = ' href="' + escapeAttr(value) + '"' + (/^https?:/i.test(value) ? ' target="_blank" rel="noopener noreferrer"' : '')
      }
    }
    out.push('<' + tag + attrs + '>')
  }
  return out.join('')
}

/** Markdown → HTML (saneado): encabezados, párrafos, listas, citas, código, y en línea negrita,
 *  cursiva, código y enlaces. Lo que no reconoce se queda como texto. */
export function markdownToHtml(md) {
  const inline = (t) => escapeText(t)
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

/** Vuelca el HTML saneado de cada [data-mateu-html] en su contenedor (y cuando cambia). */
export function installRichText(doc = typeof document !== 'undefined' ? document : null) {
  if (!doc || doc.__mateuRichText || typeof MutationObserver === 'undefined') return
  doc.__mateuRichText = true
  const fill = (el) => {
    const html = el.getAttribute('data-mateu-html') || ''
    if (el.__mateuHtml === html) return
    el.__mateuHtml = html
    // el valor ya viene saneado del bridge; se vuelve a sanear aquí por si alguien escribe el atributo
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
