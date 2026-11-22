import DOMPurify from 'dompurify'
import { dataHtmlPolicy, installDataHtmlHooks } from '@infra/ui/sanitizePolicy.ts'

/**
 * HTML that may carry DATA, made safe to put in the page: the web renderers' ONE policy
 * (libs/mateu sanitizePolicy — no scripts, no event handlers, no javascript: URLs, no form
 * controls, no custom element but the allow-listed ones), applied with the same DOMPurify.
 */
export function sanitizeHtml(html: string): string {
  installDataHtmlHooks(DOMPurify as never)
  return DOMPurify.sanitize(html, dataHtmlPolicy()) as unknown as string
}
