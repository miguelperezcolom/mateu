import { html, nothing, type TemplateResult } from 'lit'
import { html as staticHtml, unsafeStatic } from 'lit/static-html.js'
import { unsafeHTML } from 'lit/directives/unsafe-html.js'
import { marked } from 'marked'
import type TextMeta from '@mateu/shared/apiClients/dtos/componentmetadata/Text'
import type MarkdownMeta from '@mateu/shared/apiClients/dtos/componentmetadata/Markdown'
import type StatusListMeta from '@mateu/shared/apiClients/dtos/componentmetadata/StatusList'
import type StatusItem from '@mateu/shared/apiClients/dtos/componentmetadata/StatusItem'
import type { SpectraTemplate } from '@/oj/types'

/** Leaf display components rendered as plain HTML + Redwood tokens (never Vaadin). */

const TEXT_TAGS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'div'])

/** Text → its HTML container element (h1..h6/p/span/div) with the size/no-margins styling. */
export const textTemplate: SpectraTemplate = {
  loaders: [],
  render(ctx) {
    const m = ctx.component.metadata as TextMeta
    const tag = TEXT_TAGS.has(m.container) ? m.container : 'span'
    const styles: string[] = []
    if (m.size && m.size !== 'm') styles.push(`font-size: var(--lumo-font-size-${m.size}, 1rem)`)
    if (m.noMargins) styles.push('margin-block-start: 0', 'margin-block-end: 0')
    if (ctx.component.style) styles.push(ctx.component.style)
    const t = unsafeStatic(tag)
    return staticHtml`<${t} class=${ctx.component.cssClasses || nothing} style=${styles.length ? styles.join('; ') : nothing}>${m.text ?? ''}</${t}>`
  },
}

/** Markdown → HTML via marked (a Vaadin-free monorepo dependency). */
export const markdownTemplate: SpectraTemplate = {
  loaders: [],
  render(ctx) {
    const m = ctx.component.metadata as MarkdownMeta
    const rendered = marked.parse(m.markdown ?? '', { async: false }) as string
    return html`<div class="mateu-rw-markdown" style=${ctx.component.style || nothing}>${unsafeHTML(rendered)}</div>`
  },
}

/** StatusList → a plain list of rows, each a title + a status chip (like the RDS status list). */
export const statusListTemplate: SpectraTemplate = {
  loaders: [],
  render(ctx) {
    const m = ctx.component.metadata as StatusListMeta
    const items = m.items ?? []
    return html`<div class="mateu-rw-status-list ${m.frameless ? 'frameless' : ''} ${m.compact ? 'compact' : ''}">
      ${items.map((it) => statusRow(it))}
    </div>`
  },
}

/** Div → a plain container: its children, plus any raw HTML `content`. */
export const divTemplate: SpectraTemplate = {
  loaders: [],
  render(ctx) {
    const m = ctx.component.metadata as { content?: string }
    return html`<div class=${ctx.component.cssClasses || nothing} style=${ctx.component.style || nothing}>
      ${(ctx.component.children ?? []).map((c) => ctx.renderChild(c))}
      ${m.content ? unsafeHTML(m.content) : nothing}
    </div>`
  },
}

function statusRow(it: StatusItem): TemplateResult {
  return html`<div class="rw-status-row">
    <div class="rw-status-main">
      <div class="rw-status-title">${it.title ?? ''}</div>
      ${it.description ? html`<div class="rw-status-desc">${it.description}</div>` : nothing}
    </div>
    ${it.status
      ? html`<span class="rw-status-chip rw-status-chip--${it.statusColor || 'neutral'}">${it.status}</span>`
      : nothing}
  </div>`
}
