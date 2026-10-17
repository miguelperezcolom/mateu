import { safeHref } from '@infra/ui/safeNavigate.ts'

/**
 * What a DATA-bound attribute of an `Element` may become. An attribute written literally in the
 * definition is the author's and passes as is; one whose declared value contains `${…}` carries DATA
 * once interpolated, and data must not choose code:
 *
 *  - `srcdoc` never passes (it is a whole document in the app's origin);
 *  - an event-handler attribute (`on…`) with data in it never passes;
 *  - a URL-ish attribute (`href`, `src`, `action`, …) passes only as a safe link
 *    ({@link safeHref}: relative, http(s), mailto, tel — never `javascript:`/`data:`), and not at
 *    all on an element whose URL loads CODE (`script`, `object`, `embed`, `base`, `link`, `meta`).
 *
 * Returns the value to set, or undefined to leave the attribute out. Shared rule with the Redwood
 * renderer (poc/elements.mjs elementAttributeValue).
 */
const URL_ATTRIBUTES = new Set(['href', 'src', 'xlink:href', 'action', 'formaction', 'background', 'poster',
    'data', 'cite', 'ping', 'srcset', 'manifest', 'codebase', 'longdesc', 'usemap', 'icon'])
const CODE_LOADING_ELEMENTS = new Set(['script', 'object', 'embed', 'base', 'link', 'meta', 'applet', 'frame'])

export const elementAttributeValue = (
    elementName: string,
    attribute: string,
    declared: string | undefined,
    resolved: string | undefined,
): string | undefined => {
    const name = attribute.toLowerCase()
    if (name === 'srcdoc') return undefined
    if (!declared?.includes('${')) return resolved
    if (name.startsWith('on')) return undefined
    if (URL_ATTRIBUTES.has(name)) {
        if (CODE_LOADING_ELEMENTS.has(elementName.toLowerCase())) return undefined
        return safeHref(resolved)
    }
    return resolved
}
