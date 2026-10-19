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
//  - a MicroFrontend does not load from another server (its absolute baseUrl is dropped).
// The backend applies the same rules (`__preview__` with `_untrusted`); this is the renderer's own
// line for an older backend. Works on wire JSON and returns a sanitised COPY.
// (Every top-level name is prefixed: make-amd.mjs puts all modules in ONE scope.)

const UNTRUSTED_BLOCKED_ELEMENTS = new Set(['script', 'style', 'iframe', 'frame', 'frameset', 'object', 'embed',
  'applet', 'base', 'link', 'meta', 'template', 'portal', 'noscript'])
const UNTRUSTED_URL_ATTRIBUTES = new Set(['href', 'src', 'xlink:href', 'action', 'formaction', 'background', 'poster',
  'data', 'cite', 'ping', 'srcset', 'manifest', 'codebase', 'longdesc', 'usemap', 'icon'])
const UNTRUSTED_SAFE_SCHEMES = new Set(['http', 'https', 'mailto', 'tel'])
const UNTRUSTED_CODE_COMMANDS = new Set(['AddContentToHead', 'AddContentToBody'])

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
const untrustedAbsoluteUrl = (value) => !!untrustedSchemeOf(value) || untrustedCleanedUrl(value).startsWith('//')
const untrustedIsObject = (v) => !!v && typeof v === 'object' && !Array.isArray(v)
const untrustedIsCode = (v) =>
  untrustedIsObject(v) && (v.action === 'RunJS' || (typeof v.type === 'string' && UNTRUSTED_CODE_COMMANDS.has(v.type)))

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
    if (key === 'js' && typeof v === 'string') continue
    out[key] = untrustedWalk(v)
  }
  return out
}

/** The definition (an increment, a component, any wire JSON) with every script-capable construct taken out. */
export function neutralizeUntrusted(definition) {
  return untrustedWalk(definition)
}
