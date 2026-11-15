// What an UNTRUSTED definition may not do — the Redwood twin of libs/mateu untrustedDefinition.ts,
// same rules, same shared cases (conformance/untrusted/cases.json, test-security.mjs).
//
// A screen an agent authored (the chat's render-screen, a live push of kind render) is written by
// an LLM, which can be steered by the data it reads. Pairing grants "drive my UI", not "run code in
// my signed-in tab", so before such a screen is painted everything script-capable is taken out:
//  - an Element keeps no `on…` attribute, no srcdoc, no import and no unsafe url attribute; its
//    content is TEXT (html false); an element that loads or runs code (script, iframe, object,
//    style, base, link, meta, …) or a framework element (mateu-*) becomes an empty div;
//  - RunJS rules, an action's `js` and AddContentToHead/AddContentToBody commands go;
//  - a javascript:/vbscript: url anywhere is blanked;
//  - nothing runs without a click and nothing posts elsewhere: triggers are emptied and no
//    restAction is kept;
//  - a MicroFrontend does not load from another server (its absolute baseUrl is dropped);
//  - nothing loads by itself from elsewhere (GA review 2, C2): an inline REST source (any
//    `…Source`) keeps only its catalogue ref and fetches by GET — without a ref it goes —, the
//    answer's own restSources catalogue goes, an image (src, srcset, image, avatar, logo, favicon,
//    tileUrl, poster, background, xlink:href) loads only from this server or a data: url, and a
//    style that could load something (url(, image(, image-set(, cross-fade(, src(, a CSS escape) is
//    blanked — a style rule computed by an expression goes too.
// The backend applies the same rules (`__preview__` with `_untrusted`); this is the renderer's own
// line for an older backend. Works on wire JSON and returns a sanitised COPY.
// (Every top-level name is prefixed: make-amd.mjs puts all modules in ONE scope.)

const UNTRUSTED_BLOCKED_ELEMENTS = new Set(['script', 'style', 'iframe', 'frame', 'frameset', 'object', 'embed',
  'applet', 'base', 'link', 'meta', 'template', 'portal', 'noscript'])
const UNTRUSTED_URL_ATTRIBUTES = new Set(['href', 'src', 'xlink:href', 'action', 'formaction', 'background', 'poster',
  'data', 'cite', 'ping', 'srcset', 'manifest', 'codebase', 'longdesc', 'usemap', 'icon'])
const UNTRUSTED_SAFE_SCHEMES = new Set(['http', 'https', 'mailto', 'tel'])
const UNTRUSTED_CODE_COMMANDS = new Set(['AddContentToHead', 'AddContentToBody'])
const UNTRUSTED_LOADING_KEYS = new Set(['src', 'srcset', 'image', 'avatar', 'logo', 'favicon', 'tileurl', 'poster',
  'background', 'xlink:href'])
const UNTRUSTED_LOADING_CSS = ['url(', 'image(', 'image-set(', 'cross-fade(', 'src(', '\\']
const UNTRUSTED_SOURCE_REQUEST_KEYS = new Set(['url', 'method', 'headers', 'body', 'proxy'])

// eslint-disable-next-line no-control-regex
const untrustedCleanedUrl = (value) => value.replace(/[\t\n\r]/g, '').replace(/^[\u0000- ]+/, '')
const untrustedSchemeOf = (value) => {
  const m = /^([a-z][a-z0-9+.-]*):/i.exec(untrustedCleanedUrl(value))
  return m ? m[1].toLowerCase() : undefined
}
export const isUntrustedScriptUrl = (value) => {
  const scheme = untrustedSchemeOf(value)
  return scheme === 'javascript' || scheme === 'vbscript'
}
const untrustedSafeUrl = (value) => {
  const scheme = untrustedSchemeOf(value)
  return !scheme || UNTRUSTED_SAFE_SCHEMES.has(scheme)
}
// another server's url: a scheme, or //host — a browser reads a backslash as '/', so \\host,
// /\host and \/host are //host too
const untrustedAbsoluteUrl = (value) =>
  !!untrustedSchemeOf(value) || untrustedCleanedUrl(value).replace(/\\/g, '/').startsWith('//')
const untrustedIsObject = (v) => !!v && typeof v === 'object' && !Array.isArray(v)
// a url the browser would fetch from elsewhere: any scheme but data:, or //host (a backslash spelling
// included); a srcset lists several, so any scheme, // or backslash in it counts
const untrustedLoadsFromElsewhere = (key, value) => {
  if (key === 'srcset') return /[:\\]|\/\//.test(value)
  const scheme = untrustedSchemeOf(value)
  return scheme ? scheme !== 'data' : untrustedCleanedUrl(value).replace(/\\/g, '/').startsWith('//')
}
export const isUntrustedLoadingStyle = (value) => {
  const lower = value.toLowerCase()
  return UNTRUSTED_LOADING_CSS.some((f) => lower.includes(f))
}
// a rule that sets a style the strip cannot check (an expression) or one that could fetch
const untrustedLoadingStyleRule = (v) => {
  const setsStyle = v.action === 'SetStyle' || (v.action === 'SetAttributeValue' && v.fieldAttribute === 'style')
  if (!setsStyle) return false
  if (typeof v.expression === 'string' && v.expression.trim() !== '') return true
  return typeof v.value === 'string' && isUntrustedLoadingStyle(v.value)
}
const untrustedIsCode = (v) =>
  untrustedIsObject(v) && (v.action === 'RunJS' || (typeof v.type === 'string' && UNTRUSTED_CODE_COMMANDS.has(v.type))
    || untrustedLoadingStyleRule(v))
// an inline REST source as an untrusted screen may keep it: its catalogue ref, fetched by GET, and
// how to read the answer; nothing of where it goes or what it sends (undefined: it goes)
function untrustedSource(value) {
  if (typeof value.ref !== 'string' || value.ref.trim() === '') return undefined
  const out = {}
  for (const [key, v] of Object.entries(value)) {
    if (!UNTRUSTED_SOURCE_REQUEST_KEYS.has(key)) out[key] = untrustedWalk(v)
  }
  return { ...out, method: 'GET' }
}
const untrustedIsSourceKey = (key) => key.length > 'Source'.length && key.endsWith('Source')

function untrustedElement(node) {
  const name = typeof node.name === 'string' ? node.name.trim().toLowerCase() : ''
  if (UNTRUSTED_BLOCKED_ELEMENTS.has(name) || name.startsWith('mateu-')) {
    return { ...node, name: 'div', attributes: {}, on: {}, content: null, html: false }
  }
  if (!untrustedIsObject(node.attributes)) return { ...node, html: false }
  const attributes = {}
  for (const [key, value] of Object.entries(node.attributes)) {
    const k = key.toLowerCase()
    if (k === 'import' || k === 'srcdoc' || k.startsWith('on')) continue
    if (typeof value === 'string' && (isUntrustedScriptUrl(value) || (UNTRUSTED_URL_ATTRIBUTES.has(k) && !untrustedSafeUrl(value)))) continue
    attributes[key] = value
  }
  return { ...node, attributes, html: false }
}

function untrustedWalk(value) {
  if (typeof value === 'string') return isUntrustedScriptUrl(value) ? '' : value
  if (Array.isArray(value)) return value.filter((v) => !untrustedIsCode(v)).map(untrustedWalk)
  if (!untrustedIsObject(value)) return value
  let node = value
  if (node.type === 'Element') node = untrustedElement(node)
  if (node.type === 'MicroFrontend' && typeof node.baseUrl === 'string' && untrustedAbsoluteUrl(node.baseUrl)) {
    node = { ...node, baseUrl: '' }
  }
  const out = {}
  for (const [key, v] of Object.entries(node)) {
    if ((key === 'js' && typeof v === 'string') || key === 'restAction' || key === 'restSources') continue
    if (untrustedIsSourceKey(key) && untrustedIsObject(v)) {
      const kept = untrustedSource(v)
      if (kept) out[key] = kept
      continue
    }
    const k = key.toLowerCase()
    if (typeof v === 'string' && ((UNTRUSTED_LOADING_KEYS.has(k) && untrustedLoadsFromElsewhere(k, v))
      || (k.endsWith('style') && isUntrustedLoadingStyle(v)))) {
      out[key] = ''
      continue
    }
    // nothing runs without a click: an OnLoad/OnValueChange/AutoSave trigger fires by itself
    out[key] = key === 'triggers' && Array.isArray(v) ? [] : untrustedWalk(v)
  }
  return out
}

/** The definition (an increment, a component, any wire JSON) with every script-capable construct taken out. */
export function neutralizeUntrusted(definition) {
  return untrustedWalk(definition)
}
