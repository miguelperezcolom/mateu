import DOMPurify from 'dompurify'
import { unsafeHTML } from 'lit/directives/unsafe-html.js'

/**
 * Sanitizes an HTML string that may carry DATA (an interpolated title, a text, a cell or field
 * value) before it is rendered as markup: scripts, event-handler attributes (`onerror`, …),
 * `javascript:` URLs and the like are stripped; plain markup (`<b>`, `<i>`, `<a href>`, `<br>`,
 * inline svg, …) is kept. Custom elements (e.g. `<vaadin-icon icon="…">`) keep passing through,
 * as in `mateu-markdown`, minus any `on…` attribute.
 */
export const sanitizeHtml = (html: string): string =>
    DOMPurify.sanitize(html, {
        USE_PROFILES: { html: true, svg: true, svgFilters: true },
        CUSTOM_ELEMENT_HANDLING: {
            tagNameCheck: (_tagName: string) => true,
            attributeNameCheck: (attr: string) => !/^on/i.test(attr),
            allowCustomizedBuiltInElements: false,
        },
    })

/**
 * `unsafeHTML` with the input sanitized first (see {@link sanitizeHtml}). Use it for every HTML
 * sink whose content is (or may contain) data. null/undefined render nothing, like `unsafeHTML`.
 */
export const safeHtml = (html: string | null | undefined) =>
    unsafeHTML(html == null ? html : sanitizeHtml(String(html)))
