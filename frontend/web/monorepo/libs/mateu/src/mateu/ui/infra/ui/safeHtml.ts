import DOMPurify from 'dompurify'
import { unsafeHTML } from 'lit/directives/unsafe-html.js'
import { dataHtmlPolicy, installDataHtmlHooks } from './sanitizePolicy'

/**
 * Sanitizes an HTML string that may carry DATA (an interpolated title, a text, a cell or field
 * value) before it is rendered as markup: scripts, event-handler attributes (`onerror`, …),
 * `javascript:` URLs and the like are stripped; plain markup (`<b>`, `<i>`, `<a href>`, `<br>`,
 * inline svg, …) is kept. Custom elements pass only from an allow-list (`<vaadin-icon icon="…">`)
 * and form controls never do — see {@link dataHtmlPolicy}, shared with `mateu-markdown`.
 */
export const sanitizeHtml = (html: string): string => {
    installDataHtmlHooks(DOMPurify as never)
    return DOMPurify.sanitize(html, dataHtmlPolicy()) as unknown as string
}

/**
 * `unsafeHTML` with the input sanitized first (see {@link sanitizeHtml}). Use it for every HTML
 * sink whose content is (or may contain) data. null/undefined render nothing, like `unsafeHTML`.
 */
export const safeHtml = (html: string | null | undefined) =>
    unsafeHTML(html == null ? html : sanitizeHtml(String(html)))
