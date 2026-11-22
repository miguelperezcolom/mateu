import React, { useMemo } from 'react'
import { marked } from 'marked'
import { sanitizeHtml } from './safeHtml'

/**
 * Markdown (a Markdown component, a markdown field's value): rendered with marked, then the web
 * renderers' data-HTML policy — markdown is data, and raw HTML inside it must not run. Styled with
 * Primer's tokens (index.css `.mateu-markdown`), the way github.com renders a README.
 */
export function Markdown({ source }: { source: string }) {
  const html = useMemo(() => sanitizeHtml(marked.parse(source, { async: false, gfm: true, breaks: false }) as string), [source])
  return <div className="mateu-markdown" dangerouslySetInnerHTML={{ __html: html }} />
}

/** Trusted-by-policy HTML (an html field, a rich text value): sanitized the same way. */
export function SafeHtml({ html, className }: { html: string; className?: string }) {
  const clean = useMemo(() => sanitizeHtml(html), [html])
  return <div className={className ?? 'mateu-markdown'} dangerouslySetInnerHTML={{ __html: clean }} />
}
