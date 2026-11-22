import React, { useMemo } from 'react'
import { sanitizeHtml } from '@mr/render/safeHtml'

/**
 * Markdown (a Markdown component, a markdown field's value): rendered with marked, then the web
 * renderers' data-HTML policy — markdown is data, and raw HTML inside it must not run. Styled with
 * the renderer's own `.mateu-markdown` styles (Primer: index.css, the way github.com renders a README).
 */
export function Markdown({ source }: { source: string }) {
  // marked is its own chunk, fetched the first time a screen shows markdown (the text stays readable meanwhile)
  return (
    <React.Suspense fallback={<div className="mateu-markdown" style={{ whiteSpace: 'pre-wrap' }}>{source}</div>}>
      <RenderedMarkdown source={source} />
    </React.Suspense>
  )
}

const RenderedMarkdown = React.lazy(async () => {
  const { marked } = await import('marked')
  return {
    default: function RenderedMarkdown({ source }: { source: string }) {
      const html = useMemo(() => sanitizeHtml(marked.parse(source, { async: false, gfm: true, breaks: false }) as string), [source])
      return <div className="mateu-markdown" dangerouslySetInnerHTML={{ __html: html }} />
    },
  }
})

/** Trusted-by-policy HTML (an html field, a rich text value): sanitized the same way. */
export function SafeHtml({ html, className }: { html: string; className?: string }) {
  const clean = useMemo(() => sanitizeHtml(html), [html])
  return <div className={className ?? 'mateu-markdown'} dangerouslySetInnerHTML={{ __html: clean }} />
}
