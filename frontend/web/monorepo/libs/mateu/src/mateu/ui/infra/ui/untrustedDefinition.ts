/**
 * What an UNTRUSTED definition may not do. A screen an agent authored — the chat's `render-screen`,
 * a live `AgentPush` of kind `render` — is written by an LLM, and an LLM can be steered by the data
 * it reads (prompt injection). "Drive my UI" (navigate, fill, click: bounded by what the user can
 * do anyway) is what pairing an agent grants; "run code in my signed-in tab" is not. So before such
 * a screen is shown, everything in it that could run script in the app's origin is taken out:
 *
 *  - an `Element` keeps no event-handler attribute (`on…`), no `srcdoc`, no `import` (a module url)
 *    and no unsafe url (a url attribute passes only as a relative / http(s) / mailto / tel link);
 *    its content is TEXT (`html` false); and an element that loads or runs code (`script`,
 *    `iframe`, `object`, `style`, `base`, `link`, `meta`, …) or a framework element (`mateu-*`,
 *    which could mount a view of another server) becomes an empty `div`;
 *  - client-side code goes: `RunJS` rules, an action's `js`, `AddContentToHead`/`AddContentToBody`
 *    commands;
 *  - a `javascript:`/`vbscript:` url anywhere is blanked;
 *  - a `MicroFrontend` does not load from another server (its absolute `baseUrl` is dropped).
 *
 * Everything else renders as authored. The SAME rules run on the server (`__preview__` with
 * `_untrusted`: Java, .NET, Python) and in the Redwood renderer (poc/untrusted.mjs); the shared
 * cases are `conformance/untrusted/cases.json`. The browser applies them too because the static
 * bundle expands a JSON definition locally, and because an older backend ignores the flag.
 *
 * Works on the wire JSON (a fragment, a component, anything) and returns a sanitised COPY.
 */

const BLOCKED_ELEMENTS = new Set(['script', 'style', 'iframe', 'frame', 'frameset', 'object', 'embed',
    'applet', 'base', 'link', 'meta', 'template', 'portal', 'noscript'])
const URL_ATTRIBUTES = new Set(['href', 'src', 'xlink:href', 'action', 'formaction', 'background', 'poster',
    'data', 'cite', 'ping', 'srcset', 'manifest', 'codebase', 'longdesc', 'usemap', 'icon'])
const SAFE_SCHEMES = new Set(['http', 'https', 'mailto', 'tel'])
const CODE_COMMANDS = new Set(['AddContentToHead', 'AddContentToBody'])

/** A url as a browser reads its scheme: tabs/newlines removed, leading controls and spaces dropped. */
// eslint-disable-next-line no-control-regex
const cleanedUrl = (value: string): string => value.replace(/[\t\n\r]/g, '').replace(/^[\u0000- ]+/, '')

const schemeOf = (value: string): string | undefined =>
    /^([a-z][a-z0-9+.-]*):/i.exec(cleanedUrl(value))?.[1]?.toLowerCase()

/** True for a `javascript:` / `vbscript:` url. */
export const isScriptUrl = (value: string): boolean => {
    const scheme = schemeOf(value)
    return scheme === 'javascript' || scheme === 'vbscript'
}

const isSafeUrl = (value: string): boolean => {
    const scheme = schemeOf(value)
    return !scheme || SAFE_SCHEMES.has(scheme)
}

const isAbsoluteUrl = (value: string): boolean => !!schemeOf(value) || cleanedUrl(value).startsWith('//')

type Json = unknown
type JsonObject = Record<string, Json>

const isObject = (v: Json): v is JsonObject => !!v && typeof v === 'object' && !Array.isArray(v)

/** An object an untrusted definition loses entirely from the list holding it. */
const isCode = (v: Json): boolean =>
    isObject(v) && (v.action === 'RunJS' || (typeof v.type === 'string' && CODE_COMMANDS.has(v.type)))

const element = (node: JsonObject): JsonObject => {
    const name = typeof node.name === 'string' ? node.name.trim().toLowerCase() : ''
    if (BLOCKED_ELEMENTS.has(name) || name.startsWith('mateu-')) {
        return { ...node, name: 'div', attributes: {}, on: {}, content: null, html: false }
    }
    const attributes: Record<string, Json> = {}
    if (isObject(node.attributes)) {
        for (const [key, value] of Object.entries(node.attributes)) {
            const k = key.toLowerCase()
            if (k === 'import' || k === 'srcdoc' || k.startsWith('on')) continue
            if (typeof value === 'string' && (isScriptUrl(value) || (URL_ATTRIBUTES.has(k) && !isSafeUrl(value)))) continue
            attributes[key] = value
        }
    }
    return { ...node, attributes: node.attributes == null ? node.attributes : attributes, html: false }
}

const walk = (value: Json): Json => {
    if (typeof value === 'string') return isScriptUrl(value) ? '' : value
    if (Array.isArray(value)) return value.filter(v => !isCode(v)).map(walk)
    if (!isObject(value)) return value
    let node: JsonObject = value
    if (node.type === 'Element') node = element(node)
    if (node.type === 'MicroFrontend' && typeof node.baseUrl === 'string' && isAbsoluteUrl(node.baseUrl)) {
        node = { ...node, baseUrl: '' }
    }
    const out: JsonObject = {}
    for (const [key, v] of Object.entries(node)) {
        if (key === 'js' && typeof v === 'string') continue
        out[key] = walk(v)
    }
    return out
}

/** The definition (a fragment, a component, any wire JSON) with every script-capable construct taken out. */
export function neutralizeUntrusted<T>(definition: T): T {
    return walk(definition) as T
}
